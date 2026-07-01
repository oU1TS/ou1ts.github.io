# oU1TS Website Redesign Documentation

Welcome to the technical documentation for the redesigned **oU1TS Student Support Center website**.

---

## 🛠️ Architecture & Technology Stack

The oU1TS website operates as a performance-oriented **Single Page Application (SPA)** using:
1. **Core:** Semantic HTML5, Vanilla JavaScript (ES6+).
2. **Styling:** Custom Vanilla CSS utilizing CSS Custom Variables (`:root` & `body.light-mode`) for absolute runtime design consistency and instant theme switching.
3. **Icons:** Vector rendering using **Font Awesome v6.4.0** CDN for unified branding.
4. **Visual Effects:** Canvas/DOM-based twinkling starfields and moving gradient bubbles with subtle parallax motion.
5. **Database & Auth (Hybrid):** 
   - **Supabase Client SDK:** Leveraged for user signup, login, OAuth (Google), and profile persistence when variables are configured.
   - **Local Mock Database Fallback:** A robust, `localStorage`-backed engine that automatically seeds and runs a local database simulation if Supabase config is missing or uses default placeholders.

---

## 🎨 Layout, Navigation & Animations

### 1. Vertical Snap-Scrolling (Home Fold)
- The primary **Home** section occupies exactly `100vh`.
- Utilizes CSS properties (`scroll-snap-type: y mandatory; overflow-y: auto;`) to enable vertical snap scrolling between the main brand landing card and the quote section: `"Open source isn't just code—it's proof of your potential."`
- Seamlessly resets the scroll position to the top of the fold whenever the user clicks navigations to switch between sections.

### 2. Carousel Grid with Mouse Drag Inertia
- The **Primary Projects** grid is structured with 4 rows.
- **Desktop (>= 1000px):** Arranged in a **4x4 grid** constrained to a centralized `max-width: 1000px`.
- **Mobile (< 992px):** Arranged in a **4x3 grid** with scaled cells (`110px` tall).
- **Infinite Carousel Loop:** The projects list is rendered as three cloned sets (`[Copy 1][Copy 2][Copy 3]`). Scrolling is seamlessly repositioned at boundary crossings.
- **Inertial Momentum:** Dragging calculates scroll displacement velocity. On release, a recursive frame decay loop (`velocity *= 0.95`) glides the grid smoothly to a stop.
- **Overlaid Controls:** Circular chevron navigations (`#prevArrow` and `#nextArrow`) sit on the outer gutters, remaining fixed on screen while cells slide beneath.

### 3. Hardware-Accelerated Section Transitions
- Sections transition using a performant custom timing matching the home header intro (`sectionFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)`).
- Animates exclusively opacity (`0` to `1`) and a smooth vertical glide (`translateY(25px)` to `translateY(0)`). This matches the staggered entrance feel of the home logo while remaining fully hardware-accelerated.

### 4. Responsive Drawer Menu (Mobile)
- Standard navbar links transition to a mobile hamburger toggle button on touch displays.
- Clicking the hamburger slides out a high-blur sidebar drawer (`.sidebar-menu`) with a backdrop overlay.

### 5. Global Scrollbar Hiding
- Visual scrollbar widgets are hidden globally for all elements (`html`, `body`, and inner scrolling panels like the Projects carousel) using webkit and standard vendor overrides (`scrollbar-width: none` and `::-webkit-scrollbar { display: none; }`).
- Standard vertical and horizontal track scrolling gestures/actions remain fully functional and active.

---

## 🔐 Authentication & User Profiles (v3.0.0)

### 1. Dynamic Script Loader
To prevent blocked rendering or slow loading times when offline, dependencies are fetched asynchronously:
- **`loadEnvConfig()`**: Checks for the gitignored `env-config.js` file and loads it dynamically. If absent, it automatically defines a safe fallback with configuration placeholders.
- **`loadSupabaseScript()`**: Asynchronously injects the Supabase SDK CDN only if live configuration parameters are detected.
- If dependencies are missing or CDN loading fails, the system automatically falls back to the **Local Mock Database** without raising execution errors or blocking index rendering.

