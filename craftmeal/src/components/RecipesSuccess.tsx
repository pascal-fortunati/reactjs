import { useState } from "react";
import {
  getMealById,
  type MealSummary,
  type MealDetails,
} from "../services/mealApi";

type RecipesSuccessProps = {
  title: string;
  emptyMessage: string;
  meals: MealSummary[];
  onBack: () => void;
};

type RecipeIngredient = {
  name: string;
  measure: string;
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

export function RecipesSuccess(props: RecipesSuccessProps) {
  const { title, emptyMessage, meals, onBack } = props;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealDetails | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  async function openMeal(mealId: string) {
    setIsDialogOpen(true);
    setIsLoadingDetail(true);
    setDetailError(null);
    try {
      const detail = await getMealById(mealId);
      if (!detail) {
        setDetailError("Recette introuvable.");
        setSelectedMeal(null);
      } else {
        setSelectedMeal(detail);
      }
    } catch {
      setDetailError("Impossible de charger la recette.");
      setSelectedMeal(null);
    } finally {
      setIsLoadingDetail(false);
    }
  }

  function closeDialog() {
    setIsDialogOpen(false);
    setSelectedMeal(null);
    setDetailError(null);
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-[#181818] rounded-2xl shadow-lg border border-zinc-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/60 border border-zinc-700 text-xs text-zinc-200 hover:bg-zinc-800 hover:text-white hover:border-zinc-500 transition-colors"
          >
            <span className="material-icons text-[14px]">arrow_back</span>
            <span>Retour au jeu</span>
          </button>
        </div>

        {meals.length === 0 && (
          <p className="text-sm text-zinc-300 bg-black/40 p-4 rounded-2xl border border-zinc-700">
            {emptyMessage}
          </p>
        )}

        {meals.length > 0 && (
          <>
            <p className="text-xs text-zinc-400 mb-3">
              {meals.length} recette
              {meals.length > 1 ? "s" : ""} au total.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {meals.map((meal) => (
                <div
                  key={meal.idMeal}
                  className="bg-black/70 rounded-2xl overflow-hidden shadow-md border border-zinc-700 cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-transform"
                  onClick={() => openMeal(meal.idMeal)}
                >
                  <div className="h-24 overflow-hidden">
                    <img
                      src={meal.strMealThumb}
                      alt={meal.strMeal}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-semibold text-slate-100 line-clamp-2">
                      {meal.strMeal}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {isDialogOpen && (
	        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
	          <div className="w-full max-w-5xl md:max-w-6xl max-h-[90vh] bg-[#181818] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-black/70">
              <h3 className="text-sm font-semibold text-slate-100">
                {selectedMeal ? selectedMeal.strMeal : "Détails de la recette"}
              </h3>
              <button
                type="button"
                onClick={closeDialog}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-700 transition-colors"
              >
                <span className="material-icons text-sm">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {isLoadingDetail && (
                <p className="text-sm text-zinc-300">Chargement de la recette...</p>
              )}

              {!isLoadingDetail && detailError && (
                <p className="text-sm text-red-300">{detailError}</p>
              )}

	              {!isLoadingDetail && !detailError && selectedMeal && (
	                <div className="grid md:grid-cols-2 gap-6">
	                  <div className="bg-black/40 border border-zinc-800 rounded-2xl p-5">
                    <h4 className="text-sm font-semibold text-slate-100 mb-3">
                      Ingrédients
                    </h4>
	                    <ul className="space-y-2 text-sm text-zinc-200">
                      {getIngredientsFromMeal(selectedMeal).map((ingredient) => (
                        <li
                          key={`${ingredient.name}-${ingredient.measure}`}
	                          className="flex items-center justify-between gap-3 border-b border-zinc-800/60 pb-2 last:border-b-0"
                        >
                          <div className="flex items-center gap-2">
	                            <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                              <img
                                src={`https://www.themealdb.com/images/ingredients/${encodeURIComponent(ingredient.name)}.png`}
                                alt={ingredient.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span>{ingredient.name}</span>
                          </div>
                          <span className="text-zinc-400">
                            {ingredient.measure || "Au gout"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

	                  <div className="bg-black/40 border border-zinc-800 rounded-2xl p-5">
	                    <h4 className="text-base font-semibold text-slate-100 mb-4">
                      Instructions
                    </h4>
                    {(() => {
                      const raw = selectedMeal
                        ? ((selectedMeal["strInstructionsFR"] ||
                            selectedMeal["strInstructions"] ||
                            "") as string)
                        : "";
                      const text = raw.trim();
	                      if (!text) {
	                        return (
	                          <p className="text-sm text-zinc-400">
	                            Aucune instruction disponible pour cette recette.
	                          </p>
	                        );
	                      }
                      const parts = text
                        .split(/\n+/)
                        .map((part) => part.trim())
                        .filter((part) => part.length > 0);
	                      return (
	                        <ol className="list-decimal list-inside space-y-2 text-sm md:text-base leading-relaxed text-zinc-200">
	                          {parts.map((part, index) => (
	                            <li key={index}>{part}</li>
	                          ))}
	                        </ol>
	                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
