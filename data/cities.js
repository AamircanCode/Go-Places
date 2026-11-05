/*
 * GO PLACES — cities
 * ==================
 * Every city has its own set of content files. This file lists the cities
 * and loads the files of the one the visitor picked, so the rest of the app
 * only ever sees one city at a time.
 *
 * To ADD A CITY:
 *   1. Make a folder data/<city-id>/ and copy the files from data/berlin/
 *      into it (spots.js is the only one you need; the others are optional).
 *   2. Change the content, and put the city's photos in images/<city-id>/.
 *   3. Add a block to `cities` below with the same id and the list of files.
 * That's it: the city then shows up in the city switcher in the top bar.
 *
 *   id       short name, lowercase, no spaces (used in links: ?city=berlin)
 *   name     what people see
 *   emoji    shown in the city switcher
 *   tagline  one short line under the name in the city switcher
 *   files    the city's content files, loaded in this order. spots.js must
 *            come first, because the other files add to it. place-meta.js
 *            and collections.js are optional (see data/place-meta.js).
 *
 * Which city opens: the one in the link (?city=berlin), otherwise the last
 * one this device picked. On a first visit (neither), `defaultCity` loads
 * behind a "Where are you exploring?" picker, and nothing is remembered
 * until the visitor picks a city.
 */
window.GO_PLACES_CITIES = {
  defaultCity: "munich",

  cities: [
    {
      id: "munich",
      name: "Munich",
      emoji: "🥨",
      tagline: "Beer gardens, river surfers and Alpine sunsets",
      files: [
        "data/spots.js",
        "data/activities.js",
        "data/hidden-gems.js",
        "data/quests.js",
        "data/free-knowledge.js",
        "data/place-meta.js",
        "data/collections.js"
      ]
    },
    {
      id: "berlin",
      name: "Berlin",
      emoji: "🐻",
      tagline: "The Wall, rooftops, flak towers and lakes",
      files: [
        "data/berlin/spots.js",
        "data/berlin/activities.js",
        "data/berlin/hidden-gems.js",
        "data/berlin/quests.js",
        "data/berlin/free-knowledge.js"
      ]
    }
  ]
};

(function () {
  "use strict";
  var CFG = window.GO_PLACES_CITIES;
  var KEY = "goplaces.city";

  function find(id) {
    return CFG.cities.filter(function (c) { return c.id === id; })[0];
  }

  var fromLink = (new URLSearchParams(location.search).get("city") || "").toLowerCase();
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) { /* private mode */ }

  var chosen = find(fromLink) || find(saved);
  var city = chosen || find(CFG.defaultCity) || CFG.cities[0];
  CFG.current = city.id;
  // No city in the link and none picked on this device yet: app.js asks.
  CFG.firstVisit = !chosen;
  // Until then, leave storage and the address alone, so a reload still asks.
  if (chosen) {
    try { localStorage.setItem(KEY, city.id); } catch (e) { /* private mode */ }
  }

  // Keep the city in the address, so any link copied from here opens it.
  var params = new URLSearchParams(location.search);
  if (chosen && params.get("city") !== city.id && window.history && history.replaceState) {
    params.set("city", city.id);
    history.replaceState(history.state, "", location.pathname + "?" + params.toString() + location.hash);
  }

  // Loads the city's files in order, before the scripts that come after this
  // one in index.html (document.write during page load keeps that order).
  var tags = city.files.map(function (src) {
    return '<script src="' + src + '"><\/script>';
  });
  tags.push('<script>window.GO_PLACES.cityId = ' + JSON.stringify(city.id) + ';<\/script>');
  document.write(tags.join(""));
})();
