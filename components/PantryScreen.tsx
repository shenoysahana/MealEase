// Fix: Implementing the PantryScreen component to display a list of items.
import React, { useState, useMemo } from 'react';
import { PantryItem, IngredientCategory } from '../types';
import { PlusIcon, SearchIcon, TrashIcon } from './icons/Icons';

interface PantryScreenProps {
  pantryItems: PantryItem[];
  onAddItem: (itemName: string, category: IngredientCategory) => void;
  onRemoveItem: (itemId: string) => void;
  onFindRecipes: () => void;
}

const ingredientCategories: IngredientCategory[] = ['Produce', 'Protein', 'Dairy', 'Pantry Staples', 'Spices', 'Bakery'];

const PantryScreen: React.FC<PantryScreenProps> = ({ pantryItems, onAddItem, onRemoveItem, onFindRecipes }) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<IngredientCategory>('Produce');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim()) {
      onAddItem(newItemName.trim(), newItemCategory);
      setNewItemName('');
      setNewItemCategory('Produce');
    }
  };

  const groupedItems = useMemo(() => {
    const grouped = pantryItems.reduce((acc, item) => {
      const { category } = item;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<IngredientCategory, PantryItem[]>);

    const sortedCategories = Object.keys(grouped).sort() as IngredientCategory[];
    
    return { grouped, sortedCategories };
  }, [pantryItems]);

  return (
    <div className="w-full">
      <header className="p-4 sticky top-0 bg-gray-50/80 backdrop-blur-sm z-10 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">My Pantry</h1>
      </header>
      <div className="p-4">
        <form onSubmit={handleSubmit} className="mb-4 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex gap-2">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Add an ingredient..."
              className="flex-grow p-2 border border-gray-300 rounded-md"
              aria-label="New ingredient name"
            />
            <button
              type="submit"
              className="p-2 bg-gray-800 text-white rounded-md"
              aria-label="Add item"
            >
              <PlusIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="mt-2">
            <label htmlFor="category" className="sr-only">Category</label>
            <select
              id="category"
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value as IngredientCategory)}
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
            >
              {ingredientCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </form>

        {pantryItems.length > 0 ? (
          <div className="space-y-4">
            {groupedItems.sortedCategories.map(category => (
              <div key={category} className="bg-white p-4 rounded-lg shadow-sm">
                <h2 className="font-semibold text-gray-700 mb-2 border-b pb-2">{category}</h2>
                <ul className="divide-y divide-gray-200">
                  {groupedItems.grouped[category].map((item) => (
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
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <p className="text-sm text-gray-500">Your pantry is empty. Add some items to get started!</p>
          </div>
        )}
        
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