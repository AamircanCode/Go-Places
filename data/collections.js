/*
 * GO PLACES — curated collections (Munich)
 * ========================================
 * Collections are lists of places, like playlists for the city. People make
 * their own in the app; these are the starter ones from Go Places. Every
 * theme in data/spots.js (Sunset spots, Architecture in Munich, Free
 * Knowledge, …) also shows up as a Go Places collection automatically, so
 * don't repeat a theme here.
 *
 *   id           short unique name, lowercase, letters, numbers and -
 *   title        what people see
 *   emoji        shown when there is no cover image
 *   description  one or two sentences
 *   coverImage   optional, a photo from images/
 *   placeIds     spot ids from data/spots.js and data/free-knowledge.js, in order
 *
 * Each city has its own copy of this file (e.g. data/berlin/), listed in that
 * city's `files` in data/cities.js. Plain JSON.
 */
window.GO_PLACES_LAYER = window.GO_PLACES_LAYER || {};
window.GO_PLACES_LAYER.collections = [
  {
    "id": "hidden-gems-isar",
    "title": "Hidden Gems Near The Isar",
    "emoji": "🏞️",
    "description": "Ducks, a raftsman statue, a rose garden and quiet bookshelves, all a short walk from the river.",
    "coverImage": "images/hinterbruehl-1.jpg",
    "placeIds": ["hinterbruehl", "raftsman-statue", "rosengarten-untergiesing", "bookshelf-mangfallplatz", "hp8-library", "bookshelf-dreimuehlenviertel", "bookshelf-glockenbach", "maximiliansforum", "monacensia"]
  },
  {
    "id": "rainy-day",
    "title": "Rainy Day Munich",
    "emoji": "☔",
    "description": "Free places with a roof: fossils, plaster gods, old churches, classic cars and a library open until 23:00.",
    "coverImage": "",
    "placeIds": ["palaeontological-museum", "geological-museum", "abgussmuseum", "ns-dokuzentrum", "asamkirche", "frauenkirche", "motorworld", "hp8-library", "monacensia", "kunstarkaden", "eso-supernova"]
  },
  {
    "id": "outdoor-reading",
    "title": "Outdoor Reading Spots",
    "emoji": "📖",
    "description": "Pick up a book from an open bookshelf and find a bench, a lawn or a reading garden nearby.",
    "coverImage": "images/bookshelf-laimer-anger-1.jpg",
    "placeIds": ["monacensia", "bookshelf-laimer-anger", "bookshelf-glockenbach", "bookshelf-dreimuehlenviertel", "rosengarten-untergiesing", "bookshelf-herzog-ernst-platz", "westpark", "hinterbruehl"]
  },
  {
    "id": "first-date",
    "title": "Best First Date Locations",
    "emoji": "💞",
    "description": "Free, easy to talk in and good to look at: sunsets, temples, roses and a hall full of statues.",
    "coverImage": "images/nymphenburg-monopteros-1.jpg",
    "placeIds": ["monopteros", "hackerbruecke", "nymphenburg-monopteros", "rosengarten-untergiesing", "abgussmuseum", "asamkirche", "raftsman-statue", "olympiaberg"]
  },
  {
    "id": "birdwatching",
    "title": "Birdwatching In Munich",
    "emoji": "🐦",
    "description": "Mandarin ducks, swans, herons and woodpeckers, from the city canals to the forest edge.",
    "coverImage": "images/hinterbruehl-ducks.jpg",
    "placeIds": ["hinterbruehl", "westpark", "nymphenburg-canal", "nymphenburg-monopteros", "schleissheim", "botanischer-garten", "forstenrieder-park"]
  },
  {
    "id": "photography",
    "title": "Photography Munich",
    "emoji": "📸",
    "description": "The places with the best light, views and frames, from church towers to golden fields.",
    "coverImage": "images/olympiaberg-1.jpg",
    "placeIds": ["alter-peter", "olympiaberg", "field-sunset", "hackerbruecke", "nymphenburg-monopteros", "schleissheim", "froettmaninger-berg", "nymphenburg-canal", "monopteros"]
  }
];
