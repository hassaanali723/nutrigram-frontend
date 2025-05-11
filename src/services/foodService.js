import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy,
  Timestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../firebase';
import { compressImage } from '../utils/imageUtils';

// Collection name for food entries
const COLLECTION_NAME = 'food_entries';

// Save a food entry with optional image upload
export async function saveFoodEntry(userId, entry, imageFile = null) {
  try {
    let imageUrl;
    
    if (imageFile) {
      // If a file is uploaded, compress it
      imageUrl = await compressImage(imageFile);
    } else if (entry.image) {
      // If entry has image URL (from API), fetch and compress it
      try {
        const response = await fetch(entry.image);
        const blob = await response.blob();
        const file = new File([blob], 'food-image.jpg', { type: 'image/jpeg' });
        imageUrl = await compressImage(file);
      } catch (error) {
        console.error('Error compressing API image:', error);
        imageUrl = entry.image; // Fallback to original URL if compression fails
      }
    } else {
      // Fallback to null if no image
      imageUrl = null;
    }

    // Convert timestamp to date string
    let dateStr;
    if (typeof entry.timestamp === 'string') {
      dateStr = entry.timestamp.split('T')[0]; // Handle ISO string
    } else if (typeof entry.timestamp === 'number') {
      dateStr = new Date(entry.timestamp).toISOString().split('T')[0]; // Handle timestamp number
    } else {
      dateStr = new Date().toISOString().split('T')[0]; // Fallback to current date
    }

    const entryData = {
      ...entry,
      userId,
      image: imageUrl,
      date: dateStr,
      createdAt: new Date().toISOString()
    };

    // Save food entry to Firestore
    const docRef = await addDoc(collection(db, COLLECTION_NAME), entryData);

    return { 
      id: docRef.id, 
      ...entry,
      image: imageUrl,
      date: dateStr 
    };
  } catch (error) {
    console.error('Error saving food entry:', error);
    throw error;
  }
}

// Get all food entries for a specific user and date
export const getFoodEntriesByDate = async (userId, date) => {
  try {
    const foodRef = collection(db, COLLECTION_NAME);
    // Simplified query without ordering
    const q = query(
      foodRef,
      where('userId', '==', userId),
      where('date', '==', date)
    );
    
    const querySnapshot = await getDocs(q);
    const entries = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    // Sort entries in memory instead
    entries.sort((a, b) => b.timestamp - a.timestamp);
    return entries;
  } catch (error) {
    console.error('Error getting food entries:', error);
    throw error;
  }
};

// Get all unique dates for a user's entries
export async function getAllDates(userId) {
  try {
    const foodRef = collection(db, COLLECTION_NAME);
    // Simplified query without ordering
    const q = query(
      foodRef,
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const dates = new Set();
    querySnapshot.forEach(doc => {
      dates.add(doc.data().date);
    });
    
    const dateArray = Array.from(dates);
    // Sort dates in memory instead
    dateArray.sort((a, b) => b.localeCompare(a));
    return dateArray;
  } catch (error) {
    console.error('Error getting dates:', error);
    throw error;
  }
}

// Delete a food entry
export async function deleteFoodEntry(entryId) {
  try {
    const docRef = doc(db, COLLECTION_NAME, entryId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting food entry:', error);
    throw error;
  }
} 