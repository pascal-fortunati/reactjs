import React from 'react';

// Composant Title représentant le titre de l'application
function Title({ children }) {
  return (
    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
      {children}
    </h1>
  );
}

// Exportation du composant Title pour être utilisé dans d'autres fichiers
export default Title;