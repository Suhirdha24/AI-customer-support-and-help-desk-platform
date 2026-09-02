# 🚀 Public Cloud Deployment Guide

This guide walks you through deploying the **AI Customer Support & Helpdesk Platform** to the public internet so users anywhere in the world can access it from their laptops, tablets, or smartphones and log into their respective portals (**Admin**, **Agent**, **Customer**).

---

## 🏗️ Architecture Overview

The platform uses a standard production 3-tier architecture:
1. **Cloud Database (Free Tier)**: **MongoDB Atlas** (persistent, secure, automated backups).
2. **Backend API**: **Render.com** (Node.js/Express service, auto-deploying from GitHub).
3. **Frontend Client**: **Render Static Site** or **Vercel** (React SPA on global CDN with SSL).

---

## 📋 Step 1: Create a Free MongoDB Atlas Database (~3 Minutes)

Since your current database runs locally on your PC (`mongodb://127.0.0.1:27017`), a cloud database is needed so your deployed backend can access your data.

1. **Sign Up**: Go to [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register) and create a free account.
2. **Create Cluster**: Select the **M0 Free Cluster** (Shared, 512 MB Storage — free forever).
3. **Set Database User**:
   - Username: `nexusdesk_user`
   - Password: `YourSecurePassword123!` (save this somewhere safe).
4. **Configure Network Access**:
   - In Atlas, navigate to **Network Access** in the left sidebar.
   - Click **Add IP Address** -> Select **Allow Access from Anywhere** (`0.0.0.0/0`).
   - Click **Confirm** (this allows Render cloud servers to connect).
5. **Get Connection String**:
   - Go to **Database** -> Click **Connect** -> Choose **Drivers** (Node.js).
   - Copy the connection string. It will look like:
     ```text
     mongodb+srv://nexusdesk_user:<password>@cluster0.xxxxx.mongodb.net/ai_helpdesk?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual database user password.

---

## 🌱 Step 2: Seed Cloud Database with Demo Accounts

Before launching the web service, populate your new MongoDB Atlas cluster with the default Admin, Agent, and Customer users:

1. Open your terminal in `c:\customer support`.
2. Run the seed script pointing to your MongoDB Atlas connection string:
   ```bash
   MONGODB_URI="mongodb+srv://nexusdesk_user:YourSecurePassword123!@cluster0.xxxxx.mongodb.net/ai_helpdesk?retryWrites=true&w=majority" npm --prefix server run seed
   ```
   *(On Windows PowerShell, run:)*
   ```powershell
   $env:MONGODB_URI="mongodb+srv://nexusdesk_user:YourSecurePassword123!@cluster0.xxxxx.mongodb.net/ai_helpdesk?retryWrites=true&w=majority"
   npm --prefix server run seed
   ```
3. You will see:
   ```text
   ✅ Successfully seeded 1 Admin, 3 Agents, 5 Customers, categories, and tickets!
   ```

---

## 🌐 Step 3: Deploy Backend API to Render

1. Sign in to [dashboard.render.com](https://dashboard.render.com) using your GitHub account (`Suhirdha24`).
2. Click **New +** in the top right and select **Web Service**.
3. Select your repository: `AI-customer-support-and-help-desk-platform`.
4. Configure the settings:
   - **Name**: `nexusdesk-api` (or any custom name)
   - **Region**: Select closest to you (e.g. Frankfurt, Oregon, Singapore)
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: `Free`
5. Click **Advanced** and add the following **Environment Variables**:
   | Key | Value | Notes |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production optimizations |
   | `PORT` | `5000` | Render internal port |
   | `MONGODB_URI` | *(Your MongoDB Atlas connection string from Step 1)* | Cloud DB connection |
   | `JWT_SECRET` | `helpdesk_super_secret_jwt_key_minimum_32_chars_2026` | Auth encryption key |
   | `JWT_EXPIRES_IN` | `7d` | Session lifespan |
   | `CLIENT_URL` | `*` | Allows your frontend to communicate |
   | `STORAGE_PROVIDER` | `local` | Attachment storage |
   | `UPLOAD_DIR` | `./uploads` | Upload directory |
6. Click **Deploy Web Service**.
7. Wait ~2 minutes. Render will provide your live API URL (e.g. `https://nexusdesk-api.onrender.com`).
   - You can test it in your browser: `https://nexusdesk-api.onrender.com/api/health` should return `{"status":"healthy"}`.

---

## 💻 Step 4: Deploy Frontend Client to Render (or Vercel)

### Option A: Deploy on Render Static Site (Easiest)
1. On Render dashboard, click **New +** -> **Static Site**.
2. Select the repository: `AI-customer-support-and-help-desk-platform`.
3. Configure settings:
   - **Name**: `nexusdesk`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL`: `https://nexusdesk-api.onrender.com/api` *(replace with your actual Step 3 API URL)*
5. Add Redirect/Rewrite Rule:
   - Click **Redirects/Rewrites**:
     - Source: `/*`
     - Destination: `/index.html`
     - Action: `Rewrite`
6. Click **Create Static Site**.
7. In ~60 seconds, your site is live! (e.g. `https://nexusdesk.onrender.com`).

---

### Option B: Deploy on Vercel (Alternative)
1. Go to [vercel.com](https://vercel.com) and import the repository.
2. In Project Settings:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://nexusdesk-api.onrender.com/api`
4. Click **Deploy**. Vercel will give you a live URL like `https://nexusdesk.vercel.app`.

---

## ⚡ Option 5 (Instant): Share Live HTTPS URL Right Now (Localtunnel)

If you want an instant live URL to test right now on your mobile phone or share with colleagues without setting up MongoDB Atlas yet:

1. Install `localtunnel`:
   ```powershell
   npx localtunnel --port 5173
   ```
2. Localtunnel will generate a public URL like:
   ```text
   your url is: https://modern-support-demo.loca.lt
   ```
3. Open that link on your smartphone or send it to anyone!

---

## 🔑 Default Production Login Credentials

Once deployed, anyone can log in with:

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@example.com` | `Password123!` |
| **Support Agent** | `agent1@example.com` | `Password123!` |
| **Customer** | `customer1@example.com` | `Password123!` |

*(Or new users can click **Register as a Customer** to create their own accounts immediately).*
