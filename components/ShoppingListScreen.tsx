// Fix: Implementing the ShoppingListScreen component.
import React, { useMemo } from 'react';
import { WeekPlan, Ingredient, IngredientCategory, PantryItem } from '../types';

interface ShoppingListScreenProps {
  weekPlan: WeekPlan;
  pantryItems: PantryItem[]; // Added for future enhancements
}

const ShoppingListScreen: React.FC<ShoppingListScreenProps> = ({ weekPlan, pantryItems }) => {
  const shoppingList = useMemo(() => {
    const allIngredients: Ingredient[] = weekPlan.flatMap(day => [
      ...(day.breakfast.recipes.flatMap(r => r.ingredients)),
      ...(day.lunch.recipes.flatMap(r => r.ingredients)),
      ...(day.dinner.recipes.flatMap(r => r.ingredients)),
    ]);

    // Create a map of unique ingredients to avoid duplicates
    const uniqueIngredients = new Map<string, Ingredient>();
    allIngredients.forEach(ing => {
        if (!uniqueIngredients.has(ing.name)) {
            uniqueIngredients.set(ing.name, ing);
        }
    });

    const groupedList = Array.from(uniqueIngredients.values()).reduce((acc, ingredient) => {
        const { category } = ingredient;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(ingredient);
        return acc;
    }, {} as Record<IngredientCategory, Ingredient[]>);

    // Sort categories for consistent order
    const sortedCategories = Object.keys(groupedList).sort() as IngredientCategory[];
    
    return { groupedList, sortedCategories };

  }, [weekPlan]);

  const hasItems = shoppingList.sortedCategories.length > 0;

  return (
    <div className="w-full">
      <header className="p-4 sticky top-0 bg-gray-50/80 backdrop-blur-sm z-10 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">Shopping List</h1>
      </header>
      <div className="p-4">
        {hasItems ? (
            <div className="space-y-6">
                {shoppingList.sortedCategories.map(category => (
                    <div key={category} className="bg-white p-4 rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">{category}</h2>
                        <ul className="space-y-4">
                            {shoppingList.groupedList[category].map((item, index) => (
                            <li key={index} className="flex items-center">
                                <input
                                type="checkbox"
                                id={`item-${category}-${index}`}
                                className="h-5 w-5 rounded border-gray-300 text-gray-800 focus:ring-gray-700"
                                />
                                <label htmlFor={`item-${category}-${index}`} className={`ml-3 text-gray-700`}>
                                {item.name}
                                </label>
                            </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        ) : (
            <div className="p-4 flex flex-col items-center justify-center text-center text-gray-500 h-96">
                <p>Your shopping list is empty.</p>
                <p className="text-sm">Add some meals to your planner to generate a list.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingListScreen;