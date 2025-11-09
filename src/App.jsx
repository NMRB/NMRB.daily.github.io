import { useState, useEffect, useCallback } from "react";
import "./App.css";
import {
  morningChecklist as defaultMorningChecklist,
  eveningChecklist as defaultEveningChecklist,
  gymWorkoutChecklist as defaultGymWorkoutChecklist,
  homeWorkoutChecklist as defaultHomeWorkoutChecklist,
  lunchGoalsChecklist as defaultLunchGoalsChecklist,
  afterWorkGoalsChecklist as defaultAfterWorkGoalsChecklist,
  dreamsChecklist as defaultDreamsChecklist,
} from "./data";

function App() {
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
      ...defaultGymWorkoutChecklist.main,
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
  const [gymWorkoutTime, setGymWorkoutTime] = useState(() =>
    getStoredData("gymWorkoutTime", "")
  );
  const [homeWorkoutTime, setHomeWorkoutTime] = useState(() =>
    getStoredData("homeWorkoutTime", "")
  );
  const [lunchTime, setLunchTime] = useState(() =>
    getStoredData("lunchTime", "")
  );
  const [afterWorkTime, setAfterWorkTime] = useState(() =>
    getStoredData("afterWorkTime", "")
  );
  const [dreamsTime, setDreamsTime] = useState(() =>
    getStoredData("dreamsTime", "")
  );

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
    saveData("gymWorkoutTime", gymWorkoutTime);
  }, [gymWorkoutTime, saveData]);

  useEffect(() => {
    saveData("homeWorkoutTime", homeWorkoutTime);
  }, [homeWorkoutTime, saveData]);

  useEffect(() => {
    saveData("lunchTime", lunchTime);
  }, [lunchTime, saveData]);

  useEffect(() => {
    saveData("afterWorkTime", afterWorkTime);
  }, [afterWorkTime, saveData]);

  useEffect(() => {
    saveData("dreamsTime", dreamsTime);
  }, [dreamsTime, saveData]);

  // Auto-scroll to appropriate section based on time
  useEffect(() => {
    const autoScrollToSection = () => {
      const now = new Date();
      const currentHour = now.getHours();
      
      let targetSectionId = "";
      
      // 6 AM - Morning checklist
      if (currentHour >= 6 && currentHour < 7) {
        targetSectionId = "morning-section";
      }
      // 7 AM - Gym workout
      else if (currentHour >= 7 && currentHour < 13) {
        targetSectionId = "gym-section";
      }
      // 1 PM (13:00) - Lunch goals
      else if (currentHour >= 13 && currentHour < 19) {
        targetSectionId = "lunch-section";
      }
      // 7 PM (19:00) - Evening checklist
      else if (currentHour >= 19) {
        targetSectionId = "evening-section";
      }
      // Before 6 AM - Default to morning
      else {
        targetSectionId = "morning-section";
      }
      
      // Scroll to the target section with smooth behavior
      setTimeout(() => {
        const targetElement = document.getElementById(targetSectionId);
        if (targetElement) {
          targetElement.scrollIntoView({ 
            behavior: "smooth", 
            block: "start" 
          });
        }
      }, 100); // Small delay to ensure DOM is ready
    };

    autoScrollToSection();
  }, []); // Run once on component mount

  const toggleChecklistItem = (type, id) => {
    if (type === "morning") {
      setMorningChecklist((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, completed: !item.completed } : item
        )
      );
    } else if (type === "evening") {
      setEveningChecklist((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, completed: !item.completed } : item
        )
      );
    } else if (type === "gymWorkout") {
      setGymWorkoutChecklist((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, completed: !item.completed } : item
        )
      );
    } else if (type === "homeWorkout") {
      setHomeWorkoutChecklist((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, completed: !item.completed } : item
        )
      );
    } else if (type === "lunchGoals") {
      setLunchGoalsChecklist((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, completed: !item.completed } : item
        )
      );
    } else if (type === "afterWorkGoals") {
      setAfterWorkGoalsChecklist((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, completed: !item.completed } : item
        )
      );
    } else if (type === "dreams") {
      setDreamsChecklist((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, completed: !item.completed } : item
        )
      );
    }
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const clearAllCookies = () => {
    // Clear all checklist cookies
    const cookieKeys = [
      "morningChecklist",
      "morningChecklist_date",
      "eveningChecklist",
      "eveningChecklist_date",
      "gymWorkoutChecklist",
      "gymWorkoutChecklist_date",
      "homeWorkoutChecklist",
      "homeWorkoutChecklist_date",
      "lunchGoalsChecklist",
      "lunchGoalsChecklist_date",
      "afterWorkGoalsChecklist",
      "afterWorkGoalsChecklist_date",
      "dreamsChecklist",
      "dreamsChecklist_date",
      "gymWorkoutTime",
      "gymWorkoutTime_date",
      "homeWorkoutTime",
      "homeWorkoutTime_date",
      "lunchTime",
      "lunchTime_date",
      "afterWorkTime",
      "afterWorkTime_date",
      "dreamsTime",
      "dreamsTime_date",
    ];

    cookieKeys.forEach((key) => {
      document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });

    // Refresh the page to load fresh data
    window.location.reload();
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Daily Planner</h1>
        <p className="date">{getCurrentDate()}</p>
      </header>

      <div className="sections-container">
        {/* Morning Checklist */}
        <section className="section" id="morning-section">
          <h2>🌅 Morning Checklist</h2>
          <div className="checklist">
            {morningChecklist.map((item) => (
              <div key={item.id} className="checklist-item">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleChecklistItem("morning", item.id)}
                />
                <span className={item.completed ? "completed" : ""}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Gym Workout */}
        <section className="section" id="gym-section">
          <h2>🏋️‍♂️ Gym Workout</h2>

          {/* Warm-up */}
          <div className="exercise-category">
            <h3>🔥 Warm-up</h3>
            <div className="checklist">
              {gymWorkoutChecklist
                .filter((item) => item.id >= 1 && item.id <= 3)
                .map((item) => (
                  <div
                    key={item.id}
                    className={`checklist-item exercise-item ${
                      item.completed ? "completed" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() =>
                        toggleChecklistItem("gymWorkout", item.id)
                      }
                    />
                    <div className="exercise-details">
                      <div className="exercise-header">
                        <span
                          className={
                            item.completed
                              ? "completed exercise-name"
                              : "exercise-name"
                          }
                        >
                          {item.name || item.text}
                        </span>
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="exercise-link"
                          >
                            📹 Demo
                          </a>
                        )}
                      </div>
                      {(item.reps || item.sets) && (
                        <div className="exercise-specs">
                          {item.reps && (
                            <span className="reps">Reps: {item.reps}</span>
                          )}
                          {item.sets && (
                            <span className="sets">Sets: {item.sets}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Main Workout */}
          <div className="exercise-category">
            <h3>💪 Main Workout</h3>
            <div className="checklist">
              {gymWorkoutChecklist
                .filter((item) => item.id >= 4 && item.id <= 7)
                .map((item) => (
                  <div
                    key={item.id}
                    className={`checklist-item exercise-item ${
                      item.completed ? "completed" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() =>
                        toggleChecklistItem("gymWorkout", item.id)
                      }
                    />
                    <div className="exercise-details">
                      <div className="exercise-header">
                        <span
                          className={
                            item.completed
                              ? "completed exercise-name"
                              : "exercise-name"
                          }
                        >
                          {item.name || item.text}
                        </span>
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="exercise-link"
                          >
                            📹 Demo
                          </a>
                        )}
                      </div>
                      {(item.reps || item.sets) && (
                        <div className="exercise-specs">
                          {item.reps && (
                            <span className="reps">Reps: {item.reps}</span>
                          )}
                          {item.sets && (
                            <span className="sets">Sets: {item.sets}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Cool-down */}
          <div className="exercise-category">
            <h3>🧘 Cool-down</h3>
            <div className="checklist">
              {gymWorkoutChecklist
                .filter((item) => item.id >= 8 && item.id <= 10)
                .map((item) => (
                  <div
                    key={item.id}
                    className={`checklist-item exercise-item ${
                      item.completed ? "completed" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() =>
                        toggleChecklistItem("gymWorkout", item.id)
                      }
                    />
                    <div className="exercise-details">
                      <div className="exercise-header">
                        <span
                          className={
                            item.completed
                              ? "completed exercise-name"
                              : "exercise-name"
                          }
                        >
                          {item.name || item.text}
                        </span>
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="exercise-link"
                          >
                            📹 Demo
                          </a>
                        )}
                      </div>
                      {(item.reps || item.sets) && (
                        <div className="exercise-specs">
                          {item.reps && (
                            <span className="reps">Reps: {item.reps}</span>
                          )}
                          {item.sets && (
                            <span className="sets">Sets: {item.sets}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div className="time-row">
            <label htmlFor="gymWorkoutTime" className="time-label">
              Time spent (minutes):
            </label>
            <input
              type="number"
              id="gymWorkoutTime"
              className="time-input"
              value={gymWorkoutTime}
              onChange={(e) => setGymWorkoutTime(e.target.value)}
              placeholder="0"
              min="0"
            />
          </div>
        </section>

        {/* Home Workout */}
        <section className="section">
          <h2>🏠 Home Workout</h2>

          {/* Warm-up */}
          <div className="exercise-category">
            <h3>🔥 Warm-up</h3>
            <div className="checklist">
              {homeWorkoutChecklist
                .filter((item) => item.id >= 1 && item.id <= 3)
                .map((item) => (
                  <div
                    key={item.id}
                    className={`checklist-item exercise-item ${
                      item.completed ? "completed" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() =>
                        toggleChecklistItem("homeWorkout", item.id)
                      }
                    />
                    <div className="exercise-details">
                      <div className="exercise-header">
                        <span
                          className={
                            item.completed
                              ? "completed exercise-name"
                              : "exercise-name"
                          }
                        >
                          {item.name || item.text}
                        </span>
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="exercise-link"
                          >
                            📹 Demo
                          </a>
                        )}
                      </div>
                      {(item.reps || item.sets) && (
                        <div className="exercise-specs">
                          {item.reps && (
                            <span className="reps">Reps: {item.reps}</span>
                          )}
                          {item.sets && (
                            <span className="sets">Sets: {item.sets}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Main Workout */}
          <div className="exercise-category">
            <h3>💪 Main Workout</h3>
            <div className="checklist">
              {homeWorkoutChecklist
                .filter((item) => item.id >= 4 && item.id <= 7)
                .map((item) => (
                  <div
                    key={item.id}
                    className={`checklist-item exercise-item ${
                      item.completed ? "completed" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() =>
                        toggleChecklistItem("homeWorkout", item.id)
                      }
                    />
                    <div className="exercise-details">
                      <div className="exercise-header">
                        <span
                          className={
                            item.completed
                              ? "completed exercise-name"
                              : "exercise-name"
                          }
                        >
                          {item.name || item.text}
                        </span>
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="exercise-link"
                          >
                            📹 Demo
                          </a>
                        )}
                      </div>
                      {(item.reps || item.sets) && (
                        <div className="exercise-specs">
                          {item.reps && (
                            <span className="reps">Reps: {item.reps}</span>
                          )}
                          {item.sets && (
                            <span className="sets">Sets: {item.sets}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Cool-down */}
          <div className="exercise-category">
            <h3>🧘 Cool-down</h3>
            <div className="checklist">
              {homeWorkoutChecklist
                .filter((item) => item.id >= 8 && item.id <= 10)
                .map((item) => (
                  <div
                    key={item.id}
                    className={`checklist-item exercise-item ${
                      item.completed ? "completed" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() =>
                        toggleChecklistItem("homeWorkout", item.id)
                      }
                    />
                    <div className="exercise-details">
                      <div className="exercise-header">
                        <span
                          className={
                            item.completed
                              ? "completed exercise-name"
                              : "exercise-name"
                          }
                        >
                          {item.name || item.text}
                        </span>
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="exercise-link"
                          >
                            📹 Demo
                          </a>
                        )}
                      </div>
                      {(item.reps || item.sets) && (
                        <div className="exercise-specs">
                          {item.reps && (
                            <span className="reps">Reps: {item.reps}</span>
                          )}
                          {item.sets && (
                            <span className="sets">Sets: {item.sets}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div className="time-row">
            <label htmlFor="homeWorkoutTime" className="time-label">
              Time spent (minutes):
            </label>
            <input
              type="number"
              id="homeWorkoutTime"
              className="time-input"
              value={homeWorkoutTime}
              onChange={(e) => setHomeWorkoutTime(e.target.value)}
              placeholder="0"
              min="0"
            />
          </div>
        </section>

        {/* Lunch Goals */}
        <section className="section" id="lunch-section">
          <h2>🥗 Lunch Goals</h2>
          <div className="checklist">
            {lunchGoalsChecklist.map((item) => (
              <div key={item.id} className="checklist-item">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleChecklistItem("lunchGoals", item.id)}
                />
                <span className={item.completed ? "completed" : ""}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
          <div className="time-row">
            <label className="time-label">Time spent (mins)</label>
            <input
              type="number"
              min="0"
              className="time-input"
              value={lunchTime}
              onChange={(e) => setLunchTime(e.target.value)}
              placeholder="e.g. 30"
            />
          </div>
        </section>

        {/* After Work Goals */}
        <section className="section">
          <h2>⚡ After Work Goals</h2>
          <div className="checklist">
            {afterWorkGoalsChecklist.map((item) => (
              <div key={item.id} className="checklist-item">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() =>
                    toggleChecklistItem("afterWorkGoals", item.id)
                  }
                />
                <span className={item.completed ? "completed" : ""}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
          <div className="time-row">
            <label className="time-label">Time spent (mins)</label>
            <input
              type="number"
              min="0"
              className="time-input"
              value={afterWorkTime}
              onChange={(e) => setAfterWorkTime(e.target.value)}
              placeholder="e.g. 60"
            />
          </div>
        </section>

        {/* Dreams Section */}
        <section className="section">
          <h2>✨ Dreams & Aspirations</h2>
          <div className="checklist">
            {dreamsChecklist.map((item) => (
              <div key={item.id} className="checklist-item">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleChecklistItem("dreams", item.id)}
                />
                <span className={item.completed ? "completed" : ""}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
          <div className="time-row">
            <label className="time-label">Time spent (mins)</label>
            <input
              type="number"
              min="0"
              className="time-input"
              value={dreamsTime}
              onChange={(e) => setDreamsTime(e.target.value)}
              placeholder="e.g. 20"
            />
          </div>
        </section>

        {/* Evening Checklist */}
        <section className="section" id="evening-section">
          <h2>🌙 Evening Checklist</h2>
          <div className="checklist">
            {eveningChecklist.map((item) => (
              <div key={item.id} className="checklist-item">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleChecklistItem("evening", item.id)}
                />
                <span className={item.completed ? "completed" : ""}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Clear Cookies Button */}
      <footer className="app-footer">
        <button
          onClick={clearAllCookies}
          className="clear-cookies-btn"
          title="Reset all checklists and clear saved progress"
        >
          🔄 Clear All Data
        </button>
      </footer>
    </div>
  );
}

export default App;
