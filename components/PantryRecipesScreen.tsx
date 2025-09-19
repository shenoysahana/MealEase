import React, { useMemo, useState } from 'react';
import { Recipe, PantryItem, UserPreferences } from '../types';
import { PlusIcon, ChevronLeftIcon } from './icons/Icons';

// --- Improved Helper Functions for Ingredient Matching ---

// A set of common words to ignore during matching to improve accuracy.
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'clove', 'cloves', 'cup', 'cups', 'for', 'g', 'in', 'kg',
  'l', 'lb', 'lbs', 'ml', 'of', 'on', 'or', 'oz', 'slice', 'slices', 'tbsp',
  'the', 'tsp', 'with'
]);

/**
 * Converts an ingredient string into a set of significant, singular keyword tokens.
 * This process involves cleaning the string, removing stop words, and singularizing words.
 * @param text The ingredient string (e.g., "2 slices of whole wheat bread").
 * @returns A set of keyword tokens (e.g., {"whole", "wheat", "bread"}).
 */
const getTokens = (text: string): Set<string> => {
  const cleanedText = text
    .toLowerCase()
    // Remove numbers, fractions, and common punctuation.
    .replace(/(\d+\/\d+)|(\d+)|[.,()]/g, ' ')
    .trim();

  if (!cleanedText) {
    return new Set();
  }
  
  // Split into words and filter out stop words and empty strings.
  const words = cleanedText.split(/\s+/).filter(word => word && !STOP_WORDS.has(word));

  // Convert words to their singular form for better matching.
  const singularWords = words.map(word => {
      if (word.endsWith('ies')) return word.slice(0, -3) + 'y';
      if (word.endsWith('oes')) return word.slice(0, -2);
      if (word.endsWith('s') && !word.endsWith('ss') && word.length > 2) {
          return word.slice(0, -1);
      }
      return word;
  });
  
  return new Set(singularWords);
};


interface PantryRecipesScreenProps {
  allRecipes: Recipe[];
  pantryItems: PantryItem[];
  onAddToPlan: (recipe: Recipe) => void;
  onBack: () => void;
  userPreferences: UserPreferences | null;
}

const getTotalCookTime = (recipe: Recipe): number => {
    let totalMinutes = 0;
    const parse = (timeStr: string) => {
        let minutes = 0;
        const hourMatch = timeStr.match(/(\d+)\s*hr/);
        const minMatch = timeStr.match(/(\d+)\s*min/);
        if (hourMatch) minutes += parseInt(hourMatch[1]) * 60;
        if (minMatch) minutes += parseInt(minMatch[1]);
        return minutes;
    };
    totalMinutes += parse(recipe.prepTime);
    totalMinutes += parse(recipe.cookTime);
    return totalMinutes;
};

type TimeFilter = 'all' | 'under30' | 'under60';

