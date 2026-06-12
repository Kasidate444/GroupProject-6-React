<div align="center">

---

## Disclaimer

All images, music, artist names, and related media used in this project belong to their respective owners and copyright holders. We do not claim ownership of any third-party content included on this website.

No copyright infringement is intended, and this project is not used for commercial purposes or profit.

If any content owner would like their material to be removed, please contact us and we will take appropriate action immediately.


รูปภาพ เพลง ชื่อศิลปิน และสื่ออื่น ๆ ทั้งหมดที่ปรากฏในเว็บไซต์นี้เป็นทรัพย์สินของเจ้าของลิขสิทธิ์และผู้ถือสิทธิ์ที่เกี่ยวข้องแต่ละราย ทางเว็บไซต์ไม่มีเจตนาอ้างสิทธิ์ความเป็นเจ้าของเนื้อหาจากบุคคลที่สามดังกล่าว

เว็บไซต์นี้จัดทำขึ้นเพื่อวัตถุประสงค์ด้านการศึกษา การพัฒนา และการสาธิตผลงานเท่านั้น มิได้มีวัตถุประสงค์เพื่อแสวงหาผลกำไรหรือใช้ประโยชน์ในเชิงพาณิชย์

หากท่านเป็นเจ้าของลิขสิทธิ์หรือผู้ถือสิทธิ์ของเนื้อหาใด ๆ ที่ปรากฏบนเว็บไซต์นี้ และประสงค์ให้ลบเนื้อหาดังกล่าว กรุณาติดต่อเรา ทางเราจะดำเนินการตรวจสอบและดำเนินการตามความเหมาะสมโดยเร็วที่สุด---

# AUDTLIST

**DROP YOUR SOUND INTO THE ZONE**

_A marketplace for independent artists — music, merch, and live streams, all in one place._

