# oU1TS Website Redesign Documentation

Welcome to the technical documentation for the redesigned **oU1TS Student Support Center website**.

---

## 🛠️ Architecture & Technology Stack

The oU1TS website has been redesigned from a static landing page into a modern, performance-oriented **Single Page Application (SPA)** using:
1. **Core:** Semantic HTML5, Vanilla JavaScript (ES6+).
2. **Styling:** Custom Vanilla CSS utilizing CSS Custom Variables (`:root` & `body.light-mode`) for absolute runtime design consistency and instant theme switching.
3. **Icons:** Vector rendering using **Font Awesome v6.4.0** CDN for unified branding.
4. **Visual Effects:** Canvas/DOM-based twinkling starfields and moving gradient bubbles with subtle parallax motion.

---

## 🎨 Layout & Animations

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

### 3. Responsive Drawer Menu (Mobile)
- Standard navbar links transition to a mobile hamburger toggle button on touch displays.
- Clicking the hamburger slides out a high-blur sidebar drawer (`.sidebar-menu`) with an backdrop overlay.

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

### **v2.0.0 (Redesign Milestone)**
- Migrated multi-page structures into a fluid Single Page Application (SPA).
- Relocated UITS Rationale text card to the **About** section.
- Added vertical snap-scrolling to the **Home** section.
- Added momentum-decay glide to the **Primary Projects** scroller.
- Redesigned Projects carousel into a 4-row layout supporting 4x4 (desktop) and 4x3 (mobile) cell views.
- Upgraded SVG inline icons and raw text tags to **Font Awesome v6.4.0** vector icons.
- Positioned scroller chevrons statically over the outer gutters to prevent clipping.
- Enabled dark-slate twinkling stars and bubble drift animations in **Light Mode**.
