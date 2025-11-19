import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { useFirebaseSync } from "../hooks/useFirebaseSync";
import { useChecklistSettings } from "../hooks/useChecklistSettings";
import {
  selectExercisesWithinTimeLimit,
  getCurrentDay,
  getTodaysTimeLimit,
} from "../utils/exerciseTimeManager";
import DailyPlannerPage from "../pages/DailyPlannerPage";

function DailyPlannerContainer() {
  // Load custom checklists and preferences
  const {
    customChecklists,
    preferredCategories,
    exerciseTimeLimits,
    loading: checklistsLoading,
  } = useChecklistSettings();

  // Cookie utility functions
  const setCookie = (name, value, days = 1) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${JSON.stringify(
      value
    )};expires=${expires.toUTCString()};path=/`;
  };

  const getCookie = (name) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        try {
          return JSON.parse(c.substring(nameEQ.length, c.length));
        } catch {
          return null;
        }
      }
    }
    return null;
  };

  const getTodayString = () => {
    return new Date().toDateString();
  };

  const getStoredData = (key, defaultValue) => {
    const stored = getCookie(key);
    const lastDate = getCookie(`${key}_date`);
    const today = getTodayString();

    // If data exists and it's from today, return it; otherwise return default
    if (stored && lastDate === today) {
      return stored;
    }
    return defaultValue;
  };

  const saveData = useCallback((key, value) => {
    setCookie(key, value);
    setCookie(`${key}_date`, getTodayString());
  }, []);

  // Get current day and determine which muscle groups are recommended
  const getTodaysMuscleGroup = () => {
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const daySchedule = {
      1: { groups: ["Legs"], name: "Monday" },
      2: { groups: ["Chest"], name: "Tuesday" },
      3: { groups: ["Back"], name: "Wednesday" },
      4: { groups: ["Arms"], name: "Thursday" },
      5: { groups: ["Shoulders"], name: "Friday" },
      6: { groups: ["Legs", "Chest"], name: "Saturday" }, // Weekend combo
      0: { groups: ["Back", "Arms"], name: "Sunday" }, // Weekend combo
    };
    return daySchedule[today] || { groups: [], name: dayNames[today] };
  };

  // Initialize state with stored data or custom checklists
  const [morningChecklist, setMorningChecklist] = useState(() =>
    getStoredData(
      "morningChecklist",
      customChecklists.morning || defaultMorningChecklist
    )
  );

  const [eveningChecklist, setEveningChecklist] = useState(() =>
    getStoredData(
      "eveningChecklist",
      customChecklists.evening || defaultEveningChecklist
    )
  );

  // Create the full exercise pool
  const fullGymExercises = useMemo(() => {
    const defaultFlattened = [
      ...defaultGymWorkoutChecklist.warmup,
      ...defaultGymWorkoutChecklist.main.legs,
      ...defaultGymWorkoutChecklist.main.chest,
      ...defaultGymWorkoutChecklist.main.back,
      ...defaultGymWorkoutChecklist.main.arms,
      ...defaultGymWorkoutChecklist.main.shoulders,
      ...defaultGymWorkoutChecklist.cooldown,
    ];
    return customChecklists.gymWorkout || defaultFlattened;
  }, [customChecklists.gymWorkout]);

  // State for filtered gym workout
  const [gymWorkoutSelection, setGymWorkoutSelection] = useState(null);
  const [gymWorkoutChecklist, setGymWorkoutChecklist] = useState([]);

  // Create the full home exercise pool
  const fullHomeExercises = useMemo(() => {
    const defaultFlattened = [
      ...defaultHomeWorkoutChecklist.warmup,
      ...defaultHomeWorkoutChecklist.main,
      ...defaultHomeWorkoutChecklist.cooldown,
    ];
    return customChecklists.homeWorkout || defaultFlattened;
  }, [customChecklists.homeWorkout]);

  // State for filtered home workout
  const [homeWorkoutSelection, setHomeWorkoutSelection] = useState(null);
  const [homeWorkoutChecklist, setHomeWorkoutChecklist] = useState([]);

  const [lunchGoalsChecklist, setLunchGoalsChecklist] = useState(() =>
    getStoredData(
      "lunchGoalsChecklist",
      customChecklists.lunchGoals || defaultLunchGoalsChecklist
    )
  );

  const [afterWorkGoalsChecklist, setAfterWorkGoalsChecklist] = useState(() =>
    getStoredData(
      "afterWorkGoalsChecklist",
      customChecklists.afterWorkGoals || defaultAfterWorkGoalsChecklist
    )
  );

  const [dreamsChecklist, setDreamsChecklist] = useState(() =>
    getStoredData(
      "dreamsChecklist",
      customChecklists.dreams || defaultDreamsChecklist
    )
  );

  const [warmupChecklist, setWarmupChecklist] = useState(() =>
    getStoredData(
      "warmupChecklist",
      customChecklists.warmup || defaultWarmupChecklist
    )
  );

  const [cooldownChecklist, setCooldownChecklist] = useState(() =>
    getStoredData(
      "cooldownChecklist",
      customChecklists.cooldown || defaultCooldownChecklist
    )
  );

  // Time tracking state
  const [timeTracking, setTimeTracking] = useState(() => ({
    gymWorkoutTime: getStoredData("gymWorkoutTime", ""),
    homeWorkoutTime: getStoredData("homeWorkoutTime", ""),
    lunchTime: getStoredData("lunchTime", ""),
    afterWorkTime: getStoredData("afterWorkTime", ""),
    dreamsTime: getStoredData("dreamsTime", ""),
    warmupTime: getStoredData("warmupTime", ""),
    cooldownTime: getStoredData("cooldownTime", ""),
  }));

  // Weight tracking state
  const [weightInputs, setWeightInputs] = useState({});

  // Firebase sync integration - memoized to prevent unnecessary re-renders
  const checklistData = useMemo(
    () => ({
      morningChecklist,
      eveningChecklist,
      gymWorkoutChecklist,
      homeWorkoutChecklist,
      lunchGoalsChecklist,
      afterWorkGoalsChecklist,
      dreamsChecklist,
      warmupChecklist,
      cooldownChecklist,
      ...timeTracking,
    }),
    [
      morningChecklist,
      eveningChecklist,
      gymWorkoutChecklist,
      homeWorkoutChecklist,
      lunchGoalsChecklist,
      afterWorkGoalsChecklist,
      dreamsChecklist,
      warmupChecklist,
      cooldownChecklist,
      timeTracking,
    ]
  );

  // Function to regenerate gym workout
  const regenerateGymWorkout = useCallback(() => {
    if (
      !exerciseTimeLimits ||
      !preferredCategories ||
      fullGymExercises.length === 0
    ) {
      return;
    }

    const today = getCurrentDay();
    const timeLimitMinutes = getTodaysTimeLimit(exerciseTimeLimits);
    const preferredCategory = preferredCategories[today];

    const selection = selectExercisesWithinTimeLimit(
      fullGymExercises,
      timeLimitMinutes,
      preferredCategory,
      true // randomize
    );

    setGymWorkoutSelection(selection);
    setGymWorkoutChecklist(selection.exercises);
  }, [fullGymExercises, exerciseTimeLimits, preferredCategories]);

  // Function to regenerate home workout
  const regenerateHomeWorkout = useCallback(() => {
    if (
      !exerciseTimeLimits ||
      !preferredCategories ||
      fullHomeExercises.length === 0
    ) {
      return;
    }

    const today = getCurrentDay();
    const timeLimitMinutes = getTodaysTimeLimit(exerciseTimeLimits);
    const preferredCategory = preferredCategories[today];

    const selection = selectExercisesWithinTimeLimit(
      fullHomeExercises,
      timeLimitMinutes,
      preferredCategory,
      true // randomize
    );

    setHomeWorkoutSelection(selection);
    setHomeWorkoutChecklist(selection.exercises);
  }, [fullHomeExercises, exerciseTimeLimits, preferredCategories]);

  const setters = useMemo(
    () => ({
      setMorningChecklist,
      setEveningChecklist,
      setGymWorkoutChecklist,
      setHomeWorkoutChecklist,
      setLunchGoalsChecklist,
      setAfterWorkGoalsChecklist,
      setDreamsChecklist,
      setWarmupChecklist,
      setCooldownChecklist,
      setGymWorkoutTime: (value) =>
        setTimeTracking((prev) => ({ ...prev, gymWorkoutTime: value })),
      setHomeWorkoutTime: (value) =>
        setTimeTracking((prev) => ({ ...prev, homeWorkoutTime: value })),
      setLunchTime: (value) =>
        setTimeTracking((prev) => ({ ...prev, lunchTime: value })),
      setAfterWorkTime: (value) =>
        setTimeTracking((prev) => ({ ...prev, afterWorkTime: value })),
      setDreamsTime: (value) =>
        setTimeTracking((prev) => ({ ...prev, dreamsTime: value })),
      setWarmupTime: (value) =>
        setTimeTracking((prev) => ({ ...prev, warmupTime: value })),
      setCooldownTime: (value) =>
        setTimeTracking((prev) => ({ ...prev, cooldownTime: value })),
    }),
    []
  ); // Empty dependency array since these functions are stable

  const { saveToFirebase, loadFromFirebase, logCompletionEvent } =
    useFirebaseSync(checklistData, setters);

  // Apply time-based filtering to gym workout
  useEffect(() => {
    if (
      !exerciseTimeLimits ||
      !preferredCategories ||
      fullGymExercises.length === 0
    ) {
      return;
    }

    const today = getCurrentDay();
    const timeLimitMinutes = getTodaysTimeLimit(exerciseTimeLimits);
    const preferredCategory = preferredCategories[today];

    // Check if we need to regenerate (first load or preferences changed)
    const needsRegeneration =
      !gymWorkoutSelection ||
      gymWorkoutSelection.categoryFilter !== preferredCategory ||
      gymWorkoutSelection.timeLimitMinutes !== timeLimitMinutes;

    if (needsRegeneration) {
      const selection = selectExercisesWithinTimeLimit(
        fullGymExercises,
        timeLimitMinutes,
        preferredCategory,
        true // randomize
      );

      setGymWorkoutSelection(selection);
      setGymWorkoutChecklist(selection.exercises);
    }
  }, [
    fullGymExercises,
    exerciseTimeLimits,
    preferredCategories,
    gymWorkoutSelection,
  ]);

  // Apply time-based filtering to home workout
  useEffect(() => {
    if (
      !exerciseTimeLimits ||
      !preferredCategories ||
      fullHomeExercises.length === 0
    ) {
      return;
    }

    const today = getCurrentDay();
    const timeLimitMinutes = getTodaysTimeLimit(exerciseTimeLimits);
    const preferredCategory = preferredCategories[today];

    // Check if we need to regenerate (first load or preferences changed)
    const needsRegeneration =
      !homeWorkoutSelection ||
      homeWorkoutSelection.categoryFilter !== preferredCategory ||
      homeWorkoutSelection.timeLimitMinutes !== timeLimitMinutes;

    if (needsRegeneration) {
      const selection = selectExercisesWithinTimeLimit(
        fullHomeExercises,
        timeLimitMinutes,
        preferredCategory,
        true // randomize
      );

      setHomeWorkoutSelection(selection);
      setHomeWorkoutChecklist(selection.exercises);
    }
  }, [
    fullHomeExercises,
    exerciseTimeLimits,
    preferredCategories,
    homeWorkoutSelection,
  ]);

  // Update checklists when custom checklists change
  useEffect(() => {
    if (!checklistsLoading && customChecklists) {
      // Helper function to merge custom checklist with existing completion state
      const mergeWithCompletionState = (customItems, currentItems) => {
        if (!customItems) return currentItems;

        // Create a map of current completion states by item text/name
        const completionMap = new Map();
        currentItems.forEach((item) => {
          const key = item.text || item.name;
          completionMap.set(key, item.completed || false);
        });

        // Update custom items with preserved completion states
        return customItems.map((item) => ({
          ...item,
          completed: completionMap.get(item.text || item.name) || false,
        }));
      };

      // Always update checklists but preserve completion states
      if (customChecklists.morning) {
        setMorningChecklist((prev) =>
          mergeWithCompletionState(customChecklists.morning, prev)
        );
      }
      if (customChecklists.evening) {
        setEveningChecklist((prev) =>
          mergeWithCompletionState(customChecklists.evening, prev)
        );
      }
      if (customChecklists.gymWorkout) {
        setGymWorkoutChecklist((prev) =>
          mergeWithCompletionState(customChecklists.gymWorkout, prev)
        );
      }
      if (customChecklists.warmup) {
        setWarmupChecklist((prev) =>
          mergeWithCompletionState(customChecklists.warmup, prev)
        );
      }
      if (customChecklists.homeWorkout) {
        setHomeWorkoutChecklist((prev) =>
          mergeWithCompletionState(customChecklists.homeWorkout, prev)
        );
      }
      if (customChecklists.cooldown) {
        setCooldownChecklist((prev) =>
          mergeWithCompletionState(customChecklists.cooldown, prev)
        );
      }
      if (customChecklists.lunchGoals) {
        setLunchGoalsChecklist((prev) =>
          mergeWithCompletionState(customChecklists.lunchGoals, prev)
        );
      }
      if (customChecklists.afterWorkGoals) {
        setAfterWorkGoalsChecklist((prev) =>
          mergeWithCompletionState(customChecklists.afterWorkGoals, prev)
        );
      }
      if (customChecklists.dreams) {
        setDreamsChecklist((prev) =>
          mergeWithCompletionState(customChecklists.dreams, prev)
        );
      }
    }
  }, [customChecklists, checklistsLoading]);

  // Save data to cookies whenever state changes
  useEffect(() => {
    saveData("morningChecklist", morningChecklist);
  }, [morningChecklist, saveData]);

  useEffect(() => {
    saveData("eveningChecklist", eveningChecklist);
  }, [eveningChecklist, saveData]);

  useEffect(() => {
    saveData("gymWorkoutChecklist", gymWorkoutChecklist);
  }, [gymWorkoutChecklist, saveData]);

  useEffect(() => {
    saveData("warmupChecklist", warmupChecklist);
  }, [warmupChecklist, saveData]);

  useEffect(() => {
    saveData("homeWorkoutChecklist", homeWorkoutChecklist);
  }, [homeWorkoutChecklist, saveData]);

  useEffect(() => {
    saveData("cooldownChecklist", cooldownChecklist);
  }, [cooldownChecklist, saveData]);

  useEffect(() => {
    saveData("lunchGoalsChecklist", lunchGoalsChecklist);
  }, [lunchGoalsChecklist, saveData]);

  useEffect(() => {
    saveData("afterWorkGoalsChecklist", afterWorkGoalsChecklist);
  }, [afterWorkGoalsChecklist, saveData]);

  useEffect(() => {
    saveData("dreamsChecklist", dreamsChecklist);
  }, [dreamsChecklist, saveData]);

  // Save time data to cookies whenever time state changes
  useEffect(() => {
    Object.entries(timeTracking).forEach(([key, value]) => {
      saveData(key, value);
    });
  }, [timeTracking, saveData]);

  // Convert checklist arrays to the format expected by our atomic components
  const createCheckedItemsMap = () => {
    const checkedItems = {};

    morningChecklist.forEach((item) => {
      if (item.completed) checkedItems[item.id] = true;
    });

    eveningChecklist.forEach((item) => {
      if (item.completed) checkedItems[item.id] = true;
    });

    gymWorkoutChecklist.forEach((item) => {
      if (item.completed) checkedItems[item.id] = true;
    });

    homeWorkoutChecklist.forEach((item) => {
      if (item.completed) checkedItems[item.id] = true;
    });

    lunchGoalsChecklist.forEach((item) => {
      if (item.completed) checkedItems[item.id] = true;
    });

    afterWorkGoalsChecklist.forEach((item) => {
      if (item.completed) checkedItems[item.id] = true;
    });

    dreamsChecklist.forEach((item) => {
      if (item.completed) checkedItems[item.id] = true;
    });

    return checkedItems;
  };

  // Handle item toggle for different checklist types
  const handleItemToggle = (itemKey) => {
    // itemKey is now just the item.id directly
    const id = itemKey;

    // Find which checklist this item belongs to and toggle it
    const toggleInChecklist = (checklist, setChecklist, checklistType) => {
      setChecklist((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            const newCompleted = !item.completed;
            const updatedItem = { ...item, completed: newCompleted };

            // Log to Firebase
            logCompletionEvent(
              newCompleted ? "item_completed" : "item_unchecked",
              {
                id: item.id,
                name: item.name || item.text,
                checklistType: checklistType,
                wasCompleted: item.completed,
                nowCompleted: newCompleted,
                category: item.category || null,
                weight: item.weight || null,
                reps: item.reps || null,
                sets: item.sets || null,
              }
            );

            return updatedItem;
          }
          return item;
        })
      );
    };

    // Check which checklist contains this item
    if (morningChecklist.some((item) => item.id === id)) {
      toggleInChecklist(morningChecklist, setMorningChecklist, "morning");
    } else if (eveningChecklist.some((item) => item.id === id)) {
      toggleInChecklist(eveningChecklist, setEveningChecklist, "evening");
    } else if (gymWorkoutChecklist.some((item) => item.id === id)) {
      toggleInChecklist(
        gymWorkoutChecklist,
        setGymWorkoutChecklist,
        "gymWorkout"
      );
    } else if (homeWorkoutChecklist.some((item) => item.id === id)) {
      toggleInChecklist(
        homeWorkoutChecklist,
        setHomeWorkoutChecklist,
        "homeWorkout"
      );
    } else if (lunchGoalsChecklist.some((item) => item.id === id)) {
      toggleInChecklist(
        lunchGoalsChecklist,
        setLunchGoalsChecklist,
        "lunchGoals"
      );
    } else if (afterWorkGoalsChecklist.some((item) => item.id === id)) {
      toggleInChecklist(
        afterWorkGoalsChecklist,
        setAfterWorkGoalsChecklist,
        "afterWorkGoals"
      );
    } else if (dreamsChecklist.some((item) => item.id === id)) {
      toggleInChecklist(dreamsChecklist, setDreamsChecklist, "dreams");
    }
  };

  // Handle time tracking changes
  const handleTimeChange = (itemKey, value) => {
    const oldValue = timeTracking[itemKey] || "";
    setTimeTracking((prev) => ({ ...prev, [itemKey]: value }));

    // Log to Firebase
    logCompletionEvent("time_updated", {
      timeType: itemKey,
      oldValue,
      newValue: value,
      checklistType: itemKey.replace("Time", ""),
    });
  };

  // Handle weight tracking changes
  const handleWeightChange = (exerciseKey, weight) => {
    setWeightInputs((prev) => ({ ...prev, [exerciseKey]: weight }));
  };

  // Handle weight updates
  const handleUpdateWeight = (exerciseKey, weight) => {
    if (!weight) return;

    // Update the exercise in the appropriate checklist
    const updateWeight = (checklist, setChecklist) => {
      setChecklist((prev) =>
        prev.map((item) => {
          if (item.id === exerciseKey) {
            const updatedItem = { ...item, weight: `${weight} lbs` };

            // Log to Firebase
            logCompletionEvent("weight_updated", {
              exerciseId: item.id,
              exerciseName: item.name || item.text,
              oldWeight: item.weight || "none",
              newWeight: `${weight} lbs`,
              category: item.category || null,
            });

            return updatedItem;
          }
          return item;
        })
      );
    };

    if (gymWorkoutChecklist.some((item) => item.id === exerciseKey)) {
      updateWeight(gymWorkoutChecklist, setGymWorkoutChecklist);
    } else if (homeWorkoutChecklist.some((item) => item.id === exerciseKey)) {
      updateWeight(homeWorkoutChecklist, setHomeWorkoutChecklist);
    }

    // Clear the input after updating
    setWeightInputs((prev) => ({ ...prev, [exerciseKey]: "" }));
  };

  // Reset day functionality
  const resetDay = () => {
    if (
      window.confirm("Are you sure you want to reset all progress for today?")
    ) {
      // Reset all checklists to unchecked state
      setMorningChecklist((prev) =>
        prev.map((item) => ({ ...item, completed: false }))
      );
      setEveningChecklist((prev) =>
        prev.map((item) => ({ ...item, completed: false }))
      );
      setGymWorkoutChecklist((prev) =>
        prev.map((item) => ({ ...item, completed: false }))
      );
      setHomeWorkoutChecklist((prev) =>
        prev.map((item) => ({ ...item, completed: false }))
      );
      setLunchGoalsChecklist((prev) =>
        prev.map((item) => ({ ...item, completed: false }))
      );
      setAfterWorkGoalsChecklist((prev) =>
        prev.map((item) => ({ ...item, completed: false }))
      );
      setDreamsChecklist((prev) =>
        prev.map((item) => ({ ...item, completed: false }))
      );

      // Reset time tracking
      setTimeTracking({
        gymWorkoutTime: "",
        homeWorkoutTime: "",
        lunchTime: "",
        afterWorkTime: "",
        dreamsTime: "",
      });

      // Reset weight inputs
      setWeightInputs({});

      // Log reset event
      logCompletionEvent("day_reset", {
        resetTime: new Date().toISOString(),
        dayOfWeek: new Date().getDay(),
      });
    }
  };

  // Auto-scroll to current time section
  const scrollToActiveSection = () => {
    const now = new Date();
    const currentHour = now.getHours();

    let targetSectionId = "";

    // 6 AM - Morning checklist
    if (currentHour >= 6 && currentHour < 7) {
      targetSectionId = "morning-checklist";
    }
    // 7 AM - Gym workout
    else if (currentHour >= 7 && currentHour < 13) {
      targetSectionId = "gym-workout";
    }
    // 1 PM (13:00) - Lunch goals
    else if (currentHour >= 13 && currentHour < 19) {
      targetSectionId = "lunch-goals";
    }
    // 7 PM (19:00) - Evening checklist
    else if (currentHour >= 19) {
      targetSectionId = "evening-checklist";
    }
    // Before 6 AM - Default to morning
    else {
      targetSectionId = "morning-checklist";
    }

    // Scroll to the target section with smooth behavior
    setTimeout(() => {
      const targetElement = document.getElementById(targetSectionId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  // Auto-scroll on component mount
  useEffect(() => {
    scrollToActiveSection();
  }, []);

  // Helper function to get section goal time
  const getSectionGoalTime = (sectionKey) => {
    return customChecklists?._sectionGoals?.[sectionKey] || null;
  };

  // Helper function to format time indicator with goal
  const getTimeIndicator = (defaultTime, sectionKey) => {
    const goalTime = getSectionGoalTime(sectionKey);
    if (goalTime) {
      return `${defaultTime} • Goal: ${goalTime}`;
    }
    return defaultTime;
  };

  // Destructure time tracking values
  const {
    gymWorkoutTime,
    homeWorkoutTime,
    warmupTime: warmupWorkoutTime,
    cooldownTime: cooldownWorkoutTime,
  } = timeTracking;

  // Prepare sections data for the template
  const sections = [
    {
      title: "Morning Checklist",
      timeIndicator: getTimeIndicator("6:00 - 7:00", "morning"),
      items: morningChecklist.map((item) => ({
        ...item,
        key: item.id,
        text: item.text,
      })),
    },
    {
      title: "Warmup",
      timeIndicator: getTimeIndicator(
        `7:00 - 7:15 • Total: ${warmupWorkoutTime}`,
        "warmup"
      ),
      items: warmupChecklist.map((item) => ({
        ...item,
        key: item.id,
        text: item.name || item.text,
      })),
    },
    {
      title: "Gym Workout",
      timeIndicator: getTimeIndicator(
        `7:15 - 13:00 • Total: ${gymWorkoutTime}`,
        "gymWorkout"
      ),
      items: gymWorkoutChecklist.map((item) => ({
        ...item,
        key: item.id,
        text: item.name || item.text,
        hasWeight:
          item.category &&
          ["Legs", "Chest", "Back", "Arms", "Shoulders"].includes(
            item.category
          ),
      })),
      showWeightTracking: true,
    },
    {
      title: "Home Workout",
      timeIndicator: getTimeIndicator("7:00 - 13:00", "homeWorkout"),
      items: homeWorkoutChecklist.map((item) => ({
        ...item,
        key: item.id,
        text: item.name || item.text,
      })),
    },
    {
      title: "Cooldown",
      timeIndicator: getTimeIndicator(
        `13:00 - 13:15 • Total: ${cooldownWorkoutTime}`,
        "cooldown"
      ),
      items: cooldownChecklist.map((item) => ({
        ...item,
        key: item.id,
        text: item.name || item.text,
      })),
    },
    {
      title: "Lunch Goals",
      timeIndicator: getTimeIndicator("13:15 - 19:00", "lunchGoals"),
      items: lunchGoalsChecklist.map((item) => ({
        ...item,
        key: item.id,
        text: item.text,
      })),
    },
    {
      title: "After Work Goals",
      timeIndicator: getTimeIndicator("17:00 - 21:00", "afterWorkGoals"),
      items: afterWorkGoalsChecklist.map((item) => ({
        ...item,
        key: item.id,
        text: item.text,
      })),
    },
    {
      title: "Dreams",
      timeIndicator: getTimeIndicator("21:00 - 23:00", "dreams"),
      items: dreamsChecklist.map((item) => ({
        ...item,
        key: item.id,
        text: item.text,
      })),
    },
    {
      title: "Evening Checklist",
      timeIndicator: getTimeIndicator("19:00 - 23:00", "evening"),
      items: eveningChecklist.map((item) => ({
        ...item,
        key: item.id,
        text: item.text,
      })),
    },
  ];

  // Show loading while custom checklists are being loaded
  if (checklistsLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <div
          style={{
            padding: "40px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #007bff",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          ></div>
          <p style={{ color: "#666", margin: 0 }}>
            Loading your custom checklists...
          </p>
        </div>
      </div>
    );
  }

  return (
    <DailyPlannerPage
      sections={sections}
      checkedItems={createCheckedItemsMap()}
      onItemToggle={handleItemToggle}
      timeTracking={timeTracking}
      onTimeChange={handleTimeChange}
      weightInputs={weightInputs}
      onWeightChange={handleWeightChange}
      onUpdateWeight={handleUpdateWeight}
      onResetDay={resetDay}
      onScrollToActive={scrollToActiveSection}
      gymWorkoutSelection={gymWorkoutSelection}
      onRegenerateGymWorkout={regenerateGymWorkout}
      homeWorkoutSelection={homeWorkoutSelection}
      onRegenerateHomeWorkout={regenerateHomeWorkout}
    />
  );
}

export default DailyPlannerContainer;
