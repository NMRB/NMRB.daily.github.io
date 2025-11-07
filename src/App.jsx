import { useState } from 'react'
import './App.css'

function App() {
  const [morningChecklist, setMorningChecklist] = useState([
    { id: 1, text: 'Wake up early', completed: false },
    { id: 2, text: 'Drink water', completed: false },
    { id: 3, text: 'Morning meditation', completed: false },
    { id: 4, text: 'Review daily goals', completed: false }
  ])

  const [eveningChecklist, setEveningChecklist] = useState([
    { id: 1, text: 'Review the day', completed: false },
    { id: 2, text: 'Plan tomorrow', completed: false },
    { id: 3, text: 'Evening gratitude', completed: false },
    { id: 4, text: 'Prepare for bed', completed: false }
  ])

  const [gymWorkout, setGymWorkout] = useState('')
  const [homeWorkout, setHomeWorkout] = useState('')
  const [lunchGoals, setLunchGoals] = useState('')
  const [afterWorkGoals, setAfterWorkGoals] = useState('')
  const [dreams, setDreams] = useState('')

  const toggleChecklistItem = (type, id) => {
    if (type === 'morning') {
      setMorningChecklist(prev => 
        prev.map(item => 
          item.id === id ? { ...item, completed: !item.completed } : item
        )
      )
    } else if (type === 'evening') {
      setEveningChecklist(prev => 
        prev.map(item => 
          item.id === id ? { ...item, completed: !item.completed } : item
        )
      )
    }
  }

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

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
            {morningChecklist.map(item => (
              <div key={item.id} className="checklist-item">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleChecklistItem('morning', item.id)}
                />
                <span className={item.completed ? 'completed' : ''}>{item.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Gym Workout */}
        <section className="section">
          <h2>🏋️‍♂️ Gym Workout</h2>
          <textarea
            value={gymWorkout}
            onChange={(e) => setGymWorkout(e.target.value)}
            placeholder="Plan your gym workout routine..."
            className="text-area"
          />
        </section>

        {/* Home Workout */}
        <section className="section">
          <h2>🏠 Home Workout</h2>
          <textarea
            value={homeWorkout}
            onChange={(e) => setHomeWorkout(e.target.value)}
            placeholder="Plan your home workout routine..."
            className="text-area"
          />
        </section>

        {/* Lunch Goals */}
        <section className="section">
          <h2>🥗 Lunch Goals</h2>
          <textarea
            value={lunchGoals}
            onChange={(e) => setLunchGoals(e.target.value)}
            placeholder="What are your nutrition and meal goals for today?"
            className="text-area"
          />
        </section>

        {/* After Work Goals */}
        <section className="section">
          <h2>⚡ After Work Goals</h2>
          <textarea
            value={afterWorkGoals}
            onChange={(e) => setAfterWorkGoals(e.target.value)}
            placeholder="What do you want to accomplish after work?"
            className="text-area"
          />
        </section>

        {/* Dreams Section */}
        <section className="section">
          <h2>✨ Dreams & Aspirations</h2>
          <textarea
            value={dreams}
            onChange={(e) => setDreams(e.target.value)}
            placeholder="Write about your dreams, goals, and future aspirations..."
            className="text-area"
          />
        </section>

        {/* Evening Checklist */}
        <section className="section">
          <h2>🌙 Evening Checklist</h2>
          <div className="checklist">
            {eveningChecklist.map(item => (
              <div key={item.id} className="checklist-item">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleChecklistItem('evening', item.id)}
                />
                <span className={item.completed ? 'completed' : ''}>{item.text}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
