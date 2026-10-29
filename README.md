# Go Places

Explore Munich for free. A mobile-friendly map of free (or nearly free) spots, with history, fun facts, audio read-outs and themed playlists like "Sunset spots" or "Oldest churches".

## Try it

It's a plain website with no build step. Accounts are optional: until you connect a free Supabase project (see below), everything works without them.

- **On your computer:** open `index.html` in a browser. (Your location only works when the site is served over `https://` or from `localhost`, e.g. `python3 -m http.server` and then http://localhost:8000.)
- **Online for free:** turn on GitHub Pages for this repo (Settings → Pages → Deploy from branch → `main` / root). Then open the link on your phone.

## Updating places and themes

Everything you see comes from one file: **[`data/spots.js`](data/spots.js)**. The top of that file explains every field. To add a spot, copy an existing block, paste it at the end of the list and change the text and coordinates. To get coordinates, right-click the place in Google Maps and click the numbers to copy them.

Photos: put image files into `images/` and list them in the spot's `photos`, e.g. `{ url: "images/hackerbruecke-1.jpg", credit: "Photo: Aamir" }`. Spots without photos show a coloured card with their emoji.

## Accounts (optional, free)

With accounts switched on, people can:

- sign up with email and password, and reset a forgotten password
- keep their explored spots on every device (anything they marked before signing up is moved into the account)
- keep a wishlist of spots they want to visit
- take or pick photos of a spot and upload them; the photo is resized and its hidden GPS location and camera data are removed **on the phone, before upload**
- customise their profile: name, username, avatar, colour (it re-colours the whole app), home city and a short bio
- choose a private profile (default) or a public one with a shareable link like `…/#@aamir`; wishlists and emails are never public
- download all their data or delete their account and photos

Data lives in [Supabase](https://supabase.com), which has a free plan that works with a static GitHub Pages site. Visits and photos are stored with dates, so future challenges ("explore 3 sunset spots this month", "post a photo from every church") can be checked against them.

### Turning accounts on (about 10 minutes)

You need to do this yourself, because it creates an account in your name.

1. **Create a free Supabase account and project** at [supabase.com](https://supabase.com). Pick the region **Central EU (Frankfurt)** so data stays in Germany/the EU. Save the database password somewhere safe (the app doesn't need it).
2. **Create the tables:** in the project, open **SQL Editor → New query**, paste the whole of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**. It creates the tables, the privacy rules and a private photo bucket.
3. **Tell Supabase where the site lives:** **Authentication → URL Configuration**. Set **Site URL** to `https://aamircancode.github.io/Go-Places/` and add the same address under **Redirect URLs** (add `http://localhost:8000/` too if you test locally). Email links (confirm, reset password) only go to these addresses.
4. **Connect the site:** open **Project Settings → API Keys** (or the **Connect** button), copy the **Project URL** and the **publishable** key (older projects: "anon public"), and paste them into [`config.js`](config.js). Commit and push. These two values are meant to be public; never paste the *secret* / *service_role* key.

That's it. A **Sign in** button appears in the top bar.

**Things to know about the free plan** (check [supabase.com/pricing](https://supabase.com/pricing) for current numbers): about 500 MB of database, 1 GB of photo storage (photos are shrunk to roughly 200–400 KB each, so a few thousand photos) and 50,000 monthly users. A free project is **paused after a week with no visits**; you can wake it up from the dashboard. The built-in email sender only sends a few emails per hour, which is fine for testing. Before a real launch, connect a free email service under **Authentication → Emails → SMTP Settings** (e.g. Resend or Brevo), or new sign-ups may not get their confirmation email.

## What's in this first version

- Map of Munich (OpenStreetMap, free, no API key) with your live location
- 12 spots, including the Glockenspiel at Marienplatz, sunset at Hackerbrücke and the ducks at Hinterbrühl
- 6 themes / playlists you can filter by
- Spot pages with cost, best time, history, fun facts, a tip, photos, walking directions (opens Google Maps) and a 🔊 Listen button that reads the text aloud
- "Mark as explored" counter, saved on the device, or in your account when signed in
- Share links that open straight to a spot (e.g. `…/#hackerbruecke`)

## Later phases

AR camera view, a Strava-like social feed, monthly challenges, side-quest submissions from users, a community forum, and local business partner deals.

## Files

- `index.html`, `style.css`, `app.js`: the app
- `account.js`: sign-in, profiles, wishlist and photo uploads (talks to Supabase)
- `config.js`: your Supabase project address and publishable key
- `supabase/schema.sql`: database tables and privacy rules, run once in Supabase
- `data/spots.js`: all content
- `vendor/`: Leaflet 1.9.4 map library and supabase-js 2.118.0 (bundled so the app has no outside dependencies apart from map tiles and your Supabase project)
