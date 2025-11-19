// Utility functions for calculating workout times

/**
 * Parse time duration strings and convert to minutes
 * @param {string} timeStr - Time string like "5-10 min", "30 sec", "1 hour", etc.
 * @returns {number} - Time in minutes
 */
export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string") return 0;

  const str = timeStr.toLowerCase().trim();

  // Handle range formats like "5-10 min" - take the average
  if (str.includes("-")) {
    const parts = str.split("-");
    if (parts.length === 2) {
      const min = parseFloat(parts[0]);
      const maxPart = parts[1].replace(/[^\d.]/g, "");
      const max = parseFloat(maxPart);
      if (!isNaN(min) && !isNaN(max)) {
        return (min + max) / 2;
      }
    }
  }

  // Extract number from string
  const numMatch = str.match(/(\d+(?:\.\d+)?)/);
  if (!numMatch) return 0;

  const num = parseFloat(numMatch[1]);

  // Convert based on unit
  if (str.includes("hour")) {
    return num * 60;
  } else if (str.includes("sec")) {
    return num / 60;
  } else if (str.includes("min") || str.includes("minute")) {
    return num;
  } else {
    // Default to minutes if no unit specified
    return num;
  }
};

/**
 * Calculate estimated time for a single exercise
 * @param {Object} exercise - Exercise object with reps, sets, duration
 * @returns {number} - Estimated time in minutes
 */
export const calculateExerciseTime = (exercise) => {
  let totalTime = 0;

  // If exercise has explicit duration, use that
  if (exercise.duration) {
    return parseTimeToMinutes(exercise.duration);
  }

  // Otherwise estimate based on reps and sets
  const sets = exercise.sets ? parseInt(exercise.sets) || 1 : 1;
  const reps = exercise.reps || "";

  let timePerSet = 0;

  // Estimate time based on exercise type and reps
  if (reps.toLowerCase().includes("min")) {
    // If reps specify time (e.g., "5-10 min"), use that directly
    timePerSet = parseTimeToMinutes(reps);
  } else {
    // Estimate based on rep count and exercise category
    const repCount = parseInt(reps.replace(/[^\d]/g, "")) || 10;
    const category = exercise.category?.toLowerCase() || "";

    // Time estimates per rep (in seconds)
    let secondsPerRep = 3; // Default

    if (category.includes("cardio")) {
      secondsPerRep = 60; // Cardio exercises tend to be longer
    } else if (category.includes("stretch") || category.includes("mobility")) {
      secondsPerRep = 5; // Stretching takes a bit longer per rep
    } else if (category.includes("legs") || category.includes("back")) {
      secondsPerRep = 4; // Compound movements take longer
    }

    timePerSet = (repCount * secondsPerRep) / 60; // Convert to minutes

    // Add rest time between sets (assume 60-90 seconds rest)
    if (sets > 1) {
      const restTime = 1.25 * (sets - 1); // 1.25 minutes rest per set
      totalTime += restTime;
    }
  }

  totalTime += timePerSet * sets;

  return Math.round(totalTime * 10) / 10; // Round to 1 decimal place
};

/**
 * Calculate total time for a workout section
 * @param {Array} exercises - Array of exercise objects
 * @returns {string} - Formatted total time string
 */
export const calculateWorkoutTotalTime = (exercises) => {
  if (!exercises || !Array.isArray(exercises)) return "0 min";

  const totalMinutes = exercises.reduce((total, exercise) => {
    return total + calculateExerciseTime(exercise);
  }, 0);

  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  } else {
    return `${Math.round(totalMinutes)}m`;
  }
};

/**
 * Check if a section should show workout time calculation
 * @param {string} title - Section title
 * @returns {boolean} - Whether to show workout time
 */
export const shouldShowWorkoutTime = (title) => {
  const workoutKeywords = ["workout", "gym", "exercise", "training"];
  return workoutKeywords.some((keyword) =>
    title.toLowerCase().includes(keyword.toLowerCase())
  );
};
