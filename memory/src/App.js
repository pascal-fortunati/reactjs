import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import Title from './components/Title';
import Button from './components/Button';
import Card from './components/Card';
import logoMemory from './img/logo-memory.png';

const SPRITES = Array.from({ length: 16 }, (_, index) => index);

// Crée un deck mélangé de cartes pour le jeu de mémoire
function createShuffledDeck(pairsCount) {
  const base = SPRITES.slice(0, pairsCount);
  const duplicated = base.flatMap((spriteIndex, index) => [
    { id: `${spriteIndex}-${index}-a`, value: spriteIndex, matched: false },
    { id: `${spriteIndex}-${index}-b`, value: spriteIndex, matched: false },
  ]);

  // Mélange le deck de cartes en utilisant l'algorithme de Fisher-Yates
  for (let i = duplicated.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = duplicated[i];
    duplicated[i] = duplicated[j];
    duplicated[j] = temp;
  }

  return duplicated;
}

// Formate le temps en format "mm:ss"
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${mm}:${ss}`;
}

// Composant principal de l'application
function App() {
  const [difficulty, setDifficulty] = useState('easy');
  const [cards, setCards] = useState(() => createShuffledDeck(4));
  const [firstIndex, setFirstIndex] = useState(null);
  const [secondIndex, setSecondIndex] = useState(null);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [scores, setScores] = useState([]);
  const [showScores, setShowScores] = useState(false);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [scoreError, setScoreError] = useState("");
  const [scoreSortKey, setScoreSortKey] = useState('moves');
  const [scoreSortOrder, setScoreSortOrder] = useState('asc');

  const totalPairs = useMemo(() => cards.length / 2, [cards]);

  // Gère le changement de difficulté en réinitialisant les états appropriés
  const handleChangeDifficulty = value => {
    setDifficulty(value);
    setCards(createShuffledDeck(value === 'easy' ? 4 : value === 'hard' ? 16 : 8));
    setFirstIndex(null);
    setSecondIndex(null);
    setMoves(0);
    setMatches(0);
    setSeconds(0);
    setIsRunning(false);
    setIsWon(false);
    setIsDisabled(false);
  };

  // Génère le label correspondant à la difficulté
  const difficultyLabel = useMemo(() => {
    if (difficulty === 'easy') return 'Facile';
    if (difficulty === 'hard') return 'Difficile';
    return 'Normal';
  }, [difficulty]);

  // Génère le chemin de l'icône de difficulté correspondant à la difficulté
  const difficultyIconSrc = useMemo(() => {
    if (difficulty === 'easy') return '/img/facile.png';
    if (difficulty === 'hard') return '/img/difficile.png';
    return '/img/normal.png';
  }, [difficulty]);

  // Génère le nombre de paires correspondant à la difficulté
  const difficultyPairs = useMemo(() => {
    if (difficulty === 'easy') return 4;
    if (difficulty === 'hard') return 16;
    return 8;
  }, [difficulty]);

  // Trie les scores en fonction de la clé et de l'ordre de tri
  const sortedScores = useMemo(() => {
    const copy = [...scores];
    copy.sort((a, b) => {
      if (scoreSortKey === 'time') {
        return a.time - b.time;
      }
      return a.moves - b.moves;
    });
    if (scoreSortOrder === 'desc') {
      copy.reverse();
    }
    return copy;
  }, [scores, scoreSortKey, scoreSortOrder]);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setSeconds(previous => previous + 1);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isRunning]);

  useEffect(() => {
    if (!totalPairs) {
      return;
    }

    if (matches === totalPairs) {
      setIsWon(true);
      setIsRunning(false);
    }
  }, [matches, totalPairs]);

  useEffect(() => {
    fetch(`http://localhost:4000/scores?difficulty=${encodeURIComponent(difficulty)}`)
      .then(response => response.json())
      .then(data => {
        if (data && Array.isArray(data.scores)) {
          setScores(data.scores);
        }
      })
      .catch(() => {
        setScores([]);
      });
  }, [difficulty]);

  useEffect(() => {
    if (firstIndex === null || secondIndex === null) {
      return;
    }

    setIsDisabled(true);
    const firstCard = cards[firstIndex];
    const secondCard = cards[secondIndex];

    if (!firstCard || !secondCard) {
      setTimeout(() => {
        resetTurn();
      }, 400);
      return;
    }

    if (firstCard.value === secondCard.value) {
      setTimeout(() => {
        setCards(previous =>
          previous.map((card, index) => {
            if (index === firstIndex || index === secondIndex) {
              return { ...card, matched: true };
            }
            return card;
          }),
        );
        setMatches(previous => previous + 1);
        resetTurn();
      }, 500);
    } else {
      setTimeout(() => {
        resetTurn();
      }, 650);
    }
  }, [firstIndex, secondIndex, cards]);

  const resetTurn = () => {
    setFirstIndex(null);
    setSecondIndex(null);
    setIsDisabled(false);
  };

  const handleCardClick = index => {
    if (isDisabled || isWon) {
      return;
    }

    if (!isRunning) {
      setIsRunning(true);
    }

    if (index === firstIndex || index === secondIndex) {
      return;
    }

    if (firstIndex === null) {
      setFirstIndex(index);
    } else if (secondIndex === null) {
      setSecondIndex(index);
      setMoves(previous => previous + 1);
    }
  };

  // Recommence une partie en mélangeant les cartes et en réinitialisant les états
  const handleRestart = () => {
    setCards(createShuffledDeck(difficultyPairs));
    setFirstIndex(null);
    setSecondIndex(null);
    setMoves(0);
    setMatches(0);
    setSeconds(0);
    setIsRunning(false);
    setIsWon(false);
    setIsDisabled(false);
  };

  // Enregistre le score de la partie dans le backend
  const handleSubmitScore = () => {
    if (!playerName.trim()) {
      setScoreError("Veuillez saisir un nom avant d'enregistrer le score.");
      return;
    }

    setScoreError("");
    setIsSubmittingScore(true);

    fetch("http://localhost:4000/scores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        playerName: playerName.trim(),
        moves,
        time: seconds,
        difficulty
      })
    })
      .then(response => response.json())
      .then(() => {
        return fetch(`http://localhost:4000/scores?difficulty=${encodeURIComponent(difficulty)}`);
      })
      .then(response => response.json())
      .then(data => {
        if (data && Array.isArray(data.scores)) {
          setScores(data.scores);
        }
      })
      .finally(() => {
        setIsSubmittingScore(false);
      });
  };

  // Composant principal de l'application
  return (
    <div className="app-root">
      <div className="container">
        <header className="header">
          <div>
            <Title>
              <img
                src={logoMemory}
                alt="Memory"
                className="app-logo"
              />
            </Title>
          </div>
          <div className="header-controls">
            <div className="difficulty-wrapper">
              <button
                type="button"
                className={`difficulty-button${difficulty === 'easy' ? ' difficulty-button-active' : ''}`}
                onClick={() => handleChangeDifficulty('easy')}
              >
                <img src="/img/facile.png" alt="Facile" className="difficulty-icon" />
              </button>
              <button
                type="button"
                className={`difficulty-button${difficulty === 'normal' ? ' difficulty-button-active' : ''}`}
                onClick={() => handleChangeDifficulty('normal')}
              >
                <img src="/img/normal.png" alt="Normal" className="difficulty-icon" />
              </button>
              <button
                type="button"
                className={`difficulty-button${difficulty === 'hard' ? ' difficulty-button-active' : ''}`}
                onClick={() => handleChangeDifficulty('hard')}
              >
                <img src="/img/difficile.png" alt="Difficile" className="difficulty-icon" />
              </button>
            </div>
            <div className="player-row header-player">
              <input
                id="playerName"
                className="player-input"
                type="text"
                value={playerName}
                onChange={event => setPlayerName(event.target.value)}
                placeholder="Entrez votre pseudo"
              />
            </div>
          </div>
        </header>

        <div className="stats-row">
          <div className="stats-card">
            <div className="stats-label">Temps</div>
            <div className="stats-value">{formatTime(seconds)}</div>
          </div>
          <div className="stats-card">
            <div className="stats-label">Coups</div>
            <div className="stats-value">{moves}</div>
          </div>
          <div className="stats-card">
            <div className="stats-label">Paires</div>
            <div className="stats-value">
              {matches} / {totalPairs}
            </div>
          </div>
          <div className="stats-card stats-card-button">
            <Button onClick={handleRestart}>Nouvelle partie</Button>
          </div>
        </div>

        <div className="scores-toggle">
          <Button onClick={() => setShowScores(previous => !previous)}>
            {showScores ? 'Masquer les scores' : 'Afficher les scores'}
          </Button>
        </div>

        {showScores && (
          <section className="scores-section">
            <div className="scores-card">
              <div className="scores-header">
                <h3>Tableau des meilleurs scores</h3>
                <span className="scores-badge">
                  <img
                    src={difficultyIconSrc}
                    alt={`Difficulté ${difficultyLabel}`}
                    className="scores-difficulty-icon"
                  />
                </span>
              </div>
              {scores.length === 0 ? (
                <p className="scores-empty">
                  Aucun score enregistré pour le moment.
                </p>
              ) : (
                <div className="scores-table-wrapper">
                  <table className="scores-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Joueur</th>
                        <th
                          className="scores-header-sortable"
                          onClick={() => {
                            setScoreSortKey('moves');
                            setScoreSortOrder(previous =>
                              scoreSortKey === 'moves' && previous === 'asc' ? 'desc' : 'asc'
                            );
                          }}
                        >
                          Coups
                          {scoreSortKey === 'moves' && (scoreSortOrder === 'asc' ? ' ↑' : ' ↓')}
                        </th>
                        <th
                          className="scores-header-sortable"
                          onClick={() => {
                            setScoreSortKey('time');
                            setScoreSortOrder(previous =>
                              scoreSortKey === 'time' && previous === 'asc' ? 'desc' : 'asc'
                            );
                          }}
                        >
                          Temps
                          {scoreSortKey === 'time' && (scoreSortOrder === 'asc' ? ' ↑' : ' ↓')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedScores.map((score, index) => (
                        <tr key={score.id}>
                          <td>{index + 1}</td>
                          <td>{score.playerName}</td>
                          <td>{score.moves}</td>
                          <td>{formatTime(score.time)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        <div className={`game-grid game-grid-${difficulty}`}>
          {cards.map((card, index) => {
            const isFlipped = index === firstIndex || index === secondIndex || card.matched;
            return (
              <Card
                key={card.id}
                value={card.value}
                isFlipped={isFlipped}
                isMatched={card.matched}
                onClick={() => handleCardClick(index)}
              />
            );
          })}
        </div>

        {isWon && (
          <div className="win-overlay">
            <div className="confetti-layer">
              {Array.from({ length: 80 }).map((_, index) => {
                const left = `${Math.random() * 100}%`;
                const delay = `${Math.random() * 1.5}s`;
                const duration = `${3 + Math.random() * 2}s`;
                const colors = ['#fde68a', '#f97316', '#22c55e', '#38bdf8', '#f9a8d4'];
                const color = colors[index % colors.length];
                return (
                  <span
                    key={index}
                    className="confetti-piece"
                    style={{ left, backgroundColor: color, animationDelay: delay, animationDuration: duration }}
                  />
                );
              })}
            </div>
            <div className="win-message">
              <h2>Bravo, vous avez gagné !</h2>
              <p>
                Temps: {formatTime(seconds)} Coups: {moves}
              </p>
              <div className="win-actions">
                <Button onClick={handleSubmitScore} disabled={isSubmittingScore}>
                  {isSubmittingScore ? "Enregistrement..." : "Enregistrer le score"}
                </Button>
                {scoreError && <p className="score-error">{scoreError}</p>}
                <Button onClick={handleRestart} variant="secondary">Rejouer</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Composant principal de l'application
export default App;
