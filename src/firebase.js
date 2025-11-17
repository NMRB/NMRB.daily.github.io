// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
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

// Initialize Auth
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Export auth functions for use in components
export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
};

// Utility function to get today's date string
const getTodayString = () => {
  return new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
};

// Save daily checklist data to Firebase
export const saveDailyChecklistToFirebase = async (
  checklistData,
  userId = null
) => {
  try {
    const today = getTodayString();
    const currentUser = auth.currentUser;
    const userIdToUse = userId || currentUser?.uid;

    if (!userIdToUse) {
      console.warn("No authenticated user, saving to local storage only");
      return { success: false, error: "No authenticated user" };
    }

    const docRef = doc(db, "users", userIdToUse, "dailyChecklists", today);

    const dataToSave = {
      ...checklistData,
      date: today,
      lastUpdated: serverTimestamp(),
      completedAt: new Date().toISOString(),
      userId: userIdToUse,
    };

    await setDoc(docRef, dataToSave, { merge: true });
    console.log(
      "Daily checklist saved to Firebase for user:",
      userIdToUse,
      "on",
      today
    );
    return { success: true, date: today, userId: userIdToUse };
  } catch (error) {
    console.error("Error saving to Firebase:", error);
    return { success: false, error: error.message };
  }
};

// Load daily checklist data from Firebase
export const loadDailyChecklistFromFirebase = async (
  date = null,
  userId = null
) => {
  try {
    const targetDate = date || getTodayString();
    const currentUser = auth.currentUser;
    const userIdToUse = userId || currentUser?.uid;

    if (!userIdToUse) {
      console.warn("No authenticated user, cannot load from Firebase");
      return { success: false, error: "No authenticated user" };
    }

    const docRef = doc(db, "users", userIdToUse, "dailyChecklists", targetDate);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("Daily checklist loaded from Firebase:", targetDate);
      return { success: true, data, date: targetDate };
    } else {
      console.log("No checklist found for date:", targetDate);
      return {
        success: false,
        error: "No data found for this date",
        date: targetDate,
      };
    }
  } catch (error) {
    console.error("Error loading from Firebase:", error);
    return { success: false, error: error.message };
  }
};

// Save checklist completion event to history collection
export const saveChecklistCompletionEvent = async (
  eventData,
  userId = null
) => {
  try {
    const currentUser = auth.currentUser;
    const userIdToUse = userId || currentUser?.uid;

    if (!userIdToUse) {
      console.warn("No authenticated user, skipping event logging");
      return { success: false, error: "No authenticated user" };
    }

    const eventsRef = collection(db, "users", userIdToUse, "checklistEvents");
    const docRef = await addDoc(eventsRef, {
      ...eventData,
      timestamp: serverTimestamp(),
      date: getTodayString(),
      userId: userIdToUse,
    });

    console.log("Checklist event saved with ID:", docRef.id);
    return { success: true, eventId: docRef.id };
  } catch (error) {
    console.error("Error saving checklist event:", error);
    return { success: false, error: error.message };
  }
};

// Auto-save function that can be called periodically
export const autoSaveToFirebase = async (allChecklistData) => {
  return await saveDailyChecklistToFirebase(allChecklistData);
};

// Save custom checklist templates to Firebase
export const saveCustomChecklistsToFirebase = async (
  customChecklists,
  userId = null
) => {
  try {
    const currentUser = auth.currentUser;
    const userIdToUse = userId || currentUser?.uid;

    if (!userIdToUse) {
      console.warn("No authenticated user, cannot save custom checklists");
      return { success: false, error: "No authenticated user" };
    }

    const docRef = doc(db, "users", userIdToUse, "settings", "checklists");

    const dataToSave = {
      ...customChecklists,
      lastUpdated: serverTimestamp(),
      userId: userIdToUse,
    };

    await setDoc(docRef, dataToSave, { merge: true });
    console.log("Custom checklists saved to Firebase for user:", userIdToUse);
    return { success: true, userId: userIdToUse };
  } catch (error) {
    console.error("Error saving custom checklists:", error);
    return { success: false, error: error.message };
  }
};

// Load custom checklist templates from Firebase
export const loadCustomChecklistsFromFirebase = async (userId = null) => {
  try {
    const currentUser = auth.currentUser;
    const userIdToUse = userId || currentUser?.uid;

    if (!userIdToUse) {
      console.warn("No authenticated user, cannot load custom checklists");
      return { success: false, error: "No authenticated user" };
    }

    const docRef = doc(db, "users", userIdToUse, "settings", "checklists");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Remove metadata fields before returning
      const { lastUpdated, userId: _, ...checklists } = data;
      console.log(
        "Custom checklists loaded from Firebase for user:",
        userIdToUse
      );
      return { success: true, data: checklists };
    } else {
      console.log("No custom checklists found for user:", userIdToUse);
      return {
        success: false,
        error: "No custom checklists found",
      };
    }
  } catch (error) {
    console.error("Error loading custom checklists:", error);
    return { success: false, error: error.message };
  }
};

// Save preferred categories to Firebase
export const savePreferredCategoriesToFirebase = async (
  preferredCategories,
  userId = null
) => {
  try {
    const currentUser = auth.currentUser;
    const userIdToUse = userId || currentUser?.uid;

    if (!userIdToUse) {
      console.warn("No authenticated user, cannot save preferred categories");
      return { success: false, error: "No authenticated user" };
    }

    const docRef = doc(db, "users", userIdToUse, "settings", "preferences");

    const dataToSave = {
      preferredCategories,
      lastUpdated: serverTimestamp(),
      userId: userIdToUse,
    };

    await setDoc(docRef, dataToSave, { merge: true });
    console.log("Preferred categories saved to Firebase for user:", userIdToUse);
    return { success: true, userId: userIdToUse };
  } catch (error) {
    console.error("Error saving preferred categories:", error);
    return { success: false, error: error.message };
  }
};

// Load preferred categories from Firebase
export const loadPreferredCategoriesFromFirebase = async (userId = null) => {
  try {
    const currentUser = auth.currentUser;
    const userIdToUse = userId || currentUser?.uid;

    if (!userIdToUse) {
      console.warn("No authenticated user, cannot load preferred categories");
      return { success: false, error: "No authenticated user" };
    }

    const docRef = doc(db, "users", userIdToUse, "settings", "preferences");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log(
        "Preferred categories loaded from Firebase for user:",
        userIdToUse
      );
      return { success: true, data: data.preferredCategories || {} };
    } else {
      console.log("No preferred categories found for user:", userIdToUse);
      return {
        success: false,
        error: "No preferred categories found",
      };
    }
  } catch (error) {
    console.error("Error loading preferred categories:", error);
    return { success: false, error: error.message };
  }
};

export default app;
