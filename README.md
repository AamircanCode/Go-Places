# Go Places

Explore Munich and Berlin for free. A mobile-friendly map of free (or nearly free) spots, with history, fun facts, audio read-outs and themed playlists like "Sunset spots" or "Oldest churches". Tap the city name under "Go Places" in the top bar to switch cities.

## Try it

It's a plain website with no build step. Accounts are optional: until you connect a free Supabase project (see below), everything works without them.

- **On your computer:** open `index.html` in a browser. (Your location only works when the site is served over `https://` or from `localhost`, e.g. `python3 -m http.server` and then http://localhost:8000.)
- **Online for free:** turn on GitHub Pages for this repo (Settings → Pages → Deploy from branch → `main` / root). Then open the link on your phone.

## Cities

Each city is its own set of content files, and [`data/cities.js`](data/cities.js) lists the cities and loads the right set. Munich's files are the ones directly in `data/`; Berlin's are in [`data/berlin/`](data/berlin/), with photos in `images/berlin/`.

- **Switching city:** tap "Munich, for free ▾" in the top bar. Links carry the city, e.g. `…/?city=berlin#humboldthain`, and the app remembers the last city on each device.
- **Adding a city:** make a folder `data/<city>/`, copy Berlin's files into it and change the content (only `spots.js` is required), then add the city to the list at the top of `data/cities.js`. No code changes needed.
- Explored spots, the wishlist, ratings, photos and badges are kept per person across all cities.

## Updating places and themes

Every city's places come from one file: **[`data/spots.js`](data/spots.js)** for Munich, **[`data/berlin/spots.js`](data/berlin/spots.js)** for Berlin. The top of that file explains every field. To add a spot, copy an existing block, paste it at the end of the list and change the text and coordinates. To get coordinates, right-click the place in Google Maps and click the numbers to copy them.

Spot pages also show **🚶 Around here** (a spot's optional `around` list of things to do nearby) and **📍 Nearby spots**, links to the spot's own `nearby` ids plus the closest other spots within 1.5 km, with walking times.

Photos: put image files into `images/`, run `python3 tools/watermark.py` to stamp "© Go Places" onto any new ones (already stamped photos are skipped), and list them in the spot's `photos`, e.g. `{ url: "images/hackerbruecke-1.jpg", credit: "Photo: Aamir" }`. Spots without photos show a coloured card with their emoji.

The site also blocks right-click and long-press "Save image" and dragging on photos ([`protect.js`](protect.js)) and asks search engines not to index them. That stops casual saving, not a determined person (a screenshot or the browser's developer tools still work), which is why the mark is in the photo itself. Keep unstamped originals outside the repo.

## What can I do? (activities, moods, hidden gems, quests)

A second layer on top of the map. The map answers "Where can I go?"; this layer answers "What can I do?".

- **How do you feel today?** Eight mood cards (Relax, Explore, Learn, …) under the **Discover** tab. They open by themselves once, on the first visit; after that the app opens on the map. Tap one to see matching activities.
- **What can I do right now?** Pick how much time you have (30 minutes to a full day) and get activities that fit and are in season, nearest first if location is on.
- **Activities** like "Watch the ducks" or "Watch the sunset", each linked to one or more spots. Save them, and tick "Did it here" at a spot (that also marks the spot as explored). Spot pages show "Things to do here".
- **Hidden gems**: small discoveries shown separately from the main spots, with a "Found it" tick.
- **Quests and badges**: e.g. watch the sunset from three viewpoints to earn the Sunset Hunter badge. Badges show on your profile, and on public profiles.

Progress is saved on the device, and in the account when signed in (anything done before signing in is moved into the account).

All of it comes from four files, so new content needs no code changes:

- [`data/activities.js`](data/activities.js): activities and the spots they link to
- [`data/hidden-gems.js`](data/hidden-gems.js): hidden gems
- [`data/quests.js`](data/quests.js): quests and badges
- [`data/discover.js`](data/discover.js): moods, categories and the time choices

The top of each file explains every field. The lists are plain JSON, so they can be moved into a database later. If an activity or quest points at an id that doesn't exist, the browser console says so.

Links open straight to a screen, e.g. `…/#do/watch-ducks`, `…/#gem/residenz-lions`, `…/#mood/relax`, `…/#now`, `…/#quests`.

## Free Knowledge

A top-level category for learning in the city that costs nothing. Its places show under "All spots" with everything else, and on their own under the **📚 Free Knowledge** chip (or `…/#knowledge`).

- Ten subcategories (Free Museums, Public Bookshelves, Reading Spaces, Libraries, Educational Exhibitions, History, Science, Literature, Public Art, Learning Experiences)
- **Public Bookshelves of Munich** (`…/#bookshelves`): 19 open bookshelves, with where they are, why to go, opening info, tags and visit time
- 11 free museums (Paläontologisches Museum, Geologisches Museum, NS-Dokumentationszentrum, Museum für Abgüsse, Monacensia, Rathausgalerie, Kunstarkaden, Lothringer 13, MaximiliansForum, Amerikahaus, ESO Supernova) with history, fun facts and visitor information, plus the city library at Gasteig HP8

They're normal spots, so explored, wishlist, photos and ratings all work. Everything is in [`data/free-knowledge.js`](data/free-knowledge.js); the top of the file explains every field. Opening hours and most pins are marked VERIFY.

## Place metadata, collections and Plan My Day

Three things that help answer "What should I do right now in my city?".

- **At a glance** on every spot page: how long it takes, budget, best time of day and season, which weather it works in, who it suits, how active it is, step-free access, and three 1–10 scores (hidden gem, knowledge, photo). It also says when right now is a good time to go. All of it is in [`data/place-meta.js`](data/place-meta.js), one entry per spot; a spot without an entry gets a guess from its cost and themes, marked as not checked. Accessibility is marked VERIFY everywhere.
- **Collections** (`…/#collections`): lists of places, like playlists. Every theme is also a Go Places collection, plus starter ones in [`data/collections.js`](data/collections.js) (Rainy Day Munich, Best First Date Locations, Birdwatching In Munich, …). Anyone can make their own: tap **♡ Save** on a spot (it lists the wishlist and your collections, plus **New collection**), or start one and search for places. Collections can be Public, Followers only or Private, shared with a link like `…/#collection/<id>`, and other people's can be saved. Spot pages show "Included in collections". The wishlist is the first choice under **♡ Save** and shows under **Places › Wishlist** on your profile. Signed out, collections are kept on the device and move into the account at sign-in.
- **Plan My Day** (`…/#plan`, also on the "What can I do?" screen): pick time, budget, interests, company and weather, and get a route through existing places with walking or public transport estimates between stops, a matching activity and nearby hidden gems for each stop, directions, "Show on map", "Try another" and "Save as collection". The weather is detected from [Open-Meteo](https://open-meteo.com) for the city centre (no key, nothing personal sent); otherwise you pick it. A signed-in explorer's profile interests are picked for them. Plans are links too, e.g. `…/#plan/t=2h&b=free&i=books,museums`.

Plan My Day's choices and how interests match places are in [`data/plan.js`](data/plan.js). The planner in `plan.js` is made of swappable parts (filters, scorers, travel time, weather), so live opening hours, real walking or cycling times, public transport or seasonal events can be added later with `GoItinerary.addFilter`, `addScorer`, `setTravel` and `setWeatherProvider` without changing the rest.

Collections in an account need the "collections" part of [`supabase/schema.sql`](supabase/schema.sql): paste the whole file into the SQL Editor and run it again. Until then they stay on the device.

## Explorers (social discovery, privacy first)

Go Places is not a social network: there are **no follower counts, likes, rankings or leaderboards** anywhere.

- **Profiles** get an emoji avatar (uploaded profile photos are switched off for now), interests, quests completed and activities completed, on top of name, bio, badges, explored places and photos.
- **Follow / unfollow.** Following a public profile is instant; a followers-only profile gets a request it can accept or decline. "People you follow" and "People following you" are plain lists that only you can see. You can remove a follower; they aren't told.
- **Discover explorers** (`…/#explorers`, or the **Explorers** tab): public explorers grouped by interests and what they explore (Nature Enthusiasts, Knowledge Hunters, Museum Explorers, …), in random order. Groups and interests live in [`data/social.js`](data/social.js).
- **Explorer feed** (`…/#feed`): places explored, photos added, activities done, quests completed and new categories explored, from you and the people you follow.
- **Ratings** on every place: an overall score plus optional learning value, scenic value, accessibility, family friendly and uniqueness. Only averages are shown; there are no comments.
- **Privacy** (`…/#privacy`): profile Public / Followers only / Private, and Everyone / Followers only / Only me for visited places, wishlist, activity feed and uploaded photos. The database enforces these rules, not just the app.

These need the "social discovery & privacy" part of [`supabase/schema.sql`](supabase/schema.sql): paste the whole file into the SQL Editor and run it again. Until then they stay hidden and everything else works as before. Existing public profiles stay public; private ones stay private.

## Getting around

- **Tab bar** at the bottom: **Map**, **Discover** (moods, right now, Plan My Day, collections, hidden gems), **Suggest**, **Explorers** and **Me** (your profile, or Sign in). Suggest and Explorers only show once their parts of `supabase/schema.sql` have been run.
- **Theme bar:** **Filters** (Hide explored), **List**, then the themes. A theme's optional `short` name in `data/spots.js` is used on its chip.
- **Grouped pins:** pins that would overlap on screen show as one numbered circle; tap it to zoom in. Below zoom 17 they regroup on every zoom.

## Profile and Settings

- **Your profile** (`…/#me`): name, bio, interests and three numbers (explored, badges, photos), then one **People & feed** row (Feed, People you follow, People following you, Discover explorers; `…/#people`; no follower counts) and four tabs: **Places** (Explored, Wishlist, Saved activities), **Photos**, **Badges** and **Lists** (your collections).
- **⚙️ Settings** (`…/#settings`, the gear on your profile): Edit profile, Privacy, Copy profile link, My suggestions, Review queue (reviewers only), City, Download my data, Sign out and Delete account.
- **Place pages** lead with three buttons (Directions, Explored, ♡ Save) and a row of icons (Listen, Add photo, Rate, Share). The tip sits right under the description; "At a glance" and "History & fun facts" fold open on tap.

## Suggestions and the review queue

Signed-in explorers can suggest new places and photos. Nothing they send is public until a reviewer approves it. Reviewers see who sent each suggestion; once approved, it's shown without the sender's name.

- **Suggest a place:** the **Suggest** tab (or `…/#suggest`). Move the map so the pin sits on the place, then add a name, an icon, themes, a short description, cost, best time, a tip and an optional photo.
- **Suggest a photo:** on any spot, **📷 Add photo** and tick **Also suggest it for this place's page**. The photo still goes to their own photos too.
- **My suggestions** (`…/#suggestions`, also under **⚙️ Settings › Contribute**): each suggestion shows *Waiting for review*, *Approved* or *Not accepted* (with the reviewer's reason, if given). Waiting or rejected ones can be withdrawn.
- **Review** (`…/#review`, only for reviewers): a **Review queue** row under **⚙️ Settings › Contribute** and a red number on the profile picture when something is waiting. Each suggestion shows who sent it (their username links to their profile); places show their pin on a small map, its text and photo, with **Approve**, **Edit, then approve** and **Reject** (with an optional reason). Approved places appear on the map straight away, and approved photos on their place's page. **Recently decided** lets you unpublish something or approve it after all. **Contributors** is a directory of everyone who has suggested something, with how many were approved, rejected or are waiting; tap a person to see everything they've sent. Suggestions stay in it after they're decided.
- **Approving from Supabase instead:** in **Table Editor → submissions**, change a row's `status` to `approved` or `rejected`. It has the same effect as the buttons.

If someone deletes their account, their approved places and photos stay up (listed under *Deleted accounts*) and everything else they suggested is removed.

Photos are shrunk, stripped of their location data and stamped with "© Go Places" on the phone before upload. Approved places live in the database, not in `data/spots.js`; to give one full history and fun facts later, copy it into `spots.js` (keeping its `c-…` id) and unpublish the suggestion.

This needs the "submissions" part of [`supabase/schema.sql`](supabase/schema.sql): paste the whole file into the SQL Editor and run it again. Until then the ＋ button stays hidden. The file makes **@aamiradmin** the reviewer; if that account doesn't exist yet, sign up with that username and run the file again. The end of the file shows how to add or remove other reviewers. Nobody can make themselves a reviewer from the app.

**@aamiradmin can also publish directly.** Places and photos that account adds skip the queue and go live straight away (the form says **Publish** instead of *Send for review*, and the photo tick box says *Also add it to this place's page*). The database decides this from who is signed in (`can_publish` in the `reviewers` table), so no other account can do it, other reviewers included.

## Accounts (optional, free)

With accounts switched on, people can:

- sign up with email and password, and reset a forgotten password
- keep their explored spots on every device (anything they marked before signing up is moved into the account)
- keep a wishlist of spots they want to visit
- take or pick photos of a spot and upload them; the photo is resized and its hidden GPS location and camera data are removed **on the phone, before upload**
- customise their profile: name, username, avatar, colour (it re-colours the whole app), home city and a short bio
- choose a private profile (default), a followers-only one, or a public one with a shareable link like `…/#@aamir`, and decide separately who sees their places, wishlist, feed and photos; emails are never shown
- download all their data or delete their account and photos

Data lives in [Supabase](https://supabase.com), which has a free plan that works with a static GitHub Pages site. Visits and photos are stored with dates, so future challenges ("explore 3 sunset spots this month", "post a photo from every church") can be checked against them.

### Turning accounts on (about 10 minutes)

You need to do this yourself, because it creates an account in your name.

1. **Create a free Supabase account and project** at [supabase.com](https://supabase.com). Pick the region **Central EU (Frankfurt)** so data stays in Germany/the EU. Save the database password somewhere safe (the app doesn't need it).
2. **Create the tables:** in the project, open **SQL Editor → New query**, paste the whole of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**. It creates the tables, the privacy rules and a private photo bucket. It's safe to run again: whenever `schema.sql` changes (for example the discovery tables for saved activities and badges), paste and run the whole file again. Until then, accounts keep working and discovery progress just stays on the device.
3. **Tell Supabase where the site lives:** **Authentication → URL Configuration**. Set **Site URL** to `https://aamircancode.github.io/Go-Places/` and add the same address under **Redirect URLs** (add `http://localhost:8000/` too if you test locally). Email links (confirm, reset password) only go to these addresses.
4. **Connect the site:** open **Project Settings → API Keys** (or the **Connect** button), copy the **Project URL** and the **publishable** key (older projects: "anon public"), and paste them into [`config.js`](config.js). Commit and push. These two values are meant to be public; never paste the *secret* / *service_role* key.

That's it. A **Sign in** tab appears in the bottom tab bar. Whenever `schema.sql` changes, run the whole file again.

**Things to know about the free plan** (check [supabase.com/pricing](https://supabase.com/pricing) for current numbers): about 500 MB of database, 1 GB of photo storage (photos are shrunk to roughly 200–400 KB each, so a few thousand photos) and 50,000 monthly users. A free project is **paused after a week with no visits**; you can wake it up from the dashboard. The built-in email sender only sends a few emails per hour, which is fine for testing. Before a real launch, connect a free email service under **Authentication → Emails → SMTP Settings** (e.g. Resend or Brevo), or new sign-ups may not get their confirmation email.

## What's in this first version

- Map of Munich (OpenStreetMap, free, no API key) with your live location
- 12 spots, including the Glockenspiel at Marienplatz, sunset at Hackerbrücke and the ducks at Hinterbrühl
- 6 themes / playlists you can filter by
- Spot pages with cost, best time, history, fun facts, a tip, photos, walking directions (opens Google Maps) and a 🔊 Listen button that reads the text aloud
- "Mark as explored" counter, saved on the device, or in your account when signed in
- "Hide explored" switch (under **Filters** in the theme bar, and in the list view) that hides spots you have already explored from the map and list; turn it off to see them again. The choice is remembered on the device.
- Share links that open straight to a spot (e.g. `…/#hackerbruecke`)

## Later phases

AR camera view, monthly challenges, a community forum, and local business partner deals.

## Files

- `index.html`, `style.css`, `app.js`: the app
- `account.js`: sign-in, profiles, wishlist and photo uploads (talks to Supabase)
- `config.js`: your Supabase project address and publishable key
- `supabase/schema.sql`: database tables and privacy rules, run once in Supabase
- `discover.js`: the "What can I do?" layer (moods, activities, hidden gems, quests)
- `knowledge.js`: the Free Knowledge screens; `data/free-knowledge.js`: its places
- `social.js`: profiles, follows, explorers, feed, ratings and privacy; `data/social.js`: interests and explorer groups
- `meta.js`: place metadata and "At a glance"; `data/place-meta.js`: the metadata of each place
- `collections.js`: collections; `data/collections.js`: the Go Places starter collections
- `plan.js`: Plan My Day and the route planner; `data/plan.js`: its choices, interests and weights
- `submissions.js`: suggest a place or photo, and the review queue
- `lightbox.js`: the full-size photo viewer (tap any photo; swipe or arrow keys to move, Esc or tap to close)
- `data/spots.js`: all spots and themes
- `data/activities.js`, `data/hidden-gems.js`, `data/quests.js`, `data/discover.js`: content for the "What can I do?" layer
- `vendor/`: Leaflet 1.9.4 map library and supabase-js 2.118.0 (bundled so the app has no outside dependencies apart from map tiles and your Supabase project)
