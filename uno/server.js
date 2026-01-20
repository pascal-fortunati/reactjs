import { WebSocketServer } from 'ws'

const PORT = 5174

const clients = new Map()
let nextId = 1
let hostId = null

const CARD_COLORS = ['red', 'yellow', 'green', 'blue']
const SPECIAL_TYPES = ['skip', 'reverse', 'draw2', 'wild', 'wild4']

let gameState = null
let botTimeout = null

function createDeck() {
	const cards = []
	let id = 1

	CARD_COLORS.forEach((color) => {
		cards.push(createCard(id++, { color, type: 'number', value: 0 }))

		for (let value = 1; value <= 9; value += 1) {
			const base = { color, type: 'number', value }
			cards.push(createCard(id++, base))
			cards.push(createCard(id++, base))
		}

		const specialsForColor = ['skip', 'reverse', 'draw2']

		specialsForColor.forEach((type) => {
			const base = { color, type, value: null }
			cards.push(createCard(id++, base))
			cards.push(createCard(id++, base))
		})
	})

	for (let i = 0; i < 4; i += 1) {
		cards.push(createCard(id++, { color: 'wild', type: 'wild', value: null }))
	}

	for (let i = 0; i < 4; i += 1) {
		cards.push(createCard(id++, { color: 'wild', type: 'wild4', value: null }))
	}

	return shuffle(cards)
}

function createCard(id, base) {
	return {
		id,
		color: base.color,
		type: base.type,
		value: base.value,
	}
}

function shuffle(array) {
	const copy = [...array]
	for (let i = copy.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1))
		;[copy[i], copy[j]] = [copy[j], copy[i]]
	}
	return copy
}

function getNextIndex(current, direction, total) {
	return (current + direction + total) % total
}

function canPlayCard(card, topCard, currentColor, pendingDraw) {
	if (!topCard) return true

	if (pendingDraw > 0 && card.type !== 'draw2' && card.type !== 'wild4') {
		return false
	}

	if (card.type === 'wild' || card.type === 'wild4') {
		return true
	}

	if (card.color === currentColor) return true

	if (card.type === 'number' && topCard.type === 'number' && card.value === topCard.value) {
		return true
	}

	if (SPECIAL_TYPES.includes(card.type) && card.type === topCard.type) {
		return true
	}

	return false
}

function getPlayersSnapshot() {
	return Array.from(clients.values()).map((c) => ({ id: c.id, name: c.name }))
}

function broadcastPlayers() {
	const players = getPlayersSnapshot()
	const payload = JSON.stringify({ type: 'players', players, hostId })
	for (const { socket } of clients.values()) {
		if (socket.readyState === socket.OPEN) {
			socket.send(payload)
		}
	}
}

function broadcastGameState() {
	if (!gameState) return
	const payload = JSON.stringify({ type: 'gameState', state: gameState })
	for (const { socket } of clients.values()) {
		if (socket.readyState === socket.OPEN) {
			socket.send(payload)
		}
	}
}

function broadcastGameReset() {
	const payload = JSON.stringify({ type: 'gameReset' })
	for (const { socket } of clients.values()) {
		if (socket.readyState === socket.OPEN) {
			socket.send(payload)
		}
	}
}

function clearBotTimeout() {
	if (botTimeout) {
		clearTimeout(botTimeout)
		botTimeout = null
	}
}

function resetServerState() {
	clearBotTimeout()
	const sockets = Array.from(clients.values()).map((c) => c.socket)
	gameState = null
	broadcastGameReset()
	sockets.forEach((socket) => {
		try {
			if (socket.readyState === socket.OPEN || socket.readyState === socket.CLOSING) {
				socket.close(1000, 'server reset')
			}
		} catch {
			// ignore
		}
	})
	hostId = null
	nextId = 1
}

function reshuffleIfNeeded(currentDrawPile, currentDiscardPile) {
	if (currentDrawPile.length > 0) return { draw: currentDrawPile, discard: currentDiscardPile }
	if (currentDiscardPile.length <= 1) return { draw: currentDrawPile, discard: currentDiscardPile }

	const [top, ...rest] = [...currentDiscardPile].reverse()
	const newDraw = shuffle(rest)
	return { draw: newDraw, discard: [top] }
}

