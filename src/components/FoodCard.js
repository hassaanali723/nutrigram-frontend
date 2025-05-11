import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { deleteFoodEntry } from '../services/foodService';

const displayValue = (val) => {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') {
    // First convert to string with 1 decimal place
    const rounded = val.toFixed(1);
    // If it ends in .0, remove the decimal
    return rounded.endsWith('.0') ? Math.round(val) : rounded;
  }
  return val;
};

export default function FoodCard({ entry, onDelete }) {
  const [showMore, setShowMore] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { image, nutrition, dish_name, timestamp, id } = entry;

  const handleDelete = async () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteFoodEntry(id);
      onDelete(id);
    } catch (error) {
      console.error('Error deleting entry:', error);
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div 
      className="w-full max-w-sm bg-white rounded-lg shadow-sm overflow-hidden mb-3 relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Delete button */}
      <button
        onClick={handleDelete}
        className={`absolute top-2 right-2 z-10 p-1 rounded-full bg-red-100 hover:bg-red-200 transition-opacity duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
        aria-label="Delete entry"
      >
        <svg
          className="w-4 h-4 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Delete Food Entry</h3>
            <p className="text-gray-500 mb-5">Are you sure you want to delete this food entry? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main card content */}
      <div className="flex p-3">
        {/* Left side - Image */}
        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={image || '/placeholder-food.jpg'}
            alt={dish_name || 'Food'}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right side - Content */}
        <div className="flex-1 ml-3">
          <div className="flex items-center justify-between pr-8">
            <h3 className="font-medium text-gray-900">{dish_name || 'Dish'}</h3>
            <button 
              onClick={() => setShowMore(!showMore)}
              className="text-gray-400 hover:text-gray-600 ml-2"
              aria-expanded={showMore}
              aria-controls={`nutrition-details-${timestamp}`}
            >
              <svg 
                className={`w-5 h-5 transform transition-transform ${showMore ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          {/* Key metrics with improved UI */}
          <div className="flex items-center mt-1 text-sm space-x-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
              {displayValue(nutrition?.calories)} cal
            </span>
            <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-medium">
              {displayValue(nutrition?.protein_g)}g protein
            </span>
          </div>
        </div>
      </div>

      {/* Expandable section */}
      {showMore && (
        <div className="px-4 pb-4 pt-2 bg-gray-50" id={`nutrition-details-${timestamp}`}>
          {/* Main nutrition metrics */}
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="flex items-center mb-2">
                <span className="text-yellow-600">🌾</span>
                <span className="text-gray-600 ml-2">Carbs</span>
              </div>
              <span className="text-2xl font-semibold text-gray-900">{displayValue(nutrition?.carbohydrates_total_g)}g</span>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="flex items-center mb-2">
                <span className="text-red-600">💧</span>
                <span className="text-gray-600 ml-2">Fat</span>
              </div>
              <span className="text-2xl font-semibold text-gray-900">{displayValue(nutrition?.fat_total_g)}g</span>
            </div>
          </div>

          {/* Secondary metrics */}
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <div className="flex items-center">
                <span className="text-pink-600">🍬</span>
                <span className="text-gray-600 ml-2">Sugar</span>
              </div>
              <span className="font-medium text-gray-900">{displayValue(nutrition?.sugar_g)}g</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <div className="flex items-center">
                <span className="text-purple-600">🧂</span>
                <span className="text-gray-600 ml-2">Sodium</span>
              </div>
              <span className="font-medium text-gray-900">{displayValue(nutrition?.sodium_mg)}mg</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <div className="flex items-center">
                <span className="text-orange-600">🥕</span>
                <span className="text-gray-600 ml-2">Fiber</span>
              </div>
              <span className="font-medium text-gray-900">{displayValue(nutrition?.fiber_g)}g</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <div className="flex items-center">
                <span className="text-blue-600">⚡</span>
                <span className="text-gray-600 ml-2">Potassium</span>
              </div>
              <span className="font-medium text-gray-900">{displayValue(nutrition?.potassium_mg)}mg</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <div className="flex items-center">
                <span className="text-red-600">❤️</span>
                <span className="text-gray-600 ml-2">Cholesterol</span>
              </div>
              <span className="font-medium text-gray-900">{displayValue(nutrition?.cholesterol_mg)}mg</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <span className="text-green-600">⚖️</span>
                <span className="text-gray-600 ml-2">Serving Size</span>
              </div>
              <span className="font-medium text-gray-900">{displayValue(nutrition?.serving_size_g)}g</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

FoodCard.propTypes = {
  entry: PropTypes.shape({
    id: PropTypes.string.isRequired,
    image: PropTypes.string,
    nutrition: PropTypes.object,
    dish_name: PropTypes.string,
    timestamp: PropTypes.number,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
}; 