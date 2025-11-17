import { parseTimeToMinutes, calculateExerciseTime } from './workoutTimeCalculator';

/**
 * Get the current day of the week in lowercase
 * @returns {string} Day of the week (monday, tuesday, etc.)
 */
export const getCurrentDay = () => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
};

/**
 * Get today's exercise time limit in minutes
 * @param {Object} exerciseTimeLimits - Object with daily time limits
 * @returns {number} Time limit in minutes
 */
export const getTodaysTimeLimit = (exerciseTimeLimits) => {
  const today = getCurrentDay();
  const limitMinutes = parseInt(exerciseTimeLimits[today]) || 60;
  return limitMinutes;
};

/**
 * Calculate total time for a list of exercises
 * @param {Array} exercises - Array of exercise objects
 * @returns {number} Total time in minutes
 */
export const calculateTotalExerciseTime = (exercises) => {
  return exercises.reduce((total, exercise) => {
    return total + parseTimeToMinutes(calculateExerciseTime(exercise));
  }, 0);
};

/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Filter exercises by preferred category (if set)
 * @param {Array} exercises - Array of exercise objects
 * @param {string} preferredCategory - Preferred category for today
 * @returns {Array} Filtered exercises
 */
export const filterExercisesByCategory = (exercises, preferredCategory) => {
  if (!preferredCategory || preferredCategory.trim() === '') {
    return exercises;
  }
  
  return exercises.filter(exercise => 
    exercise.category && exercise.category.toLowerCase() === preferredCategory.toLowerCase()
  );
};

/**
 * Select exercises that fit within the time limit
 * @param {Array} exercises - Array of exercise objects
 * @param {number} timeLimitMinutes - Time limit in minutes
 * @param {string} preferredCategory - Preferred category filter (optional)
 * @param {boolean} randomize - Whether to randomize the selection
 * @returns {Object} Result with selected exercises and metadata
 */
export const selectExercisesWithinTimeLimit = (exercises, timeLimitMinutes, preferredCategory = '', randomize = true) => {
  let availableExercises = [...exercises];
  
  // Filter by preferred category if specified
  if (preferredCategory && preferredCategory.trim() !== '') {
    const categoryFiltered = filterExercisesByCategory(availableExercises, preferredCategory);
    if (categoryFiltered.length > 0) {
      availableExercises = categoryFiltered;
    }
  }
  
  // Randomize if requested
  if (randomize) {
    availableExercises = shuffleArray(availableExercises);
  }
  
  const selectedExercises = [];
  let totalTime = 0;
  
  // Separate exercises by priority (warmup, cooldown should be included)
  const warmupExercises = availableExercises.filter(ex => 
    ex.category && ex.category.toLowerCase() === 'cardio' && 
    (ex.name || ex.text || '').toLowerCase().includes('warm')
  );
  
  const cooldownExercises = availableExercises.filter(ex => 
    ex.category && ex.category.toLowerCase() === 'mobility' && 
    (ex.name || ex.text || '').toLowerCase().includes('stretch')
  );
  
  const mainExercises = availableExercises.filter(ex => 
    !warmupExercises.includes(ex) && !cooldownExercises.includes(ex)
  );
  
  // Always include at least one warmup if available and time permits
  if (warmupExercises.length > 0) {
    const warmup = warmupExercises[0];
    const warmupTime = parseTimeToMinutes(calculateExerciseTime(warmup));
    if (warmupTime <= timeLimitMinutes) {
      selectedExercises.push(warmup);
      totalTime += warmupTime;
    }
  }
  
  // Add main exercises while under time limit
  for (const exercise of mainExercises) {
    const exerciseTime = parseTimeToMinutes(calculateExerciseTime(exercise));
    if (totalTime + exerciseTime <= timeLimitMinutes) {
      selectedExercises.push(exercise);
      totalTime += exerciseTime;
    }
  }
  
  // Add cooldown if there's time and space
  if (cooldownExercises.length > 0) {
    const cooldown = cooldownExercises[0];
    const cooldownTime = parseTimeToMinutes(calculateExerciseTime(cooldown));
    if (totalTime + cooldownTime <= timeLimitMinutes) {
      selectedExercises.push(cooldown);
      totalTime += cooldownTime;
    }
  }
  
  return {
    exercises: selectedExercises,
    totalTimeMinutes: totalTime,
    timeLimitMinutes,
    remainingTimeMinutes: timeLimitMinutes - totalTime,
    wasRandomized: randomize,
    categoryFilter: preferredCategory,
    totalAvailable: availableExercises.length,
    selectedCount: selectedExercises.length
  };
};

/**
 * Format time remaining/used for display
 * @param {number} minutes - Time in minutes
 * @returns {string} Formatted time string
 */
export const formatTimeRemaining = (minutes) => {
  if (minutes <= 0) return 'No time remaining';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} min remaining`;
  } else if (mins === 0) {
    return `${hours}h remaining`;
  } else {
    return `${hours}h ${mins}m remaining`;
  }
};

/**
 * Check if exercises need regeneration based on preferences
 * @param {Object} currentSelection - Current exercise selection result
 * @param {string} newPreferredCategory - New preferred category
 * @param {number} newTimeLimitMinutes - New time limit
 * @returns {boolean} Whether exercises should be regenerated
 */
export const shouldRegenerateExercises = (currentSelection, newPreferredCategory, newTimeLimitMinutes) => {
  if (!currentSelection) return true;
  
  return (
    currentSelection.categoryFilter !== newPreferredCategory ||
    currentSelection.timeLimitMinutes !== newTimeLimitMinutes
  );
};