function drawCardsForPlayer(playerIndex, amount) {
	if (!gameState) return
	let draw = [...gameState.drawPile]
	let discard = [...gameState.discardPile]
	const players = [...gameState.players]
	const target = { ...players[playerIndex], hand: [...players[playerIndex].hand] }

	for (let i = 0; i < amount; i += 1) {
		;({ draw, discard } = reshuffleIfNeeded(draw, discard))
		if (draw.length === 0) break
		const card = draw[draw.length - 1]
		draw.pop()
		target.hand.push(card)
	}

	players[playerIndex] = target
	gameState.players = players
	gameState.drawPile = draw
	gameState.discardPile = discard
	gameState.stats.drawn += amount
}

function advanceTurn(skipped = 0) {
	if (!gameState) return
	gameState.stats.turns += 1
	gameState.players = gameState.players.map((p, index) =>
		index === gameState.currentPlayerIndex && p.hand.length !== 1
			? { ...p, hasUno: false }
			: p,
	)

	let index = gameState.currentPlayerIndex
	for (let i = 0; i <= skipped; i += 1) {
		index = getNextIndex(index, gameState.direction, gameState.players.length)
	}
	gameState.currentPlayerIndex = index
}

function enforceUnoPenaltyIfNeeded(playerIndex) {
	if (!gameState) return
	const player = gameState.players[playerIndex]
	if (!player || player.hand.length !== 1 || player.hasUno) return
	drawCardsForPlayer(playerIndex, 2)
	gameState.message = `${player.name} n'a pas annoncé UNO, +2 cartes !`
}

function startServerGame() {
	clearBotTimeout()
	const deck = createDeck()
	const connected = getPlayersSnapshot()
	const maxSlots = 4
	const players = connected.slice(0, maxSlots).map((p) => ({
		id: p.id,
		name: p.name,
		isBot: false,
		hand: [],
		hasUno: false,
	}))

	let idx = players.length
	while (idx < maxSlots) {
		idx += 1
		players.push({
			id: `bot-${idx}`,
			name: `Bot ${idx}`,
			isBot: true,
			hand: [],
			hasUno: false,
		})
	}

	let deckIndex = 0
	for (let i = 0; i < 7; i += 1) {
		players.forEach((player) => {
			player.hand.push(deck[deckIndex])
			deckIndex += 1
		})
	}

	let starter = deck[deckIndex]
	deckIndex += 1
	const remaining = deck.slice(deckIndex)

	gameState = {
		players,
		drawPile: remaining,
		discardPile: [starter],
		currentPlayerIndex: 0,
		direction: 1,
		currentColor:
			starter.color === 'wild' ? CARD_COLORS[Math.floor(Math.random() * 4)] : starter.color,
		pendingDraw: 0,
		awaitingColorChoice: null,
		gamePhase: 'playing',
		message: 'La partie commence !',
		winnerId: null,
		stats: { turns: 0, drawn: 0 },
	}

	broadcastGameState()
	scheduleBotTurn()
}

function handlePlayCardRequest(playerId, cardId) {
	if (!gameState || gameState.gamePhase !== 'playing' || gameState.winnerId) return
	const currentIndex = gameState.currentPlayerIndex
	const player = gameState.players[currentIndex]
	if (!player || player.id !== playerId) return
	if (gameState.awaitingColorChoice && player.isBot) return

	const topCard = gameState.discardPile[gameState.discardPile.length - 1] || null
	const card = player.hand.find((c) => c.id === cardId)
	if (!card) return
	if (!canPlayCard(card, topCard, gameState.currentColor, gameState.pendingDraw)) return

	const players = [...gameState.players]
	const hand = [...player.hand]
	const index = hand.findIndex((c) => c.id === card.id)
	if (index === -1) return
	hand.splice(index, 1)
	players[currentIndex] = { ...player, hand }
	const discard = [...gameState.discardPile, card]
	gameState.players = players
	gameState.discardPile = discard

	if (hand.length === 0) {
		gameState.winnerId = player.id
		gameState.gamePhase = 'ended'
		gameState.message = `${player.name} a gagné la partie !`
		broadcastGameState()
		clearBotTimeout()
		return
	}

	if (card.type === 'wild' || card.type === 'wild4') {
		gameState.awaitingColorChoice = { playerIndex: currentIndex, cardType: card.type }
		gameState.message = `${player.name} choisit une couleur.`
		broadcastGameState()
		clearBotTimeout()
		return
	}

	if (card.type === 'reverse') {
		gameState.currentColor = card.color
		gameState.direction *= -1
		gameState.message = `${player.name} a joué Inversion.`
		advanceTurn(0)
		broadcastGameState()
		scheduleBotTurn()
		return
	}

	if (card.type === 'skip') {
		gameState.currentColor = card.color
		gameState.message = `${player.name} a joué Passer.`
		enforceUnoPenaltyIfNeeded(currentIndex)
		advanceTurn(1)
		broadcastGameState()
		scheduleBotTurn()
		return
	}

	if (card.type === 'draw2') {
		gameState.currentColor = card.color
		gameState.pendingDraw += 2
		gameState.message = `${player.name} impose +2.`
		enforceUnoPenaltyIfNeeded(currentIndex)
		advanceTurn(0)
		broadcastGameState()
		scheduleBotTurn()
		return
	}

	gameState.currentColor = card.color
	enforceUnoPenaltyIfNeeded(currentIndex)
	advanceTurn(0)
	broadcastGameState()
	scheduleBotTurn()
}

