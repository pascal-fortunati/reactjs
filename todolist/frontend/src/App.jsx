import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import AuthPage from './components/AuthPage';
import TodoApp from './components/TodoApp';
import { authApi } from './api/authApi';

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
  };

  useEffect(() => {
    const handle = () => logout();
    window.addEventListener('auth:logout', handle);
    return () => window.removeEventListener('auth:logout', handle);
  }, []);

  const handleAuth = ({ token: nextToken, user: nextUser }) => {
    localStorage.setItem('token', nextToken);
    localStorage.setItem('user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  useEffect(() => {
    if (!token) return;
    if (user?.id) return;

    (async () => {
      try {
        const me = await authApi.me();
        localStorage.setItem('user', JSON.stringify(me));
        setUser(me);
      } catch (err) {
        logout();
        Swal.fire({
          icon: 'error',
          title: 'Session expirée',
          text: err?.message || 'Veuillez vous reconnecter',
        });
      }
    })();
  }, [token, user?.id]);

  if (!token) return <AuthPage onAuth={handleAuth} />;
  return <TodoApp user={user} onLogout={logout} />;
}

export default App;