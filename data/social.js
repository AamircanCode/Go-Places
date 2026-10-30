/*
 * GO PLACES — explorers
 * =====================
 * Interests people can pick for their profile, and the groups on the
 * "Discover explorers" page (#explorers). Plain JSON.
 *
 * INTERESTS: `id` is what's stored in the profile (lowercase letters and -).
 *
 * GROUPS: someone shows up in a group when they picked one of its
 * `interests`, or when at least `minMatches` (default 2) of the things they
 * share publicly match it:
 *   themes              explored spots in these themes (data/spots.js)
 *   knowledge           explored places in these Free Knowledge subcategories
 *   activityCategories  done activities in these categories (data/activities.js)
 *   gems                found at least this many hidden gems
 * Explorers are shown in a random order, never ranked.
 */
window.GO_PLACES_SOCIAL = {
  interests: [
    { "id": "nature",       "label": "Nature",       "emoji": "🌿" },
    { "id": "history",      "label": "History",      "emoji": "📜" },
    { "id": "architecture", "label": "Architecture", "emoji": "🏛️" },
    { "id": "museums",      "label": "Museums",      "emoji": "🖼️" },
    { "id": "books",        "label": "Books",        "emoji": "📖" },
    { "id": "photography",  "label": "Photography",  "emoji": "📸" },
    { "id": "cycling",      "label": "Cycling",      "emoji": "🚲" },
    { "id": "hidden-gems",  "label": "Hidden Gems",  "emoji": "💎" },
    { "id": "science",      "label": "Science",      "emoji": "🔬" },
    { "id": "art",          "label": "Art",          "emoji": "🎨" }
  ],

  groups: [
    {
      "id": "nature", "title": "Nature Enthusiasts", "emoji": "🌿",
      "description": "Forests, fields, ducks and sunsets.",
      "interests": ["nature", "cycling"], "themes": ["outdoors"], "activityCategories": ["Nature", "Cycling"]
    },
    {
      "id": "knowledge", "title": "Knowledge Hunters", "emoji": "📚",
      "description": "Always learning: free museums, bookshelves and exhibitions.",
      "interests": ["books", "museums", "science"], "themes": ["free-knowledge"], "activityCategories": ["Learning"]
    },
    {
      "id": "museums", "title": "Museum Explorers", "emoji": "🖼️",
      "description": "Fossils, plaster gods and contemporary art.",
      "interests": ["museums", "art"], "knowledge": ["free-museums"]
    },
    {
      "id": "readers", "title": "Bookshelf Readers", "emoji": "📖",
      "description": "Take a book, leave a book.",
      "interests": ["books"], "knowledge": ["public-bookshelves", "literature"]
    },
    {
      "id": "architecture", "title": "Architecture Enthusiasts", "emoji": "🏛️",
      "description": "Gothic towers, Baroque churches and 'Athens on the Isar'.",
      "interests": ["architecture"], "themes": ["architecture", "churches"], "activityCategories": ["Architecture"]
    },
    {
      "id": "photographers", "title": "Photographers", "emoji": "📸",
      "description": "Chasing light, views and good frames.",
      "interests": ["photography"], "themes": ["sunsets"], "activityCategories": ["Photography"]
    },
    {
      "id": "history", "title": "History Buffs", "emoji": "📜",
      "description": "Old churches, old stories and places that remember.",
      "interests": ["history"], "themes": ["churches"], "knowledge": ["history"], "activityCategories": ["History"]
    },
    {
      "id": "hidden-gems", "title": "Hidden Gem Explorers", "emoji": "💎",
      "description": "The little corners most people walk past.",
      "interests": ["hidden-gems"], "themes": ["side-quests"], "gems": 1
    }
  ]
};
