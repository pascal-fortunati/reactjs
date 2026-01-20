import { createContext, useContext, useEffect, useRef, useState } from 'react'

const GameContext = createContext(null)

// Fonction pour créer les joueurs initiales à partir des joueurs dans le lobby
function createInitialPlayers(lobbyPlayers, clientId, fallbackName) {
    const maxSlots = 4
    const fromLobby = Array.isArray(lobbyPlayers) ? lobbyPlayers.slice(0, maxSlots) : []
    let players = fromLobby.map((p) => ({
        id: p.id,
        name: p.name,
        isBot: false,
        hand: [],
        hasUno: false,
    }))

    if (players.length === 0 && fallbackName) {
        players = [
            {
                id: 1,
                name: fallbackName,
                isBot: false,
                hand: [],
                hasUno: false,
            },
        ]
    }

    while (players.length < maxSlots) {
        const id = players.length + 1
        players.push({
            id: `bot-${id}`,
            name: `Bot ${id}`,
            isBot: true,
            hand: [],
            hasUno: false,
        })
    }

    return players
}

// Fonction pour gérer la logique de jeu
function useGameLogic(playerName, lobbyPlayers, clientId, gameState, sendGameMessage) {
    let players
    let drawPile
    let discardPile
    let currentPlayer
    let direction
    let currentColor
    let pendingDraw
    let awaitingColorChoice
    let gamePhase
    let message
    let winnerId
    let stats

    if (!gameState) {
        players = createInitialPlayers(lobbyPlayers, clientId, playerName)
        drawPile = []
        discardPile = []
        currentPlayer = 0
        direction = 1
        currentColor = null
        pendingDraw = 0
        awaitingColorChoice = null
        gamePhase = 'lobby'
        message = 'En attente du lancement de la partie.'
        winnerId = null
        stats = { turns: 0, drawn: 0 }
    } else {
        players = gameState.players || []
        drawPile = gameState.drawPile || []
        discardPile = gameState.discardPile || []
        currentPlayer = gameState.currentPlayerIndex ?? 0
        direction = gameState.direction ?? 1
        currentColor = gameState.currentColor ?? null
        pendingDraw = gameState.pendingDraw ?? 0
        awaitingColorChoice = gameState.awaitingColorChoice || null
        gamePhase = gameState.gamePhase || 'lobby'
        message = gameState.message || ''
        winnerId = gameState.winnerId ?? null
        stats = gameState.stats || { turns: 0, drawn: 0 }
    }

    // Obtenir la carte en haut de la pile de défausse	
    const topCard = discardPile[discardPile.length - 1] || null

    // Fonction pour demander de jouer une carte
    function requestPlayCard(card) {
        if (!sendGameMessage || !card) return
        if (!gameState || gameState.gamePhase !== 'playing') return
        if (!clientId) return
        sendGameMessage({ type: 'playCard', cardId: card.id })
    }

    // Fonction pour demander de piocher une carte
    function requestDrawCard() {
        if (!sendGameMessage) return
        if (!gameState || gameState.gamePhase !== 'playing') return
        if (!clientId) return
        sendGameMessage({ type: 'drawCard' })
    }

    // Fonction pour demander de dire UNO
    function requestSayUno() {
        if (!sendGameMessage) return
        if (!gameState || gameState.gamePhase !== 'playing') return
        if (!clientId) return
        sendGameMessage({ type: 'sayUno' })
    }

    // Fonction pour demander de choisir une couleur
    function requestChooseColor(color) {
        if (!sendGameMessage) return
        if (!gameState || gameState.gamePhase !== 'playing') return
        if (!clientId) return
        sendGameMessage({ type: 'chooseColor', color })
    }

    return {
        players,
        drawPile,
        discardPile,
        currentPlayer,
        direction,
        currentColor,
        pendingDraw,
        awaitingColorChoice,
        gamePhase,
        message,
        winnerId,
        stats,
        topCard,
        actions: {
            playCard: requestPlayCard,
            drawCard: requestDrawCard,
            sayUno: requestSayUno,
            chooseColor: requestChooseColor,
        },
    }
}

// Fonction pour traduire une couleur en français
function translateColor(color) {
  if (color === 'red') return 'rouge'
  if (color === 'yellow') return 'jaune'
  if (color === 'green') return 'vert'
  if (color === 'blue') return 'bleu'
  return color
}

