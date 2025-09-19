import React from 'react';
import { Screen } from '../types';
import { CalendarIcon, PantryIcon, ListIcon, BookmarkIcon, BoltIcon } from './icons/Icons';

interface BottomNavProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
}

const navItems = [
  { screen: Screen.Planner, label: 'Planner', icon: CalendarIcon },
  { screen: Screen.Pantry, label: 'Pantry', icon: PantryIcon },
  { screen: Screen.Goals, label: 'Goals', icon: BoltIcon },
  { screen: Screen.ShoppingList, label: 'Shopping', icon: ListIcon },
  { screen: Screen.SavedPlans, label: 'Saved', icon: BookmarkIcon },
];

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setActiveScreen }) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 max-w-sm mx-auto bg-white border-t border-gray-300 z-20">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = activeScreen === item.screen;
          return (
            <button
              key={item.screen}
              onClick={() => setActiveScreen(item.screen)}
              className={`flex flex-col items-center justify-center text-xs w-full transition-colors duration-200 ${
                isActive ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              <item.icon className={`w-6 h-6 mb-1 ${isActive ? 'stroke-gray-900' : 'stroke-gray-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </footer>
  );
};

export default BottomNav;