/*
 * GO PLACES — suggestions and the review queue
 * ============================================
 * Signed-in explorers can suggest a new place (with an optional photo), or
 * a photo for a place that's already on the map. Suggestions wait in a
 * review queue, and only reviewers can approve or reject them:
 *
 *   approved place   shows on the map for everyone, like any other spot
 *   approved photo   shows on its place's page for everyone
 *
 * Who sent a suggestion is never shown. Photos are shrunk, stripped of their
 * location data and stamped "© Go Places" on the phone, before upload.
 *
 * Needs the "submissions" part of supabase/schema.sql. Until it has been run,
 * none of this shows up. Reviewers are added in the SQL Editor (see the end
 * of that part). They can also approve or reject in Supabase → Table Editor
 * → submissions by changing the status column.
 *
 * Links: #suggest, #review, #suggestions (your own suggestions)
 */
(function () {
  "use strict";

  var ACCT = window.GoAccount || { enabled: false };
  var DATA = window.GO_PLACES;
  var BUCKET = "submissions";
  var SIGNED_URL_SECONDS = 60 * 60 * 6;
  var MAX_SIDE = 1600;
  var EMOJIS = ["📍", "🌳", "🌅", "🏛️", "⛪", "🖼️", "📚", "🦆", "🍺", "☕", "🌊", "⛲", "🗿", "🎨", "🏞️", "🚲", "🛝", "🔭"];

  var app = null;
  var sb = ACCT.client;
  var check = ACCT.check;
  var ready = false;          // the tables exist and the approved items are loaded
  var loaded = null;          // promise of the latest load of your role and suggestions
  var added = {};             // spotId -> true for places added from suggestions
  var addedPhotos = {};       // submission id -> true for photos already on a spot
  var reviewer = false;
  var pendingCount = 0;
  var mine = [];              // your own suggestions, newest first
  var draft = null;           // the place being suggested
  var picker = null;          // the pin picker on the map, while open
  var reviewTab = "pending";

  function cityId() { return (DATA && (DATA.cityId || String(DATA.city || "").toLowerCase())) || "munich"; }
  function esc(s) { return app.esc(s); }
  function errText(err) { return (err && err.message) || "Something went wrong. Please try again."; }
  function signedIn() { return !!(ACCT.user && ACCT.profile); }
  function themeById(id) { return DATA.themes.filter(function (t) { return t.id === id; })[0]; }

  function randomId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  function signUrls(paths) {
    paths = paths.filter(Boolean);
    if (!paths.length) return Promise.resolve({});
    return sb.storage.from(BUCKET).createSignedUrls(paths, SIGNED_URL_SECONDS).then(check).then(function (signed) {
      var byPath = {};
      signed.forEach(function (s) { if (s.signedUrl) byPath[s.path] = s.signedUrl; });
      return byPath;
    });
  }

  // ---------- approved places and photos ----------
  function toSpot(r, url) {
    var themes = (r.themes || []).filter(themeById);
    return {
      id: r.spot_id,
      name: r.name,
      emoji: r.emoji || "📍",
      lat: r.lat, lng: r.lng,
      themes: themes,
      cost: r.cost || "Free",
      when: r.best_time || "",
      summary: r.summary || "",
      tip: r.tip || "",
      funFacts: [],
      photos: url ? [{ url: url }] : [],
      community: true
    };
  }

  function loadApproved() {
    return sb.rpc("approved_submissions", { for_city: cityId() }).then(check).then(function (rows) {
      return signUrls(rows.map(function (r) { return r.photo_path; })).then(function (urls) {
        // places first, so photos for suggested places find their place
        rows.filter(function (r) { return r.kind === "place"; }).forEach(function (r) {
          if (added[r.spot_id] || app.spotById(r.spot_id)) return;
          DATA.spots.push(toSpot(r, urls[r.photo_path]));
          added[r.spot_id] = true;
          addedPhotos[r.id] = true;
        });
        rows.filter(function (r) { return r.kind === "photo"; }).forEach(function (r) {
          var spot = app.spotById(r.spot_id);
          if (!spot || addedPhotos[r.id] || !urls[r.photo_path]) return;
          spot.photos = (spot.photos || []).concat([{ url: urls[r.photo_path], credit: r.caption || "" }]);
          addedPhotos[r.id] = true;
        });
        ready = true;
        app.refreshMap();
      });
    });
  }

  // ---------- your role and your suggestions ----------
  function loadMine() {
    if (!ready || !ACCT.user) { reviewer = false; mine = []; pendingCount = 0; showDot(); return Promise.resolve(); }
    var uid = ACCT.user.id;
    return Promise.all([
      sb.from("reviewers").select("user_id").eq("user_id", uid).maybeSingle().then(check),
      sb.from("submissions").select("*").eq("user_id", uid).order("created_at", { ascending: false }).then(check)
    ]).then(function (r) {
      reviewer = !!r[0];
      mine = r[1];
      return reviewer ? countPending() : 0;
    }).then(function () {
      showDot();
      if (app.view() === "profile") app.rerender();
    }, function (err) {
      console.warn("Couldn't load suggestions", err);
    });
  }

  function countPending() {
    return sb.from("submissions").select("id", { count: "exact", head: true }).eq("status", "pending")
      .then(function (res) {
        if (res.error) throw res.error;
        pendingCount = res.count || 0;
      });
  }

  // A small number on the profile button when suggestions are waiting.
  function showDot() {
    setTimeout(function () {
      var btn = document.getElementById("account-btn");
      if (!btn) return;
      var dot = btn.querySelector(".review-dot");
      if (dot) dot.remove();
      if (reviewer && pendingCount) {
        btn.insertAdjacentHTML("beforeend", '<span class="review-dot" title="' + pendingCount + ' waiting for review">' + pendingCount + "</span>");
      }
      var fab = document.getElementById("suggest-btn");
      if (fab) fab.hidden = !ready;
    }, 0);
  }

  // ---------- suggest a place: the pin ----------
  function startSuggest() {
    if (!ready) return;
    if (!signedIn()) { app.openSignIn("Sign in to suggest a place for the map."); return; }
    if (!draft) draft = { themes: [], emoji: "📍", cost: "Free" };
    openPicker();
  }

  function openPicker() {
    app.close();
    if (picker) return;
    var map = app.map;
    if (draft.lat != null) map.setView([draft.lat, draft.lng], Math.max(map.getZoom(), 16));
    else if (app.me()) map.setView(app.me(), Math.max(map.getZoom(), 16));
    picker = document.createElement("div");
    picker.className = "pin-picker";
    picker.innerHTML =
      '<div class="pin-banner" role="dialog" aria-label="Place the pin">' +
        "<b>Where is it?</b><span>Move the map so the pin sits on the place.</span>" +
        '<div class="actions">' +
          '<button class="btn primary" data-pin="use">Use this spot</button>' +
          (navigator.geolocation ? '<button class="btn" data-pin="me">◎ My location</button>' : "") +
          '<button class="btn" data-pin="cancel">Cancel</button>' +
        "</div>" +
      "</div>" +
      "";
    document.body.appendChild(picker);
    // the pin sits in the middle of the map, where map.getCenter() is
    var cross = document.createElement("div");
    cross.className = "pin-cross";
    cross.setAttribute("aria-hidden", "true");
    cross.textContent = "📍";
    map.getContainer().appendChild(cross);
    picker.cross = cross;
    document.body.classList.add("picking");
    picker.addEventListener("click", function (e) {
      var b = e.target.closest("[data-pin]");
      if (!b) return;
      var what = b.getAttribute("data-pin");
      if (what === "use") {
        var c = map.getCenter();
        draft.lat = +c.lat.toFixed(6);
        draft.lng = +c.lng.toFixed(6);
        closePicker();
        openForm();
      } else if (what === "me") {
        if (app.me()) { map.setView(app.me(), 17); return; }
        navigator.geolocation.getCurrentPosition(function (pos) {
          map.setView([pos.coords.latitude, pos.coords.longitude], 17);
        }, function () { alert("Couldn't get your location. Check that location access is allowed for this site."); },
        { enableHighAccuracy: true, timeout: 10000 });
      } else {
        closePicker();
        if (draft && draft.lat != null) openForm(); else draft = null;
      }
    });
  }

  function closePicker() {
    if (picker) { picker.cross.remove(); picker.remove(); }
    picker = null;
    document.body.classList.remove("picking");
  }

  // ---------- suggest a place: the form ----------
  function emojiChoices(current, name) {
    var list = EMOJIS.indexOf(current) === -1 ? [current].concat(EMOJIS) : EMOJIS;
    return '<div class="choice-row">' + list.map(function (e) {
      return '<label class="choice"><input type="radio" name="' + name + '" value="' + esc(e) + '"' + (e === current ? " checked" : "") +
        "><span>" + esc(e) + "</span></label>";
    }).join("") + "</div>";
  }

  function themeChoices(chosen) {
    return '<div class="pl-pills">' + DATA.themes.map(function (t) {
      return '<label class="pill"><input type="checkbox" name="theme" value="' + esc(t.id) + '"' + (chosen.indexOf(t.id) !== -1 ? " checked" : "") +
        "><span>" + esc(t.emoji + " " + t.name) + "</span></label>";
    }).join("") + "</div>";
  }

  function placeFields(d) {
    return '<label>Name<input name="name" required minlength="2" maxlength="80" value="' + esc(d.name || "") + '" placeholder="e.g. The little duck pond"></label>' +
      "<fieldset><legend>Icon on the map</legend>" + emojiChoices(d.emoji || "📍", "emoji") + "</fieldset>" +
      "<fieldset><legend>Fits these themes (optional)</legend>" + themeChoices(d.themes || []) + "</fieldset>" +
      '<label>What makes it worth a visit?<textarea name="summary" required maxlength="600" rows="3" placeholder="One or two sentences">' + esc(d.summary || "") + "</textarea></label>" +
      '<label>Cost<input name="cost" maxlength="80" value="' + esc(d.cost || "") + '" placeholder="e.g. Free"></label>' +
      '<label>Best time to go (optional)<input name="best_time" maxlength="120" value="' + esc(d.best_time || "") + '" placeholder="e.g. Sunny afternoons"></label>' +
      '<label>Insider tip (optional)<input name="tip" maxlength="300" value="' + esc(d.tip || "") + '"></label>';
  }

  function readPlaceFields(form, into) {
    var f = form.elements;
    into.name = f.name.value.trim();
    into.emoji = (f.emoji.value || "📍");
    into.themes = Array.prototype.filter.call(form.querySelectorAll('input[name="theme"]'), function (i) { return i.checked; })
      .map(function (i) { return i.value; });
    into.summary = f.summary.value.trim();
    into.cost = f.cost.value.trim();
    into.best_time = f.best_time.value.trim();
    into.tip = f.tip.value.trim();
    return into;
  }

  function openForm() {
    if (!signedIn()) { app.openSignIn("Sign in to suggest a place for the map."); return; }
    app.show(
      '<h2 class="list-title">📍 Suggest a place</h2>' +
      '<p class="list-desc">Know a free spot that should be on the map? Tell us about it. It\'s checked before it appears, and your name isn\'t shown with it.</p>' +
      '<form class="form" id="suggest-form">' +
        '<div class="pin-line"><span>📌 Pin at ' + draft.lat.toFixed(5) + ", " + draft.lng.toFixed(5) + "</span>" +
          '<button class="btn small" type="button" id="move-pin">Move pin</button></div>' +
        placeFields(draft) +
        '<label>Photo (optional)<input name="photo" type="file" accept="image/*"></label>' +
        '<div class="upload-preview" id="suggest-preview" hidden></div>' +
        '<p class="privacy-note">🔒 Photos are resized, their hidden location (GPS) and camera data are removed, and they get the “© Go Places” mark before upload.</p>' +
        '<p class="form-msg" role="alert"></p>' +
        '<div class="actions"><button class="btn primary" type="submit">Send for review</button>' +
          '<button class="btn" type="button" id="suggest-cancel">Cancel</button></div>' +
      "</form>",
      "suggest"
    );
    var form = document.getElementById("suggest-form");
    var photoInput = form.elements.photo;
    if (draft.file) showPreview(draft.file);
    photoInput.addEventListener("change", function () {
      draft.file = photoInput.files && photoInput.files[0] || null;
      showPreview(draft.file);
    });
    document.getElementById("move-pin").addEventListener("click", function () {
      readPlaceFields(form, draft);
      openPicker();
    });
    document.getElementById("suggest-cancel").addEventListener("click", function () {
      draft = null;
      app.close();
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      readPlaceFields(form, draft);
      var msg = form.querySelector(".form-msg");
      var btn = form.querySelector('button[type="submit"]');
      msg.textContent = "";
      btn.disabled = true;
      btn.textContent = draft.file ? "Uploading…" : "Sending…";
      sendPlace(draft).then(function () {
        draft = null;
        openThanks("place");
      }, function (err) {
        msg.textContent = errText(err);
        btn.disabled = false;
        btn.textContent = "Send for review";
      });
    });
  }

  function showPreview(file) {
    var box = document.getElementById("suggest-preview");
    if (!box) return;
    if (!file) { box.hidden = true; box.innerHTML = ""; return; }
    box.hidden = false;
    box.innerHTML = '<img alt="Your photo" src="' + URL.createObjectURL(file) + '">';
  }

  // Shrinks, cleans and stamps the photo, then uploads it to your folder.
  function uploadFile(file) {
    if (!file) return Promise.resolve(null);
    if (!/^image\//.test(file.type || "image/")) return Promise.reject(new Error("Please choose a photo."));
    var path = ACCT.user.id + "/" + randomId() + ".jpg";
    return ACCT.cleanPhoto(file, MAX_SIDE, true).then(function (clean) {
      return sb.storage.from(BUCKET).upload(path, clean.blob, { contentType: "image/jpeg", upsert: false }).then(check)
        .then(function () { return { path: path, width: clean.width, height: clean.height }; });
    });
  }

  function insert(row, file) {
    return uploadFile(file).then(function (up) {
      if (up) { row.photo_path = up.path; row.width = up.width; row.height = up.height; }
      return sb.from("submissions").insert(row).select().single().then(check).catch(function (err) {
        if (up) sb.storage.from(BUCKET).remove([up.path]); // don't leave an orphan file behind
        throw err;
      });
    }).then(function (saved) {
      mine.unshift(saved);
      return saved;
    });
  }

  function sendPlace(d) {
    if (!d.name || d.name.length < 2) return Promise.reject(new Error("Please give the place a name."));
    if (!d.summary) return Promise.reject(new Error("Please say what makes it worth a visit."));
    return insert({
      user_id: ACCT.user.id, kind: "place", city: cityId(),
      name: d.name, emoji: d.emoji, lat: d.lat, lng: d.lng, themes: d.themes,
      cost: d.cost || null, best_time: d.best_time || null, summary: d.summary, tip: d.tip || null
    }, d.file);
  }

  // Called from the upload screen on a spot page when "Also suggest it" is ticked.
  function sendPhoto(spot, file, caption) {
    return insert({
      user_id: ACCT.user.id, kind: "photo", city: cityId(), spot_id: spot.id,
      caption: (caption || "").trim().slice(0, 140) || null
    }, file);
  }

  function openThanks(kind) {
    app.show(
      '<h2 class="list-title">Thanks! 🙌</h2>' +
      '<p class="list-desc">Your ' + (kind === "place" ? "place" : "photo") + " is waiting for review. Once it's approved it shows up for everyone. You can follow it under “My suggestions” on your profile.</p>" +
      '<div class="actions"><button class="btn primary" id="thanks-mine">My suggestions</button>' +
        '<button class="btn" id="thanks-close">Back to the map</button></div>',
      ""
    );
    document.getElementById("thanks-mine").addEventListener("click", openMine);
    document.getElementById("thanks-close").addEventListener("click", app.close);
  }

  // ---------- your suggestions ----------
  var STATUS = {
    pending: { label: "Waiting for review", cls: "pending", emoji: "⏳" },
    approved: { label: "Approved", cls: "approved", emoji: "✅" },
    rejected: { label: "Not accepted", cls: "rejected", emoji: "✖️" }
  };

  function title(s) {
    if (s.kind === "place") return (s.emoji || "📍") + " " + s.name;
    var spot = app.spotById(s.spot_id);
    return "📷 Photo of " + (spot ? spot.name : s.spot_id);
  }

  function statusPill(s) {
    var st = STATUS[s.status] || STATUS.pending;
    return '<span class="status-pill ' + st.cls + '">' + st.emoji + " " + st.label + "</span>";
  }

  function openMine() {
    if (!signedIn()) { app.openSignIn("Sign in to see your suggestions."); return; }
    app.show(
      '<h2 class="list-title">📮 My suggestions</h2>' +
      '<p class="list-desc">Places and photos you suggested for the map.</p>' +
      '<div class="actions"><button class="btn primary" data-s="suggest">＋ Suggest a place</button>' +
        (reviewer ? '<button class="btn" data-s="review">🛡️ Review' + (pendingCount ? " (" + pendingCount + ")" : "") + "</button>" : "") + "</div>" +
      (mine.length ? mine.map(function (s) {
        return '<div class="sub-item">' +
          '<div class="sub-head"><b>' + esc(title(s)) + "</b>" + statusPill(s) + "</div>" +
          '<p class="sub">Sent ' + esc(app.formatDate(s.created_at)) + (s.reviewed_at ? " · reviewed " + esc(app.formatDate(s.reviewed_at)) : "") + "</p>" +
          (s.status === "rejected" && s.review_note ? '<p class="sub-note">“' + esc(s.review_note) + "”</p>" : "") +
          '<div class="actions">' +
            (s.status === "approved" ? '<button class="btn small" data-open="' + esc(s.spot_id) + '">Open place</button>' : "") +
            (s.status !== "approved" ? '<button class="btn small" data-withdraw="' + esc(s.id) + '">' + (s.status === "pending" ? "Withdraw" : "Remove") + "</button>" : "") +
          "</div>" +
        "</div>";
      }).join("") : '<p class="empty">Nothing yet. Tap “Suggest a place”, or tick “Also suggest it” when you add a photo to a spot.</p>'),
      "suggestions"
    );
    wireCommon();
    Array.prototype.forEach.call(app.sheetBody.querySelectorAll("[data-withdraw]"), function (b) {
      b.addEventListener("click", function () {
        if (!confirm("Remove this suggestion?")) return;
        b.disabled = true;
        var s = mine.filter(function (x) { return x.id === b.getAttribute("data-withdraw"); })[0];
        withdraw(s).then(openMine, function (err) { b.disabled = false; alert(errText(err)); });
      });
    });
  }

  function withdraw(s) {
    return sb.from("submissions").delete().eq("id", s.id).then(check).then(function () {
      if (s.photo_path) sb.storage.from(BUCKET).remove([s.photo_path]);
      mine = mine.filter(function (x) { return x.id !== s.id; });
    });
  }

  function wireCommon() {
    Array.prototype.forEach.call(app.sheetBody.querySelectorAll("[data-s]"), function (b) {
      b.addEventListener("click", function () {
        var what = b.getAttribute("data-s");
        if (what === "suggest") startSuggest();
        else if (what === "review") openReview();
        else if (what === "mine") openMine();
      });
    });
    Array.prototype.forEach.call(app.sheetBody.querySelectorAll("[data-open]"), function (b) {
      b.addEventListener("click", function () { app.openSpot(b.getAttribute("data-open")); });
    });
  }

  // ---------- review queue (reviewers only) ----------
  function openReview() {
    if (!signedIn()) { app.openSignIn("Sign in with the reviewer account to review suggestions."); return; }
    if (!reviewer) {
      app.show('<h2 class="list-title">🛡️ Review</h2><p class="list-desc">Only reviewers can open the review queue.</p>', "review");
      return;
    }
    app.show('<h2 class="list-title">🛡️ Review suggestions</h2><p class="list-desc loading">Loading…</p>', "review");
    var q = sb.from("submissions").select("*");
    q = reviewTab === "pending"
      ? q.eq("status", "pending").order("created_at", { ascending: true }).limit(100)
      : q.neq("status", "pending").order("reviewed_at", { ascending: false, nullsFirst: false }).limit(40);
    q.then(check).then(function (rows) {
      return signUrls(rows.map(function (r) { return r.photo_path; })).then(function (urls) {
        if (!app.isOpen()) return;
        if (reviewTab === "pending") pendingCount = rows.length;
        showDot();
        renderReview(rows, urls);
      });
    }).catch(function (err) {
      app.show('<h2 class="list-title">🛡️ Review suggestions</h2><p class="list-desc">Couldn\'t load the queue: ' + esc(errText(err)) + "</p>", "review");
    });
  }

  function renderReview(rows, urls) {
    app.show(
      '<h2 class="list-title">🛡️ Review suggestions</h2>' +
      '<p class="list-desc">Nothing here is public until you approve it. Who sent it is never shown to other people.</p>' +
      '<div class="seg review-tabs" role="tablist">' +
        '<button class="btn small' + (reviewTab === "pending" ? " primary" : "") + '" data-tab="pending">Waiting' + (pendingCount ? " (" + pendingCount + ")" : "") + "</button>" +
        '<button class="btn small' + (reviewTab === "decided" ? " primary" : "") + '" data-tab="decided">Recently decided</button>' +
      "</div>" +
      (rows.length ? rows.map(function (r) { return reviewCard(r, urls[r.photo_path]); }).join("")
        : '<p class="empty">' + (reviewTab === "pending" ? "All caught up. 🎉 New suggestions will show up here." : "Nothing decided yet.") + "</p>"),
      "review"
    );
    Array.prototype.forEach.call(app.sheetBody.querySelectorAll("[data-tab]"), function (b) {
      b.addEventListener("click", function () { reviewTab = b.getAttribute("data-tab"); openReview(); });
    });
    rows.forEach(function (r) { wireCard(r); });
  }

  function reviewCard(r, url) {
    var spot = r.kind === "photo" ? app.spotById(r.spot_id) : null;
    var themes = (r.themes || []).map(themeById).filter(Boolean).map(function (t) {
      return '<span class="tag">' + esc(t.emoji + " " + t.name) + "</span>";
    }).join("");
    var body = r.kind === "place"
      ? '<div class="sub-head"><b>' + esc((r.emoji || "📍") + " " + r.name) + '</b><span class="kind">New place</span></div>' +
        (themes ? '<div class="tags">' + themes + "</div>" : "") +
        '<p class="summary">' + esc(r.summary) + "</p>" +
        '<p class="meta"><b>Cost:</b> ' + esc(r.cost || "not given") + "</p>" +
        (r.best_time ? '<p class="meta"><b>When:</b> ' + esc(r.best_time) + "</p>" : "") +
        (r.tip ? '<p class="meta"><b>Tip:</b> ' + esc(r.tip) + "</p>" : "") +
        '<div class="review-map" id="rmap-' + esc(r.id) + '"></div>' +
        '<p class="meta"><a target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=' + r.lat + "," + r.lng + '">Check the pin in Google Maps ↗</a></p>'
      : '<div class="sub-head"><b>📷 ' + esc(spot ? spot.emoji + " " + spot.name : r.spot_id) + '</b><span class="kind">New photo</span></div>' +
        (r.caption ? '<p class="summary">“' + esc(r.caption) + "”</p>" : "");
    var decided = r.status !== "pending";
    return '<div class="sub-item review-card" id="card-' + esc(r.id) + '">' +
      (url ? '<div class="review-photo"><img src="' + esc(url) + '" alt="" loading="lazy"></div>' : "") +
      body +
      '<p class="sub">Sent ' + esc(app.formatDate(r.created_at)) +
        (decided ? " · " + statusPill(r) + (r.review_note ? " “" + esc(r.review_note) + "”" : "") : "") + "</p>" +
      '<div class="actions">' +
        (decided
          ? (r.status === "approved"
            ? (r.kind === "place" ? '<button class="btn small" data-open="' + esc(r.spot_id) + '">Open place</button>' : "") +
              '<button class="btn small danger" data-act="unpublish">Unpublish</button>'
            : '<button class="btn small" data-act="approve">Approve after all</button>')
          : '<button class="btn primary" data-act="approve">✓ Approve</button>' +
            (r.kind === "place" ? '<button class="btn" data-act="edit">✏️ Edit, then approve</button>' : "") +
            '<button class="btn danger" data-act="reject">✕ Reject</button>') +
      "</div>" +
      '<div class="review-edit" hidden></div>' +
    "</div>";
  }

  function wireCard(r) {
    var card = document.getElementById("card-" + r.id);
    if (!card) return;
    if (r.kind === "place") miniMap("rmap-" + r.id, r);
    Array.prototype.forEach.call(card.querySelectorAll("[data-open]"), function (b) {
      b.addEventListener("click", function () { app.openSpot(b.getAttribute("data-open")); });
    });
    card.addEventListener("click", function (e) {
      var b = e.target.closest("[data-act]");
      if (!b) return;
      var act = b.getAttribute("data-act");
      if (act === "approve") decide(r, "approved", {}, b);
      else if (act === "reject" || act === "unpublish") {
        var note = prompt(act === "reject"
          ? "Reject this suggestion?\n\nOptional: a short reason the sender will see (e.g. “Not free”, “Photo is blurry”)."
          : "Unpublish this? It disappears from the map and the place pages.\n\nOptional: a short reason the sender will see.", "");
        if (note == null) return;
        decide(r, "rejected", { review_note: note.trim().slice(0, 300) || null }, b);
      } else if (act === "edit") openEdit(card, r);
    });
  }

  function miniMap(id, r) {
    var el = document.getElementById(id);
    if (!el || !window.L) return;
    var m = L.map(el, { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false,
      doubleClickZoom: false, boxZoom: false, keyboard: false, touchZoom: false }).setView([r.lat, r.lng], 16);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(m);
    L.marker([r.lat, r.lng], {
      icon: L.divIcon({ className: "", html: '<div class="spot-marker">' + esc(r.emoji || "📍") + "</div>", iconSize: [40, 40], iconAnchor: [20, 20] })
    }).addTo(m);
    setTimeout(function () { m.invalidateSize(); }, 300);
  }

  function openEdit(card, r) {
    var box = card.querySelector(".review-edit");
    box.hidden = false;
    box.innerHTML = '<form class="form">' + placeFields(r) +
      '<label>Pin (latitude, longitude)<input name="pin" required value="' + r.lat + ", " + r.lng + '"></label>' +
      '<p class="form-msg" role="alert"></p>' +
      '<div class="actions"><button class="btn primary" type="submit">Save and approve</button>' +
        '<button class="btn" type="button" data-cancel>Cancel</button></div></form>';
    var form = box.querySelector("form");
    form.querySelector("[data-cancel]").addEventListener("click", function () { box.hidden = true; box.innerHTML = ""; });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = readPlaceFields(form, {});
      var pin = form.elements.pin.value.split(",").map(function (x) { return parseFloat(x); });
      var msg = form.querySelector(".form-msg");
      if (pin.length !== 2 || isNaN(pin[0]) || isNaN(pin[1]) || Math.abs(pin[0]) > 90 || Math.abs(pin[1]) > 180) {
        msg.textContent = "The pin should look like 48.13736, 11.57589.";
        return;
      }
      if (f.name.length < 2 || !f.summary) { msg.textContent = "A name and a description are needed."; return; }
      decide(r, "approved", {
        name: f.name, emoji: f.emoji, themes: f.themes, summary: f.summary,
        cost: f.cost || null, best_time: f.best_time || null, tip: f.tip || null, lat: pin[0], lng: pin[1]
      }, form.querySelector('button[type="submit"]'));
    });
  }

  function decide(r, status, fields, btn) {
    var row = { status: status };
    if (status === "approved") row.review_note = null;
    Object.keys(fields).forEach(function (k) { row[k] = fields[k]; });
    if (btn) btn.disabled = true;
    return sb.from("submissions").update(row).eq("id", r.id).select().single().then(check).then(function () {
      if (r.status === "approved" && status !== "approved") unpublish(r);
      // approved ones appear straight away, without a reload
      return status === "approved" ? loadApproved() : null;
    }).then(function () {
      openReview();
    }, function (err) {
      if (btn) btn.disabled = false;
      alert("Couldn't save that: " + errText(err));
    });
  }

  // Takes an unpublished place or photo off this page right away.
  function unpublish(r) {
    if (r.kind === "place") {
      var i = DATA.spots.map(function (s) { return s.id; }).indexOf(r.spot_id);
      if (i !== -1 && added[r.spot_id]) DATA.spots.splice(i, 1);
      delete added[r.spot_id];
    }
    delete addedPhotos[r.id];
    app.refreshMap();
  }

  // ---------- hooks for app.js ----------
  var api = {
    init: function (layer) {
      app = layer;
      if (!ACCT.enabled) return;
      var fab = document.getElementById("suggest-btn");
      if (fab) fab.addEventListener("click", startSuggest);
      var first = loadApproved().catch(function (err) {
        console.warn("Suggestions are off until the \"submissions\" part of supabase/schema.sql has been run.", err);
      });
      loaded = first.then(loadMine);
      ACCT.on(function (event) {
        if (event === "signed-in" || event === "signed-out") loaded = first.then(loadMine);
        else if (event === "profile") showDot();
      });
    },

    ready: function () { return ready; },

    // Spot links to suggested places work before they've loaded.
    route: function (hash) {
      if (!ACCT.enabled) return false;
      if (hash === "suggest") { loaded.then(function () { if (ready) startSuggest(); }); return true; }
      if (hash === "review") { reviewTab = "pending"; loaded.then(openReview); return true; }
      if (hash === "suggestions") { loaded.then(openMine); return true; }
      if (/^c-[0-9a-f]{10}$/.test(hash)) {
        loaded.then(function () { if (app.spotById(hash)) app.openSpot(hash); });
        return true;
      }
      return false;
    },

    rerender: function () {
      if (location.hash === "#review") openReview();
      else if (location.hash === "#suggestions") openMine();
    },

    onClose: function () { /* nothing to tidy */ },

    // The tick box on the "Add photo" screen of a spot.
    uploadOption: function () {
      if (!ready) return "";
      return '<label class="toggle"><input type="checkbox" name="suggest"><span><b>Also suggest it for this place\'s page</b><br>' +
        "After review it can be shown to everyone, with the “© Go Places” mark and without your name.</span></label>";
    },
    suggestPhoto: sendPhoto,
    thanks: openThanks,

    // On your own profile.
    profileSection: function () {
      if (!ready) return "";
      var waiting = mine.filter(function (s) { return s.status === "pending"; }).length;
      return '<div class="spot-section"><h3>📮 Suggestions</h3>' +
        '<p class="list-desc">' + (mine.length
          ? mine.length + (mine.length === 1 ? " suggestion" : " suggestions") + (waiting ? ", " + waiting + " waiting for review" : "") + "."
          : "Suggest a place for the map, or a photo for a place that's already on it.") + "</p>" +
        '<div class="actions"><button class="btn" data-sub="mine">📮 My suggestions</button>' +
          '<button class="btn" data-sub="suggest">＋ Suggest a place</button>' +
          (reviewer ? '<button class="btn primary" data-sub="review">🛡️ Review' + (pendingCount ? " (" + pendingCount + ")" : "") + "</button>" : "") +
        "</div></div>";
    },
    afterProfile: function () {
      Array.prototype.forEach.call(app.sheetBody.querySelectorAll("[data-sub]"), function (b) {
        b.addEventListener("click", function () {
          var what = b.getAttribute("data-sub");
          if (what === "mine") openMine();
          else if (what === "suggest") startSuggest();
          else openReview();
        });
      });
    },

    // A small note on pages of places that came from a suggestion.
    spotNote: function (spot) {
      return spot.community ? '<p class="privacy-note">🌱 Suggested by a Go Places explorer and checked by us.</p>' : "";
    },

    exportData: function () {
      return {
        suggestions: mine.map(function (s) {
          return { kind: s.kind, status: s.status, spot: s.spot_id, name: s.name, summary: s.summary,
            caption: s.caption, sentAt: s.created_at, file: s.photo_path };
        })
      };
    }
  };

  window.GoSubmissions = api;
})();
