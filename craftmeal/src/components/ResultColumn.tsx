import type { MealDetails } from "../services/mealApi";

type ResultColumnProps = {
  currentRecipe: MealDetails | null;
  isComplete: boolean;
  isRecipeCompleted: boolean;
  mealTitleTranslations: Record<string, string>;
};

export function ResultColumn(props: ResultColumnProps) {
  const { currentRecipe, isComplete, isRecipeCompleted, mealTitleTranslations } = props;

  return (
    <section className="bg-[#181818] rounded-2xl shadow-lg border border-zinc-800 p-6">
      <h2
        className="text-2xl font-bold text-white mb-4"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Résultat
      </h2>

      {!currentRecipe && (
        <p className="text-xs text-zinc-300 text-center mb-6 max-w-xs">
          Le plat final apparaîtra ici.
        </p>
      )}

      {currentRecipe && !isComplete && (
        <div className="flex flex-col items-center gap-3 bg-[#202020] p-6 rounded-2xl border border-zinc-800">
          <p className="text-sm text-zinc-200 text-center">
            En cours de préparation...
          </p>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" />
            <div
              className="w-2 h-2 bg-red-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
            <div
              className="w-2 h-2 bg-red-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.4s" }}
            />
          </div>
        </div>
      )}

      {currentRecipe && isComplete && (
        <div className="flex flex-col items-center gap-4 animate-[fadeIn_0.5s_ease-in]">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-red-500 via-red-400 to-rose-400 rounded-full blur-xl opacity-60 animate-pulse" />

            <div className="relative rounded-3xl overflow-hidden border border-red-600 shadow-xl">
              <img
                src={currentRecipe.strMealThumb}
                alt={currentRecipe.strMeal}
                className="w-48 h-48 object-cover"
              />
            </div>
          </div>

          <h3 className="text-xl font-bold text-slate-100 text-center px-4">
            {mealTitleTranslations[currentRecipe.strMeal.trim()] ||
              currentRecipe.strMeal}
          </h3>

          <div className="bg-[#E50914] text-white px-6 py-3 rounded-full font-bold shadow-md">
            Succès !
          </div>

          <p className="text-sm text-zinc-200 text-center max-w-xs bg-black/40 p-3 rounded-xl border border-zinc-700">
            Tu as créé un plat digne d'une soirée Netflix.
          </p>

          {isRecipeCompleted && (
            <span className="text-xs bg-zinc-700 text-white px-3 py-1 rounded-full">
              Déjà réussi
            </span>
          )}
        </div>
      )}
    </section>
  );
}