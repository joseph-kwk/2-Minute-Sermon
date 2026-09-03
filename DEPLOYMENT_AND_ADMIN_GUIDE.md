# 📖 2-Minute Sermon — Complete Setup Guide
> *From local project to live ministry site, step by step.*

---

## Where Things Stand Right Now

| What | Status |
|---|---|
| Site is built and working locally | ✅ Done |
| CMS ("The Steward") is working locally | ✅ Done |
| Code is clean and production-ready | ✅ Done |
| Legal pages (Privacy Policy, Terms, Sitemap) | ✅ Done |
| GitHub repository exists | ✅ Done |
| All changes pushed to GitHub | ✅ Done |
| Site deployed and live on Firebase Hosting | ✅ Done (`minute-sermon-d8e16.web.app`) |
| Custom domain connected | ✅ Done (`2minutesermon.org` & `www.2minutesermon.org`) |
| Contact & newsletter emails being received | ✅ Done (Formspree endpoint active) |

---

## Phase 1 — Push Your Code to GitHub

> Do this at the end of every work session.

Open your terminal in the project folder and run:

```bash
git add .
git commit -m "your short note about what changed"
git push
```

That's it. Your code is backed up and ready to deploy.

---

## Phase 2 — Create an Email Endpoint (Formspree)

> This is what lets your Contact and Newsletter forms send emails to your inbox.
> **Do this before deploying**, so you have the URL ready to paste in.

