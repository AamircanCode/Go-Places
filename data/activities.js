/*
 * GO PLACES — activities ("What can I do?")
 * ==========================================
 * An activity is something to do, linked to one or more places from
 * data/spots.js. Add one by copying a block, pasting it at the end of the
 * list and changing the values. No code changes are needed.
 *
 * The list between the [ ] is plain JSON, so it can also be loaded into a
 * database table one row per activity.
 *
 *   id               short unique name, lowercase, letters, numbers and -
 *   title            what people see
 *   emoji            optional, shown when there is no image
 *   description      a few sentences
 *   category         one of the `categories` in data/discover.js
 *   duration         how long it takes, in words ("About 1 hour")
 *   durationMinutes  the same as a number. "What can I do right now?" uses it
 *   cost             euros, 0 for free
 *   moodTags         which moods show it (ids from `moods` in data/discover.js)
 *   bestTime         when to go, in words
 *   season           any of "spring", "summer", "autumn", "winter"
 *   placeIds         spot ids from data/spots.js. Can be empty
 *   images           optional photos, e.g. "images/hinterbruehl-ducks.jpg"
 *
 * Facts marked "VERIFY" are worth double-checking before launch.
 */
window.GO_PLACES_LAYER = window.GO_PLACES_LAYER || {};
window.GO_PLACES_LAYER.activities = [
  {
    "id": "watch-sunset",
    "title": "Watch the sunset",
    "emoji": "🌅",
    "description": "Find a high or open spot, sit down and watch the sky turn orange and pink. Munich has sunset spots on bridges, hills and the edge of the fields.",
    "category": "Relaxation",
    "duration": "About 1 hour",
    "durationMinutes": 60,
    "cost": 0,
    "moodTags": ["relax", "take-photos", "date", "nature"],
    "bestTime": "Arrive 30–45 minutes before sunset",
    "season": ["spring", "summer", "autumn", "winter"],
    "placeIds": ["hackerbruecke", "olympiaberg", "froettmaninger-berg", "monopteros", "field-sunset", "raftsman-statue"],
    "images": ["images/sunset-field-1.jpg"]
  },
  {
    "id": "watch-ducks",
    "title": "Watch the ducks",
    "emoji": "🦆",
    "description": "Sit by the water and let the ducks, swans and coots come to you. Look out for the colourful mandarin ducks at Hinterbrühl. Please don't feed them bread.",
    "category": "Nature",
    "duration": "About 30 minutes",
    "durationMinutes": 30,
    "cost": 0,
    "moodTags": ["relax", "nature"],
    "bestTime": "Late afternoon",
    "season": ["spring", "summer", "autumn", "winter"],
    "placeIds": ["hinterbruehl", "westpark", "nymphenburg-canal"],
    "images": ["images/hinterbruehl-ducks.jpg"]
  },
  {
    "id": "watch-river-surfers",
    "title": "Watch the river surfers",
    "emoji": "🏄",
    "description": "Stand on the bridge by the Haus der Kunst and watch surfers take turns on a standing wave in the middle of the city, even in winter.",
    "category": "Culture",
    "duration": "About 30 minutes",
    "durationMinutes": 30,
    "cost": 0,
    "moodTags": ["explore", "take-photos", "socialize"],
    "bestTime": "Any time of day",
    "season": ["spring", "summer", "autumn", "winter"],
    "placeIds": ["eisbach"],
    "images": []
  },
  {
    "id": "glockenspiel-show",
    "title": "Catch the Glockenspiel show",
    "emoji": "🔔",
    "description": "Watch life-size figures dance and joust in the tower of the New Town Hall, then look for the little golden rooster at the end.",
    "category": "History",
    "duration": "About 30 minutes",
    "durationMinutes": 30,
    "cost": 0,
    "moodTags": ["learn", "explore"],
    "bestTime": "11:00 or 12:00 (also 17:00 from March to October)",
    "season": ["spring", "summer", "autumn", "winter"],
    "placeIds": ["glockenspiel"],
    "images": []
  },
  {
    "id": "historic-city-walk",
    "title": "Historic old town walk",
    "emoji": "🚶",
    "description": "A loop through the oldest part of Munich: Marienplatz, Old Peter, the Frauenkirche, the tiny Asamkirche and the Viktualienmarkt, all within a few minutes of each other.",
    "category": "Walking",
    "duration": "About 1 hour",
    "durationMinutes": 60,
    "cost": 0,
    "moodTags": ["learn", "explore", "be-active"],
    "bestTime": "Daytime, before the shops get busy",
    "season": ["spring", "summer", "autumn", "winter"],
    "placeIds": ["glockenspiel", "alter-peter", "frauenkirche", "asamkirche", "viktualienmarkt"],
    "images": []
  },
  {
    "id": "old-churches-trail",
    "title": "Old churches trail",
    "emoji": "⛪",
    "description": "Visit three very different churches in one go: the Gothic Frauenkirche with the Devil's Footstep, Munich's oldest parish church, and an over-the-top Baroque gem only 8 metres wide.",
    "category": "History",
    "duration": "About 1 hour",
    "durationMinutes": 60,
    "cost": 0,
    "moodTags": ["learn", "take-photos"],
    "bestTime": "Daytime, outside of services",
    "season": ["spring", "summer", "autumn", "winter"],
    "placeIds": ["frauenkirche", "alter-peter", "asamkirche"],
    "images": []
  },
  {
    "id": "climb-alter-peter",
    "title": "Climb Old Peter's tower",
    "emoji": "🗼",
    "description": "About 300 steps up, no lift, and one of the best views of Marienplatz. On clear Föhn days you can see the Alps.",
    "category": "Adventure",
    "duration": "About 45 minutes",
    "durationMinutes": 45,
    "cost": 5,
    "moodTags": ["be-active", "take-photos", "explore"],
    "bestTime": "Clear days, just before the Glockenspiel starts",
    "season": ["spring", "summer", "autumn", "winter"],
    "placeIds": ["alter-peter"],
    "images": []
  },
  {
    "id": "architecture-trail",
    "title": "'Athens on the Isar' architecture trail",
    "emoji": "🏛️",
    "description": "See how King Ludwig I tried to turn Munich into a new Athens: the temples of Königsplatz, the Greek-style Monopteros, and the Gothic towers of the Frauenkirche for contrast.",
    "category": "Architecture",
    "duration": "About 2 hours",
    "durationMinutes": 120,
    "cost": 0,
    "moodTags": ["learn", "take-photos"],
    "bestTime": "Morning or late afternoon light",
    "season": ["spring", "summer", "autumn", "winter"],
    "placeIds": ["koenigsplatz", "monopteros", "frauenkirche"],
    "images": []
  },
  {
    "id": "sunday-museum",
    "title": "Sunday museum for €1",
    "emoji": "🏺",
    "description": "On Sundays many of Bavaria's state museums charge only €1, including the Glyptothek on Königsplatz with its ancient Greek and Roman statues.",
    "category": "Learning",
    "duration": "About 2 hours",
    "durationMinutes": 120,
    "cost": 1,
    "moodTags": ["learn"],
    "bestTime": "Sunday mornings",
    "season": ["spring", "summer", "autumn", "winter"],
    "placeIds": ["koenigsplatz"],
    "images": []
  },
  {
    "id": "beer-garden-brotzeit",
    "title": "Brotzeit in a beer garden",
    "emoji": "🥨",
    "description": "Do it like a local: bring your own bread, cheese and radish, buy a drink, and share a long table with strangers.",
    "category": "Culture",
    "duration": "About 2 hours",
    "durationMinutes": 120,
    "cost": 5,
    "moodTags": ["socialize", "relax", "date"],
    "bestTime": "Sunny afternoons",
    "season": ["spring", "summer", "autumn"],
    "placeIds": ["chinesischer-turm", "viktualienmarkt"],
    "images": []
  },
  {
    "id": "market-tasting",
    "title": "Graze at the Viktualienmarkt",
    "emoji": "🧀",
    "description": "Walk the stalls, try a few things, find the folk singer fountains and see what the maypole shows.",
    "category": "Culture",
    "duration": "About 1 hour",
    "durationMinutes": 60,
    "cost": 10,
    "moodTags": ["socialize", "explore", "date"],
    "bestTime": "Weekday late mornings",
    "season": ["spring", "summer", "autumn", "winter"],
    "placeIds": ["viktualienmarkt"],
    "images": []
  },
  {
    "id": "monopteros-picnic",
    "title": "Picnic on the Monopteros hill",
    "emoji": "🧺",
    "description": "Spread a blanket below the little Greek temple, look out over the English Garden and the city towers, and stay for the sunset.",
    "category": "Date Ideas",
    "duration": "About 2 hours",
    "durationMinutes": 120,
    "cost": 0,
    "moodTags": ["date", "relax", "socialize"],
    "bestTime": "Summer evenings",
    "season": ["spring", "summer", "autumn"],
    "placeIds": ["monopteros"],
    "images": []
  },
  {
    "id": "train-spotting",
    "title": "Watch the trains roll in",
    "emoji": "🚆",
    "description": "Stand on Hackerbrücke and watch ICEs, regional trains and S-Bahns glide in and out of one of Germany's busiest stations. Kids love it.",
    "category": "Family",
    "duration": "About 30 minutes",
    "durationMinutes": 30,
    "cost": 0,
    "moodTags": ["relax", "take-photos"],
    "bestTime": "Any time; evening for the light",
    "season": ["spring", "summer", "autumn", "winter"],
    "placeIds": ["hackerbruecke"],
    "images": []
  },
  {
    "id": "photograph-the-raftsman",
    "title": "Photograph the Isarflößer",
    "emoji": "📸",
    "description": "Frame the bronze raftsman from behind with the old arched bridge reflected in the water. Best when the canal is still.",
    "category": "Photography",
    "duration": "About 30 minutes",
    "durationMinutes": 30,
    "cost": 0,
    "moodTags": ["take-photos", "nature"],
    "bestTime": "About an hour before sunset",
    "season": ["spring", "summer", "autumn", "winter"],
    "placeIds": ["raftsman-statue"],
    "images": ["images/hinterbruehl-1.jpg"]
  },
  {
    "id": "floss-canal-walk",
    "title": "Ducks-to-raftsman canal walk",
    "emoji": "🌿",
    "description": "Start with the ducks at Hinterbrühl and follow the water south to the bronze raftsman. Quiet, green, and twenty minutes from the centre.",
    "category": "Walking",
    "duration": "About 1 hour",
    "durationMinutes": 60,
    "cost": 0,
    "moodTags": ["relax", "nature", "date", "be-active"],
    "bestTime": "Late afternoon into sunset",
    "season": ["spring", "summer", "autumn", "winter"],
    "placeIds": ["hinterbruehl", "raftsman-statue"],
    "images": ["images/hinterbruehl-2.jpg"]
  },
  {
    "id": "spot-the-alps",
    "title": "Spot the Alps from the city",
    "emoji": "🏔️",
    "description": "On warm, dry Föhn days the mountains look close enough to touch. Climb high and look south.",
    "category": "Photography",
    "duration": "About 1 hour",
    "durationMinutes": 60,
    "cost": 0,
    "moodTags": ["take-photos", "explore", "nature"],
    "bestTime": "Clear Föhn days, often in autumn",
    "season": ["spring", "summer", "autumn", "winter"],
    "placeIds": ["olympiaberg", "alter-peter", "froettmaninger-berg"],
    "images": []
  },
  {
    "id": "rubble-hills",
    "title": "Climb Munich's man-made hills",
    "emoji": "⛰️",
    "description": "Munich is flat, so it built its own hills: one from wartime rubble, one from an old rubbish dump, and one under a Greek temple. Climb them all.",
    "category": "Walking",
    "duration": "About 1 hour per hill",
    "durationMinutes": 60,
    "cost": 0,
    "moodTags": ["be-active", "explore", "learn"],
    "bestTime": "Any clear day",
    "season": ["spring", "summer", "autumn", "winter"],
    "placeIds": ["olympiaberg", "froettmaninger-berg", "monopteros"],
    "images": []
  },
  {
    "id": "sunken-village",
    "title": "Find the half-buried church",
    "emoji": "⛪",
    "description": "On the slope of Fröttmaninger Berg, the top of a church pokes out of the grass. It's an artwork, and the real church it copies is right nearby.",
    "category": "Culture",
    "duration": "About 1 hour",
    "durationMinutes": 60,
    "cost": 0,
    "moodTags": ["explore", "learn", "take-photos"],
    "bestTime": "Daytime",
    "season": ["spring", "summer", "autumn", "winter"],
    "placeIds": ["froettmaninger-berg"],
    "images": []
  },
  {
    "id": "palace-canal-stroll",
    "title": "Stroll the palace canal",
    "emoji": "🦢",
    "description": "Walk along the long canal towards Nymphenburg Palace with swans for company, then wander into the free palace park.",
    "category": "Walking",
    "duration": "About 1 hour",
    "durationMinutes": 60,
    "cost": 0,
    "moodTags": ["date", "relax", "take-photos"],
    "bestTime": "Late afternoon",
    "season": ["spring", "summer", "autumn", "winter"],
    "placeIds": ["nymphenburg-canal"],
    "images": []
  },
  {
    "id": "westpark-asian-gardens",
    "title": "Find the Asian gardens in Westpark",
    "emoji": "🪷",
    "description": "Hunt for the Japanese garden, the golden Thai pavilion and the Nepalese pagoda, all hidden in one Munich park.",
    "category": "Culture",
    "duration": "About 1 hour",
    "durationMinutes": 60,
    "cost": 0,
    "moodTags": ["explore", "relax", "learn"],
    "bestTime": "Spring and summer afternoons",
    "season": ["spring", "summer", "autumn"],
    "placeIds": ["westpark"],
    "images": []
  },
  {
    "id": "deer-spotting",
    "title": "Spot deer in the forest",
    "emoji": "🦌",
    "description": "Walk to the fenced wildlife area in Forstenrieder Park and watch red and fallow deer from the viewing points. Feeding isn't allowed.",
    "category": "Family",
    "duration": "About 1 hour",
    "durationMinutes": 60,
    "cost": 0,
    "moodTags": ["nature", "relax", "explore"],
    "bestTime": "Early morning",
    "season": ["spring", "summer", "autumn", "winter"],
    "placeIds": ["forstenrieder-park"],
    "images": ["images/forstenrieder-park-2.jpg"]
  },
  {
    "id": "forest-ride",
    "title": "Cycle or run the forest trails",
    "emoji": "🚲",
    "description": "Over 43 km of flat forest paths, including an old Roman road. Pick a loop and go. Horse riders have their own paths.",
    "category": "Cycling",
    "duration": "About 2 hours",
    "durationMinutes": 120,
    "cost": 0,
    "moodTags": ["be-active", "nature"],
    "bestTime": "Mornings",
    "season": ["spring", "summer", "autumn"],
    "placeIds": ["forstenrieder-park"],
    "images": ["images/forstenrieder-park-1.jpg"]
  },
  {
    "id": "forest-and-fields-day",
    "title": "Forest walk and field sunset",
    "emoji": "🌾",
    "description": "Spend the afternoon in Forstenrieder Park, then walk 800 m north to the open fields for one of the best sunsets in the city.",
    "category": "Nature",
    "duration": "Half a day",
    "durationMinutes": 240,
    "cost": 0,
    "moodTags": ["nature", "be-active", "date"],
    "bestTime": "Afternoon until sunset",
    "season": ["spring", "summer", "autumn"],
    "placeIds": ["forstenrieder-park", "field-sunset"],
    "images": ["images/forstenrieder-park-3.jpg"]
  },
  {
    "id": "old-town-in-a-day",
    "title": "Old town in a day",
    "emoji": "🗺️",
    "description": "The full classic: Glockenspiel, churches, the tower climb, lunch at the market and King Ludwig's temples, at your own pace.",
    "category": "History",
    "duration": "A full day",
    "durationMinutes": 420,
    "cost": 10,
    "moodTags": ["explore", "learn", "be-active"],
    "bestTime": "Start around 10:30 to catch the 11:00 Glockenspiel",
    "season": ["spring", "summer", "autumn", "winter"],
    "placeIds": ["glockenspiel", "frauenkirche", "alter-peter", "asamkirche", "viktualienmarkt", "koenigsplatz"],
    "images": []
  }
];