function handleChooseColorRequest(playerId, color) {
	if (!gameState || gameState.winnerId || !gameState.awaitingColorChoice) return
	const { playerIndex, cardType } = gameState.awaitingColorChoice
	const player = gameState.players[playerIndex]
	if (!player || player.isBot || player.id !== playerId) return
	if (!CARD_COLORS.includes(color)) return

	gameState.currentColor = color
	gameState.awaitingColorChoice = null

	if (cardType === 'wild4') {
		gameState.pendingDraw += 4
		gameState.message = `${player.name} impose +4 et choisit ${translateColor(color)}.`
	} else {
		gameState.message = `${player.name} choisit ${translateColor(color)}.`
	}

	enforceUnoPenaltyIfNeeded(playerIndex)
	advanceTurn(0)
	broadcastGameState()
	scheduleBotTurn()
}

function handleDrawCardRequest(playerId) {
	if (!gameState || gameState.gamePhase !== 'playing' || gameState.winnerId) return
	const currentIndex = gameState.currentPlayerIndex
	const player = gameState.players[currentIndex]
	if (!player || player.isBot || player.id !== playerId) return

	if (gameState.pendingDraw > 0) {
		drawCardsForPlayer(currentIndex, gameState.pendingDraw)
		gameState.message = `${player.name} pioche ${gameState.pendingDraw} cartes.`
		gameState.pendingDraw = 0
		advanceTurn(0)
		broadcastGameState()
		scheduleBotTurn()
		return
	}

	drawCardsForPlayer(currentIndex, 1)
	gameState.message = `${player.name} pioche une carte.`
	advanceTurn(0)
	broadcastGameState()
	scheduleBotTurn()
}

function handleSayUnoRequest(playerId) {
	if (!gameState || gameState.gamePhase !== 'playing' || gameState.winnerId) return
	const currentIndex = gameState.currentPlayerIndex
	const player = gameState.players[currentIndex]
	if (!player || player.isBot || player.id !== playerId) return
	if (player.hand.length !== 2) return
	const players = [...gameState.players]
	players[currentIndex] = { ...player, hasUno: true }
	gameState.players = players
	gameState.message = `${player.name} annonce UNO !`
	broadcastGameState()
}

function translateColor(color) {
	if (color === 'red') return 'rouge'
	if (color === 'yellow') return 'jaune'
	if (color === 'green') return 'vert'
	if (color === 'blue') return 'bleu'
	return color
}

function botPlayWildCard(playerIndex, card) {
	if (!gameState) return
	const player = gameState.players[playerIndex]
	if (!player || !player.isBot) return

	const colors = CARD_COLORS
	const choice = colors[Math.floor(Math.random() * colors.length)]
	const players = [...gameState.players]
	const hand = [...player.hand]
	const index = hand.findIndex((c) => c.id === card.id)
	if (index === -1) return
	hand.splice(index, 1)
	players[playerIndex] = { ...player, hand }
	gameState.players = players
	gameState.discardPile = [...gameState.discardPile, card]
	gameState.currentColor = choice
	if (card.type === 'wild4') {
		gameState.pendingDraw += 4
		gameState.message = `${player.name} impose +4 et choisit ${translateColor(choice)}.`
	} else {
		gameState.message = `${player.name} choisit ${translateColor(choice)}.`
	}

	if (hand.length === 0) {
		gameState.winnerId = player.id
		gameState.gamePhase = 'ended'
		broadcastGameState()
		clearBotTimeout()
		return
	}

	enforceUnoPenaltyIfNeeded(playerIndex)
	advanceTurn(0)
	broadcastGameState()
	scheduleBotTurn()
}

