const API_BASE = "https://www.themealdb.com/api/json/v1/1";

export type MealSummary = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strTags?: string | null;
};

export type MealDetails = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strArea: string;
  [key: string]: string;
};

export async function getAllMeals(): Promise<MealDetails[]> {
  const letters = "abcdefghijklmnopqrstuvwxyz".split("");
  const chunks = await Promise.all(
    letters.map(async (letter) => {
      try {
        const res = await fetch(
          `${API_BASE}/search.php?f=${encodeURIComponent(letter)}`,
        );
        if (!res.ok) throw new Error("Erreur");
        const data = await res.json();
        return (data.meals || []) as MealDetails[];
      } catch {
        return [] as MealDetails[];
      }
    }),
  );
  const map: Record<string, MealDetails> = {};
  chunks.forEach((list) => {
    list.forEach((meal) => {
      if (meal && meal.idMeal) {
        map[meal.idMeal] = meal;
      }
    });
  });
  return Object.values(map);
}

export async function getMealById(id: string): Promise<MealDetails | null> {
  const res = await fetch(
    `${API_BASE}/lookup.php?i=${encodeURIComponent(id)}`,
  );
  if (!res.ok) {
    throw new Error("Erreur lors du chargement de la recette");
  }
  const data = await res.json();
  const meal = (data.meals || [])[0] as MealDetails | undefined;
  return meal || null;
}