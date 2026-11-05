/*
 * GO PLACES — place metadata
 * ==========================
 * Reads the per-city metadata (data/place-meta.js), fills in a reasonable
 * guess for any spot that has no entry yet, and draws "At a glance" on the
 * spot page. Plan My Day (plan.js) and collections use the same helpers, so
 * everything agrees on what "1 Hour" or "Under 5€" means.
 *
 * window.GoMeta.forSpot(spot) returns the metadata of a spot (also kept on
 * spot.meta), with `guessed: true` when it came from the fallback.
 */
(function () {
  "use strict";

  var LAYER = window.GO_PLACES_LAYER || {};
  var TABLE = LAYER.placeMeta || {};

  var DURATIONS = [
    { label: "15 Minutes", minutes: 15 },
    { label: "30 Minutes", minutes: 30 },
    { label: "1 Hour", minutes: 60 },
    { label: "2 Hours", minutes: 120 },
    { label: "Half Day", minutes: 240 },
    { label: "Full Day", minutes: 480 }
  ];
  var BUDGETS = ["Free", "Under 5€", "Under 10€", "Premium"];
  var TIMES = ["Sunrise", "Morning", "Afternoon", "Sunset", "Evening", "Night"];
  var SEASONS = ["Spring", "Summer", "Autumn", "Winter", "All Year"];
  var WEATHER = ["Sunny", "Cloudy", "Rainy", "Snow", "All Weather"];
  var VISITORS = ["Solo", "Friends", "Couples", "Families", "Students", "Tourists", "Locals", "Remote Workers"];
  var LEVELS = ["Very Relaxed", "Relaxed", "Moderate", "Active"];
  var ACCESS = ["Step-free", "Partly step-free", "Not step-free", "Unknown"];

  var cache = {};

  function has(list, v) { return (list || []).indexOf(v) !== -1; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // ---------- fallback for spots with no entry ----------
  function guess(spot) {
    var t = spot.themes || [];
    var indoor = has(spot.knowledge, "free-museums") || has(spot.knowledge, "libraries") || has(t, "churches");
    var cost = String(spot.cost || "").toLowerCase();
    var euros = cost.match(/€\s*(\d+(?:[.,]\d+)?)/);
    var budget = /^free/.test(cost) ? "Free"
      : euros ? (parseFloat(euros[1].replace(",", ".")) <= 5 ? "Under 5€" : parseFloat(euros[1].replace(",", ".")) <= 10 ? "Under 10€" : "Premium")
      : "Under 10€";
    return {
      estimatedDuration: durationFromText(spot.duration) || "1 Hour",
      bestTimeOfDay: has(t, "sunsets") ? ["Sunset", "Evening"] : ["Morning", "Afternoon"],
      bestSeason: ["All Year"],
      weatherSuitability: indoor ? ["All Weather"] : ["Sunny", "Cloudy"],
      visitorTypes: ["Solo", "Friends", "Couples", "Tourists", "Locals"],
      activityLevel: has(t, "outdoors") ? "Moderate" : "Relaxed",
      hiddenGemScore: has(t, "free-classics") ? 3 : has(t, "side-quests") ? 7 : 5,
      knowledgeValue: (has(t, "churches") || has(t, "architecture") || has(t, "free-knowledge")) ? 7 : 4,
      photoValue: has(t, "sunsets") ? 8 : 5,
      accessibilityLevel: "Unknown",
      budgetLevel: budget,
      guessed: true
    };
  }

  // "1–1.5 hours" -> "1 Hour", "10–20 minutes" -> "15 Minutes"
  function durationFromText(text) {
    if (!text) return null;
    var s = String(text).toLowerCase();
    var n = s.match(/(\d+(?:[.,]\d+)?)/);
    if (!n) return null;
    var v = parseFloat(n[1].replace(",", "."));
    var mins = /hour/.test(s) && !/minute/.test(s.slice(0, s.indexOf("hour"))) ? v * 60 : v;
    return nearestDuration(mins);
  }

  function nearestDuration(mins) {
    var best = DURATIONS[0];
    DURATIONS.forEach(function (d) { if (Math.abs(d.minutes - mins) < Math.abs(best.minutes - mins)) best = d; });
    return best.label;
  }

  function forSpot(spot) {
    if (!spot) return null;
    if (cache[spot.id]) return cache[spot.id];
    var base = guess(spot);
    var own = TABLE[spot.id];
    var meta = base;
    if (own) {
      meta = {};
      Object.keys(base).forEach(function (k) { if (k !== "guessed") meta[k] = own[k] != null ? own[k] : base[k]; });
      if (own.budgetBySeason) meta.budgetBySeason = own.budgetBySeason;
    }
    cache[spot.id] = meta;
    spot.meta = meta;
    return meta;
  }

  // ---------- shared helpers ----------
  function minutes(spot) {
    var label = forSpot(spot).estimatedDuration;
    for (var i = 0; i < DURATIONS.length; i++) if (DURATIONS[i].label === label) return DURATIONS[i].minutes;
    return 60;
  }

  function season(date) {
    var mth = (date || new Date()).getMonth();
    return mth >= 2 && mth <= 4 ? "Spring" : mth >= 5 && mth <= 7 ? "Summer" : mth >= 8 && mth <= 10 ? "Autumn" : "Winter";
  }

  // The budget that applies today (some places are only free in winter).
  function budget(spot, date) {
    var m = forSpot(spot);
    return (m.budgetBySeason && m.budgetBySeason[season(date)]) || m.budgetLevel;
  }
  function budgetRank(label) { var i = BUDGETS.indexOf(label); return i === -1 ? BUDGETS.length : i; }

  function inSeason(spot, date) {
    var s = forSpot(spot).bestSeason || [];
    return !s.length || has(s, "All Year") || has(s, season(date));
  }

  // Rough sunrise and sunset hours for central Europe, good enough to tell
  // "sunset" from "evening" without an API.
  function sunHours(date) {
    var d = date || new Date();
    var start = new Date(d.getFullYear(), 0, 0);
    var doy = Math.floor((d - start) / 86400000);
    var c = Math.cos(2 * Math.PI * (doy - 172) / 365);
    return { sunrise: 6.6 - 1.9 * c, sunset: 18.8 + 2.5 * c };
  }

  function timeOfDay(date) {
    var d = date || new Date();
    var h = d.getHours() + d.getMinutes() / 60;
    var sun = sunHours(d);
    if (h >= sun.sunrise - 0.75 && h < sun.sunrise + 1) return "Sunrise";
    if (h >= sun.sunset - 1.5 && h < sun.sunset + 0.5) return "Sunset";
    if (h < sun.sunrise - 0.75 || h >= 22) return "Night";
    if (h < 11.5) return "Morning";
    if (h < sun.sunset - 1.5) return "Afternoon";
    return "Evening";
  }

  function suitsWeather(spot, weather) {
    var w = forSpot(spot).weatherSuitability || [];
    return !weather || has(w, "All Weather") || has(w, weather);
  }

  // ---------- "At a glance" on the spot page ----------
  function scoreBar(emoji, label, n) {
    var v = Math.max(0, Math.min(10, n || 0));
    return '<div class="mt-score" title="' + esc(label) + ": " + v + '/10">' +
      '<span class="mt-score-label">' + esc(emoji + " " + label) + "</span>" +
      '<span class="dz-bar"><span style="width:' + v * 10 + '%"></span></span>' +
      '<span class="mt-score-n">' + v + "/10</span></div>";
  }

  function row(emoji, label, value) {
    if (!value || (Array.isArray(value) && !value.length)) return "";
    return '<div class="mt-row"><span class="mt-k">' + esc(emoji + " " + label) + '</span><span class="mt-v">' +
      esc(Array.isArray(value) ? value.join(", ") : value) + "</span></div>";
  }

  function glance(spot) {
    var m = forSpot(spot);
    var now = new Date();
    var budgetNow = budget(spot, now);
    var budgetText = budgetNow + (budgetNow !== m.budgetLevel ? " right now (" + m.budgetLevel + " the rest of the year)" : "");
    var good = [];
    if (has(m.bestTimeOfDay, timeOfDay(now))) good.push("a good time of day");
    if (!has(m.bestSeason, "All Year") && inSeason(spot, now)) good.push("in season");
    // "Right now" stays visible; the details fold away under a one-line summary.
    var brief = [spot.duration || m.estimatedDuration, budgetNow, m.activityLevel].filter(Boolean).join(" · ");
    return (good.length ? '<p class="mt-now">✨ Right now is ' + esc(good.join(" and ")) + ".</p>" : "") +
      '<details class="spot-section mt-glance fold"><summary><h3>At a glance</h3><span class="fold-brief">' + esc(brief) + "</span></summary>" +
      '<div class="mt-rows">' +
        row("⏱", "Time", spot.duration || m.estimatedDuration) +
        row("💶", "Budget", budgetText) +
        row("🕐", "Best time", m.bestTimeOfDay) +
        row("📅", "Season", m.bestSeason) +
        row("🌦", "Weather", m.weatherSuitability) +
        row("🚶", "Pace", m.activityLevel) +
        row("♿", "Access", m.accessibilityLevel === "Unknown" ? "" : m.accessibilityLevel) +
        row("👥", "Good for", m.visitorTypes) +
      "</div>" +
      scoreBar("💎", "Hidden gem", m.hiddenGemScore) +
      scoreBar("🧠", "Knowledge", m.knowledgeValue) +
      scoreBar("📸", "Photo", m.photoValue) +
      (m.guessed ? '<p class="seg-note">Estimated from the place\'s details; not checked yet.</p>' : "") +
    "</details>";
  }

  // ---------- content checks (browser console) ----------
  function check(spots) {
    function warn(msg) { console.warn("Go Places metadata: " + msg); }
    var ids = {};
    (spots || []).forEach(function (s) { ids[s.id] = true; });
    Object.keys(TABLE).forEach(function (id) {
      var m = TABLE[id];
      if (!ids[id]) warn('"' + id + '" is not a spot in this city');
      function one(field, allowed) { if (m[field] != null && !has(allowed, m[field])) warn(id + ": unknown " + field + ' "' + m[field] + '"'); }
      function many(field, allowed) { (m[field] || []).forEach(function (v) { if (!has(allowed, v)) warn(id + ": unknown " + field + ' "' + v + '"'); }); }
      one("estimatedDuration", DURATIONS.map(function (d) { return d.label; }));
      one("budgetLevel", BUDGETS);
      one("activityLevel", LEVELS);
      one("accessibilityLevel", ACCESS);
      many("bestTimeOfDay", TIMES);
      many("bestSeason", SEASONS);
      many("weatherSuitability", WEATHER);
      many("visitorTypes", VISITORS);
      ["hiddenGemScore", "knowledgeValue", "photoValue"].forEach(function (f) {
        if (m[f] != null && !(m[f] >= 1 && m[f] <= 10)) warn(id + ": " + f + " should be 1–10");
      });
    });
  }

  window.GoMeta = {
    options: { durations: DURATIONS, budgets: BUDGETS, times: TIMES, seasons: SEASONS, weather: WEATHER, visitors: VISITORS, levels: LEVELS, access: ACCESS },
    forSpot: forSpot,
    minutes: minutes,
    budget: budget,
    budgetRank: budgetRank,
    season: season,
    inSeason: inSeason,
    timeOfDay: timeOfDay,
    suitsWeather: suitsWeather,
    glance: glance,
    check: check
  };
})();
