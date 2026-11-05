/*
 * GO PLACES — photo protection
 * ============================
 * Makes saving photos harder for casual visitors: no right-click / long-press
 * "Save image" menu, no dragging a photo out to the desktop, no image selection.
 * The "© Go Places" mark itself is baked into the photo files by
 * tools/watermark.py, and style.css adds a matching mark over cropped photos.
 *
 * This is a deterrent, not a lock. Anything a browser can show can still be
 * saved by someone determined (dev tools, the page source, a screenshot), which
 * is why the watermark lives in the pixels.
 */
(function () {
  "use strict";

  function isPhoto(el) {
    if (!el) return false;
    return el.tagName === "IMG" ||
      !!(el.closest && el.closest(".photo, .photo-full, .photo-strip, .photo-tile, .lightbox, .col-thumb"));
  }

  document.addEventListener("contextmenu", function (e) {
    if (isPhoto(e.target)) e.preventDefault();
  });

  document.addEventListener("dragstart", function (e) {
    if (e.target && e.target.tagName === "IMG") e.preventDefault();
  });
})();
