import Swal from 'sweetalert2';

const Favorites = ({ favorites, onSelectCity, onRemoveFavorite }) => {

  const removeFromFavorites = (cityToRemove) => {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Voulez-vous retirer ${cityToRemove} de vos favoris ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        if (onRemoveFavorite) {
          onRemoveFavorite(cityToRemove);
        }

        Swal.fire({
          icon: 'success',
          title: 'Supprimé !',
          text: `${cityToRemove} a été retiré des favoris.`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  return (
    <div className="bg-base-100 rounded-3xl p-6 shadow-xl border border-base-300">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-3xl">star</span>
        Favoris
      </h2>
      {favorites.length === 0 ? (
        <p className="text-base-content/70">Aucun favori pour le moment</p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto mt-4">
          {favorites.map((city, index) => (
            <div key={index} className="flex items-center justify-between bg-base-200 rounded-xl p-3">
              <button
                onClick={() => onSelectCity(city)}
                className="text-base-content hover:text-warning transition flex-1 text-left font-semibold"
              >
                {city}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromFavorites(city);
                }}
                className="text-error/80 hover:text-error"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
