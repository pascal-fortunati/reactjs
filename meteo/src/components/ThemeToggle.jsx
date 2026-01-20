import { useState } from 'react';
const ThemeToggle = () => {
  const themes = ['light', 'dark'];
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    return savedTheme;
  });

  // Fonction pour changer le thème
  const toggleTheme = () => {
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const newTheme = themes[nextIndex];
    
    setCurrentTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Fonction pour obtenir l'icône correspondant au thème
  const getThemeIcon = () => {
    switch (currentTheme) {
      case 'dark':
        return 'dark_mode';
      default:
        return 'light_mode';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-circle btn-primary shadow-lg"
      title={`Thème actuel: ${currentTheme}`}
    >
      <span className="material-symbols-outlined">{getThemeIcon()}</span>
    </button>
  );
};

export default ThemeToggle;
