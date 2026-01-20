import type { MealDetails } from "../services/mealApi";

type Ingredient = {
  name: string;
  measure: string;
};

type IngredientsColumnProps = {
  currentRecipe: MealDetails | null;
  ingredients: Ingredient[];
  cauldronIngredients: string[];
  ingredientTranslations: Record<string, string>;
  measureTranslations: Record<string, string>;
  ingredientTranslationError: string | null;
  onDragStartIngredient: (name: string, event: React.DragEvent<HTMLDivElement>) => void;
};

export function IngredientsColumn(props: IngredientsColumnProps) {
  const {
    currentRecipe,
    ingredients,
    cauldronIngredients,
    ingredientTranslations,
    measureTranslations,
    ingredientTranslationError,
    onDragStartIngredient,
  } = props;

  return (
    <section className="bg-[#181818] rounded-2xl shadow-lg border border-zinc-800 p-6">
      <h2
        className="text-2xl font-bold text-white mb-4"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Ingrédients
      </h2>
      {ingredientTranslationError && (
        <p className="text-xs text-red-300 mb-3">
          {ingredientTranslationError}
        </p>
      )}

      {!currentRecipe && (
        <p className="text-xs text-zinc-300 text-center mb-6 max-w-xs">
          Choisis une recette ci-dessous
        </p>
      )}

      {currentRecipe && (
        <div className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 max-h-96 overflow-y-auto pr-2 scrollbar-none">
            {ingredients.map((ingredient, index) => {
              const used = cauldronIngredients.includes(ingredient.name);
              const baseName = ingredient.name;
              const translatedName =
                ingredientTranslations[baseName] || baseName;
              return (
                <div
                  key={`${ingredient.name}-${ingredient.measure}-${index}`}
                  className={`flex items-center gap-3 bg-[#202020] rounded-2xl border p-3 transition-all cursor-grab active:cursor-grabbing shadow-sm ${
                    used
                      ? "border-zinc-700 opacity-60 grayscale"
                      : "border-zinc-700 hover:border-red-600 hover:-translate-y-0.5 hover:shadow-md"
                  }`}
                  draggable
                  onDragStart={(e) => onDragStartIngredient(ingredient.name, e)}
                >
                  <div
                    className={`w-15 h-15 flex items-center justify-center text-white font-bold shadow-sm overflow-hidden ${used ? "grayscale" : ""}`}
                  >
                    <img
                      src={`https://www.themealdb.com/images/ingredients/${encodeURIComponent(ingredient.name)}.png`}
                      alt={ingredient.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-semibold text-slate-100 ${used ? "line-through text-zinc-500" : ""}`}
                    >
                      {translatedName}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {measureTranslations[ingredient.measure.trim()] ||
                        ingredient.measure ||
                        "Au gout"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}