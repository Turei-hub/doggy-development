# Doggy Development

Website and brand assets for **Doggy Development** — a small dog-walking business on
Auckland's North Shore.

## What's here

| Path | What it is |
|---|---|
| `index.html` | The whole public website. No build step, no dependencies, hash-based routing across four pages. |
| `admin.html` | The moderation portal. Sign in, approve or reject submitted dogs, add your own. |
| `firestore.rules` | The security rules. This is what actually guarantees nothing publishes without your say-so. |
| `firebase-config.js` | Your Firebase project details. Empty until you fill it in — see `SETUP.md`. |
| `firebase.json`, `firestore.indexes.json` | Hosting and index config for the Firebase CLI. |
| `SETUP.md` | Step-by-step first-time setup, roughly 20 minutes. |
| `brand/brand.md` | Colours, type, logo rules, contact details, and the name-availability checks. |
| `brand/logo-mark-teal.svg` | The "Good Dog" mark, master file. |
| `brand/logo-concepts.html` | The four logo concepts it was chosen from, with lockups, reversed versions and size tests. |

## Running it

The pages use ES modules, so they need to be served over HTTP — opening
`index.html` straight off the disk won't work.

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

Or, once the Firebase CLI is installed, `firebase serve --only hosting`.

With `firebase-config.js` still empty the site runs in demo mode: the gallery
shows six example dogs and the upload form explains it isn't connected. Every
other page works normally.

## Deploying

**Firebase Hosting** is the natural home, since the gallery already uses
Firestore — `firebase deploy`, and it's live. Commercial use is fine on the free
Spark plan.

The rest of the site is static, so Netlify or Cloudflare Pages would also serve
it. Note that **Vercel's Hobby plan is restricted to non-commercial use**, so a
business site there means the $20/month Pro plan.

## The pages

1. **Home** — hero with a photo-tile collage and a "6 dogs max" badge, sliding marquee, three service cards, the suburb list, gallery CTA.
2. **Gallery** — clients add their dog with a photo, name, breed/suburb and story.
3. **Services & Pricing** — three tiers, an add-ons table, five FAQs.
4. **About** — story, credentials, trading hours, contact.

## How the gallery works

Clients submit a dog on the gallery page. Nothing they send appears anywhere on
the site until it is approved in `admin.html`.

```
client submits  →  Firestore doc, status "pending"  →  you approve  →  live
```

The moderation is enforced by `firestore.rules` on Firebase's servers, not by the
page's JavaScript. Editing the site in a browser's dev tools, or calling the API
directly, still can't publish anything or read the pending queue. Specifically,
the rules allow the public to read only `status == "approved"` documents and to
create only `status == "pending"` ones, capped at one image under 400 KB plus
four short text fields. Changing a status is limited to your account's user ID.

Photos are compressed in the browser to well under 150 KB and stored as text
inside the Firestore document — no Cloud Storage bucket, which keeps everything
inside the free Spark plan with no credit card attached. Room for something like
8,000 dogs.

The three newest approved photos also fill the home page hero collage — but
only once there are three. Below that the hero renders as a single centred
column instead, because a three-tile composition sitting half-empty with paw
placeholders looks worse than no photos at all. Approve a third dog and the
collage appears on its own; nothing needs changing in the code.

`SETUP.md` has the full first-time setup.

## Status: still a wireframe in places

Real layouts, real navigation, real contact details, real rates, and a real
gallery. Still to do before it goes live:

- **Hero photos.** The collage fills itself from approved dogs, but shows paw
  outlines until there are three.
- **The About copy is scaffolding** — right shape, not the owner's own words.
- **GST.** Prices are shown without any GST note. If the business registers for
  GST, every rate on the services page needs "incl. GST" or a re-quote.

## Rates

Set 5 September 2026 from the Auckland market — Goodwalk, North Shore Dog
Walking and Fido & Friends.

| Service | Rate |
|---|---|
| Solo walk | $45 (30 min) · $55 (45 min) · $65 (60 min) |
| Group walk, 60 min, max six dogs | $48 |
| Puppy drop-in, 20 min | $39 |
| Weekly pack, 5 walks | $215 ($43 a walk) |
| Adventure walk, 90 min | $75 |
| Extra dog, same household | $30 |
| Weekend walk | $55 |
| Meet & greet | Free |

Solo rates match Goodwalk exactly. The group walk sits inside the $45–50 band
North Shore operators charge. The free meet & greet is a deliberate
differentiator — Fido & Friends charge $25 for theirs.

## Booking enquiries

The "Book a meet & greet" buttons lead to `#/book`, a six-field form that writes
to a `bookings` collection.

These are handled more strictly than gallery dogs: they hold a name, a phone
number and a suburb, so `firestore.rules` allows **no public read of any kind** —
not even by the person who sent one. Only the owner's account can read them.
They appear in `admin.html` under "New enquiries", with tap-to-call and
tap-to-email links, and a "Mark handled" button that moves them to a second list.

The form's validation is deliberately wired up *before* the Firebase SDK loads.
It's the one page where someone is trying to hand over their details, so it must
never sit dead if Google's CDN is slow or blocked. If Firestore can't be reached
it says so and gives out the phone number instead of swallowing the enquiry.

No email notification — that would need Cloud Functions and the paid Blaze plan.
Check `/admin`, or bookmark it on your phone.

## On client photos

The submission form asks for consent with a tick box before it will send. Photos
you add yourself through the admin page skip that step, so get the client's okay
before publishing something they texted you.


## Notes for whoever builds this properly

- The `BRAND` constant at the top of the script in `index.html` fills the nav, footer and
  copyright. Change one string to rename the whole site.
- Colours are CSS custom properties on `:root`, with a full dark-theme set. Nothing is
  hardcoded in a component.
- The logo is an SVG `<symbol>` — a `<mask>` over a solid rect — so it is single-colour
  safe on any background and inherits `currentColor`.
- Fonts come from Google Fonts; everything else is inline.

## Checking the rules still hold

The moderation promise is worth being able to prove rather than trust.
`firestore.rules.test.mjs` boots the local Firestore emulator and replays every
attack and every normal action against the real rules file:

```sh
npm install
npm test
```

Run it after any change to `firestore.rules`. It never touches the live project.
