/*
 * WANDERLY — meetup rooms
 * ========================
 * Explorers who want to go somewhere with new people open a small, temporary
 * room for a place, a collection or a theme, on a date. Others ask to join,
 * the host lets them in, and members chat to plan the outing. Rooms lock the
 * day after the date and disappear a week later, so there are no dead rooms.
 *
 *   #meetups              upcoming meetups in the city, and yours
 *   #meetup/<id>          one meetup: details, people, requests, chat
 *   #meetup-new/<kind>/<id>   start one for a place or a collection
 *   #meetup/<id>/edit     change it (host)
 *   #meetups-safety       the one-time "18+ and meet-safely tips" step
 *   #meetup-reports       reports, for reviewers
 *
 * Safety rules (who may join or host, size caps, limits, blocking, expiry,
 * who can read the chat) are enforced by the database: see the "meetup
 * rooms" part of supabase/schema.sql. Until it has been run, everything here
 * stays hidden. app.js calls `GoMeetups.init(api)`.
 */
(function () {
  "use strict";

  var ACCT = window.GoAccount || { enabled: false };
  var DATA = window.GO_PLACES;
  var POLL_MS = 15000;          // chat refresh when live updates aren't available
  var MAX_DAYS_AHEAD = 30;
  var SIZES = [2, 3, 4, 5, 6, 8];
  var REASONS = [
    { id: "unsafe", label: "I felt unsafe or was threatened" },
    { id: "harassment", label: "Harassment or hateful messages" },
    { id: "personal_info", label: "Asked for or shared private details" },
    { id: "fake", label: "Fake profile or not who they say" },
    { id: "spam", label: "Spam or selling something" },
    { id: "other", label: "Something else" }
  ];
  // Extras someone can share with one meetup, on top of their meetup card
  // (name, avatar, interests), even when their profile is private.
  var SHARE = [
    { id: "bio", label: "My bio" },
    { id: "badges", label: "My badges" },
    { id: "explored", label: "Places I've explored" },
    { id: "activities", label: "Activities I've done" }
  ];
  var WHY = {
    signed_out: "Sign in to join meetups.",
    email: "Confirm your email address first. Check your inbox for the link we sent when you signed up.",
    suspended: "Your account can't use meetups right now. A Wanderly moderator has paused it.",
    confirm: "One quick step first: confirm you're 18 or older and read the meet-safely tips.",
    new_account: "New accounts can join meetups straight away, and can host their own after 3 days."
  };

  var app = null;
  var sb = ACCT.client;
  var check = ACCT.check;
  var ready = false;            // the tables exist
  var status = null;            // { join_reason, host_reason, hosting_from }
  var reviewer = false;
  var requests = 0;             // people waiting for you to let them in
  var blocked = {};             // userId -> true, people you blocked
  var current = null;
  var chat = null;              // the open chat: { roomId, channel, timer, messages }
  var afterConfirm = null;      // where to go after the safety step

  // ---------- small helpers ----------
  function esc(s) { return app.esc(s); }
  function me() { return ACCT.user && ACCT.user.id; }
  function cityId() { return (DATA && (DATA.cityId || String(DATA.city || "").toLowerCase())) || "munich"; }
  function errText(err) {
    var m = (err && err.message) || "Something went wrong. Please try again.";
    var k = /meetup_not_allowed:(\w+)/.exec(m);
    return k ? (WHY[k[1]] || m) : m;
  }
  function notAllowed(err) { var k = /meetup_not_allowed:(\w+)/.exec((err && err.message) || ""); return k && k[1]; }
  function nameOf(p) { return p.display_name || p.username || "an explorer"; }
  function avatar(p) {
    var card = { avatar_emoji: p.avatar_emoji || p.host_avatar_emoji, accent_color: p.accent_color || p.host_accent_color };
    return window.GoSocial ? window.GoSocial.avatar(card, "small") : '<span class="avatar small">' + esc(card.avatar_emoji || "🧭") + "</span>";
  }
  function today() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function isoDay(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function dayOf(iso) { return new Date(String(iso).slice(0, 10) + "T12:00:00"); }
  function dateLabel(r) {
    var d = dayOf(r.meet_on), t = today();
    var diff = Math.round((d - t) / 86400000);
    var day = diff === 0 ? "Today" : diff === 1 ? "Tomorrow" :
      d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    return day + (r.meet_time ? " · " + String(r.meet_time).slice(0, 5) : "");
  }
  function isPast(r) { return dayOf(r.meet_on) < today(); }
  function stateOf(r) {
    if (r.status === "cancelled") return "cancelled";
    if (r.status === "closed") return "closed";
    if (isPast(r)) return "ended";
    if (r.member_count >= r.max_people) return "full";
    return "open";
  }
  function spotsLine(r) {
    var s = stateOf(r);
    if (s === "cancelled") return "Cancelled";
    if (s === "closed") return "Closed by a moderator";
    if (s === "ended") return "Ended";
    var left = r.max_people - r.member_count;
    return r.member_count + " of " + r.max_people + " going · " + (left ? left + (left === 1 ? " spot" : " spots") + " left" : "full");
  }
  function topicEmoji(r) {
    if (r.topic_kind === "place") { var s = app.spotById(r.topic_id); return (s && s.emoji) || "📍"; }
    return "📚";
  }

  // Phone numbers, emails and street addresses in a message. People are
  // asked before these are sent; nothing is blocked.
  function personalInfo(text) {
    if (/[^\s@]+@[^\s@]+\.[a-z]{2,}/i.test(text)) return "an email address";
    if (/(\+|00)?\d[\d\s\-\/().]{7,}\d/.test(text.replace(/\b\d{1,2}[:.]\d{2}\b/g, ""))) return "a phone number";
    if (/\b[\wäöüß.-]*(straße|strasse|str\.|weg|gasse|allee|ring|damm|ufer)\s*\d+/i.test(text)) return "a street address";
    if (/\b(wa\.me|t\.me|instagram\.com|snapchat|whats\s?app|telegram)\b/i.test(text)) return "a contact outside Wanderly";
    return "";
  }
  function okToSend(text) {
    var what = personalInfo(text);
    if (!what) return true;
    return confirm("This looks like " + what + ".\n\nFor your safety, keep private details out of meetup chats until you've met and feel comfortable. Send anyway?");
  }

  function shareFields(chosen, legend) {
    chosen = chosen || [];
    return '<fieldset><legend>' + esc(legend) + '</legend>' +
      '<p class="seg-note">Everyone in the meetup sees your meetup card: name, avatar and interests. Tick anything else you\'d like this meetup to see. Only this meetup sees it, even if your profile is private. You can change it later.</p>' +
      SHARE.map(function (x) {
        return '<label class="check-row"><input type="checkbox" name="share" value="' + x.id + '"' + (chosen.indexOf(x.id) !== -1 ? " checked" : "") + "> " + esc(x.label) + "</label>";
      }).join("") + "</fieldset>";
  }
  function readShare(form) {
    return Array.prototype.filter.call(form.querySelectorAll('input[name="share"]'), function (i) { return i.checked; }).map(function (i) { return i.value; });
  }
  function shareLabel(list) {
    list = list || [];
    if (!list.length) return "your meetup card only";
    return "your meetup card, " + SHARE.filter(function (x) { return list.indexOf(x.id) !== -1; })
      .map(function (x) { return x.label.replace(/^My /, "").replace("I've", "you've").toLowerCase(); }).join(", ");
  }
  // What a person shared with this meetup, under their name.
  function extrasHtml(x) {
    if (!x) return "";
    var L = window.GO_PLACES_LAYER || {};
    var out = [];
    if (x.bio) out.push('<span class="mp-extra">“' + esc(x.bio) + "”</span>");
    if (x.badges) {
      var names = x.badges.map(function (id) { var b = (L.badges || []).filter(function (y) { return y.id === id; })[0]; return b ? (b.emoji || "🏅") + " " + b.title : ""; }).filter(Boolean);
      out.push('<span class="mp-extra">🏅 ' + (names.length ? esc(names.join(", ")) : "No badges yet") + "</span>");
    }
    if (x.explored) {
      var spots = x.explored.map(app.spotById).filter(Boolean);
      out.push('<span class="mp-extra">✅ ' + x.explored.length + (x.explored.length === 1 ? " place" : " places") + " explored" +
        (spots.length ? ": " + esc(spots.slice(0, 4).map(function (s) { return s.name; }).join(", ")) + (spots.length > 4 ? "…" : "") : "") + "</span>");
    }
    if (x.activities) {
      var acts = x.activities.map(function (id) { return (L.activities || []).filter(function (a) { return a.id === id; })[0]; }).filter(Boolean);
      out.push('<span class="mp-extra">🎯 ' + x.activities.length + (x.activities.length === 1 ? " activity" : " activities") + " done" +
        (acts.length ? ": " + esc(acts.slice(0, 3).map(function (a) { return a.title; }).join(", ")) + (acts.length > 3 ? "…" : "") : "") + "</span>");
    }
    return out.join("");
  }

  function rpc(name, args) { return sb.rpc(name, args || {}).then(check); }

  // ---------- loading ----------
  function loadStatus() {
    if (!ACCT.enabled || !me()) { ready = false; status = null; requests = 0; blocked = {}; showDot(); return Promise.resolve(); }
    return Promise.all([
      rpc("my_meetup_status"),
      rpc("my_room_requests"),
      sb.from("blocks").select("blocked_id").then(check),
      sb.from("reviewers").select("user_id").eq("user_id", me()).maybeSingle().then(check).catch(function () { return null; })
    ]).then(function (r) {
      ready = true;
      status = (r[0] || [])[0] || null;
      requests = r[1] || 0;
      blocked = {};
      (r[2] || []).forEach(function (b) { blocked[b.blocked_id] = true; });
      reviewer = !!r[3];
      showDot();
    }, function (err) {
      ready = false;
      console.warn("Meetups are off until the latest supabase/schema.sql has been run.", err);
    });
  }

  function refreshRequests() {
    if (!ready) return;
    rpc("my_room_requests").then(function (n) { requests = n || 0; showDot(); }).catch(function () {});
  }

  // A small number on the profile button when people are waiting to join.
  function showDot() {
    setTimeout(function () {
      var btn = document.getElementById("account-btn");
      if (!btn) return;
      var dot = btn.querySelector(".meetup-dot");
      if (dot) dot.remove();
      if (ready && requests) {
        btn.insertAdjacentHTML("beforeend", '<span class="review-dot meetup-dot" title="' + requests +
          (requests === 1 ? " person wants" : " people want") + ' to join your meetup">' + requests + "</span>");
      }
    }, 0);
  }

  function list(kind, topic) {
    return rpc("room_list", { for_city: cityId(), p_kind: kind || null, p_topic: topic || null }).then(function (rows) {
      return (rows || []).filter(function (r) { return !blocked[r.host_id]; });
    });
  }

  // ---------- screens: plumbing ----------
  function show(fn, arg, html, hash) {
    if (fn !== openRoom) stopChat();
    current = { fn: fn, arg: arg };
    app.show(html, hash);
  }
  function isCurrent(fn, arg) { return !!current && current.fn === fn && current.arg === arg && app.isOpen(); }
  function back(label, go) { return '<button class="dz-back" data-m="' + (go || "home") + '">← ' + esc(label || "Meetups") + "</button>"; }
  function loading(fn, arg, hash, title) {
    show(fn, arg, back() + (title ? '<h2 class="list-title">' + esc(title) + "</h2>" : "") + '<p class="list-desc loading">Loading…</p>', hash);
  }
  function showError(fn, arg, hash, err) {
    console.error(err);
    show(fn, arg, back() + '<h2 class="list-title">Couldn\'t load that</h2><p class="list-desc">' + esc(errText(err)) + "</p>", hash);
  }
  function needSignIn(msg) {
    if (me()) return false;
    app.openSignIn(msg || "Sign in to meet other explorers.");
    return true;
  }

  // ---------- cards ----------
  function card(r, showTopic) {
    var mine = r.host_id === me();
    var badge = mine ? "You're hosting" : r.my_status === "member" ? "You're going" : r.my_status === "requested" ? "Asked to join" : "";
    var s = stateOf(r);
    return '<button class="list-item meetup-card' + (s !== "open" && s !== "full" ? " is-past" : "") + '" data-m="open" data-id="' + esc(r.id) + '">' +
      '<span class="emoji">' + esc(topicEmoji(r)) + "</span>" +
      '<span class="mc-main"><span class="name">' + esc(r.title) + "</span>" +
        '<span class="sub">' + esc(dateLabel(r)) + (showTopic ? " · " + esc(r.topic_title) : "") + "</span>" +
        '<span class="sub">' + avatar(r) + " " + esc(r.host_display_name || r.host_username) + " · " + esc(spotsLine(r)) + "</span>" +
      "</span>" +
      (badge ? '<span class="mc-badge">' + esc(badge) + "</span>" : "") +
    "</button>";
  }

  // ---------- home ----------
  function openHome() {
    if (needSignIn("Sign in to see meetups and go places with other explorers.")) return;
    if (!ready) { show(openHome, null, '<h2 class="list-title">Meetups</h2><p class="list-desc">Meetups aren\'t switched on yet.</p>', "meetups"); return; }
    loading(openHome, null, "meetups", "Meetups");
    list().then(function (rows) {
      if (!isCurrent(openHome, null)) return;
      var mine = rows.filter(function (r) { return r.my_status === "member" || r.my_status === "requested"; });
      var open = rows.filter(function (r) { return !r.my_status && stateOf(r) === "open"; });
      show(openHome, null,
        '<button class="dz-back" data-m="people">← People &amp; feed</button>' +
        '<h2 class="list-title">🙋 Meetups in ' + esc(DATA.city) + "</h2>" +
        '<p class="list-desc">Go somewhere with explorers you haven\'t met yet. Every meetup is small (up to 8), the host lets each person in, and the chat is only for people who are going.</p>' +
        statusNote(false) +
        '<div class="actions"><button class="btn primary" data-m="new">＋ Start a meetup</button>' +
          '<button class="btn" data-m="safety">🛡️ Meet-safely tips</button></div>' +
        (mine.length ? '<h3 class="set-h">Your meetups</h3>' + mine.map(function (r) { return card(r, true); }).join("") : "") +
        '<h3 class="set-h">Coming up</h3>' +
        (open.length ? open.map(function (r) { return card(r, true); }).join("")
          : '<p class="empty">No open meetups right now. Start one from any place or collection: tap “🙋 Go with others”.</p>') +
        (Object.keys(blocked).length ? '<button class="dz-more" data-m="blocked">People you blocked →</button>' : ""),
        "meetups");
      fill();
    }).catch(function (err) { showError(openHome, null, "meetups", err); });
  }

  // Why you can't join or host yet, with the way to fix it.
  function statusNote(hosting) {
    if (!status) return "";
    var why = hosting ? status.host_reason : status.join_reason;
    if (!why) return "";
    var fix = why === "confirm" ? '<a href="#meetups-safety">Do it now</a>'
      : why === "new_account" && status.hosting_from ? "You can host from " + esc(new Date(status.hosting_from).toLocaleDateString("en-GB", { day: "numeric", month: "long" })) + "." : "";
    return '<div class="tip meetup-note">' + esc(WHY[why] || why) + (fix ? " " + fix : "") + "</div>";
  }

  function fill() { if (window.GoSocial) window.GoSocial.fillAvatars(app.sheetBody); }

  // ---------- the safety step ----------
  function tipsHtml() {
    return '<ul class="meetup-tips">' +
      "<li><b>Meet in a public place</b>, in daylight if you can. Stick to the meeting point, never a home address.</li>" +
      "<li><b>Tell a friend</b> where you're going and who with.</li>" +
      "<li><b>Get there and back on your own</b>. Don't accept a lift from someone you've just met.</li>" +
      "<li><b>Keep private details private</b> (phone, address, social accounts) until you feel comfortable.</li>" +
      "<li><b>Trust your gut</b>. You can leave at any time, without explaining.</li>" +
      "<li><b>Report and block</b> anyone who makes you uncomfortable. Reports go to the Wanderly moderators.</li>" +
      "<li><b>In an emergency, call 112</b>.</li>" +
    "</ul>" +
    '<p class="seg-note">Wanderly can\'t check who people are or guarantee a meetup is safe. Look after yourself and each other.</p>';
  }

  function openSafety() {
    if (needSignIn()) return;
    var done = status && status.join_reason !== "confirm" && ACCT.profile && ACCT.profile.meetups_confirmed_at;
    show(openSafety, null,
      back() +
      '<h2 class="list-title">🛡️ Meeting new people safely</h2>' +
      tipsHtml() +
      (done ? '<p class="list-desc">✅ You\'ve confirmed these.</p>' :
        '<form class="form" id="meetup-confirm">' +
          '<label class="check-row"><input type="checkbox" name="adult" required> I\'m 18 or older</label>' +
          '<label class="check-row"><input type="checkbox" name="tips" required> I\'ve read the tips above and will follow them</label>' +
          '<p class="form-msg" role="alert"></p>' +
          '<button class="btn primary wide" type="submit">Continue</button>' +
        "</form>"),
      "meetups-safety");
    var form = document.getElementById("meetup-confirm");
    if (form) form.addEventListener("submit", function (e) {
      e.preventDefault();
      form.querySelector("button").disabled = true;
      rpc("confirm_meetups").then(loadStatus).then(function () {
        if (ACCT.profile) ACCT.profile.meetups_confirmed_at = new Date().toISOString();
        var next = afterConfirm; afterConfirm = null;
        if (next) next(); else openHome();
      }, function (err) {
        form.querySelector("button").disabled = false;
        form.querySelector(".form-msg").textContent = errText(err);
      });
    });
  }

  // Runs `go` when you may join (or host), or explains what's missing.
  function whenAllowed(hosting, go) {
    if (needSignIn()) return;
    var why = status && (hosting ? status.host_reason : status.join_reason);
    if (!why) { go(); return; }
    if (why === "confirm") { afterConfirm = go; openSafety(); return; }
    show(whenAllowed, null, back() + '<h2 class="list-title">Not yet</h2>' + statusNote(hosting), "meetups");
  }

  // ---------- one room ----------
  function openRoom(id) {
    if (needSignIn("Sign in to see this meetup.")) return;
    if (!ready) return;
    if (!chat || chat.roomId !== id) stopChat();
    var hash = "meetup/" + id;
    if (!isCurrent(openRoom, id)) loading(openRoom, id, hash);
    var shared = {};
    Promise.all([
      rpc("room_list", { for_city: cityId(), p_kind: null, p_topic: null }),
      rpc("room_people", { room: id }),
      rpc("room_shared", { room: id }).catch(function () { return []; }),
      sb.from("room_members").select("shared").eq("room_id", id).eq("user_id", me()).maybeSingle().then(check).catch(function () { return null; })
    ]).then(function (r) {
      (r[2] || []).forEach(function (x) { shared[x.user_id] = x; });
      shared.mine = (r[3] && r[3].shared) || [];
      var room = (r[0] || []).filter(function (x) { return x.id === id; })[0];
      if (room) return [room, r[1]];
      // a room in another city
      return rpc("room_get", { room: id }).then(function (g) {
        var x = (g || [])[0];
        if (!x) return [null, []];
        return [Object.assign({ member_count: (r[1] || []).filter(function (p) { return p.status === "member"; }).length || 1, my_status: null }, x), r[1]];
      });
    }).then(function (r) {
      if (!isCurrent(openRoom, id)) return;
      var room = r[0], people = r[1] || [];
      if (!room) {
        show(openRoom, id, back() + '<h2 class="list-title">Meetup not available</h2>' +
          '<p class="list-desc">It has ended, been cancelled, or isn\'t shared with you.</p>', hash);
        return;
      }
      drawRoom(room, people, shared);
    }).catch(function (err) { showError(openRoom, id, hash, err); });
  }

  function drawRoom(room, people, shared) {
    shared = shared || {};
    var id = room.id;
    var hosting = room.host_id === me();
    var member = room.my_status === "member";
    var s = stateOf(room);
    var live = s === "open" || s === "full";
    var members = people.filter(function (p) { return p.status === "member"; });
    var asks = people.filter(function (p) { return p.status === "requested"; });
    var place = room.topic_kind === "place" ? app.spotById(room.topic_id) : null;
    var directions = place ? "https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=" + place.lat + "," + place.lng : "";
    var topicLink = room.topic_kind === "place" ? "#" + room.topic_id : "#collection/" + room.topic_id;

    var action = "";
    if (hosting) {
      action = live ? '<button class="btn" data-m="edit" data-id="' + esc(id) + '">✏️ Edit</button>' +
        '<button class="btn danger" data-m="cancel" data-id="' + esc(id) + '">Cancel meetup</button>' : "";
    } else if (member) {
      action = '<button class="btn" data-m="leave" data-id="' + esc(id) + '">Leave</button>';
    } else if (room.my_status === "requested") {
      action = '<span class="mc-badge">Waiting for the host</span><button class="btn" data-m="leave" data-id="' + esc(id) + '">Take back request</button>';
    } else if (room.my_status === "declined" || room.my_status === "removed") {
      action = '<p class="empty">This one didn\'t work out. There are other meetups coming up.</p>';
    } else if (s === "open") {
      action = '<button class="btn primary" data-m="ask" data-id="' + esc(id) + '">🙋 Ask to join</button>';
    } else if (s === "full") {
      action = '<p class="empty">This meetup is full.</p>';
    }

    show(openRoom, id,
      back() +
      '<h2 class="spot-title">' + esc(room.title) + "</h2>" +
      '<p class="meta meetup-topic-link"><a href="' + esc(topicLink) + '">' + esc(topicEmoji(room) + " " + room.topic_title) + "</a></p>" +
      '<div class="meetup-facts">' +
        "<div><b>📅</b> " + esc(dateLabel(room)) + "</div>" +
        "<div><b>📍</b> " + esc(room.meeting_point) + (directions ? ' · <a target="_blank" rel="noopener" href="' + esc(directions) + '">Directions</a>' : "") + "</div>" +
        "<div><b>👥</b> " + esc(spotsLine(room)) + (room.audience === "followers" ? " · only the host's followers can see it" : "") + "</div>" +
      "</div>" +
      (room.note ? '<p class="summary">' + esc(room.note) + "</p>" : "") +
      (s === "ended" ? '<div class="tip">This meetup has ended. The chat is read-only and will be deleted ' + esc(deleteDay(room)) + ".</div>" : "") +
      (s === "cancelled" ? '<div class="tip">The host cancelled this meetup.</div>' : "") +
      (s === "closed" ? '<div class="tip">A Wanderly moderator closed this meetup.</div>' : "") +
      (s === "open" && !hosting && !member && !room.my_status ? statusNote(false) : "") +
      '<div class="actions">' + action + "</div>" +
      ((hosting || member || room.my_status === "requested") && live ?
        '<p class="seg-note meetup-sharing">🪪 You share ' + esc(shareLabel(shared.mine)) + ' with this meetup. <button class="linkish" data-m="sharing" data-id="' + esc(id) + '">Change</button></p>' : "") +
      (hosting && asks.length && live ? '<div class="spot-section"><h3>Asking to join <span class="count-dot">' + asks.length + "</span></h3>" +
        asks.map(function (p) { return personRow(room, p, "request", shared[p.user_id]); }).join("") + "</div>" : "") +
      '<div class="spot-section"><h3>' + (hosting || member ? "Who's going" : "Host") + "</h3>" +
        (hosting || member ? members : people.filter(function (p) { return p.is_host; }))
          .map(function (p) { return personRow(room, p, "member", shared[p.user_id]); }).join("") +
        (!hosting && !member ? '<p class="seg-note">You\'ll see who else is going once the host lets you in.</p>' : "") +
      "</div>" +
      (hosting || member ? '<div class="spot-section"><h3>Chat</h3>' +
        '<div class="meetup-safety-card">🛡️ Meet in public, tell a friend where you\'re going, travel on your own, and leave whenever you want. Emergency: 112. <a href="#meetups-safety">All tips</a></div>' +
        '<div class="chat" id="chat"><p class="empty">Loading messages…</p></div>' +
        (s === "open" || s === "full" ?
          '<form class="chat-form" id="chat-form"><textarea name="body" rows="1" maxlength="500" placeholder="Message the group" required></textarea>' +
          '<button class="btn primary" type="submit">Send</button></form>' : "") +
      "</div>" : "") +
      '<div class="meetup-foot">' +
        (!hosting ? '<button class="linkish" data-m="report-room" data-id="' + esc(id) + '" data-host="' + esc(room.host_id) + '">Report this meetup</button>' : "") +
        (!hosting ? '<button class="linkish" data-m="block" data-id="' + esc(room.host_id) + '" data-room="' + esc(id) + '">Block the host</button>' : "") +
      "</div>",
      "meetup/" + id);
    fill();
    if (hosting || member) startChat(room); else stopChat();
  }

  function deleteDay(room) {
    return addDays(dayOf(room.meet_on), 8).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  }

  function personRow(room, p, mode, extras) {
    var hosting = room.host_id === me();
    var self = p.user_id === me();
    var buttons = "";
    if (mode === "request") {
      buttons = '<button class="btn small primary" data-m="accept" data-id="' + esc(p.user_id) + '" data-room="' + esc(room.id) + '">Let in</button>' +
        '<button class="btn small" data-m="decline" data-id="' + esc(p.user_id) + '" data-room="' + esc(room.id) + '">No thanks</button>';
    } else if (!self) {
      buttons = '<button class="btn small" data-m="person-menu" data-id="' + esc(p.user_id) + '" data-room="' + esc(room.id) + '" data-name="' + esc(nameOf(p)) + '"' +
        (hosting && !p.is_host ? ' data-host="1"' : "") + ' aria-label="More">⋯</button>';
    }
    var interests = (p.interests || []).slice(0, 3).map(function (i) {
      var x = ((window.GO_PLACES_SOCIAL || {}).interests || []).filter(function (y) { return y.id === i; })[0];
      return x ? x.emoji + " " + x.label : "";
    }).filter(Boolean).join(" · ");
    return '<div class="person-row meetup-person">' +
      '<a class="mp-who" href="#@' + esc(p.username) + '">' + avatar(p) +
        '<span><span class="name">' + esc(nameOf(p)) + (p.is_host ? ' <span class="mc-badge">Host</span>' : "") + (self ? " (you)" : "") + "</span>" +
        '<span class="sub">@' + esc(p.username) + (interests ? " · " + esc(interests) : "") + "</span>" +
        (p.intro && mode === "request" ? '<span class="mp-intro">“' + esc(p.intro) + "”</span>" : "") +
        (p.user_id !== me() ? extrasHtml(extras) : "") +
      "</span></a>" +
      '<span class="mp-actions">' + buttons + "</span>" +
    "</div>";
  }

  // ---------- chat ----------
  function startChat(room) {
    if (chat && chat.roomId === room.id) { drawChat(); wireChat(room); return; }
    stopChat();
    chat = { roomId: room.id, room: room, messages: [], people: {}, channel: null, timer: null };
    loadMessages().then(function () { drawChat(true); });
    wireChat(room);
    try {
      chat.channel = sb.channel("room-" + room.id)
        .on("postgres_changes", { event: "*", schema: "public", table: "room_messages", filter: "room_id=eq." + room.id }, function () {
          loadMessages().then(function () { drawChat(true); });
        })
        .subscribe();
    } catch (e) { console.warn("Live chat isn't available; refreshing every few seconds instead.", e); }
    chat.timer = setInterval(function () {
      if (!chat || document.hidden) return;
      loadMessages().then(function () { drawChat(false); });
    }, POLL_MS);
  }

  function stopChat() {
    if (!chat) return;
    if (chat.channel) { try { sb.removeChannel(chat.channel); } catch (e) { /* already gone */ } }
    clearInterval(chat.timer);
    chat = null;
  }

  function loadMessages() {
    var c = chat;
    if (!c) return Promise.resolve();
    return Promise.all([
      sb.from("room_messages").select("id, user_id, kind, body, created_at").eq("room_id", c.roomId)
        .order("created_at", { ascending: true }).limit(300).then(check),
      rpc("room_people", { room: c.roomId })
    ]).then(function (r) {
      if (chat !== c) return;
      c.messages = r[0] || [];
      (r[1] || []).forEach(function (p) { c.people[p.user_id] = p; });
    }).catch(function (err) { console.warn("Couldn't load the chat", err); });
  }

  function drawChat(scroll) {
    var box = document.getElementById("chat");
    if (!box || !chat) return;
    var atBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 40;
    var msgs = chat.messages.filter(function (m) { return !blocked[m.user_id]; });
    box.innerHTML = msgs.length ? msgs.map(function (m) {
      if (m.kind === "system") return '<p class="chat-note">' + esc(m.body) + "</p>";
      var p = chat.people[m.user_id] || { username: "explorer" };
      var mine = m.user_id === me();
      return '<div class="chat-msg' + (mine ? " mine" : "") + '">' +
        (mine ? "" : avatar(p)) +
        '<div class="chat-bubble"><span class="chat-who">' + esc(mine ? "You" : nameOf(p)) + " · " +
          esc(new Date(m.created_at).toLocaleString("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit" })) + "</span>" +
          '<span class="chat-text">' + esc(m.body) + "</span>" +
          '<button class="linkish chat-more" data-m="' + (mine ? "delete-msg" : "report-msg") + '" data-id="' + esc(m.id) + '">' + (mine ? "Delete" : "Report") + "</button>" +
        "</div></div>";
    }).join("") : '<p class="empty">No messages yet. Say hi and agree where exactly to meet.</p>';
    if (scroll || atBottom) box.scrollTop = box.scrollHeight;
    fill();
  }

  function wireChat(room) {
    var form = document.getElementById("chat-form");
    if (!form) return;
    var input = form.elements.body;
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event("submit")); }
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text || !okToSend(text)) return;
      var btn = form.querySelector("button");
      btn.disabled = true;
      sb.from("room_messages").insert({ room_id: room.id, body: text }).then(check).then(function () {
        input.value = "";
        btn.disabled = false;
        return loadMessages().then(function () { drawChat(true); });
      }, function (err) {
        btn.disabled = false;
        alert(/row-level security/.test(err.message || "") ? "You can't send messages in this meetup any more." : errText(err));
      });
    });
  }

  // ---------- start or edit ----------
  function topicFor(kind, id) {
    if (kind === "place") {
      var s = app.spotById(id);
      return Promise.resolve(s ? { kind: "place", id: s.id, title: s.name, emoji: s.emoji, place: s } : null);
    }
    var C = window.GoCollections;
    if (!C || !C.find) return Promise.resolve(null);
    return C.find(id).then(function (c) {
      if (!c || !canHaveMeetups(c)) return null;
      return { kind: "collection", id: c.id, title: c.title, emoji: c.emoji || "📚" };
    });
  }

  // Wanderly collections, themes and public collections in an account.
  function canHaveMeetups(c) {
    if (!c) return false;
    if (c.kind === "pick") return true;
    return !c.local && c.visibility === "public" && /^[0-9a-f-]{36}$/.test(c.id);
  }

  function openNew(arg) {
    whenAllowed(true, function () {
      var parts = (arg || "").split("/");
      var p = parts[0] ? topicFor(parts[0], parts[1]) : Promise.resolve(null);
      p.then(function (topic) { drawForm(arg || "", null, topic); });
    });
  }

  function openEdit(id) {
    if (needSignIn()) return;
    rpc("room_get", { room: id }).then(function (g) {
      var r = (g || [])[0];
      if (!r || r.host_id !== me()) { openRoom(id); return; }
      drawForm(id, r, { kind: r.topic_kind, id: r.topic_id, title: r.topic_title, emoji: topicEmoji(r) });
    }).catch(function (err) { showError(openEdit, id, "meetup/" + id + "/edit", err); });
  }

  function placeOptions() {
    return (DATA.spots || []).slice().sort(function (a, b) { return a.name.localeCompare(b.name); }).map(function (s) {
      return '<option value="place/' + esc(s.id) + '">' + esc((s.emoji || "📍") + " " + s.name) + "</option>";
    }).join("");
  }

  function drawForm(arg, room, topic) {
    var editing = !!room;
    var fn = editing ? openEdit : openNew;
    var hash = editing ? "meetup/" + room.id + "/edit" : "meetup-new" + (arg ? "/" + arg : "");
    var min = isoDay(today()), max = isoDay(addDays(today(), MAX_DAYS_AHEAD));
    var d = room || {
      title: topic ? (topic.kind === "place" ? "Let's go to " + topic.title : topic.title + " together") : "",
      note: "", meet_on: isoDay(addDays(today(), 2)), meet_time: "", meeting_point: topic && topic.kind === "place" ? "At " + topic.title : "",
      max_people: 4, audience: "city"
    };
    show(fn, editing ? room.id : arg,
      (editing ? back("Meetup", "open-" + room.id) : back()) +
      '<h2 class="list-title">' + (editing ? "✏️ Edit meetup" : "🙋 Start a meetup") + "</h2>" +
      (editing ? "" : '<p class="list-desc">Pick a day, a public meeting point and how many people. Others in ' + esc(DATA.city) +
        " see it in their feed and on the place's page, and ask to join. You decide who comes.</p>") +
      '<form class="form" id="meetup-form">' +
        (topic ? '<p class="meetup-topic">' + esc((topic.emoji || "📍") + " " + topic.title) + "</p>"
          : '<label>Where to?<select name="topic" required><option value="">Pick a place…</option>' + placeOptions() + "</select>" +
            '<span class="seg-note">To meet for a collection or a theme, open it and tap “🙋 Go with others”.</span></label>') +
        '<label>Title<input name="title" maxlength="80" required value="' + esc(d.title) + '"></label>' +
        '<div class="form-row"><label>Day<input name="meet_on" type="date" required min="' + min + '" max="' + max + '" value="' + esc(d.meet_on) + '"></label>' +
          '<label>Time (optional)<input name="meet_time" type="time" value="' + esc(String(d.meet_time || "").slice(0, 5)) + '"></label></div>' +
        '<label>Meeting point<input name="meeting_point" maxlength="120" required value="' + esc(d.meeting_point) + '" placeholder="e.g. At the main entrance">' +
          '<span class="seg-note">A public spot at or next to the place. Never a home address.</span></label>' +
        '<label>A few words (optional)<textarea name="note" rows="3" maxlength="300" placeholder="e.g. First time here, want to catch the sunset. Slow walkers welcome.">' + esc(d.note) + "</textarea></label>" +
        '<fieldset><legend>How many people, you included?</legend><div class="seg">' + SIZES.map(function (n) {
          return '<label class="seg-opt"><input type="radio" name="max_people" value="' + n + '"' + (n === d.max_people ? " checked" : "") + "><span>" + n + "</span></label>";
        }).join("") + "</div></fieldset>" +
        '<fieldset><legend>Who can see it?</legend><div class="seg">' +
          '<label class="seg-opt"><input type="radio" name="audience" value="city"' + (d.audience !== "followers" ? " checked" : "") + "><span>Explorers in " + esc(DATA.city) + "</span></label>" +
          '<label class="seg-opt"><input type="radio" name="audience" value="followers"' + (d.audience === "followers" ? " checked" : "") + "><span>Only my followers</span></label>" +
        "</div></fieldset>" +
        (editing ? "" : shareFields([], "Share more with people who join? (optional)")) +
        '<p class="privacy-note">🛡️ Only people you let in see who else is going and the chat. The meetup is deleted a week after the day.</p>' +
        '<p class="form-msg" role="alert"></p>' +
        '<div class="actions"><button class="btn primary" type="submit">' + (editing ? "Save" : "Start meetup") + "</button></div>" +
      "</form>",
      hash);
    var form = document.getElementById("meetup-form");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = form.elements, msg = form.querySelector(".form-msg");
      var t = topic;
      if (!t) {
        var v = (f.topic.value || "").split("/");
        var s = app.spotById(v[1]);
        if (!s) { msg.textContent = "Pick a place."; return; }
        t = { kind: "place", id: s.id, title: s.name };
      }
      var fields = {
        p_title: f.title.value.trim(), p_note: f.note.value.trim(), p_meet_on: f.meet_on.value,
        p_meet_time: f.meet_time.value || null, p_meeting_point: f.meeting_point.value.trim(),
        p_max_people: Number(f.max_people.value), p_audience: f.audience.value
      };
      if (fields.p_title.length < 3) { msg.textContent = "Give it a title of at least 3 letters."; return; }
      var info = personalInfo(fields.p_meeting_point + " " + fields.p_note);
      if (info && !confirm("This looks like " + info + ". Meetups are visible to people you haven't met: keep it to a public place. Continue anyway?")) return;
      var btn = form.querySelector("button[type=submit]");
      btn.disabled = true;
      var call = editing ? rpc("update_room", Object.assign({ room: room.id }, fields))
        : rpc("create_room", Object.assign({ p_city: cityId(), p_topic_kind: t.kind, p_topic_id: t.id, p_topic_title: t.title }, fields));
      var share = editing ? [] : readShare(form);
      call.then(function (newId) {
        loadStatus();
        if (!editing && share.length) return rpc("set_room_sharing", { room: newId, p_shared: share }).catch(function () {}).then(function () { openRoom(newId); });
        openRoom(editing ? room.id : newId);
      }, function (err) {
        btn.disabled = false;
        var why = notAllowed(err);
        if (why === "confirm") { afterConfirm = function () { drawForm(arg, room, topic); }; openSafety(); return; }
        msg.textContent = errText(err);
      });
    });
  }

  // ---------- ask to join ----------
  function openAsk(id) {
    whenAllowed(false, function () {
      show(openAsk, id,
        back("Meetup", "open-" + id) +
        '<h2 class="list-title">🙋 Ask to join</h2>' +
        '<p class="list-desc">The host sees your meetup card (name, avatar and interests), this line and anything you tick below. Nothing else from your profile. They decide who comes.</p>' +
        '<form class="form" id="ask-form">' +
          '<label>Say hi (optional)<textarea name="intro" rows="2" maxlength="140" placeholder="e.g. New in Munich, love sunsets and bookshelves."></textarea></label>' +
          shareFields([], "Share more with this meetup? (optional)") +
          '<p class="form-msg" role="alert"></p>' +
          '<div class="actions"><button class="btn primary" type="submit">Send request</button></div>' +
        "</form>", "meetup/" + id + "/ask");
      var form = document.getElementById("ask-form");
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var intro = form.elements.intro.value.trim();
        if (intro && !okToSend(intro)) return;
        form.querySelector("button").disabled = true;
        rpc("request_join", { room: id, p_intro: intro, p_shared: readShare(form) }).then(function () { openRoom(id); }, function (err) {
          form.querySelector("button").disabled = false;
          form.querySelector(".form-msg").textContent = errText(err);
        });
      });
    });
  }

  // ---------- what you share with one meetup ----------
  function openSharing(id) {
    sb.from("room_members").select("shared").eq("room_id", id).eq("user_id", me()).maybeSingle().then(check).then(function (row) {
      if (!row) { openRoom(id); return; }
      show(openSharing, id,
        back("Meetup", "open-" + id) +
        '<h2 class="list-title">🪪 What this meetup sees</h2>' +
        '<form class="form" id="share-form">' + shareFields(row.shared, "Share with this meetup") +
          '<p class="form-msg" role="alert"></p>' +
          '<div class="actions"><button class="btn primary" type="submit">Save</button></div></form>',
        "meetup/" + id + "/sharing");
      var form = document.getElementById("share-form");
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        form.querySelector("button").disabled = true;
        rpc("set_room_sharing", { room: id, p_shared: readShare(form) }).then(function () { openRoom(id); }, function (err) {
          form.querySelector("button").disabled = false;
          form.querySelector(".form-msg").textContent = errText(err);
        });
      });
    }).catch(function (err) { showError(openSharing, id, "meetup/" + id + "/sharing", err); });
  }

  // ---------- report and block ----------
  // `blockId`: the person "Also block" would block.
  function openReport(kind, target, roomId, name, blockId) {
    var label = kind === "room" ? "this meetup" : kind === "message" ? "this message" : name || "this person";
    var key = kind + ":" + target;
    show(openReport, key,
      back("Back", roomId ? "open-" + roomId : "home") +
      '<h2 class="list-title">Report ' + esc(label) + "</h2>" +
      '<p class="list-desc">Reports go to the Wanderly moderators, who can close meetups and stop accounts from using them. The person isn\'t told who reported them. <b>If you\'re in danger, call 112.</b></p>' +
      '<form class="form" id="report-form">' +
        '<fieldset><legend>What happened?</legend>' + REASONS.map(function (r, i) {
          return '<label class="check-row"><input type="radio" name="reason" value="' + r.id + '"' + (i === 0 ? " required" : "") + "> " + esc(r.label) + "</label>";
        }).join("") + "</fieldset>" +
        '<label>Anything else? (optional)<textarea name="details" rows="3" maxlength="500"></textarea></label>' +
        (blockId ? '<label class="check-row"><input type="checkbox" name="block"' + (kind === "room" ? "" : " checked") + "> Also block " +
          esc(kind === "room" ? "the host" : name || "them") + "</label>" : "") +
        '<p class="form-msg" role="alert"></p>' +
        '<div class="actions"><button class="btn primary" type="submit">Send report</button></div>' +
      "</form>", "meetups");
    var form = document.getElementById("report-form");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = form.elements;
      if (!f.reason.value) { form.querySelector(".form-msg").textContent = "Pick what happened."; return; }
      form.querySelector("button").disabled = true;
      var args = { p_kind: kind, p_room: kind === "room" ? target : roomId || null, p_person: kind === "person" ? target : null,
        p_message: kind === "message" ? target : null, p_reason: f.reason.value, p_details: f.details.value.trim() };
      rpc("report_room_thing", args).then(function () {
        return f.block && f.block.checked ? block(blockId) : null;
      }).then(function () {
        show(openReport, key, back("Back", roomId ? "open-" + roomId : "home") +
          '<h2 class="list-title">Thanks for telling us</h2>' +
          '<p class="list-desc">A moderator will look at it. You can leave any meetup at any time, and block anyone.</p>', "meetups");
      }, function (err) {
        form.querySelector("button").disabled = false;
        form.querySelector(".form-msg").textContent = errText(err);
      });
    });
  }

  function block(id) {
    return sb.from("blocks").insert({ blocked_id: id }).then(function (res) {
      if (res.error && !/duplicate/.test(res.error.message)) throw res.error;
      blocked[id] = true;
    });
  }

  function openBlocked() {
    var ids = Object.keys(blocked);
    show(openBlocked, null, back() + '<h2 class="list-title">People you blocked</h2><p class="list-desc loading">Loading…</p>', "meetups");
    (ids.length ? rpc("profile_cards", { ids: ids }) : Promise.resolve([])).then(function (cards) {
      var known = {};
      (cards || []).forEach(function (c) { known[c.id] = c; });
      show(openBlocked, null, back() +
        '<h2 class="list-title">People you blocked</h2>' +
        '<p class="list-desc">You don\'t see each other\'s meetups, and they can\'t join yours. They aren\'t told.</p>' +
        (ids.length ? ids.map(function (id) {
          var c = known[id] || { username: "explorer" };
          return '<div class="person-row meetup-person"><span class="mp-who">' + avatar(c) + '<span class="name">' + esc(nameOf(c)) + "</span></span>" +
            '<span class="mp-actions"><button class="btn small" data-m="unblock" data-id="' + esc(id) + '">Unblock</button></span></div>';
        }).join("") : '<p class="empty">Nobody.</p>'), "meetups");
      fill();
    }).catch(function (err) { showError(openBlocked, null, "meetups", err); });
  }

  // ---------- moderation ----------
  var reportTab = "open";
  function openReports() {
    if (needSignIn()) return;
    if (!reviewer) { show(openReports, null, back() + '<h2 class="list-title">Meetup reports</h2><p class="list-desc">Only reviewers can see this.</p>', "meetup-reports"); return; }
    loading(openReports, null, "meetup-reports", "Meetup reports");
    rpc("mod_reports", { p_status: reportTab === "open" ? "open" : null }).then(function (rows) {
      if (!isCurrent(openReports, null)) return;
      show(openReports, null,
        '<button class="dz-back" data-m="settings">← Settings</button>' +
        '<h2 class="list-title">🛡️ Meetup reports</h2>' +
        '<p class="list-desc">While a meetup has an open report you can read its chat. Closing a meetup and suspending someone take effect straight away.</p>' +
        '<div class="seg review-tabs"><button class="btn small' + (reportTab === "open" ? " primary" : "") + '" data-m="rtab" data-id="open">Open</button>' +
          '<button class="btn small' + (reportTab === "all" ? " primary" : "") + '" data-m="rtab" data-id="all">All</button></div>' +
        ((rows || []).length ? rows.map(reportCard).join("") : '<p class="empty">No reports. 🎉</p>'),
        "meetup-reports");
    }).catch(function (err) { showError(openReports, null, "meetup-reports", err); });
  }

  function reportCard(x) {
    var reason = (REASONS.filter(function (r) { return r.id === x.reason; })[0] || { label: x.reason }).label;
    return '<div class="report-card">' +
      '<p class="meta">' + esc(new Date(x.created_at).toLocaleString("en-GB")) + " · " + esc(x.kind) + " · " + esc(x.status) +
        (x.reporter_username ? " · from @" + esc(x.reporter_username) : "") + "</p>" +
      "<p><b>" + esc(reason) + "</b>" + (x.details ? ": " + esc(x.details) : "") + "</p>" +
      (x.room_title ? "<p>Meetup: " + (x.room_exists ? '<a href="#meetup/' + esc(x.room_id) + '">' + esc(x.room_title) + "</a>" : esc(x.room_title) + " (deleted)") + "</p>" : "") +
      (x.message_text ? '<p class="report-quote">“' + esc(x.message_text) + "”</p>" : "") +
      (x.person_username ? '<p>Person: <a href="#@' + esc(x.person_username) + '">@' + esc(x.person_username) + "</a>" +
        (x.person_reports > 1 ? ' <span class="count-dot">' + x.person_reports + " reports</span>" : "") +
        (x.person_suspended ? " · suspended" : "") + "</p>" : "") +
      '<div class="actions">' +
        (x.room_exists ? '<button class="btn small" data-m="mod-close" data-id="' + esc(x.room_id) + '">Close meetup</button>' : "") +
        (x.message_id ? '<button class="btn small" data-m="mod-delete-msg" data-id="' + esc(x.message_id) + '">Delete message</button>' : "") +
        (x.person_id ? (x.person_suspended
          ? '<button class="btn small" data-m="mod-unsuspend" data-id="' + esc(x.person_id) + '">Lift suspension</button>'
          : '<button class="btn small danger" data-m="mod-suspend" data-id="' + esc(x.person_id) + '">Suspend from meetups</button>') : "") +
        (x.status === "open" ? '<button class="btn small primary" data-m="mod-done" data-id="' + esc(x.id) + '">Handled</button>' +
          '<button class="btn small" data-m="mod-dismiss" data-id="' + esc(x.id) + '">Dismiss</button>' : "") +
      "</div></div>";
  }

  // ---------- pieces for other screens ----------
  // On a place page: meetups planned there, and "Go with others".
  function spotSection(spot) {
    if (!ready) return "";
    return '<div class="spot-section" id="spot-meetups"><h3>🙋 Go with others</h3>' +
      '<p class="empty">Looking for meetups…</p></div>';
  }
  function afterSpot(spot) {
    if (!ready) return;
    list("place", spot.id).then(function (rows) {
      var el = document.getElementById("spot-meetups");
      if (!el || !app.isSpot(spot.id)) return;
      rows = rows.filter(function (r) { return stateOf(r) === "open" || stateOf(r) === "full" || r.my_status === "member"; });
      el.innerHTML = '<h3>🙋 Go with others</h3>' +
        (rows.length ? rows.map(function (r) { return card(r, false); }).join("")
          : '<p class="empty">Want company? Start a meetup and explorers in ' + esc(DATA.city) + " can ask to join.</p>") +
        '<div class="actions"><button class="btn" data-m="new-for" data-id="place/' + esc(spot.id) + '">＋ Start a meetup here</button></div>';
      fill();
    }).catch(function () { var el = document.getElementById("spot-meetups"); if (el) el.remove(); });
  }

  // On a collection page.
  function collectionButton(c) {
    if (!ready || !canHaveMeetups(c)) return "";
    return '<button class="btn" data-m="new-for" data-id="collection/' + esc(c.id) + '">🙋 Go with others</button>';
  }
  function collectionSection(c) {
    if (!ready || !canHaveMeetups(c)) return "";
    return '<div class="spot-section" id="col-meetups" data-col="' + esc(c.id) + '" hidden><h3>🙋 Meetups for this collection</h3></div>';
  }
  function afterCollection(c) {
    if (!ready || !canHaveMeetups(c)) return;
    list("collection", c.id).then(function (rows) {
      var el = document.getElementById("col-meetups");
      if (!el || el.getAttribute("data-col") !== c.id) return;
      rows = rows.filter(function (r) { return stateOf(r) === "open" || stateOf(r) === "full" || r.my_status === "member"; });
      if (!rows.length) return;
      el.hidden = false;
      el.innerHTML += rows.map(function (r) { return card(r, false); }).join("");
      fill();
    }).catch(function () {});
  }

  // At the top of the Explorer feed.
  function feedStrip() {
    if (!ready) return "";
    return '<div class="meetup-strip" id="meetup-strip" hidden></div>';
  }
  function afterFeed() {
    if (!ready) return;
    list().then(function (rows) {
      var el = document.getElementById("meetup-strip");
      if (!el) return;
      var mine = rows.filter(function (r) { return (r.my_status === "member" || r.my_status === "requested") && !isPast(r) && r.status === "open"; });
      var open = rows.filter(function (r) { return !r.my_status && stateOf(r) === "open"; });
      el.hidden = false;
      el.innerHTML = '<div class="ms-head"><h3>🙋 Meetups in ' + esc(DATA.city) + "</h3>" +
          '<button class="linkish" data-m="home">See all</button></div>' +
        (requests ? '<button class="set-row" data-m="home"><span class="set-icon">🔔</span><span class="set-label">' + requests +
          (requests === 1 ? " person wants" : " people want") + ' to join your meetup</span><span class="set-val"></span></button>' : "") +
        mine.concat(open).slice(0, 4).map(function (r) { return card(r, true); }).join("") +
        (!mine.length && !open.length ? '<p class="empty">No meetups planned yet. Open a place and tap “Start a meetup here”.</p>' : "");
      fill();
    }).catch(function () {});
  }

  // A row for People & feed.
  function peopleRow() {
    if (!ready) return "";
    return '<button class="set-row" data-m="home"><span class="set-icon">🙋</span><span class="set-label">Meetups' +
      (requests ? ' <span class="count-dot">' + requests + "</span>" : "") + '</span><span class="set-val"></span></button>';
  }

  // Under Settings › Contribute, for reviewers.
  function settingsRows() {
    if (!ready || !reviewer) return "";
    return '<button class="set-row" data-m="reports"><span class="set-icon">🛡️</span><span class="set-label">Meetup reports</span><span class="set-val"></span></button>';
  }

  function exportData() {
    if (!ready) return Promise.resolve({});
    return Promise.all([
      sb.from("room_members").select("room_id, status, intro, created_at").eq("user_id", me()).then(check),
      sb.from("room_messages").select("room_id, body, created_at").eq("user_id", me()).then(check)
    ]).then(function (r) { return { meetupMemberships: r[0], meetupMessages: r[1] }; }).catch(function () { return {}; });
  }

  // ---------- clicks ----------
  function act(p, then) {
    p.then(then || function () { if (current) current.fn(current.arg); }, function (err) { alert(errText(err)); });
  }

  function onClick(e) {
    var el = e.target.closest("[data-m]");
    if (!el || !app.sheetBody.contains(el)) return;
    var m = el.getAttribute("data-m"), id = el.getAttribute("data-id"), room = el.getAttribute("data-room");
    e.preventDefault();
    e.stopPropagation();
    if (m === "home") openHome();
    else if (m === "people") { if (window.GoSocial) location.hash = "people"; else openHome(); }
    else if (m === "settings") app.openSettings();
    else if (m === "open") openRoom(id);
    else if (m.indexOf("open-") === 0) openRoom(m.slice(5));
    else if (m === "new") openNew("");
    else if (m === "new-for") openNew(id);
    else if (m === "safety") openSafety();
    else if (m === "edit") openEdit(id);
    else if (m === "ask") openAsk(id);
    else if (m === "sharing") openSharing(id);
    else if (m === "cancel") {
      if (confirm("Cancel this meetup? Everyone in it is told in the chat.")) act(rpc("cancel_room", { room: id }));
    }
    else if (m === "leave") {
      if (confirm("Leave this meetup?")) act(rpc("leave_room", { room: id }), function () { stopChat(); openRoom(id); });
    }
    else if (m === "accept") act(rpc("decide_join", { room: room, person: id, accept: true }), function () { refreshRequests(); openRoom(room); });
    else if (m === "decline") act(rpc("decide_join", { room: room, person: id, accept: false }), function () { refreshRequests(); openRoom(room); });
    else if (m === "person-menu") personMenu(el, id, room, el.getAttribute("data-name"), el.hasAttribute("data-host"));
    else if (m === "remove") {
      if (confirm("Remove " + (el.getAttribute("data-name") || "this person") + " from the meetup? They can't ask to join it again.")) act(rpc("remove_member", { room: room, person: id }), function () { openRoom(room); });
    }
    else if (m === "report-person") openReport("person", id, room, el.getAttribute("data-name"), id);
    else if (m === "report-room") openReport("room", id, id, "", el.getAttribute("data-host"));
    else if (m === "report-msg") {
      var msg = chat && chat.messages.filter(function (x) { return x.id === id; })[0];
      openReport("message", id, chat && chat.roomId, msg && chat.people[msg.user_id] ? nameOf(chat.people[msg.user_id]) : "", msg && msg.user_id);
    }
    else if (m === "delete-msg") {
      if (confirm("Delete this message?")) act(sb.from("room_messages").delete().eq("id", id).then(check), function () { loadMessages().then(function () { drawChat(false); }); });
    }
    else if (m === "block") {
      if (confirm("Block this person? You won't see each other's meetups, they leave yours and you leave theirs. They aren't told.")) {
        act(block(id), function () { if (room) openRoom(room); else openHome(); });
      }
    }
    else if (m === "unblock") act(sb.from("blocks").delete().eq("blocked_id", id).then(check).then(function () { delete blocked[id]; }), openBlocked);
    else if (m === "blocked") openBlocked();
    else if (m === "reports") openReports();
    else if (m === "rtab") { reportTab = id; openReports(); }
    else if (m === "mod-close") { var why = prompt("Close this meetup? Optional note for its members:", ""); if (why !== null) act(rpc("mod_close_room", { room: id, why: why })); }
    else if (m === "mod-delete-msg") { if (confirm("Delete this message for everyone?")) act(sb.from("room_messages").delete().eq("id", id).then(check)); }
    else if (m === "mod-suspend") { var r = prompt("Suspend this person from meetups? Their meetups close and they leave the rest. Reason (only reviewers see it):", ""); if (r !== null) act(rpc("mod_suspend", { person: id, why: r })); }
    else if (m === "mod-unsuspend") act(rpc("mod_unsuspend", { person: id }));
    else if (m === "mod-done") act(rpc("mod_decide_report", { report: id, p_status: "actioned" }));
    else if (m === "mod-dismiss") act(rpc("mod_decide_report", { report: id, p_status: "dismissed" }));
  }

  // A small menu under the ⋯ next to a person.
  function personMenu(el, id, room, name, canRemove) {
    var open = el.parentNode.querySelector(".mp-menu");
    if (open) { open.remove(); return; }
    el.insertAdjacentHTML("afterend", '<span class="mp-menu">' +
      (canRemove ? '<button class="btn small" data-m="remove" data-id="' + esc(id) + '" data-room="' + esc(room) + '" data-name="' + esc(name) + '">Remove</button>' : "") +
      '<button class="btn small" data-m="report-person" data-id="' + esc(id) + '" data-room="' + esc(room) + '" data-name="' + esc(name) + '">Report</button>' +
      '<button class="btn small danger" data-m="block" data-id="' + esc(id) + '" data-room="' + esc(room) + '">Block</button></span>');
  }

  function rerender() { if (current && app.isOpen()) current.fn(current.arg); }

  window.GoMeetups = {
    init: function (api) {
      app = api;
      if (!ACCT.enabled) return;
      app.sheetBody.addEventListener("click", onClick, true);
      ACCT.on(function (event) {
        if (event === "signed-in") loadStatus().then(function () { if (app.view() === "social" || app.view() === "spot") app.rerender(); });
        else if (event === "signed-out") { stopChat(); ready = false; status = null; requests = 0; blocked = {}; reviewer = false; showDot(); }
        else if (event === "profile") loadStatus();
      });
      // keep the red dot fresh while the app is open
      setInterval(function () { if (me() && !document.hidden) refreshRequests(); }, 60000);
    },
    ready: function () { return ready; },
    route: function (hash) {
      var parts = hash.split("/");
      if (!ACCT.enabled) return false;
      var go;
      if (hash === "meetups") go = openHome;
      else if (hash === "meetups-safety") go = openSafety;
      else if (hash === "meetup-reports") go = openReports;
      else if (parts[0] === "meetup-new") go = function () { openNew(parts.slice(1).join("/")); };
      else if (parts[0] === "meetup" && parts[1] && parts[2] === "edit") go = function () { openEdit(parts[1]); };
      else if (parts[0] === "meetup" && parts[1] && parts[2] === "ask") go = function () { openAsk(parts[1]); };
      else if (parts[0] === "meetup" && parts[1] && parts[2] === "sharing") go = function () { openSharing(parts[1]); };
      else if (parts[0] === "meetup" && parts[1]) go = function () { openRoom(parts[1]); };
      else return false;
      // A link opened straight away: your meetup status may still be loading.
      if (ready || !me()) go(); else loadStatus().then(go);
      return true;
    },
    rerender: rerender,
    onClose: function () { current = null; stopChat(); },
    spotSection: spotSection,
    afterSpot: afterSpot,
    collectionButton: collectionButton,
    collectionSection: collectionSection,
    afterCollection: afterCollection,
    feedStrip: feedStrip,
    afterFeed: afterFeed,
    peopleRow: peopleRow,
    settingsRows: settingsRows,
    exportData: exportData,
    personalInfo: personalInfo
  };
})();
