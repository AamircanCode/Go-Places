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
 *   around    optional list of things to do around the spot ("Around here")
 *   nearby    optional list of spot ids to link under "Nearby spots". The
 *             closest spots within 1.5 km are added automatically, so only
 *             list ones worth pointing out first (or further away).
 *   photos    optional list of { url, credit }. Put your own pictures in the
 *             /images folder and use e.g. "images/hackerbruecke-1.jpg".
 *
 * To ADD A THEME/PLAYLIST: add a block to `themes`, then put its id in the
 * `themes` list of every spot that should show up in it. `short` is the
 * optional shorter name shown on the theme chip above the map.
 *
 * Facts marked "VERIFY" are worth double-checking before launch.
 */
window.GO_PLACES = {
  city: "Munich",
  center: [48.1374, 11.5755],
  zoom: 13,

  themes: [
    { id: "free-classics", short: "Classics", name: "Free Munich classics", emoji: "⭐", description: "The iconic spots every visitor should see, all free." },
    { id: "sunsets", short: "Sunsets", name: "Sunset spots", emoji: "🌅", description: "Where locals go to watch the sky turn orange." },
    { id: "churches", short: "Churches", name: "Oldest churches", emoji: "⛪", description: "Centuries of history, mostly free to walk into." },
    { id: "architecture", short: "Architecture", name: "Architecture in Munich", emoji: "🏛️", description: "From Gothic towers to 'Athens on the Isar'." },
    { id: "bavarian", short: "Bavarian", name: "The Bavarian experience", emoji: "🥨", description: "Beer gardens, markets and local traditions." },
    { id: "side-quests", short: "Side quests", name: "Side quests", emoji: "🦆", description: "Lesser-known and random things worth finding." },
    { id: "outdoors", short: "Outdoors", name: "Green & active", emoji: "🌲", description: "Forests, fields and paths for running, cycling and riding." }
  ],

  spots: [
    {
      id: "glockenspiel",
      name: "Marienplatz: New Town Hall, Glockenspiel and Mariensäule",
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
        "The column in the middle of the square, the Mariensäule, dates from 1638. It was put up to give thanks that Munich survived the Swedish occupation in the Thirty Years' War.",
        "At the foot of the Mariensäule, four armoured cherubs fight a lion, a dragon, a snake and a basilisk: war, hunger, heresy and plague.",
        "The Fischbrunnen fountain was where butchers' apprentices were once thrown into the water at the end of their training. On Ash Wednesday, the mayor still washes the city's empty purse in it for luck.",
        "Munich measures distances from the Mariensäule: it's the city's kilometre zero." // VERIFY
      ],
      tip: "Arrive 10 minutes early and stand near the Fischbrunnen fountain for a clear view of the tower.",
      around: [
        "Walk through the courtyard of the New Town Hall and take the lift up the tower for the view.",
        "Find Juliet behind the Old Town Hall, then wander through the Viktualienmarkt.",
        "Climb St. Peter's tower for a view down onto the Glockenspiel."
      ],
      nearby: ["altes-rathaus", "alter-peter", "frauenkirche", "viktualienmarkt"],
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
      lat: 48.08757, lng: 11.54471, // from the photo's GPS data, at the duck-spotting spot
      themes: ["side-quests", "sunsets"],
      cost: "Free",
      when: "Late afternoon to sunset, all year",
      summary: "A calm canal by the Isar where swans, mallards and even colourful mandarin ducks paddle right up to the path. Great for picnics, walks and sunsets.",
      history: "Hinterbrühl lies in Thalkirchen, in the south of Munich, on the green belt along the Isar. Few tourists know it, which is exactly why locals like it: it feels like a village pond twenty minutes from the city centre.",
      funFacts: [
        "Look out for mandarin ducks: the males have orange 'sails' on their backs and look almost painted.",
        "Mute swans, mallards and coots live here all year round.",
        "A few hundred metres south, a bronze raftsman statue looks out over the water. Make it your next stop."
      ],
      tip: "Sit on the rocks by the water and wait: the birds come to you. Please don't feed them bread.",
      photos: [
        { url: "images/hinterbruehl-ducks.jpg", credit: "Photo: Go Places community" }
      ]
    },
    {
      id: "raftsman-statue",
      name: "Isarflößer statue at Hinterbrühl",
      emoji: "🪓",
      lat: 48.08321, lng: 11.54089, // from the photos' GPS data, at the statue
      themes: ["side-quests", "sunsets", "architecture"],
      cost: "Free",
      when: "About an hour before sunset",
      summary: "A bronze raftsman with an axe on his shoulder, looking down the water towards an old arched bridge.",
      history: "The statue is called 'Der Isarflößer' (the Isar raftsman). For centuries, rafts carried timber, goods and people down the Isar to Munich. The canal here, the Floßkanal, was built at the end of the 19th century so rafts could reach the Zentrallände landing in Thalkirchen, which is still where the summer party rafts from Wolfratshausen arrive.", // VERIFY: sculptor
      funFacts: [
        "He stands with his back to you, so the best photo is from behind him, with the bridge in the frame.",
        "Isar raftsmen carried axes to cut and fix the logs their rafts were built from."
      ],
      tip: "Come when the water is still and the bridge reflects perfectly. The ducks are a short walk north.",
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
      themes: ["churches", "free-classics", "architecture"],
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
      themes: ["bavarian", "architecture"],
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
        "On summer evenings the hill fills up with people, music and picnics.",
        "On weekend afternoons, groups of drummers often play on the meadow below the temple."
      ],
      photos: []
    },
    {
      id: "koenigsplatz",
      name: "Königsplatz",
      emoji: "🏺",
      lat: 48.14580, lng: 11.56550, // centre of the square; the photos' GPS data puts all three buildings around this pin
      themes: ["architecture"],
      cost: "Free",
      when: "Any time; summer evenings often have open-air events",
      summary: "A huge square framed by Greek-style buildings, the heart of King Ludwig I's 'Athens on the Isar': the Propylaea gate to the west, the Glyptothek to the north and the State Collection of Antiquities to the south.",
      history: "Ludwig I wanted Munich to be a city of art and learning. In the 19th century Leo von Klenze and others built the Glyptothek, the Propylaea gate and the State Collection of Antiquities around this square. In the 1930s the Nazis paved it over for rallies, and on 10 May 1933 students burned books here. The grass was restored in the 1980s, and since 2021 a memorial in the paving in front of the Antikensammlungen recalls the book burning.",
      funFacts: [
        "The Glyptothek was Munich's first public museum.",
        "The Propylaea gate celebrates Ludwig's son Otto becoming King of Greece.",
        "The three buildings show three Greek column styles: Doric on the Propylaea, Ionic on the Glyptothek and Corinthian on the Antikensammlungen.",
        "Walk right through the Propylaea: the cobbles at its feet are laid in a fan-shaped pattern."
      ],
      tip: "Stand on the round memorial in front of the Antikensammlungen and read the spiral of book titles from the outside in.",
      around: [
        "Read the book-burning memorial in front of the Antikensammlungen.",
        "Swap an art book at the public bookshelf beside the Lenbachhaus, two minutes west.",
        "Visit the free NS Documentation Centre on the east side of the square."
      ],
      nearby: ["book-burning-memorial", "bookshelf-lenbachhaus", "lenbachhaus-garden", "ns-dokuzentrum"],
      photos: [
        { url: "images/koenigsplatz-1.jpg", credit: "Photo: Go Places community" },
        { url: "images/koenigsplatz-2.jpg", credit: "Photo: Go Places community" },
        { url: "images/book-burning-memorial-1.jpg", credit: "Photo: Go Places community" },
        { url: "images/koenigsplatz-3.jpg", credit: "Photo: Go Places community" }
      ]
    },
    {
      id: "book-burning-memorial",
      name: "Book-burning memorial 'The Blacklist' at Königsplatz",
      emoji: "📜",
      lat: 48.14533, lng: 11.56505, // from the photo's GPS data, in front of the Antikensammlungen steps
      themes: ["side-quests"],
      cost: "Free",
      when: "Any time, in daylight to read the letters",
      summary: "A round disc set into the ground in front of the State Collection of Antiquities, engraved with a spiral of book titles by authors the Nazis banned. It marks the spot where books were burned on 10 May 1933.",
      history: "On 10 May 1933 Nazi students burned books on Königsplatz, as in many German university towns that night. In 2016 the city council decided to remember it, and the Berlin artist Arnold Dreyblatt won the competition. His work 'The Blacklist / Die Schwarze Liste' was installed in 2021: an 8-metre circle of dyed concrete, flush with the ground, with about 9,600 letters set into it in a spiral.",
      funFacts: [
        "The spiral lists the last book up to 1933 by each of 310 banned and persecuted authors.",
        "The titles run together without punctuation, so words collide and form new phrases as you read.",
        "The spiral is meant to recall the smoke and curling pages seen in photographs of the book burnings.",
        "The name refers to the 'blacklists' of unwanted literature drawn up in spring 1933."
      ],
      tip: "A plaque nearby points to the NS Documentation Centre's website, which lists every title and author on the disc.",
      around: [
        "Walk round the square to the Glyptothek and through the Propylaea gate.",
        "The free NS Documentation Centre is a few minutes east.",
        "Swap a book at the public art bookshelf beside the Lenbachhaus."
      ],
      nearby: ["koenigsplatz", "ns-dokuzentrum", "bookshelf-lenbachhaus"],
      photos: [
        { url: "images/book-burning-memorial-1.jpg", credit: "Photo: Go Places community" }
      ]
    },
    {
      id: "lenbachhaus-garden",
      name: "Lenbachhaus garden",
      emoji: "⛲",
      lat: 48.14678, lng: 11.56401, // from the photos' GPS data, middle of the garden
      themes: ["side-quests", "architecture"],
      cost: "Free (you walk through the museum to get there; the exhibitions are paid)",
      when: "Museum opening hours, Tuesday to Sunday (closed Mondays)", // VERIFY: opening hours
      summary: "The Italian-style garden of painter Franz von Lenbach's golden villa: fountains, statues, clipped hedges, benches and a shady pergola looking over the Königsplatz area. The museum charges for its exhibitions, but the garden is free; you reach it through the museum.",
      history: "Franz von Lenbach, the celebrated 'painter prince' of 19th-century Munich, had this villa built in 1887–1891 by Gabriel von Seidl, in the style of a Tuscan country house, with a formal garden in front. His widow sold it to the city in 1924, and it opened as the Städtische Galerie im Lenbachhaus in 1929. Today it is famous for the Blue Rider painters (Kandinsky, Marc, Münter), and a Foster + Partners extension opened in 2013.",
      funFacts: [
        "The garden is laid out like an Italian villa garden, with balustrades, gravel paths and hedges cut into squares.",
        "One fountain is guarded by stone horse-like sea creatures; another has a dancing bronze figure in a round pool ringed with stone benches.",
        "From the pergola at the top of the steps you look out over the treetops towards Luisenstraße and the Königsplatz area.",
        "Gabriele Münter gave the city her huge Blue Rider collection in 1957, which made the Lenbachhaus world-famous."
      ],
      tip: "Tell the front desk you're only going to the garden. Come in late afternoon, when the villa's windows glow and the benches are quiet.",
      around: [
        "Take a free art book from the red public bookshelf on the forecourt.",
        "Sit in the lit wooden lounge in front of the museum.",
        "Walk on to Königsplatz and the book-burning memorial, two minutes away."
      ],
      nearby: ["bookshelf-lenbachhaus", "lenbachhaus-lounge", "koenigsplatz", "book-burning-memorial"],
      photos: [
        { url: "images/lenbachhaus-garden-1.jpg", credit: "Photo: Go Places community" },
        { url: "images/lenbachhaus-garden-2.jpg", credit: "Photo: Go Places community" },
        { url: "images/lenbachhaus-garden-3.jpg", credit: "Photo: Go Places community" },
        { url: "images/lenbachhaus-garden-4.jpg", credit: "Photo: Go Places community" },
        { url: "images/lenbachhaus-garden-5.jpg", credit: "Photo: Go Places community" },
        { url: "images/lenbachhaus-garden-6.jpg", credit: "Photo: Go Places community" },
        { url: "images/lenbachhaus-garden-7.jpg", credit: "Photo: Go Places community" },
        { url: "images/lenbachhaus-garden-8.jpg", credit: "Photo: Go Places community" }
      ]
    },
    {
      id: "lenbachhaus-lounge",
      name: "Lit wooden lounge outside the Lenbachhaus",
      emoji: "🪵",
      lat: 48.14647, lng: 11.56367, // from the photo's GPS data, a few steps west of where it was taken
      themes: ["side-quests"],
      cost: "Free",
      when: "Any time; nicest at dusk when the lights come on",
      summary: "A wooden seating platform under a glass roof with planters and warm lights, on the lawn in front of the Lenbachhaus. A calm place to sit, with a view of the museum and the grand buildings around Königsplatz.",
      history: "The forecourt of the Lenbachhaus faces Luisenstraße, between the museum and the Kunstareal around Königsplatz. The lounge sits beside the museum's red public art bookshelf, so it's a natural place to start a book you've just picked up.",
      funFacts: [
        "Glowing light posts line the path from the bookshelf to the lounge, so it is lit after dark.",
        "The public art bookshelf is a few steps away and open around the clock."
      ],
      tip: "Grab an art book from the red bookshelf and read it here as the lights come on.",
      around: [
        "Take or leave an art book at the public bookshelf next door.",
        "Go through the museum to the free Lenbachhaus garden.",
        "Walk two minutes to Königsplatz."
      ],
      nearby: ["bookshelf-lenbachhaus", "lenbachhaus-garden", "koenigsplatz"],
      photos: [
        { url: "images/lenbachhaus-lounge-1.jpg", credit: "Photo: Go Places community" }
      ]
    },
    {
      id: "karl-stuetzel-platz-ring",
      name: "Kunstplattform: the giant red ring at Karl-Stützel-Platz",
      emoji: "⭕",
      lat: 48.14235, lng: 11.56178, // from the photos' GPS data (about ±15 m), at the ring
      themes: ["side-quests", "architecture"],
      cost: "Free",
      when: "Any time; skaters come in the afternoons and evenings",
      summary: "A huge rust-red steel ring standing on its edge on a paved platform at the west end of the Old Botanical Garden, with skate ledges all around it. A striking photo spot and a free skate area in the middle of the city.",
      history: "The ring is by the Italian sculptor Mauro Staccioli (1937–2018), who made giant, simple geometric shapes for public spaces all over Europe. It has stood on Karl-Stützel-Platz since 1996, between the Old Botanical Garden and the busy streets north of the main station.",
      funFacts: [
        "Staccioli's rings and arcs are meant to frame the place they stand in: look through it and the trees and buildings become a picture.",
        "The concrete ledges and the smooth stone platform under the ring make it a favourite spot for skaters.",
        "A free basketball court and a treehouse-style kiosk with a raised walkway are just behind it."
      ],
      tip: "Line up the ring with the trees behind it for the best photo, and stand back from the skate ledges.",
      around: [
        "Shoot some hoops on the free basketball court just behind the ring.",
        "Walk through the Old Botanical Garden to the Neptune Fountain.",
        "The Lenbachhaus and Königsplatz are about ten minutes north."
      ],
      nearby: ["karl-stuetzel-platz-basketball", "bookshelf-lenbachhaus", "koenigsplatz"],
      photos: [
        { url: "images/karl-stuetzel-platz-ring-1.jpg", credit: "Photo: Go Places community" },
        { url: "images/karl-stuetzel-platz-ring-2.jpg", credit: "Photo: Go Places community" },
        { url: "images/karl-stuetzel-platz-ring-3.jpg", credit: "Photo: Go Places community" }
      ]
    },
    {
      id: "karl-stuetzel-platz-basketball",
      name: "Basketball court at Karl-Stützel-Platz",
      emoji: "🏀",
      lat: 48.14235, lng: 11.56210, // from the photos' GPS data, on the court just east of the ring
      themes: ["outdoors", "side-quests"],
      cost: "Free",
      when: "Daylight, spring to autumn",
      summary: "A free outdoor basketball court under big trees right behind the giant red ring, with benches and a treehouse-style kiosk next to it.",
      history: "Karl-Stützel-Platz sits at the west end of the Old Botanical Garden, a few minutes from the main station. Next to Mauro Staccioli's red ring sculpture and its skate platform, the court makes the square one of the few places in the city centre to play for free.",
      funFacts: [
        "The court is right next to the skate platform, so it's a lively corner on warm evenings.",
        "There's no booking and no fee: bring a ball and play."
      ],
      tip: "Bring your own ball: the hoop is always there, the ball isn't.",
      around: [
        "Watch the skaters under the giant red ring next door.",
        "Cool down on a bench in the Old Botanical Garden.",
        "Walk ten minutes north to the Lenbachhaus and Königsplatz."
      ],
      nearby: ["karl-stuetzel-platz-ring", "olympiapark-sports"],
      photos: [
        { url: "images/karl-stuetzel-platz-basketball-1.jpg", credit: "Photo: Go Places community" },
        { url: "images/karl-stuetzel-platz-basketball-2.jpg", credit: "Photo: Go Places community" }
      ]
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
      lat: 48.16987, lng: 11.55152, // from the photos' GPS data, at the summit benches
      themes: ["sunsets", "side-quests"],
      cost: "Free",
      when: "Sunset, or clear days for the Alps",
      summary: "A hill in Olympic Park with a 360° view of the city, the Olympic stadium roof and, on good days, the Alps.",
      history: "The hill was piled up from the rubble of buildings destroyed in World War II, then landscaped for the 1972 Olympic Games.",
      funFacts: [
        "You are standing on the remains of the old city.",
        "The tent-like roof of the stadium was revolutionary in 1972."
      ],
      tip: "Take the cobbled path up: it winds round the hill, and the geese on the slopes don't mind company. The benches at the top face the city towers.",
      photos: [
        { url: "images/olympiaberg-4.jpg", credit: "Photo: Go Places community" },
        { url: "images/olympiaberg-3.jpg", credit: "Photo: Go Places community" },
        { url: "images/olympiaberg-1.jpg", credit: "Photo: Go Places community" },
        { url: "images/olympiaberg-2.jpg", credit: "Photo: Go Places community" }
      ]
    },
    {
      id: "olympiapark-sports",
      name: "Open-air gym, court and playground at Olympiapark",
      emoji: "🏀",
      lat: 48.17285, lng: 11.55488, // from the photos' GPS data, on the court
      themes: ["outdoors", "side-quests"],
      cost: "Free",
      when: "Daylight, all year; busiest on sunny weekend afternoons",
      summary: "A free public sports corner at the foot of the Olympic hills: a basketball court, a calisthenics gym with pull-up bars and ladders, and a playground under big old trees.",
      history: "The Olympic Park was built for the 1972 Summer Olympics and was meant from the start to stay a park for everyone afterwards. Today it is one of Munich's favourite places to run, play and train, and corners like this one are part of that idea.",
      funFacts: [
        "Munich has free outdoor gyms all over the city; this is one of the liveliest, with people training here even in autumn.",
        "There's no booking and no fee: bring a ball and join a pick-up game.",
        "Olympiaberg, the rubble hill with the city view, is a five-minute walk away."
      ],
      tip: "Do a workout here, then run up Olympiaberg as your cool-down.",
      photos: [
        { url: "images/olympiapark-sports-1.jpg", credit: "Photo: Go Places community" },
        { url: "images/olympiapark-sports-2.jpg", credit: "Photo: Go Places community" },
        { url: "images/olympiapark-sports-3.jpg", credit: "Photo: Go Places community" }
      ]
    },
    {
      id: "nymphenburg-monopteros",
      name: "Monopteros at Badenburger See (Nymphenburg)",
      emoji: "🏛️",
      lat: 48.15409, lng: 11.49241, // from the photos' GPS data: the lakeside viewpoint looking across to the temple
      themes: ["side-quests", "architecture", "sunsets"],
      cost: "Free",
      when: "All year; late afternoon and sunset are the most beautiful. The park closes at dusk (18:00 from November to March).",
      summary: "A round Greek-style temple on the shore of the big lake in Nymphenburg Palace Park, with geese on the lawns, swans on the water and old beech trees all around.",
      history: "The first round temple here was a wooden one, put up in 1805 for the Electress's birthday. It was replaced in 1818 and again in 1862–65 by today's sandstone Monopteros, built to a plan by Leo von Klenze. Its ten Corinthian columns surround a stele with a dedication from King Ludwig I. It is also called the Apollo Temple.",
      funFacts: [
        "Munich has two Monopteros temples: this one, and the better-known one on the hill in the English Garden. Both go back to Klenze.",
        "Locals rate the two big lakes in the palace park as some of the best bird-watching in the city: geese, swans and ducks, and herons in the reeds.",
        "The Badenburg, a little bathing palace from the 1720s with one of Europe's first heated indoor pools, stands on the other side of the lake.",
        "Entry to the park is free; only the palace and its pavilions cost money."
      ],
      tip: "Stand on the opposite shore for the classic reflection shot, and stay for the sunset over the lake. Watch the gate times: the side gates close half an hour before the main one.",
      photos: [
        { url: "images/nymphenburg-monopteros-1.jpg", credit: "Photo: Go Places community" },
        { url: "images/nymphenburg-monopteros-3.jpg", credit: "Photo: Go Places community" },
        { url: "images/nymphenburg-monopteros-2.jpg", credit: "Photo: Go Places community" }
      ]
    },
    {
      id: "wittelsbacherplatz",
      name: "Wittelsbacherplatz and the Maximilian statue",
      emoji: "🐎",
      lat: 48.14325, lng: 11.57605, // at the statue; the photo was taken a few metres south of it
      themes: ["architecture", "side-quests"],
      cost: "Free",
      when: "Any time; lovely at night when the statue and palaces are lit",
      summary: "A wide, quiet square just off Odeonsplatz, with a bronze horseman in the middle, elegant palaces around it and plenty of benches to sit on.",
      history: "The statue shows Maximilian I (1573–1651), Duke and later Prince-Elector of Bavaria, who led the Catholic side in the Thirty Years' War. King Ludwig I had it put up: the Danish sculptor Bertel Thorvaldsen made the model, and Munich's royal foundry under Johann Baptist Stiglmaier cast it. It was unveiled on 12 October 1839. The square itself was laid out under Ludwig I as part of the grand new Brienner Straße.",
      funFacts: [
        "The inscription on the front reads 'Maximilian Churfuerst von Bayern'; the back says it was built by Ludwig I, King of Bavaria, on 12 October 1839.",
        "The stone base alone is over 5 metres high; the horse and rider add about 5 more.",
        "Maximilian points his outstretched hand as if giving an order, which makes him easy to recognise from across the square."
      ],
      tip: "Bring a takeaway coffee from Odeonsplatz and sit on one of the benches. It's far calmer than the squares around it.",
      photos: [
        { url: "images/wittelsbacherplatz-1.jpg", credit: "Photo: Go Places community" }
      ]
    },
    {
      id: "botanischer-garten",
      name: "Botanical Garden (outdoor area free in winter)",
      emoji: "🌿",
      lat: 48.16350, lng: 11.50100, // approximate, at the main entrance on Menzinger Straße. VERIFY on the map
      themes: ["outdoors", "side-quests"],
      cost: "Outdoor garden free in winter (late October to late March); otherwise €5.50, free for under-18s. Greenhouses always cost extra.",
      when: "Winter for free entry (9:00–16:30, last entry 16:00); autumn for the golden ginkgos",
      summary: "Munich's Botanical Garden next to Nymphenburg Palace Park: rock gardens, alpine plants, ponds and quiet benches under huge trees. In the winter months the outdoor part costs nothing.",
      history: "The garden was laid out from 1909 to 1914 as the new home of the university's botanical collections, which had outgrown the old garden near the main station. Today it holds around 14,000 kinds of plants.", // VERIFY
      funFacts: [
        "Last season the outdoor area was free from 26 October to 28 March; a Munich local reports it is free again since 25 October.", // VERIFY current dates
        "It sits right next to Nymphenburg Palace Park, so you can combine both in one walk.",
        "In autumn the ginkgo trees turn bright yellow, with a bench underneath one by the rock garden."
      ],
      tip: "Address: Menzinger Straße 65. Tram 17 to Botanischer Garten.",
      photos: []
    },
    {
      id: "rosengarten-untergiesing",
      name: "Rose garden in Untergiesing",
      emoji: "🌹",
      lat: 48.11550, lng: 11.56900, // approximate, Sachsenstraße by the Isar. VERIFY on the map
      themes: ["outdoors", "side-quests"],
      cost: "Free",
      when: "June and July when thousands of roses bloom. Open daily: April to September until 21:00, October to March until 18:00 (weekends from 9:00).",
      summary: "The city's rose garden and tree nursery by the Isar in Untergiesing: rose beds, perennials and grasses, and benches where few tourists ever find you.",
      history: "The site was planned in 1901 as a city tree nursery (Baumschule Bischweiler) in the Isar green belt. Since 1955 the city has tested here which rose varieties cope with Munich's climate.",
      funFacts: [
        "The 'Staudental' mixes roses with perennials, grasses and summer flowers.",
        "It closes when there's snow or ice."
      ],
      tip: "Address: Sachsenstraße 2. Combine it with a walk along the Isar towards the Flaucher.",
      photos: []
    },
    {
      id: "walderlebniszentrum-gruenwald",
      name: "Walderlebniszentrum Grünwald (forest centre and wild boar)",
      emoji: "🐗",
      lat: 48.04500, lng: 11.54800, // approximate, Sauschütt in the Grünwalder Forst. VERIFY on the map
      themes: ["outdoors", "side-quests"],
      cost: "Free",
      when: "All year; the wild boar are fed every day at 16:00",
      summary: "A free forest centre in the woods south of Munich, with a wild boar enclosure, an interactive exhibition about the forest and easy trails for walking, strollers and wheelchairs.",
      history: "Run by the Bavarian forestry administration, the centre sits at the Sauschütt in the Grünwalder Forst. Its historic pavilion holds an exhibition on forest types and the creatures living above and below ground.",
      funFacts: [
        "The forest, the boar enclosure and the trails are open all the time; only the café keeps hours (weekends and holidays, 11:00–16:30).",
        "The longest trail is 2.8 km and step-free; a sensory trail of under 1 km starts right by the centre.",
        "Free guided events run on Sunday afternoons at 14:00: the first Sunday of the month from May to August, and every Sunday in September and October." // VERIFY
      ],
      tip: "Time your visit for the 16:00 boar feeding. Combine it with Grünwald castle and the Isar, a short walk away.",
      photos: []
    },
    {
      id: "motorworld",
      name: "Motorworld München",
      emoji: "🏎️",
      lat: 48.19200, lng: 11.60450, // approximate, Freimann. VERIFY on the map
      themes: ["side-quests", "architecture"],
      cost: "Free entry, every day of the year",
      when: "Mon–Sat 7:30–22:00, Sun and holidays 10:00–22:00",
      summary: "Rare and luxury cars from more than 30 brands on show in a huge listed railway hall in Freimann. Window-shopping for car lovers, at no cost.",
      history: "The centre of the site is a listed former Deutsche Bahn locomotive repair hall (the Ausbesserungswerk Freimann), restored and turned into a showroom, workshops, restaurants and event halls, including the Zenith concert hall.",
      funFacts: [
        "The site covers 75,000 m².",
        "There are racing simulators and Carrera tracks inside (these cost extra)."
      ],
      tip: "Address: Am Ausbesserungswerk 8. Take the U6 to Freimann rather than driving: parking costs after 30 minutes.",
      photos: []
    },
    {
      id: "schleissheim",
      name: "Schleißheim palaces and canal",
      emoji: "🏰",
      lat: 48.24930, lng: 11.57000, // approximate, in the garden behind the New Palace. VERIFY on the map
      themes: ["architecture", "side-quests", "outdoors"],
      cost: "Park free; the palaces cost extra",
      when: "Spring to autumn; a half-day trip just north of Munich (S1 to Oberschleißheim)",
      summary: "Three palaces linked by a huge Baroque garden and a long canal with ducks and swans, in Oberschleißheim. Grand like Nymphenburg, but usually much quieter.",
      history: "Duke Wilhelm V started with a country house here around 1600. Elector Max Emanuel added the little Lustheim Palace at the far end of the garden in the 1680s and then the vast New Palace from 1701, meant to rival Versailles. The canals and the formal garden between them are among the best-kept Baroque gardens in Germany.", // VERIFY
      funFacts: [
        "Lustheim sits on a round island at the end of the canal, about a kilometre from the New Palace.",
        "A Munich local recommends it as 'less crowded than Nymphenburg', and it is.",
        "The Oberschleißheim bookshelf is a short ride away, if you want something to read on the canal."
      ],
      tip: "Walk the whole canal to Lustheim and back: it's the best part.",
      photos: []
    },
    {
      id: "dachau-schloss",
      name: "Dachau Palace garden and view",
      emoji: "🔭",
      lat: 48.25800, lng: 11.43400, // approximate, at the palace above the old town. VERIFY on the map
      themes: ["sunsets", "side-quests", "architecture"],
      cost: "Garden free (VERIFY); palace hall costs extra",
      when: "Clear days for the Alps; a half-day trip by S2 to Dachau",
      summary: "A palace on the hill above Dachau's old town, with a court garden and one of the best views over Munich towards the Alps.",
      history: "A small summer palace was built here in 1578 and became a favourite country seat of the Munich court. Elector Max Emanuel had the hall wing redone in Baroque style in 1715. Under Napoleonic occupation three of its four wings were badly damaged and pulled down; only the south-west wing with its Renaissance wooden ceiling survives.",
      funFacts: [
        "From the terrace you look across the whole plain to Munich and, on Föhn days, the Alps.",
        "The palace hall is used for concerts today.",
        "The old town below has a pretty main street with cafés; the Concentration Camp Memorial Site is elsewhere in Dachau."
      ],
      tip: "Walk up through the old town from the S-Bahn and come back down along the river Amper.",
      photos: []
    },
    {
      id: "field-sunset",
      name: "Sunset over the open fields",
      emoji: "🌾",
      lat: 48.07546, lng: 11.50611, // from the photo's GPS data (accurate to about 11 m)
      themes: ["sunsets", "side-quests", "outdoors"],
      cost: "Free",
      when: "Sunset; early summer when the wheat is green and gold",
      summary: "One of the coolest sunset spots in the city: an open field between Forstenried and Forstenrieder Park, on the south-western edge of Munich, where the sun drops behind the treeline.",
      history: "A local tip rather than a landmark. Fields like this one are what is left of the farmland that surrounded Munich before the city grew outwards.",
      funFacts: [
        "The photo was taken here on 1 June at 20:40, looking north-west into the sunset.",
        "No skyline, no crowds: just sky, wheat and birds.",
        "Forstenrieder Park starts about 800 m to the south, so you can make it a forest walk followed by sunset."
      ],
      tip: "Stay on the paths along the edge of the field so you don't trample the crops.",
      photos: [
        { url: "images/sunset-field-1.jpg", credit: "Photo: Go Places community" }
      ]
    },
    {
      id: "forstenrieder-park",
      name: "Forstenrieder Park",
      emoji: "🌲",
      lat: 48.06810, lng: 11.50270, // from the photos' GPS data, at the northern entrance
      themes: ["outdoors", "side-quests"],
      cost: "Free",
      when: "All year; early mornings for wildlife and quiet paths",
      summary: "A huge forest on Munich's south-western edge, with over 43 km of paths for running, cycling and horse riding, and red deer, fallow deer and wild boar living inside.",
      history: "For centuries this was a royal hunting forest of the Wittelsbach rulers. A hunting lodge was built here in 1734, and King Ludwig III shot his last stag here on 7 October 1918, only weeks before the revolution ended the Bavarian monarchy. Today it is open to everyone, for free.",
      funFacts: [
        "A Roman road, the Via Julia between Augsburg and Salzburg, runs straight through the forest.",
        "Around 75 prehistoric burial mounds are hidden among the trees.",
        "The 'Ludwigseichen' are oaks planted in 1858 in the shape of an L and an M, for Kings Ludwig I and Max II.",
        "In the fenced Wildpark you can watch deer from observation points, and in winter there are feeding sessions.",
        "With enough snow, people go cross-country skiing here."
      ],
      tip: "Horse riders have their own marked paths, so runners and cyclists should stick to the main tracks. Feeding the animals is not allowed.",
      photos: [
        { url: "images/forstenrieder-park-1.jpg", credit: "Photo: Go Places community" },
        { url: "images/forstenrieder-park-2.jpg", credit: "Photo: Go Places community" },
        { url: "images/forstenrieder-park-3.jpg", credit: "Photo: Go Places community" },
        { url: "images/forstenrieder-park-4.jpg", credit: "Photo: Go Places community" }
      ]
    },
    {
      id: "westpark",
      name: "Westpark lake",
      emoji: "🪷",
      lat: 48.12150, lng: 11.51380, // approximate, by the lake in the western half. VERIFY on the map
      themes: ["side-quests", "outdoors"],
      cost: "Free",
      when: "Spring to autumn; summer evenings for the open-air stage",
      summary: "A relaxed park in the south-west with a lake full of ducks, a rose garden and little gardens from Japan, China, Thailand and Nepal.",
      history: "Westpark was laid out for the International Garden Exhibition (IGA) in 1983 on what used to be open land between Sendling and Laim. The Asian gardens and pavilions were built for the exhibition and stayed.", // VERIFY
      funFacts: [
        "In summer, films and concerts play on a stage by the lake, and the audience sits on the grass across the water.",
        "Look for the golden Thai pavilion (sala) and the Nepalese pagoda between the trees."
      ],
      tip: "Walk the path around the lake slowly: mallards and coots hang out by the reeds near the stage.",
      photos: []
    },
    {
      id: "froettmaninger-berg",
      name: "Fröttmaninger Berg",
      emoji: "🌬️",
      lat: 48.21150, lng: 11.61650, // approximate, at the top of the hill. VERIFY on the map
      themes: ["sunsets", "side-quests", "outdoors"],
      cost: "Free",
      when: "Sunset, or clear days for the Alps",
      summary: "A grassy hill in the north of Munich with a wind turbine on top, wide views over the city and the Allianz Arena glowing right next to it.",
      history: "The hill is an old rubbish dump that was sealed, covered with soil and turned into a park. On its slope sits a strange sight: the top of a church sticking out of the ground. It is an artwork called 'Versunkenes Dorf' (Sunken Village) by Timm Ulrichs, a copy of the little Heilig-Kreuz church of Fröttmaning nearby, a reminder of the village that disappeared under the city's growth.", // VERIFY
      funFacts: [
        "On match nights the Allianz Arena next door lights up red, blue or white.",
        "The real Heilig-Kreuz church at the foot of the hill is one of the oldest churches in Munich."
      ],
      tip: "The U6 to Fröttmaning stops right by the hill. Bring a jacket, it is windy at the top.",
      photos: []
    },
    {
      id: "nymphenburg-canal",
      name: "Nymphenburg Palace and canal",
      emoji: "🦢",
      lat: 48.15850, lng: 11.51100, // approximate, on the canal east of the palace. VERIFY on the map
      themes: ["side-quests", "architecture"],
      cost: "Free (the park is free, the palace costs extra)",
      when: "All year; late afternoon light on the palace is the best",
      summary: "A long, straight canal leading up to Nymphenburg Palace, with swans gliding past the baroque front and ducks along the banks.",
      history: "Nymphenburg Palace was the summer home of Bavaria's rulers. Work started in 1664, after Elector Ferdinand Maria and his wife Henriette Adelaide celebrated the birth of their heir, Max Emanuel. The canal was dug to link the palace to the city in grand style.", // VERIFY
      funFacts: [
        "Swans have lived on the palace waters for centuries.",
        "The palace front, with all its wings, stretches for more than 600 metres.", // VERIFY
        "King Ludwig II was born in the palace in 1845.",
        "The palace's Gallery of Beauties shows 36 portraits of women King Ludwig I admired.",
        "In very cold winters the canal freezes and people go ice skating and curling on it." // VERIFY: only when officially opened
      ],
      tip: "Walk along the canal towards the palace so the whole front slowly fills your view.",
      around: [
        "Walk around the palace park to the hunting lodge Amalienburg and the Badenburg.",
        "See the royal coaches and sleighs in the Marstallmuseum.",
        "Find the Monopteros on the Badenburger See in the park."
      ],
      nearby: ["nymphenburg-monopteros", "herz-jesu-kirche"],
      photos: []
    },
    // ---------- famous architecture: gates, palaces, monuments ----------
    {
      id: "isartor",
      name: "Isartor",
      emoji: "🏰",
      lat: 48.13530, lng: 11.58178, // approximate. VERIFY on the map
      themes: ["architecture", "free-classics"],
      cost: "Free to see. The Valentin-Karlstadt-Musäum in the tower costs a few euros.", // VERIFY price
      when: "Any time. The fresco is best in afternoon sun.",
      summary: "The eastern gate of Munich's medieval city wall, with two towers and a long painted frieze over the arch.",
      history: "The Isartor was built in 1337 as part of Munich's second city wall, guarding the road from the Isar bridge and the salt route from Salzburg. It is the only one of the old gates that still has its main tower. King Ludwig I had it restored in the 1830s, when the fresco above the arch was added. It shows Emperor Ludwig the Bavarian returning in triumph after the Battle of Mühldorf in 1322.",
      funFacts: [
        "Of the medieval gates, only three survive: the Isartor, the Sendlinger Tor and the Karlstor.",
        "The towers hold the Valentin-Karlstadt-Musäum, a museum about the comedian Karl Valentin, spelled 'Musäum' on purpose as a joke.",
        "The road still runs straight through the gate, so cars and trams squeeze past a 700-year-old building."
      ],
      tip: "Stand on the town side of the gate to see the fresco, then walk ten minutes up Tal to Marienplatz.",
      around: [
        "Walk up Tal, one of Munich's oldest streets, to Marienplatz.",
        "Cross to the Isar and the Deutsches Museum island in under ten minutes.",
        "Pop into the quirky Valentin-Karlstadt-Musäum in the tower for a laugh."
      ],
      nearby: ["sendlinger-tor", "karlstor", "glockenspiel", "viktualienmarkt"],
      photos: []
    },
    {
      id: "sendlinger-tor",
      name: "Sendlinger Tor",
      emoji: "🏰",
      lat: 48.13345, lng: 11.56725, // approximate. VERIFY on the map
      themes: ["architecture"],
      cost: "Free",
      when: "Any time",
      summary: "The southern gate of the old city: two six-sided brick towers joined by one wide arch, at the end of the Sendlinger Straße shopping street.",
      history: "First mentioned in 1318, the Sendlinger Tor guarded the road south towards Sendling and Italy. Its tall middle tower was pulled down in 1808. In 1906 the three small passages were knocked into the single big arch you see today, to make room for traffic and trams.", // VERIFY: 1808
      funFacts: [
        "The two side towers are the oldest part, and are still medieval.",
        "In 1705, Bavarian farmers rising against the Austrian occupation tried to take Munich and were crushed in Sendling, just south of here. It's remembered as the 'Sendlinger Mordweihnacht'."
      ],
      tip: "Walk through the gate and straight down Sendlinger Straße to find the Asamkirche on your left.",
      around: [
        "Two minutes down Sendlinger Straße: the tiny, over-the-top Asamkirche.",
        "Head south-west to the Theresienwiese and the Bavaria statue in about 15 minutes.",
        "The Glockenbachviertel's cafés and the Isar are a short walk south-east."
      ],
      nearby: ["asamkirche", "isartor", "karlstor"],
      photos: []
    },
    {
      id: "karlstor",
      name: "Karlstor and Stachus",
      emoji: "🏰",
      lat: 48.13905, lng: 11.56620, // approximate. VERIFY on the map
      themes: ["architecture", "free-classics"],
      cost: "Free",
      when: "Any time. In winter the square in front becomes an ice rink.",
      summary: "The western city gate at Karlsplatz (Stachus), with a big fountain in front. Walk through it and you're on Munich's main shopping street.",
      history: "The gate was first called the Neuhauser Tor, after the road to the village of Neuhausen. In 1791 it was renamed after Elector Karl Theodor, who was so unpopular that locals kept calling the square in front 'Stachus', after a pub run by one Eustachius Föderl. The gate's middle tower was badly damaged in a gunpowder explosion in 1857 and taken down.", // VERIFY: 1857
      funFacts: [
        "Even the city's own signs say 'Karlsplatz (Stachus)', because nobody calls it Karlsplatz.",
        "In summer people cool their feet in the fountain; in winter the 'Stachus Eiszauber' ice rink takes its place.",
        "Under the square is one of Europe's biggest underground shopping levels."
      ],
      tip: "Walk through the gate into Neuhauser Straße and keep going: St. Michael and the Frauenkirche are minutes away.",
      around: [
        "Walk through the gate and down the pedestrian zone to St. Michael and Marienplatz.",
        "Cross to Lenbachplatz for the Wittelsbacher Brunnen fountain.",
        "The Justizpalast is right across the square."
      ],
      nearby: ["st-michael", "justizpalast", "wittelsbacher-brunnen", "isartor", "sendlinger-tor"],
      photos: []
    },
    {
      id: "siegestor",
      name: "Siegestor",
      emoji: "🏛️",
      lat: 48.15250, lng: 11.58210, // approximate. VERIFY on the map
      themes: ["architecture", "free-classics"],
      cost: "Free",
      when: "Any time. Lit up at night.",
      summary: "A Roman-style triumphal arch with a lion-drawn chariot on top, standing where the grand Ludwigstraße ends and Schwabing begins.",
      history: "King Ludwig I ordered the arch, and Friedrich von Gärtner designed it after the Arch of Constantine in Rome. It was finished in 1852 and dedicated to the Bavarian army. It was badly damaged in the Second World War and only partly restored, on purpose. The new inscription on the south side reads: 'Dedicated to victory, destroyed by war, urging peace.'",
      funFacts: [
        "On top, the figure of Bavaria rides a chariot pulled by four lions.",
        "The south side was left plainer after the war so the damage stays visible.",
        "It marks the border between the university quarter (Maxvorstadt) and Schwabing."
      ],
      tip: "Look at both sides: the north side is the original, the south side carries the post-war inscription.",
      around: [
        "Walk the length of Ludwigstraße south to the Feldherrnhalle, past the university and the State Library.",
        "Cut east into the Englischer Garten for the Monopteros and the Chinese Tower.",
        "Explore Schwabing's cafés and side streets to the north."
      ],
      nearby: ["ludwigskirche", "staatsbibliothek", "feldherrnhalle", "monopteros"],
      photos: []
    },
    {
      id: "feldherrnhalle",
      name: "Feldherrnhalle on Odeonsplatz",
      emoji: "🦁",
      lat: 48.14175, lng: 11.57735, // approximate. VERIFY on the map
      themes: ["architecture", "free-classics"],
      cost: "Free",
      when: "Any time. Evening light on the yellow Theatinerkirche next door is lovely.",
      summary: "An open, arched hall on Odeonsplatz guarded by two stone lions, built as a copy of the Loggia dei Lanzi in Florence.",
      history: "King Ludwig I had Friedrich von Gärtner build the Feldherrnhalle ('Field Marshals' Hall') in 1841–44 to honour the Bavarian army, with statues of the generals Tilly and Wrede. On 9 November 1923 Hitler's failed coup ended here in a shootout with the police. The Nazis later turned the hall into a shrine that passers-by had to salute.",
      funFacts: [
        "People avoided the Nazi shrine by slipping down Viscardigasse behind it. Golden cobblestones now mark that 'shirkers' lane' (find it under hidden gems).",
        "The two lions on the steps were added in 1906.",
        "Odeonsplatz in front is where Ludwigstraße, Munich's grandest boulevard, begins."
      ],
      tip: "Sit on the steps between the lions and look straight up Ludwigstraße to the Siegestor.",
      around: [
        "Find the golden cobblestones of the 'Drückebergergasse' behind the hall.",
        "Walk into the Hofgarten through the arches on the right, and touch the lucky lions at the Residenz.",
        "Visit the Theatinerkirche next door for free."
      ],
      nearby: ["theatinerkirche", "residenz", "wittelsbacherplatz", "siegestor"],
      photos: []
    },
    {
      id: "theatinerkirche",
      name: "Theatinerkirche",
      emoji: "⛪",
      lat: 48.14205, lng: 11.57665, // approximate. VERIFY on the map
      themes: ["churches", "architecture", "free-classics"],
      cost: "Free",
      when: "Daytime. Sunny afternoons light up the yellow front.",
      summary: "A bright yellow Italian Baroque church on Odeonsplatz, with two curling towers and a dazzling white stucco interior.",
      history: "Elector Ferdinand Maria and his wife Henriette Adelaide of Savoy promised to build a church if they had an heir. Max Emanuel was born in 1662, and the church was started the next year by Italian architects. The rococo front was only finished in 1768 by François Cuvilliés. Many Wittelsbach rulers are buried in its crypt.",
      funFacts: [
        "The same royal baby, Max Emanuel, is also the reason Nymphenburg Palace was built.",
        "Its warm yellow became so typical that Munich calls it 'Theatiner yellow'.",
        "Inside, almost everything is white: the effect is all in the stucco, not in colour."
      ],
      tip: "Step inside even for two minutes: the bright white interior is a surprise after the yellow outside.",
      around: [
        "Cross to the Feldherrnhalle and the Hofgarten.",
        "Walk down Theatinerstraße to the Fünf Höfe arcades and on to Marienplatz.",
        "The Residenz and its courtyards are across the square."
      ],
      nearby: ["feldherrnhalle", "residenz", "frauenkirche", "nymphenburg-canal"],
      photos: []
    },
    {
      id: "residenz",
      name: "Residenz and Hofgarten",
      emoji: "👑",
      lat: 48.14100, lng: 11.57950, // approximate, at the Residenzstraße entrance. VERIFY on the map
      themes: ["architecture", "free-classics"],
      cost: "Courtyards and Hofgarten free. Museum and Treasury tickets are extra.", // VERIFY prices
      when: "Museum open daily; the Hofgarten any time",
      summary: "The huge former palace of Bavaria's dukes, electors and kings, right in the city centre, with a free formal garden next to it.",
      history: "The Wittelsbach family ruled Bavaria from here for over 400 years, until 1918. What began as a small castle in 1385 grew into Germany's largest city palace, with ten courtyards and more than 130 rooms open to visitors. Its highlights are the Antiquarium, a 66-metre Renaissance hall, the jewel-filled Treasury and the little rococo Cuvilliés Theatre.", // VERIFY: room count
      funFacts: [
        "Rub the noses of the bronze lions' shields on Residenzstraße for luck: they're shiny from centuries of hands.",
        "Mozart's opera Idomeneo premiered in the Cuvilliés Theatre in 1781.",
        "Much of the palace was destroyed in 1944 and rebuilt over decades after the war."
      ],
      tip: "Walk through the free courtyards from Max-Joseph-Platz to the Hofgarten, then sit by the little temple in the middle of the garden.",
      around: [
        "Touch the lucky lions on Residenzstraße (one of the hidden gems).",
        "Listen to street musicians under the Hofgarten temple.",
        "The Nationaltheater opera house is on the square in front."
      ],
      nearby: ["nationaltheater", "feldherrnhalle", "theatinerkirche", "hofbraeuhaus"],
      photos: []
    },
    {
      id: "nationaltheater",
      name: "Nationaltheater (Bavarian State Opera)",
      emoji: "🎭",
      lat: 48.13960, lng: 11.57910, // approximate. VERIFY on the map
      themes: ["architecture"],
      cost: "Free to see. Standing-room opera tickets are cheap.", // VERIFY
      when: "Evenings, when the opera goers arrive",
      summary: "Munich's grand opera house, with a temple front of tall columns facing Max-Joseph-Platz.",
      history: "The theatre first opened in 1818 and burned down only five years later. Leo von Klenze rebuilt it, and it reopened in 1825. Destroyed again in 1943, it was rebuilt faithfully and reopened in 1963. It is home to the Bavarian State Opera.",
      funFacts: [
        "Two of Wagner's operas, Tristan and Isolde and The Mastersingers of Nuremberg, premiered here.",
        "The seated statue in the middle of the square is King Max I Joseph, Bavaria's first king.",
        "During the opera festival in summer, some performances are shown free on a big screen outside." // VERIFY: 'Oper für alle'
      ],
      tip: "Come by at about 18:30 on an opera night to see the crowd in their best clothes on the steps.",
      around: [
        "Walk through the Residenz courtyards to the Hofgarten.",
        "Window-shop down Maximilianstraße towards the Max II monument.",
        "Marienplatz is five minutes south."
      ],
      nearby: ["residenz", "max-ii-monument", "glockenspiel"],
      photos: []
    },
    {
      id: "altes-rathaus",
      name: "Old Town Hall and the Juliet statue",
      emoji: "🧸",
      lat: 48.13715, lng: 11.57705, // approximate. VERIFY on the map
      themes: ["architecture", "side-quests"],
      cost: "Free to see. The toy museum in the tower costs a few euros.", // VERIFY price
      when: "Daytime",
      summary: "A white Gothic town hall closing off the east side of Marienplatz, with a toy museum in its tower and a bronze Juliet tucked around the back.",
      history: "The Old Town Hall was built in 1470–80 by Jörg von Halsbach, the same builder as the Frauenkirche. It was the seat of the city council until the New Town Hall opened across the square. In its hall on 9 November 1938, Joseph Goebbels gave the speech that started the November pogroms against Jewish people across Germany.",
      funFacts: [
        "The bronze Juliet at the back was a gift from Verona, Munich's twin city. Visitors leave flowers in her hands for luck in love.",
        "The tower holds a small toy museum with old teddy bears, dolls and tin toys.",
        "The tower was rebuilt after the war from old drawings."
      ],
      tip: "Walk under the tower arch to the back to find Juliet, then on to the Viktualienmarkt.",
      around: [
        "Watch the Glockenspiel across the square at 11:00 or 12:00.",
        "Climb St. Peter's tower right behind for the best Old Town view.",
        "Find Juliet on the south side and leave her a flower."
      ],
      nearby: ["glockenspiel", "alter-peter", "viktualienmarkt", "hofbraeuhaus"],
      photos: []
    },
    {
      id: "st-michael",
      name: "St. Michael",
      emoji: "⛪",
      lat: 48.13880, lng: 11.57060, // approximate. VERIFY on the map
      themes: ["churches", "architecture"],
      cost: "Church free. The royal crypt costs a couple of euros.", // VERIFY
      when: "Daytime",
      summary: "A huge white Renaissance church in the middle of the shopping street, with a bronze archangel fighting the devil on its front and King Ludwig II buried in the crypt.",
      history: "Duke Wilhelm V built St. Michael for the Jesuits between 1583 and 1597, as a statement of the Catholic Counter-Reformation. It is the largest Renaissance church north of the Alps. Its barrel vault was, when built, the widest in the world after St. Peter's in Rome.",
      funFacts: [
        "When the tower collapsed during building in 1590, the duke read it as a sign that the church was too small, and had it built bigger.", // VERIFY
        "King Ludwig II, the 'fairy-tale king' of Neuschwanstein, lies in the crypt. His tomb often has fresh flowers.",
        "The bronze Archangel Michael between the two doors is from 1588."
      ],
      tip: "Stand at the back and look up: the vault spans about 20 metres with no pillars at all.",
      around: [
        "Walk on to the Frauenkirche, two minutes away.",
        "Head west through the Karlstor to the Stachus fountain.",
        "The German Hunting and Fishing Museum is next door, in a former church."
      ],
      nearby: ["frauenkirche", "karlstor", "glockenspiel"],
      photos: []
    },
    {
      id: "ludwigskirche",
      name: "Ludwigskirche",
      emoji: "⛪",
      lat: 48.14840, lng: 11.58050, // approximate. VERIFY on the map
      themes: ["churches", "architecture"],
      cost: "Free",
      when: "Daytime",
      summary: "A tall church on Ludwigstraße with a colourful tiled roof and one of the largest frescoes in the world behind the altar.",
      history: "King Ludwig I had Friedrich von Gärtner build the church in 1829–44 as the parish church of his new boulevard, in a round-arched 'Rundbogenstil'. The painter Peter von Cornelius covered the wall behind the altar with a 'Last Judgement' about 18 by 11 metres.",
      funFacts: [
        "The Last Judgement fresco is one of the largest in the world, bigger than Michelangelo's in the Sistine Chapel.", // VERIFY
        "The roof's coloured glazed tiles make a pattern that sparkles in the sun.",
        "It's the university church, right next to the main building."
      ],
      tip: "Walk all the way to the altar: the fresco only really hits you up close.",
      around: [
        "Peek into the university's main hall across the road and the Geschwister-Scholl-Platz memorial.",
        "Walk north to the Siegestor or south to the State Library.",
        "Grab a cheap coffee among the students on Schellingstraße."
      ],
      nearby: ["staatsbibliothek", "siegestor", "feldherrnhalle"],
      photos: []
    },
    {
      id: "staatsbibliothek",
      name: "Bavarian State Library",
      emoji: "📚",
      lat: 48.14740, lng: 11.58080, // approximate. VERIFY on the map
      themes: ["architecture"],
      cost: "Free to visit the stairway and exhibitions",
      when: "Weekdays and Saturdays. Check opening hours.", // VERIFY
      summary: "A long brick palace of books on Ludwigstraße, with four ancient Greek thinkers sitting on its front steps and a grand staircase inside.",
      history: "Friedrich von Gärtner built the library in 1832–43 for King Ludwig I, inspired by Italian Renaissance palaces. It is one of the largest libraries in Europe, with more than 10 million books and a famous collection of old manuscripts.", // VERIFY: count
      funFacts: [
        "The four statues on the steps are Thucydides, Homer, Aristotle and Hippocrates.",
        "The grand staircase inside is modelled on the one in the Scala Regia in the Vatican.", // VERIFY
        "Anyone over 18 can get a free library card and work in the reading rooms."
      ],
      tip: "Walk up the main staircase: the hall at the top is one of the most impressive in Munich, and it's free.",
      around: [
        "Visit the free exhibitions in the treasury rooms when one is on.",
        "Continue to the Ludwigskirche next door.",
        "Walk east into the Englischer Garten in five minutes."
      ],
      nearby: ["ludwigskirche", "siegestor", "feldherrnhalle"],
      photos: []
    },
    {
      id: "maximilianeum",
      name: "Maximilianeum",
      emoji: "🏛️",
      lat: 48.13640, lng: 11.59440, // approximate. VERIFY on the map
      themes: ["architecture", "sunsets"],
      cost: "Free to see from outside. Free guided visits of the parliament by booking.", // VERIFY
      when: "Sunset, when the facade glows",
      summary: "A long palace on a hill above the Isar, at the end of Maximilianstraße. It's the seat of the Bavarian parliament.",
      history: "King Maximilian II had it built in 1857–74 by Friedrich Bürklein, as the crowning end of his new boulevard. It was meant as a home for a foundation for gifted students, which still lives there. Since 1949 the Bavarian parliament, the Landtag, has met inside too.",
      funFacts: [
        "Gifted students from Bavaria can still live here for free, alongside the parliament.",
        "The facade faces west, so it catches the evening sun and lights up gold at sunset.",
        "Its arches hold mosaics with gold backgrounds."
      ],
      tip: "Watch the sunset from the Maximiliansbrücke, then walk up the ramps for the view back down Maximilianstraße.",
      around: [
        "Walk along the Isar to the Friedensengel, about 15 minutes north.",
        "Look back along Maximilianstraße to the Max II monument and the opera.",
        "Go south along the river to the Müllersches Volksbad."
      ],
      nearby: ["max-ii-monument", "friedensengel", "muellersches-volksbad"],
      photos: []
    },
    {
      id: "max-ii-monument",
      name: "Max II Monument on Maximilianstraße",
      emoji: "🗽",
      lat: 48.13710, lng: 11.58880, // approximate. VERIFY on the map
      themes: ["architecture"],
      cost: "Free",
      when: "Any time",
      summary: "A bronze King Maximilian II on a tall stone base in the middle of the boulevard he built, with the Maximilianeum glowing behind him.",
      history: "Maximilian II wanted a new style for Bavaria, mixing Gothic and modern forms, and his Maximilianstraße was built to show it off. After his death, the monument by Kaspar von Zumbusch was unveiled here in 1875.",
      funFacts: [
        "Maximilianstraße is now Munich's luxury shopping street.",
        "The boulevard was planned as one long view: from the opera, past this king, to the Maximilianeum.",
        "Four seated figures around the base hold coats of arms."
      ],
      tip: "Stand behind the king for the photo, with the Maximilianeum lined up behind him.",
      around: [
        "Walk east over the bridge to the Maximilianeum.",
        "Head west for the Nationaltheater and the Residenz.",
        "Stroll the Isar banks just behind."
      ],
      nearby: ["maximilianeum", "nationaltheater", "residenz"],
      photos: []
    },
    {
      id: "hofbraeuhaus",
      name: "Hofbräuhaus",
      emoji: "🍺",
      lat: 48.13760, lng: 11.57990, // approximate. VERIFY on the map
      themes: ["architecture", "bavarian"],
      cost: "Free to walk in. A beer costs around €10.", // VERIFY price
      when: "Daily, from late morning. Livelier in the evening with the brass band.",
      summary: "The world's most famous beer hall, with painted vaults, long wooden tables and a brass band playing most days.",
      history: "Duke Wilhelm V founded the royal brewery in 1589 so his court didn't have to buy expensive beer from elsewhere. The public was allowed in from 1828. Today's building dates from 1896–97, when the brewery itself moved out.",
      funFacts: [
        "Regulars keep their personal beer mugs locked in a wall of small lockers.",
        "Some tables are 'Stammtische', reserved for groups who have met there for decades.",
        "The ceiling paintings in the main hall show Bavarian motifs and sayings."
      ],
      tip: "Just walk through the main hall and the courtyard to soak it up. You don't have to order.",
      around: [
        "Walk to Marienplatz in three minutes.",
        "Head to Max-Joseph-Platz for the opera and the Residenz.",
        "Find the quiet Alter Hof, the first home of the Wittelsbachs, nearby."
      ],
      nearby: ["glockenspiel", "residenz", "altes-rathaus"],
      photos: []
    },
    {
      id: "justizpalast",
      name: "Justizpalast and the White Rose courtroom",
      emoji: "⚖️",
      lat: 48.13970, lng: 11.56450, // approximate. VERIFY on the map
      themes: ["architecture"],
      cost: "Free (memorial room open on weekdays)", // VERIFY hours
      when: "Weekdays",
      summary: "A huge neo-Baroque palace of justice by the Stachus, with a glass dome over its central hall. Inside is the courtroom where the White Rose students were sentenced.",
      history: "Friedrich von Thiersch built the Justizpalast in 1891–97. In February 1943 Sophie and Hans Scholl and Christoph Probst of the White Rose resistance group were tried here by the Nazi People's Court and executed the same day. Room 253 is now a memorial with a small free exhibition.",
      funFacts: [
        "The central hall is roofed with a big glass and iron dome.",
        "The building is still a working court.",
        "Sophie Scholl was 21 when she was sentenced here."
      ],
      tip: "Bring an ID: you go through a security check to enter.",
      around: [
        "Cross to the Stachus fountain and the Karlstor.",
        "Visit the Old Botanical Garden park right behind.",
        "Lenbachplatz with the Wittelsbacher Brunnen is a few steps away."
      ],
      nearby: ["karlstor", "wittelsbacher-brunnen", "ns-victims-memorial"],
      photos: []
    },
    {
      id: "wittelsbacher-brunnen",
      name: "Wittelsbacher Brunnen",
      emoji: "⛲",
      lat: 48.14105, lng: 11.56765, // approximate. VERIFY on the map
      themes: ["architecture", "side-quests"],
      cost: "Free",
      when: "Spring to autumn, when the water is on",
      summary: "Munich's grandest fountain, on Lenbachplatz: a man hurling a rock from a water horse and a woman on a water bull, splashing in a big basin.",
      history: "Adolf von Hildebrand made the fountain in 1891–95 to celebrate Munich's new drinking water supply from the Mangfall valley. The two sides show the two faces of water: the man stands for its destructive power, the woman for its life-giving power.",
      funFacts: [
        "Munich's tap water still comes largely from the Mangfall valley, and is famously good.",
        "The fountain is named after the Wittelsbach family, Bavaria's rulers."
      ],
      tip: "Sit on the rim on a hot day; it's much quieter than the Stachus fountain next door.",
      around: [
        "Walk to the Stachus and the Karlstor.",
        "Visit the Memorial to the Victims of National Socialism a few minutes north.",
        "Continue to Maximiliansplatz's park strip."
      ],
      nearby: ["karlstor", "ns-victims-memorial", "justizpalast"],
      photos: []
    },
    {
      id: "ns-victims-memorial",
      name: "Memorial to the Victims of National Socialism",
      emoji: "🕯️",
      lat: 48.14300, lng: 11.57422, // from the photo's GPS data, beside the column
      themes: ["architecture"],
      cost: "Free",
      when: "Any time. The flame shows best after dark.",
      summary: "A dark basalt column with an eternal flame burning inside an iron cage, on a quiet square on Brienner Straße.",
      history: "The memorial stands on the Platz der Opfer des Nationalsozialismus (Square of the Victims of National Socialism). It was made by Andreas Sobeck and unveiled in 1985. Close by, on Brienner Straße, stood the Wittelsbacher Palais, which the Gestapo used as its Munich headquarters and prison. The square was redesigned in the 2010s.", // VERIFY: date of redesign
      funFacts: [
        "The cage around the flame stands for imprisonment; the flame for remembrance.",
        "The low wall behind carries the dedication 'to the victims of the National Socialist tyranny'.",
        "Brienner Straße runs on to Königsplatz, which the Nazis used for their mass rallies."
      ],
      tip: "Come in the evening, when the flame glows behind the bars.",
      around: [
        "Walk west along Brienner Straße to Königsplatz and the NS Documentation Centre (free).",
        "Wittelsbacherplatz with its horseman statue is two minutes east.",
        "Odeonsplatz and the Feldherrnhalle are just beyond."
      ],
      nearby: ["wittelsbacherplatz", "koenigsplatz", "ns-dokuzentrum", "feldherrnhalle"],
      photos: [
        { url: "images/ns-victims-memorial-1.jpg", credit: "Photo: Go Places community" }
      ]
    },
    {
      id: "bavaria-statue",
      name: "Bavaria statue and Ruhmeshalle",
      emoji: "🗽",
      lat: 48.13100, lng: 11.54540, // approximate. VERIFY on the map
      themes: ["architecture", "free-classics", "sunsets"],
      cost: "Free to see. Climbing up inside costs a few euros (April to mid-October).", // VERIFY
      when: "Any time; climbs only in summer. Sunset from the steps.",
      summary: "An 18-metre bronze woman with a lion, towering over the Oktoberfest meadow, with a hall of fame behind her. You can climb up inside her head.",
      history: "King Ludwig I commissioned the statue as the symbol of Bavaria. Ludwig Schwanthaler designed it, and Ferdinand von Miller cast it in bronze in pieces between 1844 and 1850. It was the largest bronze statue cast since antiquity. Behind her, Leo von Klenze's Ruhmeshalle holds busts of famous Bavarians.",
      funFacts: [
        "A staircase inside leads up into her head, where small windows look out over the Theresienwiese.",
        "Legend says the bronze came from melted-down Turkish cannons from the Battle of Navarino.", // VERIFY
        "During Oktoberfest she looks straight down on the beer tents."
      ],
      tip: "Sit on the big steps below her at sunset with the whole Theresienwiese in front of you.",
      around: [
        "Walk the Theresienwiese, home of Oktoberfest, and the spring festival in April.",
        "Relax in the Bavariapark behind the hall.",
        "Walk on to Hackerbrücke for sunset, about 15 minutes north."
      ],
      nearby: ["hackerbruecke", "sendlinger-tor"],
      photos: []
    },
    {
      id: "friedensengel",
      name: "Friedensengel",
      emoji: "👼",
      lat: 48.14400, lng: 11.59440, // approximate. VERIFY on the map
      themes: ["architecture", "sunsets", "free-classics"],
      cost: "Free",
      when: "Any time; sunset from the terraces is lovely",
      summary: "A golden angel of peace on top of a tall column, above fountain terraces on the steep bank of the Isar.",
      history: "The 'Angel of Peace' was built in 1896–99 to celebrate 25 years of peace after the Franco-Prussian War of 1870–71. The gilded angel is modelled on the ancient Greek Nike of Paionios. It crowns Prinzregentenstraße, one of the city's great boulevards.",
      funFacts: [
        "The column with the angel is about 38 metres tall.",
        "Below it, mosaics show allegories of war and peace.",
        "In summer, locals gather on the terraces and steps with drinks after work."
      ],
      tip: "Come at sunset and sit on the steps facing the city, with the angel glowing above you.",
      around: [
        "Walk along the Isar south to the Maximilianeum.",
        "Cross the river into the Englischer Garten.",
        "The Villa Stuck and the Monacensia literature library are nearby."
      ],
      nearby: ["maximilianeum", "monacensia", "monopteros"],
      photos: []
    },
    {
      id: "muellersches-volksbad",
      name: "Müllersches Volksbad",
      emoji: "🏊",
      lat: 48.13110, lng: 11.58650, // approximate. VERIFY on the map
      themes: ["architecture", "side-quests"],
      cost: "A swim costs about €6; the sauna is extra.", // VERIFY
      when: "Daily; quiet in the mornings",
      summary: "A palace for swimming: an Art Nouveau bath on the Isar from 1901, with vaulted halls, a dome and a Roman-style steam bath.",
      history: "Engineer Karl Müller paid for the bath so that ordinary Munich people, many with no bathroom at home, could wash and swim. Carl Hocheder designed it, and it opened in 1901. Back then it was one of the most modern baths in Europe.",
      funFacts: [
        "It has two pools: the big men's hall and the smaller 'ladies' hall', today open to everyone.",
        "The Roman-Irish bath has a steam room and cold plunge pools.",
        "You can swim in a 120-year-old Art Nouveau hall for the price of a normal pool."
      ],
      tip: "Go for an early morning swim when the light comes through the high windows.",
      around: [
        "Walk the Isar banks or cross to the Deutsches Museum island.",
        "Watch the sunset from the Ludwigsbrücke.",
        "Climb up to the Gasteig HP8 cultural centre and library."
      ],
      nearby: ["maximilianeum", "isartor", "hp8-library"],
      photos: []
    },
    {
      id: "olympiastadion-muenchen",
      name: "Olympic Stadium and the tent roof",
      emoji: "🏟️",
      lat: 48.17310, lng: 11.54680, // approximate. VERIFY on the map
      themes: ["architecture", "free-classics"],
      cost: "Park free. Small fee to enter the stadium; roof climbs and the zip line cost extra.", // VERIFY
      when: "Daytime. Sunny days make the roof sparkle.",
      summary: "The stadium of the 1972 Olympics, under a huge see-through tent roof that sweeps over the park like a spider's web.",
      history: "Günter Behnisch and the engineer Frei Otto designed the Olympic Park for the 1972 Summer Olympics, meant to show a new, open, democratic Germany. The roof is a net of steel cables hung with acrylic panels. The Games were overshadowed by the attack on the Israeli team, remembered at a memorial in the park.",
      funFacts: [
        "The roof covers about 75,000 square metres of acrylic glass.",
        "You can walk on top of the roof on a guided climb, or zip-line across the stadium.",
        "The park was built on a wartime rubble mountain and an old airfield."
      ],
      tip: "Walk up the Olympiaberg first for the best view down onto the roof.",
      around: [
        "Climb the Olympiaberg for the view, or the Olympic Tower for a higher one.",
        "Visit the free memorial to the 1972 Olympic attack, the 'Erinnerungsort'.",
        "Cross the bridge to BMW Welt."
      ],
      nearby: ["olympiaberg", "olympiapark-sports", "bmw-welt"],
      photos: []
    },
    {
      id: "bmw-welt",
      name: "BMW Welt and the BMW Tower",
      emoji: "🚗",
      lat: 48.17690, lng: 11.55640, // approximate. VERIFY on the map
      themes: ["architecture", "side-quests"],
      cost: "BMW Welt free. The BMW Museum costs extra.", // VERIFY
      when: "Daily, daytime",
      summary: "A swirling glass and steel showroom next to BMW's headquarters, a tower shaped like four engine cylinders.",
      history: "BMW's headquarters, the 'Vierzylinder' (four-cylinder), was designed by Karl Schwanzer and finished in 1973, just after the Olympics. BMW Welt, by the Vienna architects Coop Himmelb(l)au, opened in 2007. Its roof seems to melt into a 'double cone' at one corner.",
      funFacts: [
        "The four towers of the HQ hang from a central core, instead of standing on the ground.",
        "The bowl-shaped building next to the tower is the BMW Museum, nicknamed the 'salad bowl'.",
        "Customers can collect their new car here and drive it down a ramp inside the building."
      ],
      tip: "Walk up to the bridge between BMW Welt and the museum for a photo of the tower.",
      around: [
        "Sit in the latest models in the showroom for free.",
        "Cross to the Olympic Park and the stadium.",
        "Climb the Olympiaberg for sunset."
      ],
      nearby: ["olympiastadion-muenchen", "olympiaberg"],
      photos: []
    },
    {
      id: "allianz-arena",
      name: "Allianz Arena",
      emoji: "⚽",
      lat: 48.21880, lng: 11.62470, // approximate. VERIFY on the map
      themes: ["architecture", "side-quests"],
      cost: "Free to walk around. Stadium tours and the FC Bayern Museum cost extra.", // VERIFY
      when: "Evenings, when the outside is lit up",
      summary: "FC Bayern's stadium, wrapped in inflated diamond-shaped cushions that glow red, white or blue at night.",
      history: "The Swiss architects Herzog & de Meuron designed the arena for the 2006 World Cup, and it opened in 2005. The skin is made of more than 2,800 ETFE plastic cushions that can each be lit separately.", // VERIFY: cushion count
      funFacts: [
        "Locals call it the 'Schlauchboot' (rubber dinghy) because of its shape.",
        "It glows red when FC Bayern plays at home, and white for national team matches.",
        "It holds about 75,000 people for football."
      ],
      tip: "Watch it light up from the Fröttmaninger Berg across the motorway.",
      around: [
        "Climb the Fröttmaninger Berg for a view of the arena and the wind turbine.",
        "Visit the FC Bayern Museum inside.",
        "Walk the esplanade all the way around."
      ],
      nearby: ["froettmaninger-berg"],
      photos: []
    },
    {
      id: "pinakothek-der-moderne",
      name: "Pinakothek der Moderne",
      emoji: "🖼️",
      lat: 48.14710, lng: 11.57210, // approximate. VERIFY on the map
      themes: ["architecture"],
      cost: "€1 on Sundays. The rotunda inside the entrance is free.", // VERIFY
      when: "Tuesday to Sunday; Sundays are cheap",
      summary: "A big white concrete museum with a soaring glass-topped rotunda, home to modern art, design and architecture.",
      history: "Stephan Braunfels designed the museum, which opened in 2002. It brings four museums together: modern art, design, architecture and works on paper. With the Alte and Neue Pinakothek nearby it forms Munich's 'Kunstareal', the art quarter.",
      funFacts: [
        "The rotunda is 25 metres high and filled with daylight from above.",
        "The design collection has everything from cars to computers to chairs.",
        "Stephan Braunfels also designed the parliament buildings on the Spree in Berlin."
      ],
      tip: "Even if you skip the art, step into the rotunda and look up.",
      around: [
        "Visit the Alte Pinakothek and the Museum Brandhorst with its colourful facade next door.",
        "Lie on the lawns between the museums on a sunny day.",
        "Walk to Königsplatz in ten minutes."
      ],
      nearby: ["koenigsplatz", "staatsbibliothek"],
      photos: []
    },
    {
      id: "herz-jesu-kirche",
      name: "Herz-Jesu-Kirche",
      emoji: "🔷",
      lat: 48.15470, lng: 11.53720, // approximate. VERIFY on the map
      themes: ["architecture", "churches", "side-quests"],
      cost: "Free",
      when: "Daytime; the light inside is best in the afternoon",
      summary: "A modern church shaped like a glass box inside a glass box. Its front is a pair of huge blue glass doors.",
      history: "The old church here burned down in 1994. The new one, by the architects Allmann Sattler Wappner, was consecrated in 2000. Its inner walls are made of wooden slats that let in more light the nearer you get to the altar.",
      funFacts: [
        "The front doors are about 14 metres tall and open fully on special church holidays.",
        "The blue glass front is covered in a pattern of nails that spell out the Passion story in a code.", // VERIFY
        "It has won several architecture prizes."
      ],
      tip: "Walk slowly from the back to the altar and watch the light change.",
      around: [
        "Walk to Rotkreuzplatz for gelato and the Neuhausen cafés.",
        "Continue west to Nymphenburg Palace, about 20 minutes on foot.",
        "Hirschgarten beer garden is a short bike ride away."
      ],
      nearby: ["nymphenburg-canal"],
      photos: []
    },
    {
      id: "rudi-hierl-platz-table-tennis",
      name: "Table tennis and benches at Rudi-Hierl-Platz",
      emoji: "🏓",
      lat: 48.14867, lng: 11.55906, // from the photos' GPS data, at the tables
      themes: ["outdoors", "side-quests"],
      cost: "Free",
      when: "Daylight, spring to autumn; the square is lit in the evening",
      summary: "Three free outdoor table tennis tables on a leafy square near Stiglmaierplatz, with long benches all around under the plane trees and a public bookshelf a few steps away.",
      history: "Rudi-Hierl-Platz is a small tree-lined square on the edge of Maxvorstadt, across the road from the Löwenbräukeller at Stiglmaierplatz. Munich has put concrete table tennis tables into many of its squares and parks, free for anyone to use.",
      funFacts: [
        "There are three tables, so even on a busy evening you rarely wait long for a game.",
        "The square is full of benches: long concrete and wooden seats line the paths and ring the trees.",
        "The open bookshelf on the same square means you can swap a book between games."
      ],
      tip: "Bring your own bats and a ball: the tables are always there, the equipment isn't.",
      around: [
        "Take or leave a book at the bookshelf on the same square.",
        "Walk ten minutes east to Königsplatz and the free museums of the Kunstareal.",
        "The Löwenbräukeller beer garden is right across Stiglmaierplatz."
      ],
      nearby: ["bookshelf-rudi-hierl-platz", "koenigsplatz"],
      photos: [
        { url: "images/rudi-hierl-platz-table-tennis-1.jpg", credit: "Photo: Go Places community" },
        { url: "images/rudi-hierl-platz-table-tennis-2.jpg", credit: "Photo: Go Places community" },
        { url: "images/rudi-hierl-platz-table-tennis-3.jpg", credit: "Photo: Go Places community" },
        { url: "images/rudi-hierl-platz-table-tennis-4.jpg", credit: "Photo: Go Places community" }
      ]
    }
  ]
};
