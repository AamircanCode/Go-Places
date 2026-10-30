/*
 * GO PLACES — social discovery
 * ============================
 * Meeting other explorers without turning Go Places into a popularity
 * contest. There are no follower counts, likes, rankings or leaderboards.
 *
 *   - profile photos, interests and privacy settings
 *   - follow / unfollow (requests for followers-only profiles), with
 *     "People you follow" and "People following you" as plain lists
 *   - Discover explorers (#explorers): people grouped by shared interests,
 *     in random order
 *   - Explorer feed (#feed): what the people you follow explored lately
 *   - place ratings: overall plus optional category scores; only averages
 *     are shown, never who rated what
 *
 * Everything here needs the "social discovery & privacy" part of
 * supabase/schema.sql. Until it has been run, these features stay hidden and
 * the rest of the app works as before. app.js calls `GoSocial.init(api)`.
 */
(function () {
  "use strict";

  var ACCT = window.GoAccount || { enabled: false };
  var CFG = window.GO_PLACES_SOCIAL || { interests: [], groups: [] };
  var LAYER = window.GO_PLACES_LAYER || {};
  var DATA = window.GO_PLACES;
  var AVATAR_BUCKET = "avatars";
  var AVATAR_SIDE = 480;
  var FEED_DAYS = 90;

  var app = null;
  var sb = ACCT.client;
  var check = ACCT.check;
  var current = null;
  var follows = { out: {}, in: {} };  // userId -> "pending" | "accepted"
  var cards = {};                      // userId -> name card
  var avatarUrls = {};                 // storage path -> signed url
  var unavailable = false;             // the social tables don't exist yet

  var VIS = {
    profile: [
      { id: "public", label: "Public", note: "Anyone can see your profile and follow you." },
      { id: "followers", label: "Followers only", note: "People see your name and photo and can ask to follow you. You decide who gets in." },
      { id: "private", label: "Private", note: "Only you. Nobody can find or follow you." }
    ],
    section: [
      { id: "everyone", label: "Everyone" },
      { id: "followers", label: "Followers only" },
      { id: "only_me", label: "Only me" }
    ]
  };
  var SECTIONS = [
    { key: "visits_visibility", what: "visits", label: "✅ Visited places" },
    { key: "wishlist_visibility", what: "wishlist", label: "💚 Wishlist" },
    { key: "feed_visibility", what: "feed", label: "📰 Activity feed" },
    { key: "photos_visibility", what: "photos", label: "📷 Uploaded photos" }
  ];
  var RATINGS = [
    { key: "learning_value", label: "Learning value", emoji: "🧠" },
    { key: "scenic_value", label: "Scenic value", emoji: "🌄" },
    { key: "accessibility", label: "Accessibility", emoji: "♿" },
    { key: "family_friendly", label: "Family friendly", emoji: "👨‍👩‍👧" },
    { key: "uniqueness", label: "Uniqueness", emoji: "🦄" }
  ];

  function esc(s) { return app.esc(s); }
  function me() { return ACCT.user && ACCT.user.id; }
  function byId(list, id) { return (list || []).filter(function (x) { return x.id === id; })[0]; }
  function rows(res) { return check(res) || []; }

  // Social features need accounts and the new database columns.
  function ready() {
    if (!ACCT.enabled || unavailable) return false;
    return !ACCT.profile || "profile_visibility" in ACCT.profile;
  }

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function ago(iso) {
    var mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 60) return mins <= 1 ? "just now" : mins + " min ago";
    var h = Math.round(mins / 60);
    if (h < 24) return h + " h ago";
    var d = Math.round(h / 24);
    if (d < 7) return d === 1 ? "yesterday" : d + " days ago";
    return app.formatDate(iso);
  }

  function interestLabel(id) {
    var i = byId(CFG.interests, id);
    return i ? i.emoji + " " + i.label : id;
  }

  function nameOf(p) { return p.display_name || p.username; }

  // ---------- profile photos ----------
  function avatar(p, cls) {
    var path = p && p.avatar_path;
    var url = path && avatarUrls[path];
    return '<span class="avatar' + (cls ? " " + cls : "") + '" style="--accent:' + esc(p.accent_color || "") + '"' +
      (path ? ' data-avatar="' + esc(path) + '"' : "") + ">" +
      (url ? '<img src="' + esc(url) + '" alt="">' : esc(p.avatar_emoji || "🧭")) + "</span>";
  }

  function loadAvatarUrls(paths) {
    var missing = paths.filter(function (p, i) { return p && !avatarUrls[p] && paths.indexOf(p) === i; });
    if (!missing.length || !sb) return Promise.resolve();
    return sb.storage.from(AVATAR_BUCKET).createSignedUrls(missing, 60 * 60).then(check).then(function (signed) {
      signed.forEach(function (s) { if (s.signedUrl) avatarUrls[s.path] = s.signedUrl; });
    }).catch(function (err) { console.warn("Couldn't load profile photos", err); });
  }

  // Swaps the emoji for the photo in every avatar inside `root`.
  function fillAvatars(root) {
    root = root || document;
    var els = Array.prototype.slice.call(root.querySelectorAll("[data-avatar]"));
    if (!els.length) return;
    loadAvatarUrls(els.map(function (el) { return el.getAttribute("data-avatar"); })).then(function () {
      els.forEach(function (el) {
        var url = avatarUrls[el.getAttribute("data-avatar")];
        if (url && !el.querySelector("img")) el.innerHTML = '<img src="' + esc(url) + '" alt="">';
      });
    });
  }

  function uploadAvatar(file) {
    var old = ACCT.profile.avatar_path;
    var path = me() + "/" + Date.now().toString(36) + ".jpg";
    return ACCT.cleanPhoto(file, AVATAR_SIDE).then(function (clean) {
      return sb.storage.from(AVATAR_BUCKET).upload(path, clean.blob, { contentType: "image/jpeg", upsert: false }).then(check);
    }).then(function () {
      return ACCT.updateProfile({ avatar_path: path }).catch(function (err) {
        sb.storage.from(AVATAR_BUCKET).remove([path]);
        throw err;
      });
    }).then(function () {
      if (old) sb.storage.from(AVATAR_BUCKET).remove([old]);
    });
  }

  function removeAvatar() {
    var old = ACCT.profile.avatar_path;
    return ACCT.updateProfile({ avatar_path: null }).then(function () {
      if (old) return sb.storage.from(AVATAR_BUCKET).remove([old]);
    });
  }

  // ---------- follows ----------
  function loadFollows() {
    if (!me()) { follows = { out: {}, in: {} }; return Promise.resolve(); }
    return sb.from("follows").select("follower_id, followee_id, status").then(check).then(function (list) {
      var f = { out: {}, in: {} };
      list.forEach(function (r) {
        if (r.follower_id === me()) f.out[r.followee_id] = r.status;
        else f.in[r.follower_id] = r.status;
      });
      follows = f;
    });
  }

  function changed() {
    ACCT.emit("follows");
    rerender();
  }

  function follow(id) {
    return sb.from("follows").insert({ follower_id: me(), followee_id: id }).select("status").single().then(check)
      .then(function (r) { follows.out[id] = r.status; changed(); return r.status; });
  }

  function unfollow(id) {
    return sb.from("follows").delete().eq("follower_id", me()).eq("followee_id", id).then(check)
      .then(function () { delete follows.out[id]; changed(); });
  }

  function acceptFollower(id) {
    return sb.from("follows").update({ status: "accepted" }).eq("follower_id", id).eq("followee_id", me()).then(check)
      .then(function () { follows.in[id] = "accepted"; changed(); });
  }

  function removeFollower(id) {
    return sb.from("follows").delete().eq("follower_id", id).eq("followee_id", me()).then(check)
      .then(function () { delete follows.in[id]; changed(); });
  }

  function loadCards(ids) {
    var missing = ids.filter(function (id) { return id && !cards[id]; });
    if (!missing.length) return Promise.resolve(ids.map(function (id) { return cards[id]; }).filter(Boolean));
    return sb.rpc("profile_cards", { ids: missing }).then(check).then(function (list) {
      (list || []).forEach(function (c) { cards[c.id] = c; });
      return ids.map(function (id) { return cards[id]; }).filter(Boolean);
    });
  }

  // The follow button for someone's profile or name card.
  function followButton(p, small) {
    if (!ready() || !p || p.id === me()) return "";
    var status = follows.out[p.id];
    var cls = "btn" + (small ? " small" : "");
    if (status === "accepted") return '<button class="' + cls + ' wished" data-s="unfollow" data-id="' + esc(p.id) + '">✓ Following</button>';
    if (status === "pending") return '<button class="' + cls + '" data-s="unfollow" data-id="' + esc(p.id) + '">⏳ Requested</button>';
    if (p.profile_visibility === "private") return "";
    var ask = p.profile_visibility === "followers";
    return '<button class="' + cls + ' primary" data-s="follow" data-id="' + esc(p.id) + '">' + (ask ? "Ask to follow" : "＋ Follow") + "</button>";
  }

  function personRow(c, extra) {
    return '<div class="place-row person-row">' +
      '<a class="place-open" href="#@' + esc(c.username) + '">' + avatar(c, "small") +
        '<span><span class="name">' + esc(nameOf(c)) + '</span><br><span class="sub">@' + esc(c.username) +
        (extra && extra.sub ? " · " + esc(extra.sub) : "") + "</span></span></a>" +
      (extra && extra.buttons != null ? extra.buttons : followButton(c, true)) +
    "</div>";
  }

  // ---------- ratings ----------
  function stars(n) {
    var full = Math.round(n || 0);
    return '<span class="stars" aria-label="' + (n || 0) + ' out of 5">' + "★★★★★".slice(0, full) + '<i>' + "★★★★★".slice(full) + "</i></span>";
  }

  function ratingSection(spot) {
    if (!ready()) return "";
    return '<div class="spot-section rating-box" id="rating-box" data-spot-id="' + esc(spot.id) + '"><h3>⭐ Ratings</h3>' +
      '<p class="empty">Loading ratings…</p></div>';
  }

  function loadRatings(spotId) {
    var summary = sb.rpc("rating_summary", { spot: spotId }).then(check).then(function (r) { return (r || [])[0] || { ratings: 0 }; });
    var mine = me()
      ? sb.from("place_ratings").select("*").eq("user_id", me()).eq("spot_id", spotId).maybeSingle().then(check)
      : Promise.resolve(null);
    return Promise.all([summary, mine]);
  }

  function afterSpot(spot) {
    var box = document.getElementById("rating-box");
    if (!box) return;
    loadRatings(spot.id).then(function (r) {
      box = document.getElementById("rating-box");
      if (!box || box.getAttribute("data-spot-id") !== spot.id) return;
      var s = r[0], mine = r[1];
      var n = +s.ratings || 0;
      var rowsHtml = RATINGS.filter(function (c) { return s[c.key] != null; }).map(function (c) {
        return '<div class="rating-row"><span>' + esc(c.emoji + " " + c.label) + "</span>" + stars(+s[c.key]) + "<b>" + esc(s[c.key]) + "</b></div>";
      }).join("");
      box.innerHTML = '<h3>⭐ Ratings</h3>' +
        (n ? '<div class="rating-overall"><b>' + esc(s.overall) + "</b>" + stars(+s.overall) +
            '<span class="sub">overall, from ' + n + (n === 1 ? " rating" : " ratings") + "</span></div>" + rowsHtml
          : '<p class="empty">No ratings yet. Be the first to share how it was.</p>') +
        '<div class="actions">' + (ACCT.user
          ? '<button class="btn" data-s="rate" data-id="' + esc(spot.id) + '">' + (mine ? "✏️ Your rating: " + "★".repeat(mine.overall) : "☆ Rate this place") + "</button>"
          : '<button class="btn" data-s="signin-rate">☆ Sign in to rate</button>') + "</div>" +
        '<p class="privacy-note">Ratings are anonymous: only the averages are shown. There are no comments.</p>';
    }).catch(function (err) {
      console.warn("Ratings aren't available yet. Run the latest supabase/schema.sql.", err);
      box.remove();
    });
  }

  function openRate(spotId) {
    var spot = app.spotById(spotId);
    if (!spot) return;
    if (!ACCT.user) { app.openSignIn("Sign in to rate places."); return; }
    show(openRate, spotId, '<p class="list-desc loading">Loading…</p>', "rate/" + spotId);
    loadRatings(spotId).then(function (r) {
      if (!isCurrent(openRate, spotId)) return;
      var mine = r[1] || {};
      var draft = { overall: mine.overall || 0 };
      RATINGS.forEach(function (c) { draft[c.key] = mine[c.key] || 0; });

      function starPicker(key, value) {
        var html = '<div class="star-pick" data-key="' + key + '">';
        for (var i = 1; i <= 5; i++) {
          html += '<button type="button" class="star' + (i <= value ? " on" : "") + '" data-val="' + i + '" aria-label="' + i + ' star' + (i > 1 ? "s" : "") + '">★</button>';
        }
        return html + "</div>";
      }

      function draw() {
        app.sheetBody.querySelector("#rate-body").innerHTML =
          '<div class="rate-main"><b>Overall</b>' + starPicker("overall", draft.overall) + "</div>" +
          '<p class="list-desc">Optional: rate what matters to you. Leave the rest empty.</p>' +
          RATINGS.map(function (c) {
            return '<div class="rate-row"><span>' + esc(c.emoji + " " + c.label) + "</span>" + starPicker(c.key, draft[c.key]) +
              (draft[c.key] ? '<button type="button" class="rate-clear" data-key="' + c.key + '" aria-label="Clear">✕</button>' : '<span class="rate-clear"></span>') + "</div>";
          }).join("");
      }

      show(openRate, spotId,
        '<button class="dz-back" data-s="spot" data-id="' + esc(spotId) + '">← ' + esc(spot.name) + "</button>" +
        '<h2 class="list-title">☆ Rate ' + esc(spot.name) + "</h2>" +
        '<form class="form" id="rate-form"><div id="rate-body"></div>' +
          '<p class="privacy-note">🔒 Your rating is private. Others only see the average.</p>' +
          '<p class="form-msg" role="alert"></p>' +
          '<div class="actions"><button class="btn primary" type="submit">Save rating</button>' +
          (r[1] ? '<button class="btn danger" type="button" id="rate-delete">Remove my rating</button>' : "") + "</div>" +
        "</form>",
        "rate/" + spotId);
      draw();

      var form = document.getElementById("rate-form");
      form.addEventListener("click", function (e) {
        var star = e.target.closest(".star");
        var clear = e.target.closest("button.rate-clear");
        if (star) draft[star.parentNode.getAttribute("data-key")] = +star.getAttribute("data-val");
        else if (clear) draft[clear.getAttribute("data-key")] = 0;
        else return;
        draw();
      });
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var msg = form.querySelector(".form-msg");
        if (!draft.overall) { msg.textContent = "Pick an overall rating first."; return; }
        var row = { user_id: me(), spot_id: spotId, overall: draft.overall, rated_at: new Date().toISOString() };
        RATINGS.forEach(function (c) { row[c.key] = draft[c.key] || null; });
        sb.from("place_ratings").upsert(row).then(check)
          .then(function () { app.openSpot(spotId); }, function (err) { msg.textContent = err.message; });
      });
      var del = document.getElementById("rate-delete");
      if (del) del.addEventListener("click", function () {
        sb.from("place_ratings").delete().eq("user_id", me()).eq("spot_id", spotId).then(check)
          .then(function () { app.openSpot(spotId); }, function (err) { alert(err.message); });
      });
    }).catch(function (err) { showError(err); });
  }

  // ---------- activity feed ----------
  function since(days) { return new Date(Date.now() - days * 864e5).toISOString(); }

  function safe(q) { return q.then(check).catch(function (err) { console.warn(err); return []; }); }

  // Builds feed items from what these people have done lately, but only for
  // people whose feed the viewer may see, and only things the viewer may see.
  function loadFeed(ids, max) {
    return sb.rpc("feed_visible", { ids: ids }).then(check).then(function (visible) {
      visible = (visible || []).map(function (v) { return typeof v === "string" ? v : v.feed_visible; });
      if (!visible.length) return [];
      var from = since(FEED_DAYS);
      return Promise.all([
        safe(sb.from("spot_visits").select("user_id, spot_id, visited_at").in("user_id", visible).order("visited_at", { ascending: true }).limit(3000)),
        safe(sb.from("spot_photos").select("user_id, spot_id, created_at").in("user_id", visible).gte("created_at", from).order("created_at", { ascending: false }).limit(300)),
        safe(sb.from("activity_completions").select("user_id, activity_id, place_id, completed_at").in("user_id", visible).gte("completed_at", from).limit(300)),
        safe(sb.from("user_badges").select("user_id, badge_id, earned_at").in("user_id", visible).gte("earned_at", from).limit(300))
      ]).then(function (r) { return buildFeed(r[0], r[1], r[2], r[3], from).slice(0, max || 60); });
    });
  }

  function themeName(id) {
    var t = DATA.themes.filter(function (x) { return x.id === id; })[0];
    return t ? t.emoji + " " + t.name : null;
  }

  function buildFeed(visits, photos, done, badges, from) {
    var items = [];
    var seenThemes = {};
    visits.forEach(function (v) {
      var spot = app.spotById(v.spot_id);
      if (!spot) return;
      var seen = seenThemes[v.user_id] = seenThemes[v.user_id] || {};
      var fresh = spot.themes.filter(function (t) { return !seen[t]; });
      spot.themes.forEach(function (t) { seen[t] = true; });
      if (v.visited_at < from) return;
      items.push({ who: v.user_id, at: v.visited_at, kind: "visit", spot: spot, categories: fresh.map(themeName).filter(Boolean) });
    });
    var groups = {};
    photos.forEach(function (p) {
      var key = p.user_id + p.spot_id + p.created_at.slice(0, 10);
      if (groups[key]) { groups[key].n++; return; }
      var spot = app.spotById(p.spot_id);
      if (!spot) return;
      groups[key] = { who: p.user_id, at: p.created_at, kind: "photos", spot: spot, n: 1 };
      items.push(groups[key]);
    });
    done.forEach(function (d) {
      var a = byId(LAYER.activities, d.activity_id);
      if (a) items.push({ who: d.user_id, at: d.completed_at, kind: "activity", activity: a, spot: app.spotById(d.place_id) });
    });
    badges.forEach(function (b) {
      var badge = byId(LAYER.badges, b.badge_id);
      if (!badge) return;
      var quest = (LAYER.quests || []).filter(function (q) { return q.rewardBadgeId === b.badge_id; })[0];
      items.push({ who: b.user_id, at: b.earned_at, kind: "badge", badge: badge, quest: quest });
    });
    return items.sort(function (a, b) { return a.at < b.at ? 1 : -1; });
  }

  function spotLink(s) { return '<a href="#' + esc(s.id) + '">' + esc(s.name) + "</a>"; }

  function feedItem(it, showWho) {
    var c = cards[it.who] || (it.who === me() ? ACCT.profile : null) || { username: "explorer", avatar_emoji: "🧭" };
    var who = showWho ? '<a href="#@' + esc(c.username) + '"><b>' + esc(it.who === me() ? "You" : nameOf(c)) + "</b></a> " : "";
    var what, icon;
    if (it.kind === "visit") {
      icon = it.spot.emoji;
      what = "explored " + spotLink(it.spot) +
        (it.categories.length ? '<span class="feed-new">New category: ' + esc(it.categories.join(", ")) + "</span>" : "");
    } else if (it.kind === "photos") {
      icon = "📷";
      what = "added " + (it.n === 1 ? "a photo" : it.n + " photos") + " of " + spotLink(it.spot);
    } else if (it.kind === "activity") {
      icon = it.activity.emoji || "🎯";
      what = 'did <a href="#do/' + esc(it.activity.id) + '">' + esc(it.activity.title) + "</a>" + (it.spot ? " at " + spotLink(it.spot) : "");
    } else {
      icon = it.badge.emoji;
      what = (it.quest ? 'completed the <a href="#quest/' + esc(it.quest.id) + '">' + esc(it.quest.title) + "</a> quest and " : "") +
        "earned the " + esc(it.badge.title) + " badge";
    }
    return '<div class="feed-item">' + (showWho ? avatar(c, "small") : '<span class="feed-icon">' + esc(icon) + "</span>") +
      '<p>' + (showWho ? '<span class="feed-icon-inline">' + esc(icon) + "</span> " : "") + who + what +
      '<span class="sub">' + esc(ago(it.at)) + "</span></p></div>";
  }

  function openFeed() {
    if (!ACCT.user) { app.openSignIn("Sign in to see what the explorers you follow are discovering."); return; }
    show(openFeed, null, back() + '<h2 class="list-title">📰 Explorer feed</h2><p class="list-desc loading">Loading…</p>', "feed");
    var ids;
    loadFollows().then(function () {
      ids = Object.keys(follows.out).filter(function (id) { return follows.out[id] === "accepted"; }).concat([me()]);
      return loadCards(ids);
    }).then(function () { return loadFeed(ids); }).then(function (items) {
      if (!isCurrent(openFeed)) return;
      show(openFeed, null,
        back() +
        '<h2 class="list-title">📰 Explorer feed</h2>' +
        '<p class="list-desc">What you and the explorers you follow discovered in the last ' + FEED_DAYS + " days: places, photos, activities and quests. Nothing to like, nothing to count.</p>" +
        (items.length ? items.map(function (it) { return feedItem(it, true); }).join("")
          : '<p class="empty">Nothing here yet. Follow a few explorers, or go explore something yourself.</p>') +
        '<button class="dz-more" data-s="explorers">Discover explorers →</button>',
        "feed");
    }).catch(showError);
  }

  // ---------- discover explorers ----------
  var explorerCache = null;

  function loadExplorers() {
    if (explorerCache && Date.now() - explorerCache.at < 5 * 60000) return Promise.resolve(explorerCache.list);
    return sb.from("profiles").select("id, username, display_name, avatar_emoji, accent_color, avatar_path, profile_visibility, interests")
      .eq("profile_visibility", "public").limit(200).then(check).then(function (people) {
        people = people.filter(function (p) { return p.id !== me(); });
        people.forEach(function (p) { cards[p.id] = p; });
        var ids = people.map(function (p) { return p.id; });
        if (!ids.length) return [];
        return Promise.all([
          safe(sb.from("spot_visits").select("user_id, spot_id").in("user_id", ids).limit(5000)),
          safe(sb.from("activity_completions").select("user_id, activity_id").in("user_id", ids).limit(5000)),
          safe(sb.from("gem_finds").select("user_id, gem_id").in("user_id", ids).limit(5000))
        ]).then(function (r) {
          var by = {};
          people.forEach(function (p) { by[p.id] = { p: p, spots: [], acts: [], gems: 0 }; });
          r[0].forEach(function (v) { var s = app.spotById(v.spot_id); if (s && by[v.user_id]) by[v.user_id].spots.push(s); });
          r[1].forEach(function (d) { var a = byId(LAYER.activities, d.activity_id); if (a && by[d.user_id]) by[d.user_id].acts.push(a); });
          r[2].forEach(function (g) { if (by[g.user_id]) by[g.user_id].gems++; });
          return people.map(function (p) { return by[p.id]; });
        });
      }).then(function (list) {
        explorerCache = { at: Date.now(), list: list };
        return list;
      });
  }

  // Why someone belongs in a group, or null.
  function groupReason(g, x) {
    var shared = (x.p.interests || []).filter(function (i) { return (g.interests || []).indexOf(i) !== -1; });
    if (shared.length) return "Into " + shared.map(interestLabel).join(", ");
    var n = x.spots.filter(function (s) {
      return s.themes.some(function (t) { return (g.themes || []).indexOf(t) !== -1; }) ||
        (s.knowledge || []).some(function (k) { return (g.knowledge || []).indexOf(k) !== -1; });
    }).length + x.acts.filter(function (a) { return (g.activityCategories || []).indexOf(a.category) !== -1; }).length;
    if (g.gems && x.gems >= g.gems) return "Finds hidden gems";
    return n >= (g.minMatches || 2) ? "Explores places like these" : null;
  }

  function members(g, list) {
    return shuffle(list).map(function (x) { return { x: x, why: groupReason(g, x) }; }).filter(function (m) { return m.why; });
  }

  function openExplorers() {
    if (!ready()) return false;
    show(openExplorers, null, back() + '<h2 class="list-title">👥 Discover explorers</h2><p class="list-desc loading">Loading…</p>', "explorers");
    loadExplorers().then(function (list) {
      if (!isCurrent(openExplorers)) return;
      var html = CFG.groups.map(function (g) {
        var m = members(g, list);
        if (!m.length) return "";
        return '<div class="spot-section"><h3>' + esc(g.emoji + " " + g.title) + '</h3><p class="list-desc">' + esc(g.description) + "</p>" +
          m.slice(0, 4).map(function (y) { return personRow(y.x.p, { sub: y.why }); }).join("") +
          (m.length > 4 ? '<button class="dz-more" data-s="group" data-id="' + esc(g.id) + '">See more ' + esc(g.title.toLowerCase()) + " →</button>" : "") +
          "</div>";
      }).join("");
      show(openExplorers, null,
        back() +
        '<h2 class="list-title">👥 Discover explorers</h2>' +
        '<p class="list-desc">Find people who love the same things you do. Shown in a random order: nobody is ranked here.</p>' +
        (ACCT.user && !(ACCT.profile.interests || []).length ? '<p class="privacy-note">💡 <a href="#" data-s="edit">Add your interests</a> so others with the same ones can find you.</p>' : "") +
        (html || '<p class="empty">No public explorers yet. Make your profile public in Privacy settings to be the first.</p>'),
        "explorers");
      fillAvatars(app.sheetBody);
    }).catch(showError);
    return true;
  }

  function openGroup(id) {
    var g = byId(CFG.groups, id);
    if (!g || !ready()) return openExplorers();
    show(openGroup, id, '<p class="list-desc loading">Loading…</p>', "explorers/" + id);
    loadExplorers().then(function (list) {
      if (!isCurrent(openGroup, id)) return;
      var m = members(g, list);
      show(openGroup, id,
        '<button class="dz-back" data-s="explorers">← Discover explorers</button>' +
        '<h2 class="list-title">' + esc(g.emoji + " " + g.title) + "</h2>" +
        '<p class="list-desc">' + esc(g.description) + " In random order.</p>" +
        (m.length ? m.map(function (y) { return personRow(y.x.p, { sub: y.why }); }).join("") : '<p class="empty">Nobody here yet.</p>'),
        "explorers/" + id);
      fillAvatars(app.sheetBody);
    }).catch(showError);
  }

  // ---------- people you follow / following you ----------
  function openPeople(which) {
    if (!ACCT.user) { app.openSignIn(); return; }
    var title = which === "following" ? "👣 People you follow" : "🤝 People following you";
    show(openPeople, which, '<button class="dz-back" data-s="profile">← Your profile</button><h2 class="list-title">' + title + '</h2><p class="list-desc loading">Loading…</p>', which);
    loadFollows().then(function () {
      var map = which === "following" ? follows.out : follows.in;
      return loadCards(Object.keys(map)).then(function (list) { return { map: map, list: list }; });
    }).then(function (r) {
      if (!isCurrent(openPeople, which)) return;
      var byName = function (a, b) { return nameOf(a).localeCompare(nameOf(b)); };
      var accepted = r.list.filter(function (c) { return r.map[c.id] === "accepted"; }).sort(byName);
      var pending = r.list.filter(function (c) { return r.map[c.id] === "pending"; }).sort(byName);
      var html;
      if (which === "following") {
        html = (accepted.length ? accepted.map(function (c) { return personRow(c); }).join("") : '<p class="empty">You don\'t follow anyone yet.</p>') +
          (pending.length ? '<h3 class="dz-h">⏳ Waiting for an answer</h3>' + pending.map(function (c) { return personRow(c); }).join("") : "");
      } else {
        html = (pending.length ? '<h3 class="dz-h">🙋 Asking to follow you</h3>' + pending.map(function (c) {
            return personRow(c, { buttons: '<span class="row-buttons"><button class="btn small primary" data-s="accept" data-id="' + esc(c.id) + '">Accept</button>' +
              '<button class="btn small" data-s="decline" data-id="' + esc(c.id) + '">Decline</button></span>' });
          }).join("") : "") +
          (accepted.length ? accepted.map(function (c) {
            return personRow(c, { buttons: '<span class="row-buttons">' + followButton(c, true) +
              '<button class="btn small" data-s="remove" data-id="' + esc(c.id) + '" title="Remove this follower">Remove</button></span>' });
          }).join("") : '<p class="empty">Nobody follows you yet.</p>');
      }
      show(openPeople, which,
        '<button class="dz-back" data-s="profile">← Your profile</button>' +
        '<h2 class="list-title">' + title + "</h2>" +
        '<p class="list-desc">' + (which === "following" ? "The explorers whose discoveries show up in your feed." :
          "You can remove anyone from this list. They won't be told.") + " Only you can see this list.</p>" + html +
        '<button class="dz-more" data-s="explorers">Discover explorers →</button>',
        which);
      fillAvatars(app.sheetBody);
    }).catch(showError);
  }

  // ---------- privacy settings ----------
  function radios(name, options, value) {
    return '<div class="seg">' + options.map(function (o) {
      return '<label class="seg-opt"><input type="radio" name="' + name + '" value="' + o.id + '"' + (o.id === value ? " checked" : "") + "><span>" + esc(o.label) + "</span></label>";
    }).join("") + "</div>";
  }

  function openPrivacy() {
    if (!ACCT.user || !ACCT.profile) { app.openSignIn(); return; }
    if (!ready()) return;
    var p = ACCT.profile;
    show(openPrivacy, null,
      '<button class="dz-back" data-s="profile">← Your profile</button>' +
      '<h2 class="list-title">🔒 Privacy</h2>' +
      '<p class="list-desc">You decide who sees your exploring. Your email is never shown to anyone.</p>' +
      '<form class="form" id="privacy-form">' +
        '<fieldset><legend>👤 Profile</legend>' + radios("profile_visibility", VIS.profile, p.profile_visibility) +
          '<p class="seg-note" id="vis-note"></p></fieldset>' +
        SECTIONS.map(function (s) {
          return "<fieldset><legend>" + esc(s.label) + "</legend>" + radios(s.key, VIS.section, p[s.key]) + "</fieldset>";
        }).join("") +
        '<p class="privacy-note">"Followers only" means people you have accepted, or anyone following a public profile. ' +
          "A followers-only or private profile limits everything below it. Badges, quests and done activities follow your profile setting.</p>" +
        '<p class="form-msg" role="alert"></p>' +
        '<div class="actions"><button class="btn primary" type="submit">Save</button><button class="btn" type="button" data-s="profile">Cancel</button></div>' +
      "</form>",
      "privacy");
    var form = document.getElementById("privacy-form");
    function note() {
      var v = form.elements.profile_visibility.value;
      document.getElementById("vis-note").textContent = (byId(VIS.profile, v) || {}).note || "";
    }
    note();
    form.addEventListener("change", note);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = form.elements, fields = { profile_visibility: f.profile_visibility.value };
      SECTIONS.forEach(function (s) { fields[s.key] = f[s.key].value; });
      ACCT.updateProfile(fields).then(function () { explorerCache = null; app.openProfile(); },
        function (err) { form.querySelector(".form-msg").textContent = err.message; });
    });
  }

  // ---------- pieces of the profile screens in app.js ----------
  function privacyLine(p) {
    var v = p.profile_visibility;
    if (v === "public") return '🌍 Public profile · <a href="#" id="copy-profile">copy link</a> · <a href="#privacy">privacy</a>';
    if (v === "followers") return '👥 Followers only · <a href="#" id="copy-profile">copy link</a> · <a href="#privacy">privacy</a>';
    return '🔒 Private profile · only you can see this · <a href="#privacy">privacy</a>';
  }

  function interestChips(list) {
    list = (list || []).filter(function (i) { return byId(CFG.interests, i); });
    if (!list.length) return "";
    return '<div class="tags interests">' + list.map(function (i) { return '<span class="tag">' + esc(interestLabel(i)) + "</span>"; }).join("") + "</div>";
  }

  function ownProfileSection() {
    if (!ready()) return "";
    var asks = Object.keys(follows.in).some(function (id) { return follows.in[id] === "pending"; });
    return interestChips(ACCT.profile.interests) +
      '<div class="actions social-actions">' +
        '<button class="btn" data-s="feed">📰 Feed</button>' +
        '<button class="btn" data-s="explorers">👥 Discover explorers</button>' +
        '<button class="btn" data-s="following">👣 People you follow</button>' +
        '<button class="btn' + (asks ? " wished" : "") + '" data-s="followers">🤝 People following you' + (asks ? " · new requests" : "") + "</button>" +
        '<button class="btn" data-s="privacy">🔒 Privacy</button>' +
      "</div>";
  }

  function canSee(p, setting) {
    if (p.id === me()) return true;
    var v = p[setting];
    if (!v) return true; // older database without the setting
    if (v === "only_me") return false;
    if (v === "followers" || p.profile_visibility === "followers") return follows.out[p.id] === "accepted";
    return true;
  }

  // Shown instead of an empty list when the person keeps that part private.
  function hiddenNote(p, setting, what) {
    if (canSee(p, setting)) return "";
    return '<p class="empty">🔒 ' + esc(nameOf(p)) + " keeps their " + esc(what) + " private.</p>";
  }

  // Interests, follow button, activities, quests and recent exploring for
  // someone else's profile. `r` is what GoAccount.loadPublicProfile returned.
  function publicProfileSection(r) {
    var p = r.profile;
    var doneIds = {};
    Object.keys(r.done || {}).forEach(function (k) { doneIds[k.slice(0, k.indexOf("@"))] = true; });
    var acts = Object.keys(doneIds).map(function (id) { return byId(LAYER.activities, id); }).filter(Boolean);
    var quests = (LAYER.quests || []).filter(function (q) { return q.rewardBadgeId && (r.badges || {})[q.rewardBadgeId]; });
    var followsYou = follows.in[p.id] === "accepted";
    return interestChips(p.interests) +
      (ready() ? '<div class="actions">' + followButton(p) + (followsYou ? '<span class="follows-you">Follows you</span>' : "") + "</div>" : "") +
      (quests.length ? '<div class="spot-section"><h3>🗺️ Quests completed</h3>' + quests.map(function (q) {
        var b = byId(LAYER.badges, q.rewardBadgeId) || {};
        return '<a class="list-item" href="#quest/' + esc(q.id) + '"><span class="emoji">' + esc(b.emoji || "🏅") + '</span><span class="name">' + esc(q.title) + "</span></a>";
      }).join("") + "</div>" : "") +
      (acts.length ? '<div class="spot-section"><h3>🎯 Activities completed</h3>' + acts.map(function (a) {
        return '<a class="list-item" href="#do/' + esc(a.id) + '"><span class="emoji">' + esc(a.emoji || "🎯") + '</span><span class="name">' + esc(a.title) + "</span></a>";
      }).join("") + "</div>" : "") +
      (ready() ? '<div class="spot-section" id="their-feed" hidden><h3>📰 Recently</h3></div>' : "");
  }

  function afterPublicProfile(r) {
    fillAvatars(app.sheetBody);
    var box = document.getElementById("their-feed");
    if (!box) return;
    loadFeed([r.profile.id], 8).then(function (items) {
      box = document.getElementById("their-feed");
      if (!box || !items.length) return;
      box.innerHTML += items.map(function (it) { return feedItem(it, false); }).join("");
      box.hidden = false;
    }).catch(function (err) { console.warn(err); });
  }

  // Followers-only (or private) profile the viewer can't open: name card only.
  function openLocked(username) {
    show(openLocked, username, '<p class="list-desc loading">Loading profile…</p>', "@" + username);
    var q = !ready() ? Promise.resolve([]) : (ACCT.user ? loadFollows().catch(function () {}) : Promise.resolve())
      .then(function () { return sb.rpc("profile_card", { name: username }).then(check); });
    q.then(function (list) {
      if (!isCurrent(openLocked, username)) return;
      var c = (list || [])[0];
      if (!c) {
        show(openLocked, username, '<h2 class="list-title">Profile not found</h2><p class="list-desc">This profile doesn\'t exist or is private.</p>', "@" + username);
        return;
      }
      cards[c.id] = c;
      var status = follows.out[c.id];
      show(openLocked, username,
        '<div class="profile-head">' + avatar(c) + '<div><h2 class="profile-name">' + esc(nameOf(c)) + "</h2>" +
          '<p class="profile-user">@' + esc(c.username) + "</p></div></div>" +
        '<p class="privacy-badge">' + (c.profile_visibility === "private" ? "🔒 This profile is private."
          : status === "pending" ? "⏳ You asked to follow " + esc(nameOf(c)) + ". Once they accept, you'll see their profile here."
          : "👥 " + esc(nameOf(c)) + " shares their profile with followers only.") + "</p>" +
        '<div class="actions">' + (ACCT.user ? followButton(c) : '<button class="btn primary" data-s="signin-follow">Sign in to ask to follow</button>') + "</div>",
        "@" + username);
      fillAvatars(app.sheetBody);
    }).catch(showError);
  }

  // ---------- edit profile ----------
  function editFields(p) {
    var mine = p.interests || [];
    return '<fieldset><legend>Profile photo</legend><div class="avatar-edit">' + avatar(p) +
        '<button class="btn small" type="button" data-s="avatar-pick">📷 ' + (p.avatar_path ? "Change photo" : "Add a photo") + "</button>" +
        (p.avatar_path ? '<button class="btn small" type="button" data-s="avatar-remove">Remove</button>' : "") +
      '</div><p class="seg-note">Without a photo, your avatar emoji is shown. Photos are shrunk and their location data removed before upload.</p></fieldset>' +
      '<fieldset><legend>Interests</legend><div class="tags pick">' + CFG.interests.map(function (i) {
        return '<label class="pill"><input type="checkbox" name="interest" value="' + esc(i.id) + '"' + (mine.indexOf(i.id) !== -1 ? " checked" : "") + "><span>" +
          esc(i.emoji + " " + i.label) + "</span></label>";
      }).join("") + '</div><p class="seg-note">Explorers with the same interests can find you in Discover explorers (if your profile is public).</p></fieldset>' +
      '<p class="privacy-note">🔒 Who sees your profile, places, wishlist, feed and photos: <a href="#privacy">Privacy settings</a></p>';
  }

  function readEditFields(form) {
    var list = [];
    Array.prototype.forEach.call(form.querySelectorAll('input[name="interest"]:checked'), function (el) { list.push(el.value); });
    return { interests: list };
  }

  function pickAvatar() {
    var input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.addEventListener("change", function () {
      if (!input.files || !input.files[0]) return;
      var btn = app.sheetBody.querySelector('[data-s="avatar-pick"]');
      if (btn) { btn.textContent = "Uploading…"; btn.disabled = true; }
      uploadAvatar(input.files[0]).then(function () { app.openEditProfile(); }, function (err) {
        alert("Couldn't upload that photo: " + err.message);
        app.openEditProfile();
      });
    });
    input.click();
  }

  // ---------- your data ----------
  function wrapAccount() {
    var exportData = ACCT.exportData;
    var deleteAccount = ACCT.deleteAccount;
    // the follow lists are added to the download (ratings are fetched on demand)
    ACCT.exportData = function () {
      var d = exportData();
      d.following = Object.keys(follows.out).map(function (id) { return { user: (cards[id] || {}).username || id, status: follows.out[id] }; });
      d.followers = Object.keys(follows.in).map(function (id) { return { user: (cards[id] || {}).username || id, status: follows.in[id] }; });
      d.ratings = myRatings;
      return d;
    };
    ACCT.deleteAccount = function () {
      var path = ACCT.profile && ACCT.profile.avatar_path;
      var first = path ? sb.storage.from(AVATAR_BUCKET).remove([path]).catch(function () {}) : Promise.resolve();
      return first.then(deleteAccount);
    };
  }

  var myRatings = [];
  function loadMyRatings() {
    if (!me()) { myRatings = []; return; }
    safe(sb.from("place_ratings").select("spot_id, overall, learning_value, scenic_value, accessibility, family_friendly, uniqueness, rated_at").eq("user_id", me()))
      .then(function (list) { myRatings = list; });
  }

  // ---------- plumbing ----------
  function back() { return '<button class="dz-back" data-s="profile-or-home">← Back</button>'; }

  function show(fn, arg, html, hash) {
    current = { fn: fn, arg: arg };
    app.show(html, hash);
  }

  function isCurrent(fn, arg) { return !!current && current.fn === fn && (current.arg || null) === (arg || null) && app.isOpen(); }

  function rerender() {
    if (current && app.isOpen()) current.fn(current.arg);
  }

  function showError(err) {
    console.error(err);
    app.show('<h2 class="list-title">Couldn\'t load that</h2><p class="list-desc">' + esc((err && err.message) || "Something went wrong.") + "</p>");
  }

  function act(promise) { promise.catch(function (err) { alert((err && err.message) || "Something went wrong."); }); }

  function onClick(e) {
    var el = e.target.closest("[data-s]");
    if (!el) return;
    var s = el.getAttribute("data-s"), id = el.getAttribute("data-id");
    e.preventDefault();
    if (s === "follow") {
      if (!ACCT.user) { app.openSignIn("Sign in to follow explorers."); return; }
      el.disabled = true;
      act(follow(id).then(function () {
        if (current && current.fn === openLocked) return;
        app.rerender();
      }));
    } else if (s === "unfollow") {
      var c = cards[id] || {};
      var pending = follows.out[id] === "pending";
      if (!confirm(pending ? "Cancel your request?" : "Unfollow " + nameOf(c.username ? c : { username: "this explorer" }) + "?")) return;
      act(unfollow(id).then(function () { app.rerender(); }));
    } else if (s === "accept") act(acceptFollower(id));
    else if (s === "decline") act(removeFollower(id));
    else if (s === "remove") {
      if (confirm("Remove this follower? They won't be told, and they can ask again later.")) act(removeFollower(id));
    }
    else if (s === "feed") openFeed();
    else if (s === "explorers") openExplorers();
    else if (s === "group") openGroup(id);
    else if (s === "following" || s === "followers") openPeople(s);
    else if (s === "privacy") openPrivacy();
    else if (s === "profile") app.openProfile();
    else if (s === "profile-or-home") { if (ACCT.user) app.openProfile(); else app.close(); }
    else if (s === "edit") app.openEditProfile();
    else if (s === "rate") openRate(id);
    else if (s === "spot") app.openSpot(id);
    else if (s === "signin-rate") app.openSignIn("Sign in to rate places.");
    else if (s === "signin-follow") app.openSignIn("Sign in to follow explorers.");
    else if (s === "avatar-pick") pickAvatar();
    else if (s === "avatar-remove") {
      el.disabled = true;
      act(removeAvatar().then(function () { app.openEditProfile(); }));
    }
  }

  function addMapButton() {
    var fab = document.createElement("button");
    fab.className = "fab";
    fab.title = "Discover explorers";
    fab.setAttribute("aria-label", "Discover explorers");
    fab.textContent = "👥";
    fab.addEventListener("click", function () { if (!openExplorers()) fab.remove(); });
    var buttons = document.querySelector(".map-buttons");
    if (buttons) buttons.insertBefore(fab, buttons.lastElementChild);
  }

  window.GoSocial = {
    init: function (api) {
      app = api;
      if (!ACCT.enabled) return;
      app.sheetBody.addEventListener("click", onClick);
      wrapAccount();
      addMapButton();
      ACCT.on(function (event) {
        if (event === "signed-in") {
          if (!ready()) { console.warn("Social features are off until the latest supabase/schema.sql has been run."); return; }
          loadFollows().then(function () { if (app.view() === "profile") app.rerender(); }).catch(function (err) {
            console.warn("Follows aren't available yet. Run the latest supabase/schema.sql.", err);
            unavailable = true;
          });
          loadMyRatings();
        } else if (event === "signed-out") {
          follows = { out: {}, in: {} };
          myRatings = [];
          explorerCache = null;
        } else if (event === "profile") {
          explorerCache = null;
        }
      });
    },
    ready: ready,
    // Fresh follow statuses, e.g. before opening someone's profile.
    refreshFollows: function () {
      return ready() && me() ? loadFollows().catch(function (err) { console.warn(err); }) : Promise.resolve();
    },
    route: function (hash) {
      var parts = hash.split("/");
      if (!ACCT.enabled) return false;
      if (hash === "explorers") openExplorers();
      else if (parts[0] === "explorers" && parts[1]) openGroup(parts[1]);
      else if (hash === "feed") openFeed();
      else if (hash === "privacy") openPrivacy();
      else if (hash === "following" || hash === "followers") openPeople(hash);
      else if (parts[0] === "rate" && parts[1]) openRate(parts[1]);
      else return false;
      return true;
    },
    rerender: rerender,
    onClose: function () { current = null; },
    avatar: avatar,
    fillAvatars: fillAvatars,
    ratingSection: ratingSection,
    afterSpot: afterSpot,
    privacyLine: privacyLine,
    ownProfileSection: ownProfileSection,
    publicProfileSection: publicProfileSection,
    afterPublicProfile: afterPublicProfile,
    hiddenNote: hiddenNote,
    openLocked: openLocked,
    editFields: editFields,
    readEditFields: readEditFields
  };
})();
