import { useEffect, useId, useRef, useState } from 'react';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import PriorityHighOutlinedIcon from '@mui/icons-material/PriorityHighOutlined';
import Swal from 'sweetalert2';

function TodoForm({ onAjouter }) {
  const [inputValue, setInputValue] = useState('');
  const [categorie, setCategorie] = useState('Personnel');
  const [dateLimite, setDateLimite] = useState('');
  const calendarRef = useRef(null);
  const calendarPopoverRef = useRef(null);
  const callyBaseId = useId().replace(/:/g, '');
  const buttonId = `cally-${callyBaseId}`;
  const popoverId = `cally-popover-${callyBaseId}`;
  const anchorName = `--${buttonId}`;

  useEffect(() => {
    const calendar = calendarRef.current;
    if (!calendar) return;

    const handleChange = (e) => {
      const nextValue = e?.target?.value;
      if (typeof nextValue === 'string') {
        setDateLimite(nextValue);
      }
      calendarPopoverRef.current?.hidePopover?.();
    };

    calendar.addEventListener('change', handleChange);
    return () => calendar.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const calendar = calendarRef.current;
    if (!calendar) return;
    calendar.value = dateLimite || '';
  }, [dateLimite]);

  const handleSubmit = async (e) => {
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
    
    const ok = await onAjouter(inputValue, categorie, dateLimite);
    if (ok) {
      setInputValue('');
      setDateLimite('');
    }
  };
  
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
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ajouter une nouvelle tâche..."
                  className="input flex-1"
                />
              </div>
              
              <div className="flex gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <div className="text-primary">
                    {getCategorieIcon()}
                  </div>
                  <select
                    value={categorie}
                    onChange={(e) => setCategorie(e.target.value)}
                    className="select flex-1"
                  >
                    <option value="Personnel">Personnel</option>
                    <option value="Travail">Travail</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                
                <button
                  type="button"
                  id={buttonId}
                  popoverTarget={popoverId}
                  style={{ anchorName }}
                  className="input input-bordered flex-1 text-left"
                >
                  {dateLimite ? new Date(dateLimite).toLocaleDateString('fr-FR') : <span className="opacity-60">Sélectionner une date</span>}
                </button>
                
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

          <div
            ref={calendarPopoverRef}
            popover="auto"
            id={popoverId}
            className="dropdown bg-base-100 rounded-box shadow-lg"
            style={{ positionAnchor: anchorName }}
          >
            <calendar-date ref={calendarRef} className="cally">
              <svg aria-label="Previous" className="fill-current size-4" slot="previous" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M15.75 19.5 8.25 12l7.5-7.5"></path>
              </svg>
              <svg aria-label="Next" className="fill-current size-4" slot="next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
              </svg>
              <calendar-month></calendar-month>
            </calendar-date>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TodoForm;