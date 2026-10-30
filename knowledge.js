/*
 * GO PLACES — Free Knowledge
 * ==========================
 * The screens for the 📚 Free Knowledge category: the overview (#knowledge),
 * one subcategory (#knowledge/libraries) and a content group such as the
 * Public Bookshelves of Munich (#bookshelves). The places themselves are
 * ordinary spots from data/free-knowledge.js, so tapping one opens the usual
 * spot page. app.js calls `GoKnowledge.init(api)` at start-up.
 */
(function () {
  "use strict";

  var DATA = window.GO_PLACES;
  var K = window.GO_PLACES_KNOWLEDGE || { subcategories: [], groups: [] };
  var app = null;
  var current = null;

  function esc(s) { return app.esc(s); }
  function byId(list, id) { return list.filter(function (x) { return x.id === id; })[0]; }

  function places() { return DATA.spots.filter(isKnowledge); }
  function isKnowledge(s) { return s.category === "free-knowledge"; }
  function inSub(id) { return places().filter(function (s) { return (s.knowledge || []).indexOf(id) !== -1; }); }
  function inGroup(id) { return places().filter(function (s) { return s.group === id; }); }

  function nearestFirst(list) {
    var me = app.me();
    if (!me) return list;
    return list.slice().sort(function (a, b) {
      return app.distanceKm(me, [a.lat, a.lng]) - app.distanceKm(me, [b.lat, b.lng]);
    });
  }

  function kmLabel(s) {
    var me = app.me();
    if (!me) return "";
    var km = app.distanceKm(me, [s.lat, s.lng]);
    return km < 1 ? Math.round(km * 1000) + " m away" : km.toFixed(1) + " km away";
  }

  function placeRow(s) {
    var sub = [s.duration ? "⏱ " + s.duration.split(" (")[0] : "", s.cost, kmLabel(s)].filter(Boolean).join(" · ");
    return '<button class="list-item" data-spot="' + esc(s.id) + '">' +
      '<span class="emoji">' + esc(s.emoji) + "</span>" +
      '<span><span class="name">' + esc(s.name) + '</span><br><span class="sub">' + esc(sub) + "</span></span>" +
      '<span class="check">' + (app.exploredMap()[s.id] ? "✅" : "") + "</span>" +
    "</button>";
  }

  function back(label, k) {
    return '<button class="dz-back" data-k="' + (k || "home") + '">← ' + esc(label || "Free Knowledge") + "</button>";
  }

  function fit(list) {
    if (!list.length) return;
    app.map.fitBounds(window.L.latLngBounds(list.map(function (s) { return [s.lat, s.lng]; })), { padding: [40, 40], maxZoom: 15 });
  }

  function show(fn, arg, html, hash) {
    current = { fn: fn, arg: arg };
    app.show(html, hash);
  }

  // ---------- views ----------
  function openHome() {
    var all = places();
    var explored = all.filter(function (s) { return app.exploredMap()[s.id]; }).length;
    var museums = nearestFirst(inSub("free-museums"));
    show(openHome, null,
      '<h2 class="list-title">📚 Free Knowledge</h2>' +
      '<p class="list-desc">Learning in ' + esc(DATA.city) + " that costs nothing: free museums, public bookshelves, libraries and exhibitions. " +
        "You've explored " + explored + " of " + all.length + ".</p>" +
      '<div class="kn-grid">' + K.subcategories.map(function (c) {
        var n = inSub(c.id).length;
        return '<button class="kn-card" data-k="sub" data-id="' + esc(c.id) + '"' + (n ? "" : " disabled") + ">" +
          '<span class="kn-emoji">' + esc(c.emoji) + "</span>" +
          '<span class="kn-name">' + esc(c.name) + "</span>" +
          '<span class="sub">' + (n ? n + (n === 1 ? " place" : " places") : "Coming soon") + "</span></button>";
      }).join("") + "</div>" +
      K.groups.map(function (g) {
        return '<button class="kn-group" data-k="group" data-id="' + esc(g.id) + '">' +
          '<span class="kn-group-emoji">' + esc(g.emoji) + "</span>" +
          '<span><span class="name">' + esc(g.title) + '</span><br><span class="sub">' + inGroup(g.id).length + " places · always free</span></span>" +
          '<span class="check">→</span></button>';
      }).join("") +
      '<h3 class="dz-h">🏛️ Free museums</h3>' + museums.map(placeRow).join(""),
      "knowledge");
    fit(all);
  }

  function openSub(id) {
    var c = byId(K.subcategories, id);
    if (!c) return openHome();
    var list = nearestFirst(inSub(id));
    show(openSub, id,
      back() +
      '<h2 class="list-title">' + esc(c.emoji + " " + c.name) + "</h2>" +
      '<p class="list-desc">' + esc(c.description) + "</p>" +
      (list.length ? list.map(placeRow).join("") : '<p class="empty">Nothing here yet.</p>'),
      "knowledge/" + id);
    fit(list);
  }

  function openGroup(id) {
    var g = byId(K.groups, id);
    if (!g) return openHome();
    var list = nearestFirst(inGroup(id));
    show(openGroup, id,
      back() +
      '<h2 class="list-title">' + esc(g.emoji + " " + g.title) + "</h2>" +
      '<p class="list-desc">' + esc(g.description) + "</p>" +
      '<p class="privacy-note">📖 How it works: take a book, leave a book, or both. No sign-up, no deadlines. ' +
        "Keep the shelves nice: only bring books in good condition.</p>" +
      list.map(placeRow).join(""),
      id === "public-bookshelves" ? "bookshelves" : "knowledge/group/" + id);
    fit(list);
  }

  // ---------- pieces shown on a spot page ----------
  // Extra facts for Free Knowledge places (and any spot with these fields).
  function spotFacts(spot) {
    return (spot.address ? '<p class="meta"><b>Where:</b> ' + esc(spot.address) + "</p>" : "") +
      (spot.opening ? '<p class="meta"><b>Open:</b> ' + esc(spot.opening) + "</p>" : "") +
      (spot.duration ? '<p class="meta"><b>Time:</b> ' + esc(spot.duration) + "</p>" : "");
  }

  function spotTags(spot) {
    var html = "";
    if (isKnowledge(spot)) {
      var g = spot.group && byId(K.groups, spot.group);
      if (g) html += '<button class="tag kn-tag" data-k="group" data-id="' + esc(g.id) + '">' + esc(g.emoji + " " + g.title) + "</button>";
    }
    return html + (spot.tags || []).map(function (t) { return '<span class="tag mood-tag">' + esc(t) + "</span>"; }).join("");
  }

  function spotSections(spot) {
    return (spot.whyVisit ? '<div class="spot-section"><h3>✨ Why visit</h3><p>' + esc(spot.whyVisit) + "</p></div>" : "") +
      (spot.visitorInfo ? '<div class="spot-section"><h3>ℹ️ Visitor information</h3><p>' + esc(spot.visitorInfo) + "</p></div>" : "");
  }

  function onClick(e) {
    var el = e.target.closest("[data-k]");
    if (!el) return;
    var k = el.getAttribute("data-k"), id = el.getAttribute("data-id");
    if (k === "home") openHome();
    else if (k === "sub") openSub(id);
    else if (k === "group") openGroup(id);
  }

  function checkContent() {
    places().forEach(function (s) {
      (s.knowledge || []).forEach(function (k) {
        if (!byId(K.subcategories, k)) console.warn('Go Places content: "' + s.id + '" has unknown Free Knowledge subcategory "' + k + '"');
      });
      if (s.group && !byId(K.groups, s.group)) console.warn('Go Places content: "' + s.id + '" has unknown group "' + s.group + '"');
    });
  }

  window.GoKnowledge = {
    init: function (api) {
      app = api;
      app.sheetBody.addEventListener("click", onClick);
      checkContent();
    },
    isKnowledge: isKnowledge,
    openHome: openHome,
    route: function (hash) {
      var parts = hash.split("/");
      if (hash === "knowledge") openHome();
      else if (hash === "bookshelves") openGroup("public-bookshelves");
      else if (parts[0] === "knowledge" && parts[1] === "group" && parts[2]) openGroup(parts[2]);
      else if (parts[0] === "knowledge" && parts[1]) openSub(parts[1]);
      else return false;
      return true;
    },
    rerender: function () { if (current && app.isOpen()) current.fn(current.arg); },
    onClose: function () { current = null; },
    spotFacts: spotFacts,
    spotTags: spotTags,
    spotSections: spotSections
  };
})();
