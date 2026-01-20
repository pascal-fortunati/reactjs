import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';

const Weather = ({ city, coords, unit = 'metric', onCityResolved, onAddToHistory, onAddFavorite }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forecast, setForecast] = useState([]);

  const fetchWeather = useCallback(async ({ cityName, position }) => {
    setLoading(true);
    setError(null);

    try {
      const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
      
      if (!API_KEY) {
        throw new Error('Clé API non configurée. Veuillez ajouter votre clé dans le fichier .env');
      }

      const baseUrl = 'https://api.openweathermap.org/data/2.5';

      const weatherUrl = position
        ? `${baseUrl}/weather?lat=${position.lat}&lon=${position.lon}&appid=${API_KEY}&units=${unit}&lang=fr`
        : `${baseUrl}/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=${unit}&lang=fr`;

      const forecastUrl = position
        ? `${baseUrl}/forecast?lat=${position.lat}&lon=${position.lon}&appid=${API_KEY}&units=${unit}&lang=fr`
        : `${baseUrl}/forecast?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=${unit}&lang=fr`;

      const [weatherResponse, forecastResponse] = await Promise.all([
        fetch(weatherUrl),
        fetch(forecastUrl),
      ]);

      if (!weatherResponse.ok) {
        if (weatherResponse.status === 404) {
          throw new Error('Ville introuvable. Vérifiez l\'orthographe.');
        } else if (weatherResponse.status === 401) {
          throw new Error('Clé API invalide. Vérifiez votre clé dans le fichier .env');
        } else if (weatherResponse.status === 429) {
          throw new Error('Limite de requêtes atteinte. Veuillez réessayer plus tard.');
        } else {
          throw new Error('Erreur lors de la récupération des données météo.');
        }
      }

      if (!forecastResponse.ok) {
        throw new Error('Erreur lors de la récupération des prévisions météo.');
      }

      const weatherJson = await weatherResponse.json();
      const forecastJson = await forecastResponse.json();

      setWeatherData(weatherJson);
      if (onAddToHistory && weatherJson.name) {
        onAddToHistory(weatherJson.name);
      }

      const daily = [];
      const seenDates = new Set();
      forecastJson.list.forEach((item) => {
        const [datePart] = item.dt_txt.split(' ');
        if (!seenDates.has(datePart) && daily.length < 5) {
          seenDates.add(datePart);
          const condition = item.weather && item.weather[0] ? item.weather[0] : null;
          daily.push({
            date: datePart,
            temp: item.main.temp,
            icon: condition ? condition.icon : null,
            main: condition ? condition.main : '',
            description: condition ? condition.description : '',
          });
        }
      });
      setForecast(daily);

      if (onCityResolved && position && weatherJson.name) {
        onCityResolved(weatherJson.name);
      }
      
    } catch (err) {
      setError(err.message);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: err.message,
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setLoading(false);
    }
  }, [unit, onCityResolved, onAddToHistory]);

  useEffect(() => {
    if (coords) {
      fetchWeather({ position: coords });
    } else if (city && city.trim() !== '') {
      fetchWeather({ cityName: city.trim() });
    }
  }, [city, coords, fetchWeather]);

  const addToFavorites = () => {
    if (!weatherData) return;

    const cityName = weatherData.name;

    if (!onAddFavorite) {
      return;
    }

    const status = onAddFavorite(cityName);

    if (status === 'exists') {
      Swal.fire({
        icon: 'info',
        title: 'Information',
        text: 'Cette ville est déjà dans vos favoris !',
        confirmButtonColor: '#3b82f6',
      });
    } else if (status === 'added') {
      Swal.fire({
        icon: 'success',
        title: 'Succès',
        text: `${cityName} a été ajouté aux favoris !`,
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-base-100 rounded-3xl shadow-2xl p-8">
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <span className="loading loading-spinner loading-lg text-primary" />
          <h3 className="text-2xl font-bold">Chargement...</h3>
          <p className="text-base-content/70">Récupération des données météo</p>
        </div>
      </div>
    );
  }

  if (!navigator.onLine) {
    return (
      <div className="bg-base-100 rounded-3xl shadow-2xl p-8">
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <span className="material-symbols-outlined text-6xl text-error">wifi_off</span>
          <h3 className="text-2xl font-bold">Vous êtes hors ligne</h3>
          <p className="text-base-content/70">
            Connectez-vous à Internet pour récupérer les dernières données météo.
          </p>
        </div>
      </div>
    );
  }

  if (error && !weatherData) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 rounded-lg shadow-2xl p-6">
        <div className="flex items-start gap-4">
          <span className="material-symbols-outlined text-4xl text-red-500">error</span>
          <div>
            <h3 className="font-bold text-xl text-red-800">Erreur</h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="bg-base-100 rounded-3xl shadow-2xl p-8">
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <span className="material-symbols-outlined text-7xl text-primary/60">travel_explore</span>
          <h3 className="text-3xl font-bold">Recherchez une ville</h3>
          <p className="text-base-content/70">Entrez le nom d'une ville pour voir sa météo</p>
        </div>
      </div>
    );
  }

  const { main, weather, wind, name, sys } = weatherData;
  const temperature = Math.round(main.temp);
  const description = weather[0].description;
  const icon = weather[0].icon;
  const humidity = main.humidity;
  const windSpeed = unit === 'metric'
    ? Math.round(wind.speed * 3.6)
    : Math.round(wind.speed);
  const country = sys.country;

  const temps = forecast.map((d) => d.temp);
  const minTemp = temps.length ? Math.min(...temps) : null;
  const maxTemp = temps.length ? Math.max(...temps) : null;

  const getAnimatedIconSrc = () => {
    const code = icon || '';
    const isDay = code.endsWith('d');
    const mainCode = weather[0].main.toLowerCase();
    const desc = description.toLowerCase();

    if (mainCode === 'clear') {
      return isDay ? '/svg/clear-day.svg' : '/svg/clear-night.svg';
    }

    if (mainCode === 'clouds') {
      if (desc.includes('peu nuageux') || desc.includes('few') || desc.includes('partly')) {
        return isDay ? '/svg/partly-cloudy-day.svg' : '/svg/partly-cloudy-night.svg';
      }
      return isDay ? '/svg/overcast-day.svg' : '/svg/overcast-night.svg';
    }

    if (mainCode === 'rain') {
      return '/svg/rain.svg';
    }

    if (mainCode === 'drizzle') {
      return isDay ? '/svg/overcast-day-drizzle.svg' : '/svg/overcast-night-drizzle.svg';
    }

    if (mainCode === 'thunderstorm') {
      return isDay ? '/svg/thunderstorms-day.svg' : '/svg/thunderstorms-night.svg';
    }

    if (mainCode === 'snow') {
      return '/svg/snow.svg';
    }

    if (mainCode === 'mist' || mainCode === 'fog' || mainCode === 'haze' || mainCode === 'smoke') {
      return isDay ? '/svg/fog-day.svg' : '/svg/fog-night.svg';
    }

    if (mainCode === 'dust' || mainCode === 'sand' || mainCode === 'ash') {
      return isDay ? '/svg/dust-day.svg' : '/svg/dust-night.svg';
    }

    if (mainCode === 'squall' || mainCode === 'tornado') {
      return '/svg/tornado.svg';
    }

    return isDay ? '/svg/not-available.svg' : '/svg/not-available.svg';
  };

  const getAnimatedIconSrcForForecast = (day) => {
    if (!day) return '/svg/not-available.svg';

    const code = day.icon || '';
    const isDay = code.endsWith('d');
    const mainCode = (day.main || '').toLowerCase();
    const desc = (day.description || '').toLowerCase();

    if (mainCode === 'clear') {
      return isDay ? '/svg/clear-day.svg' : '/svg/clear-night.svg';
    }

    if (mainCode === 'clouds') {
      if (desc.includes('peu nuageux') || desc.includes('few') || desc.includes('partly')) {
        return isDay ? '/svg/partly-cloudy-day.svg' : '/svg/partly-cloudy-night.svg';
      }
      return isDay ? '/svg/overcast-day.svg' : '/svg/overcast-night.svg';
    }

    if (mainCode === 'rain') {
      return '/svg/rain.svg';
    }

    if (mainCode === 'drizzle') {
      return isDay ? '/svg/overcast-day-drizzle.svg' : '/svg/overcast-night-drizzle.svg';
    }

    if (mainCode === 'thunderstorm') {
      return isDay ? '/svg/thunderstorms-day.svg' : '/svg/thunderstorms-night.svg';
    }

    if (mainCode === 'snow') {
      return '/svg/snow.svg';
    }

    if (mainCode === 'mist' || mainCode === 'fog' || mainCode === 'haze' || mainCode === 'smoke') {
      return isDay ? '/svg/fog-day.svg' : '/svg/fog-night.svg';
    }

    if (mainCode === 'dust' || mainCode === 'sand' || mainCode === 'ash') {
      return isDay ? '/svg/dust-day.svg' : '/svg/dust-night.svg';
    }

    if (mainCode === 'squall' || mainCode === 'tornado') {
      return '/svg/tornado.svg';
    }

    return isDay ? '/svg/not-available.svg' : '/svg/not-available.svg';
  };

  return (
    <div className="bg-base-100 rounded-3xl shadow-2xl p-6 md:p-8">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-2">{name}, {country}</h2>
          <p className="text-xl capitalize flex items-center gap-2 opacity-90">
            <img
              src={getAnimatedIconSrc()}
              alt={description}
              className="w-8 h-8"
            />
            {description}
          </p>
        </div>
        <button
          onClick={addToFavorites}
          className="btn btn-warning btn-circle shadow-lg transition"
          title="Ajouter aux favoris"
        >
          <span className="material-symbols-outlined text-3xl">star</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-6 md:py-8 bg-base-200 rounded-3xl mb-6">
        <img
          src={getAnimatedIconSrc()}
          alt={description}
          className="w-40 h-40 drop-shadow-2xl"
        />
        <div>
          <div className="text-5xl sm:text-6xl md:text-8xl font-black text-center md:text-left">
            {temperature}°{unit === 'metric' ? 'C' : 'F'}
          </div>
          <p className="text-xl md:text-2xl opacity-75 mt-2 text-center md:text-left">Température actuelle</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-base-200 rounded-2xl p-6 text-center">
          <img
            src="/svg/humidity.svg"
            alt="Humidité"
            className="w-12 h-12 mx-auto mb-2"
          />
          <div className="text-sm opacity-80">Humidité</div>
          <div className="text-3xl font-bold">{humidity}%</div>
        </div>

        <div className="bg-base-200 rounded-2xl p-6 text-center">
          <img
            src="/svg/wind.svg"
            alt="Vent"
            className="w-12 h-12 mx-auto mb-2"
          />
          <div className="text-sm opacity-80">Vent</div>
          <div className="text-3xl font-bold">{windSpeed}</div>
          <div className="text-xs opacity-70">{unit === 'metric' ? 'km/h' : 'mph'}</div>
        </div>

        <div className="bg-base-200 rounded-2xl p-6 text-center">
          <img
            src="/svg/thermometer-mercury.svg"
            alt="Température ressentie"
            className="w-12 h-12 mx-auto mb-2"
          />
          <div className="text-sm opacity-80">Ressentie</div>
          <div className="text-3xl font-bold">{Math.round(main.feels_like)}°</div>
        </div>

        <div className="bg-base-200 rounded-2xl p-6 text-center">
          <img
            src="/svg/barometer.svg"
            alt="Pression atmosphérique"
            className="w-12 h-12 mx-auto mb-2"
          />
          <div className="text-sm opacity-80">Pression</div>
          <div className="text-2xl font-bold">{main.pressure}</div>
          <div className="text-xs opacity-70">hPa</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-base-200 rounded-2xl p-6 text-center">
          <img
            src="/svg/thermometer-colder.svg"
            alt="Température minimale"
            className="w-12 h-12 mx-auto mb-2"
          />
          <h3 className="text-lg font-bold">Température Min</h3>
          <p className="text-4xl font-bold">{Math.round(main.temp_min)}°{unit === 'metric' ? 'C' : 'F'}</p>
        </div>
        <div className="bg-base-200 rounded-2xl p-6 text-center">
          <img
            src="/svg/thermometer-warmer.svg"
            alt="Température maximale"
            className="w-12 h-12 mx-auto mb-2"
          />
          <h3 className="text-lg font-bold">Température Max</h3>
          <p className="text-4xl font-bold">{Math.round(main.temp_max)}°{unit === 'metric' ? 'C' : 'F'}</p>
        </div>
      </div>

      {forecast.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">calendar_month</span>
            Prévisions sur 5 jours
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {forecast.map((day) => {
              const range = maxTemp !== null && minTemp !== null ? maxTemp - minTemp : 0;
              const ratio = range === 0 ? 0.5 : (day.temp - minTemp) / range;
              const height = 30 + ratio * 70;

              const dayIconSrc = getAnimatedIconSrcForForecast(day);

              return (
                <div
                  key={day.date}
                  className="bg-base-200 rounded-2xl p-4 flex flex-col items-center justify-between"
                >
                  <div className="text-sm opacity-70 mb-2">
                    {new Date(day.date).toLocaleDateString('fr-FR', {
                      weekday: 'short',
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </div>
                  <img
                    src={dayIconSrc}
                    alt={day.description || 'Prévisions météo'}
                    className="w-10 h-10 mb-1"
                  />
                  <div className="mt-1 text-2xl font-bold">
                    {Math.round(day.temp)}°{unit === 'metric' ? 'C' : 'F'}
                  </div>
                  <div className="mt-3 h-20 flex items-end justify-center w-full">
                    <div
                      className="w-3 rounded-full bg-primary"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col md:flex-row flex-wrap gap-3 justify-between items-start md:items-center">
        <div className="flex items-center gap-2 text-sm opacity-80">
          <span className="material-symbols-outlined text-base">share</span>
          <span>Partager cette météo :</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-xs btn-outline"
            onClick={() => {
              const url = window.location.href;
              const text = `Météo à ${name} : ${temperature}°${unit === 'metric' ? 'C' : 'F'}`;
              const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
              window.open(shareUrl, '_blank', 'noopener,noreferrer');
            }}
          >
            X / Twitter
          </button>
          <button
            type="button"
            className="btn btn-xs btn-outline"
            onClick={() => {
              const url = window.location.href;
              const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
              window.open(shareUrl, '_blank', 'noopener,noreferrer');
            }}
          >
            Facebook
          </button>
          <button
            type="button"
            className="btn btn-xs btn-outline"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href);
                Swal.fire({
                  icon: 'success',
                  title: 'Lien copié',
                  text: 'Le lien de la météo a été copié dans le presse-papiers.',
                  timer: 2000,
                  showConfirmButton: false,
                });
              } catch {
                Swal.fire({
                  icon: 'error',
                  title: 'Erreur',
                  text: 'Impossible de copier le lien.',
                });
              }
            }}
          >
            Copier le lien
          </button>
        </div>
      </div>
    </div>
  );
};

export default Weather;
