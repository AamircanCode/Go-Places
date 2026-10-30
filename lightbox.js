/*
 * GO PLACES — full-size photo viewer
 * ==================================
 * Tapping a photo opens it full screen. Swipe or use the arrows to move between
 * the photos of the same place; tap, swipe down, ✕ or Esc closes it.
 *
 * Any <img> becomes tappable when it carries the attributes from
 * `GoLightbox.attrs(items, index)`, where items is a list of { src, caption }.
 * One click listener on the page handles them all, so sheets that are redrawn
 * need no extra wiring.
 */
(function () {
  "use strict";

  var SWIPE_PX = 50;   // horizontal travel that counts as a swipe
  var CLOSE_PX = 90;   // downward travel that closes the viewer

  var items = [];
  var index = 0;
  var lastFocus = null;
  var touch = null;
  var root, img, caption, counter, prevBtn, nextBtn, closeBtn, status;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function attrs(list, i) {
    return ' data-gallery="' + esc(JSON.stringify(list)) + '" data-index="' + (i || 0) +
      '" tabindex="0" role="button" aria-label="View photo full size"';
  }

  function build() {
    root = document.createElement("div");
    root.className = "lightbox";
    root.hidden = true;
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", "Photo viewer");
    root.innerHTML =
      '<button class="lb-close" aria-label="Close">✕</button>' +
      '<span class="lb-counter"></span>' +
      '<button class="lb-nav lb-prev" aria-label="Previous photo">‹</button>' +
      '<div class="lb-stage"><img class="lb-img" alt=""><p class="lb-status"></p></div>' +
      '<button class="lb-nav lb-next" aria-label="Next photo">›</button>' +
      '<p class="lb-caption"></p>';
    document.body.appendChild(root);

    img = root.querySelector(".lb-img");
    caption = root.querySelector(".lb-caption");
    counter = root.querySelector(".lb-counter");
    prevBtn = root.querySelector(".lb-prev");
    nextBtn = root.querySelector(".lb-next");
    closeBtn = root.querySelector(".lb-close");
    status = root.querySelector(".lb-status");

    img.addEventListener("load", function () { status.textContent = ""; img.style.visibility = ""; });
    img.addEventListener("error", function () { status.textContent = "This photo couldn't be loaded."; img.style.visibility = "hidden"; });

    prevBtn.addEventListener("click", function (e) { e.stopPropagation(); go(-1); });
    nextBtn.addEventListener("click", function (e) { e.stopPropagation(); go(1); });
    closeBtn.addEventListener("click", function (e) { e.stopPropagation(); close(); });
    root.addEventListener("click", close); // a tap anywhere else closes

    root.addEventListener("touchstart", function (e) {
      if (e.touches.length !== 1) { touch = null; return; }
      touch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
    root.addEventListener("touchmove", function (e) {
      if (!touch || e.touches.length !== 1) return;
      var dx = e.touches[0].clientX - touch.x;
      var dy = e.touches[0].clientY - touch.y;
      img.style.transform = Math.abs(dx) > Math.abs(dy)
        ? "translateX(" + dx + "px)"
        : "translateY(" + Math.max(dy, 0) + "px)";
    }, { passive: true });
    root.addEventListener("touchend", function (e) {
      if (!touch) return;
      var dx = e.changedTouches[0].clientX - touch.x;
      var dy = e.changedTouches[0].clientY - touch.y;
      touch = null;
      img.style.transform = "";
      if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) {
        e.preventDefault(); // it was a swipe, not a tap
        go(dx < 0 ? 1 : -1);
      } else if (dy > CLOSE_PX && dy > Math.abs(dx)) {
        e.preventDefault();
        close();
      } else if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        e.preventDefault(); // a short drag shouldn't count as a tap that closes
      }
    });
  }

  function show() {
    var it = items[index];
    status.textContent = "";
    img.style.visibility = "";
    img.src = it.src;
    img.alt = it.caption || "";
    caption.textContent = it.caption || "";
    caption.hidden = !it.caption;
    var many = items.length > 1;
    counter.textContent = many ? (index + 1) + " / " + items.length : "";
    prevBtn.hidden = nextBtn.hidden = !many;
    // Warm the cache so swiping feels instant.
    if (many) [index + 1, index - 1].forEach(function (i) {
      new Image().src = items[(i + items.length) % items.length].src;
    });
  }

  function go(step) {
    if (items.length < 2) return;
    index = (index + step + items.length) % items.length;
    show();
  }

  function open(list, start) {
    list = (list || []).filter(function (it) { return it && it.src; });
    if (!list.length) return;
    if (!root) build();
    items = list;
    index = Math.min(Math.max(start || 0, 0), list.length - 1);
    lastFocus = document.activeElement;
    show();
    root.hidden = false;
    document.documentElement.classList.add("lb-open");
    closeBtn.focus();
  }

  function close() {
    if (!root || root.hidden) return;
    root.hidden = true;
    img.removeAttribute("src");
    document.documentElement.classList.remove("lb-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function openFrom(el) {
    var list;
    try { list = JSON.parse(el.getAttribute("data-gallery")); } catch (err) { return; }
    open(list, +el.getAttribute("data-index") || 0);
  }

  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("img[data-gallery]");
    if (el) openFrom(el);
  });

  document.addEventListener("keydown", function (e) {
    if (root && !root.hidden) {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      else if (e.key === "Tab") { // keep focus inside the viewer
        var stops = [closeBtn, prevBtn, nextBtn].filter(function (b) { return !b.hidden; });
        var at = stops.indexOf(document.activeElement);
        e.preventDefault();
        stops[(at + (e.shiftKey ? -1 : 1) + stops.length) % stops.length].focus();
      }
      return;
    }
    var el = e.target;
    if ((e.key === "Enter" || e.key === " ") && el.matches && el.matches("img[data-gallery]")) {
      e.preventDefault();
      openFrom(el);
    }
  });

  window.GoLightbox = { open: open, close: close, attrs: attrs };
})();
