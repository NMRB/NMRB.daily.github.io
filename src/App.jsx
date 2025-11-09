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

  const [gymWorkoutChecklist, setGymWorkoutChecklist] = useState(() =>
    getStoredData("gymWorkoutChecklist", defaultGymWorkoutChecklist)
  );
  const [homeWorkoutChecklist, setHomeWorkoutChecklist] = useState(() =>
    getStoredData("homeWorkoutChecklist", defaultHomeWorkoutChecklist)
  );
  const [lunchGoalsChecklist, setLunchGoalsChecklist] = useState(() =>
    getStoredData("lunchGoalsChecklist", defaultLunchGoalsChecklist)
  );
  const [afterWorkGoalsChecklist, setAfterWorkGoalsChecklist] = useState(() =>
    getStoredData("afterWorkGoalsChecklist", defaultAfterWorkGoalsChecklist)
  );
  const [dreamsChecklist, setDreamsChecklist] = useState(() =>
    getStoredData("dreamsChecklist", defaultDreamsChecklist)
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>Daily Planner</h1>
        <p className="date">{getCurrentDate()}</p>
      </header>

      <div className="sections-container">
        {/* Morning Checklist */}
        <section className="section">
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
        <section className="section">
          <h2>🏋️‍♂️ Gym Workout</h2>
          <div className="checklist">
            {gymWorkoutChecklist.map((item) => (
              <div key={item.id} className={`checklist-item exercise-item ${item.completed ? 'completed' : ''}`}>
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleChecklistItem("gymWorkout", item.id)}
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
                      {item.reps && <span className="reps">Reps: {item.reps}</span>}
                      {item.sets && <span className="sets">Sets: {item.sets}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Home Workout */}
        <section className="section">
          <h2>🏠 Home Workout</h2>
          <div className="checklist">
            {homeWorkoutChecklist.map((item) => (
              <div key={item.id} className={`checklist-item exercise-item ${item.completed ? 'completed' : ''}`}>
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleChecklistItem("homeWorkout", item.id)}
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
                      {item.reps && <span className="reps">Reps: {item.reps}</span>}
                      {item.sets && <span className="sets">Sets: {item.sets}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Lunch Goals */}
        <section className="section">
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
        </section>

        {/* Evening Checklist */}
        <section className="section">
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
    </div>
  );
}

export default App;
