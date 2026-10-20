export type DemoMode = "Typical" | "Missing data" | "Inconsistent";
export type LogEntry = {
  id: number;
  time: string;
  severity: string;
  night: string;
  limitation: string;
  exposure: string;
  medication: string;
  notes: string;
};
export type Observation = {
  day: string;
  aqi: number;
  symptom: string;
  activity: string;
  night: boolean;
  reading: number | null;
};
export const observations: Observation[] = [
  {
    day: "Oct 12",
    aqi: 42,
    symptom: "None",
    activity: "Indoor",
    night: false,
    reading: 424,
  },
  {
    day: "Oct 13",
    aqi: 78,
    symptom: "Mild",
    activity: "Outdoor",
    night: false,
    reading: 416,
  },
  {
    day: "Oct 14",
    aqi: 91,
    symptom: "Moderate",
    activity: "Outdoor",
    night: true,
    reading: 398,
  },
  {
    day: "Oct 15",
    aqi: 49,
    symptom: "None",
    activity: "Indoor",
    night: false,
    reading: 422,
  },
  {
    day: "Oct 16",
    aqi: 83,
    symptom: "Mild",
    activity: "Outdoor",
    night: false,
    reading: 410,
  },
  {
    day: "Oct 17",
    aqi: 65,
    symptom: "Not logged",
    activity: "Indoor",
    night: false,
    reading: null,
  },
  {
    day: "Oct 18",
    aqi: 86,
    symptom: "Mild",
    activity: "Outdoor",
    night: false,
    reading: 412,
  },
];
export const initialLogs: LogEntry[] = observations
  .filter((o) => o.symptom !== "Not logged")
  .map((o, i) => ({
    id: i,
    time: `2026-10-${12 + i + (i === 5 ? 1 : 0)}T18:00`,
    severity: o.symptom,
    night: o.night ? "Yes" : "No",
    limitation: o.symptom === "Moderate" ? "Some" : "None",
    exposure: o.activity === "Outdoor" ? "Outdoor air" : "None noted",
    medication: "Recorded as prescribed",
    notes: "Sample entry",
  }));
export function getOutlook(mode: DemoMode, reading: number) {
  return {
    headline:
      mode === "Missing data"
        ? "Not enough recent information for an outlook."
        : mode === "Inconsistent"
          ? "Outlook paused until a usable measurement is available."
          : "Elevated likelihood of increased symptoms at your next check-in.",
    change:
      mode === "Typical"
        ? "Higher than the previous simulated update"
        : "No new estimate available",
    inputs: [
      "Regional demo AQI is 86, compared with 65 yesterday.",
      "Mild symptoms were explicitly logged on October 18.",
      `Latest usable prototype reading: ${reading} arbitrary units.`,
    ],
    missing:
      mode === "Missing data"
        ? [
            "Latest environmental update",
            "Recent symptom check-in",
            "Recent prototype measurement",
          ]
        : [
            "No personal pollen exposure measurement",
            "One symptom log missing this week",
          ],
    limitations:
      "A deterministic demonstration, not a validated clinical model. Regional conditions may differ from personal exposure. Associations do not establish cause.",
  };
}
export function answerQuestion(
  index: number,
  mode: DemoMode,
  reading: number,
  logCount: number,
) {
  return [
    `${getOutlook(mode, reading).change}. The demo uses regional AQI of 86, the latest sample symptom log, and a prototype reading of ${reading} arbitrary units. This is not a clinical forecast.`,
    `${getOutlook(mode, reading).missing.join("; ")}. Unrecorded days are unknown, not symptom-free.`,
    "In the seven-day sample, 4 higher-pollution days have symptom reports, while 2 lower-pollution days were explicitly logged symptom-free. One day has no symptom entry. The sample is too small to establish cause.",
    `There are ${logCount} entries in this session, including seeded demo logs. Prototype readings ranged from 398 to 424 arbitrary units in the seven-day sample. One day is missing a measurement and symptom entry.`,
  ][index];
}
