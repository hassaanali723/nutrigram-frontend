import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function FoodUpload({ onAddEntry }) {
  const { user } = useAuth();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError('');
    setIsExpanded(false);
  };

  const handleImageAnalysis = async (file) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error('You must be logged in to upload images');
      }

      const token = await user.getIdToken();
      
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/food/analyze-food-image/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log('token: ',token);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to analyze image');
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (!data.contains_food) {
        setError(data.message || 'No food items detected in the image');
        return;
      }
      
      if (data.success) {
        const newEntry = {
          dish_name: data.dish_name || '',
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          image: URL.createObjectURL(file),
          nutrition: {
            calories: data.combined_nutrition.calories,
            carbohydrates_total_g: data.combined_nutrition.carbohydrates_total_g,
            cholesterol_mg: data.combined_nutrition.cholesterol_mg,
            fat_saturated_g: data.combined_nutrition.fat_saturated_g,
            fat_total_g: data.combined_nutrition.fat_total_g,
            fiber_g: data.combined_nutrition.fiber_g,
            potassium_mg: data.combined_nutrition.potassium_mg,
            protein_g: data.combined_nutrition.protein_g,
            serving_size_g: data.combined_nutrition.serving_size_g,
            sodium_mg: data.combined_nutrition.sodium_mg,
            sugar_g: data.combined_nutrition.sugar_g
          },
          timestamp: Date.now(),
          userId: user.uid
        };
        onAddEntry(newEntry);
        setPreview(null);
        setImage(null);
        setError('');
      } else {
        throw new Error(data.message || 'Failed to analyze image');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return;
    
    setLoading(true);
    setError('');
    
    try {
      await handleImageAnalysis(image);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm relative"
      aria-label="Food upload form"
    >
      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageChange}
        className="hidden"
        tabIndex={-1}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
        tabIndex={-1}
      />

      {/* Preview and Analysis Section */}
      {preview && (
        <div className="bg-white rounded-lg shadow p-4 mb-4 relative z-10">
          {/* Close button */}
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              setImage(null);
              setError('');
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
            aria-label="Remove image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <img
            src={preview}
            alt="Preview of selected food"
            className="w-full h-48 object-cover rounded-lg border mb-2"
          />
          <button
            type="submit"
            disabled={!image || loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {loading ? 'Analyzing...' : 'Analyze Food'}
          </button>
          {error && <p className="text-red-500 mt-2 text-center" role="alert">{error}</p>}
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="fixed bottom-24 right-4 sm:right-1/2 sm:translate-x-[12rem] flex flex-col items-end space-y-2 z-50">
        {/* Gallery FAB */}
        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          className={`p-3 rounded-full bg-blue-600 text-white shadow-lg transform transition-all duration-200 ${
            isExpanded ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-75'
          }`}
          aria-label="Upload from Gallery"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>

        {/* Camera FAB */}
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className={`p-3 rounded-full bg-green-600 text-white shadow-lg transform transition-all duration-200 ${
            isExpanded ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-75'
          }`}
          aria-label="Take Photo"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* Main FAB */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-4 rounded-full bg-blue-600 text-white shadow-lg transform transition-transform hover:scale-110 active:scale-95"
          aria-label="Add Food"
          aria-expanded={isExpanded}
        >
          <svg 
            className={`w-8 h-8 transform transition-transform duration-200 ${isExpanded ? 'rotate-45' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </form>
  );
} 