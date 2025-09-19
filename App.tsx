
import React, { useState, useEffect } from 'react';
// Fix: Import Gemini AI SDK and Type enum.
import { GoogleGenAI, Type } from "@google/genai";
import { Screen, WeekPlan, Recipe, PantryItem, UserPreferences, SavedPlan, MealType, IngredientCategory } from './types';
import { MOCK_RECIPES, EMPTY_WEEK_PLAN } from './data';

// Import components
import OnboardingScreen from './components/OnboardingScreen';
import PlannerScreen from './components/PlannerScreen';
import PantryScreen from './components/PantryScreen';
import GoalsScreen from './components/GoalsScreen';
import ShoppingListScreen from './components/ShoppingListScreen';
import SavedPlansScreen from './components/SavedPlansScreen';
import AutoPlanScreen from './components/AutoPlanScreen';
import RecipeDetailScreen from './components/RecipeDetailScreen';
import PantryRecipesScreen from './components/PantryRecipesScreen';
import AddToPlanModal from './components/AddToPlanModal';
import BottomNav from './components/BottomNav';
import { ExclamationTriangleIcon, XMarkIcon } from './components/icons/Icons';

// --- Helper Functions ---
const getTotalCookTime = (recipe: Recipe): number => {
    let totalMinutes = 0;
    const parse = (timeStr: string) => {
        let minutes = 0;
        const hourMatch = timeStr.match(/(\d+)\s*hr/);
        const minMatch = timeStr.match(/(\d+)\s*min/);
        if (hourMatch) minutes += parseInt(hourMatch[1], 10) * 60;
        if (minMatch) minutes += parseInt(minMatch[1], 10);
        return minutes;
    };
    totalMinutes += parse(recipe.prepTime);
    totalMinutes += parse(recipe.cookTime);
    return totalMinutes;
};


// --- UI Components for Modals and Toasts ---

const Toast = ({ message, onClear }: { message: string, onClear: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onClear, 3000);
        return () => clearTimeout(timer);
    }, [message, onClear]);

    return (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg z-[101] animate-fade-in-up">
            {message}
        </div>
    );
};

interface SavePlanModalProps {
    title: string;
    initialName: string;
    onClose: () => void;
    onSave: (name: string) => void;
}

const SavePlanModal: React.FC<SavePlanModalProps> = ({ title, initialName, onClose, onSave }) => {
    const [name, setName] = useState(initialName);

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800">{title}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><XMarkIcon className="w-5 h-5 text-gray-600" /></button>
                </div>
                <div>
                    <label htmlFor="planName" className="block text-sm font-medium text-gray-700">Plan Name</label>
                    <input
                        type="text"
                        id="planName"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-800 focus:border-gray-800 sm:text-sm rounded-md"
                        placeholder="e.g., High Protein Week"
                    />
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700">Save</button>
                </div>
            </div>
        </div>
    );
};

interface ConfirmDeleteModalProps {
    onClose: () => void;
    onConfirm: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ onClose, onConfirm }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="ml-4 text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Plan</h3>
                    <div className="mt-2">
                        <p className="text-sm text-gray-500">Are you sure you want to delete this plan? This action cannot be undone.</p>
                    </div>
                </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button onClick={onConfirm} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm">Delete</button>
                <button onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">Cancel</button>
            </div>
        </div>
    </div>
);


// A simple loading overlay for async operations
const LoadingOverlay = ({ message }: { message: string }) => (
  <div className="fixed inset-0 bg-black/60 flex flex-col items-center justify-center z-[100]">
    <div className="text-white text-xl font-bold">{message}</div>
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-white mt-4"></div>
  </div>
);

type ModalState = 
    | { type: 'save'; }
    | { type: 'duplicate'; data: SavedPlan; }
    | { type: 'delete'; data: string; }
    | null;


