
import React, { useState, useEffect } from 'react';
// Fix: Import Gemini AI SDK and Type enum.
import { GoogleGenAI, Type } from "@google/genai";
import { Screen, WeekPlan, Recipe, PantryItem, UserPreferences, SavedPlan, MealType } from './types';
import { MOCK_RECIPES, EMPTY_WEEK_PLAN, MOCK_PANTRY_ITEMS } from './data';

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

// A simple loading overlay for async operations
const LoadingOverlay = ({ message }: { message: string }) => (
  <div className="fixed inset-0 bg-black/60 flex flex-col items-center justify-center z-[100]">
    <div className="text-white text-xl font-bold">{message}</div>
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-white mt-4"></div>
  </div>
);

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
            return savedItems ? JSON.parse(savedItems) : MOCK_PANTRY_ITEMS;
        } catch {
            return MOCK_PANTRY_ITEMS;
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

    const handleAddItem = (itemName: string) => {
        const newItem: PantryItem = { id: new Date().toISOString(), name: itemName };
        setPantryItems(prev => [...prev, newItem]);
    };

    const handleRemoveItem = (itemId: string) => {
        setPantryItems(prev => prev.filter(item => item.id !== itemId));
    };

    const handleSavePlan = () => {
        const planName = prompt("Enter a name for your plan:", `Plan ${new Date().toLocaleDateString()}`);
        if (planName) {
            const newSavedPlan: SavedPlan = {
                id: new Date().toISOString(),
                name: planName,
                plan: weekPlan
            };
            setSavedPlans(prevPlans => {
                const updatedPlans = [...prevPlans, newSavedPlan];
                // Persist the new state immediately to prevent race conditions
                localStorage.setItem('savedPlans', JSON.stringify(updatedPlans));
                return updatedPlans;
            });
            alert("Plan saved!");
        }
    };
    
    const handleLoadPlan = (plan: WeekPlan) => {
        setWeekPlan(plan);
        setActiveScreen(Screen.Planner);
        alert("Plan loaded!");
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
        if (window.confirm("Are you sure you want to remove this meal?")) {
            setWeekPlan(currentPlan => 
                currentPlan.map(dayPlan => {
                    if (dayPlan.day === day) {
                        return { ...dayPlan, [mealType]: { recipe: null } };
                    }
                    return dayPlan;
                })
            );
        }
    };

    const handleResetApp = () => {
        if (window.confirm("Are you sure you want to reset the app? All your data will be permanently deleted.")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const handleAutoPlan = async () => {
        if (!userPreferences) {
            alert("Please set your preferences first.");
            setActiveScreen(Screen.Planner);
            setShowOnboarding(true);
            return;
        }

        setIsLoading(true);
        setLoadingMessage("Generating your personalized meal plan...");

        const recipeMap = new Map(MOCK_RECIPES.map(r => [r.id, r]));

        const recipesForPrompt = MOCK_RECIPES.map(r => ({
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

            Here is a list of available recipes. Please choose from this list:
            ${JSON.stringify(recipesForPrompt)}

            Your response MUST be a JSON array that strictly follows this schema. Only output the JSON array.
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
            alert("Sorry, there was an error generating your plan. Please try again.");
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };


    // Render Logic
    const renderScreen = () => {
        if (selectedRecipe) {
            return <RecipeDetailScreen recipe={selectedRecipe} onBack={handleBack} onAddToPlan={handleAddToPlan} />;
        }
        switch (activeScreen) {
            case Screen.Planner:
                return <PlannerScreen weekPlan={weekPlan} onViewRecipe={handleViewRecipe} setActiveScreen={setActiveScreen} onSavePlan={handleSavePlan} onRemoveRecipe={handleRemoveRecipe} onResetApp={handleResetApp} />;
            case Screen.Pantry:
                return <PantryScreen pantryItems={pantryItems} onAddItem={handleAddItem} onRemoveItem={handleRemoveItem} onFindRecipes={handleFindRecipes} />;
            case Screen.PantryRecipes:
                return <PantryRecipesScreen allRecipes={MOCK_RECIPES} pantryItems={pantryItems} onAddToPlan={handleAddToPlan} onBack={handleBack} />;
            case Screen.Goals:
                return <GoalsScreen recipes={MOCK_RECIPES} onAddToPlan={handleAddToPlan} />;
            case Screen.ShoppingList:
                return <ShoppingListScreen weekPlan={weekPlan} pantryItems={pantryItems} />;
            case Screen.SavedPlans:
                return <SavedPlansScreen savedPlans={savedPlans} onLoadPlan={handleLoadPlan} />;
            case Screen.AutoPlan:
                return <AutoPlanScreen onAutoPlan={handleAutoPlan} />;
            default:
                return <PlannerScreen weekPlan={weekPlan} onViewRecipe={handleViewRecipe} setActiveScreen={setActiveScreen} onSavePlan={handleSavePlan} onRemoveRecipe={handleRemoveRecipe} onResetApp={handleResetApp}/>;
        }
    };

    if (showOnboarding) {
        return <OnboardingScreen onComplete={handleOnboardingComplete} />;
    }

    const showNav = !selectedRecipe;

    return (
        <div className="max-w-sm mx-auto bg-gray-50 min-h-screen font-sans flex flex-col">
            {isLoading && <LoadingOverlay message={loadingMessage} />}
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
