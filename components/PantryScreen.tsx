// Fix: Implementing the PantryScreen component to display a list of items.
// Fix: Import useMemo, useState, and useEffect from React.
import React, { useMemo, useState, useEffect } from 'react';
import { PantryItem, IngredientCategory, Ingredient } from '../types';
import { PRESET_PANTRY_ITEMS } from '../data';
import { SearchIcon, PlusIcon, XMarkIcon } from './icons/Icons';

interface AddPantryItemModalProps {
    onClose: () => void;
    onAddItem: (name: string, category: IngredientCategory) => void;
    categories: IngredientCategory[];
}

const AddPantryItemModal: React.FC<AddPantryItemModalProps> = ({ onClose, onAddItem, categories }) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState<IngredientCategory>('Produce');

    const handleSave = () => {
        if (name.trim()) {
            onAddItem(name.trim(), category);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800">Add Custom Item</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><XMarkIcon className="w-5 h-5 text-gray-600" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="itemName" className="block text-sm font-medium text-gray-700">Item Name</label>
                        <input
                            type="text"
                            id="itemName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-4 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-800 focus:border-gray-800 sm:text-sm rounded-md"
                            placeholder="e.g., Almond Milk"
                        />
                    </div>
                    <div>
                        <label htmlFor="itemCategory" className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                            id="itemCategory"
                            value={category}
                            onChange={(e) => setCategory(e.target.value as IngredientCategory)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-800 focus:border-gray-800 sm:text-sm rounded-md"
                        >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700">Save</button>
                </div>
            </div>
        </div>
    );
};


interface PantryScreenProps {
  pantryItems: PantryItem[];
  onAddItem: (itemName: string, category: IngredientCategory) => void;
  onRemoveItem: (itemId: string) => void;
  onFindRecipes: () => void;
}

const PantryScreen: React.FC<PantryScreenProps> = ({ pantryItems, onAddItem, onRemoveItem, onFindRecipes }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    // State to remember all custom items added during the session, so they don't disappear when unchecked.
    const [allCustomItems, setAllCustomItems] = useState<Ingredient[]>([]);

    const pantryItemNames = useMemo(() => new Set(pantryItems.map(item => item.name)), [pantryItems]);

    useEffect(() => {
        // This effect ensures that our list of all custom items stays in sync with the master list from props.
        const presetItemNames = new Set(Object.values(PRESET_PANTRY_ITEMS).flat().map(i => i.name));
        const currentCustomInPantry = pantryItems
            .filter(p => !presetItemNames.has(p.name))
            .map(p => ({ name: p.name, category: p.category }));

        setAllCustomItems(prevCustomItems => {
            const newItems = [...prevCustomItems];
            const existingNames = new Set(prevCustomItems.map(i => i.name));
            currentCustomInPantry.forEach(item => {
                if (!existingNames.has(item.name)) {
                    newItems.push(item);
                }
            });
            return newItems;
        });
    }, [pantryItems]);

    const handleToggleItem = (item: Ingredient, isChecked: boolean) => {
        if (isChecked) {
            onAddItem(item.name, item.category);
        } else {
            const itemToRemove = pantryItems.find(p => p.name === item.name);
            if (itemToRemove) {
                onRemoveItem(itemToRemove.id);
            }
        }
    };
    
    const categorizedDisplayItems = useMemo(() => {
        const allPresetItems: Ingredient[] = Object.values(PRESET_PANTRY_ITEMS).flat();
        
        // The list of items to display is now a combination of presets and ALL custom items ever added.
        const allDisplayItems = [...allPresetItems, ...allCustomItems];

        const grouped = allDisplayItems.reduce((acc, item) => {
            const { category } = item;
            if (!acc[category]) {
                acc[category] = [];
            }
            // Ensure no duplicates are added to the display list.
            if (!acc[category].some(i => i.name.toLowerCase() === item.name.toLowerCase())) {
                 acc[category].push(item);
            }
            return acc;
        }, {} as Record<IngredientCategory, Ingredient[]>);

        // Sort items within each category alphabetically.
        for (const category in grouped) {
            grouped[category as IngredientCategory].sort((a, b) => a.name.localeCompare(b.name));
        }

        return grouped;
    }, [allCustomItems]);
    
    const categories = Object.keys(categorizedDisplayItems).sort() as IngredientCategory[];

    return (
        <div className="w-full">
            {isAddModalOpen && (
                <AddPantryItemModal 
                    onClose={() => setIsAddModalOpen(false)} 
                    onAddItem={onAddItem}
                    categories={Object.keys(PRESET_PANTRY_ITEMS) as IngredientCategory[]}
                />
            )}
            <header className="p-4 sticky top-0 bg-gray-50/80 backdrop-blur-sm z-10 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">My Pantry</h1>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-white bg-gray-800 rounded-lg hover:bg-gray-700"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Add Item
                    </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">Select the items you have on hand to get recipe suggestions.</p>
            </header>
            <div className="p-4 space-y-4">
                {categories.map(category => (
                    <div key={category} className="bg-white p-4 rounded-lg shadow-sm">
                        <h2 className="font-semibold text-gray-700 mb-3 border-b pb-2">{category}</h2>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                            {categorizedDisplayItems[category].map((item) => {
                                const isChecked = pantryItemNames.has(item.name);
                                const inputId = `pantry-${item.name.replace(/\s/g, '-')}`;
                                return (
                                    <div key={item.name} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={inputId}
                                            checked={isChecked}
                                            onChange={(e) => handleToggleItem(item, e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-gray-800 focus:ring-gray-700"
                                        />
                                        <label
                                            htmlFor={inputId}
                                            className="ml-2 text-sm text-gray-600 select-none"
                                        >
                                            {item.name}
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
                <div className="pt-4">
                    <button
                        onClick={onFindRecipes}
                        className="w-full py-3 px-4 bg-gray-800 text-white rounded-lg font-semibold flex items-center justify-center shadow-lg hover:bg-gray-700 transition-colors"
                        >
                        <SearchIcon className="w-5 h-5 mr-2" />
                        Find Recipes with My Ingredients
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PantryScreen;