// Hook personnalisé pour accéder au contexte de jeu
function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) {
    throw new Error('useGame must be used inside GameProvider')
  }
  return ctx
}

// Composant fournisseur de contexte de jeu
function GameProvider({ playerName, lobbyPlayers, clientId, gameState, sendGameMessage, children }) {
    const value = useGameLogic(playerName, lobbyPlayers, clientId, gameState, sendGameMessage)
    return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

// Composant principal de l'application
function App() {
     const [screen, setScreen] = useState('lobby')
     const [playerName, setPlayerName] = useState('')
     const [pseudoInput, setPseudoInput] = useState('')
     const wsRef = useRef(null)
     const pendingNameRef = useRef(null)
     const [clientId, setClientId] = useState(null)
     const [lobbyPlayers, setLobbyPlayers] = useState([])
     const [hostId, setHostId] = useState(null)
     const [gameState, setGameState] = useState(null)

     useEffect(() => {
    const host = window.location.hostname || 'localhost'
    const port = 5174
    const socket = new WebSocket(`ws://${host}:${port}`)
    wsRef.current = socket

        socket.addEventListener('open', () => {
          const name = pendingNameRef.current
          if (name) {
            socket.send(JSON.stringify({ type: 'setName', name }))
      }
    })

             socket.addEventListener('message', (event) => {
          let msg
          try {
            msg = JSON.parse(event.data)
          } catch {
            return
          }
        
              if (msg.type === 'welcome') {
                if (typeof msg.id === 'number') setClientId(msg.id)
                setLobbyPlayers(msg.players || [])
                if (typeof msg.hostId === 'number') setHostId(msg.hostId)
            }
            if (msg.type === 'players') {
                setLobbyPlayers(msg.players || [])
                if (typeof msg.hostId === 'number') setHostId(msg.hostId)
            }
            if (msg.type === 'gameState') {
                setGameState(msg.state || null)
            }
            if (msg.type === 'gameReset') {
                setGameState(null)
            }
             })

    socket.addEventListener('close', () => {
      wsRef.current = null
    })

    return () => {
      socket.close()
    }
     }, [])

    // Envoie un message au serveur via WebSocket
    function sendGameMessage(payload) {
        const socket = wsRef.current
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(payload))
        }
    }

  // Gère le changement de pseudo entré par l'utilisateur
  function handlePseudoChange(value) {
    setPseudoInput(value)
    const name = value.trim()
    if (!name) return
    const socket = wsRef.current
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'setName', name }))
      pendingNameRef.current = null
    } else {
      pendingNameRef.current = name
    }
  }

     function handleJoin(e) {
    e.preventDefault()
    const name = pseudoInput.trim()
    if (!name) return
    setPlayerName(name)
    handlePseudoChange(name)
    setScreen('game')
     }

     function sendStartGame() {
        sendGameMessage({ type: 'startGame' })
     }

    function sendResetServer() {
        sendGameMessage({ type: 'resetAll' })
    }

  return (
    <div className="min-h-screen uno-gradient-bg text-slate-100 flex items-center justify-center px-2 py-4">
      <div className="w-full max-w-6xl mx-auto">
                {screen === 'lobby' && (
                  <Lobby
                    pseudoInput={pseudoInput}
                    setPseudoInput={handlePseudoChange}
                    onJoin={handleJoin}
                    lobbyPlayers={lobbyPlayers}
                    clientId={clientId}
                    hostId={hostId}
                    onRequestResetServer={sendResetServer}
                  />
                )}
            {screen === 'game' && playerName && (
                <GameProvider
                    key={clientId ?? playerName}
                    playerName={playerName}
                    lobbyPlayers={lobbyPlayers}
                    clientId={clientId}
                    gameState={gameState}
                    sendGameMessage={sendGameMessage}
                >
                        <Game
                            onBackToLobby={() => setScreen('lobby')}
                            playerName={playerName}
                            isHost={clientId != null && hostId != null && clientId === hostId}
                            onRequestStartGame={sendStartGame}
                            onRequestResetServer={sendResetServer}
                            clientId={clientId}
                        />
                </GameProvider>
            )}
      </div>
    </div>
  )
}

