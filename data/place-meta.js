/*
 * GO PLACES — place metadata (Munich)
 * ===================================
 * Structured facts that help people decide whether a place is worth it right
 * now. They show as "At a glance" on every spot page, and Plan My Day uses
 * them to pick and order stops. One entry per spot id (from data/spots.js and
 * data/free-knowledge.js). Plain JSON, so it can move into a database later.
 *
 * A spot without an entry still works: meta.js fills in a guess from its cost
 * and themes. Each city has its own copy of this file (e.g. data/berlin/).
 *
 *   estimatedDuration   "15 Minutes" | "30 Minutes" | "1 Hour" | "2 Hours" | "Half Day" | "Full Day"
 *   bestTimeOfDay       any of "Sunrise", "Morning", "Afternoon", "Sunset", "Evening", "Night"
 *   bestSeason          any of "Spring", "Summer", "Autumn", "Winter", "All Year"
 *   weatherSuitability  any of "Sunny", "Cloudy", "Rainy", "Snow", "All Weather"
 *   visitorTypes        any of "Solo", "Friends", "Couples", "Families", "Students",
 *                       "Tourists", "Locals", "Remote Workers"
 *   activityLevel       "Very Relaxed" | "Relaxed" | "Moderate" | "Active"
 *   hiddenGemScore      1 (very popular tourist spot) to 10 (hidden local discovery)
 *   knowledgeValue      1–10, how much you learn
 *   photoValue          1–10, photography potential
 *   accessibilityLevel  "Step-free" | "Partly step-free" | "Not step-free"
 *   budgetLevel         "Free" | "Under 5€" (up to about €5) | "Under 10€" | "Premium"
 *   budgetBySeason      optional, e.g. { "Winter": "Free" } when the price changes by season
 *
 * Scores are editorial first guesses. Accessibility is marked VERIFY everywhere:
 * check it on site before telling people a place is step-free.
 */
window.GO_PLACES_LAYER = window.GO_PLACES_LAYER || {};