const App: React.FC = () => {
    // State Initialization
    const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(() => {
        try {
            const savedPrefs = localStorage.getItem('userPreferences');
            return savedPrefs ? JSON.parse(savedPrefs) : null;
        } catch {
            return null;
        }
    });
    
    const [showOnboarding, setShowOnboarding] = useState(!userPreferences);
    const [activeScreen, setActiveScreen] = useState<Screen>(Screen.Planner);
    
    const [weekPlan, setWeekPlan] = useState<WeekPlan>(() => {
        try {
            const savedPlan = localStorage.getItem('weekPlan');
            return savedPlan ? JSON.parse(savedPlan) : EMPTY_WEEK_PLAN;
        } catch {
            return EMPTY_WEEK_PLAN;
        }
    });

    const [pantryItems, setPantryItems] = useState<PantryItem[]>(() => {
        try {
            const savedItems = localStorage.getItem('pantryItems');
            // If there are saved items, parse them. Otherwise, start with an empty array for a new user.
            return savedItems ? JSON.parse(savedItems) : [];
        } catch {
            // In case of a parsing error, also default to an empty array.
            return [];
        }
    });

    const [savedPlans, setSavedPlans] = useState<SavedPlan[]>(() => {
        try {
            const saved = localStorage.getItem('savedPlans');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [recipeToAddToPlan, setRecipeToAddToPlan] = useState<Recipe | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [toastMessage, setToastMessage] = useState<string>('');
    const [modal, setModal] = useState<ModalState>(null);

    // Fix: Initialize Gemini AI client per coding guidelines.
    // The API key is accessed from environment variables and is assumed to be set.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    // Effects for localStorage persistence
    useEffect(() => {
        if (userPreferences) {
            localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
        }
    }, [userPreferences]);

    useEffect(() => {
        localStorage.setItem('weekPlan', JSON.stringify(weekPlan));
    }, [weekPlan]);

    useEffect(() => {
        localStorage.setItem('pantryItems', JSON.stringify(pantryItems));
    }, [pantryItems]);

    useEffect(() => {
        localStorage.setItem('savedPlans', JSON.stringify(savedPlans));
    }, [savedPlans]);
    
    const showToast = (message: string) => {
        setToastMessage(message);
    };

    // Handler Functions
    const handleOnboardingComplete = (preferences: UserPreferences) => {
        setUserPreferences(preferences);
        setShowOnboarding(false);
    };

    const handleViewRecipe = (recipe: Recipe) => {
        setSelectedRecipe(recipe);
    };

    const handleBack = () => {
        if (selectedRecipe) {
          setSelectedRecipe(null);
        } else if (activeScreen === Screen.PantryRecipes) {
          setActiveScreen(Screen.Pantry);
        }
    };
    
    const handleFindRecipes = () => {
        setActiveScreen(Screen.PantryRecipes);
    };

    const handleAddItem = (itemName: string, category: IngredientCategory) => {
        const newItem: PantryItem = { id: new Date().toISOString(), name: itemName, category };
        setPantryItems(prev => [...prev, newItem]);
    };

    const handleRemoveItem = (itemId: string) => {
        setPantryItems(prev => prev.filter(item => item.id !== itemId));
    };

    const handleSavePlan = (name: string) => {
        const planToSave = JSON.parse(JSON.stringify(weekPlan));
        const newSavedPlan: SavedPlan = {
            id: new Date().toISOString(),
            name: name,
            plan: planToSave,
        };
        setSavedPlans(prevPlans => [...prevPlans, newSavedPlan]);
        setModal(null);
        showToast("Plan saved successfully!");
    };
    
    const handleLoadPlan = (plan: WeekPlan) => {
        const planToLoad = JSON.parse(JSON.stringify(plan));
        setWeekPlan(planToLoad);
        setActiveScreen(Screen.Planner);
        showToast("Plan loaded!");
    };
    
    const handleDeletePlan = (planId: string) => {
        setSavedPlans(prevPlans => prevPlans.filter(p => p.id !== planId));
        setModal(null);
        showToast("Plan deleted.");
    };

    const handleDuplicatePlan = (newName: string, originalPlan: SavedPlan) => {
        const duplicatedPlan: SavedPlan = {
            id: new Date().toISOString(),
            name: newName,
            plan: JSON.parse(JSON.stringify(originalPlan.plan)),
        };
        setSavedPlans(prevPlans => [...prevPlans, duplicatedPlan]);
        setModal(null);
        showToast("Plan duplicated!");
    };

    const handleAddToPlan = (recipe: Recipe) => {
        setRecipeToAddToPlan(recipe);
    };

    const handleConfirmAddToPlan = (day: string, mealType: MealType) => {
        if (!recipeToAddToPlan) return;
        const newPlan = weekPlan.map(dayPlan => {
            if (dayPlan.day === day) {
                return { ...dayPlan, [mealType]: { recipe: recipeToAddToPlan } };
            }
            return dayPlan;
        });
        setWeekPlan(newPlan);
        setRecipeToAddToPlan(null);
    };

    const handleRemoveRecipe = (day: string, mealType: MealType) => {
        setWeekPlan(currentPlan => 
            currentPlan.map(dayPlan => {
                if (dayPlan.day === day) {
                    return { ...dayPlan, [mealType]: { recipe: null } };
                }
                return dayPlan;
            })
        );
    };

    const handleResetApp = () => {
        if (window.confirm("Are you sure you want to reset the app? All your data will be permanently deleted.")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const handleAutoPlan = async () => {
        if (!userPreferences) {
            showToast("Please set your preferences first.");
            setActiveScreen(Screen.Planner);
            setShowOnboarding(true);
            return;
        }

        setIsLoading(true);
        setLoadingMessage("Generating your personalized meal plan...");

        // Pre-filter recipes based on user preferences to ensure logical correctness.
        const availableRecipes = MOCK_RECIPES.filter(recipe => {
            // Diet filter
            const dietPreference = userPreferences.diet;
            let dietMatch = true;
            if (dietPreference && dietPreference !== 'non-veg') {
                if (dietPreference === 'vegetarian') {
                    dietMatch = recipe.category === 'vegetarian' || recipe.category === 'vegan';
                } else if (dietPreference === 'vegan') {
                    dietMatch = recipe.category === 'vegan';
                }
            }

            // Cook time filter
            const timePreference = userPreferences.cookTime;
            let timeMatch = true;
            if (timePreference) {
                const maxTime = parseInt(timePreference, 10);
                const recipeTime = getTotalCookTime(recipe);
                timeMatch = recipeTime <= maxTime;
            }

            return dietMatch && timeMatch;
        });
        
        // Check if there are enough recipes to create a varied plan.
        if (availableRecipes.length < 3) {
             showToast("Not enough recipes match your criteria. Try relaxing your preferences.");
             setIsLoading(false);
             setLoadingMessage('');
             return;
        }

        const recipeMap = new Map(availableRecipes.map(r => [r.id, r]));

        const recipesForPrompt = availableRecipes.map(r => ({
            id: r.id,
            name: r.name,
            category: r.category,
            cookTime: r.cookTime,
            prepTime: r.prepTime,
            nutrition: r.nutrition,
            ingredients: r.ingredients.map(i => i.name.split(',')[0]),
        }));

        const prompt = `
            You are a meal planning assistant. Create a 7-day meal plan (Monday to Sunday) for a user with these preferences:
            - Diet: ${userPreferences.diet || 'any'}
            - Max cooking time per meal: ${userPreferences.cookTime || 'any'} minutes
            - Health goal: ${userPreferences.goal || 'any'}

            The user has these ingredients in their pantry: ${pantryItems.map(p => p.name).join(', ')}. Please prioritize recipes that use these ingredients.
            
            Please create a varied and balanced plan. Avoid using the same recipe multiple times. Try to vary the main ingredients (e.g., don't use chicken every day) and the type of dish (e.g., mix salads, bowls, and cooked meals).

            Here is a list of available recipes that ALREADY MATCH the user's diet and time preferences. You MUST choose from this list only:
            ${JSON.stringify(recipesForPrompt)}

            Your response MUST be a JSON array that strictly follows this schema. Only output the JSON array. Do not include any other text, explanations, or markdown.
        `;

        const responseSchema = {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.STRING },
                    breakfast_recipe_id: { type: Type.INTEGER, description: "ID of the recipe for breakfast. Use 0 for no meal." },
                    lunch_recipe_id: { type: Type.INTEGER, description: "ID of the recipe for lunch. Use 0 for no meal." },
                    dinner_recipe_id: { type: Type.INTEGER, description: "ID of the recipe for dinner. Use 0 for no meal." },
                },
                required: ['day', 'breakfast_recipe_id', 'lunch_recipe_id', 'dinner_recipe_id']
            }
        };

        try {
            // Fix: Use Gemini API to generate content with a JSON schema.
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                },
            });

            // Fix: Get text from response and parse it.
            const generatedPlanRaw = JSON.parse(response.text);

            if (!Array.isArray(generatedPlanRaw)) {
                throw new Error("API returned non-array response");
            }

            const newWeekPlan: WeekPlan = generatedPlanRaw.map((day: any) => ({
                day: day.day,
                breakfast: { recipe: recipeMap.get(day.breakfast_recipe_id) || null },
                lunch: { recipe: recipeMap.get(day.lunch_recipe_id) || null },
                dinner: { recipe: recipeMap.get(day.dinner_recipe_id) || null },
            }));

            setWeekPlan(newWeekPlan);
            setActiveScreen(Screen.Planner);

        } catch (error) {
            console.error("Error generating plan:", error);
            showToast("Sorry, there was an error generating your plan.");
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };
    
    const renderModals = () => {
        if (!modal) return null;

        switch (modal.type) {
            case 'save':
                return <SavePlanModal title="Save Plan" initialName={`Plan ${new Date().toLocaleDateString()}`} onClose={() => setModal(null)} onSave={handleSavePlan} />;
            case 'duplicate':
                return <SavePlanModal title="Duplicate Plan" initialName={`${modal.data.name} (Copy)`} onClose={() => setModal(null)} onSave={(name) => handleDuplicatePlan(name, modal.data)} />;
            case 'delete':
                return <ConfirmDeleteModal onClose={() => setModal(null)} onConfirm={() => handleDeletePlan(modal.data)} />;
            default:
                return null;
        }
    };


    // Render Logic
    const renderScreen = () => {
        if (selectedRecipe) {
            return <RecipeDetailScreen recipe={selectedRecipe} onBack={handleBack} onAddToPlan={handleAddToPlan} />;
        }
        
        const planToDuplicate = (planId: string) => {
            const plan = savedPlans.find(p => p.id === planId);
            if (plan) setModal({ type: 'duplicate', data: plan });
        };
        
        switch (activeScreen) {
            case Screen.Planner:
                return <PlannerScreen weekPlan={weekPlan} onViewRecipe={handleViewRecipe} setActiveScreen={setActiveScreen} onSavePlan={() => setModal({type: 'save'})} onRemoveRecipe={handleRemoveRecipe} onResetApp={handleResetApp} />;
            case Screen.Pantry:
                return <PantryScreen pantryItems={pantryItems} onAddItem={handleAddItem} onRemoveItem={handleRemoveItem} onFindRecipes={handleFindRecipes} />;
            case Screen.PantryRecipes:
                return <PantryRecipesScreen allRecipes={MOCK_RECIPES} pantryItems={pantryItems} onAddToPlan={handleAddToPlan} onBack={handleBack} userPreferences={userPreferences} />;
            case Screen.Goals:
                return <GoalsScreen recipes={MOCK_RECIPES} onAddToPlan={handleAddToPlan} userPreferences={userPreferences} />;
            case Screen.ShoppingList:
                return <ShoppingListScreen weekPlan={weekPlan} pantryItems={pantryItems} />;
            case Screen.SavedPlans:
                return <SavedPlansScreen savedPlans={savedPlans} onLoadPlan={handleLoadPlan} onDeletePlan={(planId) => setModal({type: 'delete', data: planId})} onDuplicatePlan={planToDuplicate} />;
            case Screen.AutoPlan:
                return <AutoPlanScreen onAutoPlan={handleAutoPlan} />;
            default:
                return <PlannerScreen weekPlan={weekPlan} onViewRecipe={handleViewRecipe} setActiveScreen={setActiveScreen} onSavePlan={() => setModal({type: 'save'})} onRemoveRecipe={handleRemoveRecipe} onResetApp={handleResetApp}/>;
        }
    };

    if (showOnboarding) {
        return <OnboardingScreen onComplete={handleOnboardingComplete} />;
    }

    const showNav = !selectedRecipe;

    return (
        <div className="max-w-sm mx-auto bg-gray-50 min-h-screen font-sans flex flex-col">
            {isLoading && <LoadingOverlay message={loadingMessage} />}
            {toastMessage && <Toast message={toastMessage} onClear={() => setToastMessage('')} />}
            {renderModals()}
            <main className={`flex-grow ${showNav ? 'pb-16' : ''}`}>
                {renderScreen()}
            </main>
            {recipeToAddToPlan && (
                <AddToPlanModal 
                    recipe={recipeToAddToPlan} 
                    onClose={() => setRecipeToAddToPlan(null)} 
                    onAddToPlan={handleConfirmAddToPlan} 
                />
            )}
            {showNav && <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} />}
        </div>
    );
};

export default App;
