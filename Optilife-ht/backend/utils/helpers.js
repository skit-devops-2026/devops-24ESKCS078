// Shared helper functions for dates, streaks, readiness and input validation

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ALLOWED_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const LEAD_TIME_OPTIONS = [5, 10, 15, 30];
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Turns a Date object into a YYYY-MM-DD string (local time)
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function todayString() {
  return formatDate(new Date());
}

function isValidDate(value) {
  return typeof value === 'string' && DATE_REGEX.test(value);
}

// Moves a YYYY-MM-DD string forward or backward by a number of days
function addDays(dateString, days) {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

// Returns 'Mon', 'Tue', etc. for a YYYY-MM-DD string
function dayNameOf(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return DAY_NAMES[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
}

// Number of days from dateA to dateB (2 means dateB is two days later)
function daysBetween(dateA, dateB) {
  const toDayNumber = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return Date.UTC(year, month - 1, day) / 86400000;
  };
  return toDayNumber(dateB) - toDayNumber(dateA);
}

// Works out the current and longest streak from a list of completed dates.
// Several completions on the same day count as one streak day.
function calculateStreaks(completedDates, today) {
  const uniqueDates = [...new Set(completedDates)].sort();

  // Longest streak: count runs of consecutive days
  let longestStreak = 0;
  let runLength = 0;
  let previousDate = null;
  for (const date of uniqueDates) {
    if (previousDate && daysBetween(previousDate, date) === 1) {
      runLength += 1;
    } else {
      runLength = 1;
    }
    longestStreak = Math.max(longestStreak, runLength);
    previousDate = date;
  }

  // Current streak: count backwards from today. If today is not done yet, start from yesterday.
  const dateSet = new Set(uniqueDates);
  let cursor = dateSet.has(today) ? today : addDays(today, -1);
  let currentStreak = 0;
  while (dateSet.has(cursor)) {
    currentStreak += 1;
    cursor = addDays(cursor, -1);
  }

  return { currentStreak, longestStreak, totalDays: uniqueDates.length };
}

// Readiness Score = ((Sleep + Energy + Day Quality) / 30) x 100
function calculateReadiness(sleep, energy, dayQuality) {
  return Math.round(((sleep + energy + dayQuality) / 30) * 100);
}

// Checks the three check-in ratings. Each must be a whole number from 1 to 10.
function validateScores(body = {}) {
  const data = {};
  for (const field of ['sleep', 'energy', 'dayQuality']) {
    const value = Number(body[field]);
    if (!Number.isInteger(value) || value < 1 || value > 10) {
      return { error: 'All three ratings must be whole numbers from 1 to 10' };
    }
    data[field] = value;
  }
  return { data };
}

// Checks routine fields and returns only the fields we want to save
function validateRoutineInput(body = {}) {
  const name = String(body.name || '').trim();
  const trigger = String(body.trigger || '').trim();
  const fullVersion = String(body.fullVersion || '').trim();
  const smallVersion = String(body.smallVersion || '').trim();

  if (!name) return { error: 'Routine name is required' };
  if (!trigger) return { error: 'Please describe the IF trigger' };
  if (!fullVersion || !smallVersion) return { error: 'Both the full and small versions are required' };

  const selectedDays = Array.isArray(body.selectedDays)
    ? body.selectedDays.filter((day) => ALLOWED_DAYS.includes(day))
    : [];
  if (selectedDays.length === 0) return { error: 'Select at least one day of the week' };

  const preferredTime = body.preferredTime || '07:00';
  if (!TIME_REGEX.test(preferredTime)) return { error: 'Preferred time must be in HH:MM format' };

  const reminder = body.reminderSettings || {};
  const leadMinutes = Number(reminder.leadMinutes);

  return {
    data: {
      name,
      description: String(body.description || '').trim(),
      trigger,
      fullVersion,
      smallVersion,
      selectedDays,
      preferredTime,
      reminderSettings: {
        enabled: Boolean(reminder.enabled),
        leadMinutes: LEAD_TIME_OPTIONS.includes(leadMinutes) ? leadMinutes : 10
      },
      isActive: body.isActive !== false
    }
  };
}

module.exports = {
  todayString,
  formatDate,
  isValidDate,
  addDays,
  dayNameOf,
  daysBetween,
  calculateStreaks,
  calculateReadiness,
  validateScores,
  validateRoutineInput
};
