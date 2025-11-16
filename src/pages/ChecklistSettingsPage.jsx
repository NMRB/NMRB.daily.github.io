import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NavigationHeader from "../components/organisms/NavigationHeader/NavigationHeader";
import { useAuth } from "../contexts/AuthContext";
import { useChecklistSettings } from "../hooks/useChecklistSettings";

const ChecklistSettingsPage = () => {
  const { currentUser } = useAuth();
  const {
    customChecklists,
    saveCustomChecklists,
    resetToDefaults,
    loading,
    error,
    exportChecklists,
    importChecklists,
  } = useChecklistSettings();

  const [activeSection, setActiveSection] = useState("morning");
  const [editingItem, setEditingItem] = useState(null);
  const [editingSectionGoal, setEditingSectionGoal] = useState(false);
  const [sectionGoalTime, setSectionGoalTime] = useState("");
  const [newItemText, setNewItemText] = useState("");
  const [newItemReps, setNewItemReps] = useState("");
  const [newItemSets, setNewItemSets] = useState("");
  const [newItemDuration, setNewItemDuration] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const sections = [
    { key: "morning", title: "Morning Checklist", icon: "🌅" },
    { key: "evening", title: "Evening Checklist", icon: "🌙" },
    { key: "gymWorkout", title: "Gym Workout", icon: "🏋️" },
    { key: "homeWorkout", title: "Home Workout", icon: "🏠" },
    { key: "lunchGoals", title: "Lunch Goals", icon: "🥗" },
    { key: "afterWorkGoals", title: "After Work Goals", icon: "⚡" },
    { key: "dreams", title: "Dreams", icon: "💭" },
  ];

  // Update section goal time when active section changes
  useEffect(() => {
    setSectionGoalTime(getSectionGoalTime());
    setEditingSectionGoal(false);
  }, [activeSection, customChecklists]);

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
      category: isWorkoutSection() ? "Custom" : null,
      reps: isWorkoutSection() && newItemReps ? newItemReps : null,
      sets: isWorkoutSection() && newItemSets ? newItemSets : null,
      duration: newItemDuration.trim() || null,
      weight: null,
    };

    const updatedItems = [...getCurrentItems(), newItem];
    updateSection(updatedItems);
    setNewItemText("");
    setNewItemReps("");
    setNewItemSets("");
    setNewItemDuration("");
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
            gridTemplateColumns: "300px 1fr",
            gap: "20px",
          }}
        >
          {/* Sidebar */}
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
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <label style={{ fontSize: "16px", fontWeight: "bold", color: "#666" }}>
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
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
            </div>

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
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
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

                        {item.category && (
                          <div style={{ fontSize: "13px", color: "#666" }}>
                            Category: {item.category}
                            {!isWorkoutSection() &&
                              item.reps &&
                              ` • Reps: ${item.reps}`}
                            {!isWorkoutSection() &&
                              item.sets &&
                              ` • Sets: ${item.sets}`}
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
          </div>
        </div>
      </div>
    </>
  );
};

export default ChecklistSettingsPage;
