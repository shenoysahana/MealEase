// Fix: Populating the file with necessary type definitions.
export enum Screen {
  Planner = 'PLANNER',
  Pantry = 'PANTRY',
  PantryRecipes = 'PANTRY_RECIPES',
  Goals = 'GOALS',
  ShoppingList = 'SHOPPING_LIST',
  SavedPlans = 'SAVED_PLANS',
  AutoPlan = 'AUTO_PLAN',
  RecipeDetail = 'RECIPE_DETAIL',
}

export type IngredientCategory = 'Produce' | 'Protein' | 'Dairy' | 'Pantry Staples' | 'Spices' | 'Bakery';

export interface Ingredient {
  name: string;
  category: IngredientCategory;
}

export interface Recipe {
  id: number;
  name: string;
  category: 'vegetarian' | 'vegan' | 'non-veg';
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: string;
  cookTime: string;
  servings: number;
  imageUrl: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface Meal {
  recipe: Recipe | null;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface DayPlan {
  day: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
}

export type WeekPlan = DayPlan[];

export interface PantryItem {
  id: string;
  name: string;
}

export interface SavedPlan {
    id: string;
    name: string;
    plan: WeekPlan;
}

export interface UserPreferences {
    diet: 'vegetarian' | 'vegan' | 'non-veg' | null;
    cookTime: '15' | '30' | '60' | null;
    goal: 'loss' | 'maintain' | 'protein' | null;
}