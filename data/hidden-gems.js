/*
 * GO PLACES — hidden gems
 * =======================
 * Small, lesser-known discoveries, shown separately from the main spots.
 * Copy a block to add one. Plain JSON.
 *
 *   id           short unique name, lowercase, letters, numbers and -
 *   title        what people see
 *   emoji        optional, shown when there is no image
 *   description  what it is
 *   whyVisit     why it's worth the detour
 *   localTip     an insider tip
 *   bestTime     when to go
 *   category     one or more categories from data/discover.js
 *   coordinates  { "lat": ..., "lng": ... }. In Google Maps: right-click, click the numbers
 *   images       optional photos, e.g. "images/my-gem.jpg"
 *
 * The coordinates below are approximate. VERIFY each one on the map before launch.
 */
window.GO_PLACES_LAYER = window.GO_PLACES_LAYER || {};
window.GO_PLACES_LAYER.hiddenGems = [
  {
    "id": "drueckebergergassl",
    "title": "The golden 'shirkers' alley'",
    "emoji": "✨",
    "description": "A narrow lane behind the Feldherrnhalle with a wavy line of golden cobblestones running through it.",
    "whyVisit": "In the 1930s a Nazi memorial at the Feldherrnhalle had to be saluted by everyone passing. People quietly took this lane instead to avoid it, and Munich nicknamed it the 'Drückebergergassl'. The golden line remembers that small act of defiance.",
    "localTip": "Start at Residenzstraße and follow the golden line through Viscardigasse.",
    "bestTime": "Any time",
    "category": ["History", "Walking"],
    "coordinates": { "lat": 48.14180, "lng": 11.57700 },
    "images": []
  },
  {
    "id": "residenz-lions",
    "title": "The lucky lions of the Residenz",
    "emoji": "🦁",
    "description": "Four bronze lions guard the entrances of the Residenz on Residenzstraße, each holding a shield with a lion's face on it.",
    "whyVisit": "Locals rub the little lion faces on the shields for luck as they walk past, which is why they shine gold while the rest is dark.",
    "localTip": "Do it like the locals: rub one in passing, don't stop and pose.",
    "bestTime": "Any time",
    "category": ["History", "Culture"],
    "coordinates": { "lat": 48.14060, "lng": 11.57760 },
    "images": []
  },
  {
    "id": "alter-hof",
    "title": "Hidden courtyard of the Alter Hof",
    "emoji": "🏰",
    "description": "A quiet courtyard just off the busy old town, inside Munich's very first royal residence.",
    "whyVisit": "Most people walk past the gate. Inside you'll find a little oriel called the 'Monkey Tower', named after a legend that a monkey once carried the baby Ludwig the Bavarian up onto the roof.",
    "localTip": "Look up at the corner oriel on the courtyard side to find the Affenturm.",
    "bestTime": "Daytime",
    "category": ["History", "Architecture"],
    "coordinates": { "lat": 48.13870, "lng": 11.57860 },
    "images": []
  },
  {
    "id": "luitpold-hill-bench",
    "title": "The quiet sunset bench on Luitpoldhügel",
    "emoji": "🪑",
    "description": "A small hill in Luitpoldpark in Schwabing with a cross on top and benches looking west.",
    "whyVisit": "Like Olympiaberg it's made from wartime rubble, but with a fraction of the people. A calm place to watch the sun go down over the rooftops.",
    "localTip": "Bring something warm to drink in autumn; you'll likely have the bench to yourself.",
    "bestTime": "Sunset",
    "category": ["Relaxation", "Nature"],
    "coordinates": { "lat": 48.17030, "lng": 11.57050 },
    "images": []
  },
  {
    "id": "flaucher-picnic",
    "title": "Secret picnic islands at the Flaucher",
    "emoji": "🧺",
    "description": "Gravel banks and little islands in the middle of the Isar, reached by stepping stones and footbridges.",
    "whyVisit": "On summer evenings locals spread out on the pebbles, dip their feet in the river and watch the light go golden. It feels like a beach trip without leaving the city.",
    "localTip": "Walk a bit further south than the crowds for your own patch of gravel. The current is strong, so stay in the shallows.",
    "bestTime": "Summer evenings",
    "category": ["Nature", "Relaxation", "Date Ideas"],
    "coordinates": { "lat": 48.11050, "lng": 11.55400 },
    "images": []
  },
  {
    "id": "friedenheimer-bridge",
    "title": "The train spotters' bridge",
    "emoji": "🚆",
    "description": "Friedenheimer Brücke crosses the wide fan of railway tracks west of Hackerbrücke.",
    "whyVisit": "Fewer people than Hackerbrücke, the same endless stream of trains below, and an open view east to the city towers.",
    "localTip": "Come around sunset: the low sun lights up the rails like a river of gold.",
    "bestTime": "Evening",
    "category": ["Photography", "Family"],
    "coordinates": { "lat": 48.14300, "lng": 11.52650 },
    "images": []
  },
  {
    "id": "olympiapark-cherry-blossoms",
    "title": "Cherry blossoms in the Olympic Park",
    "emoji": "🌸",
    "description": "A grove of Japanese cherry trees by the Olympic lake that turns pink for a couple of weeks each spring.",
    "whyVisit": "A little hanami moment in Munich: blossoms, the lake and the stadium roof in one frame.",
    "localTip": "Blossoms usually peak in April and fall fast after rain. Go on a weekday morning.",
    "bestTime": "April mornings",
    "category": ["Nature", "Photography"],
    "coordinates": { "lat": 48.17200, "lng": 11.55500 },
    "images": []
  }
];