### 2. Input Validation Rules
- **Student ID:** Strictly numeric digits (enforced via regular expressions/HTML patterns).
- **Blood Group:** Enforced as uppercase alphabets followed by a positive or negative symbol (e.g., `A+`, `B-`, `O+`, `AB-`).
- **Department Options:** Supported select dropdowns include `CSE`, `IT`, `EEE`, `Civil`, `Pharmacy`, `BBA`, `English`, and `Law`.

### 3. State Synchronization
- Nav links dynamically update based on user authentication status:
  - **Logged Out:** Shows a **Login** link with a user lock icon (`fa-user-lock`) directing to the login form (`#auth`).
  - **Logged In:** Switches to a **Profile** link with a gear icon (`fa-user-gear`) directing to the profile card (`#profile`).
- **Local Scheme Guard:** `history.pushState` operations are enclosed in `try-catch` blocks to protect local browser tests (such as opening `index.html` via the `file://` protocol) from crashing due to origin constraints.

### 4. Database Schema & Setup
- The Supabase SQL script is located in [user_profile_schema.sql](file:///c:/Users/gsmur/Documents/GitHub/%5BoU1TS%5D/ou1ts.github.io/doc/idea/user_profile_schema.sql).
- A detailed guide to setting up and configuring the database tables, policies, and triggers on the Supabase dashboard can be found in [supabase_setup_guide.md](file:///c:/Users/gsmur/Documents/GitHub/%5BoU1TS%5D/ou1ts.github.io/doc/db/supabase_setup_guide.md).

---

## 🌓 Theme & Animation Variables

The background stars and floating circles dynamically transition when switching between Dark (Default) and Light modes:

| Variable | Dark Theme (Default) | Light Theme |
|---|---|---|
| `--bg-gradient` | Deep Space Indigo (`#0f0f23` to `#16213e`) | Clean Soft Slate (`#f4f6f9` to `#d8e1f0`) |
| `--star-color` | White (`#ffffff`) | Dark Slate (`#0f172a`) |
| `--star-opacity` | `1` (full visibility) | `0.5` (subtle twinkle) |
| `--circle-opacity` | `0.1` | `0.12` |
| `--circle-gradient` | Cyan to Pink glow | Soft Slate to Blue |
| `--card-shadow` | Classic soft drop shadow | High contrast Slate drop shadow |

---

## 📜 Version History

### **v3.0.0 (Authentication & Profile Milestone)**
- Introduced the **User Authentication & Profile Engine** supporting user logins, registration, profile viewing, and profile updates.
- Implemented **Local Mock Database Fallback** (storing users in `localStorage`) enabling out-of-the-box offline simulations.
- Pre-seeded local user database with a test account (`test@uits.edu.bd` / `password123`).
- Added strict format constraints for Student IDs (numeric) and Blood Groups (alphabetical + symbol).
- Added `Civil` and `IT` departments to registration forms.
- Replaced manual hash redirects with a global `window.switchTab` transition engine.
- Wrapped `pushState` in safety handlers to support local `file://` runs without console crashes.
- Implemented dynamic script loaders in `index.js` to asynchronously resolve `env-config.js` and Supabase SDK CDN dependencies.
- Synced About section "Join oU1TS" CTA button styling to match primary branding.
- Implemented hardware-accelerated fade-in/slide-up section transitions.

### **v2.0.0 (Redesign Milestone)**
- Migrated multi-page structures into a fluid Single Page Application (SPA).
- Relocated UITS Rationale text card to the **About** section.
- Added vertical snap-scrolling to the **Home** section.
- Added momentum-decay glide to the **Primary Projects** scroller.
- Redesigned Projects carousel into a 4-row layout supporting 4x4 (desktop) and 4x3 (mobile) cell views.
- Upgraded SVG inline icons and raw text tags to **Font Awesome v6.4.0** vector icons.
- Positioned scroller chevrons statically over the outer gutters to prevent clipping.
- Enabled dark-slate twinkling stars and bubble drift animations in **Light Mode**.
