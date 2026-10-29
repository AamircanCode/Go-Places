# Go Places

Explore Munich for free. A mobile-friendly map of free (or nearly free) spots, with history, fun facts, audio read-outs and themed playlists like "Sunset spots" or "Oldest churches".

## Try it

It's a plain website with no build step and no accounts.

- **On your computer:** open `index.html` in a browser. (Your location only works when the site is served over `https://` or from `localhost`, e.g. `python3 -m http.server` and then http://localhost:8000.)
- **Online for free:** turn on GitHub Pages for this repo (Settings → Pages → Deploy from branch → `main` / root). Then open the link on your phone.

## Updating places and themes

Everything you see comes from one file: **[`data/spots.js`](data/spots.js)**. The top of that file explains every field. To add a spot, copy an existing block, paste it at the end of the list and change the text and coordinates. To get coordinates, right-click the place in Google Maps and click the numbers to copy them.

Photos: put image files into `images/` and list them in the spot's `photos`, e.g. `{ url: "images/hackerbruecke-1.jpg", credit: "Photo: Aamir" }`. Spots without photos show a coloured card with their emoji.

## What's in this first version

- Map of Munich (OpenStreetMap, free, no API key) with your live location
- 12 spots, including the Glockenspiel at Marienplatz, sunset at Hackerbrücke and the ducks at Hinterbrühl
- 6 themes / playlists you can filter by
- Spot pages with cost, best time, history, fun facts, a tip, photos, walking directions (opens Google Maps) and a 🔊 Listen button that reads the text aloud
- "Mark as explored" counter, saved on the device
- Share links that open straight to a spot (e.g. `…/#hackerbruecke`)

## Later phases

AR camera view, user accounts and a Strava-like social feed, monthly challenges, side-quest submissions from users, a community forum, and local business partner deals.

## Files

- `index.html`, `style.css`, `app.js`: the app
- `data/spots.js`: all content
- `vendor/`: Leaflet 1.9.4 map library (bundled so the app has no outside dependencies apart from map tiles)
