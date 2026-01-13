import React from 'react';

// Composant Button représentant un bouton interactif
function Button({ children, onClick, type = 'button', disabled = false, variant = 'primary' }) {
  const base = 'button';
  const variantClass = variant === 'secondary' ? 'button-secondary' : 'button-primary';
  const className = `${base} ${variantClass}`;

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  );
}

// Exportation du composant Button pour être utilisé dans d'autres fichiers
export default Button;
