import { useEffect, useMemo, useState } from "react";
import {
  getAllMeals,
  getMealById,
  type MealDetails,
  type MealSummary,
} from "./services/mealApi";
import {
  translateInstructionsEnToFr,
  translateValuesEnToFr,
} from "./services/translationApi";
import { RecipesSection } from "./components/RecipesSection";
import { IngredientsColumn } from "./components/IngredientsColumn";
import { CauldronColumn } from "./components/CauldronColumn";
import { ResultColumn } from "./components/ResultColumn";
import { ProfilePanel } from "./components/ProfilePanel";
import { RecipesSuccess } from "./components/RecipesSuccess";
type RecipeIngredient = {
  name: string;
  measure: string;
};
type User = {
  id: string;
  username: string;
  avatarUrl: string;
  completedRecipes: string[];
  favoriteRecipes: string[];
};
const SESSION_KEY = "snackflixCurrentUser";
const COUNTRIES = [
  "American",
  "British",
  "Canadian",
  "Chinese",
  "Dutch",
  "French",
  "Greek",
  "Indian",
  "Italian",
  "Japanese",
  "Mexican",
  "Spanish",
  "Thai",
  "Tunisian",
  "Turkish",
];
const COUNTRY_FLAGS: Record<string, string> = {
  American: "us",
  British: "gb",
  Canadian: "ca",
  Chinese: "cn",
  Dutch: "nl",
  French: "fr",
  Greek: "gr",
  Indian: "in",
  Italian: "it",
  Japanese: "jp",
  Mexican: "mx",
  Spanish: "es",
  Thai: "th",
  Tunisian: "tn",
  Turkish: "tr",
};
function getIngredientsFromMeal(meal: MealDetails | null): RecipeIngredient[] {
  if (!meal) return [];
  const ingredients: RecipeIngredient[] = [];
  for (let i = 1; i <= 20; i += 1) {
    const name = (meal[`strIngredient${i}`] || "").trim();
    const measure = (meal[`strMeasure${i}`] || "").trim();
    if (!name) continue;
    ingredients.push({ name, measure });
  }
  return ingredients;
}
export function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [currentRecipe, setCurrentRecipe] = useState<MealDetails | null>(null);
  const [cauldronIngredients, setCauldronIngredients] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isHoveringCauldron, setIsHoveringCauldron] = useState(false);
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedRecipes, setCompletedRecipes] = useState<string[]>([]);
  const [isInstructionsSidebarOpen, setIsInstructionsSidebarOpen] =
    useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allMealsForTags, setAllMealsForTags] = useState<MealDetails[] | null>(
    null,
  );
  const [translatedInstructions, setTranslatedInstructions] = useState<
    string | null
  >(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [ingredientTranslations, setIngredientTranslations] = useState<
    Record<string, string>
  >({});
  const [ingredientTranslationError, setIngredientTranslationError] = useState<
    string | null
  >(null);
  const [measureTranslations, setMeasureTranslations] = useState<
    Record<string, string>
  >({});
  const [mealTitleTranslations, setMealTitleTranslations] = useState<
    Record<string, string>
  >({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<"main" | "success" | "favorites">("main");
  const [completedRecipeForView, setCompletedRecipeForView] =
    useState<MealDetails | null>(null);
  function setCurrentUserWithSession(user: User | null) {
    setCurrentUser(user);
    try {
      if (!user) {
        window.localStorage.removeItem(SESSION_KEY);
      } else {
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      }
    } catch {}
  }
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return;
      const id = (parsed as any).id;
      const username = (parsed as any).username;
      if (typeof id !== "string" || typeof username !== "string") return;
      const avatarUrl = typeof (parsed as any).avatarUrl === "string"
        ? (parsed as any).avatarUrl
        : "";
      const completedRecipes = Array.isArray(
        (parsed as any).completedRecipes,
      )
        ? (parsed as any).completedRecipes
        : [];
      const favoriteRecipes = Array.isArray(
        (parsed as any).favoriteRecipes,
      )
        ? (parsed as any).favoriteRecipes
        : [];
      setCurrentUser({
        id,
        username,
        avatarUrl,
        completedRecipes,
        favoriteRecipes,
      });
    } catch {}
  }, []);
  useEffect(() => {
    setTranslatedInstructions(null);
    setTranslationError(null);
    if (!currentRecipe) return;
    const frRaw = (currentRecipe["strInstructionsFR"] || "") as string;
    const enRaw = (currentRecipe["strInstructions"] || "") as string;
    const fr = frRaw.trim();
    const en = enRaw.trim();
    if (!fr && !en) return;
    if (fr) {
      setTranslatedInstructions(fr);
      return;
    }
    if (!en) return;
    setIsTranslating(true);
    translateInstructionsEnToFr(en)
      .then((translated) => {
        if (translated) {
          setTranslatedInstructions(translated);
        } else {
          setTranslationError(
            "Traduction indisponible, texte original affiché.",
          );
        }
      })
      .catch(() => {
        setTranslationError("Traduction indisponible, texte original affiché.");
      })
      .finally(() => {
        setIsTranslating(false);
      });
  }, [currentRecipe]);
  const recipeIngredients = useMemo(
    () => getIngredientsFromMeal(currentRecipe),
    [currentRecipe],
  );
  useEffect(() => {
    setIngredientTranslations({});
    setMeasureTranslations({});
    setIngredientTranslationError(null);
    if (!currentRecipe) return;
    const names = recipeIngredients
      .map((ingredient) => ingredient.name.trim())
      .filter((name) => name.length > 0);
    const measures = recipeIngredients
      .map((ingredient) => ingredient.measure.trim())
      .filter((measure) => measure.length > 0);
    const allToTranslate = Array.from(new Set([...names, ...measures]));
    if (!allToTranslate.length) return;
    translateValuesEnToFr(allToTranslate)
      .then((map) => {
        const nameMap: Record<string, string> = {};
        const measureMap: Record<string, string> = {};
        Object.entries(map).forEach(([original, value]) => {
          if (names.includes(original)) {
            nameMap[original] = value;
          }
          if (measures.includes(original)) {
            measureMap[original] = value;
          }
        });
        if (Object.keys(nameMap).length) {
          setIngredientTranslations(nameMap);
        }
        if (Object.keys(measureMap).length) {
          setMeasureTranslations(measureMap);
        }
        if (!Object.keys(nameMap).length && !Object.keys(measureMap).length) {
          setIngredientTranslationError(
            "Traduction des ingrédients indisponible.",
          );
        }
      })
      .catch(() => {
        setIngredientTranslationError(
          "Traduction des ingrédients indisponible.",
        );
      });
  }, [currentRecipe, recipeIngredients]);
  useEffect(() => {
    if (allMealsForTags) return;
    setIsLoadingMeals(true);
    setError(null);
    getAllMeals()
      .then((list) => {
        setAllMealsForTags(list);
      })
      .catch(() => {
        setError("Impossible de charger les recettes");
        setAllMealsForTags([]);
      })
      .finally(() => {
        setIsLoadingMeals(false);
      });
  }, [allMealsForTags]);
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCountry, selectedTag, searchTerm]);
  const completedCount = currentUser
    ? (currentUser.completedRecipes || []).length
    : completedRecipes.length;
  useEffect(() => {
    if (!isComplete || !currentRecipe) return;
    if (currentUser) {
      if (currentUser.completedRecipes?.includes(currentRecipe.idMeal)) return;
      const updatedUser: User = {
        ...currentUser,
        completedRecipes: [
          ...(currentUser.completedRecipes || []),
          currentRecipe.idMeal,
        ],
      };
      const updatedUsers = users.map((u) =>
        u.id === updatedUser.id ? updatedUser : u,
      );
      setUsers(updatedUsers);
      setCurrentUserWithSession(updatedUser);
      (async () => {
        try {
          await fetch("/api/profile/completed", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: updatedUser.id,
              recipeId: currentRecipe.idMeal,
            }),
          });
        } catch {}
      })();
    } else {
      if (completedRecipes.includes(currentRecipe.idMeal)) return;
      const updated = [...completedRecipes, currentRecipe.idMeal];
      setCompletedRecipes(updated);
    }
  }, [isComplete, currentRecipe, currentUser, users, completedRecipes]);
  function fetchRecipe(mealId: string) {
    setIsLoadingRecipe(true);
    setError(null);
    setCompletedRecipeForView(null);
    setCurrentRecipe(null);
    setCauldronIngredients([]);
    setIsComplete(false);
    getMealById(mealId)
      .then((meal) => {
        if (!meal) throw new Error("Recette introuvable");
        setCurrentRecipe(meal);
      })
      .catch(() => {
        setError("Impossible de charger cette recette");
      })
      .finally(() => {
        setIsLoadingRecipe(false);
      });
  }
  function handleAddIngredient(ingredientName: string) {
    if (!currentRecipe) return;
    const allowedNames = recipeIngredients.map((ingredient) => ingredient.name);
    if (!allowedNames.includes(ingredientName)) return;
    if (cauldronIngredients.includes(ingredientName)) return;
    setCauldronIngredients((prev) => {
      const next = [...prev, ingredientName];
      if (currentRecipe && recipeIngredients.length > 0) {
        const allIncluded = recipeIngredients.every((ingredient) =>
          next.includes(ingredient.name),
        );
        if (allIncluded) {
          setIsComplete(true);
          setCompletedRecipeForView(currentRecipe);
        }
      }
      return next;
    });
  }
  function handleClearCauldron() {
    setCauldronIngredients([]);
    setIsComplete(false);
  }
  function handleResetAll() {
    setCauldronIngredients([]);
    setIsComplete(false);
    setCurrentRecipe(null);
    setCompletedRecipeForView(null);
  }
  function handleNewRecipe() {
    const source = filteredMeals;
    if (!source.length) return;
    const random = source[Math.floor(Math.random() * source.length)];
    fetchRecipe(random.idMeal);
  }
  const availableTags = useMemo(() => {
    if (!allMealsForTags || !allMealsForTags.length) return [];
    const set = new Set<string>();
    allMealsForTags.forEach((meal) => {
      const raw = ((meal as any).strTags || "") as string;
      raw
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
        .forEach((tag) => set.add(tag));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allMealsForTags]);
  const filteredMeals = useMemo(() => {
    if (!allMealsForTags || !allMealsForTags.length) return [];
    const trimmed = searchTerm.trim().toLowerCase();
    const tag = selectedTag ? selectedTag.toLowerCase() : null;

    return allMealsForTags
      .filter((meal) => {
        if (!tag && selectedCountry && meal.strArea !== selectedCountry) {
          return false;
        }
        if (tag) {
          const raw = ((meal as any).strTags || "") as string;
          const tags = raw
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter((t) => t.length > 0);
          if (!tags.includes(tag)) {
            return false;
          }
        }
        if (trimmed) {
          const name = (meal.strMeal || "").toLowerCase();
          if (!name.includes(trimmed)) {
            return false;
          }
        }
        return true;
      })
      .map((meal) => ({
        idMeal: meal.idMeal,
        strMeal: meal.strMeal,
        strMealThumb: meal.strMealThumb,
        strTags: (meal as any).strTags as string | undefined,
      }));
  }, [allMealsForTags, selectedCountry, selectedTag, searchTerm]);
  const pageSize = 30;
  const pageCount = Math.max(1, Math.ceil(filteredMeals.length / pageSize));
  const safePage = Math.min(currentPage, pageCount);
  const paginatedMeals = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredMeals.slice(start, start + pageSize);
  }, [filteredMeals, safePage]);
  const completedIdsForUi = currentUser
    ? currentUser.completedRecipes || []
    : completedRecipes;
  const favoriteIdsForUi = currentUser
    ? currentUser.favoriteRecipes || []
    : [];
  const recipeForResult = completedRecipeForView || currentRecipe;
  const isResultComplete = !!completedRecipeForView;
  const isRecipeCompleted = recipeForResult
    ? completedIdsForUi.includes(recipeForResult.idMeal)
    : false;
  const instructionsText =
    translatedInstructions ||
    (currentRecipe
      ? (
          (currentRecipe["strInstructionsFR"] ||
            currentRecipe["strInstructions"] ||
            "") as string
        ).trim()
      : "");
  const instructionsIsFrench =
    !!translatedInstructions ||
    !!(currentRecipe && (currentRecipe["strInstructionsFR"] || "").trim());
  const currentUserCompletedMeals: MealSummary[] = useMemo(() => {
    if (!currentUser || !currentUser.completedRecipes || !allMealsForTags) {
      return [];
    }
    const ids = currentUser.completedRecipes;
    const byId = new Map(allMealsForTags.map((meal) => [meal.idMeal, meal]));
    return ids
      .map((id) => byId.get(id))
      .filter((meal): meal is MealDetails => !!meal)
      .map((meal) => ({
        idMeal: meal.idMeal,
        strMeal: meal.strMeal,
        strMealThumb: meal.strMealThumb,
      }));
  }, [currentUser, allMealsForTags]);
  const currentUserFavoriteMeals: MealSummary[] = useMemo(() => {
    if (!currentUser || !currentUser.favoriteRecipes || !allMealsForTags) {
      return [];
    }
    const ids = currentUser.favoriteRecipes;
    const byId = new Map(allMealsForTags.map((meal) => [meal.idMeal, meal]));
    return ids
      .map((id) => byId.get(id))
      .filter((meal): meal is MealDetails => !!meal)
      .map((meal) => ({
        idMeal: meal.idMeal,
        strMeal: meal.strMeal,
        strMealThumb: meal.strMealThumb,
      }));
  }, [currentUser, allMealsForTags]);

  function handleToggleFavorite(mealId: string) {
    if (!currentUser) return;
    const currentList = currentUser.favoriteRecipes || [];
    const exists = currentList.includes(mealId);
    const nextList = exists
      ? currentList.filter((id) => id !== mealId)
      : [...currentList, mealId];
    const updatedUser: User = {
      ...currentUser,
      favoriteRecipes: nextList,
    };
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setCurrentUserWithSession(updatedUser);
    (async () => {
      try {
        await fetch("/api/profile/favorites", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: updatedUser.id,
            recipeId: mealId,
          }),
        });
      } catch {}
    })();
  }
  useEffect(() => {
    const titles: string[] = [];
    filteredMeals.forEach((meal) => {
      if (meal.strMeal) titles.push(meal.strMeal.trim());
    });
    if (currentRecipe && currentRecipe.strMeal) {
      titles.push(currentRecipe.strMeal.trim());
    }
    const uniqueTitles = Array.from(
      new Set(titles.filter((t) => t.length > 0)),
    );
    if (!uniqueTitles.length) return;
    const maxLen = 480;
    translateValuesEnToFr(uniqueTitles)
      .then((map) => {
        if (Object.keys(map).length) {
          setMealTitleTranslations(map);
        }
      })
      .catch(() => {});
  }, [filteredMeals, currentRecipe]);
  return (
    <div className="min-h-screen bg-[#141414] text-slate-100">
      <header className="bg-black border-b border-red-700/60">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/img/l-snackflix.png"
                  alt="SnackFlix"
                  className="h-20 w-auto drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]"
                />
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  SnackFlix
                </h1>
              </div>
              <div className="flex items-center justify-start sm:justify-end gap-3">
                <div className="flex flex-wrap gap-1 overflow-x-auto max-w-65 sm:max-w-none">
                  {COUNTRIES.map((country) => {
                    const code = COUNTRY_FLAGS[country];
                    const active = selectedCountry === country;
                    return (
                      <button
                        key={country}
                        type="button"
                        onClick={() =>
                          setSelectedCountry((prev) =>
                            prev === country ? null : country,
                          )
                        }
                        className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors cursor-pointer ${
                          active
                            ? "bg-[#E50914] border-red-500"
                            : "bg-black/60 border-zinc-700"
                        }`}
                        title={country}
                      >
                        {code ? (
                          <img
                            src={`https://flagcdn.com/24x18/${code}.png`}
                            alt={country}
                            className="w-5 h-4 object-cover rounded-[3px]"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-xs text-zinc-200">
                            {country.slice(0, 2)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {!currentUser && (
                  <button
                    type="button"
                    className="flex items-center gap-2 px-2 py-1 rounded-full bg-black/60 border border-zinc-700 text-[11px] text-zinc-300 hover:text-white hover:border-zinc-400 transition-colors cursor-pointer"
                    onClick={() => setIsProfileOpen(true)}
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                      <span className="material-icons text-[18px] text-zinc-300">
                        account_circle
                      </span>
                    </div>
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-[10px] uppercase tracking-wide text-zinc-400">
                        Invité
                      </span>
                      <span className="text-xs font-medium text-zinc-100">
                        Se connecter
                      </span>
                    </div>
                  </button>
                )}
                {currentUser && (
                  <div className="relative">
                    <button
                      type="button"
                      className="flex items-center gap-2 px-2 py-1 rounded-full bg-black/60 border border-zinc-700 text-[11px] text-zinc-300 hover:text-white hover:border-zinc-400 transition-colors cursor-pointer"
                      onClick={() => setIsUserMenuOpen((prev) => !prev)}
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                        {currentUser.avatarUrl ? (
                          <img
                            src={currentUser.avatarUrl}
                            alt={currentUser.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="material-icons text-[18px] text-zinc-300">
                            account_circle
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col items-start leading-tight">
                        <span className="text-[10px] uppercase tracking-wide text-zinc-400">
                          Profil
                        </span>
                        <span className="text-xs font-medium text-zinc-100">
                          {currentUser.username}
                        </span>
                      </div>
                      <span className="material-icons text-[16px] text-zinc-400">
                        arrow_drop_down
                      </span>
                    </button>
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-44 bg-[#181818] border border-zinc-800 rounded-lg shadow-xl py-1 text-xs text-zinc-100 z-30">
                        <button
                          type="button"
                          className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-zinc-800 cursor-pointer"
                          onClick={() => {
                            setIsProfileOpen(true);
                            setIsUserMenuOpen(false);
                          }}
                        >
                          <span className="material-icons text-[16px]">account_circle</span>
                          <span>Voir le profil</span>
                        </button>
                        <button
                          type="button"
                          className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-zinc-800 cursor-pointer"
                          onClick={() => {
                            setActiveView("success");
                            setIsUserMenuOpen(false);
                          }}
                        >
                          <span className="material-icons text-[16px]">emoji_events</span>
                          <span>Recettes réussies</span>
                        </button>
                        <button
                          type="button"
                          className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-zinc-800 cursor-pointer"
                          onClick={() => {
                            setActiveView("favorites");
                            setIsUserMenuOpen(false);
                          }}
                        >
                          <span className="material-icons text-[16px]">star</span>
                          <span>Recettes favorites</span>
                        </button>
                        <button
                          type="button"
                          className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-300 hover:bg-zinc-800 cursor-pointer"
                          onClick={() => {
                            setCurrentUserWithSession(null);
                            setIsUserMenuOpen(false);
                          }}
                        >
                          <span className="material-icons text-[16px]">logout</span>
                          <span>Se déconnecter</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="w-full">
              <div className="bg-[#181818] rounded-xl p-2 border border-zinc-800 relative">
                <input
                  type="text"
                  className="w-full px-3 py-1.5 bg-black border border-zinc-700 rounded-lg text-sm placeholder:text-zinc-500 text-zinc-100"
                  placeholder="Rechercher une recette (nom, mot-clé)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                {isSearchFocused && searchTerm.trim() && filteredMeals.length > 0 && (
                  <div className="absolute left-2 right-2 mt-1 max-h-64 overflow-y-auto bg-black border border-zinc-700 rounded-lg shadow-xl z-30">
                    {filteredMeals.slice(0, 8).map((meal) => (
                      <button
                        key={meal.idMeal}
                        type="button"
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-zinc-100 hover:bg-zinc-800 border-b border-zinc-800 last:border-b-0 cursor-pointer"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          fetchRecipe(meal.idMeal);
                          setIsSearchFocused(false);
                        }}
                      >
                        <img
                          src={meal.strMealThumb}
                          alt={meal.strMeal}
                          className="w-8 h-8 rounded-md object-cover shrink-0"
                        />
                        <span className="flex-1 truncate">
                          {mealTitleTranslations[meal.strMeal.trim()] ||
                            meal.strMeal}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      {activeView === "main" && (
        <>
          <main className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-6">
            <IngredientsColumn
              currentRecipe={currentRecipe}
              ingredients={recipeIngredients}
              cauldronIngredients={cauldronIngredients}
              ingredientTranslations={ingredientTranslations}
              measureTranslations={measureTranslations}
              ingredientTranslationError={ingredientTranslationError}
              onDragStartIngredient={(name, e) => {
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", name);
                e.dataTransfer.setData("ingredient", name);
              }}
            />

            <CauldronColumn
              cauldronIngredients={cauldronIngredients}
              ingredientTranslations={ingredientTranslations}
              isComplete={isComplete}
              isHoveringCauldron={isHoveringCauldron}
              totalIngredients={recipeIngredients.length}
              onDropIngredient={handleAddIngredient}
              onHoverChange={setIsHoveringCauldron}
              onClearCauldron={handleClearCauldron}
              onNewRecipe={handleNewRecipe}
              onResetAll={handleResetAll}
              canNewRecipe={!!filteredMeals.length}
            />

            <ResultColumn
              currentRecipe={recipeForResult}
              isComplete={isResultComplete}
              isRecipeCompleted={isRecipeCompleted}
              mealTitleTranslations={mealTitleTranslations}
            />
          </main>

          <RecipesSection
            error={error}
            isLoadingMeals={isLoadingMeals}
            availableTags={availableTags}
            selectedTag={selectedTag}
            onTagChange={(tag) => {
              setSelectedTag(tag);
              if (tag) {
                setSelectedCountry(null);
                setSearchTerm("");
              }
            }}
            filteredMeals={filteredMeals}
            paginatedMeals={paginatedMeals}
            currentRecipeId={currentRecipe ? currentRecipe.idMeal : null}
            completedRecipes={completedIdsForUi}
            favoriteRecipes={favoriteIdsForUi}
            mealTitleTranslations={mealTitleTranslations}
            safePage={safePage}
            pageCount={pageCount}
            onPageChange={setCurrentPage}
            onSelectMeal={fetchRecipe}
            onToggleFavorite={handleToggleFavorite}
          />
        </>
      )}

      {activeView === "success" && (
        <RecipesSuccess
          title="Recettes réussies"
          emptyMessage="Tu n'as pas encore réussi de recette. Lance-toi dans le chaudron !"
          meals={currentUserCompletedMeals}
          onBack={() => setActiveView("main")}
        />
      )}

      {activeView === "favorites" && (
        <RecipesSuccess
          title="Recettes favorites"
          emptyMessage="Tu n'as pas encore de recettes favorites. Ajoute-en depuis la liste principale."
          meals={currentUserFavoriteMeals}
          onBack={() => setActiveView("main")}
        />
      )}

      <ProfilePanel
        isOpen={isProfileOpen}
        currentUser={currentUser}
        completedMeals={currentUserCompletedMeals}
        favoriteMeals={currentUserFavoriteMeals}
        onClose={() => setIsProfileOpen(false)}
        onRegister={async (username, password) => {
          const response = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          });
          if (!response.ok) {
            let message = "Erreur d'inscription";
            try {
              const data = (await response.json()) as { error?: string };
              if (data && data.error) {
                message = data.error;
              }
            } catch {}
            throw new Error(message);
          }
          const created = (await response.json()) as User;
          setUsers((prev) => {
            const filtered = prev.filter((u) => u.id !== created.id);
            return [...filtered, created];
          });
          setCurrentUserWithSession(created);
        }}
        onLogin={async (username, password) => {
          const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          });
          if (!response.ok) {
            let message = "Erreur de connexion";
            try {
              const data = (await response.json()) as { error?: string };
              if (data && data.error) {
                message = data.error;
              }
            } catch {}
            throw new Error(message);
          }
          const loggedIn = (await response.json()) as User;
          setUsers((prev) => {
            const filtered = prev.filter((u) => u.id !== loggedIn.id);
            return [...filtered, loggedIn];
          });
          setCurrentUserWithSession(loggedIn);
        }}
        onLogout={() => {
          setCurrentUserWithSession(null);
        }}
        onChangeAvatar={(avatarUrl) => {
          if (!currentUser) return;
          const localUser: User = { ...currentUser, avatarUrl };
          setUsers((prev) =>
            prev.map((u) => (u.id === localUser.id ? localUser : u)),
          );
          setCurrentUserWithSession(localUser);
          (async () => {
            try {
              const response = await fetch("/api/profile/avatar", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId: localUser.id,
                  avatarUrl,
                }),
              });
              if (!response.ok) return;
              const updated = (await response.json()) as User;
              setUsers((prev) =>
                prev.map((u) => (u.id === updated.id ? updated : u)),
              );
              setCurrentUserWithSession(updated);
            } catch {}
          })();
        }}
        onOpenFavorites={() => {
          setActiveView("favorites");
          setIsProfileOpen(false);
        }}
        onOpenCompleted={() => {
          setActiveView("success");
          setIsProfileOpen(false);
        }}
      />


      <button
        type="button"
        onClick={() => setIsInstructionsSidebarOpen(true)}
        disabled={!instructionsText}
        className="fixed top-1/2 right-4 -translate-y-1/2 z-40 inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#181818] border border-zinc-700 text-zinc-200 hover:bg-[#E50914] hover:border-red-500 hover:text-white shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        title="Afficher les instructions de la recette"
      >
        <span className="material-icons text-base">menu_book</span>
      </button>

      {isInstructionsSidebarOpen && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <button
            type="button"
            className="flex-1 bg-black/40"
            onClick={() => setIsInstructionsSidebarOpen(false)}
          />
          <aside className="w-120 max-w-full h-full bg-[#181818] border-l border-zinc-800 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-black/60">
              <div className="flex items-center gap-2">
                <span className="material-icons text-red-400 text-base">
                  menu_book
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-100">
                    Instructions
                  </span>
                  {instructionsText && (
                    <span className="text-[11px] uppercase tracking-wide text-zinc-400">
                      {instructionsIsFrench ? "FR" : "EN"}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsInstructionsSidebarOpen(false)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-700 transition-colors"
                aria-label="Fermer les instructions"
              >
                <span className="material-icons text-sm">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {!currentRecipe && (
                <p className="text-sm text-zinc-300 bg-black/40 p-4 rounded-2xl border border-zinc-800">
                  Choisis une recette pour voir ses instructions.
                </p>
              )}

              {currentRecipe && !instructionsText && (
                <p className="text-sm text-zinc-300 bg-black/40 p-4 rounded-2xl border border-zinc-800">
                  Aucune instruction disponible pour cette recette.
                </p>
              )}

              {currentRecipe && instructionsText && (
                <div className="bg-black/40 border border-zinc-700 rounded-2xl p-4 text-sm text-zinc-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">
                      {instructionsIsFrench
                        ? "Instructions (FR)"
                        : "Instructions (EN)"}
                    </h3>
                    {isTranslating && (
                      <span className="text-xs text-zinc-400">Traduction...</span>
                    )}
                  </div>
                  {translationError && (
                    <p className="text-xs text-red-300 mb-2">{translationError}</p>
                  )}
                  <ol className="mt-1 space-y-3 text-sm leading-relaxed list-decimal list-inside">
                    {instructionsText
                      .split(/\n+/)
                      .map((part) => part.trim())
                      .filter((part) => part.length > 0)
                      .map((part, index) => (
                        <li key={index}>{part}</li>
                      ))}
                  </ol>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
