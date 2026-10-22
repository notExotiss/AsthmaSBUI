# AsthmaGuard SB

Personalized asthma management system — an AI-powered concept that correlates personal symptoms with environmental triggers, physiological data, and medication usage to provide predictive risk forecasts and personalized, actionable guidance. Responsive React + TypeScript app in an Apple Health–style iOS interface with light and dark mode.

## Feature overview

- **Personalized trigger identification** — correlates timestamped symptom logs with environmental data (PM2.5, humidity, pollen), physiological readings, activity/sleep, and medication timing into individual trigger profiles with confidence levels and user feedback.
- **Predictive exacerbation forecasting** — risk level (Low/Medium/High) with confidence for the next 6–24 hours, accounting for delayed trigger responses and rescue-medication use.
- **Actionable guidance** — step-by-step recommendations scaled to risk level, plus inhaler-technique reminders and trigger-specific avoidance strategies.
- **SB healthcare integration** — South Brunswick directory (sliding-scale clinics/FQHCs, school nurse programs with consent controls, telehealth, pharmacy assistance) and one-tap emergency/crisis contacts.
- **Community health advocacy** — anonymized, aggregated hotspot maps correlated with environmental data to support township-level advocacy (tree planting, idle reduction, housing inspections). Strict privacy: opt-in, counts only.
- **Daily features** — medication tracker with refill reminders and cost-saving tips, symptom/trigger journal, multilingual support (English, Spanish, Hindi, Gujarati), pediatric/adult modes, school mode (HIPAA/FERPA-aligned), offline-first core tracking, and exportable/printable reports for provider visits.
- **Hardware (auxiliary)** — zero-cost option uses phone sensors with explicit opt-in (microphone analyzes cough/wheeze audio features without storing audio; motion/activity and light sensors); optional low-cost Bluetooth peak flow meter.

## Component sources

- **HeroUI v3:** Cards, buttons, avatars, chips, selects/listboxes, dropdown profile menu, popovers, accordion explanations, progress indicators, forms, text fields, switches, checkboxes, dialogs, skeletons, and toasts.
- **Aceternity UI:** Official Background Gradient, retrieved from https://ui.aceternity.com/registry/background-gradient.json. Only its utility import is adapted; surface colors are themed in CSS.
- **Lucide React:** UI icons throughout, including the HeartPulse brand mark.
- **Recharts:** All data charts; no custom SVG paths or hand-drawn chart renderers.

Application layout and theme are CSS applied to these prebuilt components. Recharts supplies the curved AreaCharts, rounded range BarCharts, symptom BarCharts, and segmented semicircular PieChart. Fonts are served locally from `fonts/` (Google Fonts, open-source OFL families); the UI primarily uses the system font stack.

## Build and run

From this directory:

```sh
npm install
npm run build        # esbuild bundle + Tailwind CSS
npm run serve        # python3 -m http.server 4321
```

Open http://127.0.0.1:4321. Rebuild after edits.

## Source

- `app.tsx`: app shell, Summary dashboard, forecast + guidance, measurement workflow, triggers, patterns, logs, medications, community map, care plan + SB directory, settings.
- `auth-flow.tsx`: sign in, sign up, and password reset screens with theme toggle.
- `mock.ts`: typed sample observations, trigger profiles, forecast/guidance logic, SB resources, community hotspots, medications, and translation strings.
- `charts.tsx`: themed Recharts compositions with tooltips, missing-data handling, and reduced-motion support; light/dark aware.
- `ui.tsx`: shared Panel, iOS-style Row, and GroupCard primitives.
- `theme.ts`: light/dark theme context.
- `style.css`: Apple Health–style iOS theme, light and dark palettes, responsive layout, print styles.
- `components/background-gradient.tsx`: upstream Aceternity component.

## Demo behavior

The data preview selector (Typical, Missing data, Inconsistent) exercises how the forecast and guidance respond to incomplete or inconsistent inputs. Measurements run three attempts, reject incomplete/inconsistent sets, and save usable sets to the dashboard. Logs append in memory. Filters compare explicit symptom and symptom-free logs without treating missing data as healthy days. Care plans open as local files for the session. Reports print through the browser (save as PDF) and export JSON.

Only non-sensitive preferences and the simulated reading persist locally. Symptoms, notes, and care files stay in memory; refresh clears them. No backend, clinical model, environmental API, or actual device is connected. Seeded observations use October 12–18, 2026.

Research prototype. Not for diagnosis, medication changes, or emergency decisions.

## Authentication preview

- `#signin`, `#signup`, `#reset`: HeroUI forms with validation and password visibility, plus a light/dark toggle.
- `#dashboard`: the main app.

Authentication is a frontend preview: no accounts are created, no reset emails are sent, and credentials are not saved or transmitted. Forms use standard product labels and display a concise connection notice.