(function () {
  var ALL_WEATHER = ["All Weather"];
  var OUTDOOR = ["Sunny", "Cloudy"];

  function m(estimatedDuration, bestTimeOfDay, bestSeason, weatherSuitability, visitorTypes,
             activityLevel, hiddenGemScore, knowledgeValue, photoValue, accessibilityLevel, budgetLevel, extra) {
    var o = {
      estimatedDuration: estimatedDuration,
      bestTimeOfDay: bestTimeOfDay,
      bestSeason: bestSeason,
      weatherSuitability: weatherSuitability,
      visitorTypes: visitorTypes,
      activityLevel: activityLevel,
      hiddenGemScore: hiddenGemScore,
      knowledgeValue: knowledgeValue,
      photoValue: photoValue,
      accessibilityLevel: accessibilityLevel, // VERIFY
      budgetLevel: budgetLevel
    };
    for (var k in extra || {}) o[k] = extra[k];
    return o;
  }

  // Open bookshelves are all alike: a quick, free stop, any time, mostly locals.
  function bookshelf(extra) {
    return m("15 Minutes", ["Morning", "Afternoon", "Evening"], ["All Year"], OUTDOOR,
      ["Solo", "Students", "Locals", "Families"], "Very Relaxed", 8, 6, 3, "Step-free", "Free", extra);
  }

  // Indoor museums: good in any weather, all year.
  function museum(duration, times, visitors, activity, gem, knowledge, photo, access) {
    return m(duration, times, ["All Year"], ALL_WEATHER, visitors, activity, gem, knowledge, photo, access, "Free");
  }

  window.GO_PLACES_LAYER.placeMeta = {
    // ---------- data/spots.js ----------
    "glockenspiel":        m("30 Minutes", ["Morning", "Afternoon"], ["All Year"], OUTDOOR, ["Tourists", "Families", "Friends", "Solo", "Students"], "Very Relaxed", 2, 7, 7, "Step-free", "Free"),
    "hackerbruecke":       m("1 Hour", ["Sunset", "Evening"], ["Spring", "Summer", "Autumn"], OUTDOOR, ["Friends", "Couples", "Students", "Locals", "Solo"], "Very Relaxed", 4, 4, 9, "Partly step-free", "Free"),
    "hinterbruehl":        m("30 Minutes", ["Afternoon", "Sunset"], ["All Year"], OUTDOOR, ["Families", "Couples", "Solo", "Locals"], "Very Relaxed", 8, 3, 8, "Partly step-free", "Free"),
    "raftsman-statue":     m("15 Minutes", ["Afternoon", "Sunset"], ["All Year"], OUTDOOR, ["Solo", "Couples", "Locals"], "Very Relaxed", 9, 5, 8, "Partly step-free", "Free"),
    "frauenkirche":        m("30 Minutes", ["Morning", "Afternoon"], ["All Year"], ALL_WEATHER, ["Tourists", "Families", "Solo", "Students"], "Very Relaxed", 2, 8, 7, "Step-free", "Free"),
    "alter-peter":         m("1 Hour", ["Morning", "Afternoon"], ["All Year"], OUTDOOR, ["Tourists", "Friends", "Couples", "Solo", "Students"], "Active", 3, 7, 10, "Not step-free", "Under 5€"),
    "asamkirche":          m("15 Minutes", ["Morning", "Afternoon"], ["All Year"], ALL_WEATHER, ["Solo", "Couples", "Students", "Tourists"], "Very Relaxed", 6, 8, 8, "Partly step-free", "Free"),
    "eisbach":             m("30 Minutes", ["Morning", "Afternoon", "Evening"], ["All Year"], OUTDOOR, ["Friends", "Tourists", "Families", "Solo", "Couples"], "Very Relaxed", 3, 4, 8, "Step-free", "Free"),
    "chinesischer-turm":   m("2 Hours", ["Afternoon", "Evening"], ["Spring", "Summer", "Autumn"], ["Sunny"], ["Friends", "Families", "Tourists", "Students", "Locals"], "Relaxed", 2, 4, 6, "Step-free", "Free"),
    "monopteros":          m("30 Minutes", ["Sunset", "Evening"], ["Spring", "Summer", "Autumn"], OUTDOOR, ["Couples", "Friends", "Tourists", "Students"], "Relaxed", 3, 5, 9, "Partly step-free", "Free"),
    "koenigsplatz":        m("30 Minutes", ["Afternoon", "Evening"], ["All Year"], OUTDOOR, ["Solo", "Students", "Tourists", "Couples"], "Very Relaxed", 4, 7, 8, "Step-free", "Free"),
    "viktualienmarkt":     m("1 Hour", ["Morning", "Afternoon"], ["All Year"], OUTDOOR, ["Tourists", "Friends", "Couples", "Families", "Locals"], "Relaxed", 2, 4, 7, "Step-free", "Free"),
    "olympiaberg":         m("1 Hour", ["Sunset", "Morning"], ["Spring", "Summer", "Autumn"], ["Sunny"], ["Friends", "Couples", "Families", "Students", "Locals", "Solo"], "Moderate", 4, 4, 10, "Partly step-free", "Free"),
    "olympiapark-sports":  m("1 Hour", ["Morning", "Afternoon"], ["Spring", "Summer", "Autumn"], OUTDOOR, ["Friends", "Families", "Students", "Locals", "Solo"], "Active", 6, 1, 4, "Step-free", "Free"),
    "nymphenburg-monopteros": m("1 Hour", ["Afternoon", "Sunset"], ["All Year"], ["Sunny", "Cloudy", "Snow"], ["Couples", "Families", "Solo", "Locals"], "Relaxed", 7, 5, 9, "Partly step-free", "Free"),
    "wittelsbacherplatz":  m("15 Minutes", ["Evening", "Night"], ["All Year"], OUTDOOR, ["Solo", "Couples", "Students"], "Very Relaxed", 6, 6, 7, "Step-free", "Free"),
    "botanischer-garten":  m("2 Hours", ["Morning", "Afternoon"], ["Autumn", "Winter"], OUTDOOR, ["Couples", "Families", "Solo", "Students"], "Relaxed", 5, 7, 8, "Step-free", "Under 10€", { budgetBySeason: { "Winter": "Free" } }),
    "rosengarten-untergiesing": m("1 Hour", ["Morning", "Afternoon", "Evening"], ["Spring", "Summer"], ["Sunny"], ["Couples", "Solo", "Families", "Locals"], "Very Relaxed", 8, 3, 8, "Step-free", "Free"),
    "walderlebniszentrum-gruenwald": m("Half Day", ["Afternoon"], ["All Year"], OUTDOOR, ["Families", "Friends", "Couples", "Locals"], "Moderate", 8, 7, 7, "Partly step-free", "Free"),
    "motorworld":          m("1 Hour", ["Morning", "Afternoon", "Evening"], ["All Year"], ALL_WEATHER, ["Friends", "Families", "Tourists", "Solo", "Couples"], "Very Relaxed", 6, 5, 8, "Step-free", "Free"),
    "schleissheim":        m("Half Day", ["Morning", "Afternoon"], ["Spring", "Summer", "Autumn"], OUTDOOR, ["Families", "Couples", "Friends", "Tourists"], "Moderate", 6, 7, 9, "Partly step-free", "Free"),
    "dachau-schloss":      m("Half Day", ["Afternoon", "Sunset"], ["Spring", "Summer", "Autumn"], ["Sunny"], ["Couples", "Tourists", "Solo"], "Relaxed", 7, 6, 8, "Partly step-free", "Free"),
    "field-sunset":        m("1 Hour", ["Sunset"], ["Spring", "Summer"], ["Sunny"], ["Couples", "Solo", "Friends", "Locals"], "Relaxed", 9, 2, 10, "Not step-free", "Free"),
    "forstenrieder-park":  m("Half Day", ["Sunrise", "Morning"], ["All Year"], ["Sunny", "Cloudy", "Snow"], ["Solo", "Friends", "Families", "Locals"], "Active", 7, 4, 8, "Partly step-free", "Free"),
    "westpark":            m("2 Hours", ["Afternoon", "Evening"], ["Spring", "Summer", "Autumn"], OUTDOOR, ["Families", "Couples", "Friends", "Locals", "Solo"], "Relaxed", 6, 4, 7, "Step-free", "Free"),
    "froettmaninger-berg": m("1 Hour", ["Sunset"], ["Spring", "Summer", "Autumn"], ["Sunny"], ["Solo", "Couples", "Friends", "Locals"], "Moderate", 8, 6, 9, "Not step-free", "Free"),
    "nymphenburg-canal":   m("1 Hour", ["Afternoon", "Sunset"], ["All Year"], ["Sunny", "Cloudy", "Snow"], ["Couples", "Families", "Tourists", "Solo"], "Relaxed", 4, 6, 9, "Step-free", "Free"),

    // ---------- data/free-knowledge.js: public bookshelves ----------
    "bookshelf-muenchner-freiheit":     bookshelf({ hiddenGemScore: 7, photoValue: 5 }),
    "bookshelf-nordbad":                bookshelf(),
    "bookshelf-oertelplatz":            bookshelf(),
    "bookshelf-dreimuehlenviertel":     bookshelf(),
    "bookshelf-glockenbach":            bookshelf(),
    "bookshelf-genoveva-schauer-platz": bookshelf(),
    "bookshelf-mangfallplatz":          bookshelf(),
    "bookshelf-rudi-hierl-platz":       bookshelf(),
    "bookshelf-lenbachhaus":            bookshelf({ hiddenGemScore: 6, knowledgeValue: 7, photoValue: 6, visitorTypes: ["Solo", "Students", "Tourists", "Couples"] }),
    "bookshelf-volkartstrasse":         bookshelf(),
    "bookshelf-waisenhausstrasse":      bookshelf(),
    "bookshelf-denninger-anger":        bookshelf(),
    "bookshelf-baumkirchner-strasse":   bookshelf(),
    "bookshelf-moosach-1":              bookshelf(),
    "bookshelf-moosach-2":              bookshelf({ knowledgeValue: 7 }),
    "bookshelf-herterichstrasse":       bookshelf(),
    "bookshelf-herzog-ernst-platz":     bookshelf(),
    "bookshelf-laimer-anger":           bookshelf(),
    "bookshelf-oberschleissheim":       bookshelf(),

    // ---------- data/free-knowledge.js: free museums and the library ----------
    "palaeontological-museum": museum("1 Hour", ["Morning", "Afternoon"], ["Families", "Students", "Solo", "Tourists"], "Relaxed", 7, 10, 6, "Not step-free"),
    "ns-dokuzentrum":          museum("2 Hours", ["Morning", "Afternoon"], ["Students", "Solo", "Tourists", "Friends"], "Relaxed", 5, 10, 3, "Step-free"),
    "abgussmuseum":            museum("1 Hour", ["Morning", "Afternoon", "Evening"], ["Students", "Solo", "Couples"], "Relaxed", 8, 8, 8, "Partly step-free"),
    "monacensia":              museum("1 Hour", ["Morning", "Afternoon"], ["Solo", "Students", "Couples", "Remote Workers"], "Very Relaxed", 8, 8, 6, "Partly step-free"),
    "rathausgalerie":          museum("30 Minutes", ["Morning", "Afternoon"], ["Solo", "Students", "Tourists"], "Very Relaxed", 6, 6, 4, "Step-free"),
    "kunstarkaden":            museum("30 Minutes", ["Afternoon", "Evening"], ["Solo", "Students", "Couples"], "Very Relaxed", 8, 6, 4, "Step-free"),
    "lothringer-13":           museum("30 Minutes", ["Afternoon", "Evening"], ["Solo", "Students", "Friends", "Locals"], "Very Relaxed", 8, 6, 6, "Step-free"),
    "maximiliansforum":        museum("15 Minutes", ["Morning", "Afternoon", "Evening", "Night"], ["Solo", "Students", "Locals"], "Very Relaxed", 9, 5, 5, "Partly step-free"),
    "geological-museum":       museum("1 Hour", ["Morning", "Afternoon"], ["Families", "Students", "Solo"], "Relaxed", 8, 9, 5, "Not step-free"),
    "amerikahaus":             museum("30 Minutes", ["Morning", "Afternoon"], ["Students", "Solo", "Tourists"], "Very Relaxed", 7, 7, 5, "Step-free"),
    "eso-supernova":           museum("2 Hours", ["Morning", "Afternoon"], ["Families", "Students", "Friends", "Solo", "Couples"], "Relaxed", 6, 10, 7, "Step-free"),
    "hp8-library":             museum("2 Hours", ["Morning", "Afternoon", "Evening"], ["Remote Workers", "Students", "Solo", "Locals", "Friends"], "Very Relaxed", 8, 8, 5, "Step-free")
  };
})();
