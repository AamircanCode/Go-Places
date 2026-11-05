(function () {
  "use strict";

  var DATA = window.GO_PLACES;
  var ACCT = window.GoAccount || { enabled: false };
  var DISCOVER = window.GoDiscover; // the "What can I do?" layer, optional
  var KNOWLEDGE = window.GoKnowledge; // the Free Knowledge category, optional
  var SOCIAL = window.GoSocial; // follows, explorers, feed, ratings, privacy; optional
  var LIGHTBOX = window.GoLightbox; // full-size photo viewer, optional
  var META = window.GoMeta; // place metadata ("At a glance"), optional
  var COLLECTIONS = window.GoCollections; // collections of places, optional
  var PLAN = window.GoPlan; // Plan My Day, optional
  var SUBMIT = window.GoSubmissions; // suggest a place or photo, and the review queue; optional
  var CITIES = window.GO_PLACES_CITIES || { cities: [] }; // data/cities.js
  var STORAGE_KEY = "goplaces.explored";
  var HIDE_KEY = "goplaces.hideExplored"; // "1" when explored places are hidden

  var state = {
    theme: "all",
    explored: loadExplored(),
    hideExplored: loadHideExplored(),
    me: null,
    openSpotId: null,
    view: null
  };

  // ---------- helpers ----------
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function loadExplored() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch (e) { return {}; }
  }

  function saveExplored() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.explored)); } catch (e) { /* private mode */ }
  }

  // The "Hide explored" filter is a per-device preference, remembered across visits.
  function loadHideExplored() {
    try { return localStorage.getItem(HIDE_KEY) === "1"; }
    catch (e) { return false; }
  }

  function setHideExplored(on) {
    state.hideExplored = !!on;
    try {
      if (on) localStorage.setItem(HIDE_KEY, "1");
      else localStorage.removeItem(HIDE_KEY);
    } catch (e) { /* private mode */ }
    renderThemes();
    renderMarkers();
    if (state.view === "list") openList();
    else if (state.view === "filters") openFilters();
  }

  // Signed in: explored spots come from the account. Otherwise from this device.
  function exploredMap() {
    return ACCT.user ? ACCT.visits : state.explored;
  }

  function themeById(id) {
    return DATA.themes.filter(function (t) { return t.id === id; })[0];
  }

  function spotById(id) {
    return DATA.spots.filter(function (s) { return s.id === id; })[0];
  }

  // Spots in the chosen theme, before the "Hide explored" filter.
  function themeSpots() {
    if (state.theme === "all") return DATA.spots;
    return DATA.spots.filter(function (s) { return s.themes.indexOf(state.theme) !== -1; });
  }

  // What the map and the list show: the theme's spots, minus explored ones
  // when "Hide explored" is on.
  function visibleSpots() {
    var spots = themeSpots();
    if (!state.hideExplored) return spots;
    var explored = exploredMap();
    return spots.filter(function (s) { return !explored[s.id]; });
  }

  // A link to this page that opens the current city, e.g. for sharing.
  function cityUrl(hash) {
    var id = DATA.cityId || CITIES.current;
    return location.origin + location.pathname + (id ? "?city=" + encodeURIComponent(id) : "") + (hash ? "#" + hash : "");
  }

  function distanceKm(a, b) {
    var R = 6371, toRad = Math.PI / 180;
    var dLat = (b[0] - a[0]) * toRad, dLng = (b[1] - a[1]) * toRad;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(a[0] * toRad) * Math.cos(b[0] * toRad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  function distanceLabel(spot) {
    if (!state.me) return "";
    var km = distanceKm(state.me, [spot.lat, spot.lng]);
    return km < 1 ? Math.round(km * 1000) + " m away" : km.toFixed(1) + " km away";
  }

  // ---------- map ----------
  var map = L.map("map", { zoomControl: false }).setView(DATA.center, DATA.zoom);
  L.control.zoom({ position: "bottomleft" }).addTo(map);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  var markers = {};
  var markerLayer = L.layerGroup().addTo(map);

  function markerIcon(spot) {
    var done = exploredMap()[spot.id] ? " done" : "";
    return L.divIcon({
      className: "",
      html: '<div class="spot-marker' + done + '">' + esc(spot.emoji || "📍") + "</div>",
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
  }

  // Pins that would overlap on screen are drawn as one numbered circle;
  // tapping it zooms in until they separate. Recomputed on every zoom.
  var CLUSTER_PX = 54;

  function renderMarkers() {
    markerLayer.clearLayers();
    markers = {};
    var zoom = map.getZoom();
    var groups = [];
    visibleSpots().forEach(function (spot) {
      var pt = map.project([spot.lat, spot.lng], zoom);
      var g = zoom >= CLUSTER_MAX_ZOOM ? null : groups.filter(function (g) { return g.pt.distanceTo(pt) < CLUSTER_PX; })[0];
      if (g) g.spots.push(spot);
      else groups.push({ pt: pt, spots: [spot] });
    });
    groups.forEach(function (g) {
      if (g.spots.length === 1) {
        var spot = g.spots[0];
        var m = L.marker([spot.lat, spot.lng], { icon: markerIcon(spot), title: spot.name, keyboard: true });
        m.on("click", function () { openSpot(spot.id); });
        m.addTo(markerLayer);
        markers[spot.id] = m;
        return;
      }
      var bounds = L.latLngBounds(g.spots.map(function (s) { return [s.lat, s.lng]; }));
      var n = g.spots.length;
      // Drawn where its first pin is, so circles keep their distance from each other.
      var c = L.marker(map.unproject(g.pt, zoom), {
        icon: L.divIcon({ className: "", html: '<div class="spot-cluster">' + n + "</div>", iconSize: [44, 44], iconAnchor: [22, 22] }),
        title: n + " places here, tap to zoom in", keyboard: true
      });
      c.on("click", function () {
        var next = Math.min(map.getBoundsZoom(bounds, false, L.point(60, 60)), CLUSTER_MAX_ZOOM);
        map.setView(bounds.getCenter(), Math.max(next, map.getZoom() + 1));
      });
      c.addTo(markerLayer);
    });
  }
  var CLUSTER_MAX_ZOOM = 17;
  map.on("zoomend", renderMarkers);

  function fitToVisible() {
    var spots = visibleSpots();
    if (!spots.length) return;
    var bounds = L.latLngBounds(spots.map(function (s) { return [s.lat, s.lng]; }));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }

  // ---------- theme chips ----------
  function renderThemes() {
    var el = document.getElementById("themes");
    var all = [{ id: "all", name: "All", emoji: "🗺️" }].concat(DATA.themes);
    el.innerHTML =
      '<button class="chip filters-chip' + (state.hideExplored ? " on" : "") + '" data-filters aria-haspopup="true">⚙︎ Filters' + (state.hideExplored ? " · 1" : "") + "</button>" +
      '<button class="chip" data-list>☰ List</button>' +
      '<span class="chip-divider" aria-hidden="true"></span>' + all.map(function (t) {
      var active = t.id === state.theme ? " active" : "";
      return '<button class="chip' + active + '" data-theme="' + esc(t.id) + '" title="' + esc(t.name) + '">' + esc(t.emoji) + " " + esc(t.short || t.name) + "</button>";
    }).join("");
  }

  // The Filters sheet. Only "Hide explored" for now; more filters can join it.
  function openFilters() {
    state.view = "filters";
    state.openSpotId = null;
    history.replaceState(null, "", location.pathname + location.search);
    showSheet(
      '<h2 class="list-title">Filters</h2>' +
      '<p class="list-desc">Choose what the map and list show.</p>' +
      '<div class="list-filter">' + hideToggle("btn") + "</div>" +
      '<button class="btn primary wide" data-close-sheet>Show the map</button>'
    );
  }

  // An on/off switch that hides spots you've already explored.
  function hideToggle(cls) {
    var on = state.hideExplored;
    return '<button class="' + cls + ' hide-toggle' + (on ? " on" : "") + '" data-hide-explored role="switch" aria-checked="' + on + '"' +
      ' title="' + (on ? "Show spots you've explored again" : "Hide spots you've already explored") + '">' +
      '<span class="switch" aria-hidden="true"></span> Hide explored</button>';
  }

  document.getElementById("themes").addEventListener("click", function (e) {
    if (e.target.closest("[data-filters]")) { openFilters(); return; }
    if (e.target.closest("[data-list]")) { openList(); return; }
    var btn = e.target.closest("[data-theme]");
    if (!btn) return;
    state.theme = btn.getAttribute("data-theme");
    renderThemes();
    renderMarkers();
    fitToVisible();
    if (state.theme === "free-knowledge" && KNOWLEDGE) KNOWLEDGE.openHome();
    else if (state.theme !== "all") openList();
  });

  // ---------- bottom sheet ----------
  var sheet = document.getElementById("sheet");
  var sheetBody = document.getElementById("sheet-body");

  function showSheet(html) {
    sheet.classList.remove("must-choose");
    sheetBody.innerHTML = html;
    sheet.classList.add("open");
    sheet.setAttribute("aria-hidden", "false");
    sheet.scrollTop = 0;
    updateTabs();
  }

  function closeSheet() {
    sheet.classList.remove("open");
    sheet.setAttribute("aria-hidden", "true");
    state.openSpotId = null;
    state.view = null;
    stopSpeaking();
    if (DISCOVER) DISCOVER.onClose();
    if (KNOWLEDGE) KNOWLEDGE.onClose();
    if (SOCIAL) SOCIAL.onClose();
    if (COLLECTIONS) COLLECTIONS.onClose();
    if (PLAN) PLAN.onClose();
    if (SUBMIT) SUBMIT.onClose();
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
    updateTabs();
  }

  document.getElementById("sheet-close").addEventListener("click", closeSheet);

  function photoBlock(spot) {
    var photos = spot.photos || [];
    if (!photos.length) {
      return '<div class="photo emoji-only">' + esc(spot.emoji || "📍") + "</div>";
    }
    var html = '<div class="photo" id="main-photo">' + mainPhoto(spot, 0, ' onerror="this.remove()"') + "</div>";
    if (photos.length > 1) {
      html += '<div class="photo-strip">' + photos.map(function (p, i) {
        return '<img src="' + esc(p.url) + '" alt="" data-photo="' + i + '" onerror="this.remove()">';
      }).join("") + "</div>";
    }
    return html;
  }

  // The big photo on a spot page; tapping it opens the full-size viewer.
  function mainPhoto(spot, i, extra) {
    var p = spot.photos[i];
    var zoom = LIGHTBOX ? LIGHTBOX.attrs(spot.photos.map(function (ph) {
      return { src: ph.url, caption: [spot.name, ph.credit].filter(Boolean).join(" · ") };
    }), i) : "";
    return '<img src="' + esc(p.url) + '" alt="' + esc(spot.name) + '"' + zoom + (extra || "") + ">" +
      (p.credit ? '<span class="credit">' + esc(p.credit) + "</span>" : "");
  }

  // "Around here": things to do near a spot, from its optional `around` list.
  function aroundBlock(spot) {
    var items = (spot.around || []).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");
    return items ? '<div class="spot-section"><h3>Around here</h3><ul>' + items + "</ul></div>" : "";
  }

  // "Nearby spots": the spot's own `nearby` ids first, then the closest other
  // spots within walking distance, up to five, each a link to its page.
  function nearbyBlock(spot) {
    var here = [spot.lat, spot.lng];
    var picked = (spot.nearby || []).map(spotById).filter(function (s) { return s && s.id !== spot.id; });
    var closest = DATA.spots
      .filter(function (s) { return s.id !== spot.id && picked.indexOf(s) === -1; })
      .map(function (s) { return { s: s, km: distanceKm(here, [s.lat, s.lng]) }; })
      .filter(function (x) { return x.km <= 1.5; })
      .sort(function (a, b) { return a.km - b.km; })
      .map(function (x) { return x.s; });
    var list = picked.concat(closest).slice(0, Math.max(5, picked.length));
    if (!list.length) return "";
    return '<div class="spot-section"><h3>Nearby spots</h3>' + list.map(function (s) {
      var km = distanceKm(here, [s.lat, s.lng]);
      var walk = km < 3 ? Math.max(1, Math.round(km * 1000 / 80)) + " min walk" : km.toFixed(1) + " km";
      return '<a class="list-item" href="#' + encodeURIComponent(s.id) + '">' +
        '<span class="emoji">' + esc(s.emoji || "📍") + "</span>" +
        '<span><span class="name">' + esc(s.name) + '</span><br><span class="sub">' + esc(walk) + "</span></span>" +
      "</a>";
    }).join("") + "</div>";
  }

  function openSpot(id) {
    var spot = spotById(id);
    if (!spot) return;
    state.openSpotId = id;
    state.view = "spot";
    history.replaceState(null, "", "#" + id);

    // Themes already show under "Included in collections", so only list them
    // here when collections are off. Moods and the knowledge group go into
    // the "At a glance" card.
    var tags = (COLLECTIONS ? "" : spot.themes.map(function (tid) {
      var t = themeById(tid);
      return t ? '<span class="tag">' + esc(t.emoji) + " " + esc(t.name) + "</span>" : "";
    }).join("")) + (KNOWLEDGE ? KNOWLEDGE.spotTags(spot, COLLECTIONS ? DATA.themes : null) : "");

    var facts = (spot.funFacts || []).map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("");
    var done = !!exploredMap()[id];
    var wished = ACCT.user && !!ACCT.wishlist[id];
    var dist = distanceLabel(spot);
    var directions = "https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=" + spot.lat + "," + spot.lng;

    var saved = wished || (COLLECTIONS && COLLECTIONS.inAny(spot.id));
    var canSave = COLLECTIONS || ACCT.enabled;
    var canRate = SOCIAL && SOCIAL.ready();
    var line = [spot.cost, spot.when, dist].filter(Boolean).map(esc).join(" · ");

    showSheet(
      photoBlock(spot) +
      '<h2 class="spot-title">' + esc(spot.name) + "</h2>" +
      '<p class="meta spot-line">' + line + "</p>" +
      (KNOWLEDGE ? KNOWLEDGE.spotFacts(spot) : "") +
      '<div class="spot-main">' +
        '<a class="btn primary" target="_blank" rel="noopener" href="' + directions + '">🧭 Directions</a>' +
        '<button class="btn' + (done ? " done" : "") + '" id="explored-btn">' + (done ? "✅ Explored" : "☐ Explored") + "</button>" +
        (canSave ? '<button class="btn' + (saved ? " wished" : "") + '" id="save-btn">' + (saved ? "💚 Saved" : "♡ Save") + "</button>" : "") +
      "</div>" +
      '<div class="spot-icons">' +
        ('speechSynthesis' in window ? '<button id="listen-btn"><b>🔊</b><span>Listen</span></button>' : "") +
        (ACCT.enabled ? '<button id="add-photo-btn"><b>📷</b><span>Add photo</span></button>' : "") +
        (canRate ? '<button id="rate-btn"><b>☆</b><span>Rate</span></button>' : "") +
        '<button id="share-btn"><b>↗</b><span>Share</span></button>' +
      "</div>" +
      myPhotosBlock(spot) +
      '<p class="summary">' + esc(spot.summary) + "</p>" +
      (spot.tip ? '<div class="tip">👉 ' + esc(spot.tip) + "</div>" : "") +
      (SUBMIT ? SUBMIT.spotNote(spot) : "") +
      (META ? META.glance(spot, tags) : (tags ? '<div class="tags">' + tags + "</div>" : "")) +
      (KNOWLEDGE ? KNOWLEDGE.spotSections(spot) : "") +
      (DISCOVER ? DISCOVER.spotSection(spot) : "") +
      (spot.history || facts ? '<details class="spot-section fold"><summary><h3>History' + (facts ? " &amp; fun facts" : "") + "</h3></summary>" +
        (spot.history ? "<p>" + esc(spot.history) + "</p>" : "") +
        (facts ? '<h4 class="fold-sub">💡 Fun facts</h4><ul>' + facts + "</ul>" : "") + "</details>" : "") +
      aroundBlock(spot) +
      nearbyBlock(spot) +
      (COLLECTIONS ? COLLECTIONS.spotSection(spot) : "") +
      (SOCIAL ? SOCIAL.ratingSection(spot) : "")
    );

    map.panTo([spot.lat, spot.lng]);
    wireSpotButtons(spot);
    if (SOCIAL) SOCIAL.afterSpot(spot);
    if (COLLECTIONS) COLLECTIONS.afterSpot(spot);
  }

  function wireSpotButtons(spot) {
    var exploredBtn = document.getElementById("explored-btn");
    exploredBtn.addEventListener("click", function () {
      var on = !exploredMap()[spot.id];
      if (ACCT.user) {
        ACCT.setVisited(spot.id, on).catch(function (err) { alert("Couldn't save that: " + err.message); });
      } else {
        if (on) state.explored[spot.id] = new Date().toISOString();
        else delete state.explored[spot.id];
        saveExplored();
      }
      refreshExplored(spot.id);
      openSpot(spot.id);
    });

    // One Save button: the wishlist and your collections, in one picker.
    var saveBtn = document.getElementById("save-btn");
    if (saveBtn) saveBtn.addEventListener("click", function () {
      if (COLLECTIONS) { COLLECTIONS.openPicker(spot.id); return; }
      if (!ACCT.user) { openSignIn("Sign in to keep a wishlist of spots you want to visit."); return; }
      ACCT.setWished(spot.id, !ACCT.wishlist[spot.id])
        .catch(function (err) { alert("Couldn't save that: " + err.message); });
      openSpot(spot.id);
    });

    var rateBtn = document.getElementById("rate-btn");
    if (rateBtn) rateBtn.addEventListener("click", function () {
      var box = document.getElementById("rating-box");
      if (box) box.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    var addPhotoBtn = document.getElementById("add-photo-btn");
    if (addPhotoBtn) addPhotoBtn.addEventListener("click", function () {
      if (!ACCT.user) { openSignIn("Sign in to add your own photos of this spot."); return; }
      pickPhoto(spot);
    });

    var listenBtn = document.getElementById("listen-btn");
    if (listenBtn) listenBtn.addEventListener("click", function () {
      var label = listenBtn.querySelector("span");
      if (speechSynthesis.speaking) { stopSpeaking(); label.textContent = "Listen"; return; }
      var text = [spot.name + ".", spot.summary, spot.history || ""]
        .concat((spot.funFacts || []).length ? ["Fun facts."].concat(spot.funFacts) : [])
        .join(" ");
      var u = new SpeechSynthesisUtterance(text);
      u.lang = "en-GB";
      u.onend = function () { label.textContent = "Listen"; };
      speechSynthesis.speak(u);
      label.textContent = "Stop";
    });

    document.getElementById("share-btn").addEventListener("click", function () {
      var url = cityUrl(spot.id);
      if (navigator.share) {
        navigator.share({ title: spot.name, text: spot.summary, url: url }).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url);
        this.querySelector("span").textContent = "Copied";
      }
    });

    var strip = sheetBody.querySelector(".photo-strip");
    if (strip) strip.addEventListener("click", function (e) {
      var i = e.target.getAttribute("data-photo");
      if (i == null) return;
      document.getElementById("main-photo").innerHTML = mainPhoto(spot, +i);
    });
  }

  function stopSpeaking() {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
  }

  // ---------- list view ----------
  function openList() {
    state.view = "list";
    var theme = themeById(state.theme);
    var spots = visibleSpots().slice();
    var hiddenCount = themeSpots().length - spots.length;
    if (state.me) {
      spots.sort(function (a, b) {
        return distanceKm(state.me, [a.lat, a.lng]) - distanceKm(state.me, [b.lat, b.lng]);
      });
    }
    showSheet(
      '<h2 class="list-title">' + (theme ? esc(theme.emoji + " " + theme.name) : "All spots") + "</h2>" +
      '<p class="list-desc">' + (theme ? esc(theme.description) : "Everything you can explore in " + esc(DATA.city) + ".") + "</p>" +
      '<div class="list-filter">' + hideToggle("btn small") +
        (hiddenCount ? '<span class="sub">' + hiddenCount + " explored " + (hiddenCount === 1 ? "spot" : "spots") + " hidden</span>" : "") +
      "</div>" +
      (!spots.length && hiddenCount ? '<p class="empty">You\'ve explored every spot here. 🎉 Turn off "Hide explored" to see them again.</p>' : "") +
      spots.map(function (s) {
        var sub = [s.cost, distanceLabel(s)].filter(Boolean).join(" · ");
        return '<button class="list-item" data-spot="' + esc(s.id) + '">' +
          '<span class="emoji">' + esc(s.emoji) + "</span>" +
          '<span><span class="name">' + esc(s.name) + '</span><br><span class="sub">' + esc(sub) + "</span></span>" +
          '<span class="check">' + (exploredMap()[s.id] ? "✅" : "") + "</span>" +
        "</button>";
      }).join("")
    );
  }

  sheetBody.addEventListener("click", function (e) {
    if ((state.view === "list" || state.view === "filters") && e.target.closest("[data-hide-explored]")) { setHideExplored(!state.hideExplored); return; }
    if (e.target.closest("[data-close-sheet]")) { closeSheet(); return; }
    var item = e.target.closest(".list-item");
    if (item && item.hasAttribute("data-spot")) openSpot(item.getAttribute("data-spot"));
  });

  // ---------- city switcher ----------
  // Each city is its own set of content files (data/cities.js), so switching
  // reloads the page with ?city=… . Explored spots, wishlist and badges are
  // kept per account or device, across all cities.
  //
  // On a first visit (no city picked on this device yet), the app opens on
  // this list as a welcome step that can't be closed: picking a city reloads
  // into it and remembers it, and the switcher in the top bar changes it later.
  function openCities(welcome) {
    state.view = "cities";
    state.openSpotId = null;
    stopSpeaking();
    history.replaceState(null, "", welcome ? location.pathname + location.search : "#cities");
    var current = DATA.cityId || CITIES.current;
    showSheet(
      (welcome
        ? '<h2 class="list-title">Where are you exploring?</h2>' +
          '<p class="list-desc">Welcome to Go Places. Pick your city to see its spots, sunsets and side quests. You can switch any time from the top bar.</p>'
        : '<h2 class="list-title">Choose a city</h2>' +
          '<p class="list-desc">Go Places is growing. Pick a city to explore; more are on the way.</p>') +
      CITIES.cities.map(function (c) {
        var here = !welcome && c.id === current;
        return '<a class="list-item city-item' + (here ? " current" : "") + '" href="?city=' + encodeURIComponent(c.id) + '">' +
          '<span class="emoji">' + esc(c.emoji || "📍") + "</span>" +
          '<span><span class="name">' + esc(c.name) + '</span><br><span class="sub">' + esc(c.tagline || "") + "</span></span>" +
          '<span class="check">' + (here ? "✓ You're here" : "") + "</span>" +
        "</a>";
      }).join("")
    );
    if (welcome) sheet.classList.add("must-choose");
  }

  document.getElementById("city-btn").addEventListener("click", function () { openCities(false); });
  if (CITIES.cities.length < 2) document.getElementById("city-btn").disabled = true;

  function spotList(ids, emptyText, dates) {
    var spots = ids.map(spotById).filter(Boolean);
    if (!spots.length) return '<p class="empty">' + esc(emptyText) + "</p>";
    return spots.map(function (s) {
      var sub = dates && dates[s.id] ? formatDate(dates[s.id]) : s.cost;
      return '<button class="list-item" data-spot="' + esc(s.id) + '">' +
        '<span class="emoji">' + esc(s.emoji) + "</span>" +
        '<span><span class="name">' + esc(s.name) + '</span><br><span class="sub">' + esc(sub) + "</span></span>" +
      "</button>";
    }).join("");
  }


  // ---------- my location ----------
  var meMarker = null;
  var watching = false;

  document.getElementById("locate-btn").addEventListener("click", function () {
    if (!navigator.geolocation) { alert("Your browser can't share its location."); return; }
    if (state.me) map.setView(state.me, 15);
    if (watching) return;
    watching = true;
    var first = true;
    navigator.geolocation.watchPosition(function (pos) {
      state.me = [pos.coords.latitude, pos.coords.longitude];
      if (!meMarker) {
        meMarker = L.marker(state.me, {
          icon: L.divIcon({ className: "", html: '<div class="me-dot"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }),
          interactive: false, zIndexOffset: 1000
        }).addTo(map);
      } else {
        meMarker.setLatLng(state.me);
      }
      if (first) { map.setView(state.me, 15); first = false; if (DISCOVER) DISCOVER.onLocation(); if (PLAN) PLAN.onLocation(); }
    }, function () {
      watching = false;
      alert("Couldn't get your location. Check that location access is allowed for this site.");
    }, { enableHighAccuracy: true, maximumAge: 10000 });
  });

  // ---------- counter ----------
  function updateCounter() {
    var explored = exploredMap();
    var n = DATA.spots.filter(function (s) { return explored[s.id]; }).length;
    var el = document.getElementById("explored-count");
    if (el) el.textContent = n;
  }

  function refreshExplored() {
    updateCounter();
    renderMarkers();
    if (state.hideExplored && state.view === "list") openList();
  }

  // ---------- accounts ----------
  var AVATARS = ["🧭", "🗺️", "🚲", "🥨", "🦆", "🌅", "⛪", "🏔️", "🌲", "📸", "🍺", "🎒", "🐻", "🦊", "⭐", "🎨"];
  var COLORS = ["#0f766e", "#1d4ed8", "#7c3aed", "#db2777", "#dc2626", "#ea580c", "#15803d", "#334155"];
  var DEFAULT_BRAND = "#0f766e";

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  }

  function errText(err) {
    return (err && err.message) || "Something went wrong. Please try again.";
  }

  function applyAccent() {
    var color = (ACCT.profile && ACCT.profile.accent_color) || DEFAULT_BRAND;
    document.documentElement.style.setProperty("--brand", color);
    document.querySelector('meta[name="theme-color"]').setAttribute("content", color);
  }

  // The "Me" tab: your avatar emoji once signed in, otherwise "Sign in".
  function renderAccountBtn() {
    var btn = document.getElementById("account-btn");
    if (!ACCT.enabled) return;
    btn.hidden = false;
    var icon = btn.querySelector(".tab-me-icon"), label = btn.querySelector(".tab-me-label");
    if (ACCT.profile) {
      icon.textContent = ACCT.profile.avatar_emoji || "🧭";
      label.textContent = "Me";
      btn.setAttribute("aria-label", "Your profile");
    } else {
      icon.textContent = "🧭";
      label.textContent = "Sign in";
      btn.setAttribute("aria-label", "Sign in");
    }
  }

  // ---------- bottom tab bar ----------
  // Which tab a screen belongs to, so the bar shows where you are.
  function currentTab() {
    if (document.body.classList.contains("picking")) return "suggest";
    if (!sheet.classList.contains("open")) return "map";
    var v = state.view, hash = location.hash.slice(1).split("/")[0];
    if (v === "profile" || v === "settings" || v === "edit" || v === "auth" || v === "photo" || v === "upload") return "me";
    if (v === "public") return "explorers";
    if (v === "social") return /^(explorers|@)/.test(hash) ? "explorers" : "me";
    if (v === "submit") return hash === "suggest" ? "suggest" : "me";
    if (v === "discover" || v === "plan" || v === "collections" || v === "knowledge") return "discover";
    return "map";
  }

  function updateTabs() {
    var on = currentTab();
    Array.prototype.forEach.call(document.querySelectorAll("#tabbar .tab"), function (t) {
      var is = t.getAttribute("data-tab") === on;
      t.classList.toggle("on", is);
      if (is) t.setAttribute("aria-current", "page"); else t.removeAttribute("aria-current");
    });
  }

  document.getElementById("tabbar").addEventListener("click", function (e) {
    var t = e.target.closest("[data-tab]");
    if (!t) return;
    var tab = t.getAttribute("data-tab");
    if (tab === "map") closeSheet();
    else if (tab === "discover" && DISCOVER) DISCOVER.openHome();
    else if (tab === "suggest" && SUBMIT) SUBMIT.startSuggest();
    else if (tab === "explorers" && SOCIAL) SOCIAL.openExplorers();
    else if (tab === "me") { if (ACCT.user) openProfile(); else openSignIn(); }
    updateTabs();
  });

  // Form helpers: every form shows its errors in a .form-msg element.
  function formMsg(form, text, ok) {
    var el = form.querySelector(".form-msg");
    el.textContent = text || "";
    el.className = "form-msg" + (ok ? " ok" : "");
  }

  function busy(form, on) {
    Array.prototype.forEach.call(form.querySelectorAll("button, input, textarea"), function (b) { b.disabled = on; });
  }

  function onSubmit(id, handler) {
    var form = document.getElementById(id);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      formMsg(form, "");
      busy(form, true);
      Promise.resolve().then(function () { return handler(form, form.elements); })
        .catch(function (err) { formMsg(form, errText(err)); })
        .then(function () { if (document.body.contains(form)) busy(form, false); });
    });
    return form;
  }

  function wireLinks() {
    Array.prototype.forEach.call(sheetBody.querySelectorAll("[data-go]"), function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var go = a.getAttribute("data-go");
        if (go === "signin") openSignIn();
        else if (go === "signup") openSignUp();
        else if (go === "reset") openReset();
        else if (go === "profile") openProfile();
        else if (go === "edit") openEditProfile();
        else if (go === "settings") openSettings();
      });
    });
  }

  // ---------- sign in / sign up ----------
  function openSignIn(note) {
    state.view = "auth";
    showSheet(
      '<h2 class="list-title">Sign in</h2>' +
      '<p class="list-desc">' + esc(note || "Keep your explored spots, wishlist and photos on every device.") + "</p>" +
      '<form class="form" id="signin-form">' +
        '<label>Email<input name="email" type="email" autocomplete="email" required></label>' +
        '<label>Password<input name="password" type="password" autocomplete="current-password" required></label>' +
        '<p class="form-msg" role="alert"></p>' +
        '<button class="btn primary wide" type="submit">Sign in</button>' +
      "</form>" +
      '<p class="form-links"><a href="#" data-go="signup">Create an account</a> · <a href="#" data-go="reset">Forgot password?</a></p>'
    );
    wireLinks();
    onSubmit("signin-form", function (form, f) {
      return ACCT.signIn(f.email.value, f.password.value);
      // the "signed-in" event opens the profile
    });
  }

  function openSignUp() {
    state.view = "auth";
    showSheet(
      '<h2 class="list-title">Create an account</h2>' +
      '<p class="list-desc">Free. Your profile is private until you choose to make it public.</p>' +
      '<form class="form" id="signup-form">' +
        '<label>Your name<input name="name" maxlength="40" autocomplete="nickname" placeholder="e.g. Aamir"></label>' +
        '<label>Username<input name="username" required pattern="[a-zA-Z0-9_]{3,20}" maxlength="20" autocapitalize="off" ' +
          'autocomplete="username" placeholder="3–20 letters, numbers or _"></label>' +
        '<label>Email<input name="email" type="email" autocomplete="email" required></label>' +
        '<label>Password<input name="password" type="password" minlength="8" autocomplete="new-password" required placeholder="At least 8 characters"></label>' +
        '<p class="form-msg" role="alert"></p>' +
        '<button class="btn primary wide" type="submit">Create account</button>' +
      "</form>" +
      '<p class="form-links">Already have one? <a href="#" data-go="signin">Sign in</a></p>'
    );
    wireLinks();
    onSubmit("signup-form", function (form, f) {
      return ACCT.signUp(f.email.value, f.password.value, f.username.value, f.name.value).then(function (r) {
        if (r.needsConfirmation) {
          showSheet(
            '<h2 class="list-title">Check your email</h2>' +
            '<p class="list-desc">We sent a link to <b>' + esc(f.email.value) + "</b>. Click it to finish creating your account, then come back here.</p>" +
            '<p class="form-links"><a href="#" data-go="signin">Back to sign in</a></p>'
          );
          wireLinks();
        }
      });
    });
  }

  function openReset() {
    state.view = "auth";
    showSheet(
      '<h2 class="list-title">Reset your password</h2>' +
      '<p class="list-desc">We\'ll email you a link to choose a new one.</p>' +
      '<form class="form" id="reset-form">' +
        '<label>Email<input name="email" type="email" autocomplete="email" required></label>' +
        '<p class="form-msg" role="alert"></p>' +
        '<button class="btn primary wide" type="submit">Send link</button>' +
      "</form>" +
      '<p class="form-links"><a href="#" data-go="signin">Back to sign in</a></p>'
    );
    wireLinks();
    onSubmit("reset-form", function (form, f) {
      return ACCT.sendPasswordReset(f.email.value).then(function () {
        formMsg(form, "If that email has an account, a link is on its way.", true);
      });
    });
  }

  function openNewPassword() {
    state.view = "auth";
    showSheet(
      '<h2 class="list-title">Choose a new password</h2>' +
      '<form class="form" id="newpw-form">' +
        '<label>New password<input name="password" type="password" minlength="8" autocomplete="new-password" required></label>' +
        '<p class="form-msg" role="alert"></p>' +
        '<button class="btn primary wide" type="submit">Save password</button>' +
      "</form>"
    );
    onSubmit("newpw-form", function (form, f) {
      return ACCT.setNewPassword(f.password.value).then(openProfile);
    });
  }

  // ---------- profile ----------
  function profileHeader(p, extra) {
    return '<div class="profile-head" style="--accent:' + esc(p.accent_color) + '">' +
      (SOCIAL ? SOCIAL.avatar(p) : '<span class="avatar">' + esc(p.avatar_emoji) + "</span>") +
      '<div><h2 class="profile-name">' + esc(p.display_name || p.username) + "</h2>" +
      '<p class="profile-user">@' + esc(p.username) + (p.home_city ? " · " + esc(p.home_city) : "") + (extra ? " · " + esc(extra) : "") + "</p></div>" +
    "</div>" +
    (p.bio ? '<p class="profile-bio">' + esc(p.bio) + "</p>" : "");
  }

  function photoGrid(photos, emptyText) {
    if (!photos.length) return '<p class="empty">' + esc(emptyText) + "</p>";
    return '<div class="photo-grid">' + photos.map(function (ph) {
      return '<button class="photo-tile" data-photo-id="' + esc(ph.id) + '"><img src="' + esc(ph.url) +
        '" alt="' + esc((spotById(ph.spot_id) || {}).name || "") + '" loading="lazy"></button>';
    }).join("") + "</div>";
  }

  function wirePhotoGrid(photos, mine, back, backLabel) {
    Array.prototype.forEach.call(sheetBody.querySelectorAll(".photo-tile"), function (t) {
      t.addEventListener("click", function () {
        var id = t.getAttribute("data-photo-id");
        openPhoto(photos.filter(function (p) { return p.id === id; })[0], mine, back, backLabel);
      });
    });
  }

  function stat(n, label) {
    return '<div class="stat"><b>' + n + "</b><span>" + esc(label) + "</span></div>";
  }

  var PROFILE_TABS = [
    { id: "places", label: "Places" },
    { id: "photos", label: "Photos" },
    { id: "badges", label: "Badges" },
    { id: "lists", label: "Lists" }
  ];
  var PLACE_LISTS = [
    { id: "explored", label: "Explored" },
    { id: "wishlist", label: "Wishlist" },
    { id: "saved", label: "Saved activities" }
  ];

  function visibilityLabel(p) {
    var v = p.profile_visibility || (p.is_public ? "public" : "private");
    return v === "public" ? "🌍 Public" : v === "followers" ? "👥 Followers only" : "🔒 Private";
  }

  function profilePanel(tab, visitedIds, wishIds) {
    if (tab === "photos") return photoGrid(ACCT.photos, "Open a spot and tap “Add photo” to post your first one.");
    if (tab === "badges") return DISCOVER ? DISCOVER.profileSection(null, "badges") : "";
    if (tab === "lists") return COLLECTIONS ? COLLECTIONS.profileSection() : "";
    var list = state.profileList || "explored";
    var lists = PLACE_LISTS.filter(function (l) { return l.id !== "saved" || DISCOVER; });
    return '<div class="pf-sub">' + lists.map(function (l) {
        return '<button class="pf-chip' + (l.id === list ? " on" : "") + '" data-pl="' + l.id + '">' + esc(l.label) + "</button>";
      }).join("") + "</div>" +
      (list === "wishlist" ? spotList(wishIds, "Tap “Save” on any spot to put it on your wishlist.")
        : list === "saved" ? DISCOVER.profileSection(null, "saved")
        : spotList(visitedIds, "Spots you mark as explored show up here.", ACCT.visits));
  }

  function openProfile() {
    if (!ACCT.user || !ACCT.profile) { openSignIn(); return; }
    var p = ACCT.profile;
    state.view = "profile";
    history.replaceState(null, "", "#me");
    var tab = state.profileTab || "places";
    var visitedIds = Object.keys(ACCT.visits).sort(function (a, b) { return ACCT.visits[b] < ACCT.visits[a] ? -1 : 1; });
    var wishIds = Object.keys(ACCT.wishlist);
    showSheet(
      '<button class="settings-btn" data-go="settings" aria-label="Settings" title="Settings">⚙️</button>' +
      profileHeader(p, visibilityLabel(p)) +
      '<div class="stats">' +
        stat(visitedIds.filter(spotById).length + "/" + DATA.spots.length, "explored") +
        (DISCOVER ? stat(DISCOVER.badgeCount(), DISCOVER.badgeCount() === 1 ? "badge" : "badges") : stat(wishIds.filter(spotById).length, "on wishlist")) +
        stat(ACCT.photos.length, ACCT.photos.length === 1 ? "photo" : "photos") +
      "</div>" +
      (SOCIAL ? SOCIAL.ownProfileSection() : "") +
      '<div class="pf-tabs" role="tablist">' + PROFILE_TABS.filter(function (t) {
        return (t.id !== "badges" || DISCOVER) && (t.id !== "lists" || COLLECTIONS);
      }).map(function (t) {
        return '<button role="tab" class="pf-tab' + (t.id === tab ? " on" : "") + '" aria-selected="' + (t.id === tab) + '" data-pt="' + t.id + '">' + esc(t.label) + "</button>";
      }).join("") + "</div>" +
      '<div class="pf-panel">' + profilePanel(tab, visitedIds, wishIds) + "</div>"
    );
    wireLinks();
    if (tab === "photos") wirePhotoGrid(ACCT.photos, true, openProfile, "Profile");
    if (SOCIAL) SOCIAL.fillAvatars(sheetBody);
    Array.prototype.forEach.call(sheetBody.querySelectorAll("[data-pt]"), function (b) {
      b.addEventListener("click", function () { state.profileTab = b.getAttribute("data-pt"); openProfile(); });
    });
    Array.prototype.forEach.call(sheetBody.querySelectorAll("[data-pl]"), function (b) {
      b.addEventListener("click", function () { state.profileList = b.getAttribute("data-pl"); openProfile(); });
    });
  }

  // Everything you change now and then: profile, privacy, suggestions, your data.
  function openSettings() {
    if (!ACCT.user || !ACCT.profile) { openSignIn(); return; }
    var p = ACCT.profile;
    state.view = "settings";
    history.replaceState(null, "", "#settings");
    var shareable = (p.profile_visibility || (p.is_public ? "public" : "private")) !== "private";
    var social = SOCIAL && SOCIAL.ready();
    var contribute = SUBMIT ? SUBMIT.settingsRows() : "";
    var cityId = DATA.cityId || CITIES.current;
    var city = CITIES.cities.filter(function (c) { return c.id === cityId; })[0] || {};
    function row(id, icon, label, value, cls) {
      return '<button class="set-row' + (cls ? " " + cls : "") + '" id="' + id + '"><span class="set-icon">' + icon + "</span>" +
        '<span class="set-label">' + esc(label) + '</span><span class="set-val">' + esc(value || "") + "</span></button>";
    }
    showSheet(
      '<button class="dz-back" data-go="profile">← Profile</button>' +
      '<h2 class="list-title">Settings</h2>' +
      '<h3 class="set-h">Account</h3><div class="set-group">' +
        row("set-edit", "✏️", "Edit profile") +
        (social ? row("set-privacy", "🔒", "Privacy", visibilityLabel(p).replace(/^\S+ /, "")) : "") +
        (shareable ? row("set-copy", "🔗", "Copy profile link", "", "no-arrow") : "") +
      "</div>" +
      (contribute ? '<h3 class="set-h">Contribute</h3><div class="set-group">' + contribute + "</div>" : "") +
      '<h3 class="set-h">App</h3><div class="set-group">' +
        row("set-city", "🏙️", "City", city.name || "") +
      "</div>" +
      '<h3 class="set-h">Your data</h3><div class="set-group">' +
        row("export-btn", "⬇", "Download my data", "", "no-arrow") +
        row("signout-btn", "🚪", "Sign out", "", "no-arrow") +
        row("delete-btn", "🗑", "Delete account", "", "no-arrow danger") +
      "</div>"
    );
    wireLinks();
    if (SUBMIT) SUBMIT.afterProfile();
    document.getElementById("set-edit").addEventListener("click", openEditProfile);
    var priv = document.getElementById("set-privacy");
    if (priv) priv.addEventListener("click", function () { location.hash = "privacy"; });
    document.getElementById("set-city").addEventListener("click", function () { openCities(false); });
    var copy = document.getElementById("set-copy");
    if (copy) copy.addEventListener("click", function () {
      var url = cityUrl("@" + p.username);
      if (navigator.share) navigator.share({ title: "My Go Places profile", url: url }).catch(function () {});
      else if (navigator.clipboard) { navigator.clipboard.writeText(url); copy.querySelector(".set-val").textContent = "Copied ✓"; }
    });
    document.getElementById("signout-btn").addEventListener("click", function () {
      ACCT.signOut().catch(function (err) { alert(errText(err)); });
    });
    wireDataButtons(p);
  }

  function openPublicProfile(username) {
    if (ACCT.profile && ACCT.profile.username === username) { openProfile(); return; }
    state.view = "public";
    state.publicUser = username;
    showSheet('<p class="list-desc loading">Loading profile…</p>');
    (SOCIAL ? SOCIAL.refreshFollows() : Promise.resolve()).then(function () {
      return ACCT.loadPublicProfile(username);
    }).then(function (r) {
      if (state.view !== "public") return;
      if (!r) {
        if (SOCIAL && SOCIAL.ready()) { SOCIAL.openLocked(username); return; }
        showSheet('<h2 class="list-title">Profile not found</h2><p class="list-desc">This profile doesn\'t exist or is private.</p>');
        return;
      }
      var ids = Object.keys(r.visits).sort(function (a, b) { return r.visits[b] < r.visits[a] ? -1 : 1; });
      history.replaceState(null, "", "#@" + r.profile.username);
      showSheet(
        profileHeader(r.profile) +
        '<div class="stats">' +
          (hidden(r.profile, "visits_visibility", "") ? "" : stat(ids.filter(spotById).length + "/" + DATA.spots.length, "explored")) +
          (hidden(r.profile, "photos_visibility", "") ? "" : stat(r.photos.length, r.photos.length === 1 ? "photo" : "photos")) +
        "</div>" +
        (SOCIAL ? SOCIAL.publicProfileSection(r) : "") +
        (DISCOVER ? DISCOVER.profileSection(r.badges || {}) : "") +
        (COLLECTIONS ? COLLECTIONS.publicProfileSection(r.profile.id) : "") +
        '<div class="spot-section"><h3>Photos</h3>' + (hidden(r.profile, "photos_visibility", "photos") || photoGrid(r.photos, "No photos yet.")) + "</div>" +
        '<div class="spot-section"><h3>Explored</h3>' + (hidden(r.profile, "visits_visibility", "explored places") || spotList(ids, "Nothing explored yet.", r.visits)) + "</div>" +
        (r.profile.wishlist_visibility && !hidden(r.profile, "wishlist_visibility", "wishlist") && r.profile.wishlist_visibility !== "only_me"
          ? '<div class="spot-section"><h3>Wishlist</h3>' + spotList(Object.keys(r.wishlist || {}), "Nothing on the wishlist yet.") + "</div>" : "")
      );
      wirePhotoGrid(r.photos, false, function () { openPublicProfile(username); }, r.profile ? (r.profile.display_name || r.profile.username) : username);
      if (SOCIAL) SOCIAL.afterPublicProfile(r);
    }).catch(function (err) {
      showSheet('<h2 class="list-title">Couldn\'t load profile</h2><p class="list-desc">' + esc(errText(err)) + "</p>");
    });
  }

  function hidden(p, setting, what) {
    return SOCIAL && SOCIAL.ready() ? SOCIAL.hiddenNote(p, setting, what) : "";
  }

  function openEditProfile() {
    var p = ACCT.profile;
    state.view = "edit";
    showSheet(
      '<button class="dz-back" data-go="settings">← Settings</button>' +
      '<h2 class="list-title">Edit profile</h2>' +
      '<form class="form" id="profile-form">' +
        '<fieldset><legend>Avatar</legend><div class="choice-row">' + AVATARS.map(function (a) {
          return '<label class="choice"><input type="radio" name="avatar" value="' + esc(a) + '"' +
            (a === p.avatar_emoji ? " checked" : "") + '><span>' + esc(a) + "</span></label>";
        }).join("") + "</div></fieldset>" +
        '<fieldset><legend>Colour</legend><div class="choice-row">' + COLORS.map(function (c) {
          return '<label class="choice swatch"><input type="radio" name="color" value="' + c + '"' +
            (c === p.accent_color ? " checked" : "") + '><span style="background:' + c + '"></span></label>';
        }).join("") + "</div></fieldset>" +
        '<label>Your name<input name="name" maxlength="40" value="' + esc(p.display_name || "") + '"></label>' +
        '<label>Username<input name="username" required pattern="[a-zA-Z0-9_]{3,20}" maxlength="20" autocapitalize="off" value="' + esc(p.username) + '"></label>' +
        '<label>Home city<input name="city" maxlength="40" value="' + esc(p.home_city || "") + '"></label>' +
        '<label>About you<textarea name="bio" maxlength="160" rows="3" placeholder="What do you love exploring?">' + esc(p.bio || "") + "</textarea></label>" +
        (SOCIAL && SOCIAL.ready() ? SOCIAL.editFields(p) :
        '<label class="toggle"><input type="checkbox" name="public"' + (p.is_public ? " checked" : "") + '>' +
          "<span><b>Public profile</b><br>Anyone with your link can see your name, explored spots and photos. Your wishlist and email always stay private.</span></label>") +
        '<p class="form-msg" role="alert"></p>' +
        '<div class="actions"><button class="btn primary" type="submit">Save</button><button class="btn" type="button" data-go="settings">Cancel</button></div>' +
      "</form>"
    );
    wireLinks();
    onSubmit("profile-form", function (form, f) {
      var username = f.username.value.trim().toLowerCase();
      var check = username === p.username ? Promise.resolve(true) : ACCT.usernameAvailable(username);
      return check.then(function (ok) {
        if (!ok) throw new Error("That username is taken or not allowed.");
        var fields = {
          username: username,
          display_name: f.name.value.trim() || null,
          home_city: f.city.value.trim(),
          bio: f.bio.value.trim() || null,
          avatar_emoji: f.avatar.value || p.avatar_emoji,
          accent_color: f.color.value || p.accent_color
        };
        // with the social settings, visibility lives on the Privacy screen
        if (f.public) fields.is_public = f.public.checked;
        if (SOCIAL && SOCIAL.ready()) Object.assign(fields, SOCIAL.readEditFields(form));
        return ACCT.updateProfile(fields);
      }).then(openProfile);
    });
  }

  // "Download my data" and "Delete account" on the Settings screen.
  function wireDataButtons(p) {
    document.getElementById("export-btn").addEventListener("click", function () {
      var data = ACCT.exportData();
      if (COLLECTIONS) Object.assign(data, COLLECTIONS.exportData());
      if (SUBMIT) Object.assign(data, SUBMIT.exportData());
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "go-places-" + p.username + ".json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    });

    document.getElementById("delete-btn").addEventListener("click", function () {
      var typed = prompt("This deletes your profile, explored spots, wishlist and all your photos. Places and photos you suggested that were already approved stay up, without your name. It can't be undone.\n\nType your username (" + p.username + ") to confirm.");
      if (typed == null) return;
      if (typed.trim().toLowerCase() !== p.username) { alert("The username didn't match, so nothing was deleted."); return; }
      this.disabled = true;
      ACCT.deleteAccount().then(function () {
        showSheet('<h2 class="list-title">Account deleted</h2><p class="list-desc">Your account and photos are gone. Thanks for exploring with us.</p>');
      }).catch(function (err) { alert(errText(err)); });
    });
  }

  // ---------- photos ----------
  function myPhotosBlock(spot) {
    if (!ACCT.user) return "";
    var photos = ACCT.photosFor(spot.id);
    if (!photos.length) return "";
    return '<div class="spot-section"><h3>Your photos</h3>' + photoGrid(photos, "") + "</div>";
  }

  function pickPhoto(spot) {
    var input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.addEventListener("change", function () {
      if (input.files && input.files[0]) openUpload(spot, input.files[0]);
    });
    input.click();
  }

  function openUpload(spot, file) {
    state.view = "upload";
    var preview = URL.createObjectURL(file);
    showSheet(
      '<h2 class="list-title">' + esc(spot.name) + "</h2>" +
      '<div class="upload-preview"><img src="' + preview + '" alt="Your photo"></div>' +
      '<form class="form" id="upload-form">' +
        '<label>Caption (optional)<input name="caption" maxlength="140" placeholder="What did you find?"></label>' +
        (SUBMIT ? SUBMIT.uploadOption() : "") +
        '<p class="privacy-note">🔒 Before uploading, the photo is resized and its hidden location (GPS) and camera data are removed.</p>' +
        '<p class="form-msg" role="alert"></p>' +
        '<div class="actions"><button class="btn primary" type="submit">Upload</button>' +
        '<button class="btn" type="button" id="upload-cancel">Cancel</button></div>' +
      "</form>"
    );
    document.getElementById("upload-cancel").addEventListener("click", function () {
      URL.revokeObjectURL(preview);
      openSpot(spot.id);
    });
    onSubmit("upload-form", function (form, f) {
      form.querySelector('button[type="submit"]').textContent = "Uploading…";
      var suggest = !!(SUBMIT && f.suggest && f.suggest.checked);
      return ACCT.uploadPhoto(spot.id, file, f.caption.value).then(function () {
        return suggest ? SUBMIT.suggestPhoto(spot, file, f.caption.value) : null;
      }).then(function () {
        URL.revokeObjectURL(preview);
        if (suggest) SUBMIT.thanks("photo"); else openSpot(spot.id);
      }, function (err) {
        form.querySelector('button[type="submit"]').textContent = "Upload";
        throw err;
      });
    });
  }

  function openPhoto(photo, mine, back, backLabel) {
    if (!photo) return;
    var spot = spotById(photo.spot_id);
    state.view = "photo";
    showSheet(
      '<button class="dz-back" id="photo-back">← ' + esc(backLabel || "Back") + "</button>" +
      '<div class="photo-full"><img src="' + esc(photo.url) + '" alt="' + esc(spot ? spot.name : "") + '"' +
        (LIGHTBOX ? LIGHTBOX.attrs([{ src: photo.url, caption: photo.caption || (spot ? spot.name : "") }], 0) : "") + "></div>" +
      (photo.caption ? '<p class="summary">' + esc(photo.caption) + "</p>" : "") +
      '<p class="meta">' + (spot ? esc(spot.emoji + " " + spot.name) + " · " : "") + esc(formatDate(photo.created_at)) + "</p>" +
      '<div class="actions">' +
        (spot ? '<button class="btn" id="photo-spot">Open spot</button>' : "") +
        (mine ? '<button class="btn danger" id="photo-delete">Delete photo</button>' : "") +
      "</div>"
    );
    document.getElementById("photo-back").addEventListener("click", back);
    if (spot) document.getElementById("photo-spot").addEventListener("click", function () { openSpot(spot.id); });
    if (mine) document.getElementById("photo-delete").addEventListener("click", function () {
      if (!confirm("Delete this photo?")) return;
      this.disabled = true;
      ACCT.deletePhoto(photo).then(back, function (err) { alert(errText(err)); });
    });
  }

  // ---------- account events ----------
  function rerender() {
    if (state.view === "spot" && state.openSpotId) openSpot(state.openSpotId);
    else if (state.view === "profile") openProfile();
    else if (state.view === "settings") openSettings();
    else if (state.view === "public" && state.publicUser) openPublicProfile(state.publicUser);
    else if (state.view === "list") openList();
    else if (state.view === "discover" && DISCOVER) DISCOVER.rerender();
    else if (state.view === "knowledge" && KNOWLEDGE) KNOWLEDGE.rerender();
    else if (state.view === "social" && SOCIAL) SOCIAL.rerender();
    else if (state.view === "collections" && COLLECTIONS) COLLECTIONS.rerender();
    else if (state.view === "plan" && PLAN) PLAN.rerender();
    else if (state.view === "submit" && SUBMIT) SUBMIT.rerender();
  }

  ACCT.on && ACCT.on(function (event) {
    if (event === "signed-in") {
      var local = loadExplored();
      ACCT.importExplored(local).then(function (n) {
        if (n) { state.explored = {}; saveExplored(); }
      }).catch(function (err) { console.error("Couldn't import explored spots", err); });
      applyAccent();
      renderAccountBtn();
      refreshExplored();
      if (state.view === "auth" && !ACCT.recovering) openProfile();
      else rerender();
    } else if (event === "signed-out") {
      state.explored = loadExplored();
      applyAccent();
      renderAccountBtn();
      refreshExplored();
      if (state.view === "profile" || state.view === "settings" || state.view === "edit" || state.view === "photo" || state.view === "upload") closeSheet();
      else rerender();
    } else if (event === "recovery") {
      openNewPassword();
    } else if (event === "profile") {
      applyAccent();
      renderAccountBtn();
    } else if (event === "follows") {
      if (state.view === "profile") openProfile();
    } else if (event === "visits" || event === "wishlist" || event === "photos") {
      refreshExplored();
      if (state.view === "spot" || state.view === "profile") rerender();
    } else if (event === "error") {
      renderAccountBtn();
    }
  });

  // Supabase sends people back with ?error_description=… when an email link
  // has expired or was opened on another device.
  function linkError() {
    var params = new URLSearchParams(location.search + "&" + location.hash.slice(1));
    var msg = params.get("error_description");
    if (!msg) return null;
    history.replaceState(null, "", location.pathname);
    return msg.replace(/\+/g, " ");
  }

  function route() {
    var hash = decodeURIComponent(location.hash.slice(1));
    if (hash && spotById(hash)) openSpot(hash);
    else if (hash === "cities") openCities(false);
    else if (DISCOVER && DISCOVER.route(hash)) { /* handled by the discovery layer */ }
    else if (KNOWLEDGE && KNOWLEDGE.route(hash)) { /* handled by Free Knowledge */ }
    else if (SOCIAL && SOCIAL.route(hash)) { /* handled by the social layer */ }
    else if (COLLECTIONS && COLLECTIONS.route(hash)) { /* handled by collections */ }
    else if (PLAN && PLAN.route(hash)) { /* handled by Plan My Day */ }
    else if (SUBMIT && SUBMIT.route(hash)) { /* handled by suggestions and review */ }
    else if (ACCT.enabled && hash === "me") { if (ACCT.user) openProfile(); else openSignIn(); }
    else if (ACCT.enabled && hash === "settings") { if (ACCT.user) openSettings(); else openSignIn(); }
    else if (ACCT.enabled && hash.charAt(0) === "@") openPublicProfile(hash.slice(1).toLowerCase());
  }

  window.addEventListener("hashchange", route);

  // ---------- discovery layer ----------
  // The few things discover.js needs from the map app.
  function markExplored(spotId) {
    if (!spotById(spotId) || exploredMap()[spotId]) return;
    if (ACCT.user) {
      ACCT.setVisited(spotId, true).catch(function (err) { console.error("Couldn't mark explored", err); });
    } else {
      state.explored[spotId] = new Date().toISOString();
      saveExplored();
    }
    refreshExplored();
  }

  // The same helpers for each layer; `view` names its screens in state.view.
  function layerApi(view) {
    return {
      map: map,
      esc: esc,
      spotById: spotById,
      distanceKm: distanceKm,
      formatDate: formatDate,
      exploredMap: exploredMap,
      markExplored: markExplored,
      refreshMap: function () {
        refreshExplored();
        if (state.view === "spot" && state.openSpotId) openSpot(state.openSpotId);
      },
      openSpot: openSpot,
      openSignIn: openSignIn,
      openProfile: openProfile,
      openEditProfile: openEditProfile,
      openSettings: openSettings,
      updateTabs: updateTabs,
      rerender: rerender,
      close: closeSheet,
      view: function () { return state.view; },
      me: function () { return state.me; },
      sheetBody: sheetBody,
      show: function (html, hash) {
        state.view = view;
        state.openSpotId = null;
        stopSpeaking();
        history.replaceState(null, "", hash ? "#" + hash : location.pathname + location.search);
        showSheet(html);
      },
      isOpen: function () { return state.view === view; },
      isSpot: function (id) { return state.view === "spot" && state.openSpotId === id; }
    };
  }

  if (DISCOVER) DISCOVER.init(layerApi("discover"));
  if (KNOWLEDGE) KNOWLEDGE.init(layerApi("knowledge"));
  if (SOCIAL) SOCIAL.init(layerApi("social"));
  if (COLLECTIONS) COLLECTIONS.init(layerApi("collections"));
  if (PLAN) PLAN.init(layerApi("plan"));
  if (SUBMIT) SUBMIT.init(layerApi("submit"));
  if (META) META.check(DATA.spots);

  // ---------- start ----------
  document.getElementById("city-label").textContent = DATA.city;
  document.title = "Go Places · " + DATA.city;
  renderThemes();
  renderMarkers();
  updateCounter();

  // The app opens on the map. "How do you feel today?" shows once, on the
  // first open after the city is picked; after that it's under Discover.
  // On a first visit, ask for the city before anything else.
  function seenDiscover() {
    var KEY = "goplaces.seenDiscover";
    try {
      if (localStorage.getItem(KEY)) return true;
      localStorage.setItem(KEY, "1");
    } catch (e) { /* private mode: show it */ }
    return false;
  }

  function start() {
    if (!location.hash && CITIES.firstVisit && CITIES.cities.length > 1) openCities(true);
    else if (!location.hash && DISCOVER && !seenDiscover()) DISCOVER.openHome();
    else route();
  }

  var initialError = linkError();
  if (!ACCT.enabled) {
    start();
  } else {
    renderAccountBtn();
    ACCT.init().catch(function (err) { console.error("Account setup failed", err); }).then(function () {
      if (initialError && !ACCT.user) openSignIn(initialError + ". If you already confirmed your email, just sign in.");
      else if (!ACCT.recovering) start();
    });
  }
})();
