# 🎓 oU1TS - Student Support Center <span style="font-size: 0.5em;">*(Unofficial)*</span>

Welcome to the redesigned **oU1TS Student Support Center website** ([ou1ts.github.io](https://ou1ts.github.io/)), the unofficial student-centered portal and centralized ecosystem for the University of Information Technology & Sciences (UITS).

This portal is built to empower students through open-source tools, collaborative directories, academic resources, project telemetry, and a unified student authentication system.

---

## 🌟 Vision & Rationale
> *"oU1TS" is an initiative to build the foundation of an online student-centered community for UITS. We seek people who are inherently ambitious about their career and want to pursue a productive university life. No matter the struggles that lie in the face of reality.*
>
> *This portal is just another effort at listing projects regarding UITS from its students. It's a scalable project in a sense that new projects can be listed here in the future and there are practically limitless options to organize that list.*

---

## 🛠️ Tech Stack & Key Features

The primary ecosystem website operates as a high-performance, dependency-light **Single Page Application (SPA)**:

- **Core Engine:** Semantic HTML5, CSS3 Custom Properties (CSS variables), and modern Vanilla JavaScript (ES6+). Zero heavy frontend framework overhead.
- **Centralized Authentication & Profiles:** Direct Supabase client integration (`@supabase/supabase-js@2`) providing real-time user signup, login, email verification, self-service password recovery, and profile editing.
  - Form validation: Numeric student ID validation (`check_student_id_numeric_or_oauth`), Blood group validation, Department selector.
  - Mandatory profile completeness checks on login.
  - Dynamic navigation state: Desktop navbar, mobile sidebar drawer, and About Rationale CTA buttons automatically transition between `"Join oU1TS"` / `"Login"` (`#auth`) and `"Profile"` (`#profile`).
- **Profile Window Switcher & Initiatives Metrics Dashboard:**
  - Centered card-deck placement & pick-up animations (`placeDownOnCard`, `pickUpOffCard`) stacked via CSS Grid (`grid-template-areas: "card"`).
  - Real-time telemetry dashboard covering **13 primary initiatives** (Resource Archive, Question Bank, Academic Scheduler, Notice Board, Blood Donation, Dev Lab, Faculty Directory, Student Forum, Lost & Found, Campus Transit, Internship Portal, Event Radar, Course Reviews).
  - Domain-specific KPIs, health score progress indicators, operational status badges (`Operational`, `Beta Testing`, `In Development`), and direct launch links.
  - Database-backed via `public.project_metrics` with seamless offline fallback to client baseline telemetry.
  - **Mobile Initiatives Gallery Carousel & Directory Jump Modal:** Responsive single-card carousel view on mobile displays (`< 768px`) with touch-friendly previous/next buttons and serial counter (`X / 13`). Features a full-screen directory modal (`#metricsJumpModal`) with background scroll locking (`body.modal-open`) allowing instant jumping to any initiative.
  - **Responsive Protruding Action Switchers:** Elevated top-right protruding action buttons (`#profileSwitchToDashboardBtn`, `#dashboardSwitchToProfileBtn`) on mobile cards for rapid window switching, and single-row aggregate telemetry metrics for wider viewports (`>= 640px`).
- **OAuth 2.0 PKCE Flow & Deadlock-Free Auth Coordination:**
  - Full OAuth 2.0 PKCE code exchange (`exchangeCodeForSession`) for Google sign-in callbacks.
  - Synchronous `onAuthStateChange` dispatcher with deferred `setTimeout(fn, 0)` task scheduling, eliminating Supabase client deadlocks and ensuring reliable `INITIAL_SESSION` routing.
- **Custom Responsive Dropdown Listbox Engine:**
  - Viewport-contained custom glassmorphic dropdowns preventing horizontal mobile overflow.
  - Multi-line option text wrapping (up to 2 lines) for long academic department names.
  - Accessible ARIA listbox markup, keyboard navigation (Enter, Space, Escape, Arrows), and high-contrast styling across themes.
- **Design System & Theme Switching:**
  - Default Deep Space Indigo dark theme and high-contrast Slate-Blue light theme.
  - Transition-aware twinkling starfield and floating organic bubble backdrop animations.
  - Smooth glassmorphism, squircle-clipped card cells, and hardware-accelerated section fade/slide transitions.
  - Normalized section header spacing across mobile and desktop breakpoints.
- **Primary Projects Scroller & Ecosystem Links:**
  - 4-row infinite carousel grid (4x4 layout on desktop, 4x3 layout on mobile).
  - Custom touch/mouse drag inertia with physics momentum glide decay and overlaid navigation chevrons.
  - Embedded direct repository **Source Code** and rendered **Documentation** links in the About section footer.
- **Automated CI/CD & Deployment:**
  - Automated build script (`scripts/build-env.js`) injecting environment variables into `env-config.js`.
  - Zero-maintenance deployment to GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`) and Netlify (`netlify.toml`).
  - Production-ready Custom SMTP setup eliminating Supabase free-tier email rate limits.

---

## 📁 Repository Structure

```text
├── index.html                   # Main SPA entry point (Home, Projects, Repos, About, Auth, Profile)
├── index.css                    # Design system, glassmorphism, themes, animations & custom dropdowns
├── index.js                     # SPA routing, Supabase auth, profile editor, custom select & metrics engine
├── wiki.html                    # Interactive student repository showcase and directory wiki
├── netlify.toml                 # Netlify deployment configuration & automated build trigger
├── scripts/
│   └── build-env.js             # Environment injector generating env-config.js in CI/CD pipelines
├── .github/workflows/
│   └── deploy.yml               # GitHub Actions workflow for automated Pages deployment
├── doc/
│   ├── step_by_step_login_setup_guide.md  # Comprehensive end-to-end Supabase & SMTP setup guide
│   ├── history.md               # Chronological engineering changelog and release history
│   ├── db/
│   │   ├── user_profile_schema.sql        # PostgreSQL DDL for public.profiles, RLS & triggers
│   │   ├── project_metrics_schema.sql     # PostgreSQL DDL & seed data for public.project_metrics
│   │   └── supabase_setup_guide.md        # Technical architecture notes for database setup
│   └── prompts/                 # Detailed per-session conversation archives, plans & walkthroughs
└── documentation.md             # Comprehensive technical documentation & architectural specifications
```

---

## 🚀 Quick Setup & Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/oU1TS/ou1ts.github.io.git
   cd ou1ts.github.io
   ```
2. **Configure local environment (optional for Supabase live auth):**
   Create `env-config.js` in the root:
   ```javascript
   window.__ENV = {
     SUPABASE_URL: "https://<your-project-id>.supabase.co",
     SUPABASE_ANON_KEY: "<your-anon-key>"
   };
   ```
   *(See [`doc/step_by_step_login_setup_guide.md`](doc/step_by_step_login_setup_guide.md) for full database setup and SQL scripts).*
3. **Launch local server:**
   - Using VS Code: Right-click `index.html` → **Open with Live Server**.
   - Or using Node: `npx serve .`

---

## 🤝 Contributing

We welcome contributions from students, alumni, and faculty members. If you'd like to list a project, improve animations, or submit academic tools:
1. Fork this repository.
2. Create your feature branch (`git checkout -b feature/cool-feature`).
3. Commit your changes (`git commit -m "feat: Add cool feature"`).
4. Push to your branch and open a Pull Request.

---

## 💬 Community Channels
- 💬 [Telegram Group](https://t.me/s/oUITS_ORnU)
- 🎧 [Discord Server](https://discord.gg/BdmArz6FHY)
- 🌐 [Facebook Group](https://facebook.com/groups/1074592960836263/)
- 👤 Developed by: [b1tranger](https://github.com/b1tranger)

---
**Let's build a better student experience — together. 💙**
