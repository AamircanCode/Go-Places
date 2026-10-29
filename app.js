(function () {
  "use strict";

  var DATA = window.GO_PLACES;
  var STORAGE_KEY = "goplaces.explored";

  var state = {
    theme: "all",
    explored: loadExplored(),
    me: null,
    openSpotId: null
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

  function themeById(id) {
    return DATA.themes.filter(function (t) { return t.id === id; })[0];
  }

  function spotById(id) {
    return DATA.spots.filter(function (s) { return s.id === id; })[0];
  }

  function visibleSpots() {
    if (state.theme === "all") return DATA.spots;
    return DATA.spots.filter(function (s) { return s.themes.indexOf(state.theme) !== -1; });
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
    var done = state.explored[spot.id] ? " done" : "";
    return L.divIcon({
      className: "",
      html: '<div class="spot-marker' + done + '">' + esc(spot.emoji || "📍") + "</div>",
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
  }

  function renderMarkers() {
    markerLayer.clearLayers();
    markers = {};
    visibleSpots().forEach(function (spot) {
      var m = L.marker([spot.lat, spot.lng], { icon: markerIcon(spot), title: spot.name, keyboard: true });
      m.on("click", function () { openSpot(spot.id); });
      m.addTo(markerLayer);
      markers[spot.id] = m;
    });
  }

  function fitToVisible() {
    var spots = visibleSpots();
    if (!spots.length) return;
    var bounds = L.latLngBounds(spots.map(function (s) { return [s.lat, s.lng]; }));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }

  // ---------- theme chips ----------
  function renderThemes() {
    var el = document.getElementById("themes");
    var all = [{ id: "all", name: "All spots", emoji: "🗺️" }].concat(DATA.themes);
    el.innerHTML = all.map(function (t) {
      var active = t.id === state.theme ? " active" : "";
      return '<button class="chip' + active + '" data-theme="' + esc(t.id) + '">' + esc(t.emoji) + " " + esc(t.name) + "</button>";
    }).join("");
  }

  document.getElementById("themes").addEventListener("click", function (e) {
    var btn = e.target.closest(".chip");
    if (!btn) return;
    state.theme = btn.getAttribute("data-theme");
    renderThemes();
    renderMarkers();
    fitToVisible();
    if (state.theme !== "all") openList();
  });

  // ---------- bottom sheet ----------
  var sheet = document.getElementById("sheet");
  var sheetBody = document.getElementById("sheet-body");

  function showSheet(html) {
    sheetBody.innerHTML = html;
    sheet.classList.add("open");
    sheet.setAttribute("aria-hidden", "false");
    sheet.scrollTop = 0;
  }

  function closeSheet() {
    sheet.classList.remove("open");
    sheet.setAttribute("aria-hidden", "true");
    state.openSpotId = null;
    stopSpeaking();
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  }

  document.getElementById("sheet-close").addEventListener("click", closeSheet);

  function photoBlock(spot) {
    var photos = spot.photos || [];
    if (!photos.length) {
      return '<div class="photo">' + esc(spot.emoji || "📍") + "</div>";
    }
    var first = photos[0];
    var html = '<div class="photo" id="main-photo"><img src="' + esc(first.url) + '" alt="' + esc(spot.name) +
      '" onerror="this.remove()">' + (first.credit ? '<span class="credit">' + esc(first.credit) + "</span>" : "") + "</div>";
    if (photos.length > 1) {
      html += '<div class="photo-strip">' + photos.map(function (p, i) {
        return '<img src="' + esc(p.url) + '" alt="" data-photo="' + i + '" onerror="this.remove()">';
      }).join("") + "</div>";
    }
    return html;
  }

  function openSpot(id) {
    var spot = spotById(id);
    if (!spot) return;
    state.openSpotId = id;
    history.replaceState(null, "", "#" + id);

    var tags = spot.themes.map(function (tid) {
      var t = themeById(tid);
      return t ? '<span class="tag">' + esc(t.emoji) + " " + esc(t.name) + "</span>" : "";
    }).join("");

    var facts = (spot.funFacts || []).map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("");
    var done = !!state.explored[id];
    var dist = distanceLabel(spot);
    var directions = "https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=" + spot.lat + "," + spot.lng;

    showSheet(
      photoBlock(spot) +
      '<h2 class="spot-title">' + esc(spot.name) + "</h2>" +
      '<div class="tags">' + tags + "</div>" +
      '<p class="meta"><b>Cost:</b> ' + esc(spot.cost) + "</p>" +
      (spot.when ? '<p class="meta"><b>When:</b> ' + esc(spot.when) + "</p>" : "") +
      (dist ? '<p class="meta"><b>Distance:</b> ' + esc(dist) + "</p>" : "") +
      '<div class="actions">' +
        '<a class="btn primary" target="_blank" rel="noopener" href="' + directions + '">🧭 Directions</a>' +
        ('speechSynthesis' in window ? '<button class="btn" id="listen-btn">🔊 Listen</button>' : "") +
        '<button class="btn' + (done ? " done" : "") + '" id="explored-btn">' + (done ? "✅ Explored" : "☐ Mark as explored") + "</button>" +
        '<button class="btn" id="share-btn">↗ Share</button>' +
      "</div>" +
      '<p class="summary">' + esc(spot.summary) + "</p>" +
      (spot.history ? '<div class="spot-section"><h3>📜 History</h3><p>' + esc(spot.history) + "</p></div>" : "") +
      (facts ? '<div class="spot-section"><h3>💡 Fun facts</h3><ul>' + facts + "</ul></div>" : "") +
      (spot.tip ? '<div class="tip">👉 ' + esc(spot.tip) + "</div>" : "")
    );

    map.panTo([spot.lat, spot.lng]);
    wireSpotButtons(spot);
  }

  function wireSpotButtons(spot) {
    var exploredBtn = document.getElementById("explored-btn");
    exploredBtn.addEventListener("click", function () {
      if (state.explored[spot.id]) delete state.explored[spot.id];
      else state.explored[spot.id] = new Date().toISOString();
      saveExplored();
      updateCounter();
      if (markers[spot.id]) markers[spot.id].setIcon(markerIcon(spot));
      openSpot(spot.id);
    });

    var listenBtn = document.getElementById("listen-btn");
    if (listenBtn) listenBtn.addEventListener("click", function () {
      if (speechSynthesis.speaking) { stopSpeaking(); listenBtn.textContent = "🔊 Listen"; return; }
      var text = [spot.name + ".", spot.summary, spot.history || ""]
        .concat((spot.funFacts || []).length ? ["Fun facts."].concat(spot.funFacts) : [])
        .join(" ");
      var u = new SpeechSynthesisUtterance(text);
      u.lang = "en-GB";
      u.onend = function () { listenBtn.textContent = "🔊 Listen"; };
      speechSynthesis.speak(u);
      listenBtn.textContent = "⏹ Stop";
    });

    document.getElementById("share-btn").addEventListener("click", function () {
      var url = location.origin + location.pathname + "#" + spot.id;
      if (navigator.share) {
        navigator.share({ title: spot.name, text: spot.summary, url: url }).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url);
        this.textContent = "✓ Link copied";
      }
    });

    var strip = sheetBody.querySelector(".photo-strip");
    if (strip) strip.addEventListener("click", function (e) {
      var i = e.target.getAttribute("data-photo");
      if (i == null) return;
      var p = spot.photos[+i];
      var main = document.getElementById("main-photo");
      main.innerHTML = '<img src="' + esc(p.url) + '" alt="' + esc(spot.name) + '">' +
        (p.credit ? '<span class="credit">' + esc(p.credit) + "</span>" : "");
    });
  }

  function stopSpeaking() {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
  }

  // ---------- list view ----------
  function openList() {
    var theme = themeById(state.theme);
    var spots = visibleSpots().slice();
    if (state.me) {
      spots.sort(function (a, b) {
        return distanceKm(state.me, [a.lat, a.lng]) - distanceKm(state.me, [b.lat, b.lng]);
      });
    }
    showSheet(
      '<h2 class="list-title">' + (theme ? esc(theme.emoji + " " + theme.name) : "🗺️ All spots") + "</h2>" +
      '<p class="list-desc">' + (theme ? esc(theme.description) : "Everything you can explore in " + esc(DATA.city) + ".") + "</p>" +
      spots.map(function (s) {
        var sub = [s.cost, distanceLabel(s)].filter(Boolean).join(" · ");
        return '<button class="list-item" data-spot="' + esc(s.id) + '">' +
          '<span class="emoji">' + esc(s.emoji) + "</span>" +
          '<span><span class="name">' + esc(s.name) + '</span><br><span class="sub">' + esc(sub) + "</span></span>" +
          '<span class="check">' + (state.explored[s.id] ? "✅" : "") + "</span>" +
        "</button>";
      }).join("")
    );
  }

  sheetBody.addEventListener("click", function (e) {
    var item = e.target.closest(".list-item");
    if (item) openSpot(item.getAttribute("data-spot"));
  });

  document.getElementById("list-btn").addEventListener("click", openList);

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
      if (first) { map.setView(state.me, 15); first = false; }
    }, function () {
      watching = false;
      alert("Couldn't get your location. Check that location access is allowed for this site.");
    }, { enableHighAccuracy: true, maximumAge: 10000 });
  });

  // ---------- counter ----------
  function updateCounter() {
    var n = DATA.spots.filter(function (s) { return state.explored[s.id]; }).length;
    document.getElementById("explored-count").textContent = n;
    document.getElementById("total-count").textContent = DATA.spots.length;
  }

  // ---------- start ----------
  document.getElementById("city-label").textContent = DATA.city + ", for free";
  renderThemes();
  renderMarkers();
  updateCounter();

  var initial = location.hash.slice(1);
  if (initial && spotById(initial)) openSpot(initial);
})();
