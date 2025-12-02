import React, { useState, useEffect, useCallback, useMemo } from "react";

import { useFirebaseSync } from "../hooks/useFirebaseSync";
import { useChecklistSettings } from "../hooks/useChecklistSettings";
import { useUserPoints } from "../hooks/useUserPoints";
import {
  selectExercisesWithinTimeLimit,
  getCurrentDay,
  getTodaysTimeLimit,
} from "../utils/exerciseTimeManager";
import { useNavigate } from "react-router-dom";
import NavigationHeader from "../components/organisms/NavigationHeader/NavigationHeader";
import DailyPlannerTemplate from "../components/templates/DailyPlannerTemplate/DailyPlannerTemplate";

function DailyPlannerContainer() {
  const navigate = useNavigate();

  // Load custom checklists and preferences
  const {
    customChecklists,
    preferredCategories,
    exerciseTimeLimits,
    sectionDisabled,
    saveCustomChecklists,
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

  // Time tracking state
  const [timeTracking, setTimeTracking] = useState(() => ({}));

  // Weight tracking state
  const [weightInputs, setWeightInputs] = useState({});

  // Firebase sync integration - memoized to prevent unnecessary re-renders
  const checklistData = useMemo(
    () => ({
      ...timeTracking,
    }),
    [timeTracking]
  );

  const setters = useMemo(
    () => ({
      setGymWorkoutTime: (value) =>
        setTimeTracking((prev) => ({ ...prev, gymWorkoutTime: value })),
      setWarmupTime: (value) =>
        setTimeTracking((prev) => ({ ...prev, warmupTime: value })),
      setCooldownTime: (value) =>
        setTimeTracking((prev) => ({ ...prev, cooldownTime: value })),
    }),
    []
  ); // Empty dependency array since these functions are stable

  const { saveToFirebase, loadFromFirebase, logCompletionEvent } =
    useFirebaseSync(checklistData, setters);

  // Use user points system
  const { addPoints } = useUserPoints();

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
    }
  }, [customChecklists, checklistsLoading]);

  // Save data to cookies whenever state changes

  // Save time data to cookies whenever time state changes
  useEffect(() => {
    Object.entries(timeTracking).forEach(([key, value]) => {
      saveData(key, value);
    });
  }, [timeTracking, saveData]);

  // Convert checklist arrays to the format expected by our atomic components
  const createCheckedItemsMap = () => {
    const checkedItems = {};

    // Add custom tasks
    if (customChecklists && customChecklists.tasks) {
      customChecklists.tasks.forEach((item) => {
        if (item.completed) checkedItems[item.id] = true;
      });
    }

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

            // Add points if task was completed (not unchecked)
            if (newCompleted && addPoints) {
              addPoints({
                id: item.id,
                name: item.name || item.text,
                checklistType: checklistType,
                category: item.category || null,
              })
                .then((result) => {
                  if (result.success) {
                    console.log(
                      `Added ${result.pointsAdded} point(s) for completing "${
                        item.name || item.text
                      }". Total: ${result.newTotal}`
                    );
                  } else {
                    console.error("Failed to add points:", result.error);
                  }
                })
                .catch((error) => {
                  console.error("Error adding points:", error);
                });
            }

            return updatedItem;
          }
          return item;
        })
      );
    };

    // Check which checklist contains this item
    if (
      customChecklists &&
      customChecklists.tasks &&
      customChecklists.tasks.some((item) => item.id === id)
    ) {
      // Handle custom tasks
      const updatedTasks = customChecklists.tasks.map((item) => {
        if (item.id === id) {
          const newCompleted = !item.completed;
          const updatedItem = { ...item, completed: newCompleted };

          // Log to Firebase
          logCompletionEvent(
            newCompleted ? "item_completed" : "item_unchecked",
            {
              id: item.id,
              name: item.text,
              checklistType: "customTasks",
              wasCompleted: item.completed,
              nowCompleted: newCompleted,
              hour: item.hour,
              category: item.category,
            }
          );

          // Add points if task was completed (not unchecked)
          if (newCompleted && addPoints) {
            addPoints({
              id: item.id,
              name: item.text,
              checklistType: "customTasks",
              category: "custom",
            })
              .then((result) => {
                if (result.success) {
                  console.log(
                    `Added ${result.pointsAdded} point(s) for completing "${item.text}". Total: ${result.newTotal}`
                  );
                } else {
                  console.error("Failed to add points:", result.error);
                }
              })
              .catch((error) => {
                console.error("Error adding points:", error);
              });
          }

          return updatedItem;
        }
        return item;
      });

      // Update custom checklists with the new task state
      saveCustomChecklists({ ...customChecklists, tasks: updatedTasks });
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

    // Clear the input after updating
    setWeightInputs((prev) => ({ ...prev, [exerciseKey]: "" }));
  };

  // Reset day functionality
  const resetDay = () => {
    if (
      window.confirm("Are you sure you want to reset all progress for today?")
    ) {
      // Reset all checklists to unchecked state

      // Reset time tracking
      setTimeTracking({});

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

    // No specific sections to scroll to anymore
    const targetSectionId = "";

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
    warmupTime: warmupWorkoutTime,
    cooldownTime: cooldownWorkoutTime,
  } = timeTracking;

  // Get current day for filtering disabled sections
  const currentDay = getCurrentDay();

  // Check if a section is disabled for the current day
  const isSectionDisabled = (sectionKey) => {
    return sectionDisabled?.[currentDay]?.[sectionKey] || false;
  };

  // Get custom tasks for a specific hour
  const getTasksForHour = (hour) => {
    if (!customChecklists || !customChecklists.tasks) return [];

    return customChecklists.tasks.filter((task) => {
      // Handle both old (startHour) and new (hour) task structures
      const taskHour = task.hour || task.startHour;
      return taskHour === hour;
    });
  };

  // Create a custom task section
  const createTaskSection = (tasks, timeRange, sectionTitle) => {
    if (!tasks || tasks.length === 0) return null;

    return {
      title: sectionTitle,
      timeIndicator: timeRange,
      items: tasks.map((task) => ({
        ...task,
        key: task.id,
        text: `[${task.category?.toUpperCase() || "TASK"}] ${task.text}`,
        completed: task.completed || false,
      })),
      isCustomTasks: true,
    };
  };

  // Prepare all sections data for the template
  const buildSectionsWithTasks = () => {
    const baseSections = [];

    // Add custom task sections at appropriate time slots
    const sectionsWithTasks = [...baseSections];

    // Insert task sections for individual hours
    if (
      customChecklists &&
      customChecklists.tasks &&
      customChecklists.tasks.length > 0
    ) {
      // Create individual hour slots for each task
      const tasksByHour = {};
      if (customChecklists.tasks) {
        customChecklists.tasks.forEach((task) => {
          // Handle both old (startHour) and new (hour) task structures
          const taskHour = task.hour || task.startHour;
          if (taskHour !== undefined) {
            if (!tasksByHour[taskHour]) {
              tasksByHour[taskHour] = [];
            }
            // Ensure task has the new structure
            const normalizedTask = {
              ...task,
              hour: taskHour,
              category: task.category || "other",
            };
            tasksByHour[taskHour].push(normalizedTask);
          }
        });
      }

      // Sort hours to maintain chronological order
      const sortedHours = Object.keys(tasksByHour)
        .map(Number)
        .sort((a, b) => a - b);

      let insertOffset = 0;
      sortedHours.forEach((hour) => {
        const tasks = tasksByHour[hour];
        if (tasks && tasks.length > 0) {
          const taskSection = createTaskSection(
            tasks,
            `${String(hour).padStart(2, "0")}:00`,
            `${String(hour).padStart(2, "0")}:00 Tasks`
          );
          if (taskSection) {
            // Insert task sections in chronological order
            const insertPosition = hour < 12 ? 0 : sectionsWithTasks.length;
            sectionsWithTasks.splice(
              insertPosition + insertOffset,
              0,
              taskSection
            );
            insertOffset++;
          }
        }
      });
    }

    return sectionsWithTasks;
  };

  const allSections = buildSectionsWithTasks();

  // Filter sections based on disabled settings for current day
  const sections = allSections.filter((section, index) => {
    // Map sections to their keys based on order
    const sectionKeys = [];

    const sectionKey = sectionKeys[index];
    return sectionKey ? !isSectionDisabled(sectionKey) : true;
  });

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
    <>
      <NavigationHeader />
      <DailyPlannerTemplate
        sections={sections}
        checkedItems={createCheckedItemsMap()}
        onItemToggle={handleItemToggle}
        timeTracking={timeTracking}
        onTimeChange={handleTimeChange}
        weightInputs={weightInputs}
        onWeightChange={handleWeightChange}
        onUpdateWeight={handleUpdateWeight}
        onShowWeeklyBreakdown={() => navigate("/weekly")}
        onResetDay={resetDay}
        onScrollToActive={scrollToActiveSection}
      />
    </>
  );
}

export default DailyPlannerContainer;
