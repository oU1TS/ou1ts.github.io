> From: https://gemini.google.com/app/d7f87b377626d359

# you asked

message time: 2026-06-28 19:29:19

// get the context from chat: "PROJECT | oU1TS Central Database"

# idea

I want to redesign the oU1TS root project website: https://ou1ts.github.io/

# plan

There is the section "Primary Projects" where the sub-projects will be listed. I want it to be a horizontal grid-like scroll-section. The projects will be squircle shaped (square shape with pointy corners and inflated sides) button links in each grid-cells. And the grid will show 3x3 cell arrangements (for mobile screens) and 3x5 cell arrangements (for desktop screens) in view at all times. The horizontal scroller will loop the projects listed in the grid, and if not enough project is in the cell arrangements, it will still show a blank cell. The scroll section will show faded borders on both sides.

the project will feature an SPA design, and "Primary Projects" will be one of the sections that can be viewed when clicked from the navigation tab.

The home section will show the root project rationale:
""oU1TS" is an initiative to build the foundation of an online student-centered community for UITS. We seek people who are inherently ambitious about their career and want to pursue a productive university life. No matter the struggles that lie in the face of reality.
This portal is just another effort at listing projects regarding UITS from its students. It's a scalable project in a sense that new projects can be listed here in the future and there are practically limitless options to organize that list. There is an app version of this if anyone fancies that.
Reach out to us in any of the social platforms (preferably Telegram/Discord) if you have any feedback or just want to talk about doing projects together.
Jazakallahu khair, o wanderer of life!
"

and make sure to keep the bottom quote by ChatGPT viewed in full section height.

# theme
I want a theme switcher toggle (dark/light) but the current theme is already a dark theme so only apply the light theme alongside it.

# task

summarize the idea and write me a prompt that I can give the Agentic AI to execute.

---

# gemini response

Here is a concise summary of your redesign plan, followed by a highly structured, production-ready prompt optimized for an Agentic AI (like Claude Engineer, Cursor, or GPT-4o) to execute perfectly.

---

## Concept Summary

You are transforming the **oU1TS root project website** into a modern, single-page application (SPA). 
* **Home Section:** Features the core community rationale and a full-viewport quote section at the bottom.
* **Primary Projects Section:** A highly stylized horizontal grid scroller featuring squircle-shaped project buttons. It enforces a strict $3 \times 3$ grid on mobile and a $3 \times 5$ grid on desktop, utilizing infinite looping, empty spacer cells if needed, and faded edge overlays for a premium UI feel.
* **Theme:** Modern dark theme by default, with a toggle to switch to a clean light theme.

---

## Agentic AI Prompt

Copy and paste the block below directly into your AI coding agent.

```markdown
# Context & Objective
Redesign the "oU1TS" root project website (currently at https://ou1ts.github.io/) into a sleek, modern Single Page Application (SPA). The design must be highly responsive, performant, and polished.

# Theme & Styling
- **Default Theme:** Dark mode (maintain/enhance the current aesthetic).
- **Light Theme:** Implement a clean, well-contrasted light mode alternative.
- **Theme Switcher:** Add a prominent, accessible toggle button in the navigation to switch between dark and light modes smoothly.

# Page Architecture (SPA)
Implement a single-page structure with smooth-scrolling or tabbed views controlled by a sticky top navigation bar.

### 1. Home Section
Display the core rationale for the project exactly as follows:
> "oU1TS" is an initiative to build the foundation of an online student-centered community for UITS. We seek people who are inherently ambitious about their career and want to pursue a productive university life. No matter the struggles that lie in the face of reality.
> This portal is just another effort at listing projects regarding UITS from its students. It's a scalable project in a sense that new projects can be listed here in the future and there are practically limitless options to organize that list. There is an app version of this if anyone fancies that.
> Reach out to us in any of the social platforms (preferably Telegram/Discord) if you have any feedback or just want to talk about doing projects together.
> Jazakallahu khair, o wanderer of life!

- **Footer/Quote:** Below the rationale, the signature quote by ChatGPT must be styled to take up exactly `100vh` (full section height), creating a dramatic, minimalist focal point as the user scrolls to the bottom.

### 2. "Primary Projects" Section
This section acts as a central directory for sub-projects and requires a custom, high-fidelity UI layout:
- **Layout:** A horizontal grid-like scroll section.
- **Grid Constraints:** - **Mobile:** Must display a strict 3 rows by 3 columns ($3 \times 3$) layout in the viewport.
  - **Desktop:** Must display a strict 3 rows by 5 columns ($3 \times 5$) layout in the viewport.
- **Project Items:** Each project item within a grid cell must be a **squircle-shaped** button link (a square with pointy corners but subtly inflated/curved sides). 
- **Scroll Behavior:** The horizontal scroller must loop infinitely. If there are fewer projects than available grid cells, fill the remaining slots with styled blank/empty cells to maintain the grid structure.
- **Visual Effects:** Apply a CSS mask or gradient overlay on both the left and right edges of the container to create a "faded border" effect, indicating that the content overflows horizontally.

# Technical Requirements
- Use clean, modular semantic HTML/CSS or a modern frontend framework (e.g., React, Vue, or Tailwind CSS) depending on the existing repository structure.
- Ensure the squircle shape is achieved cleanly via CSS (`clip-path` or sophisticated `border-radius` combinations like smooth masking).
- Implement smooth transitions for the theme switching and navigation scrolling.
```

