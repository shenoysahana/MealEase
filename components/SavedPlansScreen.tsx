// Fix: Implementing the SavedPlansScreen component with a placeholder view.
import React from 'react';
import { SavedPlan, WeekPlan } from '../types';

interface SavedPlansScreenProps {
  savedPlans: SavedPlan[];
  onLoadPlan: (plan: WeekPlan) => void;
}

const SavedPlansScreen: React.FC<SavedPlansScreenProps> = ({ savedPlans, onLoadPlan }) => {
  return (
    <div className="w-full">
        <header className="p-4 sticky top-0 bg-gray-50/80 backdrop-blur-sm z-10 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">Saved Plans</h1>
        </header>
        <div className="p-4">
            {savedPlans.length > 0 ? (
                <div className="space-y-3">
                    {savedPlans.map((savedPlan) => (
                        <div key={savedPlan.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                            <span className="text-gray-800 font-semibold">{savedPlan.name}</span>
                            <button 
                                onClick={() => onLoadPlan(savedPlan.plan)}
                                className="px-3 py-1.5 bg-gray-100 text-gray-800 text-sm font-semibold rounded-md hover:bg-gray-200"
                            >
                                Load Plan
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-4 flex flex-col items-center justify-center text-center text-gray-500 h-96">
                    <p>You have no saved plans yet.</p>
                    <p className="text-sm">Create a plan and save it to see it here.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default SavedPlansScreen;