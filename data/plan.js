/*
 * GO PLACES — Plan My Day settings
 * ================================
 * The choices on the Plan My Day screen (#plan) and how they match places.
 * Shared by every city. Plain JSON. The time choices are the same ones as
 * "What can I do right now?" (timeOptions in data/discover.js).
 *
 * INTERESTS: a place matches an interest when ANY of these is true:
 *   themes              it is in one of these themes (data/spots.js)
 *   knowledge           it is in one of these Free Knowledge subcategories
 *   activityCategories  an activity linked to it has one of these categories
 *   activities          one of these activities is linked to it
 *   placeIds            it is one of these places
 *   minMeta             its metadata is at least this, e.g. { "photoValue": 8 }
 *   Interest ids match the profile interests in data/social.js where they
 *   overlap, so a signed-in explorer's interests are picked for them.
 *
 * COMPANIONS: `visitorTypes` are matched against the place metadata.
 *
 * WEIGHTS: how much each thing counts when scoring a place (see plan.js).
 */
window.GO_PLACES_PLAN = {
  "interests": [
    { "id": "nature",       "label": "Nature",       "emoji": "🌿", "themes": ["outdoors"], "activityCategories": ["Nature"], "placeIds": ["hinterbruehl", "westpark", "nymphenburg-canal", "rosengarten-untergiesing", "botanischer-garten", "walderlebniszentrum-gruenwald"] },
    { "id": "history",      "label": "History",      "emoji": "📜", "themes": ["churches"], "knowledge": ["history"], "activityCategories": ["History"] },
    { "id": "architecture", "label": "Architecture", "emoji": "🏛️", "themes": ["architecture", "churches"], "activityCategories": ["Architecture"] },
    { "id": "photography",  "label": "Photography",  "emoji": "📸", "activityCategories": ["Photography"], "minMeta": { "photoValue": 8 } },
    { "id": "museums",      "label": "Museums",      "emoji": "🖼️", "knowledge": ["free-museums"] },
    { "id": "books",        "label": "Books",        "emoji": "📖", "knowledge": ["public-bookshelves", "literature", "libraries"] },
    { "id": "cycling",      "label": "Cycling",      "emoji": "🚲", "activityCategories": ["Cycling"], "placeIds": ["forstenrieder-park", "schleissheim", "field-sunset"] },
    { "id": "wildlife",     "label": "Wildlife",     "emoji": "🦌", "activities": ["watch-ducks", "deer-spotting"], "placeIds": ["walderlebniszentrum-gruenwald", "hinterbruehl", "westpark", "nymphenburg-canal"] },
    { "id": "hidden-gems",  "label": "Hidden Gems",  "emoji": "💎", "minMeta": { "hiddenGemScore": 7 } },
    { "id": "learning",     "label": "Learning",     "emoji": "🧠", "themes": ["free-knowledge"], "minMeta": { "knowledgeValue": 7 } },
    { "id": "science",      "label": "Science",      "emoji": "🔬", "knowledge": ["science"] },
    { "id": "art",          "label": "Art",          "emoji": "🎨", "knowledge": ["public-art"] },
    { "id": "cars",         "label": "Cars",         "emoji": "🚗", "placeIds": ["motorworld"] }
  ],

  "budgets": [
    { "id": "free",  "label": "Free",      "max": "Free" },
    { "id": "5",     "label": "Under 5€",  "max": "Under 5€" },
    { "id": "10",    "label": "Under 10€", "max": "Under 10€" },
    { "id": "any",   "label": "Any",       "max": "Premium" }
  ],

  "companions": [
    { "id": "solo",    "label": "Solo",    "emoji": "🧍", "visitorTypes": ["Solo"] },
    { "id": "friends", "label": "Friends", "emoji": "👯", "visitorTypes": ["Friends", "Students"] },
    { "id": "date",    "label": "Date",    "emoji": "💞", "visitorTypes": ["Couples"] },
    { "id": "family",  "label": "Family",  "emoji": "👨‍👩‍👧", "visitorTypes": ["Families"] }
  ],

  "weather": [
    { "id": "Sunny",  "label": "Sunny",  "emoji": "☀️" },
    { "id": "Cloudy", "label": "Cloudy", "emoji": "☁️" },
    { "id": "Rainy",  "label": "Rainy",  "emoji": "🌧️" },
    { "id": "Snow",   "label": "Snow",   "emoji": "❄️" }
  ],

  "weights": {
    "interest": 5,
    "weather": 3,
    "companions": 1.5,
    "hiddenGem": 1,
    "timeOfDay": 1,
    "season": 1,
    "daylight": 3,
    "travel": 0.12
  },

  "maxStops": 6
};
