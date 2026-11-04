/*
 * GO PLACES — Plan My Day
 * =======================
 * Builds a short route through existing places from a few choices: time,
 * budget, interests, company and weather. Settings and interest rules are in
 * data/plan.js; place facts come from data/place-meta.js (via meta.js).
 *
 * The planner is split into small parts so each can be swapped later without
 * touching the rest (window.GoItinerary):
 *
 *   filters   places that can't be on today's route (budget, rain, …)
 *   scorers   how well a place fits, each 0–1 with a weight from data/plan.js
 *   travel    minutes between two points (default: walking or a rough
 *             public transport estimate from the straight-line distance)
 *   weather   where the current weather comes from (default: Open-Meteo for
 *             the city centre, no key and no personal data sent)
 *
 * Later additions such as live opening hours, real walking or cycling times,
 * public transport or seasonal events plug in with addFilter, addScorer,
 * setTravel or setWeatherProvider.
 */
(function () {
  "use strict";

  var CFG = window.GO_PLACES_PLAN || { interests: [], budgets: [], companions: [], weather: [], weights: {}, maxStops: 6 };
  var LAYER = window.GO_PLACES_LAYER || {};
  var DATA = window.GO_PLACES;
  var META = window.GoMeta;
  var ACCT = window.GoAccount || { enabled: false };
  var W = CFG.weights || {};
  var TIMES = LAYER.timeOptions || [
    { id: "30m", label: "30 Minutes", maxMinutes: 30 }, { id: "1h", label: "1 Hour", maxMinutes: 60 },
    { id: "2h", label: "2 Hours", maxMinutes: 120 }, { id: "half", label: "Half Day", maxMinutes: 240 },
    { id: "full", label: "Full Day", maxMinutes: 600 }
  ];

  var app = null;
  var routeLayer = null;
  var keepRoute = false;  // "Show on map" keeps the route after the sheet closes
  var routePill = null;
  var lastPlan = null;
  var detected = { weather: null, state: "idle" }; // idle | loading | done | failed

  function byId(list, id) {
    for (var i = 0; i < (list || []).length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function has(list, v) { return (list || []).indexOf(v) !== -1; }
  function overlap(a, b) { return (a || []).some(function (x) { return has(b, x); }); }
  function esc(s) { return app.esc(s); }

  // ---------- the planner ----------
  var linkedActivities = {}; // spotId -> [activity]
  (LAYER.activities || []).forEach(function (a) {
    (a.placeIds || []).forEach(function (p) { (linkedActivities[p] = linkedActivities[p] || []).push(a); });
  });

  function matchesInterest(spot, interest) {
    var m = META.forSpot(spot);
    if (overlap(spot.themes, interest.themes)) return true;
    if (overlap(spot.knowledge, interest.knowledge)) return true;
    if (has(interest.placeIds, spot.id)) return true;
    var acts = linkedActivities[spot.id] || [];
    if (interest.activityCategories && acts.some(function (a) { return has(interest.activityCategories, a.category); })) return true;
    if (interest.activities && acts.some(function (a) { return has(interest.activities, a.id); })) return true;
    var min = interest.minMeta || {};
    return Object.keys(min).length > 0 && Object.keys(min).every(function (k) { return (m[k] || 0) >= min[k]; });
  }

  function minutesBetween(a, b) {
    var R = 6371, toRad = Math.PI / 180;
    var dLat = (b.lat - a.lat) * toRad, dLng = (b.lng - a.lng) * toRad;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(a.lat * toRad) * Math.cos(b.lat * toRad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  // Straight-line distance with a detour factor. Up to about 2.5 km on foot
  // (4.5 km/h); further than that, a rough public transport time: about 12
  // minutes of walking and waiting plus 22 km/h. Swap with setTravel().
  function defaultTravel(a, b) {
    var km = minutesBetween(a, b) * 1.3;
    if (km <= 2.5) return { km: km, minutes: Math.max(2, Math.round(km / 4.5 * 60)), mode: "walk" };
    return { km: km, minutes: Math.round((12 + km / 22 * 60) / 5) * 5, mode: "transit" };
  }

  var engine = {
    filters: [
      { id: "budget", fn: function (spot, ctx) { return META.budgetRank(META.budget(spot, ctx.now)) <= META.budgetRank(ctx.budget.max); } },
      // Rain and snow rule out places that only work in good weather.
      { id: "weather", fn: function (spot, ctx) { return !(ctx.weather === "Rainy" || ctx.weather === "Snow") || META.suitsWeather(spot, ctx.weather); } },
      { id: "time", fn: function (spot, ctx) { return META.minutes(spot) <= ctx.minutes; } },
      { id: "interest", fn: function (spot, ctx) { return !ctx.strictInterests || !ctx.interests.length || ctx.interests.some(function (i) { return matchesInterest(spot, i); }); } }
    ],
    scorers: [
      { id: "interest", weight: W.interest, fn: function (spot, ctx) {
        if (!ctx.interests.length) return { score: 0.5 };
        var hit = ctx.interests.filter(function (i) { return matchesInterest(spot, i); });
        return { score: hit.length / ctx.interests.length, reasons: hit.map(function (i) { return i.emoji + " " + i.label; }) };
      } },
      { id: "weather", weight: W.weather, fn: function (spot, ctx) {
        if (!ctx.weather) return { score: 0.5 };
        var m = META.forSpot(spot);
        if (has(m.weatherSuitability, "All Weather") && (ctx.weather === "Rainy" || ctx.weather === "Snow")) return { score: 1, reasons: ["☔ Indoors"] };
        return { score: META.suitsWeather(spot, ctx.weather) ? 1 : 0.15 };
      } },
      { id: "companions", weight: W.companions, fn: function (spot, ctx) {
        if (!ctx.companions) return { score: 0.5 };
        return { score: overlap(META.forSpot(spot).visitorTypes, ctx.companions.visitorTypes) ? 1 : 0 };
      } },
      { id: "hiddenGem", weight: W.hiddenGem, fn: function (spot, ctx) {
        var g = META.forSpot(spot).hiddenGemScore || 5;
        var picked = ctx.interests.some(function (i) { return i.id === "hidden-gems"; });
        return { score: g / 10, reasons: g >= 8 && !picked ? ["💎 Hidden gem"] : [] };
      } },
      { id: "timeOfDay", weight: W.timeOfDay, fn: function (spot, ctx, at) {
        var t = META.timeOfDay(at);
        var ok = has(META.forSpot(spot).bestTimeOfDay, t);
        return { score: ok ? 1 : 0, reasons: ok && (t === "Sunset" || t === "Sunrise") ? ["🌅 " + t + " spot"] : [] };
      } },
      // Outdoor places after dark only count if they're meant for the evening.
      { id: "daylight", weight: W.daylight, fn: function (spot, ctx, at) {
        var m = META.forSpot(spot);
        var t = META.timeOfDay(at);
        if (has(m.weatherSuitability, "All Weather") || (t !== "Night" && t !== "Evening")) return { score: 1 };
        return { score: has(m.bestTimeOfDay, t) ? 1 : 0 };
      } },
      { id: "season", weight: W.season, fn: function (spot, ctx) {
        var s = META.forSpot(spot).bestSeason || [];
        if (has(s, "All Year")) return { score: 0.6 };
        return META.inSeason(spot, ctx.now) ? { score: 1, reasons: ["📅 Best in " + META.season(ctx.now)] } : { score: 0 };
      } }
    ],
    travel: defaultTravel,
    weather: openMeteo
  };

  function scoreSpot(spot, ctx, at, previous) {
    var total = 0, reasons = [];
    engine.scorers.forEach(function (s) {
      var r = s.fn(spot, ctx, at) || { score: 0 };
      total += (s.weight == null ? 1 : s.weight) * r.score;
      (r.reasons || []).forEach(function (x) { if (!has(reasons, x)) reasons.push(x); });
    });
    // Variety: a second bookshelf counts for a lot less, a second museum a bit less.
    previous.forEach(function (p) { total *= sameKind(p, spot); });
    total += ctx.jitter(spot.id);
    return { value: total, reasons: reasons };
  }

  function sameKind(a, b) {
    if (a.group && a.group === b.group) return 0.55;
    var ka = (a.knowledge || [])[0], kb = (b.knowledge || [])[0];
    return ka && ka === kb ? 0.85 : 1;
  }

  // Insertion route: start with one place (or from where you are), then keep
  // adding the place that adds the most, at the spot in the route where it
  // costs the least extra travel, while everything still fits in the time.
  function timeline(order, start, ctx) {
    var used = 0, pos = start, legs = [];
    for (var i = 0; i < order.length; i++) {
      var leg = pos ? engine.travel(pos, order[i], ctx) : null;
      used += leg ? leg.minutes : 0;
      legs.push({ leg: leg, arriveAfter: used, stay: META.minutes(order[i]) });
      used += META.minutes(order[i]);
      pos = order[i];
    }
    return { legs: legs, used: used };
  }

  function evaluate(order, start, ctx) {
    var t = timeline(order, start, ctx);
    if (t.used > ctx.minutes) return null;
    var value = 0, stops = [], travel = 0;
    order.forEach(function (spot, i) {
      var l = t.legs[i];
      var at = new Date(ctx.now.getTime() + l.arriveAfter * 60000);
      var s = scoreSpot(spot, ctx, at, order.slice(0, i));
      travel += l.leg ? l.leg.minutes : 0;
      value += s.value;
      stops.push({ spot: spot, leg: l.leg, stay: l.stay, arrive: at, reasons: s.reasons });
    });
    return { stops: stops, minutes: t.used, value: value - (W.travel || 0) * travel };
  }

  function routeFrom(first, start, pool, ctx) {
    var order = first ? [first] : [];
    var best = order.length ? evaluate(order, start, ctx) : { stops: [], minutes: 0, value: 0 };
    if (!best) return null;
    var maxStops = CFG.maxStops || 6;
    while (order.length < maxStops) {
      var next = null;
      pool.forEach(function (spot) {
        if (order.indexOf(spot) !== -1 || META.minutes(spot) + best.minutes > ctx.minutes) return;
        for (var i = 0; i <= order.length; i++) {
          var tryOrder = order.slice(0, i).concat([spot], order.slice(i));
          var r = evaluate(tryOrder, start, ctx);
          if (r && r.value - best.value > 0.5 && (!next || r.value > next.r.value)) next = { r: r, order: tryOrder };
        }
      });
      if (!next) break;
      order = next.order;
      best = next.r;
    }
    if (!best.stops.length) return null;
    // Small bonus for using the time well, so a 2-hour plan isn't 15 minutes.
    best.score = best.value + 2 * (best.minutes / ctx.minutes);
    return best;
  }

  function plan(prefs) {
    var ctx = context(prefs);
    var spots = (DATA.spots || []).filter(function (s) { return typeof s.lat === "number"; });
    function attempt(strict) {
      ctx.strictInterests = strict;
      var pool = spots.filter(function (s) { return engine.filters.every(function (f) { return f.fn(s, ctx); }); });
      if (!pool.length) return null;
      var best = null;
      if (ctx.start) {
        best = routeFrom(null, ctx.start, pool, ctx);
      } else {
        // No location: try the best few places as the first stop and keep the best route.
        var firsts = pool.map(function (s) { return { s: s, v: scoreSpot(s, ctx, ctx.now, []).value }; })
          .sort(function (a, b) { return b.v - a.v; }).slice(0, 8);
        firsts.forEach(function (f) {
          var r = routeFrom(f.s, null, pool, ctx);
          if (r && (!best || r.score > best.score)) best = r;
        });
      }
      return best;
    }
    var result = attempt(true);
    var relaxed = false;
    if (!result && ctx.interests.length) { result = attempt(false); relaxed = !!result; }
    if (result) { result.relaxed = relaxed; result.ctx = ctx; }
    return result;
  }

  function context(prefs) {
    var t = byId(TIMES, prefs.time) || TIMES[2];
    var seed = prefs.seed || 0;
    return {
      prefs: prefs,
      now: prefs.now || new Date(),
      minutes: t.maxMinutes,
      timeOption: t,
      budget: byId(CFG.budgets, prefs.budget) || CFG.budgets[CFG.budgets.length - 1],
      interests: (prefs.interests || []).map(function (id) { return byId(CFG.interests, id); }).filter(Boolean),
      companions: byId(CFG.companions, prefs.companions),
      weather: prefs.weather || null,
      start: prefs.start || null,
      // "Try another plan" changes the seed, which nudges the scores a little.
      jitter: function (id) {
        if (!seed) return 0;
        var h = seed;
        for (var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 1000003;
        return (h % 1000) / 1000 * 2.5;
      }
    };
  }

  // ---------- weather ----------
  // Open-Meteo is free and needs no key. Only the city centre is sent, never
  // the person's own location. Returns "Sunny", "Cloudy", "Rainy", "Snow" or null.
  function openMeteo() {
    var c = (DATA && DATA.center) || [48.1374, 11.5755];
    var key = "goplaces.weather." + c.join(",");
    try {
      var cached = JSON.parse(sessionStorage.getItem(key) || "null");
      if (cached && Date.now() - cached.at < 30 * 60000) return Promise.resolve(cached.weather);
    } catch (e) { /* private mode */ }
    if (!window.fetch) return Promise.resolve(null);
    var url = "https://api.open-meteo.com/v1/forecast?latitude=" + c[0] + "&longitude=" + c[1] + "&current=weather_code";
    var timeout = new Promise(function (resolve) { setTimeout(function () { resolve(null); }, 5000); });
    var req = fetch(url).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      var code = j && j.current && j.current.weather_code;
      var w = code == null ? null
        : code <= 1 ? "Sunny"
        : (code >= 71 && code <= 77) || code === 85 || code === 86 ? "Snow"
        : code >= 51 ? "Rainy"
        : "Cloudy";
      try { if (w) sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), weather: w })); } catch (e) { /* private mode */ }
      return w;
    }).catch(function () { return null; });
    return Promise.race([req, timeout]);
  }

  function detectWeather() {
    if (detected.state !== "idle") return;
    detected.state = "loading";
    Promise.resolve(engine.weather()).then(function (w) {
      detected.weather = w;
      detected.state = w ? "done" : "failed";
    }, function () { detected.state = "failed"; }).then(function () {
      if (app && app.isOpen() && current === "form") openForm(formPrefs);
    });
  }

  // ---------- preferences in the link ----------
  // #plan/t=2h&b=free&i=books,museums&c=solo&w=Rainy
  function toHash(p) {
    var parts = ["t=" + p.time, "b=" + p.budget];
    if (p.interests.length) parts.push("i=" + p.interests.join(","));
    if (p.companions) parts.push("c=" + p.companions);
    if (p.weatherChoice) parts.push("w=" + p.weatherChoice);
    if (p.seed) parts.push("s=" + p.seed);
    return "plan/" + parts.join("&");
  }

  function fromHash(str) {
    var p = defaults();
    String(str || "").split("&").forEach(function (kv) {
      var i = kv.indexOf("="), k = kv.slice(0, i), v = kv.slice(i + 1);
      if (k === "t" && byId(TIMES, v)) p.time = v;
      else if (k === "b" && byId(CFG.budgets, v)) p.budget = v;
      else if (k === "i") p.interests = v.split(",").filter(function (id) { return byId(CFG.interests, id); });
      else if (k === "c" && byId(CFG.companions, v)) p.companions = v;
      else if (k === "w" && byId(CFG.weather, v)) p.weatherChoice = v;
      else if (k === "s") p.seed = parseInt(v, 10) || 0;
    });
    return p;
  }

  function defaults() {
    var mine = (ACCT.user && ACCT.profile && ACCT.profile.interests) || [];
    return {
      time: "2h",
      budget: "free",
      interests: mine.filter(function (id) { return byId(CFG.interests, id); }).slice(0, 4),
      companions: "",
      weatherChoice: "",
      seed: 0
    };
  }

  // ---------- screens ----------
  var current = null;   // "form" | "result"
  var formPrefs = null;

  function pill(group, id, label, on, multi) {
    return '<button type="button" class="pl-pill' + (on ? " on" : "") + '" data-pl="' + group + '" data-id="' + esc(id) + '"' +
      (multi ? "" : ' role="radio"') + ' aria-pressed="' + (on ? "true" : "false") + '">' + esc(label) + "</button>";
  }

  function weatherBlock(p) {
    var opts = CFG.weather.map(function (w) { return pill("w", w.id, w.emoji + " " + w.label, p.weatherChoice === w.id); }).join("");
    var note;
    if (detected.state === "loading") note = "Checking the weather in " + esc(DATA.city) + "…";
    else if (detected.weather) {
      var w = byId(CFG.weather, detected.weather);
      note = p.weatherChoice ? "Detected " + esc(w.emoji + " " + w.label) + '. <button type="button" class="link-btn" data-pl="w-auto">Use that</button>'
        : "Right now it's " + esc(w.emoji + " " + w.label.toLowerCase()) + " in " + esc(DATA.city) + ". Pick another to plan for different weather.";
    } else note = "Couldn't detect the weather. Pick one, or leave it and we'll plan for any.";
    return '<p class="seg-note pl-weather-note">' + note + "</p>" + '<div class="pl-pills">' + opts + "</div>";
  }

  function openForm(p) {
    p = p || formPrefs || defaults();
    formPrefs = p;
    current = "form";
    clearRoute();
    var me = app.me();
    app.show(
      '<h2 class="list-title">🗓️ Plan My Day</h2>' +
      '<p class="list-desc">Tell us what you\'re up for and we\'ll put together a route through ' + esc(DATA.city) + "'s places.</p>" +
      '<h3 class="dz-h">⏱ Time available</h3><div class="pl-pills">' +
        TIMES.map(function (t) { return pill("t", t.id, t.label, p.time === t.id); }).join("") + "</div>" +
      '<h3 class="dz-h">💶 Budget</h3><div class="pl-pills">' +
        CFG.budgets.map(function (b) { return pill("b", b.id, b.label, p.budget === b.id); }).join("") + "</div>" +
      '<h3 class="dz-h">✨ Interests <span class="seg-note">pick any</span></h3><div class="pl-pills">' +
        CFG.interests.map(function (i) { return pill("i", i.id, i.emoji + " " + i.label, has(p.interests, i.id), true); }).join("") + "</div>" +
      '<h3 class="dz-h">👥 Who\'s coming?</h3><div class="pl-pills">' +
        CFG.companions.map(function (c) { return pill("c", c.id, c.emoji + " " + c.label, p.companions === c.id); }).join("") + "</div>" +
      '<h3 class="dz-h">🌦 Weather</h3>' + weatherBlock(p) +
      '<button class="btn primary wide pl-go" data-pl="go">🗓️ Plan my day</button>' +
      '<p class="seg-note">' + (me ? "📍 Starting from where you are." : '📍 <button type="button" class="link-btn" data-pl="locate">Use my location</button> to start from where you are.') + "</p>",
      "plan");
    detectWeather();
  }

  function openResult(p) {
    formPrefs = p;
    current = "result";
    var weather = p.weatherChoice || detected.weather || null;
    var me = app.me();
    var result = plan({
      time: p.time, budget: p.budget, interests: p.interests, companions: p.companions,
      weather: weather, seed: p.seed, start: me ? { lat: me[0], lng: me[1] } : null
    });
    lastPlan = result;
    var t = byId(TIMES, p.time) || TIMES[2];
    var b = byId(CFG.budgets, p.budget);
    var summary = [t.label, b && b.label, weather].filter(Boolean).join(" · ");
    if (!result) {
      clearRoute();
      app.show(
        back() + '<h2 class="list-title">🗓️ Plan My Day</h2>' +
        '<p class="empty">Nothing fits ' + esc(summary) + ". Try more time or a bigger budget.</p>",
        toHash(p));
      return;
    }
    var html = result.stops.map(function (s, i) {
      return legRow(s.leg, i === 0 && !!me) + stopRow(s, i, result.ctx);
    }).join("");
    app.show(
      back() +
      '<h2 class="list-title">🗓️ Your ' + esc(t.label.toLowerCase()) + "</h2>" +
      '<p class="list-desc">' + result.stops.length + " stop" + (result.stops.length === 1 ? "" : "s") + " · about " + duration(result.minutes) + " · " + esc(summary) + "</p>" +
      (result.relaxed ? '<p class="privacy-note">Nothing matched all your interests in that time, so here are the closest fits.</p>' : "") +
      '<ol class="pl-route">' + html + "</ol>" +
      '<div class="actions">' +
        '<a class="btn primary" target="_blank" rel="noopener" href="' + mapsLink(result, me) + '">🧭 Directions</a>' +
        '<button class="btn" data-pl="map">🗺 Show on map</button>' +
        '<button class="btn" data-pl="again">🔀 Try another</button>' +
        (window.GoCollections ? '<button class="btn" data-pl="save">➕ Save as collection</button>' : "") +
        '<button class="btn" data-pl="share">↗ Share</button>' +
      "</div>" +
      '<p class="seg-note">Times between stops are estimates. Opening hours aren\'t checked yet, so look at each place before you go.</p>',
      toHash(p));
    drawRoute(result, me, false);
  }

  function back() { return '<button class="dz-back" data-pl="form">← Change plan</button>'; }

  function duration(min) {
    if (min < 60) return min + " min";
    var h = Math.floor(min / 60), m = min % 60;
    return h + " h" + (m ? " " + m + " min" : "");
  }

  function legRow(leg, fromMe) {
    if (!leg) return "";
    var what = leg.mode === "walk"
      ? "🚶 " + leg.minutes + " min walk (" + leg.km.toFixed(1) + " km)"
      : "🚆 about " + leg.minutes + " min by public transport (" + leg.km.toFixed(1) + " km)";
    return '<li class="pl-leg">' + (fromMe ? "From you: " : "") + esc(what) + "</li>";
  }

  function stopRow(s, i, ctx) {
    var spot = s.spot;
    var acts = (linkedActivities[spot.id] || []).filter(function (a) { return !ctx.interests.length || ctx.interests.some(function (it) { return has(it.activityCategories, a.category) || has(it.activities, a.id); }); });
    var act = acts[0] || (linkedActivities[spot.id] || [])[0];
    var gem = nearbyGem(spot);
    var time = s.arrive.getHours() + ":" + ("0" + s.arrive.getMinutes()).slice(-2);
    var facts = ["⏱ " + duration(s.stay), "💶 " + META.budget(spot, ctx.now), "🕐 around " + time];
    return '<li class="pl-stop">' +
      '<span class="pl-num">' + (i + 1) + "</span>" +
      '<div class="pl-body">' +
        '<a class="pl-name" href="#' + esc(spot.id) + '">' + esc(spot.emoji + " " + spot.name) + "</a>" +
        '<span class="sub">' + esc(facts.join(" · ")) + "</span>" +
        (s.reasons.length ? '<span class="pl-why">' + s.reasons.slice(0, 4).map(function (r) { return '<span class="tag mood-tag">' + esc(r) + "</span>"; }).join("") + "</span>" : "") +
        (act ? '<a class="pl-extra" href="#do/' + esc(act.id) + '">🎯 ' + esc(act.title) + "</a>" : "") +
        (gem ? '<a class="pl-extra" href="#gem/' + esc(gem.id) + '">💎 Nearby: ' + esc(gem.title) + "</a>" : "") +
        (spot.opening ? '<span class="sub">🕰 ' + esc(spot.opening) + "</span>" : "") +
      "</div></li>";
  }

  function nearbyGem(spot) {
    var best = null, bestKm = 0.5;
    (LAYER.hiddenGems || []).forEach(function (g) {
      if (!g.coordinates) return;
      var km = minutesBetween(spot, g.coordinates);
      if (km < bestKm) { best = g; bestKm = km; }
    });
    return best;
  }

  function mapsLink(result, me) {
    var pts = result.stops.map(function (s) { return s.spot.lat + "," + s.spot.lng; });
    var transit = result.stops.some(function (s) { return s.leg && s.leg.mode === "transit"; });
    var url = "https://www.google.com/maps/dir/?api=1&travelmode=" + (transit ? "transit" : "walking") +
      "&destination=" + pts[pts.length - 1];
    if (!me && pts.length > 1) url += "&origin=" + pts[0];
    var mid = me ? pts.slice(0, -1) : pts.slice(1, -1);
    // Google Maps ignores waypoints for transit, so those plans open stop by stop.
    if (mid.length && !transit) url += "&waypoints=" + encodeURIComponent(mid.join("|"));
    return url;
  }

  // ---------- route on the map ----------
  function clearRoute() {
    if (routeLayer) { app.map.removeLayer(routeLayer); routeLayer = null; }
    keepRoute = false;
    if (routePill) { routePill.remove(); routePill = null; }
  }

  // While the route is on the map: "Your plan" reopens it, ✕ removes it.
  function showRoutePill() {
    if (routePill) routePill.remove();
    routePill = document.createElement("div");
    routePill.className = "pl-route-pill";
    routePill.innerHTML = '<button type="button" class="pl-route-open">🗓️ Your plan</button><button type="button" class="pl-route-x" aria-label="Remove the route from the map">✕</button>';
    routePill.querySelector(".pl-route-open").addEventListener("click", function () { if (formPrefs) openResult(formPrefs); });
    routePill.querySelector(".pl-route-x").addEventListener("click", clearRoute);
    document.body.appendChild(routePill);
  }

  function drawRoute(result, me, fit) {
    clearRoute();
    if (!window.L || !app.map) return;
    var pts = result.stops.map(function (s) { return [s.spot.lat, s.spot.lng]; });
    routeLayer = L.layerGroup();
    L.polyline((me ? [me] : []).concat(pts), { color: "#0f766e", weight: 4, opacity: 0.8, dashArray: "6 8" }).addTo(routeLayer);
    result.stops.forEach(function (s, i) {
      L.marker([s.spot.lat, s.spot.lng], {
        icon: L.divIcon({ className: "", html: '<div class="pl-marker">' + (i + 1) + "</div>", iconSize: [26, 26], iconAnchor: [13, 13] }),
        zIndexOffset: 900
      }).on("click", function () { app.openSpot(s.spot.id); }).addTo(routeLayer);
    });
    routeLayer.addTo(app.map);
    if (fit) {
      app.map.fitBounds(L.latLngBounds((me ? [me] : []).concat(pts)), { padding: [40, 40], maxZoom: 15 });
      var sheet = document.getElementById("sheet");
      if (sheet) sheet.scrollTop = 0;
    }
  }

  // ---------- clicks ----------
  function onClick(e) {
    if (!app.isOpen()) return;
    var el = e.target.closest("[data-pl]");
    if (!el) return;
    var k = el.getAttribute("data-pl"), id = el.getAttribute("data-id");
    var p = formPrefs || defaults();
    if (k === "t") { p.time = id; openForm(p); }
    else if (k === "b") { p.budget = id; openForm(p); }
    else if (k === "c") { p.companions = p.companions === id ? "" : id; openForm(p); }
    else if (k === "w") { p.weatherChoice = p.weatherChoice === id ? "" : id; openForm(p); }
    else if (k === "w-auto") { p.weatherChoice = ""; openForm(p); }
    else if (k === "i") {
      p.interests = has(p.interests, id) ? p.interests.filter(function (x) { return x !== id; }) : p.interests.concat([id]);
      openForm(p);
    }
    else if (k === "locate") { var btn = document.getElementById("locate-btn"); if (btn) btn.click(); }
    else if (k === "go") { p.seed = 0; openResult(p); }
    else if (k === "form") openForm(p);
    else if (k === "again") { p.seed = (p.seed || 0) + 1 + Math.floor(Math.random() * 97); openResult(p); }
    else if (k === "map" && lastPlan) { drawRoute(lastPlan, app.me(), true); keepRoute = true; app.close(); showRoutePill(); }
    else if (k === "save" && lastPlan && window.GoCollections) {
      var t = byId(TIMES, p.time) || TIMES[2];
      window.GoCollections.createFrom("My " + t.label.toLowerCase() + " plan", "Made with Plan My Day.",
        lastPlan.stops.map(function (s) { return s.spot.id; }));
    }
    else if (k === "share") {
      var url = location.origin + location.pathname + location.search + "#" + toHash(p);
      if (navigator.share) navigator.share({ title: "My Go Places day plan", url: url }).catch(function () {});
      else if (navigator.clipboard) { navigator.clipboard.writeText(url); el.textContent = "Link copied ✓"; }
    }
    else return;
    e.preventDefault();
  }

  window.GoItinerary = {
    plan: plan,
    matchesInterest: matchesInterest,
    addFilter: function (id, fn) { engine.filters.push({ id: id, fn: fn }); },
    addScorer: function (id, weight, fn) { engine.scorers.push({ id: id, weight: weight, fn: fn }); },
    setTravel: function (fn) { engine.travel = fn || defaultTravel; },
    setWeatherProvider: function (fn) { engine.weather = fn || openMeteo; detected = { weather: null, state: "idle" }; },
    engine: engine
  };

  window.GoPlan = {
    init: function (api) {
      app = api;
      app.sheetBody.addEventListener("click", onClick);
    },
    route: function (hash) {
      if (hash === "plan") { openForm(defaults()); return true; }
      if (hash.indexOf("plan/") === 0) { openResult(fromHash(hash.slice(5))); return true; }
      return false;
    },
    openForm: function (timeId) {
      var p = defaults();
      if (timeId && byId(TIMES, timeId)) p.time = timeId;
      openForm(p);
    },
    rerender: function () {
      if (current === "result" && formPrefs) openResult(formPrefs);
      else if (current === "form") openForm(formPrefs);
    },
    onClose: function () { current = null; if (!keepRoute) clearRoute(); },
    onLocation: function () { if (app && app.isOpen() && current) window.GoPlan.rerender(); }
  };
})();