const PantryRecipesScreen: React.FC<PantryRecipesScreenProps> = ({ allRecipes, pantryItems, onAddToPlan, onBack, userPreferences }) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  const pantryTokensList = useMemo(() => 
    pantryItems.map(item => getTokens(item.name)).filter(tokens => tokens.size > 0),
    [pantryItems]
  );

  const suggestedRecipes = useMemo(() => {
    // 1. Filter by dietary preference from onboarding
    const dietPreference = userPreferences?.diet;
    let dietFilteredRecipes = allRecipes;
    if (dietPreference && dietPreference !== 'non-veg') {
      dietFilteredRecipes = allRecipes.filter(recipe => {
        if (dietPreference === 'vegetarian') {
          return recipe.category === 'vegetarian' || recipe.category === 'vegan';
        }
        if (dietPreference === 'vegan') {
          return recipe.category === 'vegan';
        }
        return true;
      });
    }

    // 2. Match recipes with pantry items
    const matched = dietFilteredRecipes
      .map(recipe => {
        const matchedIngredients = new Set<string>();

        recipe.ingredients.forEach(ingredient => {
          const ingredientTokens = getTokens(ingredient.name);
          if (ingredientTokens.size === 0) return;

          for (const pantryTokens of pantryTokensList) {
            if (pantryTokens.size === 0) continue;
            
            // LOGIC FIX: Implement symmetric subset check
            // This robustly matches ingredients regardless of specificity.
            // e.g., pantry "flour" matches recipe "all-purpose flour" and vice-versa.
            const smallerSet = pantryTokens.size <= ingredientTokens.size ? pantryTokens : ingredientTokens;
            const largerSet = pantryTokens.size <= ingredientTokens.size ? ingredientTokens : pantryTokens;
            
            const isMatch = [...smallerSet].every(token => largerSet.has(token));

            if (isMatch) {
              matchedIngredients.add(ingredient.name);
              break; // Match found for this ingredient, move to the next one
            }
          }
        });
        
        return { ...recipe, matchCount: matchedIngredients.size };
      })
      .filter(recipe => recipe.matchCount > 0)
      .sort((a, b) => {
          if (b.matchCount !== a.matchCount) {
              return b.matchCount - a.matchCount;
          }
          const aPercentage = a.ingredients.length > 0 ? a.matchCount / a.ingredients.length : 0;
          const bPercentage = b.ingredients.length > 0 ? b.matchCount / b.ingredients.length : 0;
          return bPercentage - aPercentage;
      });
    
    // 3. Filter by time
    if (timeFilter === 'all') {
        return matched;
    }
    
    return matched.filter(recipe => {
        const totalTime = getTotalCookTime(recipe);
        if (timeFilter === 'under30') return totalTime <= 30;
        if (timeFilter === 'under60') return totalTime <= 60;
        return true;
    });

  }, [allRecipes, pantryTokensList, timeFilter, userPreferences]);


  return (
    <div className="w-full">
      <header className="p-4 sticky top-0 bg-gray-50/80 backdrop-blur-sm z-10 border-b border-gray-200 flex items-center">
         <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-gray-200">
            <ChevronLeftIcon className="w-6 h-6 text-gray-800"/>
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Pantry Recipes</h1>
      </header>
      <div className="p-4">
        <div className="flex gap-2 mb-4">
            <TimeFilterButton filter="all" activeFilter={timeFilter} setFilter={setTimeFilter}>All</TimeFilterButton>
            <TimeFilterButton filter="under30" activeFilter={timeFilter} setFilter={setTimeFilter}>&lt; 30 min</TimeFilterButton>
            <TimeFilterButton filter="under60" activeFilter={timeFilter} setFilter={setTimeFilter}>&lt; 60 min</TimeFilterButton>
        </div>
        {suggestedRecipes.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {suggestedRecipes.map((recipe) => (
              <div key={recipe.id} className="bg-white rounded-lg shadow-sm overflow-hidden group">
                <div className="relative">
                    <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-32 object-cover" />
                    <div className="absolute top-2 left-2 bg-gray-800/70 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {recipe.matchCount} of {recipe.ingredients.length} ingredients
                    </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-gray-800 truncate">{recipe.name}</h3>
                  <p className="text-xs text-gray-500">{recipe.nutrition.calories} kcal</p>
                  <button 
                    onClick={() => onAddToPlan(recipe)}
                    className="w-full mt-2 py-2 px-3 bg-gray-800 text-white rounded-md font-semibold text-sm flex items-center justify-center shadow-lg hover:bg-gray-700 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4 mr-2"/>
                    Add to Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
            <div className="p-4 flex flex-col items-center justify-center text-center text-gray-500 h-96">
                <p>No matching recipes found.</p>
                <p className="text-sm">Try adding more items to your pantry or adjusting the filters.</p>
            </div>
        )}
      </div>
    </div>
  );
};

const TimeFilterButton: React.FC<{filter: TimeFilter, activeFilter: TimeFilter, setFilter: (f: TimeFilter) => void, children: React.ReactNode}> = ({filter, activeFilter, setFilter, children}) => {
    const isActive = filter === activeFilter;
    return (
        <button 
            onClick={() => setFilter(filter)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${isActive ? 'bg-gray-800 text-white' : 'bg-white text-gray-700 border'}`}
        >
            {children}
        </button>
    )
}

export default PantryRecipesScreen;