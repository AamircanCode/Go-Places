/*
 * GO PLACES — Free Knowledge in Berlin
 * ====================================
 * Free museums and learning places in Berlin. Works exactly like
 * data/free-knowledge.js (Munich): the top of that file explains every field.
 *
 * Facts: the museums' own pages, berlin.de and museumsportal-berlin.de.
 * Opening hours change: VERIFY them before launch, and now and then after.
 */
(function () {
  var DATA = window.GO_PLACES;

  DATA.themes.push({
    id: "free-knowledge", name: "Free Knowledge", emoji: "📚",
    description: "Free museums, memorials and exhibitions: learning in Berlin that costs nothing."
  });

  window.GO_PLACES_KNOWLEDGE = {
    subcategories: [
      { id: "free-museums",            name: "Free Museums",            emoji: "🏛️", description: "Museums you can walk into without a ticket." },
      { id: "public-bookshelves",      name: "Public Bookshelves",      emoji: "📖", description: "Take a book, leave a book. Open to everyone, no sign-up." },
      { id: "reading-spaces",          name: "Reading Spaces",          emoji: "🪑", description: "Quiet corners with a bench, a garden or a reading room." },
      { id: "libraries",               name: "Libraries",               emoji: "📚", description: "Libraries and archives open to the public." },
      { id: "educational-exhibitions", name: "Educational Exhibitions", emoji: "🧾", description: "Exhibitions that teach you something about the city and the world." },
      { id: "history",                 name: "History",                 emoji: "📜", description: "Places that tell the story of the past." },
      { id: "science",                 name: "Science",                 emoji: "🔬", description: "The future, anatomy, nature and how the world works." },
      { id: "literature",              name: "Literature",              emoji: "✒️", description: "Writers, books and the stories of Berlin." },
      { id: "public-art",              name: "Public Art",              emoji: "🎨", description: "Art you can see for free, sometimes around the clock." },
      { id: "learning-experiences",    name: "Learning Experiences",    emoji: "🧠", description: "Places where you leave knowing more than when you came." }
    ],
    groups: []
  };

  function museum(o) {
    return Object.assign({
      themes: ["free-knowledge"],
      category: "free-knowledge",
      knowledge: ["free-museums"],
      cost: "Free",
      photos: []
    }, o);
  }

  var museums = [
    museum({
      id: "futurium",
      name: "Futurium",
      emoji: "🚀",
      lat: 52.52240, lng: 13.37360,
      address: "Alexanderufer 2, Mitte (next to Hauptbahnhof)",
      knowledge: ["free-museums", "science", "educational-exhibitions", "learning-experiences"],
      tags: ["Science", "Future", "Interactive", "Knowledge"],
      opening: "Wed–Mon 10:00–18:00, Thu until 20:00. Closed on Tuesdays.", // VERIFY
      duration: "1.5–2 hours",
      summary: "A free 'house of futures' by the Spree: hands-on exhibitions about technology, nature and how we might live tomorrow, plus a lab where you can tinker.",
      whyVisit: "One of the best free museums in Berlin, and a Reddit favourite. Interactive, modern, and no ticket needed.",
      history: "Futurium opened in 2019 in a striking building covered in angled glass and steel panels, between the Hauptbahnhof and the government quarter. It's funded by the federal government together with science organisations and foundations.",
      funFacts: [
        "The roof is a terrace with solar panels and a view over the government quarter.", // VERIFY: terrace open
        "The Futurium Lab lets you try out things like robots and 3D printing."
      ],
      visitorInfo: "A short walk from Berlin Hauptbahnhof. Workshops and some events have their own fees.",
      tip: "Go on a Thursday evening, when it's open until 20:00 and quieter."
    }),
    museum({
      id: "tieranatomisches-theater",
      name: "Tieranatomisches Theater",
      emoji: "🐴",
      lat: 52.52440, lng: 13.38230, // approximate
      address: "Philippstraße 12/13, Mitte (Charité campus)",
      knowledge: ["free-museums", "science", "history", "educational-exhibitions"],
      tags: ["Science", "History", "Architecture", "Hidden Gem"],
      opening: "Tue–Sat 14:00–18:00. Closed on public holidays.", // VERIFY
      duration: "45 minutes",
      summary: "Berlin's oldest surviving teaching building: a round, domed lecture theatre from 1790 where vets once dissected horses, now a free exhibition space run by Humboldt University.",
      whyVisit: "A secret, beautiful building hidden in a park behind the Charité. Small, free and always showing something unusual.",
      history: "Carl Gotthard Langhans, the architect of the Brandenburg Gate, built it in 1789–1790 for the veterinary school, modelling the lecture hall on ancient round temples and amphitheatres. Since 2013 Humboldt University has used it for 'laboratory' exhibitions that mix science and design.",
      funFacts: [
        "The same architect designed the Brandenburg Gate at almost the same time.",
        "Animals were brought up to the dissection table in the middle of the hall by a lift from below.", // VERIFY
        "There's a free audio guide."
      ],
      visitorInfo: "U6 to Oranienburger Tor, then a short walk. Wheelchair accessible.",
      tip: "Check what's on before you go: the exhibitions change and the building closes between shows."
    }),
    museum({
      id: "berlin-wall-memorial",
      name: "Berlin Wall Memorial, Bernauer Straße",
      emoji: "🧱",
      lat: 52.53530, lng: 13.39010,
      address: "Bernauer Straße 111 (visitor centre) to Gartenstraße, Mitte/Wedding",
      knowledge: ["free-museums", "history", "educational-exhibitions", "learning-experiences"],
      tags: ["History", "Cold War", "Open Air", "Knowledge"],
      themes: ["free-knowledge", "wall-history"],
      opening: "Open-air area daily 8:00–22:00. Visitor centre and documentation centre Tue–Sun 10:00–18:00.", // VERIFY
      duration: "1.5–2 hours",
      summary: "The central memorial to the Berlin Wall: a long stretch of the original border strip with the Wall, the watchtower and the 'death strip' preserved, plus a free documentation centre with a viewing tower.",
      whyVisit: "The best place to understand what the Wall really was. Everything here, inside and out, is free.",
      history: "On Bernauer Straße, the houses on one side were in the East and the pavement in front of them was in the West. In 1961 people jumped from their windows into the West, and later the houses were bricked up and demolished. Escape tunnels were dug under the street. The memorial, built from 1998 onwards, keeps a full section of the border strip as it was.",
      funFacts: [
        "Rows of steel rods in the ground show where the Wall stood where it's missing.",
        "Markers in the ground show the routes of escape tunnels dug under the street.",
        "From the documentation centre's tower you look straight down into the preserved death strip."
      ],
      visitorInfo: "S-Bahn Nordbahnhof or U8 Bernauer Straße. Free guided tours are offered some days.",
      tip: "Climb the viewing tower first to see the whole border strip, then walk it."
    }),
    museum({
      id: "fhxb-museum",
      name: "FHXB Friedrichshain-Kreuzberg Museum",
      emoji: "🏘️",
      lat: 52.50060, lng: 13.41860, // approximate
      address: "Adalbertstraße 95A, Kreuzberg (at Kottbusser Tor)",
      knowledge: ["free-museums", "history", "educational-exhibitions"],
      tags: ["History", "Migration", "Neighbourhood", "Knowledge"],
      opening: "Tue–Sun, afternoons. Check the museum's website.", // VERIFY
      duration: "1 hour",
      summary: "The district museum of Friedrichshain-Kreuzberg, in an old factory building at Kotti: free exhibitions about squats, migration, protest and everyday life in Berlin's most rebellious district.",
      whyVisit: "A Reddit tip, and the best free introduction to the Kreuzberg story, just around the corner from the Landwehrkanal.",
      history: "The museum tells the history of the two districts that were merged in 2001, with a focus on migration and neighbourhood history. Its exhibitions often grow out of projects with local residents.",
      funFacts: [
        "It's free, and often has temporary exhibitions made with people from the neighbourhood."
      ],
      visitorInfo: "U1/U8 Kottbusser Tor, a two-minute walk.",
      tip: "Combine it with a walk along the Landwehrkanal at Urbanhafen."
    }),
    museum({
      id: "museum-der-unerhoerten-dinge",
      name: "Museum der Unerhörten Dinge",
      emoji: "🦌",
      lat: 52.49010, lng: 13.36080, // approximate
      address: "Crellestraße 5, Schöneberg",
      knowledge: ["free-museums", "literature", "learning-experiences"],
      tags: ["Quirky", "Stories", "Hidden Gem"],
      opening: "Wed–Fri 15:00–19:00", // VERIFY
      duration: "30–45 minutes",
      summary: "The 'Museum of Unheard-of Things': a tiny free museum of curious objects, each with a story that may or may not be true.",
      whyVisit: "One of Berlin's quirkiest corners, and free. Read the stories and decide for yourself what to believe.",
      history: "The museum was founded by Roland Albrecht, who collects objects and writes a story for each one. The collection includes a letter from Sigmund Freud and the skin of a Japanese bonsai deer.", // VERIFY founder
      funFacts: [
        "The objects are ordinary-looking; the stories are what make them extraordinary.",
        "It fits in a single shopfront room."
      ],
      visitorInfo: "S-Bahn Julius-Leber-Brücke or U7 Kleistpark.",
      tip: "Take your time with the texts: they're the real exhibition."
    }),
    museum({
      id: "humboldt-forum-free",
      name: "Humboldt Forum (the free parts)",
      emoji: "🏰",
      lat: 52.51740, lng: 13.40260,
      address: "Schlossplatz, Mitte (opposite Museum Island)",
      knowledge: ["free-museums", "history", "educational-exhibitions"],
      tags: ["History", "Architecture", "Knowledge"],
      cost: "Free: palace cellars, sculpture hall, video panorama and some exhibitions. Main exhibitions €14 (free up to age 20).", // VERIFY current prices
      opening: "Check humboldtforum.org", // VERIFY
      duration: "1 hour for the free parts",
      summary: "The rebuilt Berlin Palace, now a museum and cultural centre. The big exhibitions are no longer free, but the palace cellars, the sculpture hall and some smaller shows still are.",
      whyVisit: "A Reddit user says 'Humboldt Forum, in parts', and that's right: walk the courtyards and free areas without a ticket.",
      history: "The Berlin Palace was the Hohenzollern residence for centuries. It was damaged in the war and blown up by East Germany in 1950; the GDR's Palace of the Republic was later built on the site. That was demolished in turn, and the palace facades were rebuilt around a modern core. The Humboldt Forum opened in 2021.",
      funFacts: [
        "In the palace cellars you can see the real foundations of the old palace.",
        "Since October 2025 a single €14 ticket covers most of the big exhibitions, which used to be free." // VERIFY
      ],
      visitorInfo: "U5 Museumsinsel, right outside.",
      tip: "Walk through the Schlüterhof courtyard and down into the cellars, then cross to Museum Island."
    })
  ];

  DATA.spots.push.apply(DATA.spots, museums);
})();
