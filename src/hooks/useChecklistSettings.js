import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  saveCustomChecklistsToFirebase,
  loadCustomChecklistsFromFirebase,
  savePreferredCategoriesToFirebase,
  loadPreferredCategoriesFromFirebase,
  saveSectionDisabledToFirebase,
  loadSectionDisabledFromFirebase,
} from "../firebase";

export const useChecklistSettings = () => {
  const { currentUser } = useAuth();
  const [customChecklists, setCustomChecklists] = useState({});
  const [preferredCategories, setPreferredCategories] = useState({
    monday: "",
    tuesday: "",
    wednesday: "",
    thursday: "",
    friday: "",
    saturday: "",
    sunday: "",
  });
  const [exerciseTimeLimits, setExerciseTimeLimits] = useState({
    monday: "60",
    tuesday: "60",
    wednesday: "60",
    thursday: "60",
    friday: "60",
    saturday: "90",
    sunday: "90",
  });
  const [workoutTimes, setWorkoutTimes] = useState({
    monday: "07:00",
    tuesday: "07:00",
    wednesday: "07:00",
    thursday: "07:00",
    friday: "07:00",
    saturday: "08:00",
    sunday: "08:00",
  });
  const [sectionDisabled, setSectionDisabled] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Default checklists structure
  const getDefaultChecklists = useCallback(() => {
    // Default custom tasks for new users
    const defaultTasks = [
      {
        id: "task_morning_1",
        text: "Drink a glass of water",
        hour: 6,
        category: "health",
        completed: false,
      },
      {
        id: "task_morning_2",
        text: "Check daily weather",
        hour: 7,
        category: "personal",
        completed: false,
      },
      {
        id: "task_midday_1",
        text: "Take a 10-minute walk",
        hour: 12,
        category: "fitness",
        completed: false,
      },
      {
        id: "task_midday_2",
        text: "Healthy lunch break",
        hour: 11,
        category: "health",
        completed: false,
      },
      {
        id: "task_afternoon_1",
        text: "Review daily progress",
        hour: 15,
        category: "work",
        completed: false,
      },
      {
        id: "task_afternoon_2",
        text: "Prep for tomorrow",
        hour: 16,
        category: "work",
        completed: false,
      },
      {
        id: "task_evening_1",
        text: "Call family/friends",
        hour: 18,
        category: "social",
        completed: false,
      },
      {
        id: "task_evening_2",
        text: "Tidy up workspace",
        hour: 19,
        category: "household",
        completed: false,
      },
    ];

    return {
      tasks: defaultTasks,
    };
  }, []);

  // Load custom checklists on component mount
  useEffect(() => {
    const loadChecklists = async () => {
      if (!currentUser) {
        setCustomChecklists(getDefaultChecklists());
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [checklistResult, preferencesResult, sectionDisabledResult] =
          await Promise.all([
            loadCustomChecklistsFromFirebase(),
            loadPreferredCategoriesFromFirebase(),
            loadSectionDisabledFromFirebase(),
          ]);

        if (checklistResult.success && checklistResult.data) {
          // Merge with defaults to ensure all sections exist
          const defaults = getDefaultChecklists();
          const merged = { ...defaults, ...checklistResult.data };
          setCustomChecklists(merged);
        } else {
          // No custom data found, use defaults
          setCustomChecklists(getDefaultChecklists());
        }

        if (preferencesResult.success && preferencesResult.data) {
          setPreferredCategories({
            monday: preferencesResult.data.monday || "",
            tuesday: preferencesResult.data.tuesday || "",
            wednesday: preferencesResult.data.wednesday || "",
            thursday: preferencesResult.data.thursday || "",
            friday: preferencesResult.data.friday || "",
            saturday: preferencesResult.data.saturday || "",
            sunday: preferencesResult.data.sunday || "",
          });

          if (preferencesResult.data.exerciseTimeLimits) {
            setExerciseTimeLimits({
              monday: preferencesResult.data.exerciseTimeLimits.monday || "60",
              tuesday:
                preferencesResult.data.exerciseTimeLimits.tuesday || "60",
              wednesday:
                preferencesResult.data.exerciseTimeLimits.wednesday || "60",
              thursday:
                preferencesResult.data.exerciseTimeLimits.thursday || "60",
              friday: preferencesResult.data.exerciseTimeLimits.friday || "60",
              saturday:
                preferencesResult.data.exerciseTimeLimits.saturday || "90",
              sunday: preferencesResult.data.exerciseTimeLimits.sunday || "90",
            });
          }

          if (preferencesResult.data.workoutTimes) {
            setWorkoutTimes({
              monday: preferencesResult.data.workoutTimes.monday || "07:00",
              tuesday: preferencesResult.data.workoutTimes.tuesday || "07:00",
              wednesday:
                preferencesResult.data.workoutTimes.wednesday || "07:00",
              thursday: preferencesResult.data.workoutTimes.thursday || "07:00",
              friday: preferencesResult.data.workoutTimes.friday || "07:00",
              saturday: preferencesResult.data.workoutTimes.saturday || "08:00",
              sunday: preferencesResult.data.workoutTimes.sunday || "08:00",
            });
          }
        }

        if (sectionDisabledResult.success && sectionDisabledResult.data) {
          setSectionDisabled(sectionDisabledResult.data);
        }
      } catch (err) {
        console.error("Error loading custom checklists:", err);
        setError("Failed to load custom checklists. Using defaults.");
        setCustomChecklists(getDefaultChecklists());
      } finally {
        setLoading(false);
      }
    };

    loadChecklists();
  }, [currentUser, getDefaultChecklists]);

  // Save custom checklists to Firebase
  const saveCustomChecklists = useCallback(
    async (newChecklists) => {
      if (!currentUser) {
        setError("Must be logged in to save custom checklists");
        return;
      }

      try {
        setError("");
        const result = await saveCustomChecklistsToFirebase(newChecklists);

        if (result.success) {
          setCustomChecklists(newChecklists);
          console.log("Custom checklists saved successfully");
        } else {
          throw new Error(result.error || "Failed to save");
        }
      } catch (err) {
        console.error("Error saving custom checklists:", err);
        setError("Failed to save changes. Please try again.");
      }
    },
    [currentUser]
  );

  // Save preferences (categories, time limits, and workout times) to Firebase
  const savePreferences = useCallback(
    async (
      newPreferredCategories,
      newExerciseTimeLimits,
      newSectionDisabled,
      newWorkoutTimes
    ) => {
      if (!currentUser) {
        setError("Must be logged in to save preferences");
        return;
      }

      try {
        setError("");
        const preferencesData = {
          ...newPreferredCategories,
          exerciseTimeLimits: newExerciseTimeLimits,
          workoutTimes: newWorkoutTimes || workoutTimes,
        };

        // Save preferences and section disabled settings in parallel
        const promises = [savePreferredCategoriesToFirebase(preferencesData)];

        if (newSectionDisabled !== undefined) {
          promises.push(saveSectionDisabledToFirebase(newSectionDisabled));
        }

        const results = await Promise.all(promises);

        if (results.every((result) => result.success)) {
          setPreferredCategories(newPreferredCategories);
          setExerciseTimeLimits(newExerciseTimeLimits);
          if (newWorkoutTimes) {
            setWorkoutTimes(newWorkoutTimes);
          }
          if (newSectionDisabled !== undefined) {
            setSectionDisabled(newSectionDisabled);
          }
          console.log("Preferences saved successfully");
        } else {
          throw new Error("Failed to save some preferences");
        }
      } catch (err) {
        console.error("Error saving preferences:", err);
        setError("Failed to save preferences. Please try again.");
      }
    },
    [currentUser, workoutTimes]
  );

  // Save preferred categories (backward compatibility)
  const savePreferredCategories = useCallback(
    async (newPreferredCategories) => {
      await savePreferences(newPreferredCategories, exerciseTimeLimits);
    },
    [savePreferences, exerciseTimeLimits]
  );

  // Reset to defaults (either specific section or all)
  const resetToDefaults = useCallback(
    async (section = null) => {
      const defaults = getDefaultChecklists();

      if (section) {
        // Reset specific section
        const newChecklists = {
          ...customChecklists,
          [section]: defaults[section],
        };
        await saveCustomChecklists(newChecklists);
      } else {
        // Reset all sections
        await saveCustomChecklists(defaults);
      }
    },
    [customChecklists, saveCustomChecklists, getDefaultChecklists]
  );

  // Get checklist for a specific section
  const getChecklistForSection = useCallback(
    (section) => {
      return customChecklists[section] || [];
    },
    [customChecklists]
  );

  // Check if checklists have been customized (different from defaults)
  const hasCustomizations = useCallback(() => {
    const defaults = getDefaultChecklists();
    return JSON.stringify(customChecklists) !== JSON.stringify(defaults);
  }, [customChecklists, getDefaultChecklists]);

  // Export all settings as JSON (checklists + preferences)
  const exportChecklists = useCallback(() => {
    const allSettingsData = {
      customChecklists,
      preferredCategories,
      exerciseTimeLimits,
      workoutTimes,
      sectionDisabled,
      exportDate: new Date().toISOString(),
      version: "2.0", // Version for backward compatibility
    };

    const dataStr = JSON.stringify(allSettingsData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `daily-planner-settings-${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  }, [
    customChecklists,
    preferredCategories,
    exerciseTimeLimits,
    workoutTimes,
    sectionDisabled,
  ]);

  // Import complete settings from JSON
  const importChecklists = useCallback(
    async (jsonData) => {
      try {
        const imported = JSON.parse(jsonData);

        // Check if this is new format (v2.0) or legacy format
        const isNewFormat = imported.version && imported.customChecklists;

        if (isNewFormat) {
          // New format - import all settings
          const promises = [];

          // Import checklists if present
          if (imported.customChecklists) {
            promises.push(saveCustomChecklists(imported.customChecklists));
          }

          // Import preferences if present
          if (
            imported.preferredCategories ||
            imported.exerciseTimeLimits ||
            imported.workoutTimes
          ) {
            const newPreferredCategories =
              imported.preferredCategories || preferredCategories;
            const newExerciseTimeLimits =
              imported.exerciseTimeLimits || exerciseTimeLimits;
            const newWorkoutTimes = imported.workoutTimes || workoutTimes;
            const newSectionDisabled =
              imported.sectionDisabled || sectionDisabled;

            promises.push(
              savePreferences(
                newPreferredCategories,
                newExerciseTimeLimits,
                newSectionDisabled,
                newWorkoutTimes
              )
            );
          }

          await Promise.all(promises);
        } else {
          // Legacy format - validate and import only checklists
          const requiredSections = [
            "morning",
            "evening",
            "gymWorkout",
            "lunchGoals",
            "afterWorkGoals",
          ]; // Check if it has the old structure with individual sections
          const hasLegacySections = requiredSections.some(
            (section) => imported[section] && Array.isArray(imported[section])
          );

          if (hasLegacySections) {
            // Remove homeWorkout if it exists in legacy data
            if (imported.homeWorkout) {
              delete imported.homeWorkout;
            }
            await saveCustomChecklists(imported);
          } else {
            throw new Error(
              "Invalid settings format. Please export settings from the latest version."
            );
          }
        }

        return { success: true };
      } catch (err) {
        console.error("Error importing settings:", err);
        setError(`Failed to import settings: ${err.message}`);
        return { success: false, error: err.message };
      }
    },
    [
      saveCustomChecklists,
      savePreferences,
      preferredCategories,
      exerciseTimeLimits,
      workoutTimes,
      sectionDisabled,
    ]
  );

  return {
    customChecklists,
    preferredCategories,
    exerciseTimeLimits,
    workoutTimes,
    sectionDisabled,
    loading,
    error,
    saveCustomChecklists,
    savePreferredCategories,
    savePreferences,
    resetToDefaults,
    getChecklistForSection,
    hasCustomizations,
    exportChecklists,
    importChecklists,
  };
};
