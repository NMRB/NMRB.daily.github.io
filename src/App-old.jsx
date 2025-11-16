import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DailyPlannerContainer from "./containers/DailyPlannerContainer";
import WeeklyAnalyticsPage from "./pages/WeeklyAnalyticsPage";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DailyPlannerContainer />} />
        <Route path="/weekly" element={<WeeklyAnalyticsPage />} />
        <Route path="/weekly/:date" element={<WeeklyAnalyticsPage />} />
      </Routes>
    </Router>
  );
}

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

  // Initialize state with stored data or defaults
  const [morningChecklist, setMorningChecklist] = useState(() =>
    getStoredData("morningChecklist", defaultMorningChecklist)
  );

  const [eveningChecklist, setEveningChecklist] = useState(() =>
    getStoredData("eveningChecklist", defaultEveningChecklist)
  );

  const [gymWorkoutChecklist, setGymWorkoutChecklist] = useState(() => {
    const defaultFlattened = [
      ...defaultGymWorkoutChecklist.warmup,
      ...defaultGymWorkoutChecklist.main.legs,
      ...defaultGymWorkoutChecklist.main.chest,
      ...defaultGymWorkoutChecklist.main.back,
      ...defaultGymWorkoutChecklist.main.arms,
      ...defaultGymWorkoutChecklist.main.shoulders,
      ...defaultGymWorkoutChecklist.cooldown,
    ];
    return getStoredData("gymWorkoutChecklist", defaultFlattened);
  });

  const [homeWorkoutChecklist, setHomeWorkoutChecklist] = useState(() => {
    const defaultFlattened = [
      ...defaultHomeWorkoutChecklist.warmup,
      ...defaultHomeWorkoutChecklist.main,
      ...defaultHomeWorkoutChecklist.cooldown,
    ];
    return getStoredData("homeWorkoutChecklist", defaultFlattened);
  });

  const [lunchGoalsChecklist, setLunchGoalsChecklist] = useState(() =>
    getStoredData("lunchGoalsChecklist", defaultLunchGoalsChecklist)
  );

  const [afterWorkGoalsChecklist, setAfterWorkGoalsChecklist] = useState(() =>
    getStoredData("afterWorkGoalsChecklist", defaultAfterWorkGoalsChecklist)
  );

  const [dreamsChecklist, setDreamsChecklist] = useState(() =>
    getStoredData("dreamsChecklist", defaultDreamsChecklist)
  );

  // Time tracking state
  const [timeTracking, setTimeTracking] = useState(() => ({
    gymWorkoutTime: getStoredData("gymWorkoutTime", ""),
    homeWorkoutTime: getStoredData("homeWorkoutTime", ""),
    lunchTime: getStoredData("lunchTime", ""),
    afterWorkTime: getStoredData("afterWorkTime", ""),
    dreamsTime: getStoredData("dreamsTime", ""),
  }));

  // Weight tracking state
  const [weightInputs, setWeightInputs] = useState({});

  // Page navigation state
  const [currentPage, setCurrentPage] = useState("daily"); // 'daily' or 'weekly'

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
      timeTracking,
    ]
  );

  const setters = useMemo(
    () => ({
      setMorningChecklist,
      setEveningChecklist,
      setGymWorkoutChecklist,
      setHomeWorkoutChecklist,
      setLunchGoalsChecklist,
      setAfterWorkGoalsChecklist,
      setDreamsChecklist,
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
    }),
    []
  ); // Empty dependency array since these functions are stable

  const { saveToFirebase, loadFromFirebase, logCompletionEvent } =
    useFirebaseSync(checklistData, setters);

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
    saveData("homeWorkoutChecklist", homeWorkoutChecklist);
  }, [homeWorkoutChecklist, saveData]);

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

  // Prepare sections data for the template
  const sections = [
    {
      title: "Morning Checklist",
      timeIndicator: "6:00 - 7:00",
      items: morningChecklist.map((item) => ({
        ...item,
        key: item.id,
        text: item.text,
      })),
    },
    {
      title: "Gym Workout",
      timeIndicator: "7:00 - 13:00",
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
      timeIndicator: "7:00 - 13:00",
      items: homeWorkoutChecklist.map((item) => ({
        ...item,
        key: item.id,
        text: item.name || item.text,
      })),
    },
    {
      title: "Lunch Goals",
      timeIndicator: "13:00 - 19:00",
      items: lunchGoalsChecklist.map((item) => ({
        ...item,
        key: item.id,
        text: item.text,
      })),
    },
    {
      title: "After Work Goals",
      timeIndicator: "17:00 - 21:00",
      items: afterWorkGoalsChecklist.map((item) => ({
        ...item,
        key: item.id,
        text: item.text,
      })),
    },
    {
      title: "Dreams",
      timeIndicator: "21:00 - 23:00",
      items: dreamsChecklist.map((item) => ({
        ...item,
        key: item.id,
        text: item.text,
      })),
    },
    {
      title: "Evening Checklist",
      timeIndicator: "19:00 - 23:00",
      items: eveningChecklist.map((item) => ({
        ...item,
        key: item.id,
        text: item.text,
      })),
    },
  ];

  // Show weekly breakdown if requested
  if (currentPage === "weekly") {
    return <WeeklyBreakdown onBack={() => setCurrentPage("daily")} />;
  }

  return (
    <DailyPlannerTemplate
      sections={sections}
      checkedItems={createCheckedItemsMap()}
      onItemToggle={handleItemToggle}
      timeTracking={timeTracking}
      onTimeChange={handleTimeChange}
      weightInputs={weightInputs}
      onWeightChange={handleWeightChange}
      onUpdateWeight={handleUpdateWeight}
      onShowWeeklyBreakdown={() => setCurrentPage("weekly")}
      onResetDay={resetDay}
      onScrollToActive={scrollToActiveSection}
    />
  );
}

export default App;
