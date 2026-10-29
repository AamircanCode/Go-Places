/*
 * GO PLACES — content file
 * =========================
 * This is the only file you need to edit to add or change places.
 *
 * To ADD A SPOT: copy one of the blocks inside `spots: [ ... ]`, paste it
 * at the end of the list, and change the values. Keep the commas between blocks.
 *
 *   id        short unique name, lowercase, no spaces (used in links)
 *   name      what people see
 *   emoji     the icon on the map
 *   lat, lng  coordinates. In Google Maps: right-click the place, click the numbers to copy them.
 *   themes    which playlists it belongs to (use the ids from `themes` below)
 *   cost      e.g. "Free" or "€5 for the tower"
 *   when      best time to go
 *   summary   one or two sentences shown at the top
 *   history   a short paragraph of background
 *   funFacts  a list of short facts
 *   tip       optional insider tip
 *   photos    optional list of { url, credit }. Put your own pictures in the
 *             /images folder and use e.g. "images/hackerbruecke-1.jpg".
 *
 * To ADD A THEME/PLAYLIST: add a block to `themes`, then put its id in the
 * `themes` list of every spot that should show up in it.
 *
 * Facts marked "VERIFY" are worth double-checking before launch.
 */
window.GO_PLACES = {
  city: "Munich",
  center: [48.1374, 11.5755],
  zoom: 13,

  themes: [
    { id: "free-classics", name: "Free Munich classics", emoji: "⭐", description: "The iconic spots every visitor should see, all free." },
    { id: "sunsets", name: "Sunset spots", emoji: "🌅", description: "Where locals go to watch the sky turn orange." },
    { id: "churches", name: "Oldest churches", emoji: "⛪", description: "Centuries of history, mostly free to walk into." },
    { id: "architecture", name: "Architecture in Munich", emoji: "🏛️", description: "From Gothic towers to 'Athens on the Isar'." },
    { id: "bavarian", name: "The Bavarian experience", emoji: "🥨", description: "Beer gardens, markets and local traditions." },
    { id: "side-quests", name: "Side quests", emoji: "🦆", description: "Lesser-known and random things worth finding." }
  ],

  spots: [
    {
      id: "glockenspiel",
      name: "Glockenspiel at Marienplatz",
      emoji: "🔔",
      lat: 48.13736, lng: 11.57589,
      themes: ["free-classics", "architecture"],
      cost: "Free",
      when: "Daily at 11:00 and 12:00 (also 17:00 from March to October)",
      summary: "A life-size mechanical show in the tower of the New Town Hall. Dancers spin, knights joust, and the whole square looks up.",
      history: "Marienplatz has been Munich's central square since the city was founded in 1158. The neo-Gothic New Town Hall (Neues Rathaus) was built between 1867 and 1908, and the Glockenspiel was added in 1908. Its show retells two stories: the 1568 wedding of Duke Wilhelm V and Renata of Lorraine, complete with a joust, and the coopers' dance (Schäfflertanz), which according to legend was first danced to lift the city's spirits after a plague.",
      funFacts: [
        "It has 43 bells and 32 life-size figures.",
        "In the joust, the Bavarian knight wins every single time.",
        "At the very end a small golden rooster chirps three times.",
        "The column in the middle of the square, the Mariensäule, dates from 1638."
      ],
      tip: "Arrive 10 minutes early and stand near the Fischbrunnen fountain for a clear view of the tower.",
      photos: []
    },
    {
      id: "hackerbruecke",
      name: "Sunset at Hackerbrücke",
      emoji: "🌇",
      lat: 48.14208, lng: 11.54899,
      themes: ["sunsets", "free-classics", "architecture"],
      cost: "Free",
      when: "Every evening, about 30 minutes before sunset",
      summary: "An old steel bridge over the train tracks where young Munich sits on the arches to watch the sun go down behind the railway.",
      history: "Hackerbrücke was built between 1890 and 1894 to carry traffic over the railway lines leading into Munich Central Station. It is one of the few iron arch bridges of its kind that survived, and it is now a protected monument. It is named after the Hacker family of brewers, of Hacker-Pschorr beer.",
      funFacts: [
        "Below the bridge run the tracks into one of Germany's busiest train stations.",
        "During Oktoberfest, thousands cross it every day on their way to the Theresienwiese.",
        "Looking east you can see the towers of the Frauenkirche over the rooftops."
      ],
      tip: "Bring a drink and a jacket. The flat tops of the arches are where people sit.",
      photos: []
    },
    {
      id: "hinterbruehl",
      name: "Ducks at Hinterbrühl",
      emoji: "🦆",
      lat: 48.08321, lng: 11.54089, // from the photos' GPS data, at the statue
      themes: ["side-quests", "sunsets"],
      cost: "Free",
      when: "Late afternoon to sunset",
      summary: "A quiet stretch of water near the Isar with ducks and swans, an old arched bridge and a bronze raftsman looking out over it. Great for picnics, walks and sunsets.",
      history: "Hinterbrühl lies in Thalkirchen, in the south of Munich, on the green belt along the Isar. For centuries, rafts carried timber, goods and people down the Isar to Munich, and Thalkirchen is still where the summer party rafts from Wolfratshausen land. The bronze figure with an axe on his shoulder looks like one of those raftsmen (Flößer).", // VERIFY: the statue's official name and sculptor
      funFacts: [
        "The statue stands with his back to you, looking down the water towards the bridge, so the best photo is from behind him.",
        "Isar raftsmen carried axes to cut and fix the logs their rafts were built from.",
        "Ducks, coots and swans live here all year round."
      ],
      tip: "Come about an hour before sunset when the water is still and the bridge reflects perfectly. Please don't feed the ducks bread.",
      photos: [
        { url: "images/hinterbruehl-1.jpg", credit: "Photo: Go Places community" },
        { url: "images/hinterbruehl-2.jpg", credit: "Photo: Go Places community" }
      ]
    },
    {
      id: "frauenkirche",
      name: "Frauenkirche",
      emoji: "⛪",
      lat: 48.13864, lng: 11.57355,
      themes: ["churches", "architecture", "free-classics"],
      cost: "Free to enter",
      when: "Daytime, outside of services",
      summary: "Munich's cathedral and its most famous skyline, with twin towers topped by onion-shaped domes.",
      history: "The brick Gothic church was built in only about 20 years, from 1468 to 1488. The domes on the towers were added in 1525 and became the symbol of the city.",
      funFacts: [
        "Inside the entrance there is a dark footprint in the floor known as the 'Devil's Footstep'.",
        "Its towers are about 99 m tall, and in 2004 Munich voted that no new building in the city should be taller.",
        "From one spot near the footprint, the legend says you cannot see a single window."
      ],
      tip: "Find the Devil's Footstep first, then look up.",
      photos: []
    },
    {
      id: "alter-peter",
      name: "St. Peter's Church (Alter Peter)",
      emoji: "🗼",
      lat: 48.13650, lng: 11.57600,
      themes: ["churches", "free-classics"],
      cost: "Church free, tower about €5",
      when: "Daytime; clear days for the tower",
      summary: "The oldest parish church in Munich, with a tower that gives one of the best views of Marienplatz.",
      history: "A church stood here before Munich was officially founded in 1158, which is why locals call it 'Old Peter'. It was rebuilt several times and heavily damaged in World War II, then restored.",
      funFacts: [
        "The climb to the viewing platform is about 300 steps, with no lift.",
        "On a clear day with Föhn wind you can see the Alps from the top.",
        "The church holds the decorated skeleton of St. Munditia."
      ],
      tip: "Go up just before the Glockenspiel starts for a bird's-eye view of the show.",
      photos: []
    },
    {
      id: "asamkirche",
      name: "Asamkirche",
      emoji: "✨",
      lat: 48.13500, lng: 11.56970,
      themes: ["churches", "architecture", "side-quests"],
      cost: "Free",
      when: "Daytime",
      summary: "A tiny church squeezed between houses on Sendlinger Strasse, with one of the most over-the-top Baroque interiors in Europe.",
      history: "The brothers Egid Quirin and Cosmas Damian Asam built it in the 1730s and 1740s as their private church, right next to Egid's house. The public was eventually allowed in.",
      funFacts: [
        "It is only about 8 metres wide.",
        "Egid Asam could see the altar from a window in his own house.",
        "Many people walk right past it without noticing it's a church."
      ],
      photos: []
    },
    {
      id: "eisbach",
      name: "Eisbach surfers",
      emoji: "🏄",
      lat: 48.14350, lng: 11.58780,
      themes: ["side-quests", "free-classics"],
      cost: "Free to watch",
      when: "Any time of day, all year",
      summary: "Surfers riding a standing river wave in the middle of the city, next to the English Garden.",
      history: "The Eisbach is a man-made stream. Surfers began riding its wave in the 1970s, and it became one of the most famous river-surfing spots in the world. VERIFY: check that the wave is currently running before you send people here.",
      funFacts: [
        "The surfers ride in winter too, in thick wetsuits.",
        "Only experienced surfers should try it: the water is shallow and fast.",
        "The wave is right by the Haus der Kunst on Prinzregentenstrasse."
      ],
      photos: []
    },
    {
      id: "chinesischer-turm",
      name: "Chinese Tower beer garden",
      emoji: "🍺",
      lat: 48.15270, lng: 11.59210,
      themes: ["bavarian"],
      cost: "Free to sit; bring your own food",
      when: "Spring to autumn, afternoons",
      summary: "A wooden pagoda in the English Garden surrounded by one of Munich's biggest beer gardens.",
      history: "The tower was built around 1790, modelled on a pagoda in London's Kew Gardens. It burned down in World War II and was rebuilt in 1952.",
      funFacts: [
        "In traditional Bavarian beer gardens you may bring your own food, as long as you buy drinks there.",
        "A brass band often plays from the tower's first floor.",
        "The English Garden is larger than New York's Central Park."
      ],
      tip: "Pack a Brotzeit (bread, cheese, radish) and just buy a drink.",
      photos: []
    },
    {
      id: "monopteros",
      name: "Monopteros",
      emoji: "🏛️",
      lat: 48.14970, lng: 11.58930,
      themes: ["sunsets", "architecture"],
      cost: "Free",
      when: "Sunset",
      summary: "A small Greek-style temple on a hill in the English Garden, with a view over the Munich skyline.",
      history: "Leo von Klenze designed it in 1836 for King Ludwig I. The hill under it is artificial.",
      funFacts: [
        "From the top you can see the towers of the Frauenkirche and the Theatinerkirche.",
        "On summer evenings the hill fills up with people, music and picnics."
      ],
      photos: []
    },
    {
      id: "koenigsplatz",
      name: "Königsplatz",
      emoji: "🏺",
      lat: 48.14580, lng: 11.56550,
      themes: ["architecture"],
      cost: "Free",
      when: "Any time; summer evenings often have open-air events",
      summary: "A huge square framed by Greek-style buildings, the heart of King Ludwig I's 'Athens on the Isar'.",
      history: "Ludwig I wanted Munich to be a city of art and learning. In the 19th century Leo von Klenze and others built the Glyptothek, the Propylaea gate and the State Collection of Antiquities around this square. In the 1930s the Nazis paved it over for rallies; the grass was restored in the 1980s.",
      funFacts: [
        "The Glyptothek was Munich's first public museum.",
        "The Propylaea gate celebrates Ludwig's son Otto becoming King of Greece."
      ],
      photos: []
    },
    {
      id: "viktualienmarkt",
      name: "Viktualienmarkt",
      emoji: "🥨",
      lat: 48.13510, lng: 11.57620,
      themes: ["bavarian", "free-classics"],
      cost: "Free to browse",
      when: "Monday to Saturday, daytime",
      summary: "Munich's open-air food market, with a maypole, stalls, and a beer garden in the middle.",
      history: "The market moved here from Marienplatz in 1807 because it had outgrown the square.",
      funFacts: [
        "The beer garden rotates between Munich's big breweries.",
        "The maypole shows the trades and crafts of the city.",
        "Fountains around the market honour Munich's folk singers and comedians, like Karl Valentin."
      ],
      photos: []
    },
    {
      id: "olympiaberg",
      name: "Olympiaberg",
      emoji: "⛰️",
      lat: 48.16950, lng: 11.55200,
      themes: ["sunsets", "side-quests"],
      cost: "Free",
      when: "Sunset, or clear days for the Alps",
      summary: "A hill in Olympic Park with a 360° view of the city, the Olympic stadium roof and, on good days, the Alps.",
      history: "The hill was piled up from the rubble of buildings destroyed in World War II, then landscaped for the 1972 Olympic Games.",
      funFacts: [
        "You are standing on the remains of the old city.",
        "The tent-like roof of the stadium was revolutionary in 1972."
      ],
      photos: []
    },
    {
      id: "field-sunset",
      name: "Sunset over the open fields",
      emoji: "🌾",
      lat: 48.07546, lng: 11.50611, // from the photo's GPS data (accurate to about 11 m)
      themes: ["sunsets", "side-quests"],
      cost: "Free",
      when: "Sunset; early summer when the wheat is green and gold",
      summary: "One of the coolest sunset spots in the city: an open field on the south-western edge of Munich where the sun drops behind the treeline.",
      history: "A local tip rather than a landmark. Fields like this one are what is left of the farmland that surrounded Munich before the city grew outwards.",
      funFacts: [
        "The photo was taken here on 1 June at 20:40, looking north-west into the sunset.",
        "No skyline, no crowds: just sky, wheat and birds."
      ],
      tip: "Stay on the paths along the edge of the field so you don't trample the crops.",
      photos: [
        { url: "images/sunset-field-1.jpg", credit: "Photo: Go Places community" }
      ]
    }
  ]
};
