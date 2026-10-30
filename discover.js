/*
 * GO PLACES — discovery layer ("What can I do?")
 * ==============================================
 * Adds activities, moods, "What can I do right now?", hidden gems, quests and
 * badges on top of the map. All content comes from the files in data/
 * (activities.js, discover.js, hidden-gems.js, quests.js); this file only
 * draws it, so new content needs no code changes.
 *
 * Progress (saved and done activities, hidden gems found, badges) is kept on
 * the device, or in the account when signed in and the discovery tables from
 * supabase/schema.sql exist. app.js calls `GoDiscover.init(api)` at start-up.
 */
(function () {
  "use strict";

  var LAYER = window.GO_PLACES_LAYER || {};
  var ACCT = window.GoAccount || { enabled: false };
  var STORAGE_KEY = "goplaces.progress";

  var activities = LAYER.activities || [];
  var gems = LAYER.hiddenGems || [];
  var quests = LAYER.quests || [];
  var badges = LAYER.badges || [];
  var moods = LAYER.moods || [];
  var categories = LAYER.categories || [];
  var timeOptions = LAYER.timeOptions || [];

  var app = null;          // helpers from app.js, set in init()
  var local = loadLocal(); // progress on this device: { saved, done, gems, badges }
  var current = null;      // the open view, so it can be redrawn: { fn, arg }
  var gemMarker = null;
  var toastTimer = null;

  function byId(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function activityById(id) { return byId(activities, id); }
  function gemById(id) { return byId(gems, id); }
  function questById(id) { return byId(quests, id); }
  function badgeById(id) { return byId(badges, id); }
  function moodById(id) { return byId(moods, id); }
  function esc(s) { return app.esc(s); }

  // ---------- progress ----------
  function emptyProgress() { return { saved: {}, done: {}, gems: {}, badges: {} }; }

  function loadLocal() {
    var p = emptyProgress();
    try {
      var stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      Object.keys(p).forEach(function (k) { if (stored[k]) p[k] = stored[k]; });
    } catch (e) { /* private mode or bad data */ }
    return p;
  }

  function saveLocal() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(local)); } catch (e) { /* private mode */ }
  }

  function synced() { return !!(ACCT.user && ACCT.progressSynced); }
  function progress() { return synced() ? ACCT : local; }

  function change(accountCall, localChange) {
    if (synced()) {
      accountCall().catch(function (err) { alert("Couldn't save that: " + ((err && err.message) || err)); });
      // the account emits "progress", which redraws
    } else {
      localChange();
      saveLocal();
      refresh();
    }
  }

  function setSaved(id, on) {
    if (!activityById(id)) return;
    change(function () { return ACCT.setSaved(id, on); }, function () {
      if (on) local.saved[id] = new Date().toISOString(); else delete local.saved[id];
    });
  }

  function setDone(activityId, placeId, on) {
    if (!activityById(activityId)) return;
    var key = activityId + "@" + (placeId || "");
    change(function () { return ACCT.setDone(activityId, placeId, on); }, function () {
      if (on) local.done[key] = new Date().toISOString(); else delete local.done[key];
    });
    // Doing an activity at a spot also counts as exploring that spot.
    if (on && placeId) app.markExplored(placeId);
  }

  function setGemFound(id, on) {
    if (!gemById(id)) return;
    change(function () { return ACCT.setGemFound(id, on); }, function () {
      if (on) local.gems[id] = new Date().toISOString(); else delete local.gems[id];
    });
  }

  function isDoneAt(activityId, placeId) { return !!progress().done[activityId + "@" + (placeId || "")]; }

  function doneActivityIds() {
    var seen = {};
    Object.keys(progress().done).forEach(function (k) { seen[k.slice(0, k.indexOf("@"))] = true; });
    return Object.keys(seen).filter(activityById);
  }

  function isDoneAnywhere(activityId) { return doneActivityIds().indexOf(activityId) !== -1; }

  // ---------- quests ----------
  // A requirement is "activity", "activity@place", "gem:id" or "place:id".
  function requirementDone(req) {
    if (req.indexOf("gem:") === 0) return !!progress().gems[req.slice(4)];
    if (req.indexOf("place:") === 0) return !!app.exploredMap()[req.slice(6)];
    var at = req.indexOf("@");
    return at === -1 ? isDoneAnywhere(req) : isDoneAt(req.slice(0, at), req.slice(at + 1));
  }

  function requirementInfo(req) {
    if (req.indexOf("gem:") === 0) {
      var g = gemById(req.slice(4));
      return { label: g ? "Find " + g.title : req, d: "gem", id: req.slice(4) };
    }
    if (req.indexOf("place:") === 0) {
      var s = app.spotById(req.slice(6));
      return { label: s ? "Explore " + s.name : req, d: "spot", id: req.slice(6) };
    }
    var at = req.indexOf("@");
    var a = activityById(at === -1 ? req : req.slice(0, at));
    var place = at === -1 ? null : app.spotById(req.slice(at + 1));
    var label = (a ? a.title : req) + (place ? " · " + place.name : "");
    return { label: label, d: "act", id: a ? a.id : req };
  }

  function questProgress(q) {
    var reqs = q.requiredActivities || [];
    var have = reqs.filter(requirementDone).length;
    var total = reqs.length;
    var count = 0;
    if (q.requiredCount) {
      count = q.countType === "gems"
        ? Object.keys(progress().gems).filter(gemById).length
        : doneActivityIds().length;
      have += Math.min(count, q.requiredCount);
      total += q.requiredCount;
    }
    return { have: have, total: total, count: count, complete: total > 0 && have >= total };
  }

  function earnedBadges() {
    var earned = {};
    Object.keys(progress().badges).forEach(function (id) { earned[id] = progress().badges[id]; });
    quests.forEach(function (q) {
      if (q.rewardBadgeId && !earned[q.rewardBadgeId] && questProgress(q).complete) earned[q.rewardBadgeId] = new Date().toISOString();
    });
    return earned;
  }

  // Records badges the first time their quest is finished.
  function checkBadges(quiet) {
    var store = progress().badges;
    var fresh = quests.filter(function (q) {
      return q.rewardBadgeId && badgeById(q.rewardBadgeId) && !store[q.rewardBadgeId] && questProgress(q).complete;
    }).map(function (q) { return q.rewardBadgeId; });
    if (!fresh.length) return;
    if (synced()) {
      ACCT.awardBadges(fresh).catch(function (err) { console.error("Couldn't save badge", err); });
    } else {
      var now = new Date().toISOString();
      fresh.forEach(function (id) { local.badges[id] = now; });
      saveLocal();
    }
    if (!quiet) {
      var b = badgeById(fresh[0]);
      toast(b.emoji + " Badge earned: <b>" + esc(b.title) + "</b>", "quests");
    }
  }

  // ---------- helpers ----------
  function season() {
    var m = new Date().getMonth();
    return m < 2 || m === 11 ? "winter" : m < 5 ? "spring" : m < 8 ? "summer" : "autumn";
  }

  function inSeason(a) { return !a.season || !a.season.length || a.season.indexOf(season()) !== -1; }

  function costLabel(cost) {
    if (typeof cost !== "number") return cost || "";
    return cost === 0 ? "Free" : "About €" + cost;
  }

  function kmLabel(km) { return km < 1 ? Math.round(km * 1000) + " m away" : km.toFixed(1) + " km away"; }

  function places(a) { return (a.placeIds || []).map(app.spotById).filter(Boolean); }

  function nearestKm(a) {
    var me = app.me();
    if (!me) return null;
    var best = null;
    places(a).forEach(function (s) {
      var km = app.distanceKm(me, [s.lat, s.lng]);
      if (best === null || km < best) best = km;
    });
    return best;
  }

  function gemKm(g) {
    var me = app.me();
    return me && g.coordinates ? app.distanceKm(me, [g.coordinates.lat, g.coordinates.lng]) : null;
  }

  function byDistance(list, kmFn) {
    if (!app.me()) return list;
    return list.slice().sort(function (a, b) {
      var x = kmFn(a), y = kmFn(b);
      if (x === null) return 1;
      if (y === null) return -1;
      return x - y;
    });
  }

  function categoryEmoji(name) {
    var c = byId(categories, name);
    return c ? c.emoji + " " : "";
  }

  function back(label, d) {
    return '<button class="dz-back" data-d="' + (d || "home") + '">← ' + esc(label || "Discover") + "</button>";
  }

  function locateHint() {
    if (app.me() || !navigator.geolocation) return "";
    return '<button class="dz-locate" data-d="locate">📍 Sort by distance from me</button>';
  }

  function banner(images, emoji, extraClass, title) {
    images = images || [];
    var img = images[0];
    var zoom = img && window.GoLightbox ? window.GoLightbox.attrs(images.map(function (src) {
      return { src: src, caption: title || "" };
    }), 0) : "";
    return '<div class="photo dz-banner' + (extraClass ? " " + extraClass : "") + '">' + esc(emoji || "✨") +
      (img ? '<img src="' + esc(img) + '" alt=""' + zoom + ' onerror="this.remove()">' : "") +
      (images.length > 1 ? '<span class="credit">📷 1 / ' + images.length + "</span>" : "") + "</div>";
  }

  function activityRow(a) {
    var km = nearestKm(a);
    var sub = [a.duration, costLabel(a.cost), km === null ? "" : kmLabel(km)].filter(Boolean).join(" · ");
    var marks = (isDoneAnywhere(a.id) ? "✅" : "") + (progress().saved[a.id] ? "💚" : "");
    return '<button class="list-item" data-d="act" data-id="' + esc(a.id) + '">' +
      '<span class="emoji">' + esc(a.emoji || "🎯") + "</span>" +
      '<span><span class="name">' + esc(a.title) + '</span><br><span class="sub">' + esc(sub) + "</span></span>" +
      '<span class="check">' + marks + "</span>" +
    "</button>";
  }

  function gemCard(g) {
    var km = gemKm(g);
    return '<button class="gem-card" data-d="gem" data-id="' + esc(g.id) + '">' +
      '<span class="gem-emoji">' + esc(g.emoji || "💎") + (progress().gems[g.id] ? '<i class="gem-found">✓</i>' : "") + "</span>" +
      '<span class="gem-title">' + esc(g.title) + "</span>" +
      '<span class="sub">' + esc(km === null ? g.bestTime : kmLabel(km)) + "</span>" +
    "</button>";
  }

  function bar(p) {
    var pct = p.total ? Math.round(100 * p.have / p.total) : 0;
    return '<span class="dz-bar"><span style="width:' + pct + '%"></span></span>';
  }

  function questRow(q) {
    var p = questProgress(q);
    var b = badgeById(q.rewardBadgeId) || {};
    return '<button class="list-item quest-row' + (p.complete ? " complete" : "") + '" data-d="quest" data-id="' + esc(q.id) + '">' +
      '<span class="emoji">' + esc(b.emoji || "🏅") + "</span>" +
      '<span class="quest-main"><span class="name">' + esc(q.title) + "</span>" + bar(p) + "</span>" +
      '<span class="check">' + (p.complete ? "🏅" : p.have + "/" + p.total) + "</span>" +
    "</button>";
  }

  function badgeChip(b, earnedAt) {
    return '<div class="badge' + (earnedAt ? " earned" : "") + '" title="' + esc(b.description) + '">' +
      '<span class="badge-emoji">' + esc(earnedAt ? b.emoji : "🔒") + "</span>" +
      '<span class="badge-title">' + esc(b.title) + "</span></div>";
  }

  function show(fn, arg, html, hash) {
    current = { fn: fn, arg: arg };
    clearGemMarker();
    app.show(html, hash);
  }

  // ---------- views ----------
  function openHome() {
    var saved = Object.keys(progress().saved).map(activityById).filter(Boolean);
    show(openHome, null,
      '<div class="dz-hero">' +
        '<h2 class="list-title">What can I do?</h2>' +
        '<p class="list-desc">Things to do in ' + esc((window.GO_PLACES || {}).city || "the city") + ", picked for your mood and your time.</p>" +
        '<button class="btn primary wide dz-now" data-d="now">⚡ What Can I Do Right Now?</button>' +
      "</div>" +
      '<h3 class="dz-h">How do you feel today?</h3>' +
      '<div class="mood-grid">' + moods.map(function (m) {
        return '<button class="mood-card" data-d="mood" data-id="' + esc(m.id) + '">' +
          '<span class="mood-emoji">' + esc(m.emoji) + "</span>" + esc(m.label) + "</button>";
      }).join("") + "</div>" +
      (gems.length ? '<h3 class="dz-h">💎 Hidden gems</h3>' +
        '<p class="list-desc">Small discoveries most people walk right past.</p>' +
        '<div class="gem-row">' + byDistance(gems, gemKm).map(gemCard).join("") + "</div>" +
        '<button class="dz-more" data-d="gems">See all hidden gems →</button>' : "") +
      (saved.length ? '<h3 class="dz-h">💚 Saved for later</h3>' + saved.map(activityRow).join("") : "") +
      (quests.length ? '<h3 class="dz-h">🏅 Quests</h3>' + quests.map(questRow).join("") +
        '<button class="dz-more" data-d="quests">Your badges →</button>' : ""),
      "");
  }

  function openMood(id) {
    var m = moodById(id);
    if (!m) return openHome();
    var list = byDistance(activities.filter(function (a) { return (a.moodTags || []).indexOf(id) !== -1; }), nearestKm);
    show(openMood, id,
      back() +
      '<h2 class="list-title">' + esc(m.emoji + " " + m.label) + "</h2>" +
      '<p class="list-desc">' + esc(m.description || "") + "</p>" +
      locateHint() +
      (list.length ? list.map(activityRow).join("") : '<p class="empty">Nothing here yet.</p>'),
      "mood/" + id);
  }

  function openNow() {
    show(openNow, null,
      back() +
      '<h2 class="list-title">⚡ How much time do you have?</h2>' +
      '<p class="list-desc">We\'ll show what fits, right now, in ' + esc(season()) + ".</p>" +
      '<div class="time-grid">' + timeOptions.map(function (t) {
        return '<button class="btn time-btn" data-d="time" data-id="' + esc(t.id) + '">' + esc(t.label) + "</button>";
      }).join("") + "</div>",
      "now");
    autoLocate();
  }

  function openTime(id) {
    var t = byId(timeOptions, id);
    if (!t) return openNow();
    var fits = activities.filter(function (a) {
      return typeof a.durationMinutes === "number" && a.durationMinutes <= t.maxMinutes && inSeason(a);
    });
    // Without a location, the ones that use most of your time come first.
    fits.sort(function (a, b) { return b.durationMinutes - a.durationMinutes; });
    fits = byDistance(fits, nearestKm);
    show(openTime, id,
      back("Change time", "now") +
      '<h2 class="list-title">⚡ ' + esc(t.label) + ": you could…</h2>" +
      '<p class="list-desc">' + fits.length + " thing" + (fits.length === 1 ? "" : "s") + " that fit, in " + esc(season()) +
        (app.me() ? ", nearest first." : ".") + "</p>" +
      locateHint() +
      (fits.length ? fits.map(activityRow).join("") : '<p class="empty">Nothing fits that yet. Try a bit more time.</p>'),
      "now/" + id);
    autoLocate();
  }

  // If the browser already allows location, use it to sort without asking.
  function autoLocate() {
    if (app.me() || !navigator.permissions || !navigator.permissions.query) return;
    navigator.permissions.query({ name: "geolocation" }).then(function (r) {
      if (r.state === "granted" && !app.me()) locate();
    }).catch(function () {});
  }

  function locate() {
    var btn = document.getElementById("locate-btn");
    if (btn) btn.click();
  }

  function openActivity(id) {
    var a = activityById(id);
    if (!a) return openHome();
    var spots = places(a);
    var saved = !!progress().saved[id];
    var me = app.me();
    var tags = '<span class="tag">' + esc(categoryEmoji(a.category) + a.category) + "</span>" +
      (a.moodTags || []).map(moodById).filter(Boolean).map(function (m) {
        return '<span class="tag mood-tag">' + esc(m.emoji + " " + m.label) + "</span>";
      }).join("");
    var related = quests.filter(function (q) {
      return (q.requiredActivities || []).some(function (r) { return r === id || r.indexOf(id + "@") === 0; }) ||
        (q.requiredCount && q.countType !== "gems");
    });

    var where;
    if (spots.length) {
      where = spots.map(function (s) {
        var done = isDoneAt(id, s.id);
        var dist = me ? kmLabel(app.distanceKm(me, [s.lat, s.lng])) : "Open place";
        return '<div class="place-row">' +
          '<button class="place-open" data-d="spot" data-id="' + esc(s.id) + '">' +
            '<span class="emoji">' + esc(s.emoji) + "</span>" +
            '<span><span class="name">' + esc(s.name) + '</span><br><span class="sub">' + esc(dist) + "</span></span>" +
          "</button>" +
          '<button class="btn small' + (done ? " done" : "") + '" data-d="do" data-id="' + esc(id) + '" data-place="' + esc(s.id) + '">' +
            (done ? "✅ Done" : "☐ Did it here") + "</button>" +
        "</div>";
      }).join("");
    } else {
      var doneHere = isDoneAt(id, "");
      where = '<button class="btn' + (doneHere ? " done" : "") + '" data-d="do" data-id="' + esc(id) + '" data-place="">' +
        (doneHere ? "✅ Done" : "☐ Mark as done") + "</button>";
    }

    show(openActivity, id,
      banner(a.images, a.emoji, "", a.title) +
      back() +
      '<h2 class="spot-title">' + esc(a.title) + "</h2>" +
      '<div class="tags">' + tags + "</div>" +
      '<p class="meta"><b>Time:</b> ' + esc(a.duration) + "</p>" +
      '<p class="meta"><b>Cost:</b> ' + esc(costLabel(a.cost)) + "</p>" +
      (a.bestTime ? '<p class="meta"><b>Best time:</b> ' + esc(a.bestTime) + "</p>" : "") +
      (a.season && a.season.length && a.season.length < 4 ? '<p class="meta"><b>Season:</b> ' + esc(a.season.join(", ")) + "</p>" : "") +
      '<div class="actions">' +
        '<button class="btn' + (saved ? " wished" : "") + '" data-d="save" data-id="' + esc(id) + '">' + (saved ? "💚 Saved" : "♡ Save") + "</button>" +
        '<button class="btn" data-d="share">↗ Share</button>' +
      "</div>" +
      '<p class="summary">' + esc(a.description) + "</p>" +
      '<div class="spot-section"><h3>📍 Where to do it</h3>' + (spots.length > 1 ? locateHint() : "") + where + "</div>" +
      (related.length ? '<div class="spot-section"><h3>🏅 Counts towards</h3>' + related.map(questRow).join("") + "</div>" : ""),
      "do/" + id);

    if (spots.length) {
      var bounds = window.L.latLngBounds(spots.map(function (s) { return [s.lat, s.lng]; }));
      app.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }

  function openGem(id) {
    var g = gemById(id);
    if (!g) return openGems();
    var found = !!progress().gems[id];
    var km = gemKm(g);
    var c = g.coordinates || {};
    var directions = "https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=" + c.lat + "," + c.lng;
    show(openGem, id,
      banner(g.images, g.emoji || "💎", "gem-photo", g.title) +
      back("Hidden gems", "gems") +
      '<h2 class="spot-title">' + esc(g.title) + "</h2>" +
      '<div class="tags"><span class="tag gem-tag">💎 Hidden gem</span>' + (g.category || []).map(function (cat) {
        return '<span class="tag">' + esc(categoryEmoji(cat) + cat) + "</span>";
      }).join("") + "</div>" +
      (g.bestTime ? '<p class="meta"><b>Best time:</b> ' + esc(g.bestTime) + "</p>" : "") +
      (km !== null ? '<p class="meta"><b>Distance:</b> ' + esc(kmLabel(km)) + "</p>" : "") +
      '<div class="actions">' +
        '<a class="btn primary" target="_blank" rel="noopener" href="' + esc(directions) + '">🧭 Directions</a>' +
        '<button class="btn' + (found ? " done" : "") + '" data-d="found" data-id="' + esc(id) + '">' + (found ? "✅ Found it" : "☐ Found it") + "</button>" +
        '<button class="btn" data-d="share">↗ Share</button>' +
      "</div>" +
      '<p class="summary">' + esc(g.description) + "</p>" +
      (g.whyVisit ? '<div class="spot-section"><h3>✨ Why go</h3><p>' + esc(g.whyVisit) + "</p></div>" : "") +
      (g.localTip ? '<div class="tip">👉 ' + esc(g.localTip) + "</div>" : ""),
      "gem/" + id);

    if (typeof c.lat === "number") {
      gemMarker = window.L.marker([c.lat, c.lng], {
        icon: window.L.divIcon({ className: "", html: '<div class="spot-marker gem-marker">' + esc(g.emoji || "💎") + "</div>", iconSize: [40, 40], iconAnchor: [20, 20] }),
        title: g.title, zIndexOffset: 500
      }).addTo(app.map);
      app.map.setView([c.lat, c.lng], 16);
    }
  }

  function openGems() {
    var list = byDistance(gems, gemKm);
    show(openGems, null,
      back() +
      '<h2 class="list-title">💎 Hidden gems</h2>' +
      '<p class="list-desc">Not the big sights: the little corners locals love. Find them and tick them off.</p>' +
      locateHint() +
      list.map(function (g) {
        var km = gemKm(g);
        return '<button class="list-item" data-d="gem" data-id="' + esc(g.id) + '">' +
          '<span class="emoji">' + esc(g.emoji || "💎") + "</span>" +
          '<span><span class="name">' + esc(g.title) + '</span><br><span class="sub">' + esc(km === null ? g.bestTime : kmLabel(km)) + "</span></span>" +
          '<span class="check">' + (progress().gems[g.id] ? "✅" : "") + "</span>" +
        "</button>";
      }).join(""),
      "gems");
  }

  function openQuests() {
    var earned = earnedBadges();
    show(openQuests, null,
      back() +
      '<h2 class="list-title">🏅 Quests & badges</h2>' +
      '<p class="list-desc">Do activities and find hidden gems to finish quests and earn badges.' +
        (ACCT.enabled && !ACCT.user ? ' <a href="#" data-d="signin">Sign in</a> to keep them on every device.' : "") + "</p>" +
      '<div class="badge-grid">' + badges.map(function (b) { return badgeChip(b, earned[b.id]); }).join("") + "</div>" +
      '<h3 class="dz-h">Quests</h3>' + quests.map(questRow).join(""),
      "quests");
  }

  function openQuest(id) {
    var q = questById(id);
    if (!q) return openQuests();
    var p = questProgress(q);
    var b = badgeById(q.rewardBadgeId);
    var steps = (q.requiredActivities || []).map(function (req) {
      var info = requirementInfo(req);
      var done = requirementDone(req);
      return '<button class="list-item" data-d="' + info.d + '" data-id="' + esc(info.id) + '">' +
        '<span class="emoji">' + (done ? "✅" : "⬜") + "</span>" +
        '<span class="name">' + esc(info.label) + "</span></button>";
    }).join("");
    if (q.requiredCount) {
      var what = q.countType === "gems" ? "hidden gems found" : "different activities done";
      steps += '<div class="count-step"><b>' + Math.min(p.count, q.requiredCount) + "/" + q.requiredCount + "</b> " + what + bar({ have: p.count, total: q.requiredCount }) + "</div>";
    }
    show(openQuest, id,
      back("Quests", "quests") +
      '<h2 class="list-title">' + esc(q.title) + "</h2>" +
      '<p class="list-desc">' + esc(q.description || "") + "</p>" +
      (b ? '<div class="reward">' + badgeChip(b, p.complete) + "<span>" + (p.complete ? "Earned! " : "Reward: ") + esc(b.description) + "</span></div>" : "") +
      steps +
      (q.countType === "gems" ? '<button class="dz-more" data-d="gems">Browse hidden gems →</button>' : ""),
      "quest/" + id);
  }

  // ---------- pieces shown inside app.js screens ----------
  // "Things to do here" on a spot page.
  function spotSection(spot) {
    var list = activities.filter(function (a) { return (a.placeIds || []).indexOf(spot.id) !== -1; });
    if (!list.length) return "";
    return '<div class="spot-section"><h3>🎯 Things to do here</h3>' + list.map(function (a) {
      return '<button class="list-item" data-d="act" data-id="' + esc(a.id) + '">' +
        '<span class="emoji">' + esc(a.emoji || "🎯") + "</span>" +
        '<span><span class="name">' + esc(a.title) + '</span><br><span class="sub">' + esc([a.duration, costLabel(a.cost)].join(" · ")) + "</span></span>" +
        '<span class="check">' + (isDoneAt(a.id, spot.id) ? "✅" : "") + "</span>" +
      "</button>";
    }).join("") + "</div>";
  }

  // Badges (and, on your own profile, saved activities) on a profile page.
  // `theirs` is someone else's earned badges, or null for your own profile.
  function profileSection(theirs) {
    var earned = theirs || earnedBadges();
    var got = badges.filter(function (b) { return earned[b.id]; });
    var html = "";
    if (got.length || !theirs) {
      html += '<div class="spot-section"><h3>🏅 Badges</h3>' +
        (got.length ? '<div class="badge-grid">' + got.map(function (b) { return badgeChip(b, true); }).join("") + "</div>"
          : '<p class="empty">Finish a quest to earn your first badge.</p>') +
        (theirs ? "" : '<button class="dz-more" data-d="quests">See quests →</button>') + "</div>";
    }
    if (!theirs) {
      var saved = Object.keys(progress().saved).map(activityById).filter(Boolean);
      html += '<div class="spot-section"><h3>💚 Saved activities</h3>' +
        (saved.length ? saved.map(activityRow).join("") : '<p class="empty">Tap “Save” on an activity to keep it here.</p>') + "</div>";
    }
    return html;
  }

  // ---------- clicks ----------
  function onClick(e) {
    var el = e.target.closest("[data-d]");
    if (!el) return;
    var d = el.getAttribute("data-d");
    var id = el.getAttribute("data-id");
    if (el.tagName === "A") e.preventDefault();
    if (d === "home") openHome();
    else if (d === "now") openNow();
    else if (d === "time") openTime(id);
    else if (d === "mood") openMood(id);
    else if (d === "act") openActivity(id);
    else if (d === "gem") openGem(id);
    else if (d === "gems") openGems();
    else if (d === "quests") openQuests();
    else if (d === "quest") openQuest(id);
    else if (d === "spot") { clearGemMarker(); app.openSpot(id); }
    else if (d === "save") setSaved(id, !progress().saved[id]);
    else if (d === "do") setDone(id, el.getAttribute("data-place"), !isDoneAt(id, el.getAttribute("data-place")));
    else if (d === "found") setGemFound(id, !progress().gems[id]);
    else if (d === "locate") { el.textContent = "📍 Finding you…"; locate(); }
    else if (d === "signin") app.openSignIn("Sign in to keep your quests and badges on every device.");
    else if (d === "share") share(el);
  }

  function share(el) {
    var url = location.href;
    var title = document.querySelector(".sheet-body .spot-title");
    if (navigator.share) {
      navigator.share({ title: title ? title.textContent : document.title, url: url }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      el.textContent = "✓ Link copied";
    }
  }

  // ---------- redraw ----------
  function rerender() {
    if (!current || !app.isOpen()) return;
    var sheet = document.getElementById("sheet");
    var top = sheet.scrollTop;
    var view = app.map.getCenter(), zoom = app.map.getZoom();
    current.fn(current.arg);
    sheet.scrollTop = top;
    app.map.setView(view, zoom, { animate: false }); // don't jump the map on a redraw
  }

  function refresh() {
    checkBadges(false);
    rerender();
  }

  function clearGemMarker() {
    if (gemMarker) { gemMarker.remove(); gemMarker = null; }
  }

  function toast(html, d) {
    var el = document.getElementById("dz-toast");
    if (!el) {
      el = document.createElement("button");
      el.id = "dz-toast";
      el.className = "dz-toast";
      el.addEventListener("click", function () {
        el.classList.remove("show");
        if (el.getAttribute("data-go") === "quests") openQuests();
      });
      document.body.appendChild(el);
    }
    el.innerHTML = html;
    el.setAttribute("data-go", d || "");
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 4000);
  }

  function addMapButtons() {
    var pill = document.createElement("button");
    pill.className = "now-pill";
    pill.innerHTML = "⚡ What can I do right now?";
    pill.addEventListener("click", openNow);
    document.body.appendChild(pill);

    var fab = document.createElement("button");
    fab.className = "fab";
    fab.title = "Discover things to do";
    fab.setAttribute("aria-label", "Discover things to do");
    fab.textContent = "✨";
    fab.addEventListener("click", openHome);
    var buttons = document.querySelector(".map-buttons");
    if (buttons) buttons.insertBefore(fab, buttons.firstChild);
  }

  // Warns in the browser console about content that points at things that
  // don't exist, e.g. a misspelled spot id in data/activities.js.
  function checkContent() {
    function warn(msg) { console.warn("Go Places content: " + msg); }
    activities.forEach(function (a) {
      (a.placeIds || []).forEach(function (p) { if (!app.spotById(p)) warn('activity "' + a.id + '" links to unknown spot "' + p + '"'); });
      (a.moodTags || []).forEach(function (m) { if (!moodById(m)) warn('activity "' + a.id + '" has unknown mood "' + m + '"'); });
      if (categories.length && !byId(categories, a.category)) warn('activity "' + a.id + '" has unknown category "' + a.category + '"');
    });
    quests.forEach(function (q) {
      if (!badgeById(q.rewardBadgeId)) warn('quest "' + q.id + '" rewards unknown badge "' + q.rewardBadgeId + '"');
      (q.requiredActivities || []).forEach(function (r) {
        var info = requirementInfo(r);
        var ok = info.d === "gem" ? gemById(info.id) : info.d === "spot" ? app.spotById(info.id) : activityById(info.id);
        var at = r.indexOf("@");
        if (ok && at !== -1 && !app.spotById(r.slice(at + 1))) ok = false;
        if (!ok) warn('quest "' + q.id + '" needs unknown "' + r + '"');
      });
    });
  }

  // ---------- start ----------
  window.GoDiscover = {
    init: function (api) {
      app = api;
      app.sheetBody.addEventListener("click", onClick);
      addMapButtons();
      checkContent();
      checkBadges(true);

      if (ACCT.on) ACCT.on(function (event) {
        if (event === "signed-in") {
          if (ACCT.progressSynced) {
            ACCT.importProgress(local).then(function (n) {
              if (n) { local = emptyProgress(); saveLocal(); }
            }).catch(function (err) { console.error("Couldn't import progress", err); });
          }
          checkBadges(true);
          rerender();
        } else if (event === "signed-out") {
          local = loadLocal();
          rerender();
        } else if (event === "progress" || event === "visits") {
          refresh();
        }
      });
    },
    openHome: openHome,
    route: function (hash) {
      var parts = hash.split("/");
      var id = parts[1];
      if (hash === "discover") openHome();
      else if (hash === "now") openNow();
      else if (parts[0] === "now" && id) openTime(id);
      else if (parts[0] === "mood" && id) openMood(id);
      else if (parts[0] === "do" && id) openActivity(id);
      else if (parts[0] === "gem" && id) openGem(id);
      else if (hash === "gems") openGems();
      else if (hash === "quests") openQuests();
      else if (parts[0] === "quest" && id) openQuest(id);
      else return false;
      return true;
    },
    rerender: rerender,
    onClose: function () { current = null; clearGemMarker(); },
    onLocation: function () { rerender(); },
    spotSection: spotSection,
    profileSection: profileSection
  };
})();
