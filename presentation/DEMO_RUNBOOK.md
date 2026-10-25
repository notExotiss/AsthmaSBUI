# Demo runbook

The Congressional App Challenge demonstration video must be **1–3 minutes**. This run order targets about 2:40 and prioritizes the purpose, audience, working features, and technical implementation.

## Before recording

- Use the account and device you intend to show. Confirm that its history is genuinely recorded or clearly identify any generated history as example data.
- Keep the Arduino powered and reachable on the same local network as the relay host. Confirm its `/airflow` endpoint returns JSON with numeric `pressure_pa`, `air_velocity_ms`, and `estimated_flow_lpm` fields.
- Start the Node relay with `npm run relay`. For the hosted website or phone PWA, the relay must have a reachable HTTPS address and the app must be built with `VITE_AIRFLOW_URL` set to that address. A temporary tunnel address stops working when its tunnel process stops; keep the relay host awake and online during the demo.
- Confirm sign-in, Firestore reads/writes, the sensor connection, Open-Meteo data, and the desired pages before recording. Do not show API keys, account emails, personal health records, or private configuration.
- The Community map uses real map geography but its points/counts are illustrative. Say so if that page is shown.
- The New Jersey Department of Health's asthma counts reflect cases diagnosed by a health professional and reported by survey respondents; don't present them as a count of undiagnosed cases.

## Suggested recording sequence

| Time | Screen/action | Speaker cue |
| --- | --- | --- |
| 0:00–0:25 | Show the app and Summary | State the New Jersey problem/statistic, app purpose, and intended audience. Cite the source in the submission notes. |
| 0:25–0:50 | Open Measure and run the countdown and three tests | Show the connected device, units, and three-test average. Use a real sensor reading. |
| 0:50–1:15 | Open Trends | Point out breathing values over time alongside the logs entered by the user. |
| 1:15–1:40 | Show Climate and Risk | Identify PM2.5, AQI, humidity, and the estimated 24-hour trend. Describe it as an estimate, not a diagnosis. |
| 1:40–2:00 | Show Care | Point to medication instructions, refill dates, and the saved care plan. |
| 2:00–2:18 | Show the assistant and language picker | Explain that chat summarizes saved account records and supports English, Spanish, Hindi, and Gujarati. |
| 2:18–2:30 | Show the map only if time permits | Explain that map markers and counts are illustrative. |
| 2:30–2:40 | Close on the logo | Restate the app's purpose in one short sentence. |

## Source notes for the opening

- New Jersey counts (more than 600,000 adults and 167,000 children): [New Jersey Department of Health](https://www.nj.gov/health/fhs/chronic/asthma/in-nj/) and the [News 12 New Jersey report](https://newjersey.news12.com/fall-is-the-toughest-time-for-asthma-sufferers-heres-how-to-stay-ahead-of-symptoms).
- Adult asthma-management-plan estimate (New Jersey, 2024): [CDC BRFSS Asthma Call-back Survey, Table 4](https://www.cdc.gov/brfss/acbs/2024/prevalence_tables/table4_LLCP.html). The table reports 27.5% for adults with current asthma.
- Environmental API attribution: [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api) and [Open-Meteo Forecast API](https://open-meteo.com/en/docs).

## Build and local preview

1. Copy `.env.example` to `.env.local` and enter the project's Firebase web configuration there. Never commit `.env.local`.
2. Install dependencies with `npm install`.
3. Set `VITE_AIRFLOW_URL` to the endpoint the app should call, then build with `npm run build`.
4. Run `npm run serve` and open `http://localhost:4321`.
5. Run the relay separately with `npm run relay` when demonstrating the Arduino. The hosted site needs an HTTPS relay address; serving the static app locally does not itself expose the Arduino.

## If something fails

- If Measure cannot connect, verify the Arduino endpoint first, then the relay, then the built `VITE_AIRFLOW_URL`. Rebuild after changing that variable.
- If the personal risk trend says there is not enough history, the implementation requires at least 14 days with symptom logs. Do not invent a prediction or claim the model is clinically validated.
- If an API or Firebase service is down, skip that feature rather than narrating it as working.
