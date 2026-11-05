/*
 * GO PLACES — Berlin content file
 * ===============================
 * Berlin's places and themes. It works exactly like data/spots.js (Munich):
 * the top of that file explains every field.
 *
 * Sources: the Go Places community's photos (pins of photo spots come from
 * the photos' GPS data), vetted Reddit tips from r/berlinsocialclub, and the
 * official pages of each place. Pins marked "approximate" and facts marked
 * "VERIFY" are worth checking before launch.
 */
window.GO_PLACES = {
  city: "Berlin",
  center: [52.5163, 13.3889],
  zoom: 12,

  themes: [
    { id: "free-classics", name: "Free Berlin classics", emoji: "⭐", description: "The landmarks every visitor should see, all free." },
    { id: "sunsets", name: "Sunsets & viewpoints", emoji: "🌅", description: "Flak towers, rubble hills, bridges and rooftops to watch the sky from." },
    { id: "wall-history", name: "Wall & Cold War", emoji: "🧱", description: "Where the city was split, and how it came back together." },
    { id: "side-quests", name: "Side quests", emoji: "🦆", description: "Quirky, lesser-known and random things worth finding." },
    { id: "outdoors", name: "Green & active", emoji: "🌲", description: "Parks, lakes, forests and an old airport to run, skate and swim in." },
    { id: "architecture", name: "Architecture in Berlin", emoji: "🏛️", description: "Palaces, monuments, memorials and modern icons, from the Brandenburg Gate to the TV tower." },
    { id: "cheap-thrills", name: "Almost free", emoji: "🪙", description: "Not free, but cheap or free on special days. Each one says what it costs." }
  ],

  spots: [
    // ---------- from the community's photos ----------
    {
      id: "brandenburger-tor",
      name: "Brandenburg Gate",
      emoji: "🏛️",
      lat: 52.51628, lng: 13.37770,
      themes: ["free-classics", "wall-history", "architecture"],
      cost: "Free",
      when: "Any time. Early morning or late evening if you want it without the crowds.",
      summary: "Berlin's most famous landmark: a neoclassical gate crowned by a chariot and four horses, at the end of Unter den Linden.",
      history: "The gate was built between 1788 and 1791 by Carl Gotthard Langhans, modelled on the gateway to the Acropolis in Athens. Johann Gottfried Schadow's Quadriga, the goddess of victory on a four-horse chariot, was added in 1793. When the Wall went up in 1961, the gate ended up in the no-man's-land between East and West, and for 28 years nobody could walk through it. It reopened on 22 December 1989, a few weeks after the Wall fell, and has been the symbol of reunified Germany ever since.",
      funFacts: [
        "Napoleon took the Quadriga to Paris in 1806. It came back in 1814, and the goddess got a new staff with an iron cross and a Prussian eagle.",
        "It is the only one of Berlin's old city gates still standing.",
        "The north wing hides a small 'Room of Silence' (Raum der Stille) where anyone can sit down for free.",
        "A double row of cobblestones in the ground nearby marks where the Wall ran."
      ],
      tip: "Walk through from Pariser Platz to the Tiergarten side, then look back: the Quadriga faces east, into the old city.",
      around: [
        "Walk through the gate into the Tiergarten, or down Unter den Linden to Museum Island.",
        "Find the Room of Silence in the gate's north wing (a hidden gem).",
        "The Holocaust Memorial is two minutes south."
      ],
      nearby: ["reichstag-dome", "holocaust-memorial", "unter-den-linden", "soviet-memorial-tiergarten"],
      photos: [
        { url: "images/berlin/brandenburger-tor-1.jpg", credit: "Photo: Go Places community" },
        { url: "images/berlin/brandenburger-tor-2.jpg", credit: "Photo: Go Places community" }
      ]
    },
    {
      id: "reichstag-dome",
      name: "Reichstag and its glass dome",
      emoji: "🏛️",
      lat: 52.51862, lng: 13.37618,
      themes: ["free-classics", "sunsets", "wall-history", "architecture"],
      cost: "Free (book online in advance, bring a photo ID)",
      when: "Daily 8:00 to 24:00, last entry 21:45. Go around sunset for the light.", // VERIFY: dome closes for some weeks each year
      summary: "The home of the German parliament, with a glass dome on top that anyone can walk up for free, right above the politicians' heads.",
      history: "The Reichstag was built between 1884 and 1894 to designs by Paul Wallot. The words 'Dem deutschen Volke' (To the German people) were added over the entrance in 1916. A fire in February 1933 gave the Nazis a pretext to suspend civil rights, and in 1945 the building was badly damaged in the fight for Berlin. After reunification, Norman Foster rebuilt it and added the glass dome, and the Bundestag moved in in 1999.",
      funFacts: [
        "A ramp spirals up inside the dome, so you walk above the plenary hall and can look down into it.",
        "The mirrored cone in the middle reflects daylight down into the chamber below.",
        "In 1995, the artists Christo and Jeanne-Claude wrapped the whole building in silver fabric for two weeks.",
        "Graffiti left by Soviet soldiers in 1945 was kept on some of the walls inside."
      ],
      tip: "Register on bundestag.de a few days ahead. If you forgot, the visitor service on Platz der Republik can sometimes give same-day slots from two hours ahead.",
      around: [
        "Walk along the Spree past the parliament buildings.",
        "See the Soviet War Memorial in the Tiergarten.",
        "Cross to the Chancellery."
      ],
      nearby: ["spreebogen", "brandenburger-tor", "soviet-memorial-tiergarten"],
      photos: [
        { url: "images/berlin/reichstag-1.jpg", credit: "Photo: Go Places community" }
      ]
    },
    {
      id: "spreebogen",
      name: "Spree riverside in the government quarter",
      emoji: "🌉",
      lat: 52.51949, lng: 13.37706, // from the photo's GPS data
      themes: ["free-classics", "wall-history", "side-quests", "architecture"],
      cost: "Free",
      when: "Any time. Sunny afternoons are best for photos.",
      summary: "A promenade along the Spree between the parliament buildings, where a two-level footbridge links two halves of the Bundestag across the river.",
      history: "For 28 years the Berlin Wall ran right along this bend of the Spree, between the Reichstag in the West and the riverbank in the East. After reunification, the 'Band des Bundes' (Federal Ribbon) of government buildings was planned to cross the old border on purpose. The Paul-Löbe-Haus on the west bank and the Marie-Elisabeth-Lüders-Haus on the east bank, both by architect Stephan Braunfels, are joined by a double bridge: one level for the public, one for members of parliament.",
      funFacts: [
        "The bridge is a deliberate symbol: East and West Berlin, joined over the river that once divided them.",
        "In the basement of the Marie-Elisabeth-Lüders-Haus, original segments of the Wall stand on their old line.", // VERIFY: open to the public
        "The white crosses on the riverbank nearby remember people who died trying to cross the border here.",
        "The Federal Chancellery across the meadow, by Axel Schultes and Charlotte Frank, opened in 2001. Its big round windows earned it the nickname 'Waschmaschine' (washing machine).",
        "The Chancellery is about eight times bigger than the White House." // VERIFY
      ],
      tip: "Sit on the steps by the water at the Lüders-Haus and watch the tour boats go by. It's one of the calmest spots in the middle of the city.",
      around: [
        "Look across the meadow at the Chancellery, the 'washing machine'.",
        "Climb the Reichstag dome (free with booking).",
        "Walk to the Hauptbahnhof over the Spree."
      ],
      nearby: ["reichstag-dome", "hauptbahnhof", "schloss-bellevue"],
      photos: [
        { url: "images/berlin/spreebogen-1.jpg", credit: "Photo: Go Places community" }
      ]
    },
    {
      id: "east-side-gallery",
      name: "East Side Gallery: 'It happened in November'",
      emoji: "🎨",
      lat: 52.50722, lng: 13.43643, // from the photo's GPS data, at Kani Alavi's mural
      themes: ["free-classics", "wall-history", "architecture"],
      cost: "Free",
      when: "Any time, open air. Mornings are quietest.",
      summary: "The longest surviving stretch of the Berlin Wall, covered in murals. This pin marks one of its most moving paintings: a flood of faces pouring through a gap in the Wall.",
      history: "In 1990, a few months after the Wall fell, 118 artists from 21 countries painted this 1.3 km stretch along the Spree, turning it into the world's longest open-air gallery. The mural here is 'Es geschah im November' (It happened in November) by Kani Alavi, who was born in Iran in 1955 and moved to West Berlin in 1980. It shows the night of 9 November 1989: the Wall bursts open and a crowd of faces streams through. Alavi based the faces on the people he saw at Checkpoint Charlie that night, worried and hopeful at the same time.",
      funFacts: [
        "Kani Alavi later co-founded the artists' association that looks after the gallery and chaired it for many years.",
        "Most of the murals were repainted by their original artists in 2009, for the 20th anniversary of the fall of the Wall.",
        "The famous 'Fraternal Kiss' of Brezhnev and Honecker is on the same stretch. Walk on to find it."
      ],
      tip: "Walk the whole gallery from Ostbahnhof to Oberbaumbrücke and finish with the sunset on the bridge.",
      nearby: ["oberbaumbruecke", "karl-marx-allee"],
      photos: [
        { url: "images/berlin/east-side-gallery-1.jpg", credit: "Photo: Go Places community" }
      ]
    },
    {
      id: "holzmarkt",
      name: "Holzmarkt",
      emoji: "🪵",
      lat: 52.51168, lng: 13.42676, // from the photos' GPS data
      themes: ["side-quests", "sunsets"],
      cost: "Free to walk in. Food, drinks and the club cost extra.",
      when: "Late afternoon into the evening, when the lamps come on. Best from spring to autumn.",
      summary: "A wooden, hand-built 'village' on the bank of the Spree, with workshops, bars, a riverside deck and the Kater Blau club. Wander in, sit by the water and watch the light go.",
      history: "This stretch of riverbank was home to Bar25, one of Berlin's legendary techno clubs, until 2010. Instead of letting investors build offices here, the people behind it formed a cooperative and, with the help of a Swiss pension fund that bought the land, built their own creative village. It opened in 2017 and is run as a non-profit-minded mix of culture, crafts, food and nightlife.", // VERIFY: dates and land deal
      funFacts: [
        "Most of the buildings were made from reused wood, windows and doors.",
        "Across the river you can see the chimneys of the Mitte power station.",
        "The world's smallest disco, a phone box called Teledisko, stands at the Kater Blau club here. See its own pin."
      ],
      tip: "Bring a drink to the wooden deck at the water's edge and put your feet up, like the photo. Sunset over the Spree is the reason to come.",
      photos: [
        { url: "images/berlin/holzmarkt-1.jpg", credit: "Photo: Go Places community" },
        { url: "images/berlin/holzmarkt-2.jpg", credit: "Photo: Go Places community" },
        { url: "images/berlin/holzmarkt-3.jpg", credit: "Photo: Go Places community" },
        { url: "images/berlin/holzmarkt-4.jpg", credit: "Photo: Go Places community" }
      ]
    },
    {
      id: "teledisko",
      name: "Teledisko: the world's smallest club",
      emoji: "🪩",
      lat: 52.51135, lng: 13.42600, // approximate, at Kater Blau, Holzmarktstraße 25
      themes: ["side-quests", "cheap-thrills"],
      cost: "About €2 per song (photos extra)", // VERIFY current price
      when: "Evenings and nights. The booth at Kater Blau is reachable during club hours.", // VERIFY
      summary: "An old yellow phone box turned into a tiny nightclub: drop in a coin, pick a song, and you and a few friends get a disco ball, fog machine and strobe lights for one track.",
      history: "Berlin entrepreneur Benjamin Uphues came up with the Teledisko in the mid-2010s and put the first booths at the RAW site in Friedrichshain and at the Kater Blau club at Holzmarkt in 2016. Berlin was soon calling it 'a whole club on two square metres', and Teledisko booths have since popped up in other cities too. You may hear the area around Holzmarkt and Ostbahnhof called the Andreasviertel, after Andreasstraße nearby.", // VERIFY
      funFacts: [
        "It fits you and up to five friends, if you're good friends.",
        "You control the lights and the fog yourself, and you can print a photo strip of your one-song party.",
        "There are other booths in Berlin: on Voxstraße at Potsdamer Platz (open around the clock) and, at least until recently, at the RAW site on Revaler Straße." // VERIFY
      ],
      tip: "Pick a song everyone knows the words to. Three minutes goes fast.",
      photos: []
    },
    {
      id: "ebertbruecke-view",
      name: "Museum Island view from Ebertbrücke",
      emoji: "📸",
      lat: 52.52226, lng: 13.39410, // from the photo's GPS data
      themes: ["free-classics", "sunsets"],
      cost: "Free",
      when: "Any time. Late afternoon light is lovely on the museum's stone.",
      summary: "A small bridge over the Spree with a postcard view: the Bode-Museum on the water, the river bending towards the Monbijou bridge, and the TV tower rising behind it all.",
      history: "Museum Island, the northern tip of the island in the Spree, holds five museums built between 1830 and 1930 and has been a UNESCO World Heritage Site since 1999. The domed Bode-Museum at its tip opened in 1904. The TV tower at Alexanderplatz was built by East Germany between 1965 and 1969 and, at 368 metres, is still the tallest structure in Germany.",
      funFacts: [
        "When the sun shines on the TV tower's steel ball, the reflection forms a cross. Berliners nicknamed it 'the Pope's revenge', since the atheist East German state had built it.",
        "The Bode-Museum looks like it rises straight out of the river, because its walls go right down to the water.",
        "The colonnades on Museum Island still have bullet holes from the last days of the war in 1945."
      ],
      tip: "Lean on the stone railing for the photo, then walk along the river to Monbijoupark.",
      photos: [
        { url: "images/berlin/ebertbruecke-1.jpg", credit: "Photo: Go Places community" }
      ]
    },
    {
      id: "lietzenseepark",
      name: "Lietzenseepark",
      emoji: "🌳",
      lat: 52.50870, lng: 13.29050, // from the photos' GPS data
      themes: ["outdoors", "side-quests"],
      cost: "Free",
      when: "Summer afternoons, and autumn when the willows turn gold.",
      summary: "A lake park in Charlottenburg with weeping willows hanging over the water, shady paths and big lawns. Locals walk their dogs here; tourists hardly ever find it.",
      history: "The Lietzensee is an old glacial lake. The park around it was laid out in the early 20th century by Berlin's garden director Erwin Barth as a 'Volkspark' for everyone, with terraces, a cascade and lakeside paths. The busy Kaiserdamm crosses the lake on a dam, splitting it into a larger and a smaller part.", // VERIFY: dates
      funFacts: [
        "The willows reach right down to the water, so you can sit inside them like a green tent.",
        "It's just a short walk from Messe Berlin and the Funkturm, the radio tower known as Berlin's 'little Eiffel Tower'."
      ],
      tip: "Bring a book and find a bench on the west bank in the late afternoon.",
      photos: [
        { url: "images/berlin/lietzensee-1.jpg", credit: "Photo: Go Places community" },
        { url: "images/berlin/lietzensee-2.jpg", credit: "Photo: Go Places community" },
        { url: "images/berlin/lietzensee-3.jpg", credit: "Photo: Go Places community" }
      ]
    },
    {
      id: "stephanuskirche",
      name: "Stephanuskirche in the Soldiner Kiez",
      emoji: "⛪",
      lat: 52.55870, lng: 13.38636,
      themes: ["side-quests"],
      cost: "Free to look at",
      when: "Dawn or dusk, when the red brick glows",
      summary: "A neo-Gothic red-brick church with an almost 80-metre tower, rising over one of Berlin's most international neighbourhoods in Gesundbrunnen.",
      history: "The foundation stone was laid in 1902 and the church, designed by Adolf Bürckner, was consecrated in December 1904 in the presence of Kaiser Wilhelm II. It holds about 1,000 people. In 1945 almost every roof tile and all the leaded windows were destroyed, and it took until 1958 to repair it. It has been closed since water damage in 2024, with a roof renovation planned.", // VERIFY reopening
      funFacts: [
        "The 3-metre cross on top of the tower was gilded in 1927 and survived the war.",
        "Its three cast-steel bells were never melted down for weapons, unlike many church bells.",
        "The altar Bible was a gift from Empress Auguste Viktoria."
      ],
      tip: "Walk on through the Soldiner Kiez to the Panke river path, a quiet green strip few visitors know.",
      photos: [
        { url: "images/berlin/stephanuskirche-1.jpg", credit: "Photo: Go Places community" }
      ]
    },
    {
      id: "humboldthain",
      name: "Humboldthain hill and flak tower",
      emoji: "🗼",
      lat: 52.54500, lng: 13.38430, // approximate, at the viewing platform
      themes: ["sunsets", "wall-history", "outdoors"],
      cost: "Free",
      when: "About an hour before sunset. Autumn colours are spectacular.",
      summary: "A wooded hill in Gesundbrunnen with a WWII flak tower half buried inside it. Climb the stairs to the platform on top for one of the widest free views over Berlin.",
      history: "The Volkspark Humboldthain was laid out in the 1870s and named after Alexander von Humboldt. During the Second World War, one of Berlin's three huge flak towers was built here to shoot down bombers and shelter civilians. After the war, French engineers tried to blow it up in 1948, but only managed half: the northern side was spared because the blast could have damaged a railway line nearby. Between 1948 and 1951 about 1.6 million cubic metres of rubble from bombed-out Berlin were piled over the ruins, creating the hill called Humboldthöhe.",
      funFacts: [
        "The hill is about 85 metres above sea level, one of the highest points in the north of the city.",
        "Hundreds of bats spend the winter inside the bunker, so the guided tours of its interior only run from spring to autumn.",
        "The German Alpine Club has turned the tower's outer wall into a climbing wall.",
        "There's a rose garden at the foot of the hill, and a big open-air pool on the park's western edge."
      ],
      tip: "Take the winding stairs up through the trees. The platform faces west, so it's a perfect sunset spot. Berliner Unterwelten offers paid tours inside the bunker.",
      photos: [
        { url: "images/berlin/humboldthain-2.jpg", credit: "Photo: Go Places community" },
        { url: "images/berlin/humboldthain-1.jpg", credit: "Photo: Go Places community" },
        { url: "images/berlin/humboldthain-3.jpg", credit: "Photo: Go Places community" },
        { url: "images/berlin/humboldthain-4.jpg", credit: "Photo: Go Places community" },
        { url: "images/berlin/humboldthain-5.jpg", credit: "Photo: Go Places community" },
        { url: "images/berlin/humboldthain-6.jpg", credit: "Photo: Go Places community" }
      ]
    },

    // ---------- vetted Reddit tips (r/berlinsocialclub) ----------
    {
      id: "cloud-one-upper-west",
      name: "Rooftop view at Motel One Upper West",
      emoji: "🍸",
      lat: 52.50540, lng: 13.33270, // approximate
      themes: ["sunsets", "cheap-thrills"],
      cost: "Free to go up; drinks from the bar cost extra",
      when: "Daily from 18:00 (until 01:00, 02:00 on Fri and Sat)", // VERIFY
      summary: "A hotel bar on the 10th floor with a terrace, open to everyone, not just hotel guests. Look out over the Memorial Church, the Zoo, the Tiergarten and all the way to the TV tower.",
      history: "The Upper West tower at Breitscheidplatz is one of the high-rises of the new City West, next to the old Kaiser Wilhelm Memorial Church and its bomb-damaged tower. The Cloud One bar is on the 10th floor of the Motel One inside it.",
      funFacts: [
        "A Reddit user remembered '20th floor', then 12th, then googled it: it's the 10th. It has its own lift button.",
        "From up here the broken tower of the Memorial Church, the 'hollow tooth', looks small enough to touch."
      ],
      tip: "Go just before sunset and grab a spot on the terrace. You don't have to buy much: one drink is enough to stay a while.",
      photos: []
    },
    {
      id: "oberbaumbruecke",
      name: "Sunset on Oberbaumbrücke",
      emoji: "🌇",
      lat: 52.50195, lng: 13.44575,
      themes: ["sunsets", "free-classics", "wall-history", "architecture"],
      cost: "Free",
      when: "Every evening, about 30 minutes before sunset",
      summary: "A red-brick double-deck bridge over the Spree with the U-Bahn rattling over the top. Watch the sun set over the river and the city.",
      history: "The bridge was built between 1894 and 1896 in a neo-Gothic style, with towers that make it look like a castle gate. It linked Friedrichshain and Kreuzberg until the Wall split them: from 1972 it was a pedestrian border crossing between East and West. Today it's a symbol of the reunited city.",
      funFacts: [
        "The yellow U1 runs on the upper deck, cars and people on the lower.",
        "Look east down the river to find the 'Molecule Man', a 30-metre aluminium sculpture of three figures standing in the water.",
        "The bridge is the meeting point of the Friedrichshain–Kreuzberg 'water fight', a mock battle between the two halves of the district.",
        "The Molecule Man, by the American artist Jonathan Borofsky, stands where Friedrichshain, Kreuzberg and Treptow meet: three figures that join in the middle, like the districts."
      ],
      tip: "Stand on the Friedrichshain side looking west, then walk down to the East Side Gallery.",
      around: [
        "Look east for the Molecule Man in the river (a hidden gem).",
        "Walk the East Side Gallery on the Friedrichshain side.",
        "Grab food in the Wrangelkiez on the Kreuzberg side."
      ],
      nearby: ["east-side-gallery", "holzmarkt"],
      photos: []
    },
    {
      id: "insel-der-jugend",
      name: "Insel der Jugend",
      emoji: "🏝️",
      lat: 52.48770, lng: 13.47860, // approximate
      themes: ["sunsets", "outdoors", "side-quests"],
      cost: "Free",
      when: "Summer evenings",
      summary: "A tiny island in the Spree in Treptow, reached by an old stone bridge, with a café, lawns and water all around. A local favourite for sunsets.",
      history: "The island was once called Abteiinsel (Abbey Island). It got its current name, 'Island of Youth', in East German times, when it was a youth club. Today it's run as a cultural space with a summer café, events and boat rental.", // VERIFY
      funFacts: [
        "You reach it over the Abteibrücke, which was built to look like a fortified gate.",
        "In summer you can rent boats here and paddle to the Treptower Park side."
      ],
      tip: "Combine it with a walk through Treptower Park, the Soviet Memorial and the Karpfenteich, all within 15 minutes.",
      photos: []
    },
    {
      id: "soviet-memorial-treptow",
      name: "Soviet War Memorial in Treptower Park",
      emoji: "🗿",
      lat: 52.48530, lng: 13.47210,
      themes: ["free-classics", "wall-history", "architecture"],
      cost: "Free",
      when: "Daytime",
      summary: "A huge, solemn memorial and military cemetery: a 12-metre soldier holding a child and crushing a swastika with his sword, at the end of a long avenue of stone.",
      history: "The memorial was opened in 1949 to honour the Soviet soldiers who died in the Battle of Berlin in 1945. About 7,000 of them are buried here, making it one of the largest Soviet war memorials outside the former Soviet Union. The giant statue was designed by sculptor Yevgeny Vuchetich.", // VERIFY: number of graves
      funFacts: [
        "The two huge red-granite flags at the entrance are said to be made from stone taken from Hitler's Reich Chancellery.", // VERIFY
        "The 16 stone sarcophagi along the sides stand for the 16 Soviet republics, with quotes from Stalin in Russian and German."
      ],
      tip: "Walk the whole axis from the grieving 'Mother Russia' statue to the soldier. Be respectful: it is a cemetery.",
      nearby: ["soviet-memorial-tiergarten", "karpfenteich-treptow", "insel-der-jugend"],
      photos: []
    },
    {
      id: "karpfenteich-treptow",
      name: "Kingfishers at the Karpfenteich",
      emoji: "🐦",
      lat: 52.48190, lng: 13.46900, // approximate
      themes: ["outdoors", "side-quests"],
      cost: "Free",
      when: "Early morning or evening, when it's quiet",
      summary: "A small pond hidden behind the Soviet Memorial in Treptower Park. Sit still and watch for the electric-blue flash of a kingfisher skimming the water.",
      history: "The pond was created at the end of the 19th century by garden architect Gustav Meyer as part of Treptower Park. It got its name, 'carp pond', from the fish that the local pub tenants put in it. In 1896, during the Berlin Trade Exhibition, it was also the site of Germany's first colonial exhibition, where about 100 people from German colonies were put on display, a dark chapter now explained on an information board at the pond.",
      funFacts: [
        "A Reddit user recommends it for kingfishers: they hunt small fish from branches over the water.",
        "Kingfishers are tiny, about the size of a sparrow. Listen for a high, sharp whistle as they fly by."
      ],
      tip: "Bring binoculars and pick a bench on the quieter side. Swimming and fishing aren't allowed.",
      photos: []
    },
    {
      id: "carillon-tiergarten",
      name: "Carillon in the Tiergarten",
      emoji: "🔔",
      lat: 52.51780, lng: 13.36670, // approximate
      themes: ["side-quests", "free-classics", "architecture"],
      cost: "Free concerts (tower tours after the concert €10)",
      when: "Concerts on Sunday afternoons, May to September. It also plays for five minutes every day at 12:00 and 18:00.", // VERIFY concert time
      summary: "A 42-metre black tower in the Tiergarten with 68 bells, one of the largest carillons in Europe. A musician plays it live from a keyboard at the top.",
      history: "The carillon stands next to the Haus der Kulturen der Welt and was built for Berlin's 750th anniversary in 1987. It also remembers the carillons of Potsdam's Garrison Church and Berlin's Parochial Church, both destroyed in the Second World War.", // VERIFY: 1987
      funFacts: [
        "Its 68 bells cover five and a half octaves.",
        "The player hits wooden batons with their fists and presses pedals with their feet to ring the bells.",
        "Next door, the Haus der Kulturen der Welt has a swooping roof that Berliners call the 'pregnant oyster'. It was the US gift to Berlin's 1957 building exhibition."
      ],
      tip: "Bring a picnic blanket and lie on the grass for the Sunday concert, then walk on to the Spree.",
      around: [
        "Look at the 'pregnant oyster' roof of the Haus der Kulturen der Welt.",
        "Walk to the Chancellery and the Reichstag.",
        "Cycle across the Tiergarten to the Siegessäule."
      ],
      nearby: ["spreebogen", "siegessaeule", "schloss-bellevue"],
      photos: []
    },
    {
      id: "wasserturm-prenzlauer-berg",
      name: "Water tower hill in Prenzlauer Berg",
      emoji: "🗼",
      lat: 52.53380, lng: 13.41860,
      themes: ["side-quests", "sunsets", "outdoors"],
      cost: "Free",
      when: "Late afternoon and summer evenings",
      summary: "A round brick water tower on a little hill, now flats, with a park around it where locals chill on the slopes.",
      history: "The tower, finished in 1877, is Berlin's oldest water tower, and locals call it 'Dicker Hermann' (Fat Hermann). It supplied water to the fast-growing tenement districts around it until 1952. A dark chapter: in 1933, the SA used its engine house as one of the first 'wild' concentration camps, which a memorial plaque remembers.",
      funFacts: [
        "People live inside the tower: it was converted into round apartments.",
        "An underground water reservoir under the hill sometimes opens for concerts and tours." // VERIFY
      ],
      tip: "Grab an ice cream on Kollwitzplatz nearby and climb up to the benches.",
      photos: []
    },
    {
      id: "greenwich-promenade",
      name: "Ducks and geese on the Greenwich promenade",
      emoji: "🦢",
      lat: 52.58770, lng: 13.28150, // approximate
      themes: ["outdoors", "side-quests"],
      cost: "Free",
      when: "Afternoons, all year",
      summary: "A lakeside promenade at Lake Tegel in the north-west of Berlin, with swans, ducks and geese, boat trips and a long waterfront walk.",
      history: "The promenade is named after Greenwich in London, the twin borough of Reinickendorf. From here, excursion boats leave for the Tegeler See and the Havel.", // VERIFY
      funFacts: [
        "A Reddit user says it's the place to see ducks and geese in Berlin.",
        "It's the start of the walk to Berlin's oldest tree, the Dicke Marie. See its own pin."
      ],
      tip: "Please don't feed the birds bread; bring frozen peas or oats if you must.",
      photos: []
    },
    {
      id: "dicke-marie",
      name: "Dicke Marie, Berlin's oldest tree",
      emoji: "🌳",
      lat: 52.59060, lng: 13.26550, // approximate, An der Malche
      themes: ["outdoors", "side-quests"],
      cost: "Free",
      when: "Any time, daytime",
      summary: "A pedunculate oak in the Tegel forest that is around 800 to 900 years old, older than Berlin itself.",
      history: "According to legend, the brothers Wilhelm and Alexander von Humboldt, who grew up at nearby Schloss Tegel, named the tree after their sturdily built cook. The oak is about 26 metres tall and has been protected for a long time.",
      funFacts: [
        "Berlin was first mentioned in 1237, so this tree was probably already standing when the city was founded.",
        "It's a few minutes' walk from the harbour bridge in Tegel."
      ],
      tip: "Make a loop: Greenwich promenade, over the harbour bridge, to the Dicke Marie and back along the lake.",
      photos: []
    },
    {
      id: "urbanhafen-landwehrkanal",
      name: "Landwehrkanal at Urbanhafen",
      emoji: "🛶",
      lat: 52.49580, lng: 13.41100, // approximate
      themes: ["outdoors", "sunsets"],
      cost: "Free",
      when: "Summer evenings",
      summary: "An old harbour basin on the Landwehrkanal in Kreuzberg, in front of the Am Urban hospital, where people sit on the banks and the canal is lined with willows.",
      history: "The Landwehrkanal was dug between 1845 and 1850 to plans by Peter Joseph Lenné to carry goods around the city centre. Urbanhafen was one of its harbours. Today the canal banks are one of Kreuzberg's favourite places to hang out.",
      funFacts: [
        "A Reddit user says the whole Landwehrkanal is worth walking, not just this bit.",
        "The Maybachufer, a short walk east, has a well-known Turkish market on Tuesdays and Fridays." // VERIFY market days
      ],
      tip: "Walk east along the canal to Maybachufer, then on to Kottbusser Tor and the free FHXB Museum.",
      photos: []
    },
    {
      id: "tempelhofer-feld",
      name: "Sunset on Tempelhofer Feld",
      emoji: "✈️",
      lat: 52.47300, lng: 13.40100,
      themes: ["sunsets", "outdoors", "wall-history", "free-classics", "architecture"],
      cost: "Free",
      when: "Open from sunrise to sunset. Come about an hour before closing for the sunset.", // VERIFY gate times
      summary: "A former airport turned into one of the biggest city parks in the world: walk, cycle, skate or kite-surf down the old runways, and watch the sun set over a huge open sky.",
      history: "Tempelhof was one of the world's first commercial airports. During the Berlin Airlift of 1948–49, Western planes landed here every few minutes to keep West Berlin supplied, and pilots dropped sweets for children ('raisin bombers'). The airport closed in 2008 and opened as a park in 2010. In 2014, Berliners voted in a referendum to keep the field free of buildings.",
      funFacts: [
        "The old terminal building was one of the largest buildings in the world when it was built.",
        "The runways are perfect for skating and cycling, and the wind is good for kite-skating.",
        "There are community gardens, a dog area and barbecue zones on the field.",
        "The Nazi-era terminal, by Ernst Sagebiel, curves for more than a kilometre. Guided tours show its huge hangars and the roof."
      ],
      tip: "Enter from Oderstraße on the Neukölln side, walk to the middle of the runway and face west.",
      around: [
        "Take a tour of the old terminal building on Platz der Luftbrücke.",
        "See the Airlift Memorial outside the terminal.",
        "Walk to the Viktoriapark and the Kreuzberg."
      ],
      nearby: ["viktoriapark", "hasenheide-tierpark"],
      photos: []
    },
    {
      id: "koernerpark",
      name: "Körnerpark",
      emoji: "⛲",
      lat: 52.47140, lng: 13.43960,
      themes: ["side-quests", "outdoors"],
      cost: "Free (the gallery in the orangery is free too)",
      when: "Summer afternoons; free open-air concerts on summer Sundays", // VERIFY
      summary: "A grand, sunken neo-baroque garden with fountains, a cascade and flowerbeds, hidden between apartment blocks in Neukölln. It feels like a palace garden without the palace.",
      history: "The park was built in an old gravel pit between 1912 and 1916, on land donated by Franz Körner, which is why it sits several metres below street level. Its orangery is used as a free contemporary art gallery.", // VERIFY
      funFacts: [
        "Because it lies below the streets around it, the traffic noise almost disappears.",
        "A Reddit user lists it next to Tempelhofer Feld as a sunset tip."
      ],
      tip: "Walk down the stairs at the cascade end for the best first view.",
      photos: []
    },
    {
      id: "viktoriapark",
      name: "Viktoriapark and the Kreuzberg",
      emoji: "⛰️",
      lat: 52.48780, lng: 13.38160,
      themes: ["sunsets", "outdoors", "free-classics", "architecture"],
      cost: "Free",
      when: "Summer evenings; the waterfall runs in the warmer months",
      summary: "The hill the Kreuzberg district is named after, with an artificial waterfall tumbling down it and a view north over the city from the monument on top.",
      history: "On top stands the National Monument for the Wars of Liberation, a cast-iron Gothic spire designed by Karl Friedrich Schinkel and unveiled in 1821. Its iron cross gave the hill, and later the whole district, the name Kreuzberg ('cross hill'). The park and its waterfall were laid out in the 1890s.",
      funFacts: [
        "At 66 metres, the Kreuzberg is the highest natural hill in the inner city.",
        "The waterfall is modelled on a mountain stream in the Riesengebirge."
      ],
      tip: "Sit on the steps below the monument facing north, with a drink from one of the kiosks nearby.",
      around: [
        "Walk down to the Bergmannkiez for cafés.",
        "Visit the Jewish Museum, about 20 minutes north.",
        "Continue to Tempelhofer Feld."
      ],
      nearby: ["juedisches-museum", "tempelhofer-feld"],
      photos: []
    },
    {
      id: "monbijoupark",
      name: "Open-air dancing in Monbijoupark",
      emoji: "💃",
      lat: 52.52350, lng: 13.39760,
      themes: ["side-quests", "outdoors"],
      cost: "Free, donations welcome",
      when: "Every evening, May to September, when it's dry and above 18 °C",
      summary: "A riverside park opposite Museum Island where a small open-air dance floor by the beach bar hosts salsa, swing, tango, bachata and ballroom nights all summer.",
      history: "The park is named after Monbijou Palace, a royal summer palace that stood here until it was damaged in the war and demolished in 1959. Today it's a green strip along the Spree with a beach bar and a children's paddling pool.",
      funFacts: [
        "Each night has its own style: salsa on Mondays and Thursdays, swing on Wednesdays and Fridays, bachata on Sundays, ballroom and Latin on Tuesdays and Saturdays.", // VERIFY each season
        "Beginners are welcome; there's often a short lesson at the start of the evening."
      ],
      tip: "Register at the DJ desk and drop a coin in the donation box. Then just watch, or dance.",
      photos: []
    },
    {
      id: "teufelsberg",
      name: "Teufelsberg",
      emoji: "📡",
      lat: 52.49750, lng: 13.24120,
      themes: ["sunsets", "wall-history", "outdoors", "cheap-thrills"],
      cost: "The hill and forest are free. The old listening station costs €10 (€8 reduced, €3 for ages 8–17).",
      when: "Station open daily from 11:00 until sunset",
      summary: "A rubble mountain in the Grunewald forest, topped by an abandoned American spy station with white radar domes, now covered in street art.",
      history: "After the war, about 25 million cubic metres of rubble from bombed Berlin were piled over the shell of an unfinished Nazi military college here, creating a 120-metre hill. During the Cold War, the Americans and British built a listening station on top to eavesdrop on the East. When they left in the 1990s, plans for hotels and flats came to nothing, and artists moved in.",
      funFacts: [
        "It's the second-highest point in Berlin.",
        "The inside of the largest radar dome has wild acoustics: one clap echoes for seconds.",
        "You can hike up through the forest for free and get great views from the slopes, even without going into the station."
      ],
      tip: "Take the S-Bahn to Heerstraße and walk up through the forest. Combine it with the Drachenberg next door, which is free and has an even wider view.",
      photos: []
    },
    {
      id: "philharmonie-lunch-concert",
      name: "Free lunch concerts at the Philharmonie",
      emoji: "🎻",
      lat: 52.51000, lng: 13.36990,
      themes: ["side-quests", "free-classics", "architecture"],
      cost: "Free (no reservations)",
      when: "Wednesdays at 13:00, September to June. Arrive early; entry is capped.",
      summary: "Once a week the home of the Berlin Philharmonic opens its foyer for a free 40–50 minute lunchtime concert, played by members of the orchestra and young musicians.",
      history: "The Philharmonie, with its tent-like golden roof, was designed by Hans Scharoun and opened in 1963, a stone's throw from the Wall. It was one of the first concert halls with the orchestra in the middle and the audience all around it.",
      funFacts: [
        "Berliners nicknamed the building 'Zirkus Karajani', after its tent shape and the star conductor Herbert von Karajan.",
        "You can't bring your own food, but there's a café in the foyer from noon.",
        "The golden aluminium panels on the outside were only added in the 1980s, 20 years after it opened." // VERIFY
      ],
      tip: "Sit on the stairs and balconies of the foyer: the music sounds great from everywhere.",
      around: [
        "See Mies van der Rohe's Neue Nationalgalerie next door.",
        "Walk to Potsdamer Platz and the Sony Center.",
        "Visit the Musical Instrument Museum next to the Philharmonie."
      ],
      nearby: ["neue-nationalgalerie", "potsdamer-platz"],
      photos: []
    },
    {
      id: "hasenheide-tierpark",
      name: "Free mini zoo in the Hasenheide",
      emoji: "🦙",
      lat: 52.48370, lng: 13.41700, // approximate
      themes: ["outdoors", "side-quests"],
      cost: "Free",
      when: "Daily 9:00–18:00 (until 15:30 in November and March)", // VERIFY winter hours
      summary: "A small, free animal park in the Hasenheide with goats, donkeys, llamas, fallow deer, storks and more. Kids love it, and so do the adults who come with them.",
      history: "The Hasenheide was once a royal hare-hunting ground, hence the name ('hare heath'). In 1811, Friedrich Ludwig Jahn opened Germany's first public gymnastics ground here, which is why he's known as 'Turnvater Jahn'.",
      funFacts: [
        "Two Reddit users vote for it, one of them a parent whose son loves it.",
        "The park is also known for its open-air parties in summer."
      ],
      tip: "Combine it with a walk across the Hasenheide to the rose garden, or on to Tempelhofer Feld.",
      photos: []
    },
    {
      id: "grunewaldsee",
      name: "Krumme Lanke to Grunewaldsee forest walk",
      emoji: "🐕",
      lat: 52.47460, lng: 13.26450, // approximate, at the dog beach on Grunewaldsee
      themes: ["outdoors", "side-quests"],
      cost: "Free",
      when: "Any time of year; summer for swimming",
      summary: "A forest walk past a chain of lakes from Krumme Lanke north to the Grunewaldsee, which has a dog beach where you can spend an hour watching happy dogs splash about, even without one of your own.",
      history: "The Grunewald lakes form a chain of glacial lakes through Berlin's largest forest. On the Grunewaldsee stands the Jagdschloss Grunewald, a hunting lodge from 1542 and the oldest surviving palace in Berlin.",
      funFacts: [
        "A Reddit user recommends the dog beach as pure joy to watch.",
        "Krumme Lanke and Schlachtensee nearby are popular swimming lakes in summer."
      ],
      tip: "Take the S1 to Mexikoplatz, walk to the west side of Krumme Lanke and head north through the forest.",
      photos: []
    },
    {
      id: "haus-am-waldsee",
      name: "Sculpture park at Haus am Waldsee",
      emoji: "🗿",
      lat: 52.43780, lng: 13.25260, // approximate
      themes: ["side-quests", "outdoors"],
      cost: "Free sculpture garden and grounds (exhibitions inside the villa about €9)",
      when: "Summer afternoons, during opening hours",
      summary: "A villa on a small lake in Zehlendorf with a 10,000 square-metre sculpture garden. Sit among the art with a view of the water and read.",
      history: "The villa was built in the 1920s, and in 1946 it became one of West Berlin's first places to show contemporary art after the war. It still runs exhibitions of international contemporary artists.",
      funFacts: [
        "A Reddit user recommends it as a lovely place to sit and read in summer.",
        "The café terrace looks out over the Waldsee."
      ],
      tip: "Bring a book, find a bench by the water and stay a while.",
      photos: []
    },
    {
      id: "suedwestkirchhof",
      name: "Südwestkirchhof Stahnsdorf",
      emoji: "🪦",
      lat: 52.38760, lng: 13.20930, // approximate
      themes: ["side-quests", "outdoors"],
      cost: "Free",
      when: "Daily from 7:00; closes at 17:00 in winter and 20:00 in summer",
      summary: "A huge forest cemetery just outside Berlin, with ivy-covered mausoleums, a wooden church and the graves of famous Berliners. More like a woodland walk than a graveyard.",
      history: "It was opened in 1909, when Berlin's churches ran out of space inside the city. At 206 hectares it is the second-largest cemetery in Germany (after Ohlsdorf in Hamburg). When the Wall was built, it ended up just outside West Berlin, so for decades West Berliners could only visit their graves with great difficulty.", // VERIFY
      funFacts: [
        "A Reddit user called it 'Europe's biggest cemetery'. Not quite, but it is Germany's second biggest.",
        "The artist Heinrich Zille, the film director F. W. Murnau and the actor and singer Manfred Krug are buried here.",
        "The church is a Norwegian-style wooden stave church."
      ],
      tip: "It's in Stahnsdorf, in Brandenburg: take the S-Bahn to Wannsee, then a bus. Pick up a map at the entrance; it's easy to get lost.",
      photos: []
    },
    {
      id: "horst-dohm-skating",
      name: "Summer skating at Horst-Dohm-Eisstadion",
      emoji: "🛼",
      lat: 52.47350, lng: 13.29850, // approximate, Fritz-Wildung-Straße 9
      themes: ["outdoors", "cheap-thrills"],
      cost: "Free in summer (in winter, ice skating costs €4)", // VERIFY summer offer
      when: "Summer only, roughly mid-April to mid-September, weekdays 9:00–16:00", // VERIFY
      summary: "In winter it's an open-air ice rink. In summer, while it's being looked after, a Reddit user says you can inline or roller skate on it for free: a small inner rink with railings for beginners and an outer track for speed.",
      history: "The Horst-Dohm-Eisstadion in Wilmersdorf is one of Berlin's traditional outdoor ice rinks, run by the district.",
      funFacts: [
        "The inner rink has a railing, so it's a good place to learn without crashing into people."
      ],
      tip: "Check with the district before you go: the summer opening wasn't confirmed on official pages.",
      photos: []
    },
    {
      id: "photoautomat",
      name: "Photoautomat booth at RAW",
      emoji: "📷",
      lat: 52.50750, lng: 13.45430, // approximate, Revaler Straße 99
      themes: ["side-quests", "cheap-thrills"],
      cost: "A few euros per strip (about €3–4)", // VERIFY price
      when: "Any time, day or night",
      summary: "One of Berlin's black-and-white analog photo booths: four flashes, a five-minute wait, and you have a strip of real chemical photos.",
      history: "Two friends started rescuing old photo booths from all over Europe and set them up around Berlin in the early 2000s. There are now dozens, outside bars, clubs and on busy corners, and they've become a Berlin night-out ritual.",
      funFacts: [
        "The prints are developed inside the machine with real chemicals, which is why you wait about five minutes.",
        "There are booths across Friedrichshain, Kreuzberg, Mitte and Prenzlauer Berg. Spotting them is a game in itself."
      ],
      tip: "Plan your four poses before the first flash. It's faster than you think.",
      photos: []
    },
    {
      id: "tropical-islands",
      name: "Tropical Islands (free on your birthday)",
      emoji: "🌴",
      lat: 52.03860, lng: 13.74970,
      themes: ["cheap-thrills"],
      cost: "Free on your birthday, otherwise a full-price day ticket",
      when: "Only on your actual birthday",
      summary: "An indoor tropical resort with a beach, rainforest and water slides, about an hour south of Berlin. On your birthday you get in free.",
      history: "The resort is built inside a giant hangar that was put up around 2000 for the CargoLifter company's airships. When the company went bust, the hall was turned into an indoor tropical holiday world. It is one of the largest free-standing halls in the world.",
      funFacts: [
        "Free birthday entry covers Tropical World and the outdoor AMAZONIA area. The date on your ID must match the day of your visit.",
        "Don't buy a ticket in advance for the birthday person; it only works for day guests at the door, and only while there's space."
      ],
      tip: "Bring your passport or ID. The offer can change at any time, so check tropical-islands.de before you go.",
      photos: []
    },
    // ---------- famous architecture: monuments, palaces, landmarks ----------
    {
      id: "siegessaeule",
      name: "Siegessäule (Victory Column)",
      emoji: "👼",
      lat: 52.51450, lng: 13.35010, // approximate. VERIFY on the map
      themes: ["architecture", "free-classics", "sunsets"],
      cost: "Free to see. Climbing to the platform costs a few euros.", // VERIFY price
      when: "Daytime for the climb; sunset from the top",
      summary: "A 67-metre column in the middle of the Tiergarten, crowned by a golden Victoria that Berliners call 'Goldelse'. Climb 285 steps for a view down every avenue.",
      history: "The column was built in 1864–73 to celebrate Prussia's wars against Denmark, Austria and France. It first stood in front of the Reichstag. In 1938–39 the Nazis moved it to the Großer Stern roundabout and made it taller as part of their plans for a new capital.",
      funFacts: [
        "Victoria alone is about 8 metres tall and weighs 35 tonnes.",
        "The column's rings are decorated with gilded cannon barrels captured in the wars.",
        "In Wim Wenders' film 'Wings of Desire', angels sit on Victoria's shoulders looking down on Berlin."
      ],
      tip: "Use the tunnels under the roundabout to get there safely, then climb at the end of the day for golden light down the Straße des 17. Juni.",
      around: [
        "Walk the Straße des 17. Juni east to the Brandenburg Gate (about 25 minutes).",
        "Visit Schloss Bellevue, the President's palace, at the edge of the park.",
        "Get lost in the Tiergarten's paths and find the carillon tower."
      ],
      nearby: ["schloss-bellevue", "brandenburger-tor", "carillon-tiergarten", "soviet-memorial-tiergarten"],
      photos: []
    },
    {
      id: "schloss-bellevue",
      name: "Schloss Bellevue",
      emoji: "🏛️",
      lat: 52.51770, lng: 13.35330, // approximate. VERIFY on the map
      themes: ["architecture"],
      cost: "Free to see from outside",
      when: "Any time. Open to the public only on rare open days.", // VERIFY
      summary: "A white palace on the Spree at the edge of the Tiergarten, the official home of the German President.",
      history: "Bellevue was built in 1786 for Prince Augustus Ferdinand of Prussia, the youngest brother of Frederick the Great. It was the first neoclassical palace in Germany. Since 1994 it has been the first official seat of the Federal President.",
      funFacts: [
        "When the President's flag flies on the roof, they're in Berlin.",
        "Its name means 'beautiful view', after the view over the Spree.",
        "The President's offices are in an oval modern building in the park behind, nicknamed the 'presidential egg'."
      ],
      tip: "See it from the gate on Spreeweg, then walk along the Spree to the government quarter.",
      around: [
        "Climb the Siegessäule nearby.",
        "Walk along the Spree to the Haus der Kulturen der Welt and the Chancellery.",
        "Wander the English Garden in the Tiergarten behind the palace."
      ],
      nearby: ["siegessaeule", "carillon-tiergarten", "spreebogen"],
      photos: []
    },
    {
      id: "soviet-memorial-tiergarten",
      name: "Soviet War Memorial in the Tiergarten",
      emoji: "🎖️",
      lat: 52.51640, lng: 13.37170, // approximate. VERIFY on the map
      themes: ["architecture", "wall-history"],
      cost: "Free",
      when: "Any time",
      summary: "A curved colonnade with a bronze Soviet soldier on top, flanked by two tanks, a few steps from the Reichstag.",
      history: "The Soviet Army built the memorial in 1945, only months after the war ended, for the soldiers who died in the Battle of Berlin. About 2,000 of them are buried behind it. It stood in the British sector, so during the Cold War Soviet soldiers crossed into West Berlin every day to guard it.",
      funFacts: [
        "The two tanks are T-34s, said to be among the first to reach Berlin.",
        "It was the first of Berlin's three big Soviet memorials.",
        "The marble is said to come from Hitler's destroyed Reich Chancellery." // VERIFY
      ],
      tip: "Combine it with the Reichstag and the Brandenburg Gate: all three are within five minutes.",
      around: [
        "Walk to the Brandenburg Gate and the Reichstag.",
        "Stroll into the Tiergarten towards the Siegessäule.",
        "See the bigger Soviet memorial in Treptower Park another day."
      ],
      nearby: ["reichstag-dome", "brandenburger-tor", "soviet-memorial-treptow"],
      photos: []
    },
    {
      id: "holocaust-memorial",
      name: "Memorial to the Murdered Jews of Europe",
      emoji: "🕯️",
      lat: 52.51390, lng: 13.37870, // approximate. VERIFY on the map
      themes: ["architecture", "free-classics"],
      cost: "Free (field and information centre)",
      when: "Field always open. Information centre Tuesday to Sunday.", // VERIFY
      summary: "A field of 2,711 grey concrete blocks of different heights on a sloping ground, right next to the Brandenburg Gate. Walk into it and the city disappears.",
      history: "The American architect Peter Eisenman designed the memorial, which opened in 2005, 60 years after the end of the Second World War. It remembers the six million Jews murdered in the Holocaust. Under the field, a free information centre tells the stories of individual victims and families.",
      funFacts: [
        "The blocks (stelae) range from ground level to almost 5 metres high.",
        "The field covers about 19,000 square metres, the size of nearly three football pitches.",
        "Eisenman left the meaning open on purpose: there's no single 'right' way to walk through it."
      ],
      tip: "Walk into the middle, where the blocks are tallest and the ground dips. Please don't climb or jump on them.",
      around: [
        "Visit the free information centre underneath.",
        "Walk to the Brandenburg Gate (two minutes) and the Tiergarten.",
        "Find the memorials to the persecuted homosexuals and the murdered Sinti and Roma across the road, in the Tiergarten."
      ],
      nearby: ["brandenburger-tor", "potsdamer-platz", "reichstag-dome"],
      photos: []
    },
    {
      id: "unter-den-linden",
      name: "Unter den Linden and Frederick the Great",
      emoji: "🐎",
      lat: 52.51720, lng: 13.39410, // approximate, at the equestrian statue. VERIFY on the map
      themes: ["architecture", "free-classics"],
      cost: "Free",
      when: "Any time",
      summary: "Berlin's grandest boulevard, running from the Brandenburg Gate to Museum Island, with 'Old Fritz' on horseback in the middle.",
      history: "The avenue began in 1647 as a riding path lined with linden trees, leading from the palace to the hunting grounds of the Tiergarten. Kings lined it with palaces, the opera and the university. Christian Daniel Rauch's statue of Frederick the Great was unveiled in 1851. East Germany moved it to Potsdam, then brought it back in 1980.",
      funFacts: [
        "'Unter den Linden' means 'under the linden trees'.",
        "Around the statue's base stand Frederick's generals, and philosophers like Kant and Lessing, under the horse's tail.",
        "Einstein taught at the Humboldt University just across the road."
      ],
      tip: "Walk the whole avenue from the Brandenburg Gate to the Lustgarten: it takes about 25 minutes.",
      around: [
        "Browse the second-hand book stalls outside the Humboldt University.",
        "Cross to Bebelplatz for the sunken library memorial.",
        "Continue to Museum Island and the Berliner Dom."
      ],
      nearby: ["bebelplatz", "neue-wache", "zeughaus", "brandenburger-tor"],
      photos: []
    },
    {
      id: "bebelplatz",
      name: "Bebelplatz and the State Opera",
      emoji: "📖",
      lat: 52.51650, lng: 13.39380, // approximate, at the sunken library. VERIFY on the map
      themes: ["architecture", "free-classics"],
      cost: "Free",
      when: "Any time; the sunken library is easier to see after dark when it's lit",
      summary: "A wide square framed by the State Opera, a round domed cathedral and the old royal library. A glass plate in the ground shows an empty library underneath.",
      history: "On 10 May 1933, Nazi students burned about 20,000 books by Jewish, left-wing and other 'un-German' authors here. In 1995 Micha Ullman placed his memorial 'Library' under the square: a room of empty white shelves with space for just as many books. The State Opera on the square was opened by Frederick the Great in 1742.",
      funFacts: [
        "A plaque quotes Heinrich Heine, from 1820: 'Where they burn books, they will in the end burn people too.'",
        "The curved old library building is nicknamed the 'Kommode' (chest of drawers).",
        "St. Hedwig's Cathedral in the corner is modelled on the Pantheon in Rome."
      ],
      tip: "Look down through the glass at night, when the empty shelves glow white.",
      around: [
        "Look into St. Hedwig's Cathedral, the round church in the corner.",
        "See the Staatsoper's restored rococo front.",
        "Walk to the Gendarmenmarkt in five minutes."
      ],
      nearby: ["unter-den-linden", "gendarmenmarkt", "neue-wache"],
      photos: []
    },
    {
      id: "neue-wache",
      name: "Neue Wache",
      emoji: "🕊️",
      lat: 52.51800, lng: 13.39500, // approximate. VERIFY on the map
      themes: ["architecture"],
      cost: "Free",
      when: "Daily, daytime",
      summary: "A small Greek-temple guardhouse on Unter den Linden. Inside, one sculpture of a mother holding her dead son sits under an open hole in the roof.",
      history: "Karl Friedrich Schinkel built the 'New Guardhouse' in 1816–18 for the King's guard. It has been a war memorial since 1931, and since 1993 it is Germany's central memorial to the victims of war and tyranny. The sculpture is an enlarged copy of Käthe Kollwitz's 'Mother with her Dead Son'.",
      funFacts: [
        "The round opening in the roof is open to the sky, so rain and snow fall on the sculpture.",
        "Käthe Kollwitz lost her own son in the First World War.",
        "It was Schinkel's first major building in Berlin."
      ],
      tip: "Go in, stand still for a minute. It's one of the quietest places in central Berlin.",
      around: [
        "Visit the Zeughaus and the German Historical Museum next door.",
        "Rest in the little chestnut grove behind it.",
        "Walk on to Museum Island."
      ],
      nearby: ["zeughaus", "unter-den-linden", "museumsinsel"],
      photos: []
    },
    {
      id: "zeughaus",
      name: "Zeughaus (German Historical Museum)",
      emoji: "🗡️",
      lat: 52.51790, lng: 13.39690, // approximate. VERIFY on the map
      themes: ["architecture"],
      cost: "Free to see. Check what's open inside; the permanent exhibition is being renewed.", // VERIFY
      when: "Daily, daytime",
      summary: "The oldest building on Unter den Linden: a pink Baroque arsenal, now the German Historical Museum, with a glass spiral by I. M. Pei behind it.",
      history: "The Zeughaus was built between 1695 and 1730 to store the Prussian army's weapons. Today it's the German Historical Museum. In 2003 the architect I. M. Pei, famous for the Louvre pyramid, added a new exhibition hall with a glass staircase tower.",
      funFacts: [
        "In the courtyard, Andreas Schlüter carved 22 masks of dying warriors above the windows.",
        "The roof is lined with sculptures of weapons and armour.",
        "Pei's glass spiral is one of the best photo spots in Mitte."
      ],
      tip: "Walk around the back to see the Pei building's glass spiral.",
      around: [
        "Look at the Neue Wache next door.",
        "Cross the Schlossbrücke to Museum Island and the Lustgarten.",
        "Visit the Humboldt Forum opposite."
      ],
      nearby: ["neue-wache", "museumsinsel", "humboldt-forum-free"],
      photos: []
    },
    {
      id: "gendarmenmarkt",
      name: "Gendarmenmarkt",
      emoji: "🎼",
      lat: 52.51370, lng: 13.39270, // approximate. VERIFY on the map
      themes: ["architecture", "free-classics"],
      cost: "Free. The German Cathedral's exhibition on parliamentary history is free too.", // VERIFY
      when: "Any time; the Christmas market here is famous",
      summary: "Often called Berlin's most beautiful square: Schinkel's Konzerthaus between two matching domed churches.",
      history: "The square is named after the Gens d'Armes, a Prussian cavalry regiment that had its stables here. The French Church was built for the Huguenots, Protestant refugees from France, in 1701–05, and the German Church soon after. In the 1780s Frederick the Great added the two identical domed towers. Schinkel's theatre, now the Konzerthaus, opened in 1821.",
      funFacts: [
        "The two big domes aren't part of the churches: they're decorative towers added later.",
        "Around 1700, about one in five Berliners was a French Huguenot.", // VERIFY
        "A statue of the poet Friedrich Schiller stands in front of the Konzerthaus."
      ],
      tip: "Sit on the Konzerthaus steps and look from one dome to the other.",
      around: [
        "Climb the French Dome for a view of the square.", // VERIFY: open
        "Visit the free exhibition in the German Cathedral.",
        "Walk to Bebelplatz and Unter den Linden in five minutes."
      ],
      nearby: ["bebelplatz", "checkpoint-charlie", "unter-den-linden"],
      photos: []
    },
    {
      id: "berliner-dom",
      name: "Berliner Dom",
      emoji: "⛪",
      lat: 52.51910, lng: 13.40100, // approximate. VERIFY on the map
      themes: ["architecture", "free-classics"],
      cost: "Free to see. Inside and the dome walk cost about €10.", // VERIFY price
      when: "Daytime; the dome walk is great on clear days",
      summary: "Berlin's biggest church, with a green copper dome, on Museum Island. Climb 270 steps to walk around the outside of the dome.",
      history: "Kaiser Wilhelm II had the cathedral built in 1894–1905 as the main church of the Protestant Hohenzollern rulers, to rival St. Peter's in Rome. It was badly damaged in the war, and the restoration took until 1993. In the crypt lie nearly 100 members of the Hohenzollern family.",
      funFacts: [
        "Despite the name, it's not technically a cathedral: it has never had a bishop.",
        "Its organ, by Wilhelm Sauer, has more than 7,000 pipes.",
        "From the dome walk you can see the TV tower, the Humboldt Forum and the Reichstag."
      ],
      tip: "See it from the Lustgarten lawn first, then from the Spree bank behind it.",
      around: [
        "Sit on the Lustgarten lawn in front of the Altes Museum.",
        "Cross to the Humboldt Forum's free courtyards.",
        "Take a boat tour from the landing on the Spree right next to it."
      ],
      nearby: ["museumsinsel", "humboldt-forum-free", "fernsehturm", "ebertbruecke-view"],
      photos: []
    },
    {
      id: "museumsinsel",
      name: "Museum Island and the Lustgarten",
      emoji: "🏛️",
      lat: 52.51950, lng: 13.39850, // approximate, at the Altes Museum. VERIFY on the map
      themes: ["architecture", "free-classics"],
      cost: "Island and colonnades free. Museums need tickets; many are free on the first Sunday of the month.", // VERIFY
      when: "Any time; first Sundays for free museum entry",
      summary: "An island in the Spree with five world-famous museums built over a hundred years, now a UNESCO World Heritage Site.",
      history: "It started with Schinkel's Altes Museum, opened in 1830 as one of the first public museums in Germany. The Neues Museum, the Alte Nationalgalerie, the Bode-Museum and the Pergamonmuseum followed until 1930. The Neues Museum, a ruin for 60 years, was rebuilt by David Chipperfield and reopened in 2009.",
      funFacts: [
        "The bust of Nefertiti is in the Neues Museum.",
        "The huge granite bowl in front of the Altes Museum was carved from a single boulder.",
        "The James-Simon-Galerie, the island's new entrance building from 2019, is free to walk through and has a terrace."
      ],
      tip: "Walk the colonnades between the Neues Museum and the Alte Nationalgalerie, then sit on the steps of the Altes Museum.",
      around: [
        "Look for war bullet holes in the colonnade columns (a hidden gem).",
        "Watch the street musicians under the Monbijou bridge.",
        "Join the free first-Sunday museum day."
      ],
      nearby: ["berliner-dom", "ebertbruecke-view", "zeughaus", "monbijoupark"],
      photos: []
    },
    {
      id: "fernsehturm",
      name: "Fernsehturm (TV Tower)",
      emoji: "🗼",
      lat: 52.52080, lng: 13.40940, // approximate. VERIFY on the map
      themes: ["architecture", "free-classics"],
      cost: "Free to see. The viewing floor costs around €25.", // VERIFY price
      when: "Any time; at night the sphere is lit",
      summary: "At 368 metres, the tallest structure in Germany: a concrete needle with a silver ball, visible from almost everywhere in Berlin.",
      history: "East Germany built the tower in 1965–69 to show off socialist technology, right in the middle of East Berlin. It was meant to be seen from the West too. Today it's the symbol of the whole city.",
      funFacts: [
        "When the sun shines on the steel ball, a cross of light appears. Berliners called it 'the Pope's revenge' on atheist East Germany.",
        "The viewing floor is at 203 metres, and the restaurant above it turns around once an hour.",
        "On a clear day you can see up to 80 kilometres." // VERIFY
      ],
      tip: "The best free views of it are from the Neptune Fountain and from under the tower's tent-shaped base.",
      around: [
        "See the Neptune Fountain, the Red Town Hall and St. Mary's Church right below.",
        "Meet at the World Time Clock on Alexanderplatz.",
        "Walk to Hackescher Markt in ten minutes."
      ],
      nearby: ["neptunbrunnen", "marienkirche", "weltzeituhr", "rotes-rathaus"],
      photos: []
    },
    {
      id: "rotes-rathaus",
      name: "Rotes Rathaus",
      emoji: "🧱",
      lat: 52.51850, lng: 13.40780, // approximate. VERIFY on the map
      themes: ["architecture"],
      cost: "Free",
      when: "Weekdays you can usually look into the entrance hall", // VERIFY
      summary: "Berlin's red-brick town hall with a 74-metre tower, home of the Governing Mayor.",
      history: "The Red Town Hall was built in 1861–69 by Hermann Friedrich Waesemann. It's named after its red bricks, not its politics, though that joke was popular in East Germany, when it was East Berlin's town hall. Since reunification it's the seat of the whole city's government.",
      funFacts: [
        "A band of 36 terracotta panels runs around the first floor, telling Berlin's history in pictures.",
        "West Berlin was run from Rathaus Schöneberg, where Kennedy said 'Ich bin ein Berliner'."
      ],
      tip: "Walk around the building to read the 'stone chronicle' panels.",
      around: [
        "Cross to the Neptune Fountain and the TV tower.",
        "Explore the Nikolaiviertel just south.",
        "Walk to the Spree and the Humboldt Forum."
      ],
      nearby: ["neptunbrunnen", "nikolaiviertel", "fernsehturm"],
      photos: []
    },
    {
      id: "neptunbrunnen",
      name: "Neptunbrunnen",
      emoji: "🔱",
      lat: 52.51930, lng: 13.40630, // approximate. VERIFY on the map
      themes: ["architecture", "side-quests"],
      cost: "Free",
      when: "Spring to autumn, when the water is on",
      summary: "A huge bronze fountain with the sea god Neptune in the middle and four women around him, under the TV tower.",
      history: "Reinhold Begas made the fountain in 1891 for the square in front of the royal palace. After the palace was demolished, East Germany moved it here in 1969.",
      funFacts: [
        "The four women stand for Prussia's great rivers: the Rhine, the Elbe, the Oder and the Vistula.",
        "Berliners nicknamed it 'Forkenbecken' (pitchfork basin), after Neptune's trident.",
        "There are long-running plans to move it back to the Humboldt Forum."
      ],
      tip: "Stand behind Neptune for the classic photo with the TV tower above.",
      around: [
        "Visit St. Mary's Church right next to it.",
        "Look at the Red Town Hall across the road.",
        "Go up the TV tower."
      ],
      nearby: ["fernsehturm", "marienkirche", "rotes-rathaus"],
      photos: []
    },
    {
      id: "marienkirche",
      name: "St. Mary's Church (Marienkirche)",
      emoji: "⛪",
      lat: 52.52070, lng: 13.40640, // approximate. VERIFY on the map
      themes: ["architecture", "side-quests"],
      cost: "Free",
      when: "Daytime",
      summary: "A medieval brick church that looks tiny under the TV tower, with a centuries-old 'Dance of Death' painted inside.",
      history: "St. Mary's dates back to the 13th century and is one of the oldest churches in Berlin still used for services. Its tower was added later, and the spire in 1790. Inside, the 'Dance of Death' fresco from around 1485 was rediscovered under whitewash in 1860.",
      funFacts: [
        "The fresco is about 22 metres long and shows Death dancing with people of every rank.",
        "It was probably painted after a plague in 1484.",
        "Its pulpit is by Andreas Schlüter, who also carved the warrior masks in the Zeughaus."
      ],
      tip: "The fresco is under the tower at the entrance; look for it before going in.",
      around: [
        "Go up the TV tower next door.",
        "See the Neptune Fountain.",
        "Walk to Hackescher Markt."
      ],
      nearby: ["fernsehturm", "neptunbrunnen", "hackesche-hoefe"],
      photos: []
    },
    {
      id: "nikolaiviertel",
      name: "Nikolaiviertel",
      emoji: "🏘️",
      lat: 52.51690, lng: 13.40720, // approximate, at the Nikolaikirche. VERIFY on the map
      themes: ["architecture", "side-quests"],
      cost: "Free to wander. The Nikolaikirche museum costs a few euros.", // VERIFY
      when: "Any time",
      summary: "Berlin's oldest quarter, with cobbled lanes and a twin-spired church, rebuilt by East Germany in the 1980s to look old.",
      history: "Berlin began here around 1200. The Nikolaikirche, from about 1230, is the oldest church in the city. The quarter was flattened in the war. For Berlin's 750th birthday in 1987, East Germany rebuilt it as an 'old town', partly from prefabricated concrete slabs dressed up with historic facades.",
      funFacts: [
        "Some of the 'old' houses are concrete panel buildings in disguise.",
        "The pub 'Zum Nussbaum' is a copy of what was said to be Berlin's oldest inn.",
        "A statue of St. George slaying the dragon stands by the river."
      ],
      tip: "Walk down to the riverside promenade for a view across to the Humboldt Forum.",
      around: [
        "Visit the Ephraim-Palais, a rebuilt rococo townhouse.",
        "Walk to the Red Town Hall and the TV tower.",
        "Cross to the Humboldt Forum's free courtyards."
      ],
      nearby: ["rotes-rathaus", "humboldt-forum-free", "berliner-dom"],
      photos: []
    },
    {
      id: "weltzeituhr",
      name: "World Time Clock at Alexanderplatz",
      emoji: "🕰️",
      lat: 52.52130, lng: 13.41320, // approximate. VERIFY on the map
      themes: ["architecture", "side-quests"],
      cost: "Free",
      when: "Any time",
      summary: "A tall, round clock showing the time in 148 cities around the world, with a model of the solar system turning on top. Berlin's classic meeting point.",
      history: "Erich John designed the clock for the 1969 redesign of Alexanderplatz. In East Germany, where people couldn't travel freely, it showed the time in places most of them could never visit.",
      funFacts: [
        "The cylinder shows all 24 time zones with the names of cities in each.",
        "On top, metal planets circle a sun.",
        "'Meet at the World Clock' has been the Berlin meeting point for over 50 years."
      ],
      tip: "Find your home city's name on the cylinder.",
      around: [
        "Go up the TV tower.",
        "Look at the Haus des Lehrers' socialist mural band on the corner.",
        "Head down Karl-Marx-Allee to the east."
      ],
      nearby: ["fernsehturm", "karl-marx-allee", "marienkirche"],
      photos: []
    },
    {
      id: "hackesche-hoefe",
      name: "Hackesche Höfe",
      emoji: "🌿",
      lat: 52.52430, lng: 13.40230, // approximate. VERIFY on the map
      themes: ["architecture", "side-quests"],
      cost: "Free",
      when: "Daytime; quiet in the morning",
      summary: "Eight linked courtyards from 1906, the first one covered in colourful Art Nouveau tiles, full of small shops, cafés and a cinema.",
      history: "The Hackesche Höfe were built in 1906–07 as a mix of flats, workshops and shops, the largest complex of courtyards of its kind in Germany. August Endell designed the glazed tile facades in the first courtyard. After decades of decay in East Germany, they were restored in the 1990s.",
      funFacts: [
        "People still live in the upper floors.",
        "Next door, Haus Schwarzenberg's alley is covered in street art and hides a small free museum about Otto Weidt, who saved Jewish workers.",
        "The area around is named after Hackescher Markt, after an 18th-century city commander."
      ],
      tip: "Walk all the way through to the last courtyard, then out the back and into Haus Schwarzenberg.",
      around: [
        "See the street art in Haus Schwarzenberg next door.",
        "Visit the free Otto Weidt workshop museum.",
        "Dance in Monbijoupark on summer evenings."
      ],
      nearby: ["monbijoupark", "marienkirche", "museumsinsel"],
      photos: []
    },
    {
      id: "gedaechtniskirche",
      name: "Kaiser Wilhelm Memorial Church",
      emoji: "⛪",
      lat: 52.50480, lng: 13.33500, // approximate. VERIFY on the map
      themes: ["architecture", "free-classics", "wall-history"],
      cost: "Free",
      when: "Daily; the new church glows blue after dark",
      summary: "A bombed church tower kept as a ruin, next to a modern church made of blue glass bricks, on Breitscheidplatz in the West.",
      history: "The church was built in 1891–95 for Kaiser Wilhelm I. A bombing raid in 1943 destroyed most of it. The broken tower, nicknamed the 'hollow tooth', was kept as a reminder of war. Next to it, Egon Eiermann built a new church in 1959–63.",
      funFacts: [
        "The new church's walls are made of more than 20,000 small panes of blue glass.",
        "The memorial hall in the old tower shows mosaics and photos of the church before the war.",
        "A golden crack in the ground outside remembers the 2016 Christmas market attack."
      ],
      tip: "Go inside the new church: from the inside, the whole room glows deep blue.",
      around: [
        "Walk along Kurfürstendamm for window shopping.",
        "Visit the KaDeWe department store's food hall.",
        "Go to the Zoo or the Tiergarten nearby."
      ],
      nearby: ["cloud-one-upper-west", "siegessaeule"],
      photos: []
    },
    {
      id: "schloss-charlottenburg",
      name: "Schloss Charlottenburg",
      emoji: "👑",
      lat: 52.52080, lng: 13.29590, // approximate. VERIFY on the map
      themes: ["architecture", "free-classics", "outdoors"],
      cost: "Palace gardens free. Palace rooms cost extra.", // VERIFY
      when: "Gardens open daily until dusk",
      summary: "Berlin's biggest palace, a long Baroque front under a green dome, with a huge free garden behind it.",
      history: "The palace was built from 1695 as a summer house for Sophie Charlotte, wife of Elector Friedrich III, who later became the first King in Prussia. After her death in 1705 it was named Charlottenburg after her, and it grew wing by wing over the next century.",
      funFacts: [
        "The golden figure on top of the dome is Fortuna, and she turns with the wind.",
        "In the gardens is a mausoleum of Queen Luise, one of Prussia's best-loved queens.",
        "The Baroque garden turns into a wild English park towards the Spree."
      ],
      tip: "Walk straight through the formal garden to the carp pond and the Belvedere tea house.",
      around: [
        "See the Mausoleum and the Belvedere in the palace park.",
        "Walk to Lietzenseepark, about 20 minutes south.",
        "Visit the Bröhan and Berggruen museums opposite the palace."
      ],
      nearby: ["lietzenseepark"],
      photos: []
    },
    {
      id: "checkpoint-charlie",
      name: "Checkpoint Charlie",
      emoji: "🛂",
      lat: 52.50750, lng: 13.39040, // approximate. VERIFY on the map
      themes: ["wall-history", "free-classics", "architecture"],
      cost: "Free",
      when: "Early morning, before the crowds",
      summary: "The most famous crossing point in the Berlin Wall, with a copy of the Allied guardhouse and the 'You are leaving the American sector' sign.",
      history: "From 1961 to 1990, Checkpoint Charlie was the crossing for foreigners, diplomats and Allied soldiers between the American sector and East Berlin. In October 1961, American and Soviet tanks faced each other here for about 16 hours: one of the tensest moments of the Cold War.",
      funFacts: [
        "'Charlie' is just the letter C in the military alphabet: after Alpha (Helmstedt) and Bravo (Dreilinden).",
        "The guardhouse here is a copy. The original is in the Allied Museum.",
        "Two large photos of a US and a Soviet soldier hang on the sign post, looking into each other's sectors."
      ],
      tip: "Look for the double row of cobblestones in the road nearby: it marks where the Wall stood.",
      around: [
        "Follow the Wall cobblestones (a hidden gem) towards Potsdamer Platz.",
        "Visit the free open-air exhibition on the Wall along Friedrichstraße.",
        "Walk to the Gendarmenmarkt in ten minutes."
      ],
      nearby: ["gendarmenmarkt", "potsdamer-platz", "juedisches-museum"],
      photos: []
    },
    {
      id: "potsdamer-platz",
      name: "Potsdamer Platz and the Sony Center",
      emoji: "🏙️",
      lat: 52.50960, lng: 13.37600, // approximate. VERIFY on the map
      themes: ["architecture", "wall-history"],
      cost: "Free. The Panoramapunkt viewing deck costs extra.", // VERIFY
      when: "Any time; the Sony Center roof is lit up at night",
      summary: "A cluster of glass towers on what was once the death strip of the Wall, with the tent-roofed Sony Center as its centrepiece.",
      history: "In the 1920s Potsdamer Platz was one of the busiest squares in Europe. The war flattened it, and the Wall turned it into an empty no-man's-land. After 1990 it became Europe's biggest building site, with towers by Renzo Piano, Helmut Jahn and Hans Kollhoff.",
      funFacts: [
        "A copy of Germany's first traffic light tower, from 1924, stands on the square.",
        "Helmut Jahn's Sony Center roof is shaped like a tent, or a volcano.",
        "Original segments of the Wall stand outside the station entrance."
      ],
      tip: "Walk into the Sony Center plaza after dark, when the roof changes colour.",
      around: [
        "See the Wall segments outside the station.",
        "Go to the free lunch concert at the Philharmonie on Wednesdays.",
        "Walk to the Holocaust Memorial and the Brandenburg Gate."
      ],
      nearby: ["philharmonie-lunch-concert", "neue-nationalgalerie", "holocaust-memorial", "checkpoint-charlie"],
      photos: []
    },
    {
      id: "neue-nationalgalerie",
      name: "Neue Nationalgalerie",
      emoji: "🖼️",
      lat: 52.50700, lng: 13.36760, // approximate. VERIFY on the map
      themes: ["architecture"],
      cost: "Free to see; museum tickets extra", // VERIFY
      when: "Tuesday to Sunday",
      summary: "A glass hall under a floating black steel roof: Mies van der Rohe's last building, and an icon of modern architecture.",
      history: "Ludwig Mies van der Rohe, the last director of the Bauhaus, designed the museum for 20th-century art. It opened in 1968, a year before he died. After a renovation by David Chipperfield, it reopened in 2021.",
      funFacts: [
        "The steel roof, about 65 by 65 metres, was lifted into place in one piece in 1967.",
        "The roof rests on just eight steel columns.",
        "The paintings are mostly in the basement: the glass hall upstairs is almost empty on purpose."
      ],
      tip: "Walk around the terrace outside; the reflections in the glass are the best photo.",
      around: [
        "See the Philharmonie and the Kulturforum next door.",
        "Walk along the Landwehrkanal.",
        "Head to Potsdamer Platz."
      ],
      nearby: ["philharmonie-lunch-concert", "potsdamer-platz"],
      photos: []
    },
    {
      id: "juedisches-museum",
      name: "Jewish Museum Berlin",
      emoji: "⚡",
      lat: 52.50190, lng: 13.39500, // approximate. VERIFY on the map
      themes: ["architecture"],
      cost: "Free core exhibition (book a time slot)", // VERIFY
      when: "Daily",
      summary: "Daniel Libeskind's zigzag building wrapped in zinc, with sharp slits for windows and empty 'voids' running through it.",
      history: "The museum opened in 2001. Libeskind designed it as a broken Star of David, with axes standing for exile, the Holocaust and continuity. You enter through the old Baroque court building next door and go down underground.",
      funFacts: [
        "In one void, the floor is covered with 10,000 iron faces by Menashe Kadishman. Walking over them makes them clang.",
        "The Garden of Exile has 49 tall concrete columns on a tilted floor, so you feel off balance.",
        "The Holocaust Tower is an unheated, almost dark concrete space with one slit of light."
      ],
      tip: "Go to the Garden of Exile: the tilted ground makes the feeling of the building physical.",
      around: [
        "Visit Checkpoint Charlie, ten minutes north.",
        "Wander to the Viktoriapark and the Kreuzberg.",
        "Explore the Bergmannkiez's cafés."
      ],
      nearby: ["checkpoint-charlie", "viktoriapark"],
      photos: []
    },
    {
      id: "karl-marx-allee",
      name: "Karl-Marx-Allee",
      emoji: "🏢",
      lat: 52.51750, lng: 13.43200, // approximate, near Café Sibylle. VERIFY on the map
      themes: ["architecture", "wall-history"],
      cost: "Free",
      when: "Any time; golden afternoon light on the tiles",
      summary: "East Germany's grand boulevard: two kilometres of 'wedding cake' apartment palaces, tiled and decorated, with domed towers at each end.",
      history: "Built from 1952 as 'Stalinallee', the avenue was East Berlin's showpiece: 'palaces for workers'. On 16 and 17 June 1953, the construction workers here went on strike, starting the uprising across East Germany that Soviet tanks crushed. The street got its current name in 1961.",
      funFacts: [
        "The twin domed towers at Frankfurter Tor are a nod to the domes on the Gendarmenmarkt.",
        "Many facades are covered in Meissen ceramic tiles.",
        "Café Sibylle has a small free exhibition about the street's history." // VERIFY
      ],
      tip: "Walk from Strausberger Platz to Frankfurter Tor: it takes about 25 minutes and the scale is the point.",
      around: [
        "Stop at Café Sibylle for coffee and the history corner.",
        "Look at the Kino International, a 1960s cinema.",
        "Continue south to the East Side Gallery."
      ],
      nearby: ["weltzeituhr", "east-side-gallery"],
      photos: []
    },
    {
      id: "funkturm",
      name: "Funkturm",
      emoji: "📡",
      lat: 52.50500, lng: 13.27870, // approximate. VERIFY on the map
      themes: ["architecture", "side-quests"],
      cost: "Free to see. Check whether the viewing platform is open.", // VERIFY
      when: "Any time",
      summary: "A 150-metre steel lattice radio tower at the trade fair grounds, nicknamed Berlin's 'little Eiffel Tower'.",
      history: "The radio tower was built for the 1926 radio exhibition. In 1935 the world's first regular TV programme was broadcast from Berlin with its help. Next to it, the ICC congress centre is a huge silver building from 1979.",
      funFacts: [
        "It has a restaurant at about 55 metres and a viewing platform at about 125 metres.", // VERIFY
        "Locals call it the 'Langer Lulatsch' (lanky beanpole)."
      ],
      tip: "See it from the Lietzensee park, where it peeks over the trees.",
      around: [
        "Walk to Lietzenseepark.",
        "See the silver ICC congress centre.",
        "Visit Schloss Charlottenburg."
      ],
      nearby: ["lietzenseepark", "schloss-charlottenburg"],
      photos: []
    },
    {
      id: "olympiastadion-berlin",
      name: "Olympiastadion Berlin",
      emoji: "🏟️",
      lat: 52.51470, lng: 13.23950, // approximate. VERIFY on the map
      themes: ["architecture", "wall-history"],
      cost: "Small fee to visit on non-event days", // VERIFY
      when: "Daytime, when there's no match",
      summary: "The stadium of the 1936 Olympics: a massive stone ring sunk into the ground, with a blue running track and a bell tower nearby.",
      history: "Werner March built the stadium for the 1936 Olympics, which the Nazis used for propaganda. Jesse Owens, a Black American athlete, won four gold medals here. The stadium was renovated for the 2006 World Cup, where the final was played.",
      funFacts: [
        "The running track is blue, the colour of the home club, Hertha BSC.",
        "Half of the stadium lies below ground level, so it looks smaller from outside.",
        "The 77-metre bell tower next to it has a viewing platform." // VERIFY
      ],
      tip: "Climb the bell tower for a view over the stadium and west to the Grunewald.",
      around: [
        "Climb the Glockenturm bell tower.",
        "Visit the Waldbühne open-air stage nearby.",
        "Head to Teufelsberg on a longer walk."
      ],
      nearby: ["teufelsberg"],
      photos: []
    },
    {
      id: "hauptbahnhof",
      name: "Berlin Hauptbahnhof",
      emoji: "🚆",
      lat: 52.52510, lng: 13.36940, // approximate. VERIFY on the map
      themes: ["architecture", "side-quests"],
      cost: "Free",
      when: "Any time",
      summary: "A glass cathedral of a station where trains run on two levels, one crossing over the other.",
      history: "The station, by the architects von Gerkan, Marg and Partners, opened in 2006 on the site of the old Lehrter Bahnhof, by the former Wall. It's Europe's largest crossing station: east–west trains run high up under the glass roof, north–south trains deep underground.",
      funFacts: [
        "The glass roof over the upper platforms is about 320 metres long.",
        "From the upper level you can see the trains below you through the open floors.",
        "Out the front, the Reichstag and the Chancellery are a 10-minute walk away."
      ],
      tip: "Take the glass lifts up and down and watch the trains on all levels.",
      around: [
        "Walk across the Spree to the Chancellery and the Reichstag.",
        "Visit the free Futurium museum next door.",
        "Walk along the river to the government quarter."
      ],
      nearby: ["futurium", "spreebogen", "reichstag-dome"],
      photos: []
    }
  ]
};