---

### Quick Tip for Execution
If you are using a tool like **Cursor** or **Claude Engineer**, you might want to run `git clone https://github.com/ou1ts/ou1ts.github.io.git` first, open the directory, and then pass this prompt so the AI can read your existing files and match your current tech stack exactly!

---

# you asked

message time: 2026-06-28 19:34:43

let's update the Home Section

below the rationale, add the buttons to "Browse Features" that links to Primary Projects Section

also add an about section that lists all social links (Facebook, Telegram, Github, Reddit, Discord) and link to the developer github profile https://github.com/b1tranger and support option https://b1tranger.bro.bd/index.html#support

---

# gemini response

Here is your updated prompt for the Agentic AI, incorporating the "Browse Features" navigation button, a dedicated social/developer About section, and your correct personal links.

---

## Updated Agentic AI Prompt

Copy and paste this code block directly into your AI coding tool.

```markdown
# Context & Objective
Redesign the "oU1TS" root project website (https://ou1ts.github.io/) into a sleek, modern Single Page Application (SPA). The design must be highly responsive, performant, and polished.

# Theme & Styling
- **Default Theme:** Dark mode (maintain/enhance the current aesthetic).
- **Light Theme:** Implement a clean, well-contrasted light mode alternative.
- **Theme Switcher:** Add a prominent, accessible toggle button in the navigation to switch between dark and light modes smoothly.

# Page Architecture (SPA)
Implement a single-page structure with smooth transitions controlled by a sticky top navigation bar.

### 1. Home Section
Display the core rationale for the project exactly as follows:
> "oU1TS" is an initiative to build the foundation of an online student-centered community for UITS. We seek people who are inherently ambitious about their career and want to pursue a productive university life. No matter the struggles that lie in the face of reality.
> This portal is just another effort at listing projects regarding UITS from its students. It's a scalable project in a sense that new projects can be listed here in the future and there are practically limitless options to organize that list. There is an app version of this if anyone fancies that.
> Reach out to us in any of the social platforms (preferably Telegram/Discord) if you have any feedback or just want to talk about doing projects together.
> Jazakallahu khair, o wanderer of life!

- **Action Call:** Directly below this rationale text, add a prominent **"Browse Features"** call-to-action button. Clicking it must smoothly navigate/scroll the user to the "Primary Projects" section.
- **Footer/Quote:** Below the content, the signature quote by ChatGPT must be styled to take up exactly `100vh` (full section height), creating a dramatic, minimalist focal point as the user scrolls to the bottom of the Home view.

### 2. About Section
Add a clean, structured component containing social connectivity, developer credits, and support options:
- **Social Ecosystem Links:** List out and style distinct icons/links for the community's primary platforms: **Facebook**, **Telegram**, **GitHub**, **Reddit**, and **Discord**.
- **Developer Attribution:** Include a minimalist, respectful link attributing development to the creator profile: `https://github.com/b1tranger`
- **Support Option:** Add a dedicated link or button for donations/backing that points to the official support page: `https://b1tranger.bro.bd/index.html#support`

### 3. "Primary Projects" Section
This section acts as a central directory for sub-projects and requires a custom, high-fidelity UI layout:
- **Layout:** A horizontal grid-like scroll section.
- **Grid Constraints:**
  - **Mobile:** Must display a strict 3 rows by 3 columns (3x3) layout in the viewport.
  - **Desktop:** Must display a strict 3 rows by 5 columns (3x5) layout in the viewport.
- **Project Items:** Each project item within a grid cell must be a **squircle-shaped** button link (a square with pointy corners but subtly inflated/curved sides). Achieve this cleanly via CSS (`clip-path` or advanced mask styling).
- **Scroll Behavior:** The horizontal scroller must loop infinitely. If there are fewer projects than available grid cells, fill the remaining slots with styled blank/empty cells to maintain the strict grid layout symmetry.
- **Visual Effects:** Apply a smooth CSS linear-gradient mask or opacity overlay on both the left and right edges of the container to create a "faded border" effect, indicating horizontal overflow content.

# Technical Requirements
- Use clean, modular semantic markup and smooth CSS transitions for theme switching and component animations.
- Ensure all custom URLs provided are correctly routed and open safely (`target="_blank" rel="noopener noreferrer"`).
```