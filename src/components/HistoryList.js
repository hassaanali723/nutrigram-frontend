import React from 'react';
import PropTypes from 'prop-types';

export default function HistoryList({ allDays, selectedDay, onSelectDay, loading }) {
  return (
    <div className="w-full max-w-sm mb-4">
      <h3 className="text-md font-semibold mb-2 text-gray-700">Recently Eaten</h3>
      <div className="flex flex-wrap gap-2">
        {loading ? (
          <div className="text-gray-500">Loading history...</div>
        ) : allDays.length === 0 ? (
          <div className="text-gray-500">No entries yet</div>
        ) : (
          allDays.map((day) => (
            <button
              key={day}
              className={`px-3 py-1 rounded-lg text-sm font-medium border ${
                day === selectedDay
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
              }`}
              onClick={() => onSelectDay(day)}
              aria-current={day === selectedDay ? 'date' : undefined}
            >
              {day}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

HistoryList.propTypes = {
  allDays: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedDay: PropTypes.string.isRequired,
  onSelectDay: PropTypes.func.isRequired,
  loading: PropTypes.bool,
}; 