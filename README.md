# AsthmaGuard SB

Responsive React + TypeScript demo for students and families. The dashboard uses the established dark glass theme. The existing chemistry app remains separate.

## Component sources

- **HeroUI v3:** Cards, buttons, avatars, chips, selects/listboxes, dropdown profile menu, popovers, accordion explanations, progress indicators, forms, text fields, switches, checkboxes, dialogs, skeletons, and toasts.
- **Aceternity UI:** Official Background Gradient, retrieved from https://ui.aceternity.com/registry/background-gradient.json. Only its utility import is adapted; surface colors are themed in CSS.
- **Lucide React:** UI icons. **Tabler Icons:** prebuilt lungs artwork in onboarding.
- **Recharts:** All data charts; no custom SVG paths or hand-drawn chart renderers.

Application layout and theme are CSS applied to these prebuilt components. Recharts supplies the curved AreaCharts, rounded range BarCharts, symptom BarCharts, and segmented semicircular PieChart. Nunito Sans and Outfit are served locally from `fonts/` (Google Fonts, open-source OFL families).

## Build and run

From the repository root:

```sh
npm install
node health-ui/build.mjs
node_modules/.bin/tailwindcss -i health-ui/style.css -o health-ui/dist/app.css --minify
python3 -m http.server 4321 --bind 127.0.0.1 --directory health-ui
```

Open http://127.0.0.1:4321. Rebuild after edits.

## Source

- `app.tsx`: dashboard, measurement workflow, filtered observations, session logs, care-plan and reports.
- `mock.ts`: typed sample observations and deterministic outlook/explanation logic.
- `charts.tsx`: themed Recharts compositions with tooltips, missing-data handling, and reduced-motion support.
- `style.css`: dark glass theme, responsive sidebar/bottom navigation, print styles.
- `components/background-gradient.tsx`: upstream Aceternity component.

## Demo behavior

The demo state selector previews typical, missing-data, and inconsistent readings. Measurements simulate three attempts, reject incomplete/inconsistent sets, and save usable sets to the dashboard. Logs append in memory. Filters compare explicit symptom and symptom-free logs without treating missing data as healthy days. Care plans open as local files for the session. Reports print through the browser (save as PDF) and export JSON.

Only non-sensitive demo preferences and the simulated reading persist locally. Symptoms, notes, and care files stay in memory; refresh clears them. No backend, clinical model, environmental API, or actual device is connected. The language selector saves a preference; content is currently English and a notice says so when another language is selected. Seeded observations use October 12–18, 2026.

Research prototype. Not for diagnosis, medication changes, or emergency decisions.

## Onboarding & authentication preview

- `#welcome`: four interactive chapters, opening with a pure Motion breathing scene, and distinct line, word, character, and masked text reveals.
- `#signin`, `#signup`, `#reset`: HeroUI forms with validation and password visibility.
- `#dashboard`: existing dashboard.

The first scene is lungs drawn in breathing particles: vanilla Three.js points driven by Motion's vanilla API in the style of the upstream demos archived in `motion-examples/` — a spring entrance sequence via `threeEffect`, spring-driven pointer parallax, per-particle twinkle and drift in a custom shader, and a repeating keyframe carrying the seven-second breath. On the inhale the two lobes expand and lift while airway particles stream up the trachea; on the exhale they settle and the glow between the lobes releases. A DOM cue labels the phases. The environmental scene uses prebuilt Drei CatmullRomLine components with traveling highlights along three flowing currents; environment choices change the highlighted current. Motion supplies dash progression. They contain no icon artwork, and their onboarding buttons use text labels. This is an illustrative composition, not a medical simulation.

The journal and care-plan scenes remain 2D compositions of HeroUI cards, Lucide icons, and Recharts. Reduced motion disables repeating transforms and particle movement. Earlier upstream 3D examples remain archived for provenance.

Authentication is a frontend preview: no accounts are created, no reset emails are sent, and credentials are not saved or transmitted. Forms use standard product labels and display a concise connection notice.
