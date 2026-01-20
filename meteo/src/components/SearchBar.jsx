import { useState, useEffect } from 'react';

const SearchBar = ({ onSearch }) => {
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      onSearch(searchValue.trim());
      setSearchValue('');
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleSelectSuggestion = (city) => {
    setSearchValue(city);
    setSuggestions([]);
    setIsOpen(false);
    onSearch(city);
  };

  useEffect(() => {
    const query = searchValue.trim();

    if (query.length < 3) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&type=municipality&limit=5`;
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        const cities = (data.features || [])
          .map((f) => f.properties && (f.properties.city || f.properties.name))
          .filter(Boolean);
        setSuggestions(cities);
        setIsOpen(cities.length > 0);
      } catch {
        if (controller.signal.aborted) return;
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [searchValue]);

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => {
            const value = e.target.value;
            setSearchValue(value);
            const query = value.trim();
            if (query.length < 3) {
              setSuggestions([]);
              setIsOpen(false);
            }
          }}
          placeholder="Rechercher une ville..."
          className="input input-lg input-bordered w-full sm:flex-1 bg-base-100/80 backdrop-blur-sm"
        />
        <button
          type="submit"
          className="btn btn-primary btn-lg w-full sm:w-auto rounded-2xl shadow-lg flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">search</span>
          Rechercher
        </button>
      </form>

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-2 left-0 right-0 menu menu-sm bg-base-100/95 backdrop-blur-md rounded-2xl shadow-xl max-h-72 overflow-y-auto border border-base-300 p-2">
          {suggestions.map((city) => (
            <li key={city}>
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-2 text-sm rounded-xl hover:bg-base-200/80 focus:bg-primary/10 focus:outline-none transition-colors"
                onClick={() => handleSelectSuggestion(city)}
              >
                <span className="font-medium text-base-content/90">{city}</span>
                <span className="material-symbols-outlined text-base text-primary">location_on</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
