import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NavigationHeader from "../components/organisms/NavigationHeader/NavigationHeader";
import { useAuth } from "../contexts/AuthContext";
import { useChecklistSettings } from "../hooks/useChecklistSettings";
import { useUserPoints } from "../hooks/useUserPoints";
import { PointsStats } from "../components";

const ChecklistSettingsPage = () => {
  const { currentUser } = useAuth();
  const {
    customChecklists,
    preferredCategories,
    exerciseTimeLimits,
    sectionDisabled,
    saveCustomChecklists,
    savePreferredCategories,
    savePreferences,
    resetToDefaults,
    loading,
    error,
    exportChecklists,
    importChecklists,
  } = useChecklistSettings();

  // User points hook
  const {
    pointsData,
    loading: pointsLoading,
    error: pointsError,
  } = useUserPoints();

  const [activeSection, setActiveSection] = useState("points");
  const [activeExerciseSection, setActiveExerciseSection] = useState("warmup");
  const [editingItem, setEditingItem] = useState(null);
  const [editingSectionGoal, setEditingSectionGoal] = useState(false);
  const [sectionGoalTime, setSectionGoalTime] = useState("");
  const [newItemText, setNewItemText] = useState("");
  const [newItemReps, setNewItemReps] = useState("");
  const [newItemSets, setNewItemSets] = useState("");
  const [newItemDuration, setNewItemDuration] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [newItemLink, setNewItemLink] = useState("");
  const [newItemEquipment, setNewItemEquipment] = useState(false);
  const [newItemWeight, setNewItemWeight] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [tempPreferredCategories, setTempPreferredCategories] =
    useState(preferredCategories);
  const [tempExerciseTimeLimits, setTempExerciseTimeLimits] =
    useState(exerciseTimeLimits);
  const [tempSectionDisabled, setTempSectionDisabled] = useState({});

  const sections = [
    { key: "points", title: "Points & Progress", icon: "🏆" },
    { key: "morning", title: "Morning Checklist", icon: "🌅" },
    { key: "evening", title: "Evening Checklist", icon: "🌙" },
    { key: "exercises", title: "Exercises", icon: "💪" },
    { key: "lunchGoals", title: "Lunch Goals", icon: "🥗" },
    { key: "afterWorkGoals", title: "After Work Goals", icon: "⚡" },
    { key: "dreams", title: "Dreams", icon: "💭" },
    { key: "preferences", title: "Workout Preferences", icon: "⚙️" },
  ];

  const exerciseSections = [
    { key: "warmup", title: "Warmup", icon: "🔥" },
    { key: "gymWorkout", title: "Gym Workout", icon: "🏋️" },
    { key: "homeWorkout", title: "Home Workout", icon: "🏠" },
    { key: "cooldown", title: "Cooldown", icon: "❄️" },
  ];

  // Update section goal time when active section changes
  useEffect(() => {
    setSectionGoalTime(getSectionGoalTime());
    setEditingSectionGoal(false);
  }, [activeSection, customChecklists]);

  // Update temp preferred categories when preferred categories change
  useEffect(() => {
    setTempPreferredCategories(preferredCategories);
  }, [preferredCategories]);

  // Update temp exercise time limits when exercise time limits change
  useEffect(() => {
    setTempExerciseTimeLimits(exerciseTimeLimits);
  }, [exerciseTimeLimits]);

  // Update temp section disabled when section disabled changes
  useEffect(() => {
    setTempSectionDisabled(sectionDisabled);
  }, [sectionDisabled]);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setShowMobileMenu(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getCurrentItems = () => {
    return customChecklists[activeSection] || [];
  };

  const isWorkoutSection = () => {
    return activeSection === "gymWorkout" || activeSection === "homeWorkout";
  };

  const handleAddItem = () => {
    if (!newItemText.trim()) return;

    const newItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      name: newItemText.trim(),
      completed: false,
      category:
        newItemCategory.trim() || (isWorkoutSection() ? "Custom" : null),
      reps: isWorkoutSection() && newItemReps ? newItemReps : null,
      sets: isWorkoutSection() && newItemSets ? newItemSets : null,
      duration: newItemDuration.trim() || null,
      link: newItemLink.trim() || null,
      needsEquipment: newItemEquipment,
      weight: newItemWeight.trim() || null,
    };

    const updatedItems = [...getCurrentItems(), newItem];
    updateSection(updatedItems);
    setNewItemText("");
    setNewItemReps("");
    setNewItemSets("");
    setNewItemDuration("");
    setNewItemCategory("");
    setNewItemLink("");
    setNewItemEquipment(false);
    setNewItemWeight("");
    setShowAddForm(false);
  };

  const handleEditItem = (item) => {
    setEditingItem({ ...item });
  };

  const handleSaveEdit = () => {
    if (!editingItem || !editingItem.text.trim()) return;

    const updatedItems = getCurrentItems().map((item) =>
      item.id === editingItem.id ? editingItem : item
    );
    updateSection(updatedItems);
    setEditingItem(null);
  };

  const handleDeleteItem = (itemId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      const updatedItems = getCurrentItems().filter(
        (item) => item.id !== itemId
      );
      updateSection(updatedItems);
    }
  };

  const updateSection = (updatedItems) => {
    const newCustomChecklists = {
      ...customChecklists,
      [activeSection]: updatedItems,
    };
    saveCustomChecklists(newCustomChecklists);
  };

  const updateSectionGoalTime = (goalTime) => {
    const sectionGoals = customChecklists._sectionGoals || {};
    const newCustomChecklists = {
      ...customChecklists,
      _sectionGoals: {
        ...sectionGoals,
        [activeSection]: goalTime.trim() || null,
      },
    };
    saveCustomChecklists(newCustomChecklists);
  };

  const getSectionGoalTime = () => {
    return customChecklists._sectionGoals?.[activeSection] || "";
  };

  const handleSaveSectionGoal = () => {
    updateSectionGoalTime(sectionGoalTime);
    setEditingSectionGoal(false);
  };

  const handleResetSection = () => {
    if (
      window.confirm(
        `Reset ${
          sections.find((s) => s.key === activeSection)?.title
        } to defaults?`
      )
    ) {
      resetToDefaults(activeSection);
    }
  };

  const moveItem = (itemId, direction) => {
    const items = getCurrentItems();
    const index = items.findIndex((item) => item.id === itemId);
    if (index === -1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    const newItems = [...items];
    [newItems[index], newItems[newIndex]] = [
      newItems[newIndex],
      newItems[index],
    ];
    updateSection(newItems);
  };

  // Handle preferred category changes
  const handlePreferredCategoryChange = (day, category) => {
    setTempPreferredCategories((prev) => ({
      ...prev,
      [day]: category,
    }));
  };

  // Save preferred categories
  const handleSavePreferredCategories = () => {
    savePreferredCategories(tempPreferredCategories);
  };

  // Handle exercise time limit changes
  const handleExerciseTimeLimitChange = (day, timeLimit) => {
    setTempExerciseTimeLimits((prev) => ({
      ...prev,
      [day]: timeLimit,
    }));
  };

  // Save all preferences (categories, time limits, and section disabled)
  const handleSaveAllPreferences = () => {
    savePreferences(
      tempPreferredCategories,
      tempExerciseTimeLimits,
      tempSectionDisabled
    );
  };

  // Available exercise categories
  const exerciseCategories = [
    { value: "", label: "No preference" },
    { value: "legs", label: "Legs" },
    { value: "chest", label: "Chest" },
    { value: "back", label: "Back" },
    { value: "arms", label: "Arms" },
    { value: "shoulders", label: "Shoulders" },
    { value: "cardio", label: "Cardio" },
    { value: "mobility", label: "Mobility" },
  ];

  // Days of the week
  const daysOfWeek = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  if (loading) {
    return (
      <>
        <NavigationHeader />
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div>Loading checklist settings...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavigationHeader />
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
          padding: "20px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "300px 1fr",
            gap: "20px",
          }}
        >
          {/* Mobile Menu Button - Only visible on mobile */}
          {isMobile && (
            <>
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                style={{
                  marginBottom: "20px",
                  padding: "12px 20px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold",
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gridColumn: "1 / -1",
                }}
              >
                <span>
                  📋 {sections.find((s) => s.key === activeSection)?.title}
                </span>
                <span>{showMobileMenu ? "▲" : "▼"}</span>
              </button>

              {/* Mobile Overlay Menu */}
              {showMobileMenu && (
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    zIndex: 1000,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "20px",
                  }}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: "8px",
                      padding: "20px",
                      maxWidth: "400px",
                      width: "100%",
                      maxHeight: "80vh",
                      overflow: "auto",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px",
                        borderBottom: "2px solid #007bff",
                        paddingBottom: "10px",
                      }}
                    >
                      <h2
                        style={{ margin: 0, color: "#333", fontSize: "20px" }}
                      >
                        Checklist Sections
                      </h2>
                      <button
                        onClick={() => setShowMobileMenu(false)}
                        style={{
                          background: "none",
                          border: "none",
                          fontSize: "24px",
                          cursor: "pointer",
                          color: "#666",
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    {sections.map((section) => (
                      <button
                        key={section.key}
                        onClick={() => {
                          setActiveSection(section.key);
                          setShowMobileMenu(false);
                        }}
                        style={{
                          width: "100%",
                          padding: "15px",
                          marginBottom: "10px",
                          backgroundColor:
                            activeSection === section.key
                              ? "#007bff"
                              : "#f8f9fa",
                          color:
                            activeSection === section.key ? "white" : "#333",
                          border: "1px solid #dee2e6",
                          borderRadius: "6px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          fontSize: "16px",
                          textAlign: "left",
                        }}
                      >
                        <span style={{ fontSize: "20px" }}>{section.icon}</span>
                        {section.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          {/* Sidebar - Only visible on desktop */}
          {!isMobile && (
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                padding: "20px",
                height: "fit-content",
              }}
            >
              <h2
                style={{
                  marginBottom: "20px",
                  color: "#333",
                  fontSize: "20px",
                  borderBottom: "2px solid #007bff",
                  paddingBottom: "10px",
                }}
              >
                Checklist Sections
              </h2>

              {sections.map((section) => (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key)}
                  style={{
                    width: "100%",
                    padding: "15px",
                    marginBottom: "10px",
                    backgroundColor:
                      activeSection === section.key ? "#007bff" : "#f8f9fa",
                    color: activeSection === section.key ? "white" : "#333",
                    border: "1px solid #dee2e6",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "16px",
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: "20px" }}>{section.icon}</span>
                  {section.title}
                </button>
              ))}

              <div
                style={{
                  marginTop: "30px",
                  padding: "15px",
                  backgroundColor: "#f0f8ff",
                  borderRadius: "6px",
                  border: "1px solid #b3d9ff",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 10px 0",
                    color: "#0066cc",
                    fontSize: "16px",
                  }}
                >
                  Backup & Restore
                </h3>
                <button
                  onClick={exportChecklists}
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginBottom: "10px",
                  }}
                >
                  Export Settings
                </button>
                <input
                  type="file"
                  accept=".json"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const result = await importChecklists(
                          event.target.result
                        );
                        if (!result.success) {
                          alert(`Import failed: ${result.error}`);
                        } else {
                          alert("Settings imported successfully!");
                          window.location.reload();
                        }
                      };
                      reader.readAsText(file);
                    }
                    e.target.value = ""; // Reset file input
                  }}
                  style={{ display: "none" }}
                  id="importFile"
                />
                <button
                  onClick={() => document.getElementById("importFile").click()}
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginBottom: "20px",
                  }}
                >
                  Import Settings
                </button>
              </div>

              <div
                style={{
                  marginTop: "20px",
                  padding: "15px",
                  backgroundColor: "#fff5f5",
                  borderRadius: "6px",
                  border: "1px solid #fed7d7",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 10px 0",
                    color: "#721c24",
                    fontSize: "16px",
                  }}
                >
                  Reset Options
                </h3>
                <button
                  onClick={handleResetSection}
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginBottom: "10px",
                  }}
                >
                  Reset Current Section
                </button>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Reset ALL checklists to defaults? This cannot be undone."
                      )
                    ) {
                      resetToDefaults();
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Reset All Sections
                </button>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
              padding: "30px",
            }}
          >
            {error && (
              <div
                style={{
                  backgroundColor: "#fee",
                  color: "#c33",
                  padding: "15px",
                  borderRadius: "4px",
                  marginBottom: "20px",
                  border: "1px solid #fcc",
                }}
              >
                {error}
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "30px",
              }}
            >
              <h1
                style={{
                  margin: 0,
                  color: "#333",
                  fontSize: "28px",
                }}
              >
                {sections.find((s) => s.key === activeSection)?.icon}{" "}
                {sections.find((s) => s.key === activeSection)?.title}
              </h1>

              {/* Section Goal Time */}
              <div style={{ marginTop: "10px", marginBottom: "15px" }}>
                {editingSectionGoal ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: "#666",
                      }}
                    >
                      Section Goal Time:
                    </label>
                    <input
                      type="text"
                      value={sectionGoalTime}
                      onChange={(e) => setSectionGoalTime(e.target.value)}
                      placeholder="e.g., 20 min, 45 minutes, 1 hour"
                      style={{
                        padding: "8px 12px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px",
                        width: "200px",
                      }}
                    />
                    <button
                      onClick={handleSaveSectionGoal}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingSectionGoal(false);
                        setSectionGoalTime(getSectionGoalTime());
                      }}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span style={{ fontSize: "16px", color: "#666" }}>
                      <strong>Goal Time:</strong>{" "}
                      {getSectionGoalTime() ? (
                        <span
                          style={{
                            backgroundColor: "#e7f3ff",
                            padding: "4px 12px",
                            borderRadius: "12px",
                            border: "1px solid #007bff",
                            color: "#007bff",
                            fontWeight: "bold",
                          }}
                        >
                          🎯 {getSectionGoalTime()}
                        </span>
                      ) : (
                        <span style={{ color: "#999", fontStyle: "italic" }}>
                          Not set
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => setEditingSectionGoal(true)}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      {getSectionGoalTime() ? "Edit" : "Set Goal"}
                    </button>
                  </div>
                )}
              </div>

              {activeSection !== "preferences" && activeSection !== "points" && (
                <button
                  onClick={() => setShowAddForm(true)}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  + Add Item
                </button>
              )}
            </div>

            {/* Preferences Section - Show instead of regular checklist items */}
            {activeSection === "preferences" && (
              <div style={{ marginTop: "30px" }}>
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "30px",
                    borderRadius: "8px",
                    border: "1px solid #dee2e6",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <div style={{ marginBottom: "25px" }}>
                    <h3
                      style={{
                        margin: "0 0 15px 0",
                        color: "#333",
                        fontSize: "20px",
                      }}
                    >
                      Daily Exercise Category Preferences
                    </h3>
                    <p
                      style={{
                        color: "#666",
                        margin: "0 0 20px 0",
                        fontSize: "16px",
                      }}
                    >
                      Set your preferred exercise category for each day of the
                      week. These preferences will help filter and organize your
                      workout routines.
                    </p>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gap: "15px",
                      maxWidth: "600px",
                    }}
                  >
                    {daysOfWeek.map((day) => (
                      <div
                        key={day.key}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "120px 1fr",
                          alignItems: "center",
                          gap: "15px",
                          padding: "12px",
                          backgroundColor: "#f8f9fa",
                          borderRadius: "6px",
                          border: "1px solid #dee2e6",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "16px",
                            fontWeight: "bold",
                            color: "#333",
                          }}
                        >
                          {day.label}:
                        </label>
                        <select
                          value={tempPreferredCategories[day.key] || ""}
                          onChange={(e) =>
                            handlePreferredCategoryChange(
                              day.key,
                              e.target.value
                            )
                          }
                          style={{
                            padding: "8px 12px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px",
                            backgroundColor: "white",
                            cursor: "pointer",
                          }}
                        >
                          {exerciseCategories.map((category) => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>

                  {/* Exercise Time Limits Section */}
                  <div style={{ marginTop: "40px" }}>
                    <div style={{ marginBottom: "20px" }}>
                      <h3
                        style={{
                          margin: "0 0 10px 0",
                          color: "#333",
                          fontSize: "18px",
                        }}
                      >
                        Daily Exercise Time Limits
                      </h3>
                      <p
                        style={{
                          color: "#666",
                          margin: "0 0 15px 0",
                          fontSize: "14px",
                        }}
                      >
                        Set maximum exercise time for each day. Workouts will be
                        automatically filtered and randomized to fit within
                        these limits.
                      </p>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gap: "12px",
                        maxWidth: "600px",
                      }}
                    >
                      {daysOfWeek.map((day) => (
                        <div
                          key={day.key}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "120px 1fr 80px",
                            alignItems: "center",
                            gap: "15px",
                            padding: "10px",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "6px",
                            border: "1px solid #dee2e6",
                          }}
                        >
                          <label
                            style={{
                              fontSize: "14px",
                              fontWeight: "bold",
                              color: "#333",
                            }}
                          >
                            {day.label}:
                          </label>
                          <input
                            type="number"
                            min="15"
                            max="300"
                            step="15"
                            value={tempExerciseTimeLimits[day.key] || "60"}
                            onChange={(e) =>
                              handleExerciseTimeLimitChange(
                                day.key,
                                e.target.value
                              )
                            }
                            style={{
                              padding: "6px 10px",
                              border: "1px solid #ddd",
                              borderRadius: "4px",
                              fontSize: "14px",
                              backgroundColor: "white",
                            }}
                          />
                          <span
                            style={{
                              fontSize: "14px",
                              color: "#666",
                            }}
                          >
                            minutes
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section Disable Settings */}
                  <div style={{ marginTop: "40px" }}>
                    <div style={{ marginBottom: "20px" }}>
                      <h3
                        style={{
                          margin: "0 0 10px 0",
                          color: "#333",
                          fontSize: "18px",
                        }}
                      >
                        Section Visibility by Day
                      </h3>
                      <p
                        style={{
                          color: "#666",
                          margin: "0 0 15px 0",
                          fontSize: "14px",
                        }}
                      >
                        Choose which sections to hide on specific days of the
                        week. Hidden sections won't appear in your daily
                        planner.
                      </p>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gap: "15px",
                        maxWidth: "800px",
                      }}
                    >
                      {daysOfWeek.map((day) => (
                        <div
                          key={day.key}
                          style={{
                            padding: "15px",
                            border: "1px solid #dee2e6",
                            borderRadius: "6px",
                            backgroundColor: "#f8f9fa",
                          }}
                        >
                          <h4 style={{ margin: "0 0 10px 0", color: "#333" }}>
                            {day.label}
                          </h4>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(200px, 1fr))",
                              gap: "8px",
                            }}
                          >
                            {sections.map((section) => (
                              <label
                                key={section.key}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  cursor: "pointer",
                                  fontSize: "14px",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    !tempSectionDisabled[day.key]?.[section.key]
                                  }
                                  onChange={(e) => {
                                    const newSectionDisabled = {
                                      ...tempSectionDisabled,
                                    };
                                    if (!newSectionDisabled[day.key]) {
                                      newSectionDisabled[day.key] = {};
                                    }
                                    newSectionDisabled[day.key][section.key] =
                                      !e.target.checked;
                                    setTempSectionDisabled(newSectionDisabled);
                                  }}
                                  style={{
                                    width: "16px",
                                    height: "16px",
                                  }}
                                />
                                <span>
                                  {section.icon} {section.title}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "30px",
                      display: "flex",
                      gap: "15px",
                      justifyContent: "flex-start",
                    }}
                  >
                    <button
                      onClick={handleSaveAllPreferences}
                      style={{
                        padding: "12px 24px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "16px",
                        fontWeight: "bold",
                      }}
                    >
                      Save All Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Points Section */}
            {activeSection === "points" && (
              <div style={{ marginTop: "30px" }}>
                {pointsLoading ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "#ffffff",
                      fontSize: "1.1rem",
                    }}
                  >
                    Loading your points...
                  </div>
                ) : pointsError ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "#ff6b6b",
                      fontSize: "1.1rem",
                    }}
                  >
                    Error loading points: {pointsError}
                  </div>
                ) : (
                  <>
                    <PointsStats pointsData={pointsData} />

                    <div
                      style={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #333",
                        padding: "1.5rem",
                        borderRadius: "8px",
                        marginTop: "1.5rem",
                      }}
                    >
                      <h3
                        style={{
                          margin: "0 0 1rem 0",
                          color: "#ffffff",
                          fontSize: "1.25rem",
                          fontFamily: "'Press Start 2P', monospace",
                        }}
                      >
                        🎯 How Points Work
                      </h3>

                      <div style={{ color: "#aaa", lineHeight: "1.6" }}>
                        <p style={{ margin: "0 0 0.75rem 0" }}>
                          <strong style={{ color: "#ffffff" }}>
                            • 1 point
                          </strong>{" "}
                          = 1 completed task
                        </p>
                        <p style={{ margin: "0 0 0.75rem 0" }}>
                          <strong style={{ color: "#ffffff" }}>Streaks:</strong>{" "}
                          Complete at least one task per day to maintain your
                          streak
                        </p>
                        <p style={{ margin: "0 0 0.75rem 0" }}>
                          <strong style={{ color: "#ffffff" }}>
                            Daily Progress:
                          </strong>{" "}
                          Track your consistency and improvement over time
                        </p>
                        <p style={{ margin: "0" }}>
                          <strong style={{ color: "#ffffff" }}>
                            Challenge Yourself:
                          </strong>{" "}
                          Try to beat your longest streak and highest daily
                          score!
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Regular checklist sections - hide for preferences and points */}
            {activeSection !== "preferences" && activeSection !== "points" && (
              <>
                {/* Add New Item Form */}
                {showAddForm && (
                  <div
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "20px",
                      borderRadius: "6px",
                      marginBottom: "20px",
                      border: "1px solid #dee2e6",
                    }}
                  >
                    <h3 style={{ margin: "0 0 15px 0" }}>Add New Item</h3>

                    <div style={{ marginBottom: "15px" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "5px",
                          fontWeight: "bold",
                        }}
                      >
                        Exercise/Task Name
                      </label>
                      <input
                        type="text"
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        placeholder="Enter new checklist item..."
                        style={{
                          width: "100%",
                          padding: "12px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          fontSize: "16px",
                          boxSizing: "border-box",
                        }}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          !isWorkoutSection() &&
                          handleAddItem()
                        }
                        autoFocus
                      />
                    </div>

                    {isWorkoutSection() && (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "15px",
                          marginBottom: "15px",
                        }}
                      >
                        <div>
                          <label
                            style={{
                              display: "block",
                              marginBottom: "5px",
                              fontWeight: "bold",
                            }}
                          >
                            Reps (optional)
                          </label>
                          <input
                            type="text"
                            value={newItemReps}
                            onChange={(e) => setNewItemReps(e.target.value)}
                            placeholder="e.g., 10, 8-12, max"
                            style={{
                              width: "100%",
                              padding: "8px",
                              border: "1px solid #ddd",
                              borderRadius: "4px",
                              fontSize: "14px",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              display: "block",
                              marginBottom: "5px",
                              fontWeight: "bold",
                            }}
                          >
                            Sets (optional)
                          </label>
                          <input
                            type="text"
                            value={newItemSets}
                            onChange={(e) => setNewItemSets(e.target.value)}
                            placeholder="e.g., 3, 2-4"
                            style={{
                              width: "100%",
                              padding: "8px",
                              border: "1px solid #ddd",
                              borderRadius: "4px",
                              fontSize: "14px",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <div style={{ marginBottom: "15px" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "5px",
                          fontWeight: "bold",
                        }}
                      >
                        Duration Goal (optional)
                      </label>
                      <input
                        type="text"
                        value={newItemDuration}
                        onChange={(e) => setNewItemDuration(e.target.value)}
                        placeholder="e.g., 15 min, 30 minutes, 1 hour"
                        style={{
                          width: "100%",
                          padding: "12px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          fontSize: "16px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "5px",
                          fontWeight: "bold",
                        }}
                      >
                        Category (optional)
                      </label>
                      <input
                        type="text"
                        value={newItemCategory}
                        onChange={(e) => setNewItemCategory(e.target.value)}
                        placeholder="e.g., Legs, Cardio, Stretching, Work"
                        style={{
                          width: "100%",
                          padding: "12px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          fontSize: "16px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "5px",
                          fontSize: "16px",
                          fontWeight: "bold",
                        }}
                      >
                        Demo Link (optional)
                      </label>
                      <input
                        type="url"
                        value={newItemLink}
                        onChange={(e) => setNewItemLink(e.target.value)}
                        placeholder="e.g., https://www.youtube.com/watch?v=..."
                        style={{
                          width: "100%",
                          padding: "12px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          fontSize: "16px",
                          boxSizing: "border-box",
                        }}
                      />
                      {newItemLink && (
                        <a
                          href={newItemLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-block",
                            marginTop: "5px",
                            color: "#007bff",
                            textDecoration: "none",
                            fontSize: "14px",
                          }}
                        >
                          🎬 Preview Link
                        </a>
                      )}
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "16px",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={newItemEquipment}
                          onChange={(e) =>
                            setNewItemEquipment(e.target.checked)
                          }
                          style={{
                            width: "18px",
                            height: "18px",
                            cursor: "pointer",
                          }}
                        />
                        Requires Equipment
                      </label>
                    </div>

                    {newItemEquipment && (
                      <div style={{ marginBottom: "15px" }}>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "5px",
                            fontSize: "16px",
                            fontWeight: "bold",
                          }}
                        >
                          Weight/Resistance (optional)
                        </label>
                        <input
                          type="text"
                          value={newItemWeight}
                          onChange={(e) => setNewItemWeight(e.target.value)}
                          placeholder="e.g., 135 lbs, 25 lbs each, Bodyweight"
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "16px",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                    )}

                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={handleAddItem}
                        style={{
                          padding: "12px 20px",
                          backgroundColor: "#28a745",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setShowAddForm(false);
                          setNewItemText("");
                          setNewItemReps("");
                          setNewItemSets("");
                          setNewItemDuration("");
                          setNewItemCategory("");
                          setNewItemLink("");
                          setNewItemEquipment(false);
                          setNewItemWeight("");
                        }}
                        style={{
                          padding: "12px 20px",
                          backgroundColor: "#6c757d",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Items List */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {getCurrentItems().map((item, index) => (
                    <div
                      key={item.id}
                      style={{
                        backgroundColor:
                          editingItem?.id === item.id ? "#fff3cd" : "#f8f9fa",
                        padding: "15px",
                        borderRadius: "6px",
                        border: "1px solid #dee2e6",
                        display: "flex",
                        alignItems: "center",
                        gap: "15px",
                      }}
                    >
                      {/* Move buttons */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "5px",
                        }}
                      >
                        <button
                          onClick={() => moveItem(item.id, "up")}
                          disabled={index === 0}
                          style={{
                            width: "30px",
                            height: "25px",
                            border: "1px solid #ccc",
                            backgroundColor: index === 0 ? "#f5f5f5" : "white",
                            borderRadius: "3px",
                            cursor: index === 0 ? "not-allowed" : "pointer",
                            fontSize: "12px",
                          }}
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveItem(item.id, "down")}
                          disabled={index === getCurrentItems().length - 1}
                          style={{
                            width: "30px",
                            height: "25px",
                            border: "1px solid #ccc",
                            backgroundColor:
                              index === getCurrentItems().length - 1
                                ? "#f5f5f5"
                                : "white",
                            borderRadius: "3px",
                            cursor:
                              index === getCurrentItems().length - 1
                                ? "not-allowed"
                                : "pointer",
                            fontSize: "12px",
                          }}
                        >
                          ↓
                        </button>
                      </div>

                      {/* Item content */}
                      {editingItem?.id === item.id ? (
                        <div style={{ flex: 1 }}>
                          <div style={{ marginBottom: "10px" }}>
                            <input
                              type="text"
                              value={editingItem.text}
                              onChange={(e) =>
                                setEditingItem({
                                  ...editingItem,
                                  text: e.target.value,
                                })
                              }
                              style={{
                                width: "100%",
                                padding: "8px",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                fontSize: "16px",
                                boxSizing: "border-box",
                              }}
                              onKeyPress={(e) =>
                                e.key === "Enter" &&
                                !isWorkoutSection() &&
                                handleSaveEdit()
                              }
                              placeholder="Exercise/Task name"
                            />
                          </div>

                          {isWorkoutSection() && (
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "10px",
                                marginBottom: "10px",
                              }}
                            >
                              <input
                                type="text"
                                value={editingItem.reps || ""}
                                onChange={(e) =>
                                  setEditingItem({
                                    ...editingItem,
                                    reps: e.target.value,
                                  })
                                }
                                style={{
                                  padding: "6px",
                                  border: "1px solid #ddd",
                                  borderRadius: "4px",
                                  fontSize: "14px",
                                }}
                                placeholder="Reps (e.g., 10)"
                              />
                              <input
                                type="text"
                                value={editingItem.sets || ""}
                                onChange={(e) =>
                                  setEditingItem({
                                    ...editingItem,
                                    sets: e.target.value,
                                  })
                                }
                                style={{
                                  padding: "6px",
                                  border: "1px solid #ddd",
                                  borderRadius: "4px",
                                  fontSize: "14px",
                                }}
                                placeholder="Sets (e.g., 3)"
                              />
                            </div>
                          )}

                          <div style={{ marginTop: "10px" }}>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "5px",
                                fontSize: "14px",
                                fontWeight: "bold",
                              }}
                            >
                              Duration Goal:
                            </label>
                            <input
                              type="text"
                              value={editingItem.duration || ""}
                              onChange={(e) =>
                                setEditingItem({
                                  ...editingItem,
                                  duration: e.target.value,
                                })
                              }
                              placeholder="e.g., 15 min, 30 minutes, 1 hour"
                              style={{
                                padding: "8px",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                fontSize: "14px",
                                width: "200px",
                              }}
                            />
                          </div>

                          <div style={{ marginTop: "10px" }}>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "5px",
                                fontSize: "14px",
                                fontWeight: "bold",
                              }}
                            >
                              Category:
                            </label>
                            <input
                              type="text"
                              value={editingItem.category || ""}
                              onChange={(e) =>
                                setEditingItem({
                                  ...editingItem,
                                  category: e.target.value,
                                })
                              }
                              placeholder="e.g., Legs, Cardio, Stretching, Work"
                              style={{
                                padding: "8px",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                fontSize: "14px",
                                width: "200px",
                              }}
                            />
                          </div>

                          <div style={{ marginTop: "10px" }}>
                            <label
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontSize: "14px",
                                fontWeight: "bold",
                                cursor: "pointer",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={editingItem.needsEquipment || false}
                                onChange={(e) =>
                                  setEditingItem({
                                    ...editingItem,
                                    needsEquipment: e.target.checked,
                                  })
                                }
                                style={{
                                  width: "16px",
                                  height: "16px",
                                  cursor: "pointer",
                                }}
                              />
                              Requires Equipment
                            </label>
                          </div>

                          {editingItem.needsEquipment && (
                            <div style={{ marginTop: "10px" }}>
                              <label
                                style={{
                                  display: "block",
                                  marginBottom: "5px",
                                  fontSize: "14px",
                                  fontWeight: "bold",
                                }}
                              >
                                Weight/Resistance:
                              </label>
                              <input
                                type="text"
                                value={editingItem.weight || ""}
                                onChange={(e) =>
                                  setEditingItem({
                                    ...editingItem,
                                    weight: e.target.value,
                                  })
                                }
                                placeholder="e.g., 135 lbs, 25 lbs each, Bodyweight"
                                style={{
                                  padding: "8px",
                                  border: "1px solid #ddd",
                                  borderRadius: "4px",
                                  fontSize: "14px",
                                  width: "250px",
                                }}
                              />
                            </div>
                          )}

                          <div style={{ marginTop: "10px" }}>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "5px",
                                fontSize: "14px",
                                fontWeight: "bold",
                              }}
                            >
                              Demo Link (YouTube URL):
                            </label>
                            <input
                              type="url"
                              value={editingItem.link || ""}
                              onChange={(e) =>
                                setEditingItem({
                                  ...editingItem,
                                  link: e.target.value,
                                })
                              }
                              placeholder="e.g., https://www.youtube.com/watch?v=..."
                              style={{
                                padding: "8px",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                fontSize: "14px",
                                width: "300px",
                              }}
                            />
                            {editingItem.link && (
                              <a
                                href={editingItem.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  marginLeft: "10px",
                                  color: "#007bff",
                                  textDecoration: "none",
                                  fontSize: "12px",
                                }}
                              >
                                🎬 Preview
                              </a>
                            )}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: "10px",
                              marginTop: "15px",
                            }}
                          >
                            <button
                              onClick={handleSaveEdit}
                              style={{
                                padding: "8px 16px",
                                backgroundColor: "#28a745",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                              }}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              style={{
                                padding: "8px 16px",
                                backgroundColor: "#6c757d",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: "16px",
                                marginBottom: "5px",
                                fontWeight: "bold",
                              }}
                            >
                              {item.text || item.name}
                            </div>

                            {isWorkoutSection() && (item.reps || item.sets) && (
                              <div
                                style={{
                                  fontSize: "14px",
                                  color: "#007bff",
                                  marginBottom: "3px",
                                  display: "flex",
                                  gap: "15px",
                                }}
                              >
                                {item.reps && (
                                  <span
                                    style={{
                                      backgroundColor: "#e7f3ff",
                                      padding: "2px 8px",
                                      borderRadius: "12px",
                                      border: "1px solid #007bff",
                                    }}
                                  >
                                    🔢 {item.reps} reps
                                  </span>
                                )}
                                {item.sets && (
                                  <span
                                    style={{
                                      backgroundColor: "#e7f3ff",
                                      padding: "2px 8px",
                                      borderRadius: "12px",
                                      border: "1px solid #007bff",
                                    }}
                                  >
                                    🔄 {item.sets} sets
                                  </span>
                                )}
                              </div>
                            )}

                            {item.duration && (
                              <div
                                style={{
                                  fontSize: "14px",
                                  color: "#ffc107",
                                  marginBottom: "3px",
                                }}
                              >
                                <span
                                  style={{
                                    backgroundColor: "#fffbf0",
                                    padding: "2px 8px",
                                    borderRadius: "12px",
                                    border: "1px solid #ffc107",
                                  }}
                                >
                                  ⏱️ {item.duration}
                                </span>
                              </div>
                            )}

                            {(item.category || item.needsEquipment) && (
                              <div
                                style={{
                                  fontSize: "14px",
                                  marginBottom: "3px",
                                  display: "flex",
                                  gap: "10px",
                                  flexWrap: "wrap",
                                }}
                              >
                                {item.category && (
                                  <span
                                    style={{
                                      backgroundColor: "#e7f3ff",
                                      padding: "2px 8px",
                                      borderRadius: "12px",
                                      border: "1px solid #007bff",
                                      color: "#007bff",
                                      fontSize: "12px",
                                    }}
                                  >
                                    📂 {item.category}
                                  </span>
                                )}
                                {item.needsEquipment && (
                                  <span
                                    style={{
                                      backgroundColor: "#fff3cd",
                                      padding: "2px 8px",
                                      borderRadius: "12px",
                                      border: "1px solid #ffc107",
                                      color: "#856404",
                                      fontSize: "12px",
                                    }}
                                  >
                                    🔧 Equipment Needed
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <div style={{ display: "flex", gap: "10px" }}>
                            <button
                              onClick={() => handleEditItem(item)}
                              style={{
                                padding: "8px 12px",
                                backgroundColor: "#007bff",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              style={{
                                padding: "8px 12px",
                                backgroundColor: "#dc3545",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {getCurrentItems().length === 0 && (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "#666",
                        fontSize: "18px",
                      }}
                    >
                      No items in this checklist yet. Click "Add Item" to get
                      started!
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChecklistSettingsPage;