// Composant représentant l'écran de lobby
function Lobby({ pseudoInput, setPseudoInput, onJoin, lobbyPlayers, clientId, hostId, onRequestResetServer }) {
    const maxSlots = 4
    const realPlayers = lobbyPlayers.slice(0, maxSlots).map((p) => ({ ...p, isBot: false }))
    const filledCount = realPlayers.length
    const fakePlayers = []
    for (let i = filledCount; i < maxSlots; i += 1) {
        fakePlayers.push({ id: `bot-${i}`, name: `Bot ${i + 1}`, isBot: true })
    }

    return (
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700/60 p-6 sm:p-10 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-6 w-full">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-500 via-yellow-400 to-red-500 uno-pulse-slow">
                        <span className="text-2xl font-extrabold">UNO</span>
                    </span>
                    <span>Party locale</span>
                </h1>
                <p className="text-slate-300 max-w-xl">
                    Crée ta partie pour 4 joueurs, toi contre trois bots malins.
                </p>

                <form onSubmit={onJoin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" htmlFor="pseudo">
                            Ton pseudo
                        </label>
                        <input
                            id="pseudo"
                            value={pseudoInput}
                            onChange={(e) => setPseudoInput(e.target.value)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-base outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/40 transition-all"
                            placeholder="Ex: MaestroDuUNO"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-red-500 via-lime-400 to-yellow-400 px-4 py-3 text-base font-semibold text-slate-900 shadow-lg shadow-red-500/30 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!pseudoInput.trim()}
                    >
                        Rejoindre la partie
                    </button>
                </form>
            </div>

            <div className="flex-1 w-full">
                <div className="bg-slate-950/70 rounded-2xl border border-slate-700/60 p-5 sm:p-6 uno-glow">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Joueurs connectés</h2>
                        <span className="text-sm text-red-400 font-medium">
                            {filledCount}/{maxSlots}
                        </span>
                    </div>

                    <div className="space-y-3">
                        {[...realPlayers, ...fakePlayers].map((p, index) => {
                            const isSelf = p.id === clientId
                            const isHost = !p.isBot && p.id === hostId
                            return (
                                <div
                                    key={p.id}
                                    className="flex items-center justify-between rounded-xl bg-slate-800/80 px-3 py-2.5"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-500 flex items-center justify-center text-xs font-bold">
                                            {index + 1}
                                        </div>
                                            <div>
                                                <div className="text-sm font-semibold">{p.name}</div>
                                                <div className="text-xs text-slate-400">
                                                    {p.isBot
                                                        ? 'Bot'
                                                        : isSelf
                                                            ? isHost
                                                                ? 'Toi (hôte)'
                                                                : 'Toi'
                                                            : isHost
                                                                ? 'Hôte'
                                                                : 'Joueur'}
                                                </div>
                                            </div>
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        {p.isBot ? 'Prêt (bot)' : 'Connecté'}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <p className="mt-4 text-xs text-slate-400">
                        La partie se joue entièrement dans ce navigateur, sans serveur externe.
                    </p>
                    {clientId != null && hostId != null && clientId === hostId && (
                        <div className="mt-3 flex justify-end">
                            <button
                                type="button"
                                onClick={onRequestResetServer}
                                className="px-3 py-1.5 rounded-full bg-slate-800/80 text-[11px] text-slate-200 border border-slate-700/80 hover:bg-slate-700/80 transition-colors"
                            >
                                Réinitialiser le serveur
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Composant représentant le jeu en cours
function Game({ onBackToLobby, playerName, isHost, onRequestStartGame, onRequestResetServer, clientId }) {
    const {
        players,
        currentPlayer,
        direction,
        currentColor,
        pendingDraw,
        awaitingColorChoice,
        gamePhase,
        message,
        winnerId,
        stats,
        topCard,
        drawPile,
        actions,
    } = useGame()

    const myIndex = clientId != null ? players.findIndex((p) => !p.isBot && p.id === clientId) : 0
    const humanIndex = myIndex === -1 ? 0 : myIndex
    const human = players[humanIndex]
    const isHumanTurn = currentPlayer === humanIndex
    const canDraw = isHumanTurn && gamePhase === 'playing'

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-700/60 shadow-2xl p-3 sm:p-6 md:p-8 flex flex-col gap-4 md:gap-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToLobby}
              className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-3 py-1 text-xs text-slate-300 hover:bg-slate-700/90 transition-colors"
            >
              <span>←</span>
              <span>Retour</span>
            </button>
            <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/40">
              Partie locale 4 joueurs
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold">
            UNO multijoueur
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tu es <span className="font-semibold text-slate-100">{playerName}</span>. Joue selon les règles officielles, pense à appuyer sur UNO.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-end">
          <TurnDirectionIndicator direction={direction} />
          <ActiveColorIndicator color={currentColor} />
          <div className="px-3 py-1 rounded-full bg-slate-800/80 text-xs text-slate-300 border border-slate-700/80 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span>{gamePhase === 'playing' ? 'En cours' : gamePhase === 'ended' ? 'Terminée' : 'En attente'}</span>
          </div>
        </div>
      </header>

      <main className="grid grid-rows-[auto_auto_1fr_auto] gap-4 md:gap-5">
        <div className="flex flex-wrap gap-2 justify-between items-center text-xs sm:text-sm text-slate-300">
          <div className="flex gap-2 flex-wrap items-center">
            <span>
              Tour actuel :{' '}
              <span className="font-semibold text-red-400">
                {players[currentPlayer]?.name}
              </span>
            </span>
            {pendingDraw > 0 && (
              <span className="px-2 py-1 rounded-full bg-red-500/10 text-red-300 border border-red-500/50">
                {pendingDraw > 0 ? `+${pendingDraw} en attente` : ''}
              </span>
            )}
          </div>

          <div className="flex gap-2 text-xs">
            <span className="px-2 py-1 rounded-full bg-slate-800/80 border border-slate-700/80">
              Tours :{' '}
              <span className="font-semibold">{stats.turns}</span>
            </span>
            <span className="px-2 py-1 rounded-full bg-slate-800/80 border border-slate-700/80">
              Cartes piochées :{' '}
              <span className="font-semibold">{stats.drawn}</span>
            </span>
          </div>
        </div>

            {gamePhase === 'lobby' && (
                <div className="mt-3 bg-slate-950/70 rounded-2xl border border-slate-800/80 p-4 flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="text-xs sm:text-sm text-slate-200">
                        <p>La partie n'a pas encore commencé.</p>
                        <p className="text-slate-400 mt-1">
                            {isHost
                                ? "En tant qu'hôte, tu peux lancer la partie."
                                : "En attente que l'hôte lance la partie."}
                        </p>
                    </div>
                    {isHost && (
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={onRequestStartGame}
                                className="px-4 py-2 rounded-full bg-red-500 text-slate-950 text-xs sm:text-sm font-semibold hover:bg-red-400 transition-colors"
                            >
                                Démarrer la partie
                            </button>
                            <button
                                type="button"
                                onClick={onRequestResetServer}
                                className="px-3 py-1.5 rounded-full bg-slate-800/80 text-[11px] text-slate-200 border border-slate-700/80 hover:bg-slate-700/80 transition-colors"
                            >
                                Réinitialiser le serveur
                            </button>
                        </div>
                    )}
                </div>
            )}

            {gamePhase !== 'lobby' && (
                <>
                        <div className="grid grid-cols-1 md:grid-cols-[2fr_1.4fr] gap-4 md:gap-6 items-stretch">
                            <BoardCenter
                                drawPile={drawPile}
                            pendingDraw={pendingDraw}
                            awaitingColorChoice={awaitingColorChoice}
                            topCard={topCard}
                            canDraw={canDraw}
                            onDraw={actions.drawCard}
                        />

                        <PlayersOverview players={players} currentPlayer={currentPlayer} clientId={clientId} />
                    </div>

                        <div className="bg-slate-950/70 rounded-2xl border border-slate-800/80 p-3 sm:p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <div className="text-xs sm:text-sm text-slate-200 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-400" />
                                <span>{message}</span>
                            </div>
                        {winnerId && isHost && (
                                <button
                                    type="button"
                                    onClick={onRequestStartGame}
                                    className="text-xs sm:text-sm px-3 py-1.5 rounded-full bg-red-500/90 text-slate-950 font-semibold hover:bg-red-400 transition-colors"
                                >
                                    Rejouer
                                </button>
                            )}
                        </div>
                        {awaitingColorChoice &&
                            players[awaitingColorChoice.playerIndex] &&
                            players[awaitingColorChoice.playerIndex].id === clientId && (
                            <ColorChoiceOverlay onChoose={actions.chooseColor} />
                        )}
                    </div>

                        <div className="mt-1">
                            <PlayerHand
                                player={human}
                                isActive={isHumanTurn}
                                onPlay={actions.playCard}
                                onUno={actions.sayUno}
                                canSayUno={isHumanTurn && human?.hand.length === 2 && !human?.hasUno}
                            />
                        </div>
                </>
            )}
      </main>
    </div>
  )
}

function PlayersOverview({ players, currentPlayer, clientId }) {
  return (
    <div className="bg-slate-950/70 rounded-2xl border border-slate-800/80 p-3 sm:p-4 flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-slate-100 mb-1">Joueurs</h2>
      <div className="flex flex-col gap-2 text-xs sm:text-sm">
            {players.map((player, index) => {
          const isActive = index === currentPlayer
          const isHuman = !player.isBot && clientId != null && player.id === clientId
          const visibleBacks = Math.min(player.hand.length, 3)
          return (
            <div
              key={player.id}
              className={`flex items-center justify-between rounded-xl px-3 py-2 border ${
                isActive
                  ? 'border-red-500/70 bg-red-500/10 shadow-[0_0_20px_rgba(34,197,94,0.45)]'
                  : 'border-slate-700/80 bg-slate-900/80'
              }`}
            >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      isHuman
                        ? 'bg-gradient-to-tr from-red-500 to-lime-400 text-slate-900'
                        : 'bg-slate-700 text-slate-100'
                  }`}
                  >
                    {player.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{player.name}</span>
                      {isActive && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500 text-slate-950 font-bold">
                          Tour
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{player.hand.length} carte(s)</span>
                      {player.hand.length === 1 && (
                        <span className="text-amber-400 font-semibold">UNO</span>
                      )}
                    </div>
                  </div>
                      <div className="flex items-center ml-2">
                        {Array.from({ length: visibleBacks }).map((_, i) => (
                          <div key={i} style={i === 0 ? undefined : { marginLeft: -6 }}>
                            <MiniCardBack />
                          </div>
                        ))}
                      </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>{player.isBot ? 'Bot' : isHuman ? 'Toi' : 'Joueur'}</span>
                </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TurnDirectionIndicator({ direction }) {
  const clockwise = direction === 1
  return (
    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200">
      <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-900/80 ${clockwise ? 'animate-spin-slow' : 'animate-spin-slow-reverse'}`}>
        <span className="text-[11px]">↻</span>
      </span>
      <span>{clockwise ? 'Sens horaire' : 'Sens antihoraire'}</span>
    </div>
  )
}

function ActiveColorIndicator({ color }) {
  if (!color) {
    return (
      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200">
        <span className="w-3 h-3 rounded-full bg-slate-500" />
        <span>Couleur libre</span>
      </div>
    )
  }

  const colorClass = {
    red: 'bg-red-500',
    yellow: 'bg-yellow-400',
    green: 'bg-red-400',
    blue: 'bg-sky-400',
  }[color]

  return (
    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200">
      <span className={`w-3 h-3 rounded-full ${colorClass}`} />
      <span>Couleur : {translateColor(color)}</span>
    </div>
  )
}

function BoardCenter({ drawPile, pendingDraw, awaitingColorChoice, topCard, canDraw, onDraw }) {
  return (
    <div className="bg-slate-950/70 rounded-2xl border border-slate-800/80 p-4 flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-slate-100">Plateau</h2>
      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        <div className="flex items-center gap-4">
            <DrawPile drawCount={drawPile.length} onDraw={onDraw} canDraw={canDraw} pendingDraw={pendingDraw} />
          <DiscardPile topCard={topCard} />
        </div>
      </div>
      {awaitingColorChoice && (
        <p className="text-xs text-amber-400">
          Choisis une couleur pour ton joker.
        </p>
      )}
    </div>
  )
}

function MiniCardBack() {
    return (
        <div className="w-4 h-6 sm:w-5 sm:h-7 rounded-[3px] bg-white border border-slate-600 shadow-sm relative overflow-hidden">
            <svg viewBox="0 0 200 300" className="absolute inset-0">
                <defs>
                    <linearGradient id="unoBackMini" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#0f172a" />
                        <stop offset="100%" stopColor="#020617" />
                    </linearGradient>
                </defs>
                <rect x="12" y="18" width="176" height="268" rx="40" fill="url(#unoBackMini)" stroke="#e5e7eb" strokeWidth="14" />
                <ellipse cx="110" cy="150" rx="90" ry="150" fill="#f9fafb" transform="rotate(-23 110 150)" />
                <text
                    x={110}
                    y={165}
                    textAnchor="middle"
                    fontSize={120}
                    fontWeight="700"
                    fill="#ef4444"
                    transform="rotate(-18 110 165)"
                >
                    UNO
                </text>
            </svg>
        </div>
    )
}

function DrawPile({ drawCount, onDraw, canDraw, pendingDraw }) {
    const label = pendingDraw > 0 ? `Piocher +${pendingDraw}` : 'Piocher'

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative">
                <button
                    type="button"
                    onClick={canDraw ? onDraw : undefined}
                    className="relative w-24 sm:w-28 aspect-[2/3] rounded-xl bg-white shadow-xl flex items-center justify-center cursor-pointer"
                >
                    <svg viewBox="0 0 200 300" className="absolute inset-[4%] rounded-lg overflow-hidden">
                            <defs>
                                <linearGradient id="unoBack" x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor="#0f172a" />
                                    <stop offset="100%" stopColor="#020617" />
                                </linearGradient>
                            </defs>
                            <rect x="8" y="8" width="184" height="284" rx="32" fill="url(#unoBack)" stroke="#e5e7eb" strokeWidth="6" />
                        <ellipse cx="100" cy="150" rx="70" ry="115" fill="#f9fafb" transform="rotate(-23 100 150)" />
                            <text x="100" y="155" textAnchor="middle" fontSize="64" fontWeight="700" fill="#ef4444" transform="rotate(-18 100 155)">
                                UNO
                            </text>
                        </svg>
                </button>
            </div>
            <button
                type="button"
                onClick={canDraw ? onDraw : undefined}
                disabled={!canDraw}
                className="text-[11px] px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-100 hover:bg-slate-700/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {label}
            </button>
            <span className="text-[10px] text-slate-400">{drawCount} cartes restantes</span>
        </div>
    )
}

function DiscardPile({ topCard }) {
    return (
        <div className="flex flex-col items-center gap-2">
            {topCard ? (
                <Card card={topCard} highlight />
            ) : (
                <div className="w-24 sm:w-28 aspect-[2/3] rounded-xl bg-slate-800/80 border border-dashed border-slate-600" />
            )}
            <span className="text-[10px] text-slate-400">Défausse</span>
        </div>
    )
}

function PlayerHand({ player, isActive, onPlay, onUno, canSayUno }) {
  if (!player) return null

  const sortedHand = [...player.hand].sort((a, b) => {
    const colorOrder = ['red', 'yellow', 'green', 'blue', 'wild']
    const typeOrder = ['number', 'skip', 'reverse', 'draw2', 'wild', 'wild4']
    const colorDiff = colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color)
    if (colorDiff !== 0) return colorDiff
    const typeDiff = typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type)
    if (typeDiff !== 0) return typeDiff
    return (a.value || 0) - (b.value || 0)
  })

  return (
    <div className="bg-slate-950/80 rounded-2xl border border-slate-800/80 p-3 sm:p-4 flex flex-col gap-3">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Ta main</span>
          {isActive ? (
            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-[11px] text-red-300 border border-red-500/60">
              À ton tour
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-slate-800/80 text-[11px] text-slate-300 border border-slate-700/80">
              En attente
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {canSayUno && (
            <button
              type="button"
              onClick={onUno}
              className="px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-red-500 text-xs font-bold text-slate-950 shadow-lg shadow-red-500/30 hover:brightness-110 active:scale-95 transition-all"
            >
              UNO !
            </button>
          )}
          <span className="text-[11px] text-slate-400">
            {player.hand.length} carte(s)
          </span>
        </div>
      </div>

      <div className="flex gap-2 sm:gap-3 overflow-x-auto uno-scrollbar pb-2">
        {sortedHand.map((card) => (
          <Card
            key={card.id}
            card={card}
            interactive={isActive}
            onClick={() => {
              if (isActive) onPlay(card)
            }}
          />
        ))}
      </div>
    </div>
    )
}

function getCardBaseColor(card) {
    if (card.color === 'red') return '#ef4444'
    if (card.color === 'yellow') return '#facc15'
    if (card.color === 'green') return '#22c55e'
    if (card.color === 'blue') return '#0ea5e9'
    return '#111827'
}

function getCardLabel(card) {
    if (card.type === 'number') return String(card.value ?? '')
    if (card.type === 'draw2') return '+2'
    if (card.type === 'reverse') return '↺'
    if (card.type === 'skip') return '⊘'
    if (card.type === 'wild') return 'W'
    if (card.type === 'wild4') return '+4'
    return ''
}

function Card({ card, interactive, onClick, highlight }) {
    const mainColor = getCardBaseColor(card)

    return (
        <button
            type="button"
            onClick={interactive ? onClick : undefined}
            className={`relative w-20 sm:w-24 aspect-[2/3] rounded-xl bg-transparent shadow-xl flex-shrink-0 transition-transform duration-150 ${
                interactive ? 'hover:-translate-y-1 hover:shadow-2xl active:translate-y-0 cursor-pointer' : 'cursor-default'
            } ${highlight ? 'scale-105 uno-glow' : ''}`}
        >
            <svg viewBox="0 0 200 300" className="absolute inset-[3%] rounded-lg overflow-hidden">
                <defs>
                    <clipPath id="unoOvalClip">
                        <ellipse cx="100" cy="150" rx="88" ry="140" transform="rotate(-22 100 150)" />
                    </clipPath>
                </defs>
                <rect x="10" y="10" width="180" height="280" rx="24" fill="#f9fafb" />
                <rect x="16" y="16" width="168" height="268" rx="22" fill={card.type === 'wild' || card.type === 'wild4' ? '#111827' : mainColor} />
                <ellipse cx="100" cy="150" rx="70" ry="115" fill="#f9fafb" transform="rotate(-22 100 150)" />
                {card.type === 'wild' || card.type === 'wild4' ? (
                    <g clipPath="url(#unoOvalClip)">
                        <rect x="20" y="40" width="90" height="140" fill="#22c55e" />
                        <rect x="90" y="40" width="90" height="140" fill="#0ea5e9" />
                        <rect x="20" y="140" width="90" height="140" fill="#ef4444" />
                        <rect x="90" y="140" width="90" height="140" fill="#facc15" />
                    </g>
                ) : null}
                {renderCenterSymbol(card, mainColor)}
                {renderCornerLabels(card, mainColor)}
            </svg>
        </button>
    )
}

function renderCenterSymbol(card, mainColor) {
    const label = getCardLabel(card)
    if (card.type === 'wild' || card.type === 'wild4') {
        return (
            <text
                x={100}
                y={165}
                textAnchor="middle"
                fontSize={label === '+4' ? 90 : 72}
                fontWeight="800"
                fill="#f9fafb"
            >
                {label}
            </text>
        )
    }

    const fill = mainColor
    const size = card.type === 'number' ? 96 : 80

    return (
        <text
            x={100}
            y={172}
            textAnchor="middle"
            fontSize={size}
            fontWeight="800"
            fill={fill}
        >
            {label}
        </text>
    )
}

function renderCornerLabels(card, mainColor) {
    const label = getCardLabel(card)
    if (!label) return null
    const smallSize = label.length > 2 ? 28 : 30
    let fill
    if (card.type === 'wild' || card.type === 'wild4') {
        fill = '#f9fafb'
    } else {
        fill = mainColor
    }

    return (
        <g>
            <text
                x={26}
                y={56}
                textAnchor="middle"
                fontSize={smallSize}
                fontWeight="700"
                fill={fill}
            >
                {label}
            </text>
            <text
                x={174}
                y={244}
                textAnchor="middle"
                fontSize={smallSize}
                fontWeight="700"
                fill={fill}
                transform="rotate(180 174 244)"
            >
                {label}
            </text>
        </g>
    )
}

function ColorChoiceOverlay({ onChoose }) {
  const colors = [
    { key: 'red', label: 'Rouge', className: 'bg-red-500' },
    { key: 'yellow', label: 'Jaune', className: 'bg-yellow-400' },
    { key: 'green', label: 'Vert', className: 'bg-red-500' },
    { key: 'blue', label: 'Bleu', className: 'bg-sky-500' },
  ]

  return (
    <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <p className="text-xs sm:text-sm text-slate-200">Choisis la couleur pour ton joker :</p>
      <div className="flex gap-2">
        {colors.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => onChoose(c.key)}
            className={`${c.className} text-xs sm:text-sm font-semibold text-slate-950 px-3 py-1.5 rounded-full shadow-md hover:brightness-110 active:scale-95 transition-transform`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default App