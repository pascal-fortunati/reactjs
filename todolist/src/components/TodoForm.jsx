import { useState } from 'react';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import PriorityHighOutlinedIcon from '@mui/icons-material/PriorityHighOutlined';
import Swal from 'sweetalert2';

function TodoForm({ onAjouter }) {
  const [inputValue, setInputValue] = useState('');
  const [categorie, setCategorie] = useState('Personnel');
  const [dateLimite, setDateLimite] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (inputValue.trim() === '') {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Veuillez entrer une tâche',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    onAjouter(inputValue, categorie, dateLimite);
    setInputValue('');
    setDateLimite('');
  };
  
  // Icône de catégorie
  const getCategorieIcon = () => {
    switch (categorie) {
      case 'Travail':
        return <WorkOutlineIcon />;
      case 'Urgent':
        return <PriorityHighOutlinedIcon />;
      default:
        return <PersonOutlineIcon />;
    }
  };

  return (
    <div className="w-full">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-6">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-3">
              {/* Ligne 1 : Texte de la tâche */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ajouter une nouvelle tâche..."
                  className="input input-bordered flex-1"
                />
              </div>
              
              {/* Ligne 2 : Catégorie et Date limite */}
              <div className="flex gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <div className="text-primary">
                    {getCategorieIcon()}
                  </div>
                  <select
                    value={categorie}
                    onChange={(e) => setCategorie(e.target.value)}
                    className="select select-bordered flex-1"
                  >
                    <option value="Personnel">Personnel</option>
                    <option value="Travail">Travail</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                
                <input
                  type="date"
                  value={dateLimite}
                  onChange={(e) => setDateLimite(e.target.value)}
                  className="input input-bordered flex-1"
                />
                
                <button 
                  type="submit"
                  className="btn btn-primary gap-2"
                >
                  <AddCircleOutlineIcon />
                  Ajouter
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TodoForm;