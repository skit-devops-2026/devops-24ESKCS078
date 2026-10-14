// Date and readiness helpers used across the frontend

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad(number) {
  return String(number).padStart(2, '0');
}

// YYYY-MM-DD for today in the user's local time
export function todayString() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// 'Mon', 'Tue', ... for today
export function todayDayName() {
  return DAY_NAMES[new Date().getDay()];
}

// 'HH:MM' for right now
export function currentTime() {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

// Short weekday name for a YYYY-MM-DD string, e.g. 'Mon'
export function dayShortName(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' });
}

// Short date for a YYYY-MM-DD string, e.g. 'Oct 11'
export function shortDate(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Converts '18:30' into '6:30 PM'
export function formatTime(time24) {
  const [hour, minute] = time24.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${pad(minute)} ${period}`;
}

// Takes minutes off a 'HH:MM' time, e.g. 07:00 minus 10 gives 06:50
export function subtractMinutes(time24, minutes) {
  const [hour, minute] = time24.split(':').map(Number);
  const total = (hour * 60 + minute - minutes + 1440) % 1440;
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

// Gives a label and a short message for a readiness score
export function getReadinessInfo(score) {
  if (score >= 80) return { label: 'Excellent readiness', message: 'You are well rested and ready for your routines.' };
  if (score >= 60) return { label: 'Good readiness', message: 'A solid day ahead. Keep your routines steady.' };
  if (score >= 50) return { label: 'Moderate readiness', message: 'Take it at a comfortable pace and focus on the essentials.' };
  return { label: 'Low readiness', message: 'Be kind to yourself today. Small steps still count.' };
}
