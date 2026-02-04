import TodoItem from './TodoItem';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

function TodoList({ todos, onToggle, onSupprimer, onEditer, onDragStart, onDragOver, onDrop, onDragEnd, draggedItem }) {
  if (todos.length === 0) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body py-16">
          <div className="flex flex-col items-center justify-center text-base-content opacity-40">
            <InboxOutlinedIcon sx={{ fontSize: 80 }} className="mb-4" />
            <p className="text-xl font-medium">Aucune tâche pour le moment</p>
            <p className="text-sm mt-2">Ajoutez-en une pour commencer !</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onSupprimer={onSupprimer}
          onEditer={onEditer}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onDragEnd={onDragEnd}
          isDragging={draggedItem?.id === todo.id}
        />
      ))}
    </div>
  );
}

export default TodoList;
