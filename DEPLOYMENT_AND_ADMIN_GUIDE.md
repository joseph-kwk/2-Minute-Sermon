# 📖 2-Minute Sermon: Deployment, Domain Setup & Admin Guide

Welcome to the official deployment and operational guide for **2-Minute Sermon** and **The Steward** content management portal.

---

## 🔐 1. How Admin Accounts & Access Work

### Current Password-Gated Access (Single/Shared Admin)
By default, **The Steward** portal (`/admin.html`) is protected by a secure environment-gated passphrase.

1. **Local Development**:
   - Defined in the local `.env` file:
     ```env
     VITE_ADMIN_PASSWORD=Steward2026!
     ```
   - You can change `Steward2026!` in `.env` to any password you prefer.

2. **Production Host (Vercel / Netlify / Firebase)**:
   - In your hosting provider's dashboard under **Environment Variables**, set:
     - **Key**: `VITE_ADMIN_PASSWORD`
     - **Value**: Your chosen secret password (e.g., `MyChurchPass#2026`)
   - Any team member who visits `yourdomain.com/admin.html` and enters this password gains immediate access to publish sermons, schedule daily verses, add preachers, and manage events.

---

### Upgrading to Individual Admin Accounts (Firebase / Supabase Auth)
If your ministry expands and you require **individual email & password logins** (e.g., `pastor@2minutesermon.org`) with multi-user permissions (Super Admin, Editor, Contributor):

1. **Firebase Authentication Integration**:
   - Firebase Auth can be connected in ~15 minutes.
   - Allows creating admin users in the Firebase Console with custom claims (`role: 'admin'`).
   - Includes password reset emails, multi-factor authentication (MFA), and audit logging.

---

## 🌐 2. Step-by-Step Custom Domain Setup

### Step A: Deploy to Hosting Provider

#### Option 1: Vercel (Recommended)
1. Log in to [Vercel](https://vercel.com) using your GitHub account.
2. Click **New Project** $\rightarrow$ select **`2-Minute-Sermon`**.
3. Configure Build Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** $\rightarrow$ add `VITE_ADMIN_PASSWORD` with your desired admin password.
5. Click **Deploy**.

#### Option 2: Netlify
1. Log in to [Netlify](https://netlify.com) using your GitHub account.
2. Click **Add new site** $\rightarrow$ **Import an existing project** $\rightarrow$ select **`2-Minute-Sermon`**.
3. Build Settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Go to **Site configuration** $\rightarrow$ **Environment variables** $\rightarrow$ add `VITE_ADMIN_PASSWORD`.
5. Click **Deploy site**.

---

### Step B: Connect Your Custom Domain

1. In your host dashboard (Vercel/Netlify), navigate to **Domains** / **Custom Domains**.
2. Click **Add Domain** and enter your registered domain name (e.g., `2minutesermon.org` and `www.2minutesermon.org`).
3. Note the DNS target records provided by the host.

---

### Step C: Configure DNS at Your Registrar

Log in to your domain registrar (Namecheap, GoDaddy, Squarespace/Google Domains, Cloudflare) and set the following DNS records:

| Record Type | Host / Name | Value / Target | Notes |
| :--- | :--- | :--- | :--- |
| **A Record** | `@` (or leave blank) | `76.76.21.21` *(Vercel)* <br> or `75.2.60.5` *(Netlify)* | Points root domain |
| **CNAME Record** | `www` | `cname.vercel-dns.com` *(Vercel)* <br> or `your-app.netlify.app` *(Netlify)* | Points `www` subdomain |

---

### Step D: Automatic Free SSL (HTTPS)
- Within **2–5 minutes** of updating DNS records, Vercel/Netlify automatically provisions a free **Let's Encrypt SSL certificate**.
- Your domain will automatically enforce secure `https://` traffic with a green padlock.

---

## 📦 3. CMS Backup & Data Maintenance

- **Live LocalStorage Persistence**: Sermons, daily verses, preachers, and events persist inside the client browser.
- **Cross-Tab Synchronization**: Any changes made in *The Steward* update all open visitor browser tabs instantly.
- **1-Click JSON Backup**: Inside *The Steward* under **Export & Backup**, click **Export Full CMS JSON** to download a complete safety backup of all sermons, preachers, verses, and events.

---

## 📧 4. Contact & Newsletter Email Setup (Option A: Formspree / Web3Forms)

Static web applications (hosted on Vercel, Netlify, or Cloudflare) use lightweight serverless email forwarders to deliver contact messages and newsletter notifications straight to your inbox without requiring a custom server.

### Setup Instructions for Option A (Formspree)
1. Sign up for a free account at [Formspree.io](https://formspree.io) or [Web3Forms.com](https://web3forms.com).
2. Create a new form endpoint and set the destination email to your address (e.g. `pastor@2minutesermon.org`).
3. Copy your Formspree Endpoint URL (e.g. `https://formspree.io/f/xzy...`).
4. Log into **The Steward** (`/admin.html`) $\rightarrow$ open **⚙️ Ministry Settings**.
5. Paste your endpoint URL into **Form Forwarding Service Endpoint** and set your **Recipient Email**.
6. Click **Save Ministry Settings**.

Incoming contact submissions and newsletter signups will now be delivered straight to your email inbox!
