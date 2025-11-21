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
import {
  morningChecklist as defaultMorningChecklist,
  eveningChecklist as defaultEveningChecklist,
  gymWorkoutChecklist as defaultGymWorkoutChecklist,
  homeWorkoutChecklist as defaultHomeWorkoutChecklist,
  lunchGoalsChecklist as defaultLunchGoalsChecklist,
  afterWorkGoalsChecklist as defaultAfterWorkGoalsChecklist,
  dreamsChecklist as defaultDreamsChecklist,
  warmupChecklist as defaultWarmupChecklist,
  cooldownChecklist as defaultCooldownChecklist,
} from "../data";

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
  const [sectionDisabled, setSectionDisabled] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Default checklists structure
  const getDefaultChecklists = useCallback(() => {
    // Flatten gym workout checklist
    const flattenedGymWorkout = [
      ...defaultGymWorkoutChecklist.warmup,
      ...defaultGymWorkoutChecklist.main.legs,
      ...defaultGymWorkoutChecklist.main.chest,
      ...defaultGymWorkoutChecklist.main.back,
      ...defaultGymWorkoutChecklist.main.arms,
      ...defaultGymWorkoutChecklist.main.shoulders,
      ...defaultGymWorkoutChecklist.cooldown,
    ];

    // Flatten home workout checklist
    const flattenedHomeWorkout = [
      ...defaultHomeWorkoutChecklist.warmup,
      ...defaultHomeWorkoutChecklist.main,
      ...defaultHomeWorkoutChecklist.cooldown,
    ];

    return {
      morning: defaultMorningChecklist,
      evening: defaultEveningChecklist,
      gymWorkout: flattenedGymWorkout,
      homeWorkout: flattenedHomeWorkout,
      lunchGoals: defaultLunchGoalsChecklist,
      afterWorkGoals: defaultAfterWorkGoalsChecklist,
      dreams: defaultDreamsChecklist,
      warmup: defaultWarmupChecklist,
      cooldown: defaultCooldownChecklist,
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

  // Save preferences (categories and time limits) to Firebase
  const savePreferences = useCallback(
    async (
      newPreferredCategories,
      newExerciseTimeLimits,
      newSectionDisabled
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
    [currentUser]
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

  // Export checklists as JSON
  const exportChecklists = useCallback(() => {
    const dataStr = JSON.stringify(customChecklists, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `checklist-settings-${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  }, [customChecklists]);

  // Import checklists from JSON
  const importChecklists = useCallback(
    async (jsonData) => {
      try {
        const imported = JSON.parse(jsonData);

        // Validate the structure
        const requiredSections = [
          "morning",
          "evening",
          "gymWorkout",
          "homeWorkout",
          "lunchGoals",
          "afterWorkGoals",
          "dreams",
        ];
        const hasAllSections = requiredSections.every(
          (section) => imported[section] && Array.isArray(imported[section])
        );

        if (!hasAllSections) {
          throw new Error(
            "Invalid checklist format. Missing required sections."
          );
        }

        await saveCustomChecklists(imported);
        return { success: true };
      } catch (err) {
        console.error("Error importing checklists:", err);
        setError(`Failed to import checklists: ${err.message}`);
        return { success: false, error: err.message };
      }
    },
    [saveCustomChecklists]
  );

  return {
    customChecklists,
    preferredCategories,
    exerciseTimeLimits,
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
