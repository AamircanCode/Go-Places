/*
 * GO PLACES — collections
 * =======================
 * Lists of places, like playlists for the city: "Best Sunset Spots",
 * "Rainy Day Munich". Three kinds show up together:
 *
 *   Go Places collections  every theme from data/spots.js, plus the starter
 *                          collections in data/collections.js
 *   your collections       made in the app. Kept in the account (the
 *                          "collections" part of supabase/schema.sql), or on
 *                          this device when signed out
 *   other explorers'       public ones, and followers-only ones of people you
 *                          follow. You can save them to your list
 *
 * Your wishlist shows at the top of your collections as a private list; it
 * stays the wishlist (same button, same privacy setting), nothing is copied.
 *
 * Collection shape (also the database row, in snake_case there):
 *   { id, title, description, coverImage, ownerId, placeIds, visibility, createdAt, city }
 *   visibility: "public" | "followers" | "private"
 *
 * Links: #collections, #collection/<id>, #collection-new
 */
(function () {
  "use strict";

  var ACCT = window.GoAccount || { enabled: false };
  var LAYER = window.GO_PLACES_LAYER || {};
  var DATA = window.GO_PLACES;
  var STORAGE_KEY = "goplaces.collections";
  var MAX_PLACES = 100;
  var VIS = [
    { id: "public", label: "Public", emoji: "🌍", note: "Anyone with the link can see it, and it shows on its places' pages." },
    { id: "followers", label: "Followers only", emoji: "👥", note: "Only people you've accepted as followers can see it." },
    { id: "private", label: "Private", emoji: "🔒", note: "Only you." }
  ];

  var app = null;
  var sb = ACCT.client;
  var check = ACCT.check;
  var local = loadLocal();        // { collections: [], saved: {} } on this device
  var db = { ready: false, mine: [], saved: {} };
  var cache = {};                 // id -> collection loaded from the database
  var names = {};                 // ownerId -> "@username" or display name
  var current = null;             // { fn, arg } of the open screen
  var draft = null;               // the collection being edited

  function cityId() { return (DATA && (DATA.cityId || String(DATA.city || "").toLowerCase())) || "munich"; }
  function esc(s) { return app.esc(s); }
  function has(list, v) { return (list || []).indexOf(v) !== -1; }
  function byId(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function synced() { return !!(ACCT.user && db.ready); }
  function visById(id) { return byId(VIS, id) || VIS[2]; }

  // ---------- device storage ----------
  function loadLocal() {
    try {
      var v = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      return { collections: v.collections || [], saved: v.saved || {} };
    } catch (e) { return { collections: [], saved: {} }; }
  }
  function saveLocal() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(local)); } catch (e) { /* private mode */ }
  }

  // ---------- the database ----------
  function fromRow(r) {
    return {
      id: r.id, title: r.title, description: r.description || "", coverImage: r.cover_image || "",
      ownerId: r.owner_id, placeIds: r.place_ids || [], visibility: r.visibility,
      createdAt: r.created_at, city: r.city, kind: r.owner_id === (ACCT.user && ACCT.user.id) ? "mine" : "user"
    };
  }
  function toRow(c) {
    return {
      title: c.title, description: c.description || "", cover_image: c.coverImage || "",
      place_ids: c.placeIds, visibility: c.visibility, city: c.city || cityId()
    };
  }

  function loadMine() {
    if (!ACCT.user || !sb) { db = { ready: false, mine: [], saved: {} }; return Promise.resolve(); }
    var uid = ACCT.user.id;
    return Promise.all([
      sb.from("collections").select("*").eq("owner_id", uid).order("created_at", { ascending: false }).then(check),
      sb.from("collection_saves").select("collection_id, saved_at").eq("user_id", uid).then(check)
    ]).then(function (r) {
      var saved = {};
      r[1].forEach(function (s) { saved[s.collection_id] = s.saved_at; });
      db = { ready: true, mine: r[0].map(fromRow), saved: saved };
      db.mine.forEach(function (c) { cache[c.id] = c; });
      return importLocal();
    }, function (err) {
      // The collections tables don't exist yet: keep using this device.
      console.info("Collections stay on this device until the collections part of supabase/schema.sql is run.", err && err.message);
      db = { ready: false, mine: [], saved: {} };
    });
  }

  // Collections made before signing in move into the account, as private ones.
  function importLocal() {
    if (!local.collections.length && !Object.keys(local.saved).length) return Promise.resolve();
    var rows = local.collections.map(function (c) {
      var r = toRow(c); r.visibility = "private"; r.created_at = c.createdAt; return r;
    });
    var saves = Object.keys(local.saved).filter(function (id) { return !db.saved[id]; })
      .map(function (id) { return { collection_id: id, saved_at: local.saved[id] }; });
    return Promise.all([
      rows.length ? sb.from("collections").insert(rows).select().then(check) : Promise.resolve([]),
      saves.length ? sb.from("collection_saves").upsert(saves, { ignoreDuplicates: true }).then(check) : Promise.resolve()
    ]).then(function (r) {
      r[0].map(fromRow).forEach(function (c) { db.mine.unshift(c); cache[c.id] = c; });
      saves.forEach(function (s) { db.saved[s.collection_id] = s.saved_at; });
      local = { collections: [], saved: {} };
      saveLocal();
    }).catch(function (err) { console.error("Couldn't move collections into the account", err); });
  }

  function fetchOne(id) {
    if (cache[id]) return Promise.resolve(cache[id]);
    if (!sb || !/^[0-9a-f-]{36}$/.test(id)) return Promise.resolve(null);
    return sb.from("collections").select("*").eq("id", id).maybeSingle().then(check).then(function (r) {
      if (!r) return null;
      var c = fromRow(r);
      cache[id] = c;
      return loadNames([c.ownerId]).then(function () { return c; });
    }).catch(function () { return null; });
  }

  function loadNames(ids) {
    ids = ids.filter(function (id) { return id && !names[id]; });
    if (!ids.length || !sb) return Promise.resolve();
    return sb.rpc("profile_cards", { ids: ids }).then(check).then(function (rows) {
      (rows || []).forEach(function (p) { names[p.id] = p.display_name || ("@" + p.username); });
    }).catch(function () { /* the social part of the schema isn't there yet */ });
  }

  // ---------- all collections ----------
  function themeCollections() {
    return (DATA.themes || []).map(function (t) {
      return {
        id: "theme-" + t.id, title: t.name, description: t.description || "", emoji: t.emoji, coverImage: "",
        placeIds: (DATA.spots || []).filter(function (s) { return has(s.themes, t.id); }).map(function (s) { return s.id; }),
        visibility: "public", kind: "pick", themeId: t.id
      };
    });
  }
  function pickCollections() {
    return (LAYER.collections || []).map(function (c) {
      return {
        id: "pick-" + c.id, title: c.title, description: c.description || "", emoji: c.emoji || "📚",
        coverImage: c.coverImage || "", placeIds: c.placeIds || [], visibility: "public", kind: "pick"
      };
    });
  }
  function goPlaces() { return pickCollections().concat(themeCollections()); }

  function wishlistCollection() {
    if (!ACCT.user) return null;
    return {
      id: "wishlist", title: "Wishlist", emoji: "💚", coverImage: "", kind: "wishlist",
      description: "Places you tapped “Wishlist” on. Who sees it is set in your privacy settings.",
      placeIds: Object.keys(ACCT.wishlist || {}), visibility: "private"
    };
  }

  function mine() {
    var list = synced() ? db.mine : local.collections.map(function (c) { c.kind = "mine"; c.local = true; return c; });
    return list.filter(function (c) { return !c.city || c.city === cityId(); });
  }
  function savedMap() { return synced() ? db.saved : local.saved; }

  function find(id) {
    if (id === "wishlist") return Promise.resolve(wishlistCollection());
    var c = byId(goPlaces(), id) || byId(mine(), id);
    return c ? Promise.resolve(c) : fetchOne(id);
  }

  function places(c) { return (c.placeIds || []).map(app.spotById).filter(Boolean); }

  function cover(c) {
    if (c.coverImage) return c.coverImage;
    var withPhoto = places(c).filter(function (s) { return s.photos && s.photos.length; })[0];
    return withPhoto ? withPhoto.photos[0].url : "";
  }

  function owner(c) {
    if (c.kind === "pick") return "Go Places";
    if (c.kind === "mine" || c.kind === "wishlist") return "you";
    return names[c.ownerId] || "an explorer";
  }

  // ---------- changes ----------
  function newId() { return "local-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function saveCollection(c) {
    c.placeIds = c.placeIds.slice(0, MAX_PLACES);
    if (synced()) {
      var q = c.id && !c.local
        ? sb.from("collections").update(toRow(c)).eq("id", c.id).select().single()
        : sb.from("collections").insert(toRow(c)).select().single();
      return q.then(check).then(function (r) {
        var saved = fromRow(r);
        var i = db.mine.map(function (x) { return x.id; }).indexOf(saved.id);
        if (i === -1) db.mine.unshift(saved); else db.mine[i] = saved;
        cache[saved.id] = saved;
        return saved;
      });
    }
    var list = local.collections;
    if (!c.id) { c.id = newId(); c.createdAt = new Date().toISOString(); c.city = cityId(); c.visibility = "private"; list.unshift(c); }
    else {
      var j = list.map(function (x) { return x.id; }).indexOf(c.id);
      if (j === -1) list.unshift(c); else list[j] = c;
    }
    saveLocal();
    return Promise.resolve(c);
  }

  function deleteCollection(c) {
    if (synced() && !c.local) {
      return sb.from("collections").delete().eq("id", c.id).then(check).then(function () {
        db.mine = db.mine.filter(function (x) { return x.id !== c.id; });
        delete cache[c.id];
      });
    }
    local.collections = local.collections.filter(function (x) { return x.id !== c.id; });
    saveLocal();
    return Promise.resolve();
  }

  function setSaved(id, on) {
    if (synced()) {
      var q = on ? sb.from("collection_saves").upsert({ collection_id: id }, { ignoreDuplicates: true })
        : sb.from("collection_saves").delete().eq("user_id", ACCT.user.id).eq("collection_id", id);
      return q.then(check).then(function () {
        if (on) db.saved[id] = new Date().toISOString(); else delete db.saved[id];
      });
    }
    if (on) local.saved[id] = new Date().toISOString(); else delete local.saved[id];
    saveLocal();
    return Promise.resolve();
  }

  // Adds or removes one place, from the spot page.
  function togglePlace(c, spotId) {
    var copy = Object.assign({}, c, { placeIds: (c.placeIds || []).slice() });
    if (has(copy.placeIds, spotId)) copy.placeIds = copy.placeIds.filter(function (p) { return p !== spotId; });
    else copy.placeIds.push(spotId);
    return saveCollection(copy);
  }

  function fail(err) { alert("Couldn't save that: " + ((err && err.message) || err)); }

  // ---------- pieces ----------
  function show(fn, arg, html, hash) {
    current = { fn: fn, arg: arg };
    app.show(html, hash);
  }

  function back(label, go, id) {
    return '<button class="dz-back" data-c="' + (go || "home") + '"' + (id ? ' data-id="' + esc(id) + '"' : "") + ">← " + esc(label || "Collections") + "</button>";
  }

  function thumb(c) {
    var img = cover(c);
    return '<span class="col-thumb">' + (img ? '<img src="' + esc(img) + '" alt="" loading="lazy">' : esc(c.emoji || "📚")) + "</span>";
  }

  function row(c) {
    var n = places(c).length;
    var vis = c.kind === "mine" ? (c.local ? "📱 this device" : visById(c.visibility).emoji + " " + visById(c.visibility).label)
      : c.kind === "wishlist" ? "💚 your wishlist" : "by " + owner(c);
    return '<button class="col-row" data-c="open" data-id="' + esc(c.id) + '">' + thumb(c) +
      '<span class="col-text"><span class="name">' + esc(c.title) + '</span><span class="sub">' +
      esc(n + (n === 1 ? " place" : " places") + " · " + vis) + "</span></span>" +
      (savedMap()[c.id] ? '<span class="check">💚</span>' : "") + "</button>";
  }

  function signInHint() {
    if (!ACCT.enabled || ACCT.user) return "";
    return '<p class="privacy-note">📱 Your collections are saved on this device. <a href="#" data-c="signin">Sign in</a> to keep them everywhere and share them.</p>';
  }

  // ---------- screens ----------
  function openHome() {
    var my = mine();
    var wish = wishlistCollection();
    var savedIds = Object.keys(savedMap());
    var html =
      '<h2 class="list-title">Collections</h2>' +
      '<p class="list-desc">Lists of places, like playlists for ' + esc(DATA.city) + ". Make your own, or save someone else's.</p>" +
      '<button class="btn primary wide" data-c="new">＋ New collection</button>' +
      signInHint() +
      '<h3 class="dz-h">Your collections</h3>' +
      (wish ? row(wish) : "") +
      (my.length ? my.map(row).join("") : '<p class="empty">Nothing yet. Tap “＋ Collection” on any place, or start one above.</p>') +
      '<div id="col-saved"></div>' +
      '<h3 class="dz-h">From Go Places</h3>' + goPlaces().map(row).join("") +
      '<div id="col-public"></div>';
    show(openHome, null, html, "collections");
    fillSaved(savedIds);
    fillPublic();
  }

  function fillSaved(ids) {
    if (!ids.length) return;
    Promise.all(ids.map(find)).then(function (list) {
      list = list.filter(Boolean);
      var el = document.getElementById("col-saved");
      if (!el || !list.length) return;
      el.innerHTML = '<h3 class="dz-h">Saved</h3>' + list.map(row).join("");
    });
  }

  function fillPublic() {
    if (!sb) return;
    var q = sb.from("collections").select("*").eq("city", cityId()).eq("visibility", "public")
      .order("updated_at", { ascending: false }).limit(20);
    if (ACCT.user) q = q.neq("owner_id", ACCT.user.id);
    q.then(check).then(function (rows) {
      var list = rows.map(fromRow).filter(function (c) { return places(c).length; });
      list.forEach(function (c) { cache[c.id] = c; });
      return loadNames(list.map(function (c) { return c.ownerId; })).then(function () { return list; });
    }).then(function (list) {
      var el = document.getElementById("col-public");
      if (!el || !list.length) return;
      el.innerHTML = '<h3 class="dz-h">From explorers</h3>' + list.map(row).join("");
    }).catch(function () { /* tables not there yet */ });
  }

  function openCollection(id) {
    show(openCollection, id, back() + '<p class="list-desc loading">Loading…</p>', "collection/" + id);
    find(id).then(function (c) {
      if (!current || current.fn !== openCollection || current.arg !== id) return;
      if (!c) {
        show(openCollection, id, back() + '<h2 class="list-title">Collection not found</h2>' +
          '<p class="list-desc">It doesn\'t exist, or it\'s private' + (ACCT.user ? "" : " (try signing in)") + ".</p>", "collection/" + id);
        return;
      }
      var list = places(c);
      var missing = (c.placeIds || []).length - list.length;
      var isMine = c.kind === "mine";
      var saved = !!savedMap()[c.id];
      var img = cover(c);
      var vis = c.kind === "pick" ? "🌍 Public" : c.kind === "wishlist" ? "💚 Wishlist" : c.local ? "📱 Only on this device" : visById(c.visibility).emoji + " " + visById(c.visibility).label;
      show(openCollection, id,
        (img ? '<div class="photo col-cover"><img src="' + esc(img) + '" alt=""></div>' : '<div class="photo col-cover">' + esc(c.emoji || "📚") + "</div>") +
        back() +
        '<h2 class="spot-title">' + esc(c.title) + "</h2>" +
        '<p class="meta">by ' + esc(owner(c)) + " · " + esc(vis) + " · " + list.length + (list.length === 1 ? " place" : " places") + "</p>" +
        (c.description ? '<p class="summary">' + esc(c.description) + "</p>" : "") +
        '<div class="actions">' +
          (isMine ? '<button class="btn" data-c="edit" data-id="' + esc(c.id) + '">Edit</button>' : "") +
          (c.kind === "wishlist" ? '<a class="btn" href="#privacy">🔒 Who sees it</a>' : "") +
          (!isMine && c.kind !== "wishlist" ? '<button class="btn' + (saved ? " wished" : "") + '" data-c="save" data-id="' + esc(c.id) + '">' + (saved ? "💚 Saved" : "♡ Save") + "</button>" : "") +
          (list.length ? '<button class="btn" data-c="map" data-id="' + esc(c.id) + '">Show on map</button>' : "") +
          (c.kind !== "wishlist" ? '<button class="btn" data-c="share" data-id="' + esc(c.id) + '">↗ Share</button>' : "") +
        "</div>" +
        (list.length ? list.map(function (s) {
          return '<button class="list-item" data-spot="' + esc(s.id) + '">' +
            '<span class="emoji">' + esc(s.emoji) + "</span>" +
            '<span><span class="name">' + esc(s.name) + '</span><br><span class="sub">' +
              esc([window.GoMeta ? window.GoMeta.forSpot(s).estimatedDuration : "", s.cost].filter(Boolean).join(" · ")) + "</span></span>" +
            '<span class="check">' + (app.exploredMap()[s.id] ? "✅" : "") + "</span></button>";
        }).join("") : '<p class="empty">No places yet' + (isMine ? ". Open a place and tap “＋ Collection”." : ".") + "</p>") +
        (missing > 0 ? '<p class="seg-note">' + missing + " place" + (missing === 1 ? " is" : "s are") + " in another city.</p>" : ""),
        "collection/" + id);
    });
  }

  // ---------- create and edit ----------
  function openEdit(id) {
    if (id && (!draft || draft.id !== id)) {
      var c = byId(mine(), id);
      if (!c) return openCollection(id);
      draft = Object.assign({}, c, { placeIds: (c.placeIds || []).slice() });
    } else if (!id && (!draft || draft.id)) {
      draft = { id: null, title: "", description: "", coverImage: "", placeIds: [], visibility: "private" };
    }
    var d = draft;
    var list = d.placeIds.map(app.spotById).filter(Boolean);
    var covers = [];
    list.forEach(function (s) { (s.photos || []).forEach(function (p) { if (/^images\//.test(p.url) && !has(covers, p.url)) covers.push(p.url); }); });
    show(openEdit, id,
      back(id ? (d.title || "Collection") : "Collections", id ? "open" : "home", id) +
      '<h2 class="list-title">' + (id ? "✏️ Edit collection" : "＋ New collection") + "</h2>" +
      '<form class="form" id="col-form">' +
        '<label>Title<input name="title" maxlength="80" required value="' + esc(d.title) + '" placeholder="e.g. Best Sunset Spots"></label>' +
        '<label>Description<textarea name="description" maxlength="500" rows="3" placeholder="What ties these places together?">' + esc(d.description) + "</textarea></label>" +
        (synced() ? '<fieldset><legend>Who can see it</legend><div class="seg">' + VIS.map(function (v) {
          return '<label class="seg-opt"><input type="radio" name="visibility" value="' + v.id + '"' + (d.visibility === v.id ? " checked" : "") + "><span>" + esc(v.emoji + " " + v.label) + "</span></label>";
        }).join("") + '</div><p class="seg-note">' + esc(visById(d.visibility).note) + "</p></fieldset>"
          : '<p class="privacy-note">📱 Saved on this device and private.' + (ACCT.enabled ? ' <a href="#" data-c="signin">Sign in</a> to make it public or share it with followers.' : "") + "</p>") +
        (covers.length ? '<fieldset><legend>Cover photo</legend><div class="col-covers">' +
          '<label class="col-cover-opt"><input type="radio" name="cover" value=""' + (!d.coverImage ? " checked" : "") + '><span class="col-thumb">Auto</span></label>' +
          covers.map(function (u) {
            return '<label class="col-cover-opt"><input type="radio" name="cover" value="' + esc(u) + '"' + (d.coverImage === u ? " checked" : "") + '><span class="col-thumb"><img src="' + esc(u) + '" alt="" loading="lazy"></span></label>';
          }).join("") + "</div></fieldset>" : "") +
        '<fieldset><legend>Places (' + list.length + ")</legend>" +
          (list.length ? list.map(function (s, i) {
            return '<div class="col-place"><span class="emoji">' + esc(s.emoji) + '</span><span class="name">' + esc(s.name) + "</span>" +
              (i > 0 ? '<button type="button" class="btn small" data-c="up" data-id="' + esc(s.id) + '" aria-label="Move up">↑</button>' : "") +
              '<button type="button" class="btn small" data-c="remove" data-id="' + esc(s.id) + '" aria-label="Remove">✕</button></div>';
          }).join("") : '<p class="empty">No places yet. Search below, or tap “＋ Collection” on a place.</p>') +
          '<input id="col-search" type="search" placeholder="Add a place: type a name" autocomplete="off">' +
          '<div id="col-results"></div>' +
        "</fieldset>" +
        '<p class="form-msg" id="col-msg"></p>' +
        '<button class="btn primary" type="submit">' + (id ? "Save changes" : "Create collection") + "</button>" +
        (id ? '<button type="button" class="btn" data-c="delete" data-id="' + esc(id) + '">Delete collection</button>' : "") +
      "</form>",
      id ? "collection/" + id + "/edit" : "collection-new");

    var form = document.getElementById("col-form");
    form.addEventListener("input", function (e) {
      readForm(form);
      if (e.target.id === "col-search") searchPlaces(e.target.value);
      if (e.target.name === "visibility") {
        var note = form.querySelector(".seg-note");
        if (note) note.textContent = visById(d.visibility).note;
      }
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      readForm(form);
      if (!d.title.trim()) { document.getElementById("col-msg").textContent = "Give it a title."; return; }
      d.title = d.title.trim();
      d.description = d.description.trim();
      Array.prototype.forEach.call(form.querySelectorAll("button"), function (b) { b.disabled = true; });
      saveCollection(Object.assign({}, d)).then(function (c) {
        draft = null;
        if (pendingSpot) { var s = pendingSpot; pendingSpot = null; app.openSpot(s); toast("Added to “" + c.title + "”"); }
        else openCollection(c.id);
      }, function (err) {
        Array.prototype.forEach.call(form.querySelectorAll("button"), function (b) { b.disabled = false; });
        document.getElementById("col-msg").textContent = (err && err.message) || String(err);
      });
    });
  }

  function readForm(form) {
    if (!draft) return;
    draft.title = form.elements.title.value;
    draft.description = form.elements.description.value;
    var vis = form.querySelector('input[name="visibility"]:checked');
    if (vis) draft.visibility = vis.value;
    var cov = form.querySelector('input[name="cover"]:checked');
    if (cov) draft.coverImage = cov.value;
  }

  function searchPlaces(text) {
    var el = document.getElementById("col-results");
    if (!el) return;
    var q = text.trim().toLowerCase();
    if (q.length < 2) { el.innerHTML = ""; return; }
    var hits = (DATA.spots || []).filter(function (s) {
      return !has(draft.placeIds, s.id) && (s.name.toLowerCase().indexOf(q) !== -1 || (s.address || "").toLowerCase().indexOf(q) !== -1);
    }).slice(0, 8);
    el.innerHTML = hits.length ? hits.map(function (s) {
      return '<button type="button" class="col-place col-add" data-c="add" data-id="' + esc(s.id) + '"><span class="emoji">' + esc(s.emoji) +
        '</span><span class="name">' + esc(s.name) + '</span><span class="btn small">＋</span></button>';
    }).join("") : '<p class="empty">No place with that name.</p>';
  }

  // ---------- the "＋ Collection" picker on a spot page ----------
  var pendingSpot = null;

  // The Save sheet on a spot page: the wishlist first, then your collections.
  function openPicker(spotId) {
    var spot = app.spotById(spotId);
    if (!spot) return openHome();
    var list = mine();
    var wished = ACCT.user && ACCT.wishlist && !!ACCT.wishlist[spotId];
    show(openPicker, spotId,
      '<button class="dz-back" data-c="spot" data-id="' + esc(spotId) + '">← ' + esc(spot.name) + "</button>" +
      '<h2 class="list-title">Save to…</h2>' +
      '<p class="list-desc">Tap a list to add or remove ' + esc(spot.name) + ".</p>" +
      (ACCT.enabled ? '<button class="col-row" data-c="wish" data-id="' + esc(spotId) + '"><span class="col-thumb">💚</span>' +
        '<span class="col-text"><span class="name">Wishlist</span><span class="sub">' + (ACCT.user ? "Places you want to visit" : "Sign in to keep a wishlist") + "</span></span>" +
        '<span class="check">' + (wished ? "✅" : "＋") + "</span></button>" : "") +
      list.map(function (c) {
        var on = has(c.placeIds, spotId);
        return '<button class="col-row" data-c="toggle" data-id="' + esc(c.id) + '" data-spot-id="' + esc(spotId) + '">' + thumb(c) +
          '<span class="col-text"><span class="name">' + esc(c.title) + '</span><span class="sub">' + places(c).length + " places</span></span>" +
          '<span class="check">' + (on ? "✅" : "＋") + "</span></button>";
      }).join("") +
      '<button class="col-row col-new" data-c="new-with" data-id="' + esc(spotId) + '"><span class="col-thumb">＋</span>' +
        '<span class="col-text"><span class="name">New collection</span><span class="sub">Start a list with this place</span></span></button>' +
      signInHint() +
      '<button class="btn primary wide" data-c="spot" data-id="' + esc(spotId) + '">Done</button>',
      "collection-add/" + spotId);
  }

  // Whether a place is in any of your own collections (for the Save button).
  function inAny(spotId) {
    return mine().some(function (c) { return has(c.placeIds, spotId); });
  }

  // ---------- pieces for other screens ----------
  // "Included in collections" on a spot page. Go Places ones right away,
  // explorers' public ones as they load.
  function spotSection(spot) {
    var ours = goPlaces().filter(function (c) { return has(c.placeIds, spot.id); });
    var mineIn = mine().filter(function (c) { return has(c.placeIds, spot.id); });
    return '<div class="spot-section"><h3>Included in collections</h3><div class="col-chips" id="col-included">' +
      chips(mineIn.concat(ours)) + "</div></div>";
  }

  function chips(list) {
    if (!list.length) return '<p class="empty">Not in any collection yet.</p>';
    return list.map(function (c) {
      return '<button class="tag col-chip" data-c="open" data-id="' + esc(c.id) + '">' + esc((c.emoji || "📚") + " " + c.title) + "</button>";
    }).join("");
  }

  function afterSpot(spot) {
    if (!sb) return;
    sb.from("collections").select("*").contains("place_ids", [spot.id]).eq("city", cityId())
      .neq("visibility", "private").order("updated_at", { ascending: false }).limit(12).then(check).then(function (rows) {
        var el = document.getElementById("col-included");
        if (!el || !app.isSpot(spot.id)) return;
        var seen = {};
        var list = mine().filter(function (c) { return has(c.placeIds, spot.id); })
          .concat(goPlaces().filter(function (c) { return has(c.placeIds, spot.id); }))
          .concat(rows.map(fromRow).filter(function (c) { return c.kind !== "mine"; }));
        list = list.filter(function (c) { if (seen[c.id]) return false; seen[c.id] = true; return true; });
        list.forEach(function (c) { if (c.kind === "user") cache[c.id] = c; });
        el.innerHTML = chips(list);
      }).catch(function () { /* tables not there yet */ });
  }

  function profileSection() {
    var my = mine();
    return '<div class="spot-section"><h3>My collections</h3>' +
      (my.length ? my.map(row).join("") : '<p class="empty">Make a list of places, like a playlist for the city.</p>') +
      '<button class="dz-more" data-c="home">All collections →</button></div>';
  }

  // Their collections that you're allowed to see (the database decides).
  function publicProfileSection(profileId) {
    if (!sb || !profileId) return "";
    sb.from("collections").select("*").eq("owner_id", profileId).eq("city", cityId())
      .order("updated_at", { ascending: false }).limit(20).then(check).then(function (rows) {
        var el = document.getElementById("col-theirs");
        if (!el || !rows.length) return;
        var list = rows.map(fromRow);
        list.forEach(function (c) { cache[c.id] = c; });
        return loadNames([profileId]).then(function () {
          el.innerHTML = '<div class="spot-section"><h3>Collections</h3>' + list.map(row).join("") + "</div>";
        });
      }).catch(function () { /* tables not there yet */ });
    return '<div id="col-theirs"></div>';
  }

  function createFrom(title, description, placeIds) {
    draft = { id: null, title: title || "", description: description || "", coverImage: "", placeIds: (placeIds || []).slice(), visibility: "private" };
    openEdit(null);
  }

  function exportData() {
    return {
      collections: mine().map(function (c) {
        return { title: c.title, description: c.description, placeIds: c.placeIds, visibility: c.visibility, city: c.city, createdAt: c.createdAt };
      }),
      savedCollections: savedMap()
    };
  }

  function toast(text) {
    var t = document.createElement("div");
    t.className = "dz-toast show";
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(function () { t.classList.remove("show"); }, 2200);
    setTimeout(function () { t.remove(); }, 2600);
  }

  function shareLink(c) {
    var url = location.origin + location.pathname + location.search + "#collection/" + c.id;
    if (c.local) { alert("This collection is only on this device. Sign in to share it."); return; }
    if (c.kind === "mine" && c.visibility === "private") { alert("This collection is private. Edit it and pick Public or Followers only to share it."); return; }
    if (navigator.share) navigator.share({ title: c.title, text: c.description, url: url }).catch(function () {});
    else if (navigator.clipboard) { navigator.clipboard.writeText(url); toast("Link copied"); }
    else prompt("Copy this link:", url);
  }

  function showOnMap(c) {
    var list = places(c);
    if (!list.length || !window.L) return;
    app.close();
    app.map.fitBounds(L.latLngBounds(list.map(function (s) { return [s.lat, s.lng]; })), { padding: [40, 40], maxZoom: 15 });
  }

  // ---------- clicks ----------
  function onClick(e) {
    var el = e.target.closest("[data-c]");
    if (!el || !app.sheetBody.contains(el)) return;
    var k = el.getAttribute("data-c"), id = el.getAttribute("data-id");
    // data-c buttons also sit on spot and profile pages, which belong to app.js.
    e.preventDefault();
    if (k === "home") openHome();
    else if (k === "open") openCollection(id);
    else if (k === "new") { draft = null; pendingSpot = null; openEdit(null); }
    else if (k === "edit") { draft = null; openEdit(id); }
    else if (k === "pick") openPicker(id);
    else if (k === "spot") app.openSpot(id);
    else if (k === "signin") app.openSignIn();
    else if (k === "new-with") { pendingSpot = id; createFrom("", "", [id]); }
    else if (k === "wish") {
      if (!ACCT.user) { app.openSignIn("Sign in to keep a wishlist of places you want to visit."); return; }
      ACCT.setWished(id, !ACCT.wishlist[id]).catch(fail);
      openPicker(id);
    }
    else if (k === "toggle") {
      var c = byId(mine(), id), spotId = el.getAttribute("data-spot-id");
      if (c) togglePlace(c, spotId).then(function () { openPicker(spotId); }, fail);
    }
    else if (k === "add" || k === "remove" || k === "up") {
      var form = document.getElementById("col-form");
      if (form) readForm(form);
      if (k === "add" && !has(draft.placeIds, id)) draft.placeIds.push(id);
      if (k === "remove") draft.placeIds = draft.placeIds.filter(function (p) { return p !== id; });
      if (k === "up") {
        var i = draft.placeIds.indexOf(id);
        if (i > 0) { draft.placeIds.splice(i, 1); draft.placeIds.splice(i - 1, 0, id); }
      }
      openEdit(draft.id);
      if (k === "add") { var s = document.getElementById("col-search"); if (s) s.focus(); }
    }
    else if (k === "delete") {
      var mineC = byId(mine(), id);
      if (mineC && confirm("Delete “" + mineC.title + "”? The places stay; only the list goes.")) {
        deleteCollection(mineC).then(function () { draft = null; openHome(); }, fail);
      }
    }
    else if (k === "save") {
      var on = !savedMap()[id];
      setSaved(id, on).then(function () { openCollection(id); }, fail);
    }
    else if (k === "share") find(id).then(function (c) { if (c) shareLink(c); });
    else if (k === "map") find(id).then(function (c) { if (c) showOnMap(c); });
  }

  function rerender() {
    if (current && app.isOpen()) current.fn(current.arg);
  }

  // ---------- start ----------
  window.GoCollections = {
    init: function (api) {
      app = api;
      app.sheetBody.addEventListener("click", onClick);
      if (ACCT.on) ACCT.on(function (event) {
        if (event === "signed-in") loadMine().then(rerender);
        else if (event === "signed-out") { db = { ready: false, mine: [], saved: {} }; cache = {}; local = loadLocal(); rerender(); }
        else if (event === "wishlist") rerender();
      });
      // Warn about starter collections that point at places that don't exist.
      (LAYER.collections || []).forEach(function (c) {
        (c.placeIds || []).forEach(function (p) {
          if (!app.spotById(p)) console.warn('Go Places content: collection "' + c.id + '" links to unknown spot "' + p + '"');
        });
      });
    },
    route: function (hash) {
      var parts = hash.split("/");
      if (hash === "collections") openHome();
      else if (hash === "collection-new") { draft = null; pendingSpot = null; openEdit(null); }
      else if (parts[0] === "collection-add" && parts[1]) openPicker(parts[1]);
      else if (parts[0] === "collection" && parts[1] && parts[2] === "edit") { draft = null; openEdit(parts[1]); }
      else if (parts[0] === "collection" && parts[1]) openCollection(parts[1]);
      else return false;
      return true;
    },
    openHome: openHome,
    rerender: rerender,
    onClose: function () { current = null; },
    spotSection: spotSection,
    afterSpot: afterSpot,
    profileSection: profileSection,
    publicProfileSection: publicProfileSection,
    createFrom: createFrom,
    exportData: exportData,
    openPicker: openPicker,
    inAny: inAny
  };
})();
