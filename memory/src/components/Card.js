import React from 'react';

const SPRITE_COLUMNS = 4;
const SPRITE_ROWS = 4;
const SPRITE_URL = '/img/perso.png';

// Composant Card représentant une carte de la mémoire
function Card({ value, isFlipped, isMatched, onClick }) {
  const handleClick = () => {
    if (!isFlipped && !isMatched) {
      onClick();
    }
  };

  // Déterminer si la carte est retournée ou correspondue
  const flipped = isFlipped || isMatched;

  const className = `memory-card${flipped ? ' memory-card-flipped memory-card-matched' : ''}`;

  // Calculer la position de l'image dans le sprite
  // Si le sprite a une seule colonne ou une seule ligne, la position est centrée
  const spriteIndex = value;
  const column = spriteIndex % SPRITE_COLUMNS;
  const row = Math.floor(spriteIndex / SPRITE_COLUMNS);
  const backgroundPositionX = (SPRITE_COLUMNS === 1 ? 0 : (column / (SPRITE_COLUMNS - 1)) * 100);
  const backgroundPositionY = (SPRITE_ROWS === 1 ? 0 : (row / (SPRITE_ROWS - 1)) * 100);

  // Appliquer la position de l'image dans le sprite au style de la carte
  const spriteStyle = {
    backgroundImage: `url(${SPRITE_URL})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${SPRITE_COLUMNS * 100}% ${SPRITE_ROWS * 100}%`,
    backgroundPosition: `${backgroundPositionX}% ${backgroundPositionY}%`,
  };

  // Retourner le composant Card avec le style de l'image dans le sprite
  return (
    <button type="button" onClick={handleClick} className={className}>
      <div className="memory-card-inner">
        <div className="memory-card-face memory-card-front" />
        <div className="memory-card-face memory-card-back">
          <div className="memory-card-sprite" style={spriteStyle} />
        </div>
      </div>
    </button>
  );
}

// Exportation du composant Card pour être utilisé dans d'autres fichiers
export default Card;
