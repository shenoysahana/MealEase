// Fix: Implementing a placeholder GoalsScreen component.
import React, { useState, useMemo } from 'react';
import { Recipe } from '../types';
import { PlusIcon } from './icons/Icons';

interface GoalsScreenProps {
  recipes: Recipe[];
  onAddToPlan: (recipe: Recipe) => void;
}

type Goal = 'all' | 'low-calorie' | 'high-protein';
type TimeFilter = 'all' | 'under30' | 'under60';

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

const GoalsScreen: React.FC<GoalsScreenProps> = ({ recipes, onAddToPlan }) => {
    const [activeGoal, setActiveGoal] = useState<Goal>('all');
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
    
    const filteredRecipes = useMemo(() => {
        let goalFiltered = recipes;

        switch (activeGoal) {
            case 'low-calorie':
                goalFiltered = recipes.filter(r => r.nutrition.calories < 450);
                break;
            case 'high-protein':
                goalFiltered = recipes.filter(r => r.nutrition.protein > 30);
                break;
        }

        if (timeFilter === 'all') {
            return goalFiltered;
        }

        return goalFiltered.filter(recipe => {
            const totalTime = getTotalCookTime(recipe);
            if (timeFilter === 'under30') return totalTime <= 30;
            if (timeFilter === 'under60') return totalTime <= 60;
            return true;
        });

    }, [recipes, activeGoal, timeFilter]);

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
            <div className="flex gap-2">
                <TimeFilterButton filter="all" activeFilter={timeFilter} setFilter={setTimeFilter}>All Times</TimeFilterButton>
                <TimeFilterButton filter="under30" activeFilter={timeFilter} setFilter={setTimeFilter}>&lt; 30 min</TimeFilterButton>
                <TimeFilterButton filter="under60" activeFilter={timeFilter} setFilter={setTimeFilter}>&lt; 60 min</TimeFilterButton>
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

export default GoalsScreen;
