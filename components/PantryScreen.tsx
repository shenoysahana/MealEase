// Fix: Implementing the PantryScreen component to display a list of items.
import React, { useState } from 'react';
import { PantryItem } from '../types';
import { PlusIcon, SearchIcon, TrashIcon } from './icons/Icons';

interface PantryScreenProps {
  pantryItems: PantryItem[];
  onAddItem: (itemName: string) => void;
  onRemoveItem: (itemId: string) => void;
  onFindRecipes: () => void;
}

const PantryScreen: React.FC<PantryScreenProps> = ({ pantryItems, onAddItem, onRemoveItem, onFindRecipes }) => {
  const [newItem, setNewItem] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim()) {
      onAddItem(newItem.trim());
      setNewItem('');
    }
  };

  return (
    <div className="w-full">
      <header className="p-4 sticky top-0 bg-gray-50/80 backdrop-blur-sm z-10 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">My Pantry</h1>
      </header>
      <div className="p-4">
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add an ingredient..."
            className="flex-grow p-2 border border-gray-300 rounded-md"
          />
          <button
            type="submit"
            className="p-2 bg-gray-800 text-white rounded-md"
            aria-label="Add item"
          >
            <PlusIcon className="w-6 h-6" />
          </button>
        </form>

        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <h2 className="font-semibold text-gray-700 mb-2">Pantry Items</h2>
            {pantryItems.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                    {pantryItems.map((item) => (
                        <li key={item.id} className="py-2 flex justify-between items-center text-gray-600">
                            <span>{item.name}</span>
                            <button
                                onClick={() => onRemoveItem(item.id)}
                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                                aria-label={`Delete ${item.name}`}
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-500">Your pantry is empty.</p>
            )}
        </div>
        
        <button
          onClick={onFindRecipes}
          className="w-full mt-4 py-3 px-4 bg-gray-800 text-white rounded-lg font-semibold flex items-center justify-center shadow-lg hover:bg-gray-700 transition-colors"
        >
          <SearchIcon className="w-5 h-5 mr-2" />
          Find Recipes with My Ingredients
        </button>
      </div>
    </div>
  );
};

export default PantryScreen;