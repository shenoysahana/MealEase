import React from 'react';
import { BoltIcon } from './icons/Icons';

interface AutoPlanScreenProps {
  onAutoPlan: () => void;
}

const AutoPlanScreen: React.FC<AutoPlanScreenProps> = ({ onAutoPlan }) => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Quick Auto-Plan</h1>
      <p className="text-gray-500 mb-12 max-w-xs">
        Generate a full week of meals based on your preferences, pantry, and goals with one tap.
      </p>
      
      <button 
        onClick={onAutoPlan}
        className="w-full max-w-xs py-4 px-6 bg-gray-800 text-white rounded-lg font-semibold text-lg flex items-center justify-center shadow-lg hover:bg-gray-700 transition-colors"
      >
        <BoltIcon className="w-6 h-6 mr-3"/>
        Generate Weekly Plan
      </button>

      <div className="mt-12 text-sm text-gray-400 border border-dashed border-gray-300 p-4 rounded-lg">
        <p>You'll be able to review and swap any meal before confirming.</p>
      </div>
    </div>
  );
};

export default AutoPlanScreen;