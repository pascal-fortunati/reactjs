import { useState, useEffect } from 'react';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import CloseIcon from '@mui/icons-material/Close';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import Swal from 'sweetalert2';

function App() {
  const [todos, setTodos] = useState(() => {
    const savedTodos = localStorage.getItem('todos');
    return savedTodos ? JSON.parse(savedTodos) : [];
  });
  
  const [filtre, setFiltre] = useState('tous');
  const [draggedItem, setDraggedItem] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recherche, setRecherche] = useState('');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // Sauvegarde des todos dans localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // Appliquer le thème
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Ajout d'une nouvelle tâche
  const ajouterTodo = (text, categorie, dateLimite) => {
    const nouveauTodo = {
      id: Date.now(),
      text: text,
      completed: false,
      categorie: categorie,
      dateLimite: dateLimite
    };
    setTodos([...todos, nouveauTodo]);
    
    Swal.fire({
      icon: 'success',
      title: 'Tâche ajoutée !',
      text: text,
      timer: 2000,
      showConfirmButton: false,
      position: 'top-end',
      toast: true
    });
  };

  // Basculement de l'état d'une tâche
  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  // Suppression d'une tâche
  const supprimerTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  // Édition d'une tâche
  const editerTodo = (id, nouveauTexte) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, text: nouveauTexte } : todo
    ));
  };

  // Suppression de toutes les tâches
  const toutSupprimer = async () => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Voulez-vous vraiment supprimer toutes les tâches ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, tout supprimer !',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      setTodos([]);
      Swal.fire({
        icon: 'success',
        title: 'Supprimé !',
        text: 'Toutes les tâches ont été supprimées.',
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  // Gestion du drag and drop
  const handleDragStart = (todo) => {
    setDraggedItem(todo);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (targetTodo) => {
    if (!draggedItem || draggedItem.id === targetTodo.id) return;

    const draggedIndex = todos.findIndex(todo => todo.id === draggedItem.id);
    const targetIndex = todos.findIndex(todo => todo.id === targetTodo.id);

    const newTodos = [...todos];
    newTodos.splice(draggedIndex, 1);
    newTodos.splice(targetIndex, 0, draggedItem);

    setTodos(newTodos);
    setDraggedItem(null);
  };

  // Gestion de la sidebar des thèmes
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

  // Statistiques
  const totalTaches = todos.length;
  const tachesTerminees = todos.filter(todo => todo.completed).length;
  const tachesRestantes = totalTaches - tachesTerminees;

  // Filtrage des tâches
  const getTodosFiltres = () => {
    let resultats = todos;
    
    // Filtre par statut
    switch (filtre) {
      case 'actives':
        resultats = resultats.filter(todo => !todo.completed);
        break;
      case 'terminees':
        resultats = resultats.filter(todo => todo.completed);
        break;
    }
    
    // Filtre par recherche
    if (recherche.trim() !== '') {
      resultats = resultats.filter(todo =>
        todo.text.toLowerCase().includes(recherche.toLowerCase()) ||
        (todo.categorie && todo.categorie.toLowerCase().includes(recherche.toLowerCase()))
      );
    }
    
    return resultats;
  };

  const todosFiltres = getTodosFiltres();

  return (
    <div className="min-h-screen bg-base-200 py-8 px-4">
      {/* Bouton flottant pour ouvrir la sidebar */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="btn btn-circle btn-primary fixed right-6 top-6 shadow-xl z-40"
        aria-label="Changer le thème"
      >
        <PaletteOutlinedIcon />
      </button>

      {/* Sidebar des thèmes */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        {/* Overlay */}
        <div 
          className="absolute inset-0 backdrop-blur-[2px]"
          onClick={() => setSidebarOpen(false)}
        />
        
        {/* Sidebar */}
        <div className={`absolute right-0 top-0 h-full w-80 bg-base-100 shadow-2xl transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">Thèmes</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <CloseIcon />
              </button>
            </div>
            
            {/* Liste des thèmes */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
              <div className="grid grid-cols-1 gap-2">
                {themes.map((themeName) => (
                  <button
                    key={themeName}
                    onClick={() => handleThemeChange(themeName)}
                    data-theme={themeName}
                    className={`btn btn-outline justify-start gap-3 h-auto py-3 ${
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
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-extrabold text-primary mb-3">
            Ma Todolist
          </h1>
          <p className="text-base-content opacity-70 text-lg">Gérez vos tâches avec style</p>
        </div>
        
        {/* Formulaire */}
        <div className="mb-8">
          <TodoForm onAjouter={ajouterTodo} />
        </div>
        
        {/* Barre de recherche */}
        {totalTaches > 0 && (
          <div className="mb-6">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-base-content opacity-40">
                <SearchOutlinedIcon />
              </span>
              <input
                type="text"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher une tâche..."
                className="input input-bordered w-full pl-12 mr-2"
              />
            </div>
          </div>
        )}
        
        {/* Statistiques */}
        {totalTaches > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="stats shadow-lg bg-base-100">
              <div className="stat">
                <div className="stat-figure text-primary">
                  <AssessmentOutlinedIcon sx={{ fontSize: 40 }} />
                </div>
                <div className="stat-title">Total</div>
                <div className="stat-value text-primary">{totalTaches}</div>
              </div>
            </div>
            
            <div className="stats shadow-lg bg-base-100">
              <div className="stat">
                <div className="stat-figure text-success">
                  <CheckCircleOutlineIcon sx={{ fontSize: 40 }} />
                </div>
                <div className="stat-title">Terminées</div>
                <div className="stat-value text-success">{tachesTerminees}</div>
              </div>
            </div>
            
            <div className="stats shadow-lg bg-base-100">
              <div className="stat">
                <div className="stat-figure text-warning">
                  <HourglassEmptyOutlinedIcon sx={{ fontSize: 40 }} />
                </div>
                <div className="stat-title">Restantes</div>
                <div className="stat-value text-warning">{tachesRestantes}</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Filtres */}
        {totalTaches > 0 && (
          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => setFiltre('tous')}
              className={`btn btn-sm ${
                filtre === 'tous' 
                  ? 'btn-primary' 
                  : 'btn-ghost'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFiltre('actives')}
              className={`btn btn-sm ${
                filtre === 'actives' 
                  ? 'btn-info' 
                  : 'btn-ghost'
              }`}
            >
              Actives ({tachesRestantes})
            </button>
            <button
              onClick={() => setFiltre('terminees')}
              className={`btn btn-sm ${
                filtre === 'terminees' 
                  ? 'btn-success' 
                  : 'btn-ghost'
              }`}
            >
              Terminées ({tachesTerminees})
            </button>
          </div>
        )}
        
        {/* Liste */}
        <TodoList 
          todos={todosFiltres}
          onToggle={toggleTodo}
          onSupprimer={supprimerTodo}
          onEditer={editerTodo}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          draggedItem={draggedItem}
        />
        
        {/* Bouton Tout supprimer */}
        {totalTaches > 0 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={toutSupprimer}
              className="btn btn-error btn-outline gap-2"
            >
              <DeleteSweepOutlinedIcon />
              Tout supprimer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;