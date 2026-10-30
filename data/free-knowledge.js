/*
 * GO PLACES — Free Knowledge
 * ==========================
 * A top-level category for free learning in the city: museums, public
 * bookshelves, libraries and exhibitions. These places show under "All spots"
 * like every other spot, and on their own under the 📚 Free Knowledge chip and
 * its own screens (#knowledge).
 *
 * The places below are added to the normal list of spots, so they get the
 * usual spot page, "Mark as explored", wishlist, photo uploads and ratings.
 * They take the same fields as data/spots.js, plus:
 *
 *   category     always "free-knowledge"
 *   knowledge    which subcategories it belongs to (ids from `subcategories`)
 *   group        optional content group, e.g. "public-bookshelves"
 *   address      street and district
 *   opening      opening information
 *   duration     estimated visit time
 *   whyVisit     why it's worth going
 *   visitorInfo  practical information (getting there, access, tips)
 *   tags         short tags shown as chips, e.g. ["Reading", "Community"]
 *
 * To ADD A PLACE: copy a block, change the values, and keep the commas.
 * Opening hours change: VERIFY them before launch, and now and then after.
 * Coordinates marked "approximate" are worth checking on the map.
 */
(function () {
  var DATA = window.GO_PLACES;

  DATA.themes.push({
    id: "free-knowledge", name: "Free Knowledge", emoji: "📚",
    description: "Free museums, public bookshelves, libraries and exhibitions: learning in the city that costs nothing."
  });

  window.GO_PLACES_KNOWLEDGE = {
    subcategories: [
      { id: "free-museums",            name: "Free Museums",            emoji: "🏛️", description: "Museums you can walk into without a ticket." },
      { id: "public-bookshelves",      name: "Public Bookshelves",      emoji: "📖", description: "Take a book, leave a book. Open to everyone, no sign-up." },
      { id: "reading-spaces",          name: "Reading Spaces",          emoji: "🪑", description: "Quiet corners with a bench, a garden or a reading room." },
      { id: "libraries",               name: "Libraries",               emoji: "📚", description: "Libraries and archives open to the public." },
      { id: "educational-exhibitions", name: "Educational Exhibitions", emoji: "🧾", description: "Exhibitions that teach you something about the city and the world." },
      { id: "history",                 name: "History",                 emoji: "📜", description: "Places that tell the story of the past." },
      { id: "science",                 name: "Science",                 emoji: "🔬", description: "Fossils, nature and how the world works." },
      { id: "literature",              name: "Literature",              emoji: "✒️", description: "Writers, books and the stories of Munich." },
      { id: "public-art",              name: "Public Art",              emoji: "🎨", description: "Art you can see for free, sometimes around the clock." },
      { id: "learning-experiences",    name: "Learning Experiences",    emoji: "🧠", description: "Places where you leave knowing more than when you came." }
    ],

    groups: [
      {
        id: "public-bookshelves",
        title: "Public Bookshelves of Munich",
        emoji: "📖",
        description: "Munich has dozens of open bookshelves (offene Bücherschränke). Take a book, bring one back, or swap. No library card, no opening hours, no cost. Here are some to start with."
      }
    ]
  };

  function bookshelf(o) {
    return Object.assign({
      emoji: "📖",
      themes: ["free-knowledge"],
      category: "free-knowledge",
      group: "public-bookshelves",
      knowledge: ["public-bookshelves", "reading-spaces", "literature"],
      cost: "Free",
      opening: "Outdoors, open any time",
      duration: "10–20 minutes (longer if you stay and read)",
      tags: ["Reading", "Literature", "Community", "Sustainability", "Knowledge"],
      visitorInfo: "Take a book, leave a book. Please only bring books in good condition, and take anything else (magazines, DVDs, broken books) back home or to a recycling centre.",
      photos: []
    }, o);
  }

  // Bookshelf locations: AWM München's list of book and swap cabinets and
  // muenchen.de's bookshelf tips. Pins are approximate (VERIFY on the map).
  var bookshelves = [
    bookshelf({
      id: "bookshelf-muenchner-freiheit",
      name: "Bookshelf at Münchner Freiheit",
      lat: 48.16190, lng: 11.58640, // approximate
      address: "Münchner Freiheit, in front of the bus station, Schwabing",
      summary: "One of Munich's newest open bookshelves, right by the bus station at Münchner Freiheit, meant as a meeting place as much as a book swap.",
      whyVisit: "The back of the shelf is a small exhibition space for local artists, with new work every few weeks. Swap a book and see what's on.",
      tags: ["Reading", "Literature", "Community", "Sustainability", "Knowledge"],
      knowledge: ["public-bookshelves", "literature", "public-art"]
    }),
    bookshelf({
      id: "bookshelf-nordbad",
      name: "Bookshelf at Nordbad",
      lat: 48.16050, lng: 11.56600, // approximate
      address: "In front of the Nordbad swimming pool, Schleißheimer Straße, Schwabing-West",
      summary: "Munich's very first open bookshelf. It was such a success that dozens more followed all over the city.",
      whyVisit: "This is where it started. There are benches right next to it, so you can start reading straight away.",
      tags: ["Reading", "Literature", "Community", "Sustainability", "Knowledge", "History"]
    }),
    bookshelf({
      id: "bookshelf-oertelplatz",
      name: "Bookshelf at Oertelplatz",
      lat: 48.19560, lng: 11.46140, // approximate
      address: "Oertelplatz, Allach",
      summary: "A neighbourhood bookshelf on Allach's village square, far from the tourist trail in the north-west of the city.",
      whyVisit: "Combine it with the weekly market on Oertelplatz: fresh food and a free book in one trip.",
      tags: ["Reading", "Community", "Sustainability", "Hidden Gem"]
    }),
    bookshelf({
      id: "bookshelf-dreimuehlenviertel",
      name: "Bookshelf in the Dreimühlenviertel",
      lat: 48.12370, lng: 11.56200, // approximate
      address: "Corner of Ehrengutstraße and Dreimühlenstraße, Isarvorstadt",
      summary: "A bookshelf whose mix says a lot about its neighbourhood: plenty of children's and young adult books, next to law books and demanding novels.",
      whyVisit: "One of the most varied selections in the city, with benches nearby. A short walk from the Isar.",
      tags: ["Reading", "Literature", "Community", "Sustainability", "Knowledge"]
    }),
    bookshelf({
      id: "bookshelf-glockenbach",
      name: "Bookshelf in the Glockenbachviertel",
      lat: 48.12740, lng: 11.56560, // approximate
      address: "Am Glockenbach / Arndtstraße, Isarvorstadt",
      summary: "A bookshelf in one of Munich's liveliest neighbourhoods, between cafés, small shops and the old Glockenbach stream.",
      whyVisit: "Pick a book, grab a coffee nearby and read by the Isar, five minutes away.",
      tags: ["Reading", "Literature", "Community", "Sustainability"]
    }),
    bookshelf({
      id: "bookshelf-genoveva-schauer-platz",
      name: "Bookshelf at Genoveva-Schauer-Platz",
      lat: 48.13000, lng: 11.59330, // approximate
      address: "Genoveva-Schauer-Platz, Steinstraße 44, Haidhausen",
      summary: "A bookshelf on a small square in Haidhausen, between Steinstraße and Milchstraße.",
      whyVisit: "The square has benches under trees and a drinking fountain, which makes it one of the nicest places in the city to sit with a book.",
      tags: ["Reading", "Literature", "Community", "Sustainability", "Hidden Gem"]
    }),
    bookshelf({
      id: "bookshelf-mangfallplatz",
      name: "Bookshelf at Mangfallplatz",
      lat: 48.09840, lng: 11.57650, // approximate
      address: "Mangfallplatz, Harlaching",
      summary: "A neighbourhood bookshelf in quiet Harlaching, at the end of the U1 line.",
      whyVisit: "Easy to reach by U-Bahn, and a good start for a walk down to the Isar and the Tierpark.",
      tags: ["Reading", "Community", "Sustainability", "Hidden Gem"]
    }),
    bookshelf({
      id: "bookshelf-rudi-hierl-platz",
      name: "Bookshelf at Rudi-Hierl-Platz",
      lat: 48.14760, lng: 11.55860, // approximate
      address: "Rudi-Hierl-Platz, near Stiglmaierplatz, Maxvorstadt",
      summary: "A real insider tip: a bookshelf on a small square near Stiglmaierplatz with plenty of benches.",
      whyVisit: "Close to the museums of the Kunstareal but much quieter. Pick a book here, then walk on to the free museums around Königsplatz.",
      tags: ["Reading", "Literature", "Community", "Sustainability", "Hidden Gem"]
    }),
    bookshelf({
      id: "bookshelf-lenbachhaus",
      name: "Lenbachhaus Kunstbücherschrank",
      emoji: "🎨",
      lat: 48.14680, lng: 11.56370, // approximate
      address: "Luisenstraße 33, in front of the Lenbachhaus, Maxvorstadt",
      summary: "An 'art bookshelf' in front of the Lenbachhaus art museum, for books about art, artists and design.",
      whyVisit: "Art books are expensive. Here you can take one home for free, and the Königsplatz and its free museums are right around the corner.",
      tags: ["Reading", "Art", "Community", "Sustainability", "Knowledge"],
      knowledge: ["public-bookshelves", "public-art", "learning-experiences"],
      visitorInfo: "Best for art books, catalogues and books about design and architecture. Take a book, leave a book."
    }),
    bookshelf({
      id: "bookshelf-volkartstrasse",
      name: "Bookshelf at Volkartstraße",
      lat: 48.15930, lng: 11.53380, // approximate
      address: "Volkartstraße 84 / Dom-Pedro-Straße, Neuhausen",
      summary: "A neighbourhood bookshelf in a residential corner of Neuhausen.",
      whyVisit: "A local favourite, and a short walk from the Rotkreuzplatz and the green Dom-Pedro-Platz.",
      tags: ["Reading", "Community", "Sustainability", "Hidden Gem"]
    }),
    bookshelf({
      id: "bookshelf-waisenhausstrasse",
      name: "Bookshelf at Waisenhaus-/Ruffinistraße",
      lat: 48.15800, lng: 11.53060, // approximate
      address: "Corner of Waisenhausstraße and Ruffinistraße, at the tram stop, Neuhausen",
      summary: "A bookshelf right at the tram stop, with an extra shelf just for children's books.",
      whyVisit: "The Neuhausen city library is almost opposite: borrow one book and keep one for free.",
      tags: ["Reading", "Literature", "Community", "Sustainability", "Knowledge"],
      knowledge: ["public-bookshelves", "reading-spaces", "literature", "libraries"]
    }),
    bookshelf({
      id: "bookshelf-denninger-anger",
      name: "Swap cabinet at Denninger Anger",
      emoji: "🔄",
      lat: 48.15000, lng: 11.62700, // approximate
      address: "Denninger Anger (middle), Pühnstraße, Denning",
      summary: "A neighbourhood swap cabinet on the Denninger Anger green in the east of Munich.",
      whyVisit: "A green, quiet spot. Swap cabinets like this one keep good things in use instead of in the bin.",
      tags: ["Community", "Sustainability", "Hidden Gem"],
      knowledge: ["public-bookshelves", "learning-experiences"],
      visitorInfo: "This is listed as a swap cabinet (Kreislaufschrank) for small things in good condition, and books aren't always accepted. Check the sign on the cabinet before leaving anything."
    }),
    bookshelf({
      id: "bookshelf-baumkirchner-strasse",
      name: "Bookshelf at Baumkirchner Straße",
      lat: 48.12780, lng: 11.63300, // approximate
      address: "Baumkirchner Straße, at the Grüner Markt, Berg am Laim",
      summary: "A bookshelf at the green market on Baumkirchner Straße in Berg am Laim.",
      whyVisit: "A small neighbourhood meeting point. Shop at the market and pick up something to read.",
      tags: ["Reading", "Community", "Sustainability", "Hidden Gem"]
    }),
    bookshelf({
      id: "bookshelf-moosach-1",
      name: "Bookshelf Moosach I (Moosacher Stachus)",
      lat: 48.17940, lng: 11.51140, // approximate
      address: "Bunzlauer Straße 46, at the tram stop, Moosach",
      summary: "Munich's third open bookshelf, in place since 2016 at the tram stop locals call the 'Moosacher Stachus'.",
      whyVisit: "One of the city's early bookshelves, and still busy. Perfect for picking something to read on the tram.",
      tags: ["Reading", "Literature", "Community", "Sustainability", "History"]
    }),
    bookshelf({
      id: "bookshelf-moosach-2",
      name: "Bookshelf Moosach II (Borstei)",
      lat: 48.16650, lng: 11.53030, // approximate
      address: "Voitstraße 2, corner of Dachauer Straße, Moosach",
      summary: "A bookshelf at the edge of the Borstei, a listed 1920s housing estate.",
      whyVisit: "Take a book and then walk through the Borstei's courtyards, gardens and fountains. It's a protected monument and a hidden gem of its own.",
      tags: ["Reading", "Community", "Sustainability", "History", "Hidden Gem"],
      knowledge: ["public-bookshelves", "reading-spaces", "history"]
    }),
    // The two below come from community photos; the pins are the photos' GPS
    // positions. Names confirmed by the photographer.
    bookshelf({
      id: "bookshelf-herterichstrasse",
      name: "Bookshelf at Herterichstraße",
      lat: 48.07834, lng: 11.50763, // from the photos' GPS data
      address: "Herterichstraße, Solln / Forstenried",
      summary: "A bright orange bookshelf on a leafy street in the south-west of Munich, with a bench right in front of it.",
      whyVisit: "A well-stocked neighbourhood shelf, mostly German novels and paperbacks. One explorer found Mario Puzo's 'Der Pate' (The Godfather) here.",
      tags: ["Reading", "Literature", "Community", "Sustainability", "Hidden Gem"],
      photos: [
        { url: "images/bookshelf-herterichstrasse-1.jpg", credit: "Photo: Go Places community" },
        { url: "images/bookshelf-herterichstrasse-2.jpg", credit: "Photo: Go Places community" }
      ]
    }),
    bookshelf({
      id: "bookshelf-herzog-ernst-platz",
      name: "Bookshelf at Herzog-Ernst-Platz",
      lat: 48.12513, lng: 11.54115, // from the photo's GPS data
      address: "Herzog-Ernst-Platz, Sendling",
      summary: "An orange glass-fronted bookshelf on a tree-lined square in Sendling, with long wooden benches right next to it.",
      whyVisit: "The benches make it easy to sit down and read the first chapter before you decide whether to take a book home.",
      tags: ["Reading", "Literature", "Community", "Sustainability"],
      photos: [
        { url: "images/bookshelf-herzog-ernst-platz-1.jpg", credit: "Photo: Go Places community" }
      ]
    })
  ];

  function museum(o) {
    return Object.assign({
      themes: ["free-knowledge"],
      category: "free-knowledge",
      knowledge: ["free-museums"],
      cost: "Free",
      photos: []
    }, o);
  }

  // Facts: the museums' own pages and muenchen.de's list of free museums.
  var museums = [
    museum({
      id: "palaeontological-museum",
      name: "Paläontologisches Museum München",
      emoji: "🦕",
      lat: 48.14720, lng: 11.56510, // approximate
      address: "Richard-Wagner-Straße 10, Maxvorstadt (near Königsplatz)",
      knowledge: ["free-museums", "science", "history", "educational-exhibitions", "learning-experiences"],
      tags: ["Science", "History", "Knowledge"],
      opening: "Mon–Thu 8:00–16:00, Fri 8:00–14:00, and the first Sunday of the month 10:00–16:00. Closed on weekends and public holidays.", // VERIFY
      duration: "1–1.5 hours",
      summary: "Dinosaurs, flying reptiles, prehistoric elephants and one of the most famous fossils in the world, all in an old arts-and-crafts school, and all free.",
      whyVisit: "You can stand in front of the 'Munich specimen' of Archaeopteryx, one of only a handful of skeletons of the famous half-bird, half-dinosaur ever found.",
      history: "The collection goes back to the natural history collection of the Bavarian Academy of Sciences, founded in 1759. It became its own collection in 1843 and was world-famous by the late 19th century. In 1944 bombs destroyed its home in the Alte Akademie and much of the collection with it. After the war it moved into the former Royal Bavarian School of Arts and Crafts on Richard-Wagner-Straße, and it has shown a large collection there again since the 1960s.",
      funFacts: [
        "Its star is the 'Mühldorf elephant', a prehistoric elephant relative about 12 million years old, found in the bed of the River Inn in 1971. The copy in the atrium is what you see; the original's 170 bones are in storage.",
        "The Plateosaurus on show is the largest dinosaur ever found in Bavaria, about 210 million years old.",
        "Every month the museum puts a 'Fossil of the Month' on display, with a text written by its scientists."
      ],
      visitorInfo: "U2 or buses 58, 68 and 100 to Königsplatz. The building isn't step-free. On open Sundays there's a quiz for children. The Geological Museum is next door.",
      tip: "Go on the first Sunday of the month if you can't make it on a weekday."
    }),
    museum({
      id: "ns-dokuzentrum",
      name: "NS-Dokumentationszentrum München",
      emoji: "🕯️",
      lat: 48.14530, lng: 11.56790, // approximate
      address: "Max-Mannheimer-Platz 1, Maxvorstadt (near Königsplatz)",
      knowledge: ["free-museums", "history", "educational-exhibitions", "learning-experiences"],
      tags: ["History", "Learning", "Culture"],
      opening: "Tue–Sun 10:00–19:00, and on Mondays that are public holidays.", // VERIFY
      duration: "1.5–2 hours",
      summary: "Munich's centre for learning and remembrance about National Socialism: how it began in this city, how it worked, and what it led to.",
      whyVisit: "It stands where it matters: on the site of the 'Brown House', the former headquarters of the Nazi party. Few places explain so clearly how a democracy can fall.",
      history: "Munich was where the Nazi party was founded and grew, and Hitler later called it the 'capital of the movement'. The party's headquarters, the 'Brown House', stood on this spot until it was destroyed in the war. The documentation centre opened here in 2015, 70 years after the end of the war, in a plain white building designed as a deliberate contrast to the Nazi-era buildings around Königsplatz.",
      funFacts: [
        "The square in front is named after Max Mannheimer, a Holocaust survivor who spent decades telling school classes about what he had lived through.",
        "From the upper floors you look straight out at the buildings of the former Nazi party district around Königsplatz, which is part of the exhibition's story.",
        "Both the permanent and the temporary exhibitions are free."
      ],
      visitorInfo: "U2 to Königsplatz, or tram 27/28 to Karolinenplatz. Step-free. The permanent exhibition is in German and English. Many topics are hard to look at, so take breaks.",
      tip: "Start on the top floor and work your way down: the exhibition is told in that order."
    }),
    museum({
      id: "abgussmuseum",
      name: "Museum für Abgüsse Klassischer Bildwerke",
      emoji: "🗿",
      lat: 48.14470, lng: 11.56830, // approximate
      address: "Katharina-von-Bora-Straße 10, Maxvorstadt (near Königsplatz)",
      knowledge: ["free-museums", "history", "public-art", "learning-experiences"],
      tags: ["Art", "History", "Ancient World"],
      opening: "Mon–Fri 10:00–20:00. Closed on weekends and public holidays.", // VERIFY
      duration: "45 minutes – 1.5 hours",
      summary: "Around 2,000 plaster casts of famous Greek and Roman sculptures, side by side: the greatest hits of the ancient world in two big halls.",
      whyVisit: "Where else can you see the Discus Thrower, Greek temple sculpture and Roman emperors in one room, for free, and walk all the way around them?",
      history: "Founded in 1869, it was one of the first public collections in Bavaria and was first shown in the Hofgarten arcades. Almost all of it was destroyed in 1945. It has been rebuilt since the 1970s in the 'Haus der Kulturinstitute', a building that was put up in 1934–35 as a Nazi party office. Today it is again one of the four largest collections of its kind in Germany.",
      funFacts: [
        "Its plaster model of the Parthenon, at 1:20 scale, is more than four metres long.",
        "The model of the Arch of Constantine was made in the 1880s.",
        "Art students come here to practise drawing: the casts are perfect for learning proportions."
      ],
      visitorInfo: "U2 to Königsplatz. The casts cover about 1,300 years, from around the 8th century BC to the 5th century AD.",
      tip: "Bring a sketchbook. Nobody minds if you sit down and draw."
    }),
    museum({
      id: "monacensia",
      name: "Monacensia im Hildebrandhaus",
      emoji: "✒️",
      lat: 48.14150, lng: 11.59600, // approximate
      address: "Maria-Theresia-Straße 23, Bogenhausen",
      knowledge: ["free-museums", "literature", "libraries", "reading-spaces", "history"],
      tags: ["Literature", "History", "Knowledge"],
      opening: "Mon–Wed and Fri 9:30–17:30, Thu 12:00–19:00, Sat–Sun 11:00–18:00.", // VERIFY
      duration: "1 hour (longer in the reading garden)",
      summary: "Munich's literary memory: the city's literature archive and library, in the villa a famous sculptor built for himself above the Isar.",
      whyVisit: "A free exhibition on literary Munich in the time of Thomas Mann, a café and a reading garden. One of the calmest places in the city to spend an afternoon.",
      history: "The villa was built at the end of the 1890s by the sculptor Adolf von Hildebrand as his home and studio. Today it belongs to the Munich city library (Münchner Stadtbibliothek) and holds the papers and books of writers connected to the city, including the Mann family.",
      funFacts: [
        "Adolf von Hildebrand also made the Wittelsbacher Fountain on Lenbachplatz.",
        "The archive keeps letters, manuscripts and personal belongings of Munich writers that you won't find anywhere else.",
        "There's a café, Café MON, in the house."
      ],
      visitorInfo: "Tram 16 to Höchlstraße, or a 10-minute walk from the Friedensengel. The reading garden is lovely in summer.",
      tip: "Combine it with a walk along the Isar and up to the Friedensengel."
    }),
    museum({
      id: "rathausgalerie",
      name: "Rathausgalerie",
      emoji: "🖼️",
      lat: 48.13760, lng: 11.57560, // approximate
      address: "Neues Rathaus, Marienplatz 8, Altstadt",
      knowledge: ["free-museums", "public-art", "educational-exhibitions"],
      tags: ["Art", "Culture"],
      opening: "Usually during exhibitions from March to November. In 2026 it is out of its usual City Hall space and shows exhibitions at other venues under the title 'ORTSWECHSEL'. Check the current programme.", // VERIFY
      duration: "30–45 minutes",
      summary: "The city's own art gallery inside the New Town Hall, with free exhibitions and events put on by Munich's culture department.",
      whyVisit: "Free contemporary art right on Marienplatz. Pair it with the Glockenspiel.",
      history: "The gallery uses a hall inside the New Town Hall, the neo-Gothic building on Marienplatz finished in 1908. Every year from spring to autumn the culture department shows exhibitions here.",
      funFacts: [
        "It sits in the same building as the Glockenspiel.",
        "Entry to the exhibitions and events is free."
      ],
      visitorInfo: "U/S-Bahn Marienplatz. Exhibitions change, so check what's on before you go.",
      tip: "Come just before 11:00 and catch the Glockenspiel outside afterwards."
    }),
    museum({
      id: "kunstarkaden",
      name: "Kunstarkaden",
      emoji: "🎨",
      lat: 48.13640, lng: 11.57840, // approximate
      address: "Sparkassenstraße 3, Altstadt (by Marienplatz)",
      knowledge: ["free-museums", "public-art"],
      tags: ["Art", "Local Artists"],
      opening: "During exhibitions, usually Tue–Sat 13:00–19:00. Closed on public holidays.", // VERIFY
      duration: "20–30 minutes",
      summary: "A small city-run gallery a few steps from Marienplatz that gives young and local artists space for experimental work.",
      whyVisit: "See what Munich's artists are making now, before they're famous. Small, free and right in the centre.",
      history: "The Kunstarkaden is one of the city's own art spaces, run by Munich's culture department to support local artists.",
      funFacts: [
        "Exhibitions change every few weeks.",
        "It's one of the few places to see brand-new art right in the old town."
      ],
      visitorInfo: "U/S-Bahn Marienplatz, then a two-minute walk. Only open while an exhibition is on.",
      tip: "Look in on your way between Marienplatz and the Hofbräuhaus."
    }),
    museum({
      id: "lothringer-13",
      name: "Lothringer 13",
      emoji: "🏭",
      lat: 48.12880, lng: 11.59940, // approximate
      address: "Lothringer Straße 13, Haidhausen",
      knowledge: ["free-museums", "public-art"],
      tags: ["Contemporary Art"],
      opening: "During exhibitions: Wed–Fri 12:00–20:00, Sat, Sun and public holidays 10:00–18:00.", // VERIFY
      duration: "30–45 minutes",
      summary: "International contemporary art in an old factory hall in Haidhausen, run by the city.",
      whyVisit: "The building is half the experience: raw, high and industrial, with art that often fills the whole hall.",
      history: "The hall is part of a former factory site. The city turned it into one of its art spaces, and it's now known for bold, international contemporary art.",
      funFacts: [
        "The name is simply its address.",
        "Exhibitions are free whenever they're on."
      ],
      visitorInfo: "S-Bahn to Rosenheimer Platz or tram to Wörthstraße, then a short walk. Only open during exhibitions.",
      tip: "Haidhausen's cafés and the Genoveva-Schauer-Platz bookshelf are a short walk away."
    }),
    museum({
      id: "maximiliansforum",
      name: "MaximiliansForum",
      emoji: "🔦",
      lat: 48.13860, lng: 11.58560, // approximate
      address: "Underpass at Maximilianstraße / Altstadtring, Altstadt-Lehel",
      knowledge: ["free-museums", "public-art"],
      tags: ["Art", "Culture"],
      opening: "Visible 24 hours a day from the public underpass.",
      duration: "15–20 minutes",
      summary: "An art space inside a pedestrian underpass on Maximilianstraße, where installations can be seen from the passage day and night.",
      whyVisit: "Art for everyone, at any hour, for free. An underpass you'll actually want to walk through.",
      history: "The city turned a pedestrian underpass where Maximilianstraße crosses the Altstadtring into a space for art and interdisciplinary projects.",
      funFacts: [
        "You can see it at 3 a.m. if you want: it never closes.",
        "It sits under one of Munich's most expensive shopping streets."
      ],
      visitorInfo: "Tram 16/19 to Maxmonument or U4/U5 to Lehel. Some events take place inside the space, with their own times.",
      tip: "Walk on along Maximilianstraße to the Maximilianeum and the Isar."
    })
  ];

  DATA.spots.push.apply(DATA.spots, bookshelves.concat(museums));
})();
