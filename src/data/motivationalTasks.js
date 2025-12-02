// Inspirational and motivational tasks that can be added to custom task lists
export const motivationalTasks = [
  // Morning Motivation
  {
    id: "motivation_morning_1",
    text: "Say 3 positive affirmations out loud",
    startHour: 6,
    endHour: 10,
    completed: false,
    category: "mindfulness",
    duration: "2 min",
  },
  {
    id: "motivation_morning_2",
    text: "Write down your #1 priority for today",
    startHour: 7,
    endHour: 9,
    completed: false,
    category: "productivity",
    duration: "1 min",
  },
  {
    id: "motivation_morning_3",
    text: "Do something that makes you smile",
    startHour: 6,
    endHour: 12,
    completed: false,
    category: "wellness",
    duration: "5 min",
  },

  // Midday Energy Boosters
  {
    id: "motivation_midday_1",
    text: "Send an encouraging message to someone",
    startHour: 11,
    endHour: 15,
    completed: false,
    category: "relationships",
    duration: "3 min",
  },
  {
    id: "motivation_midday_2",
    text: "Take 5 deep breaths and reset your energy",
    startHour: 12,
    endHour: 16,
    completed: false,
    category: "wellness",
    duration: "2 min",
  },
  {
    id: "motivation_midday_3",
    text: "Celebrate one small win from today",
    startHour: 13,
    endHour: 17,
    completed: false,
    category: "gratitude",
    duration: "1 min",
  },

  // Afternoon Productivity
  {
    id: "motivation_afternoon_1",
    text: "Complete one task you've been avoiding",
    startHour: 14,
    endHour: 18,
    completed: false,
    category: "productivity",
    duration: "15 min",
  },
  {
    id: "motivation_afternoon_2",
    text: "Learn one interesting fact or skill",
    startHour: 15,
    endHour: 19,
    completed: false,
    category: "learning",
    duration: "10 min",
  },
  {
    id: "motivation_afternoon_3",
    text: "Organize your workspace for 5 minutes",
    startHour: 16,
    endHour: 18,
    completed: false,
    category: "organization",
    duration: "5 min",
  },

  // Evening Reflection
  {
    id: "motivation_evening_1",
    text: "Write about one thing that went well today",
    startHour: 18,
    endHour: 22,
    completed: false,
    category: "reflection",
    duration: "3 min",
  },
  {
    id: "motivation_evening_2",
    text: "Do one act of kindness (however small)",
    startHour: 17,
    endHour: 21,
    completed: false,
    category: "kindness",
    duration: "5 min",
  },
  {
    id: "motivation_evening_3",
    text: "Set a positive intention for tomorrow",
    startHour: 19,
    endHour: 23,
    completed: false,
    category: "planning",
    duration: "2 min",
  },

  // Health & Wellness
  {
    id: "motivation_health_1",
    text: "Drink a full glass of water mindfully",
    startHour: 8,
    endHour: 20,
    completed: false,
    category: "health",
    duration: "2 min",
  },
  {
    id: "motivation_health_2",
    text: "Take the stairs instead of elevator today",
    startHour: 6,
    endHour: 22,
    completed: false,
    category: "fitness",
    duration: "varies",
  },
  {
    id: "motivation_health_3",
    text: "Stand up and stretch for 2 minutes",
    startHour: 9,
    endHour: 18,
    completed: false,
    category: "movement",
    duration: "2 min",
  },

  // Personal Growth
  {
    id: "motivation_growth_1",
    text: "Read one page of an inspiring book",
    startHour: 7,
    endHour: 22,
    completed: false,
    category: "learning",
    duration: "3 min",
  },
  {
    id: "motivation_growth_2",
    text: "Practice saying 'no' to something that drains you",
    startHour: 8,
    endHour: 20,
    completed: false,
    category: "boundaries",
    duration: "1 min",
  },
  {
    id: "motivation_growth_3",
    text: "Compliment yourself on one thing you did well",
    startHour: 16,
    endHour: 23,
    completed: false,
    category: "self-care",
    duration: "1 min",
  },

  // Connection & Gratitude
  {
    id: "motivation_connection_1",
    text: "Tell someone you appreciate them",
    startHour: 10,
    endHour: 21,
    completed: false,
    category: "relationships",
    duration: "2 min",
  },
  {
    id: "motivation_connection_2",
    text: "Notice and appreciate something beautiful around you",
    startHour: 6,
    endHour: 22,
    completed: false,
    category: "mindfulness",
    duration: "1 min",
  },
  {
    id: "motivation_connection_3",
    text: "Send good thoughts/energy to someone who needs it",
    startHour: 12,
    endHour: 23,
    completed: false,
    category: "compassion",
    duration: "1 min",
  },
];

// Helper function to get random motivational tasks
export const getRandomMotivationalTasks = (count = 3) => {
  const shuffled = [...motivationalTasks].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// Helper function to get tasks for specific time periods
export const getMotivationalTasksForTimeRange = (startHour, endHour) => {
  return motivationalTasks.filter(
    (task) => task.startHour <= endHour && task.endHour >= startHour
  );
};
