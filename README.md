# Antigravity UGC Network 🚀
**International Short-Form Creator Discovery & Content Platform**

An international content discovery platform designed primarily for UGC (User Generated Content) creators and short-form video storytellers.

The platform combines the enjoyable, entertainment-first content discovery experience of social media (TikTok/Instagram Reels) with the ability to discover, connect with, and hire creative talent naturally.

---

## 🌟 Core Product Principle: Content-First, Not Marketplace-First

- **Watch First**: The homepage is an immersive, vertical short-form video feed with CSS scroll-snap, automatic play/pause, tap-to-unmute, and floating social interaction rails.
- **Fair Creator Discovery**: Creators with 300 followers have equal visibility alongside larger creators. Discovery is driven by content relevance, quality hooks, and engagement.
- **Clean Social UI**: Follower numbers, rate cards, and brand collab tags are strictly kept off the main feed to preserve the entertainment experience.
- **Natural Hiring**: Creator profiles (`/@username`) house external social reach (TikTok/IG/YouTube), platform performance records, transparent service packages (e.g. $45 30s UGC Video), and verified reviews.
- **Full Booking & Escrow Flow**: Interactive creative brief submission, milestone tracking, in-app video draft review player, revision requests, and verified reviews.
- **In-App Messaging**: Direct messaging with linked project order context.
- **Platform Administration**: Oversight dashboard for user management, verified creator badges, content moderation, and GMV revenue metrics.

---

## 📱 Mobile-First Responsive Experience

Designed specifically to be used on mobile devices just like TikTok or Instagram:
- Full-bleed vertical video feed with CSS `scroll-snap-type: y mandatory`
- Touch targets $\ge 44\text{px}$ optimized for thumb zones
- Fixed bottom mobile navigation with safe area inset support (`env(safe-area-inset-bottom)`)
- Bottom-sheet slide-up modals on mobile devices
- Responsive messaging: switch seamlessly between conversation list and active chat view with back button

---

## 👥 Extensive Test Personas & Sample Data

The platform comes pre-loaded with **16 diverse creators**, **30 vertical video posts**, **8 active bookings**, **6 brand profiles**, and **6 conversations**:

### Featured Creators to Test:
1. **Chloe Adams** (`@chloeadams`) — London, UK · Skincare & Clean Beauty · $45 - $110
2. **Marcus Chen** (`@marcuschen`) — Toronto, Canada · Tech & Gaming Gadgets · $55 - $85
3. **Elena Rostova** (`@elenarostova`) — Berlin, Germany · Fashion & Capsule Wardrobes · $40 - $90
4. **David Miller** (`@davidmiller`) — Austin, USA · Food & Beverage / Specialty Coffee · $50 - $75
5. **Sarah Jenkins** (`@sarahjenkins`) — Sydney, Australia · Fitness & Activewear · $45 - $65
6. **Amara Okonkwo** (`@amaraokonkwo`) — Lagos / London · Textured Hair & Natural Glam · $35 - $80
7. **James Park** (`@jamespark`) — Seoul / Los Angeles · Gaming Setup & Mechanical Keyboards · $60 - $120
8. **Sofia Ramirez** (`@sofiaramirez`) — Mexico City · Travel & Boutique Stays · $40 - $70
9. **Liam O'Brien** (`@liamobrien`) — Dublin, Ireland · Automotive Detailing & Supercars · $55 - $90
10. **Priya Sharma** (`@priyasharma`) — Mumbai / London · EdTech & Montessori Parenting · $30 - $60
11. **Tyler Brooks** (`@tylerbrooks`) — Miami, USA · Luxury Real Estate & Coastal Living · $75 - $200
12. **Mia Tanaka** (`@miatanaka`) — Tokyo, Japan · Japanese Home Cooking & Bento · $40 - $65
13. **Isabelle Dupont** (`@isabelledupont`) — Paris, France · Parisian Skincare (New Creator, 1.2k reach) · $25 - $45
14. **Zara Hassan** (`@zarahassan`) — Dubai, UAE · Modest Fashion & Luxury Fragrance · $50 - $95
15. **Ryan Carter** (`@ryancarter`) — Detroit, USA · Classic Muscle Cars & Garage Gear · $35 - $55
16. **Luna Martinez** (`@lunamartinez`) — Bogotá, Colombia · Handcrafted Home Décor & Ceramics · $30 - $50

---

## 🛠️ Local Development

1. Install dependencies:
```bash
npm install
```

2. Run local development server:
```bash
npm run dev
```

3. Open [http://localhost:3002](http://localhost:3002) in your browser (or use responsive device emulation in Chrome DevTools to view on mobile).

---

## 🚀 Deploying to GitHub and Render

### Step 1: Push to GitHub
1. Create a new repository on [GitHub](https://github.com/new), named `antigravity-creator-network`.
2. In your terminal inside the project directory:
```bash
git init
git add .
git commit -m "feat: complete Antigravity Creator Network platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/antigravity-creator-network.git
git push -u origin main
```

### Step 2: Deploy to Render (100% Free Tier)
1. Go to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** $\rightarrow$ **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your GitHub repository.
4. Render will automatically detect `render.yaml` or you can enter:
   - **Name**: `antigravity-creator-network`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: `Free`
5. Click **Create Web Service**. Your live URL will be active in minutes (e.g., `https://antigravity-creator-network.onrender.com`).
