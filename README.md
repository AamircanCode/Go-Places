# Go Places

Explore Munich for free. A mobile-friendly map of free (or nearly free) spots, with history, fun facts, audio read-outs and themed playlists like "Sunset spots" or "Oldest churches".

## Try it

It's a plain website with no build step. Accounts are optional: until you connect a free Supabase project (see below), everything works without them.

- **On your computer:** open `index.html` in a browser. (Your location only works when the site is served over `https://` or from `localhost`, e.g. `python3 -m http.server` and then http://localhost:8000.)
- **Online for free:** turn on GitHub Pages for this repo (Settings → Pages → Deploy from branch → `main` / root). Then open the link on your phone.

## Updating places and themes

Everything you see comes from one file: **[`data/spots.js`](data/spots.js)**. The top of that file explains every field. To add a spot, copy an existing block, paste it at the end of the list and change the text and coordinates. To get coordinates, right-click the place in Google Maps and click the numbers to copy them.

Photos: put image files into `images/` and list them in the spot's `photos`, e.g. `{ url: "images/hackerbruecke-1.jpg", credit: "Photo: Aamir" }`. Spots without photos show a coloured card with their emoji.

## What can I do? (activities, moods, hidden gems, quests)

A second layer on top of the map. The map answers "Where can I go?"; this layer answers "What can I do?".

- **How do you feel today?** The app opens on eight mood cards (Relax, Explore, Learn, …). Tap one to see matching activities.
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

A top-level category for learning in the city that costs nothing, kept apart from sightseeing: its places don't show under "All spots", only under the **📚 Free Knowledge** chip (or `…/#knowledge`).

- Ten subcategories (Free Museums, Public Bookshelves, Reading Spaces, Libraries, Educational Exhibitions, History, Science, Literature, Public Art, Learning Experiences)
- **Public Bookshelves of Munich** (`…/#bookshelves`): 17 open bookshelves, with where they are, why to go, opening info, tags and visit time
- 8 free museums (Paläontologisches Museum, NS-Dokumentationszentrum, Museum für Abgüsse, Monacensia, Rathausgalerie, Kunstarkaden, Lothringer 13, MaximiliansForum) with history, fun facts and visitor information

They're normal spots, so explored, wishlist, photos and ratings all work. Everything is in [`data/free-knowledge.js`](data/free-knowledge.js); the top of the file explains every field. Opening hours and most pins are marked VERIFY.

## Explorers (social discovery, privacy first)

Go Places is not a social network: there are **no follower counts, likes, rankings or leaderboards** anywhere.

- **Profiles** get a profile photo, interests, quests completed and activities completed, on top of name, bio, badges, explored places and photos.
- **Follow / unfollow.** Following a public profile is instant; a followers-only profile gets a request it can accept or decline. "People you follow" and "People following you" are plain lists that only you can see. You can remove a follower; they aren't told.
- **Discover explorers** (`…/#explorers`, or the 👥 button on the map): public explorers grouped by interests and what they explore (Nature Enthusiasts, Knowledge Hunters, Museum Explorers, …), in random order. Groups and interests live in [`data/social.js`](data/social.js).
- **Explorer feed** (`…/#feed`): places explored, photos added, activities done, quests completed and new categories explored, from you and the people you follow.
- **Ratings** on every place: an overall score plus optional learning value, scenic value, accessibility, family friendly and uniqueness. Only averages are shown; there are no comments.
- **Privacy** (`…/#privacy`): profile Public / Followers only / Private, and Everyone / Followers only / Only me for visited places, wishlist, activity feed and uploaded photos. The database enforces these rules, not just the app.

These need the "social discovery & privacy" part of [`supabase/schema.sql`](supabase/schema.sql): paste the whole file into the SQL Editor and run it again. Until then they stay hidden and everything else works as before. Existing public profiles stay public; private ones stay private.

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

That's it. A **Sign in** button appears in the top bar. Whenever `schema.sql` changes, run the whole file again.

**Things to know about the free plan** (check [supabase.com/pricing](https://supabase.com/pricing) for current numbers): about 500 MB of database, 1 GB of photo storage (photos are shrunk to roughly 200–400 KB each, so a few thousand photos) and 50,000 monthly users. A free project is **paused after a week with no visits**; you can wake it up from the dashboard. The built-in email sender only sends a few emails per hour, which is fine for testing. Before a real launch, connect a free email service under **Authentication → Emails → SMTP Settings** (e.g. Resend or Brevo), or new sign-ups may not get their confirmation email.

## What's in this first version

- Map of Munich (OpenStreetMap, free, no API key) with your live location
- 12 spots, including the Glockenspiel at Marienplatz, sunset at Hackerbrücke and the ducks at Hinterbrühl
- 6 themes / playlists you can filter by
- Spot pages with cost, best time, history, fun facts, a tip, photos, walking directions (opens Google Maps) and a 🔊 Listen button that reads the text aloud
- "Mark as explored" counter, saved on the device, or in your account when signed in
- Share links that open straight to a spot (e.g. `…/#hackerbruecke`)

## Later phases

AR camera view, monthly challenges, side-quest submissions from users, a community forum, and local business partner deals.

## Files

- `index.html`, `style.css`, `app.js`: the app
- `account.js`: sign-in, profiles, wishlist and photo uploads (talks to Supabase)
- `config.js`: your Supabase project address and publishable key
- `supabase/schema.sql`: database tables and privacy rules, run once in Supabase
- `discover.js`: the "What can I do?" layer (moods, activities, hidden gems, quests)
- `knowledge.js`: the Free Knowledge screens; `data/free-knowledge.js`: its places
- `social.js`: profiles, follows, explorers, feed, ratings and privacy; `data/social.js`: interests and explorer groups
- `data/spots.js`: all spots and themes
- `data/activities.js`, `data/hidden-gems.js`, `data/quests.js`, `data/discover.js`: content for the "What can I do?" layer
- `vendor/`: Leaflet 1.9.4 map library and supabase-js 2.118.0 (bundled so the app has no outside dependencies apart from map tiles and your Supabase project)
