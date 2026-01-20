import { useState, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import Weather from './components/Weather';
import Favorites from './components/Favorites';
import History from './components/History';
import ThemeToggle from './components/ThemeToggle';

function App() {
  const [currentCity, setCurrentCity] = useState('Paris');
  const [coords, setCoords] = useState(null);
  const [unit, setUnit] = useState('metric');
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('favorites')) || [];
      return stored;
    } catch {
      return [];
    }
  });
  const [history, setHistory] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('searchHistory')) || [];
      return stored;
    } catch {
      return [];
    }
  });

  const handleSearch = useCallback((city) => {
    setCurrentCity(city);
  }, []);

  const handleSelectCity = useCallback((city) => {
    setCurrentCity(city);
    setCoords(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleUnit = useCallback(() => {
    setUnit((prev) => (prev === 'metric' ? 'imperial' : 'metric'));
  }, []);

  const handleAddToHistory = useCallback((cityName) => {
    setHistory((prev) => {
      let updated = prev.filter((item) => item.toLowerCase() !== cityName.toLowerCase());
      updated = [cityName, ...updated].slice(0, 5);
      localStorage.setItem('searchHistory', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleRemoveFromHistory = useCallback((cityName) => {
    setHistory((prev) => {
      const updated = prev.filter((city) => city.toLowerCase() !== cityName.toLowerCase());
      localStorage.setItem('searchHistory', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleAddFavorite = useCallback((cityName) => {
    let status = 'added';

    setFavorites((prev) => {
      if (prev.some((fav) => fav.toLowerCase() === cityName.toLowerCase())) {
        status = 'exists';
        return prev;
      }
      const updated = [...prev, cityName];
      localStorage.setItem('favorites', JSON.stringify(updated));
      return updated;
    });

    return status;
  }, []);

  const handleRemoveFavorite = useCallback((cityName) => {
    setFavorites((prev) => {
      const updated = prev.filter((city) => city.toLowerCase() !== cityName.toLowerCase());
      localStorage.setItem('favorites', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par ce navigateur.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lon: longitude });
      },
      () => {
        alert('Impossible de récupérer votre position.');
      }
    );
  };

  return (
    <div className="min-h-screen bg-base-200 overflow-x-hidden w-full">
      <nav className="navbar bg-base-100/80 backdrop-blur-md border-b border-base-300 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="navbar-start">
            <div className="flex items-center gap-3">
              <img
                src="/logo_meteo.png"
                alt="Logo MétéoFacile"
                className="w-25 h-25 object-contain"
              />
              <span className="text-2xl font-black">MétéoFacile</span>
            </div>
          </div>
          <div className="navbar-end w-full sm:w-auto flex items-center justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleUnit}
              className="btn btn-sm btn-outline"
            >
              {unit === 'metric' ? '°C' : '°F'}
            </button>
            <button
              type="button"
              onClick={handleUseMyLocation}
              className="btn btn-outline btn-sm flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-base">my_location</span>
              <span className="hidden sm:inline">Ma position</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="py-8 sm:py-12 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 animate-gradient-x overflow-x-hidden w-full">
        <div className="container mx-auto text-center px-4">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black mb-6 drop-shadow-2xl hero-title">
            Météo en Temps Réel
          </h1>
          <p className="text-base sm:text-xl mb-8 hero-subtitle">
            Découvrez la météo partout dans le monde avec des données précises et actualisées
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <section className="mb-12 max-w-3xl mx-auto">
          <SearchBar onSearch={handleSearch} />
        </section>

        <section className="mb-12 max-w-6xl mx-auto">
          <Weather
            city={currentCity}
            coords={coords}
            unit={unit}
            onCityResolved={setCurrentCity}
            onAddToHistory={handleAddToHistory}
            onAddFavorite={handleAddFavorite}
          />
        </section>

        <section className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Favorites
              favorites={favorites}
              onSelectCity={handleSelectCity}
              onRemoveFavorite={handleRemoveFavorite}
            />
            <History
              history={history}
              onSelectCity={handleSelectCity}
              onRemoveCity={handleRemoveFromHistory}
            />
          </div>
        </section>
      </div>

      <footer className="bg-base-300 text-base-content p-10 text-center mt-8">
        <img
          src="/logo_meteo.png"
          alt="Logo MétéoFacile"
          className="w-24 h-24 mx-auto mb-4 object-contain"
        />
        <p className="font-bold text-lg">MétéoFacile - Votre assistant météo</p>
        <p className="text-sm mt-2">Copyright © 2026 - Tous droits réservés</p>
        <p className="text-sm opacity-75 mt-4">Propulsé par OpenWeatherMap API</p>
      </footer>
    </div>
  );
}

export default App;