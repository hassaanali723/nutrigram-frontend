import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { logOut } from '../services/authService';
import CalorieCounter from '../components/CalorieCounter';
import FoodUpload from '../components/FoodUpload';
import FoodCard from '../components/FoodCard';
import HistoryList from '../components/HistoryList';
import { useDailyLogContext } from '../context/DailyLogContext';
import { getAuth } from 'firebase/auth';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const {
    currentLog,
    addEntry,
    deleteEntry,
    allDays,
    selectedDay,
    selectDay,
    loading,
    calorieLimit,
    setCalorieLimit,
    DEFAULT_CALORIE_LIMIT
  } = useDailyLogContext();

  const [showCaloriePopup, setShowCaloriePopup] = useState(false);
  const [tempCalorieLimit, setTempCalorieLimit] = useState(calorieLimit);

  const handleLogout = async () => {
    try {
      await logOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleCalorieLimitSubmit = (e) => {
    e.preventDefault();
    const newLimit = parseInt(tempCalorieLimit);
    if (!isNaN(newLimit) && newLimit >= 500 && newLimit <= 10000) {
      setCalorieLimit(newLimit);
      setShowCaloriePopup(false);
    } else {
      alert('Please enter a valid calorie limit between 500 and 10,000');
    }
  };

  const handleCalorieLimitReset = () => {
    setCalorieLimit(DEFAULT_CALORIE_LIMIT);
    setTempCalorieLimit(DEFAULT_CALORIE_LIMIT);
    setShowCaloriePopup(false);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-2 py-4 bg-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">NutriGram</h1>
          <div className="flex items-center space-x-2">
           
            {/* Settings Button */}
            <button
              onClick={() => setShowCaloriePopup(true)}
              className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              title="Calorie Limit Settings"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              title="Logout"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Calorie Limit Popup */}
        {showCaloriePopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <h2 className="text-xl font-semibold mb-4">Daily Calorie Limit</h2>
              <form onSubmit={handleCalorieLimitSubmit}>
                <div className="mb-4">
                  <label htmlFor="calorieLimit" className="block text-sm font-medium text-gray-700 mb-1">
                    Set your daily calorie target
                  </label>
                  <input
                    type="number"
                    id="calorieLimit"
                    value={tempCalorieLimit}
                    onChange={(e) => setTempCalorieLimit(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="500"
                    max="10000"
                    step="1"
                  />
                  <p className="mt-1 text-sm text-gray-500">Enter a value between 500 and 10,000 calories</p>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={handleCalorieLimitReset}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Reset to Default
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCaloriePopup(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <p className="mb-4 text-left text-gray-600 max-w-full break-words text-sm sm:text-base">
          {user?.displayName ? `Hi ${user.displayName.split(' ')[0]}! ` : 'Hi! '}
          <br></br>Snap or upload your food to get instant nutrition facts!
        </p>
        <CalorieCounter totals={currentLog.totals} calorieLimit={calorieLimit} />
        <FoodUpload onAddEntry={addEntry} />
        <HistoryList 
          allDays={allDays} 
          selectedDay={selectedDay} 
          onSelectDay={selectDay}
          loading={loading}
        />
        <div className="w-full max-w-sm">
          {currentLog.entries.length === 0 ? (
            <div className="text-center text-gray-400 mt-8">No food entries for this day.</div>
          ) : (
            currentLog.entries
              .slice()
              .reverse()
              .map((entry) => (
                <FoodCard 
                  key={entry.timestamp} 
                  entry={entry} 
                  onDelete={deleteEntry}
                />
              ))
          )}
        </div>
        <footer className="mt-8 text-xs text-gray-400 text-center">
          NutriGram &copy; {new Date().getFullYear()}
        </footer>
      </main>
    </div>
  );
} 