function scheduleBotTurn() {
	clearBotTimeout()
	if (!gameState || gameState.gamePhase !== 'playing' || gameState.winnerId) return
	const active = gameState.players[gameState.currentPlayerIndex]
	if (!active || !active.isBot || gameState.awaitingColorChoice) return

	botTimeout = setTimeout(() => {
		if (!gameState || gameState.gamePhase !== 'playing' || gameState.winnerId) return
		const player = gameState.players[gameState.currentPlayerIndex]
		if (!player || !player.isBot) return
		const topCard = gameState.discardPile[gameState.discardPile.length - 1] || null
		const hand = player.hand
		if (gameState.pendingDraw > 0) {
			const chainCard = hand.find((c) => c.type === 'draw2' || c.type === 'wild4')
			if (chainCard) {
				if (chainCard.type === 'wild4') {
					botPlayWildCard(gameState.currentPlayerIndex, chainCard)
				} else {
					handlePlayCardRequest(player.id, chainCard.id)
				}
				return
			}
			drawCardsForPlayer(gameState.currentPlayerIndex, gameState.pendingDraw)
			gameState.message = `${player.name} pioche ${gameState.pendingDraw} cartes.`
			gameState.pendingDraw = 0
			advanceTurn(0)
			broadcastGameState()
			scheduleBotTurn()
			return
		}

		const playable = hand.filter((c) => canPlayCard(c, topCard, gameState.currentColor, gameState.pendingDraw))
		if (playable.length === 0) {
			drawCardsForPlayer(gameState.currentPlayerIndex, 1)
			gameState.message = `${player.name} pioche une carte.`
			advanceTurn(0)
			broadcastGameState()
			scheduleBotTurn()
			return
		}

		const card = playable[Math.floor(Math.random() * playable.length)]
		if (hand.length === 2) {
			const players = gameState.players.map((p) => (p.id === player.id ? { ...p, hasUno: true } : p))
			gameState.players = players
		}
		if (card.type === 'wild' || card.type === 'wild4') {
			botPlayWildCard(gameState.currentPlayerIndex, card)
			return
		}
		handlePlayCardRequest(player.id, card.id)
	}, 700)
}

const wss = new WebSocketServer({ port: PORT })

wss.on('connection', (socket) => {
	const id = nextId
	nextId += 1
	const client = { id, name: `Joueur ${id}`, socket }
	clients.set(socket, client)
	if (hostId == null) hostId = id

	const welcome = {
		type: 'welcome',
		id,
		players: getPlayersSnapshot(),
		hostId,
	}
	socket.send(JSON.stringify(welcome))
	broadcastPlayers()
	if (gameState) {
		socket.send(JSON.stringify({ type: 'gameState', state: gameState }))
	}

	socket.on('message', (data) => {
		let msg
		try {
			msg = JSON.parse(String(data))
		} catch {
			return
		}

		const clientInfo = clients.get(socket)
		if (!clientInfo) return

		if (msg.type === 'setName' && typeof msg.name === 'string') {
			clientInfo.name = msg.name.trim() || clientInfo.name
			broadcastPlayers()
		}

		if (msg.type === 'startGame') {
			if (clientInfo.id !== hostId) return
			startServerGame()
		}

		if (msg.type === 'resetAll') {
			if (clientInfo.id !== hostId) return
			resetServerState()
			return
		}

		if (msg.type === 'playCard' && typeof msg.cardId === 'number') {
			handlePlayCardRequest(clientInfo.id, msg.cardId)
		}

		if (msg.type === 'drawCard') {
			handleDrawCardRequest(clientInfo.id)
		}

		if (msg.type === 'sayUno') {
			handleSayUnoRequest(clientInfo.id)
		}

		if (msg.type === 'chooseColor' && typeof msg.color === 'string') {
			handleChooseColorRequest(clientInfo.id, msg.color)
		}
	})

	socket.on('close', () => {
		const c = clients.get(socket)
		clients.delete(socket)
		if (c && c.id === hostId) {
			const first = clients.values().next().value
			hostId = first ? first.id : null
		}
		broadcastPlayers()
	})
})

console.log(`UNO WebSocket server listening on ws://0.0.0.0:${PORT}`)
