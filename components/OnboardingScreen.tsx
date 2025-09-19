

import React, { useState } from 'react';
import { UserPreferences } from '../types';

interface OnboardingScreenProps {
  onComplete: (preferences: UserPreferences) => void;
}

type DietOption = 'non-veg' | 'vegetarian' | 'vegan';
type TimeOption = '15' | '30' | '60';
type GoalOption = 'loss' | 'maintain' | 'protein';

const WelcomeStep = ({ onStart }: { onStart: () => void }) => (
    <div className="relative w-full h-full flex flex-col justify-end text-white">
        <div className="absolute inset-0">
            <img 
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop" 
                alt="Fresh ingredients" 
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        </div>
        <div className="relative z-10 p-8 text-center">
            <h1 className="text-5xl font-bold mb-2 tracking-tight">MealEase</h1>
            <p className="text-lg text-gray-200 mb-8">Your Week, Planned in Minutes.</p>
            <p className="text-base text-gray-300 mb-12">
                Welcome! Let's create delicious, personalized meal plans that fit your lifestyle.
            </p>
            <button
                onClick={onStart}
                className="w-full py-4 bg-white text-gray-900 rounded-lg font-bold text-lg shadow-lg hover:bg-gray-200 transition-colors"
            >
                Get Started
            </button>
        </div>
    </div>
);


const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0); // Start with welcome step
  const [preferences, setPreferences] = useState<UserPreferences>({ diet: null, cookTime: null, goal: null });
  const totalSteps = 3;

  const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSelect = (key: keyof UserPreferences, value: string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  }

  const handleFinish = () => {
    onComplete(preferences);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <OnboardingStep title="Dietary Preferences">
            <OptionButton selected={preferences.diet === 'non-veg'} onClick={() => handleSelect('diet', 'non-veg')}>Non-Vegetarian</OptionButton>
            <OptionButton selected={preferences.diet === 'vegetarian'} onClick={() => handleSelect('diet', 'vegetarian')}>Vegetarian</OptionButton>
            <OptionButton selected={preferences.diet === 'vegan'} onClick={() => handleSelect('diet', 'vegan')}>Vegan</OptionButton>
          </OnboardingStep>
        );
      case 2:
        return (
          <OnboardingStep title="Cooking Time Per Meal">
            <OptionButton selected={preferences.cookTime === '15'} onClick={() => handleSelect('cookTime', '15')}>15 minutes</OptionButton>
            <OptionButton selected={preferences.cookTime === '30'} onClick={() => handleSelect('cookTime', '30')}>30 minutes</OptionButton>
            <OptionButton selected={preferences.cookTime === '60'} onClick={() => handleSelect('cookTime', '60')}>60 minutes</OptionButton>
          </OnboardingStep>
        );
      case 3:
        return (
          <OnboardingStep title="Health Goals">
            <OptionButton selected={preferences.goal === 'loss'} onClick={() => handleSelect('goal', 'loss')}>Weight Loss</OptionButton>
            <OptionButton selected={preferences.goal === 'maintain'} onClick={() => handleSelect('goal', 'maintain')}>Maintain Weight</OptionButton>
            <OptionButton selected={preferences.goal === 'protein'} onClick={() => handleSelect('goal', 'protein')}>High Protein</OptionButton>
          </OnboardingStep>
        );
      default:
        return null;
    }
  };

  if (step === 0) {
      return (
          <div className="max-w-sm mx-auto bg-white min-h-screen font-sans">
              <WelcomeStep onStart={() => setStep(1)} />
          </div>
      );
  }

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen p-6 flex flex-col justify-between font-sans">
      <header>
        <div className="text-sm text-gray-500">Step {step} of {totalSteps}</div>
        <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
          <div
            className="bg-gray-800 h-1 rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>
      </header>
      
      <main className="flex-grow flex items-center">
        {renderStep()}
      </main>

      <footer className="flex gap-4">
        {step > 1 && (
          <button
            onClick={prevStep}
            className="w-full py-3 border border-gray-300 rounded-lg text-gray-800 font-semibold"
          >
            Back
          </button>
        )}
        {step < totalSteps ? (
          <button
            onClick={nextStep}
            className="w-full py-3 bg-gray-800 text-white rounded-lg font-semibold"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="w-full py-3 bg-gray-800 text-white rounded-lg font-semibold"
          >
            Finish
          </button>
        )}
      </footer>
    </div>
  );
};

const OnboardingStep: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="w-full text-center">
    <h1 className="text-2xl font-bold text-gray-800 mb-8">{title}</h1>
    <div className="space-y-4">{children}</div>
  </div>
);

const OptionButton: React.FC<{ children: React.ReactNode, selected: boolean, onClick: () => void }> = ({ children, selected, onClick }) => (
    <button 
        onClick={onClick}
        className={`w-full py-4 border-2 rounded-lg text-lg transition-colors ${selected ? 'border-gray-800 bg-gray-100 text-gray-900' : 'border-gray-300 text-gray-700 hover:border-gray-800 hover:bg-gray-50'}`}
    >
        {children}
    </button>
);


export default OnboardingScreen;
