# 📖 2-Minute Sermon — Complete Setup Guide
> *From local project to live ministry site, step by step.*

---

## Where Things Stand Right Now

| What | Status |
|---|---|
| Site is built and working locally | ✅ Done |
| CMS ("The Steward") is working locally | ✅ Done |
| Code is clean and production-ready | ✅ Done |
| GitHub repository exists | ✅ Done |
| All changes pushed to GitHub | ⬜ To do |
| Site deployed and live on the internet | ⬜ To do |
| Custom domain connected | ⬜ To do |
| Contact & newsletter emails being received | ⬜ To do |

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

## Phase 3 — Deploy the Site

Choose **one** option below. Both are free.

---

### Option A — Vercel (Recommended)

1. Go to **[vercel.com](https://vercel.com)** → sign in with your GitHub account.
2. Click **Add New → Project** → select **`2-Minute-Sermon`**.
3. Vercel will auto-detect Vite. Confirm:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Before clicking Deploy, add an **Environment Variable**:
   - **Key**: `VITE_ADMIN_PASSWORD`
   - **Value**: A password you choose (e.g. `MyChurch#2026`) — this is your Steward login.
5. Click **Deploy**.

Vercel gives you a free URL like `2-minute-sermon.vercel.app`. Site is live. ✅

---

### Option B — Netlify

1. Go to **[netlify.com](https://netlify.com)** → sign in with GitHub.
2. Click **Add new site → Import an existing project** → select `2-Minute-Sermon`.
3. Confirm:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Go to **Site configuration → Environment variables** → add:
   - **Key**: `VITE_ADMIN_PASSWORD`
   - **Value**: Your chosen admin password.
5. Click **Deploy site**.

---

## Phase 4 — Wire Up Your Email Forms in The Steward

> **This is what makes Contact and Newsletter forms actually deliver to your inbox.**
> Do this once after deployment (or locally first — both work).

1. Open your site → go to `/admin.html`.
2. Log in with the password you set in Phase 3.
3. In the left sidebar, click **⚙️ Ministry Settings**.
4. Fill in:
   - **Contact Recipient Email** — where contact messages go (e.g. `pastor@yourchurch.org`)
   - **Newsletter Recipient Email** — where subscriber alerts go
   - **Form Forwarding Endpoint** — paste your Formspree URL (`https://formspree.io/f/xabcdef`)
5. Click **Save Ministry Settings**.

From this point on, every Contact and Newsletter form submission is delivered to your inbox. ✅

---

## Phase 5 — Connect Your Custom Domain

> You need a domain registered somewhere (Namecheap, GoDaddy, Google Domains, Cloudflare, etc.)

### Step 1 — Add the domain in your hosting dashboard

**Vercel**: Project → **Settings → Domains → Add**
**Netlify**: Site → **Domain management → Add custom domain**

Type your domain (e.g. `2minutesermon.org`) and the `www` version.

---

### Step 2 — Update DNS at your domain registrar

Log in to wherever you bought your domain. Find **DNS settings** and add these two records:

| Record Type | Host / Name | Value — Vercel | Value — Netlify |
|---|---|---|---|
| **A** | `@` | `76.76.21.21` | `75.2.60.5` |
| **CNAME** | `www` | `cname.vercel-dns.com` | `your-site.netlify.app` |

> DNS takes 5 minutes to 24 hours to activate. Cloudflare/Namecheap usually take 5–15 min.

---

### Step 3 — HTTPS is automatic

Once DNS confirms, Vercel/Netlify auto-installs a free **SSL certificate**. Your site gets a padlock 🔒 and all traffic is secure. Nothing to do on your end.

---

## Phase 6 — First Admin Checklist (Do This Once Live)

Log into The Steward (`yourdomain.com/admin.html`) and go through this list:

```
[ ] 1. Log in with the password you set in VITE_ADMIN_PASSWORD
[ ] 2. Go to ⚙️ Ministry Settings → paste Formspree URL + set recipient emails → Save
[ ] 3. Go to Sermon Publisher → publish your first real sermon
[ ] 4. Go to Daily Verse Scheduler → schedule this week's verses
[ ] 5. Go to Preachers Manager → add at least one preacher profile
[ ] 6. Go to CMS Backup → Export a JSON backup → save it to Google Drive or email to yourself
[ ] 7. Visit your public site → submit a test Contact message
[ ] 8. Check your inbox → you should receive the test message
[ ] 9. Submit a test Newsletter signup → check inbox again
```

---

## How Admin Access Works

The Steward (`/admin.html`) uses a single shared password — no usernames or accounts needed.

| Setting | Where |
|---|---|
| **Local dev password** | `.env` file: `VITE_ADMIN_PASSWORD=YourPassword` |
| **Live site password** | Hosting dashboard → Environment Variables → `VITE_ADMIN_PASSWORD` |
| **Changing the password** | Update the environment variable → redeploy → done |

> ⚠️ **Never** put your password in code files or commit it to GitHub. `.env` is already in `.gitignore`.

---

### Upgrading to Individual Logins (Future, Optional)

If you eventually need each team member to have their own login:

- **Firebase Authentication** can be added in ~15 minutes.
- Each person gets their own email + password.
- Roles (Admin, Editor) can be assigned per user.
- Includes password reset emails and two-factor authentication (MFA).

Not needed now, but a clean upgrade path when the team grows.

---

## Data & Backups

All content (sermons, verses, preachers, events) is stored in **your browser** (localStorage).

| What this means | Impact |
|---|---|
| No database to manage | Zero server cost, simple setup |
| Data lives in the admin browser | Clearing your browser deletes it — back up regularly |
| Cross-tab sync is built in | Visitors see changes instantly without refreshing |

### How to back up
1. Log into The Steward → **CMS Backup**.
2. Click **Export Full CMS JSON**.
3. Save the file to Google Drive, OneDrive, or email it to yourself.

**Back up every time you publish new content.**

---

## Quick Reference

| What you need | Where to go |
|---|---|
| Deploy site | [vercel.com](https://vercel.com) or [netlify.com](https://netlify.com) |
| Set up email forms | [formspree.io](https://formspree.io) (free) |
| Set admin password | Hosting dashboard → Environment Variables → `VITE_ADMIN_PASSWORD` |
| Access The Steward | `yourdomain.com/admin.html` |
| Wire contact forms | The Steward → ⚙️ Ministry Settings |
| Export a backup | The Steward → CMS Backup → Export |
| Change domain DNS | Your registrar (GoDaddy / Namecheap / Cloudflare etc.) |

