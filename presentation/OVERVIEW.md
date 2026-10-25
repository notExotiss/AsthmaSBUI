# AsthmaGuard presentation overview

## Purpose

AsthmaGuard helps people already managing asthma and their caregivers keep breathing readings, symptom logs, medication information, and regional air conditions together for review over time.

## Audience

People living with asthma and caregivers who want one place to record and review day-to-day information. The app supports tracking and discussion with a care team; it does not diagnose asthma or replace clinical advice.

## What the app demonstrates

| Area | What to show | Main implementation |
| --- | --- | --- |
| Summary | Current risk estimate, recent breathing and local air/weather | `app.tsx`, `environment.ts`, `charts.tsx` |
| Measure | Countdown, three sensor attempts, averaged airflow estimate, save/delete | `app.tsx`, `relay/server.mjs`, `firebase-data.ts` |
| Trends | Breathing readings, symptom severity, activity limitation, climate series | `app.tsx`, `charts.tsx`, `environment.ts` |
| Care | Medication instructions, refill dates, saved care plan | `app.tsx`, `firebase-data.ts` |
| Assistant | Ask questions about the signed-in account's saved records | `components/chat-assistant.tsx`, `functions/index.js` |
| Community | Real map geography with example report markers and zones | `app.tsx` |

## Technology

- React with TypeScript and JavaScript, built with esbuild and Tailwind CSS.
- Firebase Authentication, Firestore, Storage, and Cloud Functions.
- Arduino airflow hardware, with an authenticated Node.js relay for the hosted app.
- Open-Meteo weather and air-quality endpoints for regional humidity, PM2.5, and AQI data.
- Recharts for data visualizations and Gemini through a Firebase callable function for the account-aware chat assistant.

## Important interpretation

The airflow value is an estimate from the connected hardware, not a clinically validated spirometry result. The risk chart is a personal trend estimate, not a medically validated prediction. Some accounts have code paths that add generated history for demonstration; only readings captured from the connected device should be described as live measurements. Community-map markers and counts are illustrative, not collected reports.

See [ARCHITECTURE.md](ARCHITECTURE.md), [DEMO_RUNBOOK.md](DEMO_RUNBOOK.md), and [AI_AND_ATTRIBUTION.md](AI_AND_ATTRIBUTION.md) before recording.
