// Fix: Implementing the PlannerScreen component to display the weekly meal plan.
import React from 'react';
import { DayPlan, Recipe, Screen, WeekPlan, MealType } from '../types';
import { PlusIcon, BoltIcon, SaveIcon, TrashIcon, ResetIcon } from './icons/Icons';

interface PlannerScreenProps {
  weekPlan: WeekPlan;
  onViewRecipe: (recipe: Recipe) => void;
  setActiveScreen: (screen: Screen) => void;
  onSavePlan: () => void;
  onRemoveRecipe: (day: string, mealType: MealType) => void;
  onResetApp: () => void;
}

interface MealCardProps {
    mealType: string;
    recipe: Recipe | null;
    onCardClick: () => void;
    onRemoveClick: () => void;
    onAddClick: () => void;
}

const MealCard: React.FC<MealCardProps> = ({ mealType, recipe, onCardClick, onRemoveClick, onAddClick }) => (
  <div className="bg-white p-3 rounded-lg shadow-sm">
    <h4 className="text-sm font-semibold text-gray-500 mb-2">{mealType}</h4>
    {recipe ? (
      <div className="relative">
        <div onClick={onCardClick} className="cursor-pointer">
            <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-24 object-cover rounded-md mb-2" />
            <p className="text-gray-800 font-medium text-sm truncate">{recipe.name}</p>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onRemoveClick(); }} className="absolute top-1 right-1 bg-white/60 backdrop-blur-sm rounded-full p-1 text-gray-700 hover:bg-white">
            <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    ) : (
      <button onClick={onAddClick} className="w-full h-24 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100">
        <PlusIcon className="w-6 h-6" />
        <span className="text-xs mt-1">Add Meal</span>
      </button>
    )}
  </div>
);


const DayColumn: React.FC<{ dayPlan: DayPlan; onViewRecipe: (recipe: Recipe) => void; onRemoveRecipe: (day: string, mealType: MealType) => void, setActiveScreen: (screen: Screen) => void }> = ({ dayPlan, onViewRecipe, onRemoveRecipe, setActiveScreen }) => {
    const handleAddClick = () => {
        // Guide user to find recipes based on what they have
        setActiveScreen(Screen.Pantry);
    }
    return (
        <div className="w-full p-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{dayPlan.day}</h3>
            <div className="grid grid-cols-3 gap-3">
                <MealCard mealType="Breakfast" recipe={dayPlan.breakfast.recipe} onCardClick={() => dayPlan.breakfast.recipe && onViewRecipe(dayPlan.breakfast.recipe)} onRemoveClick={() => onRemoveRecipe(dayPlan.day, 'breakfast')} onAddClick={handleAddClick} />
                <MealCard mealType="Lunch" recipe={dayPlan.lunch.recipe} onCardClick={() => dayPlan.lunch.recipe && onViewRecipe(dayPlan.lunch.recipe)} onRemoveClick={() => onRemoveRecipe(dayPlan.day, 'lunch')} onAddClick={handleAddClick} />
                <MealCard mealType="Dinner" recipe={dayPlan.dinner.recipe} onCardClick={() => dayPlan.dinner.recipe && onViewRecipe(dayPlan.dinner.recipe)} onRemoveClick={() => onRemoveRecipe(dayPlan.day, 'dinner')} onAddClick={handleAddClick} />
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
            <button 
              onClick={onResetApp}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors"
              aria-label="Reset App"
            >
              <ResetIcon className="w-6 h-6 text-gray-700"/>
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