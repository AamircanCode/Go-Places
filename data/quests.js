/*
 * GO PLACES — quests and badges
 * =============================
 * A quest is finished when everything in `requiredActivities` is done (and
 * `requiredCount`, if set, is reached). Finishing it earns `rewardBadgeId`.
 * Plain JSON; add a quest and a badge, nothing else to change.
 *
 * Each entry in requiredActivities can be:
 *   "watch-ducks"               do this activity anywhere
 *   "watch-ducks@westpark"      do this activity at this place (spot id)
 *   "gem:residenz-lions"        find this hidden gem
 *   "place:eisbach"             mark this spot as explored
 *
 *   requiredCount   optional: number of different activities to do (or
 *                   hidden gems to find, with "countType": "gems")
 */
window.GO_PLACES_LAYER = window.GO_PLACES_LAYER || {};

window.GO_PLACES_LAYER.quests = [
  {
    "id": "sunset-hunter",
    "title": "Sunset Hunter",
    "description": "Watch the sun go down from three of Munich's best viewpoints.",
    "requiredActivities": ["watch-sunset@hackerbruecke", "watch-sunset@olympiaberg", "watch-sunset@froettmaninger-berg"],
    "rewardBadgeId": "sunset-hunter"
  },
  {
    "id": "duck-detective",
    "title": "Duck Detective",
    "description": "Track down the ducks in three corners of the city.",
    "requiredActivities": ["watch-ducks@hinterbruehl", "watch-ducks@westpark", "watch-ducks@nymphenburg-canal"],
    "rewardBadgeId": "duck-detective"
  },
  {
    "id": "old-town-historian",
    "title": "Old Town Historian",
    "description": "Catch the Glockenspiel, walk the old churches trail and climb Old Peter.",
    "requiredActivities": ["glockenspiel-show", "old-churches-trail", "climb-alter-peter"],
    "rewardBadgeId": "historian"
  },
  {
    "id": "forest-ranger",
    "title": "Forest Ranger",
    "description": "Spot the deer, ride the trails and finish with a sunset over the fields.",
    "requiredActivities": ["deer-spotting", "forest-ride", "watch-sunset@field-sunset"],
    "rewardBadgeId": "forest-ranger"
  },
  {
    "id": "gem-hunter",
    "title": "Gem Hunter",
    "description": "Find three hidden gems.",
    "requiredActivities": [],
    "requiredCount": 3,
    "countType": "gems",
    "rewardBadgeId": "gem-hunter"
  },
  {
    "id": "munich-explorer",
    "title": "Munich Explorer",
    "description": "Do 10 different activities anywhere in the city.",
    "requiredActivities": [],
    "requiredCount": 10,
    "rewardBadgeId": "explorer"
  }
];

window.GO_PLACES_LAYER.badges = [
  { "id": "sunset-hunter", "title": "Sunset Hunter",  "emoji": "🌅", "description": "Watched the sunset from Hackerbrücke, Olympiaberg and Fröttmaninger Berg." },
  { "id": "duck-detective", "title": "Duck Detective", "emoji": "🦆", "description": "Found the ducks at Hinterbrühl, Westpark and the Nymphenburg canal." },
  { "id": "historian",      "title": "Historian",      "emoji": "📜", "description": "Explored the heart of old Munich." },
  { "id": "forest-ranger",  "title": "Forest Ranger",  "emoji": "🌲", "description": "Conquered Forstenrieder Park." },
  { "id": "gem-hunter",     "title": "Gem Hunter",     "emoji": "💎", "description": "Found three hidden gems." },
  { "id": "explorer",       "title": "Explorer",       "emoji": "🧭", "description": "Did 10 different activities in Munich." }
];
