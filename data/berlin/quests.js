/*
 * GO PLACES — Berlin quests and badges
 * ====================================
 * Works exactly like data/quests.js (Munich): the top of that file explains
 * every field. Badges that exist in both cities keep the same id, so you
 * only earn them once.
 */
window.GO_PLACES_LAYER = window.GO_PLACES_LAYER || {};

window.GO_PLACES_LAYER.quests = [
  {
    "id": "berlin-sunset-hunter",
    "title": "Berlin Sunset Hunter",
    "description": "Watch the sun go down from a flak tower, a bridge and an old airport.",
    "requiredActivities": ["watch-sunset@humboldthain", "watch-sunset@oberbaumbruecke", "watch-sunset@tempelhofer-feld"],
    "rewardBadgeId": "berlin-sunset-hunter"
  },
  {
    "id": "wall-walker",
    "title": "Wall Walker",
    "description": "Trace the Berlin Wall: the memorial on Bernauer Straße, the Brandenburg Gate and the East Side Gallery.",
    "requiredActivities": ["place:berlin-wall-memorial", "place:brandenburger-tor", "east-side-gallery-walk"],
    "rewardBadgeId": "wall-walker"
  },
  {
    "id": "berlin-after-dark",
    "title": "Berlin After Dark",
    "description": "Dance in a phone box, get a photo booth strip and spend an evening by the Spree.",
    "requiredActivities": ["one-song-disco", "photo-booth-strip", "riverside-evening"],
    "rewardBadgeId": "berlin-after-dark"
  },
  {
    "id": "berlin-gem-hunter",
    "title": "Gem Hunter",
    "description": "Find three hidden gems.",
    "requiredActivities": [],
    "requiredCount": 3,
    "countType": "gems",
    "rewardBadgeId": "gem-hunter"
  }
];

window.GO_PLACES_LAYER.badges = [
  { "id": "berlin-sunset-hunter", "title": "Berlin Sunset Hunter", "emoji": "🌇", "description": "Watched the sunset from Humboldthain, Oberbaumbrücke and Tempelhofer Feld." },
  { "id": "wall-walker",          "title": "Wall Walker",          "emoji": "🧱", "description": "Followed the line of the Berlin Wall." },
  { "id": "berlin-after-dark",    "title": "Berlin After Dark",    "emoji": "🪩", "description": "Danced in a phone box and saw Berlin by night." },
  { "id": "gem-hunter",           "title": "Gem Hunter",           "emoji": "💎", "description": "Found three hidden gems." }
];
