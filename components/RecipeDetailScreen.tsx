// Fix: Implementing the RecipeDetailScreen component.
import React, { useState, useEffect } from 'react';
import { Recipe } from '../types';
import { ChevronLeftIcon, PlusIcon } from './icons/Icons';

interface RecipeDetailScreenProps {
  recipe: Recipe;
  onBack: () => void;
  onAddToPlan: (recipe: Recipe) => void;
}

const RecipeDetailScreen: React.FC<RecipeDetailScreenProps> = ({ recipe, onBack, onAddToPlan }) => {
  const [note, setNote] = useState('');

  // Load note from localStorage when the component mounts or recipe changes
  useEffect(() => {
    const savedNote = localStorage.getItem(`recipe-note-${recipe.id}`);
    if (savedNote) {
      setNote(savedNote);
    } else {
      setNote(''); // Clear note for new recipe
    }
  }, [recipe.id]);

  // Save note to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`recipe-note-${recipe.id}`, note);
  }, [note, recipe.id]);

  return (
    <div className="w-full bg-white min-h-screen pb-20">
      <header className="relative">
        <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-64 object-cover" />
        <button
          onClick={onBack}
          className="absolute top-4 left-4 bg-white/70 backdrop-blur-sm rounded-full p-2 text-gray-800"
          aria-label="Back"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
      </header>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{recipe.name}</h1>

        <div className="flex text-sm text-gray-500 mb-6">
            <div className="mr-6"><strong>Prep:</strong> {recipe.prepTime}</div>
            <div className="mr-6"><strong>Cook:</strong> {recipe.cookTime}</div>
            <div><strong>Servings:</strong> {recipe.servings}</div>
        </div>
        
         <div className="bg-gray-100 p-3 rounded-lg mb-6 grid grid-cols-4 text-center">
            <div><div className="font-bold">{recipe.nutrition.calories}</div><div className="text-xs">kcal</div></div>
            <div><div className="font-bold">{recipe.nutrition.protein}g</div><div className="text-xs">Protein</div></div>
            <div><div className="font-bold">{recipe.nutrition.carbs}g</div><div className="text-xs">Carbs</div></div>
            <div><div className="font-bold">{recipe.nutrition.fat}g</div><div className="text-xs">Fat</div></div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-2">Ingredients</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient.name}</li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-2">Instructions</h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-700">
            {recipe.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-2">Personal Notes</h2>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add your notes, like substitutions or cooking tips..."
            className="w-full h-24 p-2 border border-gray-300 rounded-md text-gray-700 focus:ring-gray-800 focus:border-gray-800"
            aria-label="Personal notes for the recipe"
          />
        </div>
      </div>
       <div className="fixed bottom-0 left-0 right-0 max-w-sm mx-auto p-4 bg-white/80 backdrop-blur-sm border-t">
            <button 
                onClick={() => onAddToPlan(recipe)}
                className="w-full py-3 px-6 bg-gray-800 text-white rounded-lg font-semibold text-lg flex items-center justify-center shadow-lg hover:bg-gray-700 transition-colors"
            >
                <PlusIcon className="w-6 h-6 mr-3"/>
                Add to Plan
            </button>
      </div>
    </div>
  );
};

export default RecipeDetailScreen;