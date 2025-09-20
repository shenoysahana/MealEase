
// Fix: Implementing a placeholder GoalsScreen component.
import React, { useState, useMemo } from 'react';
import { Recipe, UserPreferences, DietOption } from '../types';
import { PlusIcon } from './icons/Icons';

interface GoalsScreenProps {
  recipes: Recipe[];
  onAddToPlan: (recipe: Recipe) => void;
  userPreferences: UserPreferences | null;
}

type Goal = 'all' | 'low-calorie' | 'high-protein';

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

const GoalsScreen: React.FC<GoalsScreenProps> = ({ recipes, onAddToPlan, userPreferences }) => {
    const [activeGoal, setActiveGoal] = useState<Goal>('all');
    
    const filteredRecipes = useMemo(() => {
        const dietMatch = (recipe: Recipe, userDiets: DietOption[]): boolean => {
            if (!userDiets || userDiets.length === 0) {
                return true; // No preference, show all.
            }
            // Strict check: recipe category must be in the selected diet list.
            return userDiets.includes(recipe.category);
        };
        
        // 1. Filter by dietary preference from onboarding
        const dietPreference = userPreferences?.diet ?? [];
        let dietFiltered = recipes.filter(recipe => dietMatch(recipe, dietPreference));

        // 2. Filter by selected goal on this screen
        let goalFiltered = dietFiltered;

        switch (activeGoal) {
            case 'low-calorie':
                goalFiltered = dietFiltered.filter(r => r.nutrition.calories < 450);
                break;
            case 'high-protein':
                goalFiltered = dietFiltered.filter(r => r.nutrition.protein > 30);
                break;
        }

        return goalFiltered;

    }, [recipes, activeGoal, userPreferences]);

  return (
    <div className="w-full">
      <header className="p-4 sticky top-0 bg-gray-50/80 backdrop-blur-sm z-10 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">Plan by Goals</h1>
      </header>
      <div className="p-4">
        <div className="space-y-3 mb-4">
            <div className="flex gap-2">
                <GoalButton goal="all" activeGoal={activeGoal} setGoal={setActiveGoal}>All</GoalButton>
                <GoalButton goal="low-calorie" activeGoal={activeGoal} setGoal={setActiveGoal}>Low Calorie</GoalButton>
                <GoalButton goal="high-protein" activeGoal={activeGoal} setGoal={setActiveGoal}>High Protein</GoalButton>
            </div>
        </div>
         <div className="space-y-4">
          {filteredRecipes.length > 0 ? filteredRecipes.map((recipe) => (
            <div key={recipe.id} className="bg-white p-3 rounded-lg shadow-sm flex items-center gap-4">
              <img src={recipe.imageUrl} alt={recipe.name} className="w-20 h-20 object-cover rounded-md" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{recipe.name}</h3>
                <p className="text-xs text-gray-500">
                    {recipe.nutrition.calories} kcal &bull; {recipe.nutrition.protein}g Protein &bull; {getTotalCookTime(recipe)} min
                </p>
              </div>
              <button onClick={() => onAddToPlan(recipe)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <PlusIcon className="w-6 h-6 text-gray-700"/>
              </button>
            </div>
          )) : (
             <div className="p-4 flex flex-col items-center justify-center text-center text-gray-500 h-64">
                <p>No recipes match your criteria.</p>
                <p className="text-sm">Try adjusting the filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const GoalButton: React.FC<{goal: Goal, activeGoal: Goal, setGoal: (g: Goal) => void, children: React.ReactNode}> = ({goal, activeGoal, setGoal, children}) => {
    const isActive = goal === activeGoal;
    return (
        <button 
            onClick={() => setGoal(goal)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${isActive ? 'bg-gray-800 text-white' : 'bg-white text-gray-700 border'}`}
        >
            {children}
        </button>
    )
}

export default GoalsScreen;