### Step 1 — Create a free Formspree account
Go to **[formspree.io](https://formspree.io)** and sign up (free).

### Step 2 — Create a new form
1. Click **+ New Form**.
2. Name it `2-Minute Sermon Contact`.
3. It will give you a URL like: `https://formspree.io/f/xabcdef`
4. **Copy that URL and save it somewhere.**

> [Web3Forms.com](https://web3forms.com) works identically if you prefer it.

---

## Phase 3 — Firebase Cloud Database Setup (Free Live Cloud Sync)

> **This is what makes updates in The Steward immediately visible to visitors worldwide.**
> Takes ~5 minutes to set up, 100% free.

### Step 1 — Create a free Firebase Project
1. Go to **[console.firebase.google.com](https://console.firebase.google.com)** and sign in with your Google account.
2. Click **+ Add project** → Name it `2-Minute-Sermon` → Click **Continue**.
3. You can disable Google Analytics (optional) → Click **Create project**.

### Step 2 — Create Firestore Database
1. In your Firebase sidebar, click **Build → Firestore Database**.
2. Click **Create database** → Select a location near your primary audience (e.g. `nam5 (us-central)`).
3. Choose **Start in test mode** → Click **Create**.

### Step 3 — Get your Firebase Config keys
1. Click the **⚙️ Project Settings** gear icon in the top left sidebar.
2. Under *Your apps*, click the **Web icon (`</>`)**.
3. Register app with nickame `2-Minute Sermon Web`.
4. Copy the 6 configuration values:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

### Step 4 — Add keys to your `.env` file
In your project's `.env` file, paste the values matching these keys:

| Environment Variable Key | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Your Firebase `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Your Firebase `authDomain` |
| `VITE_FIREBASE_PROJECT_ID` | Your Firebase `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Your Firebase `storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your Firebase `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | Your Firebase `appId` |

> 💡 When you run `npm run build`, Vite automatically packages these configuration keys into your `dist/` folder so Firebase Hosting serves them seamlessly. Every sermon, daily verse, preacher, and event published in *The Steward* will now sync across the globe in real time! ✅

---

## Phase 4 — Deploy the Site

> **Firebase Hosting** is used for this project — it keeps your website and Firestore cloud database together under one roof, and includes a free SSL certificate automatically.

---

### Option A — Firebase Hosting (Recommended)

> **Keep hosting and database together in your Firebase Console.**

1. In your project terminal, build the production files:
   ```bash
   npm run build
   ```
2. Run the Firebase CLI deployment tool:
   ```bash
   npx firebase-tools login
   npx firebase-tools init hosting
   ```
   - **Select project**: Use an existing project $\rightarrow$ select your `2-Minute-Sermon` project.
   - **Public directory**: Type `dist`
   - **Single-page app**: Type `N` (since we have `index.html` and `admin.html`)
   - **Automatic builds with GitHub**: Type `N` (or `Y` if you want automatic GitHub Action deploys)
3. Deploy live with one command:
   ```bash
   npx firebase-tools deploy --only hosting
   ```

Firebase will output your live URL (e.g. `https://2-minute-sermon.web.app` or `https://2-minute-sermon.firebaseapp.com`). Site is live! ✅

---

## Phase 5 — Wire Up Email Forms & Social Links in The Steward

> **This makes Contact forms deliver to your inbox and updates your social media links.**
> Do this once after deployment (or locally first — both work).

1. Open your site → go to `/admin.html`.
2. Log in with the password you set in `VITE_ADMIN_PASSWORD`.
3. In the left sidebar, click **⚙️ Ministry Settings**.
4. Fill in:
   - **Contact Recipient Email** — where contact messages go (e.g. `pastor@yourchurch.org`)
   - **Newsletter Recipient Email** — where subscriber alerts go
   - **Form Forwarding Endpoint** — paste your Formspree URL (`https://formspree.io/f/xabcdef`)
   - **Social Channel URLs** — paste your official YouTube, Facebook, Instagram, Twitter/X, and Spotify links
5. Click **Save Ministry Settings**.

From this point on, Contact forms deliver to your inbox and footer icons link directly to your official channels. ✅

---

## Phase 6 — Connect Your Custom Domain

> **Domain registrar for this project: Squarespace** (formerly Google Domains — Google sold its domain business to Squarespace in 2023). Log in at [domains.squarespace.com](https://domains.squarespace.com) with the Google account that originally bought the domain.

### Step 1 — Add the domain in your hosting dashboard

Go to **Firebase Console → Hosting → Add custom domain** → enter your domain (e.g. `2minutesermon.org`) and the `www` version.

---

### Step 2 — Update DNS at your domain registrar

Log in to wherever you bought your domain. Find **DNS settings** and add the records provided by Firebase Console:

| Record Type | Host / Name | Firebase Hosting Target |
|---|---|---|
| **A Record** | `@` | Provided in Firebase Console (e.g. `199.36.158.100`) |
| **CNAME** | `www` | `your-app.web.app` |

> DNS takes 5 minutes to 24 hours to activate. Cloudflare/Namecheap usually take 5–15 min.

---

### Step 3 — HTTPS is automatic

Once DNS confirms, Firebase automatically provisions a free **SSL certificate**. Your site gets a padlock 🔒 and all traffic is secure. Nothing to do on your end.

---

## Phase 7 — First Admin Checklist (Do This Once Live)

Log into The Steward (`yourdomain.com/admin.html`) and go through this list:

```
[ ] 1. Log in with the password set in VITE_ADMIN_PASSWORD
[ ] 2. Go to ⚙️ Ministry Settings → paste Formspree URL + set recipient emails & social links → Save
[ ] 3. Go to Sermon Publisher → publish your first real sermon
[ ] 4. Go to Daily Verse Scheduler → schedule this week's verses
[ ] 5. Go to Preachers Manager → add at least one preacher profile
[ ] 6. Go to CMS Backup → Export a JSON backup → save it to Google Drive or email to yourself
[ ] 7. Visit your public site → submit a test Contact message
[ ] 8. Check your inbox → verify test message delivery
[ ] 9. Submit a test Newsletter signup → check inbox again
```

---

## 🔐 How Admin Auth Works

The Steward (`/admin.html`) is protected by a secure, environment-gated passphrase — no complex database or registration required.

| Setting | Details |
|---|---|
| **Current password** | Defined in `.env`: `VITE_ADMIN_PASSWORD=Serm0n$26` |
| **Live site password** | Same value must be set in `.env` before running `npm run build` |
| **Login Experience** | Aesthetic card overlay with instant feedback & shake animation on error |

> ⚠️ **Never** commit your password to GitHub. `.env` is automatically ignored by `.gitignore`.

---

### Upgrading to Individual Logins (Future, Optional)

If you eventually need each team member to have their own email + password login:

- **Firebase Authentication** can be enabled in ~15 minutes (since Firebase is already connected!).
- Each minister gets their own login email & password.
- Roles (Admin, Editor, Contributor) can be assigned per user.
- Includes password reset emails and optional two-factor authentication (MFA).

Not required now, but a seamless future upgrade path.

---

## 📦 Data & Cloud Backups

All content (sermons, verses, preachers, events) is synced to **Google Firebase Firestore** with instant browser caching (`localStorage`).

| Aspect | How it operates |
|---|---|
| **Cloud Persistence** | Google Firebase Firestore (100% free cloud database) |
| **Real-time Sync** | Updates published on any device sync across the world in < 1 second |
| **Local Cache & Fallback** | `localStorage` cache ensures instant page loads and offline resilience |

### How to export a manual safety backup
1. Log into The Steward → **CMS Backup**.
2. Click **Export Full CMS JSON**.
3. Save the JSON file to Google Drive, OneDrive, or email it to yourself.

**Recommended: Export a JSON backup whenever adding major content.**

---

## Quick Reference

| What you need | Where to go |
|---|---|
| Deploy site | Firebase Console → Hosting |
| Create email forms | [formspree.io](https://formspree.io) (free) |
| Create Cloud DB | [console.firebase.google.com](https://console.firebase.google.com) (free) |
| Set admin password | `.env` file (`VITE_ADMIN_PASSWORD`) |
| Access The Steward | `yourdomain.com/admin.html` |
| Wire contact & social | The Steward → ⚙️ Ministry Settings |
| Export a JSON backup | The Steward → CMS Backup → Export |
| Change domain DNS | Your domain registrar (GoDaddy / Namecheap / Cloudflare etc.) |

