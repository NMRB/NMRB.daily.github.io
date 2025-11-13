// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA815MPlyliYBKzxWa6cA1N_XuOP-w1MPU",
  authDomain: "checklist-173c5.firebaseapp.com",
  projectId: "checklist-173c5",
  storageBucket: "checklist-173c5.firebasestorage.app",
  messagingSenderId: "273109916207",
  appId: "1:273109916207:web:f3ead097995be6a55644da",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Utility function to get today's date string
const getTodayString = () => {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
};

// Save daily checklist data to Firebase
export const saveDailyChecklistToFirebase = async (checklistData) => {
  try {
    const today = getTodayString();
    const docRef = doc(db, 'dailyChecklists', today);
    
    const dataToSave = {
      ...checklistData,
      date: today,
      lastUpdated: serverTimestamp(),
      completedAt: new Date().toISOString()
    };
    
    await setDoc(docRef, dataToSave, { merge: true });
    console.log('Daily checklist saved to Firebase:', today);
    return { success: true, date: today };
  } catch (error) {
    console.error('Error saving to Firebase:', error);
    return { success: false, error: error.message };
  }
};

// Load daily checklist data from Firebase
export const loadDailyChecklistFromFirebase = async (date = null) => {
  try {
    const targetDate = date || getTodayString();
    const docRef = doc(db, 'dailyChecklists', targetDate);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('Daily checklist loaded from Firebase:', targetDate);
      return { success: true, data, date: targetDate };
    } else {
      console.log('No checklist found for date:', targetDate);
      return { success: false, error: 'No data found for this date', date: targetDate };
    }
  } catch (error) {
    console.error('Error loading from Firebase:', error);
    return { success: false, error: error.message };
  }
};

// Save checklist completion event to history collection
export const saveChecklistCompletionEvent = async (eventData) => {
  try {
    const eventsRef = collection(db, 'checklistEvents');
    const docRef = await addDoc(eventsRef, {
      ...eventData,
      timestamp: serverTimestamp(),
      date: getTodayString()
    });
    
    console.log('Checklist event saved with ID:', docRef.id);
    return { success: true, eventId: docRef.id };
  } catch (error) {
    console.error('Error saving checklist event:', error);
    return { success: false, error: error.message };
  }
};

// Auto-save function that can be called periodically
export const autoSaveToFirebase = async (allChecklistData) => {
  return await saveDailyChecklistToFirebase(allChecklistData);
};

export default app;
