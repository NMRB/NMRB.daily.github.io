// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { logFirebaseError } from "./utils/errorLogger";
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
    logFirebaseError("saveDailyChecklistToFirebase", error);
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
    logFirebaseError("loadDailyChecklistFromFirebase", error);
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
    logFirebaseError("saveChecklistCompletionEvent", error);
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
    console.log(
      "Preferred categories saved to Firebase for user:",
      userIdToUse
    );
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

// Save section disabled settings to Firebase
export const saveSectionDisabledToFirebase = async (
  sectionDisabled,
  userId = null
) => {
  try {
    const currentUser = auth.currentUser;
    const userIdToUse = userId || currentUser?.uid;

    if (!userIdToUse) {
      console.warn(
        "No authenticated user, cannot save section disabled settings"
      );
      return { success: false, error: "No authenticated user" };
    }

    const docRef = doc(db, "users", userIdToUse, "settings", "preferences");

    const dataToSave = {
      sectionDisabled,
      lastUpdated: serverTimestamp(),
      userId: userIdToUse,
    };

    await setDoc(docRef, dataToSave, { merge: true });
    console.log(
      "Section disabled settings saved to Firebase for user:",
      userIdToUse
    );
    return { success: true, userId: userIdToUse };
  } catch (error) {
    console.error("Error saving section disabled settings:", error);
    return { success: false, error: error.message };
  }
};

// Load section disabled settings from Firebase
export const loadSectionDisabledFromFirebase = async (userId = null) => {
  try {
    const currentUser = auth.currentUser;
    const userIdToUse = userId || currentUser?.uid;

    if (!userIdToUse) {
      console.warn(
        "No authenticated user, cannot load section disabled settings"
      );
      return { success: false, error: "No authenticated user" };
    }

    const docRef = doc(db, "users", userIdToUse, "settings", "preferences");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log(
        "Section disabled settings loaded from Firebase for user:",
        userIdToUse
      );
      return { success: true, data: data.sectionDisabled || {} };
    } else {
      console.log("No section disabled settings found for user:", userIdToUse);
      return {
        success: false,
        error: "No section disabled settings found",
      };
    }
  } catch (error) {
    console.error("Error loading section disabled settings:", error);
    return { success: false, error: error.message };
  }
};

// Save user points to Firebase
export const saveUserPointsToFirebase = async (pointsData, userId = null) => {
  try {
    const currentUser = auth.currentUser;
    const userIdToUse = userId || currentUser?.uid;

    if (!userIdToUse) {
      console.warn("No authenticated user, cannot save user points");
      return { success: false, error: "No authenticated user" };
    }

    const docRef = doc(db, "users", userIdToUse, "userData", "points");

    const dataToSave = {
      ...pointsData,
      lastUpdated: serverTimestamp(),
      userId: userIdToUse,
    };

    await setDoc(docRef, dataToSave, { merge: true });
    console.log("User points saved to Firebase for user:", userIdToUse);
    return { success: true, userId: userIdToUse };
  } catch (error) {
    console.error("Error saving user points:", error);
    return { success: false, error: error.message };
  }
};

// Load user points from Firebase
export const loadUserPointsFromFirebase = async (userId = null) => {
  try {
    const currentUser = auth.currentUser;
    const userIdToUse = userId || currentUser?.uid;

    if (!userIdToUse) {
      console.warn("No authenticated user, cannot load user points");
      return { success: false, error: "No authenticated user" };
    }

    const docRef = doc(db, "users", userIdToUse, "userData", "points");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("User points loaded from Firebase for user:", userIdToUse);
      return {
        success: true,
        data: {
          totalPoints: data.totalPoints || 0,
          dailyPoints: data.dailyPoints || {},
          pointsHistory: data.pointsHistory || [],
          achievements: data.achievements || [],
          streaks: data.streaks || { current: 0, longest: 0 },
        },
      };
    } else {
      console.log("No user points found for user:", userIdToUse);
      return {
        success: false,
        error: "No user points found",
      };
    }
  } catch (error) {
    console.error("Error loading user points:", error);
    return { success: false, error: error.message };
  }
};

// Add points for completed task
export const addPointsForTask = async (taskData, userId = null) => {
  try {
    const currentUser = auth.currentUser;
    const userIdToUse = userId || currentUser?.uid;

    if (!userIdToUse) {
      console.warn("No authenticated user, cannot add points");
      return { success: false, error: "No authenticated user" };
    }

    // Load current points data
    const pointsResult = await loadUserPointsFromFirebase(userIdToUse);
    let currentData = {
      totalPoints: 0,
      dailyPoints: {},
      pointsHistory: [],
      achievements: [],
      streaks: { current: 0, longest: 0 },
    };

    if (pointsResult.success) {
      currentData = pointsResult.data;
    }

    // Get today's date string
    const today = new Date().toISOString().split("T")[0];

    // Add 1 point for the completed task
    const pointsToAdd = 1;
    const newTotalPoints = currentData.totalPoints + pointsToAdd;

    // Update daily points
    const updatedDailyPoints = {
      ...currentData.dailyPoints,
      [today]: (currentData.dailyPoints[today] || 0) + pointsToAdd,
    };

    // Add to points history
    const newHistoryEntry = {
      date: today,
      timestamp: new Date().toISOString(),
      points: pointsToAdd,
      taskId: taskData.id,
      taskName: taskData.name || taskData.text,
      taskType: taskData.checklistType || "unknown",
    };

    const updatedHistory = [
      ...currentData.pointsHistory,
      newHistoryEntry,
    ].slice(-100); // Keep only last 100 entries

    // Calculate streaks
    const streaks = calculateStreaks(updatedDailyPoints);

    // Save updated points data
    const updatedPointsData = {
      totalPoints: newTotalPoints,
      dailyPoints: updatedDailyPoints,
      pointsHistory: updatedHistory,
      achievements: currentData.achievements,
      streaks: streaks,
    };

    const saveResult = await saveUserPointsToFirebase(
      updatedPointsData,
      userIdToUse
    );

    if (saveResult.success) {
      return {
        success: true,
        pointsAdded: pointsToAdd,
        newTotal: newTotalPoints,
        data: updatedPointsData,
      };
    } else {
      return saveResult;
    }
  } catch (error) {
    console.error("Error adding points for task:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to calculate streaks
const calculateStreaks = (dailyPoints) => {
  const dates = Object.keys(dailyPoints).sort();
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Calculate current streak (counting backwards from today)
  const today = new Date();
  let checkDate = new Date(today);

  while (true) {
    const dateStr = checkDate.toISOString().split("T")[0];
    if (dailyPoints[dateStr] && dailyPoints[dateStr] > 0) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate longest streak
  for (let i = 0; i < dates.length; i++) {
    if (dailyPoints[dates[i]] > 0) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return {
    current: currentStreak,
    longest: Math.max(longestStreak, currentStreak),
  };
};

export default app;
