import { useEffect, useState } from 'react';
import TodoForm from './TodoForm';
import TodoList from './TodoList';
import Swal from 'sweetalert2';
import { useTodos } from '../hooks/useTodos';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import FormatListBulletedOutlinedIcon from '@mui/icons-material/FormatListBulletedOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';

// Composant principal de l'application de tâches
function TodoApp({ user, onLogout }) {
  const { todos, setTodos, ajouterTodo, toggleTodo, supprimerTodo, editerTodo, supprimerTous } = useTodos();

  const [filtre, setFiltre] = useState('tous');
  const [draggedItem, setDraggedItem] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recherche, setRecherche] = useState('');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toutSupprimer = async () => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Voulez-vous vraiment supprimer toutes les tâches actives ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      const ids = todos.filter((t) => !t.completed).map((t) => t.id);
      const ok = await supprimerTous(ids);
      if (ok) {
        Swal.fire({
          icon: 'success',
          title: 'Supprimé !',
          text: 'Toutes les tâches actives ont été supprimées.',
          timer: 2000,
          showConfirmButton: false,
          position: 'top-end',
          toast: true,
        });
      }
    }
  };

  const handleDragStart = (todo) => {
    setDraggedItem(todo);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (targetTodo) => {
    if (!draggedItem) return;
    if (!targetTodo || draggedItem.id === targetTodo.id) {
      setDraggedItem(null);
      return;
    }

    const draggedIndex = todos.findIndex(todo => todo.id === draggedItem.id);
    const targetIndex = todos.findIndex(todo => todo.id === targetTodo.id);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      return;
    }

    const newTodos = [...todos];
    newTodos.splice(draggedIndex, 1);
    newTodos.splice(targetIndex, 0, draggedItem);

    setTodos(newTodos);
    setDraggedItem(null);
  };

  const themes = [
    'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate',
    'synthwave', 'retro', 'cyberpunk', 'valentine', 'halloween', 'garden',
    'forest', 'aqua', 'lofi', 'pastel', 'fantasy', 'wireframe',
    'black', 'luxury', 'dracula', 'cmyk', 'autumn', 'business',
    'acid', 'lemonade', 'night', 'coffee', 'winter', 'dim', 'nord', 'sunset'
  ];

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setSidebarOpen(false);
  };

  const totalTaches = todos.length;
  const tachesTerminees = todos.filter(todo => todo.completed).length;
  const tachesRestantes = totalTaches - tachesTerminees;

  const getTodosFiltres = () => {
    let resultats = todos;

    switch (filtre) {
      case 'actives':
        resultats = resultats.filter(todo => !todo.completed);
        break;
      case 'terminees':
        resultats = resultats.filter(todo => todo.completed);
        break;
    }

    if (recherche.trim() !== '') {
      resultats = resultats.filter(todo =>
        todo.text.toLowerCase().includes(recherche.toLowerCase()) ||
        (todo.categorie && todo.categorie.toLowerCase().includes(recherche.toLowerCase()))
      );
    }

    return resultats;
  };

  const todosFiltres = getTodosFiltres();
  const pourcentageComplete = totalTaches > 0 ? Math.round((tachesTerminees / totalTaches) * 100) : 0;

  return (
    <div className="drawer drawer-end min-h-screen">
      <input
        type="checkbox"
        className="drawer-toggle"
        checked={sidebarOpen}
        onChange={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="drawer-content min-h-screen bg-gradient-to-br from-base-200 via-base-300 to-base-200">
        {/* Navbar */}
        <div className="navbar bg-base-100 shadow-lg sticky top-0 z-30 relative">
          <div className="navbar-start flex-none">
            <div className="flex items-center gap-3">
              <div className="avatar avatar-placeholder">
                <div className="bg-primary text-primary-content rounded-full w-10">
                  <span className="text-lg">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="font-bold text-base">
                  Bonjour, {user?.firstName || user?.email?.split('@')[0] || 'Utilisateur'}
                </span>
                <span className="text-xs opacity-60">{user?.email}</span>
              </div>
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 w-full px-3 flex justify-center pointer-events-none">
            <div className="w-[calc(100vw-11rem)] max-w-2xl pointer-events-auto">
              <label className="input input-lg flex items-center gap-2 shadow-md w-full">
                <SearchOutlinedIcon className="opacity-70" fontSize="small" />
                <input
                  type="text"
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  placeholder="Rechercher une tâche..."
                  className="grow"
                />
                {recherche && (
                  <button
                    type="button"
                    onClick={() => setRecherche('')}
                    className="btn btn-ghost btn-xs btn-circle"
                    aria-label="Effacer la recherche"
                  >
                    <CloseOutlinedIcon sx={{ fontSize: 16 }} />
                  </button>
                )}
              </label>
            </div>
          </div>

          <div className="navbar-end gap-2">
            <button
              onClick={onLogout}
              className="btn btn-ghost gap-2"
            >
              <LogoutOutlinedIcon fontSize="small" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>

            <button
              onClick={() => setSidebarOpen(true)}
              className="btn btn-ghost btn-circle"
              aria-label="Changer le thème"
            >
              <PaletteOutlinedIcon fontSize="small" />
            </button>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="py-8 px-4">
          <div className="max-w-5xl mx-auto">
            {/* Header avec logo */}
            <div className="text-center mb-8">
              <img
                src="/l_todolist.png"
                alt="Logo To-Do-List"
                className="mx-auto mb-4 w-32 sm:w-36 md:w-40 drop-shadow-lg"
              />
            </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="card bg-gradient-to-br from-primary to-primary-focus text-primary-content shadow-xl">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80">Total</p>
                    <h2 className="card-title text-4xl font-bold">{totalTaches}</h2>
                  </div>
                  <div className="text-5xl opacity-30">
                    <FormatListBulletedOutlinedIcon sx={{ fontSize: 64 }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-success to-success-focus text-success-content shadow-xl">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80">Terminées</p>
                    <h2 className="card-title text-4xl font-bold">{tachesTerminees}</h2>
                  </div>
                  <div className="text-5xl opacity-30">
                    <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 64 }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-warning to-warning-focus text-warning-content shadow-xl">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80">Restantes</p>
                    <h2 className="card-title text-4xl font-bold">{tachesRestantes}</h2>
                  </div>
                  <div className="text-5xl opacity-30">
                    <ScheduleOutlinedIcon sx={{ fontSize: 64 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire d'ajout */}
          <div className="mb-8">
            <TodoForm onAjouter={ajouterTodo} />
          </div>

          {/* Statistiques avec progression */}
          {totalTaches > 0 && (
            <>
              {/* Barre de progression globale */}
              <div className="card bg-base-100 shadow-xl mb-6">
                <div className="card-body">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Progression globale</h3>
                    <span className="text-2xl font-bold text-primary">{pourcentageComplete}%</span>
                  </div>
                  <progress 
                    className="progress progress-primary w-full" 
                    value={pourcentageComplete} 
                    max="100"
                  ></progress>
                  <p className="text-sm opacity-60 mt-2">
                    {tachesTerminees} sur {totalTaches} tâche{totalTaches > 1 ? 's' : ''} terminée{tachesTerminees > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Filtres avec tabs */}
              <div className="flex justify-center mb-6">
                <div className="tabs tabs-box bg-base-100 shadow-md">
                  <button
                    onClick={() => setFiltre('tous')}
                    className={`tab tab-lg ${filtre === 'tous' ? 'tab-active' : ''}`}
                  >
                    <ViewListOutlinedIcon className="mr-2" sx={{ fontSize: 16 }} />
                    Toutes
                  </button>
                  <button
                    onClick={() => setFiltre('actives')}
                    className={`tab tab-lg ${filtre === 'actives' ? 'tab-active' : ''}`}
                  >
                    <ScheduleOutlinedIcon className="mr-2" sx={{ fontSize: 16 }} />
                    Actives
                    <div className="badge badge-info badge-sm ml-2">{tachesRestantes}</div>
                  </button>
                  <button
                    onClick={() => setFiltre('terminees')}
                    className={`tab tab-lg ${filtre === 'terminees' ? 'tab-active' : ''}`}
                  >
                    <TaskAltOutlinedIcon className="mr-2" sx={{ fontSize: 16 }} />
                    Terminées
                    <div className="badge badge-success badge-sm ml-2">{tachesTerminees}</div>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Liste des tâches */}
          <TodoList
            todos={todosFiltres}
            onToggle={toggleTodo}
            onSupprimer={supprimerTodo}
            onEditer={editerTodo}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            draggedItem={draggedItem}
          />

          {/* Message si recherche vide */}
          {totalTaches > 0 && todosFiltres.length === 0 && (
            <div className="alert alert-warning shadow-lg mt-4">
              <WarningAmberOutlinedIcon className="shrink-0" sx={{ fontSize: 24 }} />
              <span>Aucune tâche ne correspond à votre recherche ou filtre.</span>
            </div>
          )}

          {/* Bouton supprimer toutes les actives */}
          {tachesRestantes > 0 && (
            <div className="flex justify-center mt-8">
              <button
                onClick={toutSupprimer}
                className="btn btn-error btn-outline gap-2"
              >
                <DeleteSweepOutlinedIcon fontSize="small" />
                Supprimer toutes les tâches actives
              </button>
            </div>
          )}
          </div>
        </div>

        <footer className="footer sm:footer-horizontal footer-center bg-base-300 text-base-content p-4">
          <aside>
            <p>Copyright © {new Date().getFullYear()} - Tous droits réservés à To-do-List</p>
          </aside>
        </footer>
      </div>

      <div className="drawer-side z-50">
        <label className="drawer-overlay" onClick={() => setSidebarOpen(false)}></label>
        <div className="menu p-4 w-80 min-h-full bg-base-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <PaletteOutlinedIcon fontSize="medium" />
              Thèmes
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <CloseOutlinedIcon fontSize="small" />
            </button>
          </div>

          <div className="divider mt-0"></div>

          <div className="grid grid-cols-1 gap-2 overflow-y-auto">
            {themes.map((themeName) => (
              <button
                key={themeName}
                onClick={() => handleThemeChange(themeName)}
                data-theme={themeName}
                className={`btn btn-outline justify-start gap-3 ${
                  theme === themeName ? 'btn-active' : ''
                }`}
              >
                <div className="flex gap-1">
                  <div className="w-4 h-4 rounded bg-primary" />
                  <div className="w-4 h-4 rounded bg-secondary" />
                  <div className="w-4 h-4 rounded bg-accent" />
                </div>
                <span className="capitalize">{themeName}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TodoApp;