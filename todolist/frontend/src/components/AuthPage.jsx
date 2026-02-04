import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { authApi } from '../api/authApi';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Composant d'authentification amélioré
function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isRegister = mode === 'register';

  const canSubmit = useMemo(() => {
    const base = email.trim() !== '' && password !== '';
    if (!base) return false;
    if (!isRegister) return true;
    return confirmPassword !== '' && password === confirmPassword;
  }, [email, password, confirmPassword, isRegister]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const emailClean = email.trim().toLowerCase();
    const isLocalhostEmail = /^[^\s@]+@localhost$/.test(emailClean);
    const isStandardEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean);
    if (!isStandardEmail && !isLocalhostEmail) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Email invalide',
        toast: true,
        position: 'top-end',
        timer: 3000,
        showConfirmButton: false
      });
      return;
    }

    if (password.length < 8) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Mot de passe trop court', 
        text: 'Minimum 8 caractères',
        toast: true,
        position: 'top-end',
        timer: 3000,
        showConfirmButton: false
      });
      return;
    }

    if (isRegister && password !== confirmPassword) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Confirmation incorrecte',
        toast: true,
        position: 'top-end',
        timer: 3000,
        showConfirmButton: false
      });
      return;
    }

    setLoading(true);
    try {
      const payload = isRegister
        ? {
            email: emailClean,
            password,
            firstName: firstName.trim() || null,
            lastName: lastName.trim() || null,
          }
        : { email: emailClean, password };

      const data = isRegister ? await authApi.register(payload) : await authApi.login(payload);
      const token = data?.token;
      const user = data?.user;
      if (!token || !user) {
        throw new Error('Réponse serveur invalide');
      }

      Swal.fire({
        icon: 'success',
        title: isRegister ? 'Compte créé avec succès' : 'Connexion réussie',
        timer: 1500,
        showConfirmButton: false,
        position: 'top-end',
        toast: true,
      });

      onAuth({ token, user });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: err?.message || 'Une erreur est survenue',
        toast: true,
        position: 'top-end',
        timer: 3000,
        showConfirmButton: false
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('user@localhost');
    setPassword('user123456');
    setMode('login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-300 to-base-200 flex items-center justify-center px-4 py-8">
      <div className="card bg-base-100 shadow-xl w-full max-w-4xl border border-base-300 overflow-hidden">
        <div className="grid lg:grid-cols-2">
          <div className="bg-base-200/60 p-8 flex flex-col items-center justify-center text-center gap-4">
            <img
              src="/l_todolist.png"
              alt="Logo To-Do-List"
              className="w-52 sm:w-60 md:w-72 drop-shadow-lg"
            />
            <div className="max-w-sm">
              <p className="mt-2 text-sm opacity-70">
                Organisez vos tâches, suivez vos progrès.
              </p>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-6 text-center lg:text-left">
              <h2 className="text-2xl font-bold">
                {isRegister ? 'Créer un compte' : 'Bienvenue'}
              </h2>
              <p className="text-sm opacity-60 mt-1">
                {isRegister ? 'Rejoignez-nous dès maintenant' : 'Connectez-vous à votre compte'}
              </p>
            </div>

            <div className="tabs tabs-box mb-6 bg-base-200 w-full">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`tab tab-lg flex-1 ${mode === 'login' ? 'tab-active' : ''}`}
              >
                <LoginOutlinedIcon className="mr-2" fontSize="small" />
                Connexion
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`tab tab-lg flex-1 ${mode === 'register' ? 'tab-active' : ''}`}
              >
                <PersonAddAltOutlinedIcon className="mr-2" fontSize="small" />
                Inscription
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Prénom</span>
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jean"
                      className="input w-full"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Nom</span>
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Dupont"
                      className="input w-full"
                    />
                  </div>
                </div>
              )}

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <label className="input w-full flex items-center gap-2">
                  <MailOutlineOutlinedIcon className="opacity-70" fontSize="small" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@email.com"
                    className="grow"
                    autoComplete="email"
                  />
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Mot de passe</span>
                </label>
                <label className="input w-full flex items-center gap-2">
                  <KeyOutlinedIcon className="opacity-70" fontSize="small" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="grow"
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="btn btn-ghost btn-xs btn-circle"
                  >
                    {showPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                  </button>
                </label>
              </div>

              {isRegister && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Confirmer le mot de passe</span>
                  </label>
                  <label className="input w-full flex items-center gap-2">
                    <KeyOutlinedIcon className="opacity-70" fontSize="small" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="grow"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="btn btn-ghost btn-xs btn-circle"
                    >
                      {showConfirmPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                    </button>
                  </label>
                  {confirmPassword && password !== confirmPassword && (
                    <label className="label">
                      <span className="label-text-alt text-error">Les mots de passe ne correspondent pas</span>
                    </label>
                  )}
                </div>
              )}

              {isRegister && password && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text-alt">Force du mot de passe</span>
                  </label>
                  <progress 
                    className={`progress ${
                      password.length < 8 ? 'progress-error' :
                      password.length < 12 ? 'progress-warning' :
                      'progress-success'
                    } w-full`}
                    value={Math.min(password.length, 16)} 
                    max="16"
                  ></progress>
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit || loading}
                className="btn btn-primary w-full mt-6"
              >
                {loading && <span className="loading loading-spinner"></span>}
                {!loading && (
                  isRegister ? (
                    <>
                      <PersonAddAltOutlinedIcon fontSize="small" />
                      Créer mon compte
                    </>
                  ) : (
                    <>
                      <LoginOutlinedIcon fontSize="small" />
                      Se connecter
                    </>
                  )
                )}
              </button>
            </form>

            <div className="divider text-xs opacity-50">OU</div>

            <div className="alert alert-info">
              <InfoOutlinedIcon className="shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold text-sm">Compte de démonstration</h3>
                <div className="text-xs mt-1 opacity-80">
                  <div>Email: <code className="px-1 py-0.5 rounded">user@localhost</code></div>
                  <div>Mot de passe: <code className="px-1 py-0.5 rounded">user123456</code></div>
                </div>
              </div>
              <button 
                type="button" 
                onClick={handleDemoLogin}
                className="btn btn-sm btn-ghost"
              >
                Utiliser
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
