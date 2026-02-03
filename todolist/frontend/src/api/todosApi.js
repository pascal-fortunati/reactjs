import { apiRequest } from './apiRequest';

// Objet todosApi pour gérer les opérations sur les tâches
export const todosApi = {
  // Récupère la liste de toutes les tâches
  list() {
    return apiRequest('/api/todos', { method: 'GET' });
  },
  // Crée une nouvelle tâche
  create(payload) {
    return apiRequest('/api/todos', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  // Met à jour une tâche existante
  update(id, payload) {
    return apiRequest(`/api/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  // Supprime une tâche
  remove(id) {
    return apiRequest(`/api/todos/${id}`, { method: 'DELETE' });
  },
};