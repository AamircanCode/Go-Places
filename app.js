(function () {
  "use strict";

  var DATA = window.GO_PLACES;
  var ACCT = window.GoAccount || { enabled: false };
  var DISCOVER = window.GoDiscover; // the "What can I do?" layer, optional
  var KNOWLEDGE = window.GoKnowledge; // the Free Knowledge category, optional
  var SOCIAL = window.GoSocial; // follows, explorers, feed, ratings, privacy; optional
  var STORAGE_KEY = "goplaces.explored";

  var state = {
    theme: "all",
    explored: loadExplored(),
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
    var done = exploredMap()[spot.id] ? " done" : "";
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
    if (state.theme === "free-knowledge" && KNOWLEDGE) KNOWLEDGE.openHome();
    else if (state.theme !== "all") openList();
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
    state.view = null;
    stopSpeaking();
    if (DISCOVER) DISCOVER.onClose();
    if (KNOWLEDGE) KNOWLEDGE.onClose();
    if (SOCIAL) SOCIAL.onClose();
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
    state.view = "spot";
    history.replaceState(null, "", "#" + id);

    var tags = spot.themes.map(function (tid) {
      var t = themeById(tid);
      return t ? '<span class="tag">' + esc(t.emoji) + " " + esc(t.name) + "</span>" : "";
    }).join("") + (KNOWLEDGE ? KNOWLEDGE.spotTags(spot) : "");

    var facts = (spot.funFacts || []).map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("");
    var done = !!exploredMap()[id];
    var wished = ACCT.user && !!ACCT.wishlist[id];
    var dist = distanceLabel(spot);
    var directions = "https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=" + spot.lat + "," + spot.lng;

    showSheet(
      photoBlock(spot) +
      '<h2 class="spot-title">' + esc(spot.name) + "</h2>" +
      '<div class="tags">' + tags + "</div>" +
      '<p class="meta"><b>Cost:</b> ' + esc(spot.cost) + "</p>" +
      (spot.when ? '<p class="meta"><b>When:</b> ' + esc(spot.when) + "</p>" : "") +
      (KNOWLEDGE ? KNOWLEDGE.spotFacts(spot) : "") +
      (dist ? '<p class="meta"><b>Distance:</b> ' + esc(dist) + "</p>" : "") +
      '<div class="actions">' +
        '<a class="btn primary" target="_blank" rel="noopener" href="' + directions + '">🧭 Directions</a>' +
        ('speechSynthesis' in window ? '<button class="btn" id="listen-btn">🔊 Listen</button>' : "") +
        '<button class="btn' + (done ? " done" : "") + '" id="explored-btn">' + (done ? "✅ Explored" : "☐ Mark as explored") + "</button>" +
        (ACCT.enabled ? '<button class="btn' + (wished ? " wished" : "") + '" id="wish-btn">' + (wished ? "💚 On wishlist" : "♡ Wishlist") + "</button>" : "") +
        (ACCT.enabled ? '<button class="btn" id="add-photo-btn">📷 Add photo</button>' : "") +
        '<button class="btn" id="share-btn">↗ Share</button>' +
      "</div>" +
      myPhotosBlock(spot) +
      '<p class="summary">' + esc(spot.summary) + "</p>" +
      (KNOWLEDGE ? KNOWLEDGE.spotSections(spot) : "") +
      (DISCOVER ? DISCOVER.spotSection(spot) : "") +
      (spot.history ? '<div class="spot-section"><h3>📜 History</h3><p>' + esc(spot.history) + "</p></div>" : "") +
      (facts ? '<div class="spot-section"><h3>💡 Fun facts</h3><ul>' + facts + "</ul></div>" : "") +
      (spot.tip ? '<div class="tip">👉 ' + esc(spot.tip) + "</div>" : "") +
      (SOCIAL ? SOCIAL.ratingSection(spot) : "")
    );

    map.panTo([spot.lat, spot.lng]);
    wireSpotButtons(spot);
    if (SOCIAL) SOCIAL.afterSpot(spot);
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

    var wishBtn = document.getElementById("wish-btn");
    if (wishBtn) wishBtn.addEventListener("click", function () {
      if (!ACCT.user) { openSignIn("Sign in to keep a wishlist of spots you want to visit."); return; }
      ACCT.setWished(spot.id, !ACCT.wishlist[spot.id])
        .catch(function (err) { alert("Couldn't save that: " + err.message); });
      openSpot(spot.id);
    });

    var addPhotoBtn = document.getElementById("add-photo-btn");
    if (addPhotoBtn) addPhotoBtn.addEventListener("click", function () {
      if (!ACCT.user) { openSignIn("Sign in to add your own photos of this spot."); return; }
      pickPhoto(spot);
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
    state.view = "list";
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
          '<span class="check">' + (exploredMap()[s.id] ? "✅" : "") + "</span>" +
        "</button>";
      }).join("")
    );
  }

  sheetBody.addEventListener("click", function (e) {
    var item = e.target.closest(".list-item");
    if (item) openSpot(item.getAttribute("data-spot"));
  });

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
      if (first) { map.setView(state.me, 15); first = false; if (DISCOVER) DISCOVER.onLocation(); }
    }, function () {
      watching = false;
      alert("Couldn't get your location. Check that location access is allowed for this site.");
    }, { enableHighAccuracy: true, maximumAge: 10000 });
  });

  // ---------- counter ----------
  function updateCounter() {
    var explored = exploredMap();
    var n = DATA.spots.filter(function (s) { return explored[s.id]; }).length;
    document.getElementById("explored-count").textContent = n;
    document.getElementById("total-count").textContent = DATA.spots.length;
  }

  function refreshExplored() {
    updateCounter();
    renderMarkers();
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

  function renderAccountBtn() {
    var btn = document.getElementById("account-btn");
    if (!ACCT.enabled) return;
    btn.hidden = false;
    if (ACCT.profile) {
      btn.innerHTML = SOCIAL ? SOCIAL.avatar(ACCT.profile, "small") : '<span class="avatar small">' + esc(ACCT.profile.avatar_emoji) + "</span>";
      if (SOCIAL) SOCIAL.fillAvatars(btn);
      btn.setAttribute("aria-label", "Your profile");
      btn.title = "Your profile";
    } else {
      btn.textContent = "Sign in";
      btn.setAttribute("aria-label", "Sign in");
      btn.title = "Sign in or create an account";
    }
  }

  document.getElementById("account-btn").addEventListener("click", function () {
    if (ACCT.user) openProfile(); else openSignIn();
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
            '<h2 class="list-title">Check your email 📬</h2>' +
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
  function profileHeader(p) {
    return '<div class="profile-head" style="--accent:' + esc(p.accent_color) + '">' +
      (SOCIAL ? SOCIAL.avatar(p) : '<span class="avatar">' + esc(p.avatar_emoji) + "</span>") +
      '<div><h2 class="profile-name">' + esc(p.display_name || p.username) + "</h2>" +
      '<p class="profile-user">@' + esc(p.username) + (p.home_city ? " · " + esc(p.home_city) : "") + "</p></div>" +
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

  function wirePhotoGrid(photos, mine, back) {
    Array.prototype.forEach.call(sheetBody.querySelectorAll(".photo-tile"), function (t) {
      t.addEventListener("click", function () {
        var id = t.getAttribute("data-photo-id");
        openPhoto(photos.filter(function (p) { return p.id === id; })[0], mine, back);
      });
    });
  }

  function stat(n, label) {
    return '<div class="stat"><b>' + n + "</b><span>" + esc(label) + "</span></div>";
  }

  function openProfile() {
    if (!ACCT.user || !ACCT.profile) { openSignIn(); return; }
    var p = ACCT.profile;
    state.view = "profile";
    history.replaceState(null, "", "#me");
    var visitedIds = Object.keys(ACCT.visits).sort(function (a, b) { return ACCT.visits[b] < ACCT.visits[a] ? -1 : 1; });
    var wishIds = Object.keys(ACCT.wishlist);
    showSheet(
      profileHeader(p) +
      '<p class="privacy-badge">' + (SOCIAL && SOCIAL.ready() ? SOCIAL.privacyLine(p) : p.is_public
        ? '🌍 Public profile · <a href="#" id="copy-profile">copy link</a>'
        : "🔒 Private profile · only you can see this") + "</p>" +
      '<div class="stats">' +
        stat(visitedIds.filter(spotById).length + "/" + DATA.spots.length, "explored") +
        stat(wishIds.filter(spotById).length, "on wishlist") +
        stat(ACCT.photos.length, ACCT.photos.length === 1 ? "photo" : "photos") +
      "</div>" +
      '<div class="actions"><button class="btn" data-go="edit">✏️ Edit profile</button>' +
        '<button class="btn" id="signout-btn">Sign out</button></div>' +
      (SOCIAL ? SOCIAL.ownProfileSection() : "") +
      (DISCOVER ? DISCOVER.profileSection(null) : "") +
      '<div class="spot-section"><h3>📷 My photos</h3>' + photoGrid(ACCT.photos, "Open a spot and tap “Add photo” to post your first one.") + "</div>" +
      '<div class="spot-section"><h3>💚 Wishlist</h3>' + spotList(wishIds, "Tap “Wishlist” on any spot to save it for later.") + "</div>" +
      '<div class="spot-section"><h3>✅ Explored</h3>' + spotList(visitedIds, "Spots you mark as explored show up here.", ACCT.visits) + "</div>"
    );
    wireLinks();
    wirePhotoGrid(ACCT.photos, true, openProfile);
    if (SOCIAL) SOCIAL.fillAvatars(sheetBody);
    document.getElementById("signout-btn").addEventListener("click", function () {
      ACCT.signOut().catch(function (err) { alert(errText(err)); });
    });
    var copy = document.getElementById("copy-profile");
    if (copy) copy.addEventListener("click", function (e) {
      e.preventDefault();
      var url = location.origin + location.pathname + "#@" + p.username;
      if (navigator.share) navigator.share({ title: "My Go Places profile", url: url }).catch(function () {});
      else if (navigator.clipboard) { navigator.clipboard.writeText(url); copy.textContent = "link copied ✓"; }
    });
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
        '<div class="spot-section"><h3>📷 Photos</h3>' + (hidden(r.profile, "photos_visibility", "photos") || photoGrid(r.photos, "No photos yet.")) + "</div>" +
        '<div class="spot-section"><h3>✅ Explored</h3>' + (hidden(r.profile, "visits_visibility", "explored places") || spotList(ids, "Nothing explored yet.", r.visits)) + "</div>" +
        (r.profile.wishlist_visibility && !hidden(r.profile, "wishlist_visibility", "wishlist") && r.profile.wishlist_visibility !== "only_me"
          ? '<div class="spot-section"><h3>💚 Wishlist</h3>' + spotList(Object.keys(r.wishlist || {}), "Nothing on the wishlist yet.") + "</div>" : "")
      );
      wirePhotoGrid(r.photos, false, function () { openPublicProfile(username); });
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
        '<div class="actions"><button class="btn primary" type="submit">Save</button><button class="btn" type="button" data-go="profile">Cancel</button></div>' +
      "</form>" +
      '<div class="spot-section danger-zone"><h3>Your data</h3>' +
        '<p class="list-desc">Download everything we store about you, or delete your account and all your photos for good.</p>' +
        '<div class="actions"><button class="btn" id="export-btn">⬇ Download my data</button>' +
        '<button class="btn danger" id="delete-btn">Delete account</button></div></div>'
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

    document.getElementById("export-btn").addEventListener("click", function () {
      var blob = new Blob([JSON.stringify(ACCT.exportData(), null, 2)], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "go-places-" + p.username + ".json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    });

    document.getElementById("delete-btn").addEventListener("click", function () {
      var typed = prompt("This deletes your profile, explored spots, wishlist and all your photos. It can't be undone.\n\nType your username (" + p.username + ") to confirm.");
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
    return '<div class="spot-section"><h3>📷 Your photos</h3>' + photoGrid(photos, "") + "</div>";
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
      '<h2 class="list-title">📷 ' + esc(spot.name) + "</h2>" +
      '<div class="upload-preview"><img src="' + preview + '" alt="Your photo"></div>' +
      '<form class="form" id="upload-form">' +
        '<label>Caption (optional)<input name="caption" maxlength="140" placeholder="What did you find?"></label>' +
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
      return ACCT.uploadPhoto(spot.id, file, f.caption.value).then(function () {
        URL.revokeObjectURL(preview);
        openSpot(spot.id);
      }, function (err) {
        form.querySelector('button[type="submit"]').textContent = "Upload";
        throw err;
      });
    });
  }

  function openPhoto(photo, mine, back) {
    if (!photo) return;
    var spot = spotById(photo.spot_id);
    state.view = "photo";
    showSheet(
      '<div class="photo-full"><img src="' + esc(photo.url) + '" alt="' + esc(spot ? spot.name : "") + '"></div>' +
      (photo.caption ? '<p class="summary">' + esc(photo.caption) + "</p>" : "") +
      '<p class="meta">' + (spot ? esc(spot.emoji + " " + spot.name) + " · " : "") + esc(formatDate(photo.created_at)) + "</p>" +
      '<div class="actions">' +
        '<button class="btn" id="photo-back">← Back</button>' +
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
    else if (state.view === "public" && state.publicUser) openPublicProfile(state.publicUser);
    else if (state.view === "list") openList();
    else if (state.view === "discover" && DISCOVER) DISCOVER.rerender();
    else if (state.view === "knowledge" && KNOWLEDGE) KNOWLEDGE.rerender();
    else if (state.view === "social" && SOCIAL) SOCIAL.rerender();
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
      if (state.view === "profile" || state.view === "edit" || state.view === "photo" || state.view === "upload") closeSheet();
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
    else if (DISCOVER && DISCOVER.route(hash)) { /* handled by the discovery layer */ }
    else if (KNOWLEDGE && KNOWLEDGE.route(hash)) { /* handled by Free Knowledge */ }
    else if (SOCIAL && SOCIAL.route(hash)) { /* handled by the social layer */ }
    else if (ACCT.enabled && hash === "me") { if (ACCT.user) openProfile(); else openSignIn(); }
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
      openSpot: openSpot,
      openSignIn: openSignIn,
      openProfile: openProfile,
      openEditProfile: openEditProfile,
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
      isOpen: function () { return state.view === view; }
    };
  }

  if (DISCOVER) DISCOVER.init(layerApi("discover"));
  if (KNOWLEDGE) KNOWLEDGE.init(layerApi("knowledge"));
  if (SOCIAL) SOCIAL.init(layerApi("social"));

  // ---------- start ----------
  document.getElementById("city-label").textContent = DATA.city + ", for free";
  renderThemes();
  renderMarkers();
  updateCounter();

  // With nothing in the link, open on "How do you feel today?".
  function start() {
    if (!location.hash && DISCOVER) DISCOVER.openHome();
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
