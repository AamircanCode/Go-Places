/*
 * GO PLACES — discovery settings
 * ==============================
 * The moods, activity categories and time choices used by the "How do you
 * feel today?" and "What can I do right now?" sections. Plain JSON.
 *
 * MOODS: an activity shows up under a mood when the mood's `id` is in the
 * activity's `moodTags` (data/activities.js). Add a mood here and tag some
 * activities with it; nothing else to change.
 *
 * TIME OPTIONS: "What can I do right now?" shows the activities whose
 * `durationMinutes` is at most `maxMinutes`.
 */
window.GO_PLACES_LAYER = window.GO_PLACES_LAYER || {};

window.GO_PLACES_LAYER.moods = [
  { "id": "relax",       "label": "Relax",         "emoji": "😌", "description": "Slow down, sit by the water, watch the sky." },
  { "id": "explore",     "label": "Explore",       "emoji": "🧭", "description": "See something you haven't seen before." },
  { "id": "learn",       "label": "Learn",         "emoji": "📚", "description": "History, churches, museums and buildings with stories." },
  { "id": "socialize",   "label": "Socialize",     "emoji": "🍻", "description": "Places to be among people." },
  { "id": "be-active",   "label": "Be Active",     "emoji": "🏃", "description": "Walk, climb, cycle, move." },
  { "id": "take-photos", "label": "Take Photos",   "emoji": "📸", "description": "Views, light and frames worth a photo." },
  { "id": "date",        "label": "Go On A Date",  "emoji": "💞", "description": "Sunsets, picnics and quiet walks for two." },
  { "id": "nature",      "label": "Nature Escape", "emoji": "🌿", "description": "Forests, fields, animals and water." }
];

window.GO_PLACES_LAYER.categories = [
  { "id": "Nature",       "emoji": "🌿" },
  { "id": "Photography",  "emoji": "📸" },
  { "id": "Relaxation",   "emoji": "😌" },
  { "id": "Adventure",    "emoji": "🧗" },
  { "id": "Architecture", "emoji": "🏛️" },
  { "id": "History",      "emoji": "📜" },
  { "id": "Culture",      "emoji": "🎭" },
  { "id": "Date Ideas",   "emoji": "💞" },
  { "id": "Family",       "emoji": "👨‍👩‍👧" },
  { "id": "Walking",      "emoji": "🚶" },
  { "id": "Cycling",      "emoji": "🚲" },
  { "id": "Learning",     "emoji": "📚" }
];

window.GO_PLACES_LAYER.timeOptions = [
  { "id": "30m",  "label": "30 Minutes", "maxMinutes": 30 },
  { "id": "1h",   "label": "1 Hour",     "maxMinutes": 60 },
  { "id": "2h",   "label": "2 Hours",    "maxMinutes": 120 },
  { "id": "half", "label": "Half Day",   "maxMinutes": 240 },
  { "id": "full", "label": "Full Day",   "maxMinutes": 600 }
];