---

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?logo=socketdotio&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Pages & Routes](#pages--routes)
- [State Management](#state-management)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Team](#team)
- [Credits](#credits)
- [Disclaimer](#disclaimer)

---

## Overview

**EN:** Audtlist is a full-stack web application built as a marketplace platform for independent music artists. It lets artists upload and sell digital music (singles, albums), physical goods (vinyl, CDs, cassettes, merch), and run live stream events — all from a single platform. Fans can browse, preview, purchase, and follow artists they love.

**TH:** Audtlist คือแพลตฟอร์ม marketplace สำหรับศิลปินอิสระ ที่รวมการขายดนตรี (digital และ physical), เสื้อผ้า/ของที่ระลึก, และ live streaming ไว้ในที่เดียว แฟนๆ สามารถ browse, ฟัง preview, ซื้อสินค้า, และติดตามศิลปินได้ในแอปเดียว

---

## Features

### 🎵 Music Store

- Browse products by category: **Digital**, **Vinyl**, **CD**, **Cassette**, **T-shirt**
- Filter by genre (multi-select), free-text search
- Product detail page with audio preview and variant selection
- Cart drawer with quantity editing and real-time total calculation
- Fixed shipping cost only applied when physical items are in cart

### 💳 Checkout & Payments

- Multi-step checkout: cart review → shipping info → payment
- Two payment methods: **Credit / Debit Card** and **QR PromptPay**
- Discount code input
- Order confirmation page with order summary

### 🎤 Artist System

- Two user roles: **Fan** and **Artist**
- Artist dashboard for uploading music (singles, albums) and merch
- Public artist profile page showing releases, merch, and bio
- Follow / unfollow artists with persistent follow state

### 📻 Live Streaming

- Simulated live stream page (`/live/:id`) with video sync
- Live badge, real-time viewer count, elapsed time display
- Volume control with mute toggle
- Live chat with auto-generated messages (Socket.io)
- Prevents seeking and pausing to simulate a real broadcast

### 🔊 Audio Player

- Persistent mini player at the bottom of the screen
- Plays across page navigation
- Context-based audio state shared globally

### 👤 Authentication

- Login and registration for Fans and Artists
- Session restoration via `/auth/me` API call on load
- Forgot password flow
- Profile settings page

### 🌐 Other Pages

- Landing page: hero banner, best-sellers, daily feed, radio section, stats, featured artists
- About page with team members and company values
- Community / Club page
- Gift cards page
- Help center with article pages
- Terms & Conditions
- 404 page

---

## Tech Stack

### Frontend

| Technology        | Version | Purpose                         |
| ----------------- | ------- | ------------------------------- |
| React             | ^19.2.5 | UI framework                    |
| Vite              | ^8.0.10 | Build tool & dev server         |
| React Router DOM  | ^7.15.1 | Client-side routing             |
| Tailwind CSS      | ^4.3.0  | Utility-first CSS               |
| Socket.io-client  | ^4.8.3  | Realtime live chat              |
| Lucide React      | ^1.3.0  | Icon library                    |
| Plus Jakarta Sans | —       | Primary typeface (Google Fonts) |

### Backend (separate repository)

| Technology        | Purpose                                                      |
| ----------------- | ------------------------------------------------------------ |
| Node.js + Express | REST API server                                              |
| MongoDB           | Primary document database (users, artists, products, orders) |
| PostgreSQL        | Relational data                                              |
| Socket.io         | Realtime events (live chat, session sync)                    |

---

## Project Structure

```
GroupProject-6-React/
├── public/                        # Static assets
├── src/
│   ├── assets/                    # Images, audio files
│   │   └── landing-page/          # Landing-specific assets
│   ├── components/
│   │   ├── common/                # Shared UI (Nav, Footer, MiniPlayer, SearchBar, UserDropdown)
│   │   ├── landing/               # Landing page sections (Banner, DailyFeed, Radio, SellingList…)
│   │   └── signin/                # Auth form components (LogIn, FanRegister, ArtistRegister…)
│   ├── contexts/                  # App-level contexts (AuthContext, AudioContext, FulfillmentContext…)
│   ├── hooks/                     # Custom hooks (useAuth)
│   ├── layouts/                   # Layout wrappers (MainLayout)
│   ├── lib/
│   │   ├── api.js                 # Centralised fetch wrapper (apiGet, apiPost, apiPatch)
│   │   └── socket.js              # Socket.io client instance
│   ├── mock-db/                   # Mock data for development (users, artists, tracks, albums…)
│   ├── pages/                     # Top-level page components (Landing, About, Login, Help…)
│   ├── shop/
│   │   ├── components/
│   │   │   ├── audio/             # AudioPlayer, PlayButton
│   │   │   ├── cart/              # CartDrawer
│   │   │   ├── checkout/          # ShippingForm, PaymentMethodSelector, CreditCardForm, QRPromptPay…
│   │   │   ├── layout/            # Shop-specific Header & Footer
│   │   │   └── product/           # ProductCard
│   │   ├── context/               # Shop contexts (Cart, Wishlist, Collection, AudioPlayer, Auth)
│   │   ├── data/
│   │   │   ├── mockDb/            # Full mock dataset (artists, albums, tracks, merch, orders…)
│   │   │   ├── helpers.js         # Query/filter helpers
│   │   │   ├── liveHelpers.js     # Live stream timing utilities
│   │   │   └── constants.js       # CATEGORIES, FIXED_SHIPPING_THB, etc.
│   │   ├── pages/                 # Shop pages (Shop, ProductDetail, Checkout, Artist, Profile, Live…)
│   │   └── ShopLayout.jsx         # Layout wrapper for all shop routes
│   ├── utils/                     # Upload validation helpers
│   ├── App.jsx                    # Root component, all route definitions
│   ├── main.jsx                   # React entry point
│   ├── App.css                    # Global CSS variables (fonts, colors, spacing)
│   └── index.css                  # Base reset + dark mode variables
├── index.html
├── vite.config.js
├── vercel.json                    # SPA rewrite rule for Vercel deployment
└── package.json
```

---

## Pages & Routes

| Route                               | Component            | Description                                                    |
| ----------------------------------- | -------------------- | -------------------------------------------------------------- |
| `/`                                 | `LandingPage`        | Hero, best-sellers, daily feed, radio, stats, featured artists |
| `/login`                            | `LoginPage`          | Email + password login                                         |
| `/register/fan`                     | `FanRegisterPage`    | New fan account registration                                   |
| `/register/artist`                  | `ArtistRegisterPage` | New artist account registration                                |
| `/forgot-password`                  | `ForgotPasswordPage` | Password reset request                                         |
| `/about`                            | `About`              | Company story, team, values                                    |
| `/shop`                             | `ShopPage`           | Browse all products with filters                               |
| `/discover/:genres`                 | `ShopPage`           | Pre-filtered by genre slug(s)                                  |
| `/product/:slug`                    | `ProductDetailPage`  | Product info, audio preview, add to cart                       |
| `/checkout`                         | `CheckoutPage`       | Multi-step checkout flow                                       |
| `/order-confirmed`                  | `OrderConfirmedPage` | Post-purchase confirmation                                     |
| `/artist/:slug`                     | `ArtistPage`         | Public artist profile                                          |
| `/profile`                          | `ProfilePage`        | Fan profile & purchase history                                 |
| `/artist`                           | `ProfilePageArtist`  | Artist dashboard (upload, analytics)                           |
| `/admin`                            | `ProfilePageAdmin`   | Admin dashboard                                                |
| `/profilesetting`                   | `ProfileSetting`     | Edit profile, change password                                  |
| `/live/:id`                         | `LivePage`           | Live stream + live chat                                        |
| `/gift-cards`                       | `GiftCardsPage`      | Gift card purchase                                             |
| `/club`                             | `ClubPage`           | Community / club page                                          |
| `/help`                             | `HelpPage`           | Help centre                                                    |
| `/help/:slug`                       | `HelpArticlePage`    | Individual help article                                        |
| `/terms`                            | `TermsConditions`    | Terms of service                                               |
| `/article1` `/article2` `/article3` | `Article*Page`       | Editorial articles                                             |
| `*`                                 | `NotFoundPage`       | 404                                                            |

---

## State Management

Audtlist uses React Context for all shared state. No external state library is used.

| Context              | Location                                  | Responsibility                                                       |
| -------------------- | ----------------------------------------- | -------------------------------------------------------------------- |
| `AuthContext`        | `src/shop/context/AuthContext.jsx`        | User session, login, logout, register                                |
| `CartContext`        | `src/shop/context/CartContext.jsx`        | Cart items, totals, shipping, cart drawer open/close                 |
| `WishlistContext`    | `src/shop/context/WishlistContext.jsx`    | Saved/liked products (persisted in localStorage)                     |
| `CollectionContext`  | `src/shop/context/CollectionContext.jsx`  | User's owned products                                                |
| `AudioPlayerContext` | `src/shop/context/AudioPlayerContext.jsx` | Global audio playback state for MiniPlayer                           |
| `FollowContext`      | `src/contexts/FollowContext.jsx`          | Follow/unfollow artist state                                         |
| `FulfillmentContext` | `src/contexts/FulfillmentContext.jsx`     | Order fulfillment status overrides (cross-tab sync via localStorage) |
| `AudioContext`       | `src/contexts/AudioContext.jsx`           | App-level audio context                                              |

### API Layer

All HTTP calls go through `src/lib/api.js`:

```js
// Base URL from environment variable, defaults to http://localhost:3000/api/v1
apiGet('/auth/me')
apiPost('/auth/login', { email, password })
apiPatch('/users/me', { ... })
```

Cookies are sent with every request (`credentials: "include"`), so session management is handled server-side.

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- Backend server running (see backend repo)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd GroupProject-6-React

# Install dependencies
npm install
```

### Running in Development

```bash
npm run dev
# App available at http://localhost:5173
```

### Build for Production

```bash
npm run build
npm run preview
```

### Linting

```bash
npm run lint
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:3000
```

| Variable            | Default                 | Description                                      |
| ------------------- | ----------------------- | ------------------------------------------------ |
| `VITE_API_BASE_URL` | `http://localhost:3000` | Base URL of the backend API and Socket.io server |

---

## Team

| Name                     | Role                      |
| ------------------------ | ------------------------- |
| Akkarawin Suchaichit     | Tech Leader & Co-Founder  |
| Jinvaramas Piklunklin    | Product Lead & Co-Founder |
| Kasidate Sae-eaw         | Tech Agile Coach          |
| Thaweeratch Khongrachata | Product Designer          |
| Mata Chobmee             | Backend Engineer          |
| Piyawat Kamton           | Team Coordinator          |

---

## Credits

Special thanks and credits to the artists, platforms, and creators that inspired or were referenced in this educational project.

- Sahred Toy
- Bandcamp
- LANDOKMAI
- Season Five
- Baby monster
- Paramore
- The Cab
- Horizonsupply
- Red Hot Chili Peppers
- LAUV


---

<div align="center">

**AUDTLIST** — _Your Sound, Your Space._

© 2026 Audtlist. All rights reserved.

</div>
