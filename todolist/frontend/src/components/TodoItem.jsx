import { useState } from 'react';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import PriorityHighOutlinedIcon from '@mui/icons-material/PriorityHighOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import Swal from 'sweetalert2';

function TodoItem({ todo, onToggle, onSupprimer, onEditer, onDragStart, onDragOver, onDrop, isDragging }) {
  const [edition, setEdition] = useState(false);
  const [texteEdition, setTexteEdition] = useState(todo.text);

  const handleSubmitEdition = async (e) => {
    e.preventDefault();
    if (texteEdition.trim() !== '') {
      const ok = await onEditer(todo.id, texteEdition);
      if (ok) {
        setEdition(false);

        Swal.fire({
          icon: 'success',
          title: 'Tâche modifiée !',
          timer: 1500,
          showConfirmButton: false,
          position: 'top-end',
          toast: true
        });
      }
    }
  };

  const annulerEdition = () => {
    setTexteEdition(todo.text);
    setEdition(false);
  };

  const handleSupprimer = async () => {
    const result = await Swal.fire({
      title: 'Supprimer cette tâche ?',
      text: todo.text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      const ok = await onSupprimer(todo.id);
      if (ok) {
        Swal.fire({
          icon: 'success',
          title: 'Supprimé !',
          timer: 1500,
          showConfirmButton: false,
          position: 'top-end',
          toast: true
        });
      }
    }
  };
  
  // Vérifier si la tâche est en  retard
  const isEnRetard = () => {
    if (!todo.dateLimite || todo.completed) return false;
    const dateActuelle = new Date();
    const dateLim = new Date(todo.dateLimite);
    return dateActuelle > dateLim;
  };
  
  // Obtenir les classes CSS pour la catégorie
  const getCategorieClasses = () => {
    switch (todo.categorie) {
      case 'Travail':
        return 'badge-info';
      case 'Urgent':
        return 'badge-error';
      default:
        return 'badge-success badge-sm';
    }
  };
  
  // Icône de catégorie
  const getCategorieIcon = () => {
    switch (todo.categorie) {
      case 'Travail':
        return <WorkOutlineIcon fontSize="small" />;
      case 'Urgent':
        return <PriorityHighOutlinedIcon fontSize="small" />;
      default:
        return <PersonOutlineIcon fontSize="small" />;
    }
  };

  return (
    <div 
      draggable={!edition}
      onDragStart={() => onDragStart(todo)}
      onDragOver={onDragOver}
      onDrop={() => onDrop(todo)}
      className={`card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 mb-3 cursor-move ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
    >
      <div className="card-body p-5">
        <div className="flex items-center gap-4">
          <div className="text-base-content opacity-40 hover:opacity-70 cursor-grab active:cursor-grabbing">
            <DragIndicatorIcon />
          </div>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
            className="checkbox checkbox-success checkbox-lg"
          />
          
          {edition ? (
            <form onSubmit={handleSubmitEdition} className="flex-1 flex gap-2">
              <input
                type="text"
                value={texteEdition}
                onChange={(e) => setTexteEdition(e.target.value)}
                autoFocus
                className="input input-bordered input-primary flex-1"
              />
              <button 
                type="submit"
                className="btn btn-success btn-sm"
              >
                <CheckOutlinedIcon fontSize="small" />
              </button>
              <button 
                type="button"
                onClick={annulerEdition}
                className="btn btn-ghost btn-sm"
              >
                <CloseOutlinedIcon fontSize="small" />
              </button>
            </form>
          ) : (
            <>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span 
                    className={`text-lg ${
                      todo.completed 
                        ? 'line-through opacity-40' 
                        : isEnRetard() ? 'font-bold text-error' : 'font-medium'
                    }`}
                  >
                    {todo.text}
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  {todo.categorie && (
                    <span className={`badge ${getCategorieClasses()} gap-1`}>
                      {getCategorieIcon()}
                      {todo.categorie}
                    </span>
                  )}
                  {todo.dateLimite && (
                    <span className={`text-sm flex items-center gap-1 ${
                      isEnRetard() ? 'text-error font-bold' : 'opacity-60'
                    }`}>
                      <EventOutlinedIcon fontSize="small" />
                      {new Date(todo.dateLimite).toLocaleDateString('fr-FR')}
                      {isEnRetard() && ' (En retard!)'}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEdition(true)}
                  className="btn btn-info btn-sm gap-1"
                >
                  <EditOutlinedIcon fontSize="small" />
                  Éditer
                </button>
                <button
                  onClick={handleSupprimer}
                  className="btn btn-error btn-sm gap-1"
                >
                  <DeleteOutlineIcon fontSize="small" />
                  Supprimer
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TodoItem;