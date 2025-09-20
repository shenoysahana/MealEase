// Fix: Implementing the PlannerScreen component to display the weekly meal plan.
import React from 'react';
import { DayPlan, Recipe, Screen, WeekPlan, MealType } from '../types';
import { PlusIcon, BoltIcon, SaveIcon, TrashIcon, ResetIcon } from './icons/Icons';

interface PlannerScreenProps {
  weekPlan: WeekPlan;
  onViewRecipe: (recipe: Recipe) => void;
  setActiveScreen: (screen: Screen) => void;
  onSavePlan: () => void;
  onRemoveRecipe: (day: string, mealType: MealType, recipeId: number) => void;
  onResetApp: () => void;
}

interface MealSlotProps {
    mealType: string;
    recipes: Recipe[];
    onViewRecipe: (recipe: Recipe) => void;
    onRemoveRecipe: (recipeId: number) => void;
    onAddClick: () => void;
}

const MealSlot: React.FC<MealSlotProps> = ({ mealType, recipes, onViewRecipe, onRemoveRecipe, onAddClick }) => (
  <div className="bg-white p-3 rounded-lg shadow-sm">
    <h4 className="text-sm font-semibold text-gray-500 mb-2">{mealType}</h4>
    <div className="space-y-2">
        {recipes.map(recipe => (
            <div key={recipe.id} className="relative group">
                <div onClick={() => onViewRecipe(recipe)} className="cursor-pointer flex items-center gap-2 p-1 rounded-md hover:bg-gray-100">
                    <img src={recipe.imageUrl} alt={recipe.name} className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
                    <p className="text-gray-800 font-medium text-sm flex-1 truncate pr-6">{recipe.name}</p>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); onRemoveRecipe(recipe.id); }} 
                    className="absolute top-1/2 -translate-y-1/2 right-1 bg-white/50 backdrop-blur-sm rounded-full p-1 text-gray-600 opacity-0 group-hover:opacity-100 hover:bg-white hover:text-red-500 transition-opacity"
                    aria-label={`Remove ${recipe.name}`}
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
        ))}
      <button onClick={onAddClick} className="w-full h-12 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:border-gray-400 transition-colors">
        <PlusIcon className="w-5 h-5" />
        <span className="text-xs ml-1">Add Dish</span>
      </button>
    </div>
  </div>
);


const DayColumn: React.FC<{ dayPlan: DayPlan; onViewRecipe: (recipe: Recipe) => void; onRemoveRecipe: (day: string, mealType: MealType, recipeId: number) => void, setActiveScreen: (screen: Screen) => void }> = ({ dayPlan, onViewRecipe, onRemoveRecipe, setActiveScreen }) => {
    const handleAddClick = () => {
        // Guide user to find recipes based on goals
        setActiveScreen(Screen.Goals);
    }
    return (
        <div className="w-full p-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{dayPlan.day}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <MealSlot mealType="Breakfast" recipes={dayPlan.breakfast.recipes} onViewRecipe={onViewRecipe} onRemoveRecipe={(recipeId) => onRemoveRecipe(dayPlan.day, 'breakfast', recipeId)} onAddClick={handleAddClick} />
                <MealSlot mealType="Lunch" recipes={dayPlan.lunch.recipes} onViewRecipe={onViewRecipe} onRemoveRecipe={(recipeId) => onRemoveRecipe(dayPlan.day, 'lunch', recipeId)} onAddClick={handleAddClick} />
                <MealSlot mealType="Dinner" recipes={dayPlan.dinner.recipes} onViewRecipe={onViewRecipe} onRemoveRecipe={(recipeId) => onRemoveRecipe(dayPlan.day, 'dinner', recipeId)} onAddClick={handleAddClick} />
            </div>
        </div>
    );
};

const PlannerScreen: React.FC<PlannerScreenProps> = ({ weekPlan, onViewRecipe, setActiveScreen, onSavePlan, onRemoveRecipe, onResetApp }) => {
  return (
    <div className="w-full">
      <header className="p-4 sticky top-0 bg-gray-50/80 backdrop-blur-sm z-10 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Weekly Planner</h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={onSavePlan}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors"
              aria-label="Save plan"
            >
              <SaveIcon className="w-6 h-6 text-gray-700"/>
            </button>
            <button 
              onClick={() => setActiveScreen(Screen.AutoPlan)}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors"
              aria-label="Auto-plan"
            >
              <BoltIcon className="w-6 h-6 text-gray-700"/>
            </button>
          </div>
        </div>
      </header>
      <div>
        {weekPlan.map((dayPlan) => (
          <DayColumn key={dayPlan.day} dayPlan={dayPlan} onViewRecipe={onViewRecipe} onRemoveRecipe={onRemoveRecipe} setActiveScreen={setActiveScreen} />
        ))}
      </div>
    </div>
  );
};

export default PlannerScreen;