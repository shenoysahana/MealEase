// Fix: Implementing a placeholder AddToPlanModal component.
import React, { useState } from 'react';
import { Recipe, MealType } from '../types';
import { XMarkIcon } from './icons/Icons';

interface AddToPlanModalProps {
  recipe: Recipe;
  onClose: () => void;
  onAddToPlan: (day: string, mealType: MealType) => void;
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const mealTypes: {label: string, value: MealType}[] = [
    {label: 'Breakfast', value: 'breakfast'},
    {label: 'Lunch', value: 'lunch'},
    {label: 'Dinner', value: 'dinner'},
];

const AddToPlanModal: React.FC<AddToPlanModalProps> = ({ recipe, onClose, onAddToPlan }) => {
  const [selectedDay, setSelectedDay] = useState<string>(daysOfWeek[0]);
  const [selectedMeal, setSelectedMeal] = useState<MealType>(mealTypes[0].value);

  const handleAdd = () => {
    onAddToPlan(selectedDay, selectedMeal);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800 truncate pr-2">Add "{recipe.name}"</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
            <XMarkIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="day" className="block text-sm font-medium text-gray-700">Day</label>
            <select 
                id="day" 
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-800 focus:border-gray-800 sm:text-sm rounded-md"
            >
              {daysOfWeek.map(day => <option key={day}>{day}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="meal" className="block text-sm font-medium text-gray-700">Meal</label>
            <select 
                id="meal" 
                value={selectedMeal}
                onChange={(e) => setSelectedMeal(e.target.value as MealType)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-800 focus:border-gray-800 sm:text-sm rounded-md"
            >
              {mealTypes.map(meal => <option key={meal.value} value={meal.value}>{meal.label}</option>)}
            </select>
          </div>
          <button
            onClick={handleAdd}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Add to Plan
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddToPlanModal;