# Setting up the gallery

The gallery runs on Firebase. Photos go into Firestore documents as text, so
there is **no Cloud Storage bucket and no credit card** — the whole thing sits
inside the free Spark plan.

Roughly 20 minutes, once.

---

## How it works

```
   client fills in the form on /gallery
              │
              ▼
   Firestore document, status: "pending"      ← rules will not accept any other status
              │
              ▼
   you open /admin.html and press Approve      ← rules only let YOUR account do this
              │
              ▼
   status: "approved" → appears in the gallery and the home page collage
```

The guarantee lives in `firestore.rules`, which Firebase enforces on its own
servers. Someone editing the site's JavaScript in their browser, or calling the
API directly with curl, still cannot publish anything or read the pending queue.

---

## 1. Create the Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and
   sign in with **milner.turei@gmail.com**.
2. **Create a project** → name it `doggy-development`.
3. Google Analytics is optional. You don't need it. Skip it.

## 2. Turn on Firestore and Google sign-in

**Firestore:** left sidebar → **Build → Firestore Database → Create database**.

- Start in **production mode** (the rules in this repo replace the defaults anyway).
- Location: **`australia-southeast1`** (Sydney) — closest to Auckland, so the
  site feels fast for your clients.

**Authentication:** left sidebar → **Build → Authentication → Get started** →
**Google** → toggle **Enable** → set the support email to yours → **Save**.

That's the only sign-in method you need. It's just for you.

## 3. Register the web app and copy the config

1. Project **Settings** (the gear, top left) → scroll to **Your apps** →
   click the **web** icon `</>`.
2. Nickname: `website`. **Don't** tick Firebase Hosting yet.
3. Firebase shows you a `firebaseConfig = { ... }` block. Copy what's inside
   the braces.
4. Open **`firebase-config.js`** in this repo and paste it in, uncommenting the
   lines:

```js
export const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "doggy-development.firebaseapp.com",
  projectId: "doggy-development",
  storageBucket: "doggy-development.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123"
};
```

> **These are not secrets.** Firebase web config identifies your project, it
> doesn't grant access to it. Every Firebase site on the internet ships these
> values in plain sight. What protects your data is `firestore.rules`. It is
> completely fine that this file sits in a public GitHub repo.

## 4. Install the Firebase CLI and deploy the rules

```sh
npm install -g firebase-tools
firebase login
cd path/to/doggy-development
firebase use --add          # pick the project, call the alias "default"
firebase deploy --only firestore
```

That last command uploads `firestore.rules` and `firestore.indexes.json`.

## 5. Make yourself the admin

Firebase doesn't know who you are until you've signed in once.

1. Serve the site locally:
   ```sh
   firebase serve --only hosting
   ```
   (Or `python3 -m http.server 8000`. You do need a server — the pages use ES
   modules, which browsers refuse to load from a plain `file://` path.)

2. Open **`/admin.html`** and click **Sign in with Google**.

3. You'll be told the account isn't the admin yet, and shown your user ID.
   Copy it.

4. Paste it into **`firestore.rules`**, replacing `PASTE_YOUR_FIREBASE_UID_HERE`:

   ```
   function isAdmin() {
     return request.auth != null
         && request.auth.uid in [
              'kJ8sQ2mNpXcYvB4hL9wR3tZa1Ef2'
            ];
   }
   ```

5. Push the change and reload:
   ```sh
   firebase deploy --only firestore:rules
   ```

The admin page should now show the queue. That's it — you're set up.

## 6. Deploy the site

```sh
firebase deploy --only hosting
```

Your site is live at `https://doggy-development.web.app`. Add
`doggydevelopment.co.nz` later under **Hosting → Add custom domain**.

---

## Signing in with a password

The admin page takes either Google **or** an email and password. Both land on the
same Firebase account, so the UID in `firestore.rules` keeps working and nothing
needs redeploying.

**Turn the provider on, once:**

1. Firebase console → **Security → Authentication → Sign-in method**
2. Enable **Email/Password**. Leave "Email link (passwordless sign-in)" off.
3. **Important:** in **Authentication → Settings → User actions**, tick
   **Prevent new users from signing up**. Otherwise anyone on the internet can
   create an account on your project. They'd get nothing — the rules only trust
   your UID — but there's no reason to leave the door open.

**Then set your password:**

Sign in to `/admin` with Google as usual. A **Set a password** panel appears at
the top. Choose something long that you use nowhere else and save it. The panel
disappears once the password exists, and from then on either method works.

That password is the key to your clients' phone numbers. Treat it accordingly —
a password manager is the right home for it, not a note on your phone.

If you forget it, **Forgot password** on the sign-in screen emails you a reset
link, and signing in with Google always works as a way back in.

---

## Using it

**`/admin.html`** is the whole job. Bookmark it on your phone.

- **Waiting for you** — everything clients have submitted. Each shows the photo,
  name, breed, suburb, story and when it arrived. **Approve** puts it on the
  site immediately. **Reject** deletes it.
- **Add a dog yourself** — for photos clients text you. Publishes straight away.
  Get their okay first; the public form asks for consent with a tick box, but a
  photo someone texted you hasn't been through that.
- **Live on the site** — everything currently public, so you can take something
  down if a client asks.

The three newest approved photos also fill the tiles in the home page hero, so
the front page stays current on its own.

---

## What this costs

Nothing, and it can't start costing without you deliberately upgrading.

The Spark plan gives you 50,000 document reads and 20,000 writes a day, and 1 GiB
of storage. Each photo is compressed in the browser to well under 150 KB before
it's sent, so 1 GiB is room for something like 8,000 dogs. Loading the whole
gallery costs about 40 reads.

You'll use a rounding error of the free tier.

---

## The one loose end: submission spam

Anyone can submit to the form — that's the point of it. The rules keep each
submission small and well-formed (one image under 400 KB, four short text
fields, always pending), so the damage a bad actor can do is limited to filling
your queue with rubbish you then delete.

**There is no billing risk.** On the Spark plan there is no card attached. If
someone did hammer the form, you'd hit the daily write limit and submissions
would stop working until the next day. Annoying, not expensive.

If it ever actually happens, turn on **App Check**:

1. Firebase console → **Build → App Check → Register** your web app with
   **reCAPTCHA v3**.
2. Add the App Check SDK to `index.html` (three lines — ask and I'll wire it up).
3. Set Firestore to **Enforce**.

That blocks anything that isn't a real browser on your real site. It's not worth
doing pre-emptively for a North Shore dog-walking round, but it's there.

---

## If something breaks

**"Missing or insufficient permissions" in the browser console**
The rules are doing their job and something doesn't match. Check that your UID
in `firestore.rules` is right and that you ran `firebase deploy --only
firestore:rules` afterwards.

**The gallery shows example dogs with an "Example" tag**
Either `firebase-config.js` is still empty, or there are no approved dogs yet.
Both are normal early on.

**"The query requires an index"**
Run `firebase deploy --only firestore:indexes`. The console error also carries a
direct link that builds it for you.

**Nothing loads and the console mentions CORS or modules**
You've opened the file directly instead of through a server. Use
`firebase serve` or `python3 -m http.server 8000`.

**Sign-in popup closes immediately**
Add the domain you're using to **Authentication → Settings → Authorised
domains**. `localhost` is there by default.
