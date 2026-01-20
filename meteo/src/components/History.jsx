import Swal from 'sweetalert2';

const History = ({ history, onSelectCity, onRemoveCity }) => {

  return (
    <div className="bg-base-100 rounded-3xl p-6 shadow-xl border border-base-300">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-3xl">history</span>
        Historique
      </h2>
      {history.length === 0 ? (
        <p className="text-base-content/70">Aucune recherche récente</p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto mt-4">
          {history.map((city, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-base-200 rounded-xl p-3"
            >
              <button
                type="button"
                onClick={() => onSelectCity(city)}
                className="text-base-content hover:text-primary transition flex-1 text-left font-semibold"
              >
                {city}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!onRemoveCity) return;

                  Swal.fire({
                    title: 'Êtes-vous sûr ?',
                    text: `Voulez-vous retirer ${city} de l'historique ?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3b82f6',
                    cancelButtonColor: '#ef4444',
                    confirmButtonText: 'Oui, supprimer',
                    cancelButtonText: 'Annuler',
                  }).then((result) => {
                    if (result.isConfirmed) {
                      onRemoveCity(city);
                      Swal.fire({
                        icon: 'success',
                        title: 'Supprimé !',
                        text: `${city} a été retiré de l'historique.`,
                        timer: 2000,
                        showConfirmButton: false,
                      });
                    }
                  });
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

export default History;
