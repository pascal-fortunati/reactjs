import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { todosApi } from '../api/todosApi';
import { normalizeTodo } from '../utils/normalizeTodo';

// Hook personnalisé pour gérer les tâches
// Gère la récupération, l'ajout, la modification et la suppression de tâches
export function useTodos() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await todosApi.list();
        if (cancelled) return;
        setTodos(Array.isArray(data) ? data.map(normalizeTodo) : []);
      } catch (err) {
        if (cancelled) return;
        if (err?.status === 401) return;
        Swal.fire({
          icon: 'error',
          title: 'Impossible de charger les tâches',
          text: err?.message || 'Erreur',
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Fonction pour ajouter une nouvelle tâche
  const ajouterTodo = async (text, categorie, dateLimite) => {
    try {
      const payload = {
        text,
        categorie,
        dateLimite: dateLimite && String(dateLimite).trim() !== '' ? dateLimite : null,
        completed: false,
      };

      const created = await todosApi.create(payload);
      const todo = normalizeTodo(created);
      setTodos((prev) => [todo, ...prev]);

      Swal.fire({
        icon: 'success',
        title: 'Tâche ajoutée !',
        text,
        timer: 2000,
        showConfirmButton: false,
        position: 'top-end',
        toast: true,
      });

      return true;
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Ajout impossible',
        text: err?.message || 'Erreur',
      });
      return false;
    }
  };

  // Fonction pour basculer l'état de complétion d'une tâche
  const toggleTodo = async (id) => {
    const current = todos.find((t) => t.id === id);
    if (!current) return;

    const nextCompleted = !current.completed;
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: nextCompleted } : t)));

    try {
      const updated = await todosApi.update(id, { completed: nextCompleted });
      setTodos((prev) => prev.map((t) => (t.id === id ? normalizeTodo(updated) : t)));
    } catch (err) {
      setTodos((prev) => prev.map((t) => (t.id === id ? current : t)));
      Swal.fire({
        icon: 'error',
        title: 'Mise à jour impossible',
        text: err?.message || 'Erreur',
      });
    }
  };

  // Fonction de suppression d'une tâche
  // Met à jour l'état local et supprime la tâche de l'API
  const supprimerTodo = async (id) => {
    const current = todos;
    setTodos((prev) => prev.filter((t) => t.id !== id));

    try {
      await todosApi.remove(id);
      return true;
    } catch (err) {
      setTodos(current);
      Swal.fire({
        icon: 'error',
        title: 'Suppression impossible',
        text: err?.message || 'Erreur',
      });
      return false;
    }
  };

  // Fonction d'édition d'une tâche
  // Met à jour l'état local et met à jour la tâche dans l'API
  const editerTodo = async (id, nouveauTexte) => {
    const texte = typeof nouveauTexte === 'string' ? nouveauTexte.trim() : '';
    if (!texte) return false;

    const previous = todos;
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, text: texte } : t)));

    try {
      const updated = await todosApi.update(id, { text: texte });
      setTodos((prev) => prev.map((t) => (t.id === id ? normalizeTodo(updated) : t)));
      return true;
    } catch (err) {
      setTodos(previous);
      Swal.fire({
        icon: 'error',
        title: 'Édition impossible',
        text: err?.message || 'Erreur',
      });
      return false;
    }
  };

  // Fonction pour supprimer toutes les tâches sélectionnées
  const supprimerTous = async (ids) => {
    const safeIds = Array.isArray(ids) ? ids.filter(Boolean) : [];
    if (safeIds.length === 0) return true;

    const current = todos;
    const idsSet = new Set(safeIds);
    setTodos((prev) => prev.filter((t) => !idsSet.has(t.id)));

    try {
      await Promise.all(safeIds.map((id) => todosApi.remove(id)));
      return true;
    } catch (err) {
      setTodos(current);
      Swal.fire({
        icon: 'error',
        title: 'Suppression impossible',
        text: err?.message || 'Erreur',
      });
      return false;
    }
  };

  return {
    todos,
    setTodos,
    ajouterTodo,
    toggleTodo,
    supprimerTodo,
    editerTodo,
    supprimerTous,
  };
}
