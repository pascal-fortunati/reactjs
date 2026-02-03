// Fonction de normalisation d'une tâche
// Assure que les champs sont valides et standardisés
export function normalizeTodo(todo) {
  const completed = Boolean(todo?.completed);
  const categorie =
    typeof todo?.categorie === 'string' && todo.categorie.trim() !== ''
      ? todo.categorie
      : 'Personnel';

  let dateLimite = todo?.dateLimite;
  if (dateLimite instanceof Date) {
    dateLimite = dateLimite.toISOString().slice(0, 10);
  } else if (typeof dateLimite === 'string') {
    dateLimite = dateLimite.trim();
    if (dateLimite.includes('T')) dateLimite = dateLimite.slice(0, 10);
  } else {
    dateLimite = '';
  }

  if (typeof dateLimite !== 'string' || dateLimite === 'null') dateLimite = '';

  return {
    ...todo,
    completed,
    categorie,
    dateLimite,
  };
}