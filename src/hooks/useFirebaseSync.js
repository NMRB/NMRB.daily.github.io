import { useEffect, useRef, useCallback } from "react";
import {
  saveDailyChecklistToFirebase,
  loadDailyChecklistFromFirebase,
  saveChecklistCompletionEvent,
} from "../firebase";

export const useFirebaseSync = (checklistData, setters) => {
  const isInitialized = useRef(false);
  const saveTimeoutRef = useRef(null);

  // Load data from Firebase on component mount
  const loadFromFirebase = useCallback(async () => {
    try {
      const result = await loadDailyChecklistFromFirebase();
      if (result.success && result.data) {
        // Update state with Firebase data if it exists and is more recent
        const firebaseData = result.data;

        // Only update if the Firebase data has checklist items
        if (firebaseData.morningChecklist) {
          setters.setMorningChecklist(firebaseData.morningChecklist);
        }
        if (firebaseData.eveningChecklist) {
          setters.setEveningChecklist(firebaseData.eveningChecklist);
        }
        if (firebaseData.gymWorkoutChecklist) {
          setters.setGymWorkoutChecklist(firebaseData.gymWorkoutChecklist);
        }
        if (firebaseData.homeWorkoutChecklist) {
          setters.setHomeWorkoutChecklist(firebaseData.homeWorkoutChecklist);
        }
        if (firebaseData.lunchGoalsChecklist) {
          setters.setLunchGoalsChecklist(firebaseData.lunchGoalsChecklist);
        }
        if (firebaseData.afterWorkGoalsChecklist) {
          setters.setAfterWorkGoalsChecklist(
            firebaseData.afterWorkGoalsChecklist
          );
        }
        if (firebaseData.dreamsChecklist) {
          setters.setDreamsChecklist(firebaseData.dreamsChecklist);
        }

        // Update time data if available
        if (firebaseData.gymWorkoutTime !== undefined) {
          setters.setGymWorkoutTime(firebaseData.gymWorkoutTime);
        }
        if (firebaseData.homeWorkoutTime !== undefined) {
          setters.setHomeWorkoutTime(firebaseData.homeWorkoutTime);
        }
        if (firebaseData.lunchTime !== undefined) {
          setters.setLunchTime(firebaseData.lunchTime);
        }
        if (firebaseData.afterWorkTime !== undefined) {
          setters.setAfterWorkTime(firebaseData.afterWorkTime);
        }
        if (firebaseData.dreamsTime !== undefined) {
          setters.setDreamsTime(firebaseData.dreamsTime);
        }

        console.log("Successfully loaded data from Firebase");
      }
    } catch (error) {
      console.error("Error loading from Firebase:", error);
    }
  }, [setters]);

  // Auto-save to Firebase with debouncing
  const saveToFirebase = useCallback(
    async (immediate = false) => {
      if (!isInitialized.current) return;

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      const performSave = async () => {
        try {
          const result = await saveDailyChecklistToFirebase(checklistData);
          if (result.success) {
            console.log("Auto-saved to Firebase");
          }
        } catch (error) {
          console.error("Auto-save failed:", error);
        }
      };

      if (immediate) {
        await performSave();
      } else {
        // Debounce saves to avoid too many writes
        saveTimeoutRef.current = setTimeout(performSave, 2000);
      }
    },
    [checklistData]
  );

  // Log checklist completion events
  const logCompletionEvent = useCallback(async (eventType, itemData) => {
    try {
      await saveChecklistCompletionEvent({
        eventType, // 'item_completed', 'item_unchecked', 'time_updated', etc.
        itemData,
        checklistType: itemData.checklistType || "unknown",
        itemId: itemData.id,
        itemName: itemData.name || itemData.text,
      });
    } catch (error) {
      console.error("Error logging completion event:", error);
    }
  }, []);

  // Initialize Firebase sync
  useEffect(() => {
    const initializeSync = async () => {
      await loadFromFirebase();
      isInitialized.current = true;
    };

    initializeSync();
  }, [loadFromFirebase]);

  // Auto-save when data changes
  useEffect(() => {
    if (isInitialized.current) {
      saveToFirebase();
    }
  }, [
    checklistData.morningChecklist,
    checklistData.eveningChecklist,
    checklistData.gymWorkoutChecklist,
    checklistData.homeWorkoutChecklist,
    checklistData.lunchGoalsChecklist,
    checklistData.afterWorkGoalsChecklist,
    checklistData.dreamsChecklist,
    checklistData.gymWorkoutTime,
    checklistData.homeWorkoutTime,
    checklistData.lunchTime,
    checklistData.afterWorkTime,
    checklistData.dreamsTime,
    saveToFirebase,
  ]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    saveToFirebase: (immediate) => saveToFirebase(immediate),
    loadFromFirebase,
    logCompletionEvent,
  };
};
