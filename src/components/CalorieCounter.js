import React from 'react';
import PropTypes from 'prop-types';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const macroLabels = [
  { key: 'protein_g', label: 'Protein', color: 'bg-green-50', text: 'text-green-700', icon: '⚡' },
  { key: 'carbohydrates_total_g', label: 'Carbs', color: 'bg-yellow-50', text: 'text-yellow-700', icon: '🌾' },
  { key: 'sugar_g', label: 'Sugar', color: 'bg-pink-50', text: 'text-pink-700', icon: '🍬' },
  { key: 'fat_total_g', label: 'Fat', color: 'bg-red-50', text: 'text-red-700', icon: '💧' },
];

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

function getProgress(consumed, goal) {
  if (!goal) return 0;
  const percent = Math.min(consumed / goal, 1) * 100;
  return percent;
}

export default function CalorieCounter({ totals, calorieLimit }) {
  const caloriesConsumed = totals.calories || 0;
  const progress = getProgress(caloriesConsumed, calorieLimit);

  return (
    <div className="w-full max-w-sm flex flex-col items-center mb-4">
      {/* Modern Circular Progress Bar */}
      <div className="w-32 h-32 mb-4">
        <div className="relative">
          <CircularProgressbar
            value={progress}
            text={`${displayValue(caloriesConsumed)}`}
            styles={buildStyles({
              // Colors
              pathColor: progress >= 100 ? '#ef4444' : '#3b82f6',
              textColor: progress >= 100 ? '#dc2626' : '#1e40af',
              trailColor: '#f1f5f9',
              
              // Text size and styling
              textSize: '16px',
              
              // Animation
              pathTransitionDuration: 0.7,
              pathTransition: 'ease-in-out',
            })}
          />
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <span className="text-[10px] text-gray-600">/ {calorieLimit}</span>
          </div>
        </div>
      </div>

      {/* Macro Cards Row */}
      <div className="flex w-full gap-2 justify-between">
        {macroLabels.map(({ key, label, color, text, icon }) => (
          <div
            key={key}
            className={`flex-1 flex flex-col items-center rounded-xl p-2 ${color} shadow-sm`}
          >
            <span className="text-xl mb-1">{icon}</span>
            <span className={`font-bold text-base ${text}`}>{displayValue(totals[key])}g</span>
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

CalorieCounter.propTypes = {
  totals: PropTypes.shape({
    calories: PropTypes.number,
    protein_g: PropTypes.number,
    carbohydrates_total_g: PropTypes.number,
    sugar_g: PropTypes.number,
    fat_total_g: PropTypes.number,
  }).isRequired,
  calorieLimit: PropTypes.number.isRequired,
}; 