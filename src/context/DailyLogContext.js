import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { saveFoodEntry, getFoodEntriesByDate, getAllDates } from '../services/foodService';

// Utility to get today's date as YYYY-MM-DD
const getToday = () => new Date().toISOString().slice(0, 10);

const DEFAULT_CALORIE_LIMIT = 2400;

// Default structure for a daily log
const defaultLog = () => ({
  entries: [], // { image, nutrition, dish_name, timestamp }
  totals: {
    calories: 0,
    protein_g: 0,
    carbohydrates_total_g: 0,
    sugar_g: 0,
    fat_total_g: 0,
  },
});

const DailyLogContext = createContext();

export function DailyLogProvider({ children }) {
  const { user } = useAuth();
  const [logs, setLogs] = useState({}); // { [date]: { entries, totals } }
  const [selectedDay, setSelectedDay] = useState(getToday());
  const [loading, setLoading] = useState(true);
  const [availableDates, setAvailableDates] = useState([]);
  const [calorieLimit, setCalorieLimit] = useState(DEFAULT_CALORIE_LIMIT);

  // Load dates when user changes
  useEffect(() => {
    const loadDates = async () => {
      if (!user) {
        setLogs({});
        setAvailableDates([]);
        setSelectedDay(getToday());
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Get all dates for this user
        const dates = await getAllDates(user.uid);
        setAvailableDates(dates);
        setLoading(false);
      } catch (error) {
        console.error('Error loading dates:', error);
        setLoading(false);
      }
    };

    loadDates();
  }, [user]);

  // Load entries when selected day changes
  useEffect(() => {
    const loadEntries = async () => {
      if (!user) return;

      try {
        // Get entries for selected day
        const entries = await getFoodEntriesByDate(user.uid, selectedDay);
        
        // Calculate totals from entries
        const totals = entries.reduce((acc, entry) => {
          const n = entry.nutrition || {};
          return {
            calories: (acc.calories || 0) + (n.calories || 0),
            protein_g: (acc.protein_g || 0) + (n.protein_g || 0),
            carbohydrates_total_g: (acc.carbohydrates_total_g || 0) + (n.carbohydrates_total_g || 0),
            sugar_g: (acc.sugar_g || 0) + (n.sugar_g || 0),
            fat_total_g: (acc.fat_total_g || 0) + (n.fat_total_g || 0),
          };
        }, defaultLog().totals);

        // Update logs state
        setLogs(prevLogs => ({
          ...prevLogs,
          [selectedDay]: {
            entries,
            totals,
          }
        }));
      } catch (error) {
        console.error('Error loading entries:', error);
      }
    };

    loadEntries();
  }, [user, selectedDay]);

  // Add a food entry to the selected day
  const addEntry = useCallback(async (entry) => {
    if (!user) return;

    try {
      // Save to Firebase with user ID
      const savedEntry = await saveFoodEntry(user.uid, entry);
      
      // Update local state
      setLogs(prev => {
        const day = savedEntry.date;
        const prevLog = prev[day] || defaultLog();
        const newEntries = [...prevLog.entries, savedEntry];
        
        // Calculate new totals
        const n = entry.nutrition || {};
        const newTotals = {
          calories: (prevLog.totals.calories || 0) + (n.calories || 0),
          protein_g: (prevLog.totals.protein_g || 0) + (n.protein_g || 0),
          carbohydrates_total_g: (prevLog.totals.carbohydrates_total_g || 0) + (n.carbohydrates_total_g || 0),
          sugar_g: (prevLog.totals.sugar_g || 0) + (n.sugar_g || 0),
          fat_total_g: (prevLog.totals.fat_total_g || 0) + (n.fat_total_g || 0),
        };

        return {
          ...prev,
          [day]: {
            entries: newEntries,
            totals: newTotals,
          },
        };
      });

      // Update available dates if this is a new date
      if (!availableDates.includes(savedEntry.date)) {
        setAvailableDates(prev => [...prev, savedEntry.date].sort((a, b) => b.localeCompare(a)));
      }
    } catch (error) {
      console.error('Error adding entry:', error);
      throw error;
    }
  }, [user, availableDates]);

  // Get current day's log
  const currentLog = logs[selectedDay] || defaultLog();

  // Delete a food entry
  const deleteEntry = useCallback(async (entryId) => {
    if (!user) return;

    try {
      // Find the entry to get its nutrition values for updating totals
      const entryToDelete = logs[selectedDay]?.entries.find(e => e.id === entryId);
      if (!entryToDelete) return;

      // Update local state
      setLogs(prev => {
        const day = selectedDay;
        const prevLog = prev[day] || defaultLog();
        const newEntries = prevLog.entries.filter(e => e.id !== entryId);
        
        // Subtract the deleted entry's nutrition values from totals
        const n = entryToDelete.nutrition || {};
        const newTotals = {
          calories: Math.max(0, (prevLog.totals.calories || 0) - (n.calories || 0)),
          protein_g: Math.max(0, (prevLog.totals.protein_g || 0) - (n.protein_g || 0)),
          carbohydrates_total_g: Math.max(0, (prevLog.totals.carbohydrates_total_g || 0) - (n.carbohydrates_total_g || 0)),
          sugar_g: Math.max(0, (prevLog.totals.sugar_g || 0) - (n.sugar_g || 0)),
          fat_total_g: Math.max(0, (prevLog.totals.fat_total_g || 0) - (n.fat_total_g || 0)),
        };

        return {
          ...prev,
          [day]: {
            entries: newEntries,
            totals: newTotals,
          },
        };
      });

      // If this was the last entry for this day, remove the day from available dates
      if (logs[selectedDay]?.entries.length === 1) {
        setAvailableDates(prev => prev.filter(date => date !== selectedDay));
      }

    } catch (error) {
      console.error('Error deleting entry:', error);
      throw error;
    }
  }, [user, selectedDay, logs]);

  // Reset today's log (for a new day)
  const resetDay = useCallback((date = getToday()) => {
    setLogs(prev => ({ ...prev, [date]: defaultLog() }));
    setSelectedDay(date);
  }, []);

  // Select a day to view
  const selectDay = useCallback((date) => {
    setSelectedDay(date);
  }, []);

  const value = {
    logs,
    selectedDay,
    currentLog,
    allDays: availableDates,
    addEntry,
    deleteEntry,
    resetDay,
    selectDay,
    loading,
    calorieLimit,
    setCalorieLimit,
    DEFAULT_CALORIE_LIMIT
  };

  return (
    <DailyLogContext.Provider value={value}>
      {children}
    </DailyLogContext.Provider>
  );
}

export function useDailyLogContext() {
  const context = useContext(DailyLogContext);
  if (!context) {
    throw new Error('useDailyLogContext must be used within DailyLogProvider');
  }
  return context;
} 