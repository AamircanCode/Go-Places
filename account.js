/*
 * GO PLACES — accounts
 * ====================
 * Everything that talks to Supabase lives here: sign-in, the profile,
 * explored spots, the wishlist and photo uploads. app.js draws the screens
 * and calls `window.GoAccount`. If config.js has no Supabase details,
 * `GoAccount.enabled` is false and the app runs without accounts.
 */
(function () {
  "use strict";

  var cfg = window.GO_PLACES_CONFIG || {};
  var BUCKET = "spot-photos";
  var MAX_SIDE = 1600;       // longest side of an uploaded photo, in pixels
  var JPEG_QUALITY = 0.85;
  var SIGNED_URL_SECONDS = 60 * 60;

  var enabled = !!(cfg.supabaseUrl && cfg.supabaseKey && window.supabase);
  var sb = enabled ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, {
    auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  }) : null;

  var listeners = [];
  var acct = {
    enabled: enabled,
    user: null,
    profile: null,
    visits: {},     // spotId -> ISO date
    wishlist: {},   // spotId -> ISO date
    photos: [],     // newest first: { id, spot_id, path, caption, created_at, url }
    recovering: false
  };

  function check(res) {
    if (res.error) throw res.error;
    return res.data;
  }

  function emit(event) {
    listeners.forEach(function (fn) { fn(event, acct); });
  }

  function toMap(rows, key) {
    var m = {};
    rows.forEach(function (r) { m[r.spot_id] = r[key]; });
    return m;
  }

  function uid() { return acct.user && acct.user.id; }

  // ---------- loading ----------
  function loadMine() {
    var id = uid();
    return Promise.all([
      sb.from("profiles").select("*").eq("id", id).single().then(check),
      sb.from("spot_visits").select("spot_id, visited_at").eq("user_id", id).then(check),
      sb.from("wishlist").select("spot_id, added_at").eq("user_id", id).then(check),
      sb.from("spot_photos").select("*").eq("user_id", id).order("created_at", { ascending: false }).then(check)
    ]).then(function (r) {
      acct.profile = r[0];
      acct.visits = toMap(r[1], "visited_at");
      acct.wishlist = toMap(r[2], "added_at");
      return withUrls(r[3]);
    }).then(function (photos) {
      acct.photos = photos;
    });
  }

  function withUrls(photos) {
    if (!photos.length) return Promise.resolve(photos);
    return sb.storage.from(BUCKET)
      .createSignedUrls(photos.map(function (p) { return p.path; }), SIGNED_URL_SECONDS)
      .then(check)
      .then(function (signed) {
        var byPath = {};
        signed.forEach(function (s) { byPath[s.path] = s.signedUrl; });
        return photos.map(function (p) { p.url = byPath[p.path] || ""; return p; });
      });
  }

  function setUser(user) {
    var changed = (user && user.id) !== uid();
    acct.user = user || null;
    if (!changed) return Promise.resolve();
    if (!user) {
      acct.profile = null; acct.visits = {}; acct.wishlist = {}; acct.photos = [];
      emit("signed-out");
      return Promise.resolve();
    }
    return loadMine().then(function () { emit("signed-in"); }, function (err) {
      console.error("Could not load account", err);
      emit("error");
    });
  }

  // ---------- auth ----------
  acct.init = function () {
    if (!enabled) return Promise.resolve();
    sb.auth.onAuthStateChange(function (event, session) {
      if (event === "PASSWORD_RECOVERY") { acct.recovering = true; emit("recovery"); }
      // run outside the auth callback, as Supabase recommends
      setTimeout(function () { setUser(session && session.user); }, 0);
    });
    return sb.auth.getSession().then(function (res) {
      return setUser(res.data.session && res.data.session.user);
    });
  };

  acct.on = function (fn) { listeners.push(fn); };

  function redirectUrl() { return location.origin + location.pathname; }

  acct.signUp = function (email, password, username, displayName) {
    username = username.trim().toLowerCase();
    return sb.rpc("username_available", { name: username }).then(check).then(function (ok) {
      if (!ok) throw new Error("That username is taken or not allowed. Use 3–20 letters, numbers or _.");
      return sb.auth.signUp({
        email: email.trim(), password: password,
        options: { emailRedirectTo: redirectUrl(), data: { username: username, display_name: displayName.trim() } }
      }).then(check);
    }).then(function (data) {
      // with email confirmation on, there's no session until they click the link
      return { needsConfirmation: !data.session };
    });
  };

  acct.signIn = function (email, password) {
    return sb.auth.signInWithPassword({ email: email.trim(), password: password }).then(check);
  };

  acct.signOut = function () { return sb.auth.signOut().then(check); };

  acct.sendPasswordReset = function (email) {
    return sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: redirectUrl() }).then(check);
  };

  acct.setNewPassword = function (password) {
    return sb.auth.updateUser({ password: password }).then(check).then(function () { acct.recovering = false; });
  };

  // ---------- profile ----------
  acct.updateProfile = function (fields) {
    return sb.from("profiles").update(fields).eq("id", uid()).select().single().then(check)
      .then(function (p) { acct.profile = p; emit("profile"); return p; });
  };

  acct.usernameAvailable = function (name) {
    return sb.rpc("username_available", { name: name }).then(check);
  };

  // Someone else's public profile (or your own). Wishlists are never included.
  acct.loadPublicProfile = function (username) {
    return sb.from("profiles").select("*").eq("username", username).maybeSingle().then(check).then(function (p) {
      if (!p) return null;
      return Promise.all([
        sb.from("spot_visits").select("spot_id, visited_at").eq("user_id", p.id).then(check),
        sb.from("spot_photos").select("*").eq("user_id", p.id).order("created_at", { ascending: false }).then(check)
          .then(withUrls)
      ]).then(function (r) {
        return { profile: p, visits: toMap(r[0], "visited_at"), photos: r[1] };
      });
    });
  };

  // ---------- explored & wishlist ----------
  function toggle(table, mapName, dateKey, spotId, on) {
    var map = acct[mapName];
    var before = map[spotId];
    if (on) map[spotId] = new Date().toISOString(); else delete map[spotId];
    emit(mapName);
    var q = on
      ? sb.from(table).upsert(rowFor(spotId, dateKey, map[spotId]), { ignoreDuplicates: true })
      : sb.from(table).delete().eq("user_id", uid()).eq("spot_id", spotId);
    return q.then(check).catch(function (err) {
      if (before) map[spotId] = before; else delete map[spotId];
      emit(mapName);
      throw err;
    });
  }

  function rowFor(spotId, dateKey, when) {
    var row = { user_id: uid(), spot_id: spotId };
    row[dateKey] = when;
    return row;
  }

  acct.setVisited = function (spotId, on) { return toggle("spot_visits", "visits", "visited_at", spotId, on); };
  acct.setWished = function (spotId, on) { return toggle("wishlist", "wishlist", "added_at", spotId, on); };

  // Spots marked as explored before signing in are copied into the account.
  acct.importExplored = function (local) {
    var rows = Object.keys(local).filter(function (id) { return !acct.visits[id]; })
      .map(function (id) { return rowFor(id, "visited_at", local[id]); });
    if (!rows.length) return Promise.resolve(0);
    return sb.from("spot_visits").upsert(rows, { ignoreDuplicates: true }).then(check).then(function () {
      rows.forEach(function (r) { acct.visits[r.spot_id] = r.visited_at; });
      emit("visits");
      return rows.length;
    });
  };

  // ---------- photos ----------
  // Re-draws the photo on a canvas and saves it as a new JPEG. The new file
  // has no EXIF data at all, so the GPS location, camera serial number and
  // original timestamp are gone before anything leaves the phone.
  function cleanPhoto(file) {
    return decode(file).then(function (img) {
      var w = img.width, h = img.height;
      var scale = Math.min(1, MAX_SIDE / Math.max(w, h));
      var canvas = document.createElement("canvas");
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      if (img.close) img.close();
      return new Promise(function (resolve, reject) {
        canvas.toBlob(function (blob) {
          if (blob) resolve({ blob: blob, width: canvas.width, height: canvas.height });
          else reject(new Error("Couldn't process that photo."));
        }, "image/jpeg", JPEG_QUALITY);
      });
    });
  }

  function decode(file) {
    var unreadable = new Error("This browser can't read that photo format. Try a JPEG or PNG.");
    if (window.createImageBitmap) {
      // turns the photo upright using its EXIF rotation before we drop the EXIF
      return createImageBitmap(file, { imageOrientation: "from-image" }).catch(function () { return viaImg(file); })
        .catch(function () { throw unreadable; });
    }
    return viaImg(file).catch(function () { throw unreadable; });
  }

  function viaImg(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(); };
      img.src = url;
    });
  }

  function randomId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  acct.uploadPhoto = function (spotId, file, caption) {
    if (!/^image\//.test(file.type || "image/")) return Promise.reject(new Error("Please choose a photo."));
    var path = uid() + "/" + spotId + "/" + randomId() + ".jpg";
    return cleanPhoto(file).then(function (clean) {
      return sb.storage.from(BUCKET).upload(path, clean.blob, { contentType: "image/jpeg", upsert: false })
        .then(check).then(function () {
          return sb.from("spot_photos").insert({
            user_id: uid(), spot_id: spotId, path: path,
            caption: (caption || "").trim().slice(0, 140) || null,
            width: clean.width, height: clean.height
          }).select().single().then(check);
        }).catch(function (err) {
          sb.storage.from(BUCKET).remove([path]); // don't leave an orphan file behind
          throw err;
        });
    }).then(function (row) {
      return withUrls([row]);
    }).then(function (rows) {
      acct.photos.unshift(rows[0]);
      emit("photos");
      return rows[0];
    });
  };

  acct.deletePhoto = function (photo) {
    return sb.from("spot_photos").delete().eq("id", photo.id).then(check).then(function () {
      return sb.storage.from(BUCKET).remove([photo.path]).then(check);
    }).then(function () {
      acct.photos = acct.photos.filter(function (p) { return p.id !== photo.id; });
      emit("photos");
    });
  };

  acct.photosFor = function (spotId) {
    return acct.photos.filter(function (p) { return p.spot_id === spotId; });
  };

  // ---------- your data ----------
  acct.exportData = function () {
    return {
      exportedAt: new Date().toISOString(),
      email: acct.user.email,
      profile: acct.profile,
      explored: acct.visits,
      wishlist: acct.wishlist,
      photos: acct.photos.map(function (p) {
        return { spot: p.spot_id, caption: p.caption, uploadedAt: p.created_at, file: p.path };
      })
    };
  };

  acct.deleteAccount = function () {
    var paths = acct.photos.map(function (p) { return p.path; });
    var removeFiles = paths.length ? sb.storage.from(BUCKET).remove(paths).then(check) : Promise.resolve();
    return removeFiles.then(function () {
      return sb.rpc("delete_my_account").then(check);
    }).then(function () {
      return sb.auth.signOut({ scope: "local" });
    });
  };

  window.GoAccount = acct;
})();
