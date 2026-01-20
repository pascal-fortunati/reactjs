import { type MealSummary } from "../services/mealApi";

type RecipesSectionProps = {
  error: string | null;
  isLoadingMeals: boolean;
  availableTags: string[];
  selectedTag: string | null;
  onTagChange: (tag: string | null) => void;
  filteredMeals: MealSummary[];
  paginatedMeals: MealSummary[];
  currentRecipeId: string | null;
  completedRecipes: string[];
  favoriteRecipes: string[];
  mealTitleTranslations: Record<string, string>;
  safePage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  onSelectMeal: (idMeal: string) => void;
  onToggleFavorite: (idMeal: string) => void;
};

export function RecipesSection(props: RecipesSectionProps) {
  const {
    error,
    isLoadingMeals,
    availableTags,
    selectedTag,
    onTagChange,
    filteredMeals,
    paginatedMeals,
    currentRecipeId,
    completedRecipes,
    favoriteRecipes,
    mealTitleTranslations,
    safePage,
    pageCount,
    onPageChange,
    onSelectMeal,
    onToggleFavorite,
  } = props;

  const handlePrev = () => {
    onPageChange(Math.max(1, safePage - 1));
  };

  const handleNext = () => {
    onPageChange(Math.min(pageCount, safePage + 1));
  };

  return (
    <section className="max-w-7xl mx-auto px-4 pb-8">
      <div className="bg-[#181818] rounded-2xl shadow-lg border border-zinc-800 p-6">
        <h2
          className="text-2xl font-bold text-white mb-4"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Recettes disponibles
        </h2>

        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-200 p-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        {isLoadingMeals ? (
          <div className="text-center py-8">
            <p className="text-zinc-300">Chargement des recettes...</p>
          </div>
        ) : filteredMeals.length === 0 ? (
          <p className="text-zinc-300 bg-black/40 p-4 rounded-2xl text-center border border-zinc-700 text-sm">
            Aucune recette trouvée
          </p>
        ) : (
          <>
            {availableTags.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-zinc-400">Filtrer par tag :</span>
                <button
                  type="button"
                  onClick={() => onTagChange(null)}
                  className={`px-2 py-1 rounded-full border text-[11px] transition-colors ${
                    !selectedTag
                      ? "bg-[#E50914] border-red-500 text-white"
                      : "bg-black/60 border-zinc-700 text-zinc-300 hover:border-red-500 hover:text-white"
                  }`}
                >
                  Tous
                </button>
                {availableTags.slice(0, 15).map((tag) => {
                  const active = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        const next = active ? null : tag;
                        onTagChange(next);
                      }}
                      className={`px-2 py-1 rounded-full border text-[11px] transition-colors ${
                        active
                          ? "bg-[#E50914] border-red-500 text-white"
                          : "bg-black/60 border-zinc-700 text-zinc-300 hover:border-red-500 hover:text-white"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-between mb-3 text-xs text-zinc-400">
              <span>
                {filteredMeals.length} recette
                {filteredMeals.length > 1 ? "s" : ""} trouvée
                {filteredMeals.length > 1 ? "s" : ""}
              </span>
              <span>
                Page {safePage} / {pageCount}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {paginatedMeals.map((meal) => {
                const active = currentRecipeId === meal.idMeal;
                const completed = completedRecipes.includes(meal.idMeal);
                const favorited = favoriteRecipes.includes(meal.idMeal);
                return (
                  <div
                    key={meal.idMeal}
                    className={`relative bg-black/70 rounded-2xl overflow-hidden shadow-md transition-all hover:-translate-y-1 hover:shadow-lg border cursor-pointer ${
                      active
                        ? "border-[#E50914] ring-2 ring-red-500/60"
                        : "border-zinc-700 hover:border-red-600"
                    }`}
                    onClick={() => onSelectMeal(meal.idMeal)}
                  >
                    <button
                      type="button"
                      className="absolute top-1.5 left-1.5 z-10 w-8 h-8 rounded-full bg-black/70 flex items-center justify-center border border-zinc-700 hover:border-amber-400 hover:bg-black/90"
                      onClick={(event) => {
                        event.stopPropagation();
                        onToggleFavorite(meal.idMeal);
                      }}
                    >
                      <span
                        className={`material-icons text-[16px] ${
                          favorited ? "text-amber-400" : "text-zinc-300"
                        }`}
                      >
                        {favorited ? "star" : "star_border"}
                      </span>
                    </button>
                    {completed && (
                      <div className="absolute top-1.5 right-1.5 z-10 inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500 text-white shadow-md">
                        <span className="material-icons text-[14px] leading-none">
                          check
                        </span>
                      </div>
                    )}
                    <div className="h-24 overflow-hidden">
                      <img
                        src={meal.strMealThumb}
                        alt={meal.strMeal}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-semibold text-slate-100 line-clamp-2">
                        {mealTitleTranslations[meal.strMeal.trim()] ||
                          meal.strMeal}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {pageCount > 1 && (
              <div className="mt-4 flex items-center justify-center gap-3 text-xs">
                <button
                  type="button"
                  className="px-3 py-1 rounded-full border border-zinc-700 bg-black/60 text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed hover:border-red-500 hover:text-white"
                  onClick={handlePrev}
                  disabled={safePage <= 1}
                >
                  Précédent
                </button>
                <span className="px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-100">
                  {safePage} / {pageCount}
                </span>
                <button
                  type="button"
                  className="px-3 py-1 rounded-full border border-zinc-700 bg-black/60 text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed hover:border-red-500 hover:text-white"
                  onClick={handleNext}
                  disabled={safePage >= pageCount}
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}

        {isLoadingMeals && (
          <div className="mt-4 text-center text-sm text-zinc-300">
            Chargement de la recette...
          </div>
        )}
      </div>
    </section>
  );
}
