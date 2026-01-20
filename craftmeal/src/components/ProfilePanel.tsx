import { useState } from "react";
import type { MealSummary } from "../services/mealApi";

type ProfilePanelProps = {
  isOpen: boolean;
  currentUser: {
    id: string;
    username: string;
    avatarUrl: string;
    completedRecipes: string[];
  } | null;
  completedMeals: MealSummary[];
  favoriteMeals: MealSummary[];
  onClose: () => void;
  onRegister: (username: string, password: string) => Promise<void>;
  onLogin: (username: string, password: string) => Promise<void>;
  onLogout: () => void;
  onChangeAvatar: (avatarUrl: string) => void;
  onOpenFavorites: () => void;
  onOpenCompleted: () => void;
};

const AVATARS = [
  "https://api.dicebear.com/9.x/thumbs/svg?seed=zelda",
  "https://api.dicebear.com/9.x/thumbs/svg?seed=link",
  "https://api.dicebear.com/9.x/thumbs/svg?seed=kokiri",
  "https://api.dicebear.com/9.x/thumbs/svg?seed=goron",
  "https://api.dicebear.com/9.x/thumbs/svg?seed=rito",
];

export function ProfilePanel(props: ProfilePanelProps) {
  const {
    isOpen,
    currentUser,
    completedMeals,
    favoriteMeals,
    onClose,
    onRegister,
    onLogin,
    onLogout,
    onChangeAvatar,
    onOpenFavorites,
    onOpenCompleted,
  } = props;

  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [avatarInput, setAvatarInput] = useState(currentUser?.avatarUrl || "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleSubmitAuth(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!username.trim() || !password.trim()) {
      setError("Pseudo et mot de passe sont requis.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (mode === "register") {
        await onRegister(username.trim(), password.trim());
      } else {
        await onLogin(username.trim(), password.trim());
      }
      setUsername("");
      setPassword("");
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Erreur d'authentification.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSelectAvatar(url: string) {
    setAvatarInput(url);
    onChangeAvatar(url);
  }

  function handleApplyAvatar() {
    if (!avatarInput.trim()) return;
    onChangeAvatar(avatarInput.trim());
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-end bg-black/40">
      <div className="w-full max-w-md h-full bg-[#181818] border-l border-zinc-800 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-black/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold text-sm">
              P
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-zinc-400">
                {currentUser ? currentUser.username : "Invité"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-700 transition-colors"
          >
            <span className="material-icons text-sm">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <section className="bg-black/40 rounded-2xl border border-zinc-800 p-3 flex items-center gap-3">
            <div className="relative">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-amber-400 bg-zinc-900 flex items-center justify-center">
                {currentUser?.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-amber-300">
                    {currentUser?.username?.[0]?.toUpperCase() || "?"}
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1 text-sm text-slate-200">
              <p className="font-semibold">
                {currentUser ? currentUser.username : "Invité"}
              </p>
              <p className="text-xs text-zinc-400">
                {completedMeals.length} recette
                {completedMeals.length > 1 ? "s" : ""} réussie
                {completedMeals.length > 1 ? "s" : ""}
              </p>
            </div>
          </section>

          {!currentUser && (
            <section className="bg-black/40 rounded-2xl border border-zinc-800 p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-100">
                  Connexion / Inscription
                </h3>
                <div className="inline-flex text-[11px] bg-zinc-900 rounded-full border border-zinc-700">
                  <button
                    type="button"
                    className={`px-3 py-1 rounded-full ${
                      mode === "login"
                        ? "bg-[#E50914] text-white"
                        : "text-zinc-300"
                    }`}
                    onClick={() => setMode("login")}
                  >
                    Connexion
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1 rounded-full ${
                      mode === "register"
                        ? "bg-[#E50914] text-white"
                        : "text-zinc-300"
                    }`}
                    onClick={() => setMode("register")}
                  >
                    Inscription
                  </button>
                </div>
              </div>

              <form className="space-y-2" onSubmit={handleSubmitAuth}>
                <input
                  type="text"
                  placeholder="Pseudo"
                  className="w-full px-3 py-1.5 bg-black border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Mot de passe"
                  className="w-full px-3 py-1.5 bg-black border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {error && (
                  <p className="text-xs text-red-400 mt-1">{error}</p>
                )}
                <div className="flex items-center justify-between mt-1">
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#E50914] hover:bg-[#f6121d] text-white text-xs font-semibold rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {mode === "register" ? "S'inscrire" : "Se connecter"}
                  </button>
                </div>
              </form>
            </section>
          )}

          <section className="bg-black/40 rounded-2xl border border-zinc-800 p-3">
            <h3 className="text-sm font-semibold text-slate-100 mb-2">
              Avatar
            </h3>
            <div className="flex gap-2 mb-2">
              {AVATARS.map((url) => {
                const active = currentUser?.avatarUrl === url;
                return (
                  <button
                    key={url}
                    type="button"
                    className={`w-10 h-10 rounded-full overflow-hidden border ${
                      active
                        ? "border-amber-400 ring-2 ring-amber-400/70"
                        : "border-zinc-700"
                    }`}
                    onClick={() => handleSelectAvatar(url)}
                  >
                    <img
                      src={url}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="URL d'avatar personnalisée"
                className="flex-1 px-3 py-1.5 bg-black border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500"
                value={avatarInput}
                onChange={(e) => setAvatarInput(e.target.value)}
              />
              <button
                type="button"
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg"
                onClick={handleApplyAvatar}
              >
                Appliquer
              </button>
            </div>
          </section>

          <section className="bg-black/40 rounded-2xl border border-zinc-800 p-3">
            <h3 className="text-sm font-semibold text-slate-100 mb-2">
              Dernières Recettes favorites
            </h3>
            {favoriteMeals.length === 0 && (
              <p className="text-xs text-zinc-400">
                Aucune recette favorite pour le moment.
              </p>
            )}
            {favoriteMeals.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {favoriteMeals.slice(-3).map((meal) => (
                  <button
                    key={meal.idMeal}
                    type="button"
                    onClick={onOpenFavorites}
                    className="bg-[#181818] rounded-xl border border-zinc-700 overflow-hidden text-[11px] text-slate-100 text-left hover:border-amber-400 hover:-translate-y-0.5 transition-transform cursor-pointer"
                  >
                    <div className="h-14 overflow-hidden">
                      <img
                        src={meal.strMealThumb}
                        alt={meal.strMeal}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="px-2 py-1 line-clamp-2">
                      {meal.strMeal}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="bg-black/40 rounded-2xl border border-zinc-800 p-3">
            <h3 className="text-sm font-semibold text-slate-100 mb-2">
              Dernières Recettes réussies
            </h3>
            {completedMeals.length === 0 && (
              <p className="text-xs text-zinc-400">
                Aucune recette réussie pour le moment.
              </p>
            )}
            {completedMeals.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {completedMeals.slice(-3).map((meal) => (
                  <button
                    key={meal.idMeal}
                    type="button"
                    onClick={onOpenCompleted}
                    className="bg-[#181818] rounded-xl border border-zinc-700 overflow-hidden text-[11px] text-slate-100 text-left hover:border-amber-400 hover:-translate-y-0.5 transition-transform cursor-pointer"
                  >
                    <div className="h-14 overflow-hidden">
                      <img
                        src={meal.strMealThumb}
                        alt={meal.strMeal}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="px-2 py-1 line-clamp-2">
                      {meal.strMeal}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
