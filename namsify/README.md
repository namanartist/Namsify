# Namsify Platinum 💎

**Namsify Platinum** is an ultra-premium, AI-powered music lifestyle platform designed for those who demand the highest fidelity in both sound and aesthetic.

## 🚀 Deployment Guide

This project is optimized for high-performance deployment on **Vercel**, **Netlify**, or any modern static hosting provider.

### 1. Deploy to Vercel (Recommended)
The easiest way to deploy Namsify Platinum is using Vercel:
1. Push your code to a GitHub/GitLab/Bitbucket repository.
2. Import the project into the [Vercel Dashboard](https://vercel.com/new).
3. Vercel will automatically detect the Next.js framework and use the `vercel.json` configuration provided.
4. Click **Deploy**.

### 2. Manual Build
To test the production build locally:
```bash
npm run build
# Then start the production server
npm run start
```

### 3. Environment Variables
Currently, Namsify Platinum is a high-fidelity frontend prototype. No external environment variables are required for the core UI. However, if you integrate a backend (e.g., Supabase or Spotify API), add them to a `.env.local` file.

## ✨ Platform Features
- **Neural Autoplay**: AI-driven queue logic that maintains acoustic flow based on artist and BPM.
- **Liquid Luxury UI**: Floating dock player, glassmorphism sidebar, and dynamic atmospheric backgrounds.
- **Sound Lab**: 10-band neural equalizer and headphone calibration.
- **Social Lounge**: Real-time collaborative listening spaces.
- **VIP Vault**: Exclusive access to stem separation and artist digital collectibles.

## 🛠 Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Animation**: Framer Motion
- **Styling**: Tailwind CSS v4 (Liquid Luxury tokens)
- **Icons**: Lucide React
- **Typography**: Playfair Display & Inter

---
Developed for the elite. Powered by Namsify.
