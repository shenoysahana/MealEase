
// Fix: Implementing the SavedPlansScreen component with a placeholder view.
import React, { useState } from 'react';
import { SavedPlan, WeekPlan } from '../types';
import { TrashIcon, DuplicateIcon, SearchIcon } from './icons/Icons';

interface SavedPlansScreenProps {
  savedPlans: SavedPlan[];
  onLoadPlan: (plan: WeekPlan) => void;
  onDeletePlan: (planId: string) => void;
  onDuplicatePlan: (planId: string) => void;
}

const SavedPlansScreen: React.FC<SavedPlansScreenProps> = ({ savedPlans, onLoadPlan, onDeletePlan, onDuplicatePlan }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlans = savedPlans.filter(plan =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full">
        <header className="p-4 sticky top-0 bg-gray-50/80 backdrop-blur-sm z-10 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">Saved Plans</h1>
        </header>
        <div className="p-4">
            {savedPlans.length === 0 ? (
                <div className="p-4 flex flex-col items-center justify-center text-center text-gray-500 h-96">
                    <p>You have no saved plans yet.</p>
                    <p className="text-sm">Create a plan and save it to see it here.</p>
                </div>
            ) : (
                <>
                    <div className="relative mb-4">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-gray-400" />
                        </span>
                        <input
                            type="text"
                            placeholder="Search saved plans..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-gray-800 focus:border-gray-800"
                            aria-label="Search saved plans"
                        />
                    </div>

                    {filteredPlans.length > 0 ? (
                        <div className="space-y-3">
                            {filteredPlans.map((savedPlan) => (
                                <div key={savedPlan.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                                    <span className="text-gray-800 font-semibold">{savedPlan.name}</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onDuplicatePlan(savedPlan.id)}
                                            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full"
                                            aria-label="Duplicate plan"
                                        >
                                            <DuplicateIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => onDeletePlan(savedPlan.id)}
                                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                                            aria-label="Delete plan"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => onLoadPlan(savedPlan.plan)}
                                            className="px-3 py-1.5 bg-gray-800 text-white text-sm font-semibold rounded-md hover:bg-gray-700"
                                        >
                                            Load
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 flex flex-col items-center justify-center text-center text-gray-500 h-96">
                            <p>No saved plans match your search.</p>
                            <p className="text-sm">Try a different name.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    </div>
  );
};

export default SavedPlansScreen;
