type CauldronColumnProps = {
  cauldronIngredients: string[];
  ingredientTranslations: Record<string, string>;
  isComplete: boolean;
  isHoveringCauldron: boolean;
  totalIngredients: number;
  onDropIngredient: (name: string) => void;
  onHoverChange: (hover: boolean) => void;
  onClearCauldron: () => void;
  onNewRecipe: () => void;
  onResetAll: () => void;
  canNewRecipe: boolean;
};

export function CauldronColumn(props: CauldronColumnProps) {
  const {
    cauldronIngredients,
    ingredientTranslations,
    isComplete,
    isHoveringCauldron,
    totalIngredients,
    onDropIngredient,
    onHoverChange,
    onClearCauldron,
    onNewRecipe,
    onResetAll,
    canNewRecipe,
  } = props;

  const progress = totalIngredients > 0
    ? Math.max(0, Math.min(1, cauldronIngredients.length / totalIngredients))
    : 0;

  return (
    <section className="bg-[#181818] rounded-2xl shadow-lg border border-zinc-800 p-6 flex flex-col items-center">
      <h2
        className="text-2xl font-bold text-white mb-2"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Chaudron de cuisine
      </h2>
      <p className="text-xs text-zinc-300 text-center mb-6 max-w-xs">
        Glisse les ingrédients dans le chaudron. Quand tout est bon, ton plat
        est prêt.
      </p>

      <div className="relative mt-4 mb-6">
        <div
          className={`relative w-80 h-80 transition-all duration-300 ${
            isHoveringCauldron ? "scale-105" : ""
          }`}
          onDrop={(e) => {
            e.preventDefault();
            const ingredient =
              e.dataTransfer.getData("ingredient") ||
              e.dataTransfer.getData("text/plain");
            if (ingredient) onDropIngredient(ingredient);
            onHoverChange(false);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (!isHoveringCauldron) onHoverChange(true);
          }}
          onDragLeave={() => onHoverChange(false)}
        >
          {/* Chaudron en métal - vue de dessus avec perspective */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Bord extérieur du chaudron */}
            <div className="relative w-72 h-72">
              {/* Ombre du chaudron */}
              <div className="absolute inset-0 rounded-full bg-black/40 blur-xl transform translate-y-4" />
              
              {/* Corps principal du chaudron */}
              <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900 shadow-2xl border-4 transition-colors ${
                isHoveringCauldron ? "border-amber-500" : "border-zinc-600"
              }`}>
                {/* Reflets métalliques */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 via-transparent to-transparent" />
                <div className="absolute top-4 left-8 w-16 h-8 bg-white/30 rounded-full blur-md" />
                
                {/* Bord intérieur biseauté */}
                <div className="absolute inset-3 rounded-full bg-gradient-to-b from-zinc-600 to-zinc-800 shadow-inner">
                  {/* Surface du liquide */}
                  <div className="absolute inset-4 rounded-full overflow-hidden bg-gradient-to-br from-red-900 via-orange-800 to-red-950 shadow-2xl">
                    {/* Effet de liquide bouillonnant */}
                    <div className="absolute inset-0 bg-gradient-radial from-orange-600/40 via-red-700/30 to-transparent animate-pulse" />
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/20 via-transparent to-red-900/40" />
                    
                    {/* Bulles et vapeur */}
                    {isComplete && (
                      <>
                        <div className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-orange-400/60 animate-ping" />
                        <div className="absolute top-1/3 right-1/3 w-3 h-3 rounded-full bg-yellow-300/60 animate-ping" style={{ animationDelay: "0.3s" }} />
                        <div className="absolute bottom-1/3 left-1/3 w-5 h-5 rounded-full bg-red-400/60 animate-ping" style={{ animationDelay: "0.6s" }} />
                      </>
                    )}
                    
                    {/* Contenu du chaudron - Zone circulaire scrollable */}
                    <div className="absolute inset-0 rounded-full overflow-hidden">
                      <div className="relative z-10 h-full flex flex-col items-center justify-center p-6">
                        {cauldronIngredients.length === 0 ? (
                          <div className="text-center">
                            <p className="text-orange-200 text-base font-bold drop-shadow-lg mb-1">
                              Glisse ici
                            </p>
                            <p className="text-orange-300/70 text-xs">
                              tes ingrédients
                            </p>
                          </div>
                        ) : (
                          <div className="w-full h-full rounded-full overflow-y-auto overflow-x-hidden custom-scroll">
                            <div className="flex flex-wrap gap-2.5 justify-center items-center p-6">
                              {cauldronIngredients.map((name, idx) => {
                                const translatedName = ingredientTranslations[name] || name;
                                return (
                                  <div
                                    key={name}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-br from-amber-900/90 to-orange-950/90 text-amber-100 text-xs rounded-full border-2 border-amber-700/80 shadow-lg backdrop-blur-sm transform hover:scale-110 transition-transform"
                                    style={{
                                      animation: `float ${2 + idx * 0.3}s ease-in-out infinite`,
                                      animationDelay: `${idx * 0.2}s`
                                    }}
                                  >
                                    <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-amber-400/80 bg-orange-950 flex items-center justify-center shadow-md">
                                      <img
                                        src={`https://www.themealdb.com/images/ingredients/${encodeURIComponent(name)}.png`}
                                        alt={name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <span className="font-semibold drop-shadow">{translatedName}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <svg
                className="absolute inset-0 pointer-events-none"
                viewBox="0 0 160 160"
              >
                <circle
                  cx="80"
                  cy="80"
                  r="62"
                  fill="transparent"
                  stroke="rgba(15, 15, 15, 0.75)"
                  strokeWidth="4"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="62"
                  fill="transparent"
                  stroke="rgba(252, 211, 77, 0.95)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  style={{
                    transform: "rotate(-90deg)",
                    transformOrigin: "80px 80px",
                    strokeDasharray: `${2 * Math.PI * 62}`,
                    strokeDashoffset: `${2 * Math.PI * 62 * (1 - progress)}`,
                    transition: "stroke-dashoffset 0.15s ease-out",
                  }}
                />
              </svg>

              <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-12 h-16 bg-gradient-to-br from-zinc-600 to-zinc-800 rounded-l-full border-2 border-zinc-700 shadow-xl" />
              <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-12 h-16 bg-gradient-to-bl from-zinc-600 to-zinc-800 rounded-r-full border-2 border-zinc-700 shadow-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-4 justify-center">
        <button
          className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-semibold rounded-lg shadow-md transition-all hover:-translate-y-0.5"
          onClick={onClearCauldron}
        >
          Vider le chaudron
        </button>
        <button
          className="px-4 py-2 bg-[#E50914] hover:bg-[#f6121d] text-white text-sm font-semibold rounded-lg shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onNewRecipe}
          disabled={!canNewRecipe}
        >
          Nouvelle recette
        </button>
        <button
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold rounded-lg shadow-md border border-zinc-700 transition-all hover:-translate-y-0.5"
          onClick={onResetAll}
        >
          Tout Nettoyer
        </button>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(2deg); }
        }
        
        /* Scrollbar arrondie qui suit la forme du chaudron */
        .custom-scroll {
          scrollbar-width: none;
          scrollbar-color: transparent transparent;
        }

        .custom-scroll::-webkit-scrollbar {
          width: 0;
          height: 0;
        }
      `}</style>
    </section>
  );
}