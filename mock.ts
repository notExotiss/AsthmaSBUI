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
  pm25: number;
  humidity: number;
  pollen: number;
  symptom: string;
  activity: string;
  night: boolean;
  reading: number | null;
};

export const observations: Observation[] = [
  { day: "Oct 12", aqi: 42, pm25: 12, humidity: 48, pollen: 2.1, symptom: "None", activity: "Indoor", night: false, reading: 424 },
  { day: "Oct 13", aqi: 78, pm25: 34, humidity: 62, pollen: 4.8, symptom: "Mild", activity: "Outdoor", night: false, reading: 416 },
  { day: "Oct 14", aqi: 91, pm25: 45, humidity: 74, pollen: 7.2, symptom: "Moderate", activity: "Outdoor", night: true, reading: 398 },
  { day: "Oct 15", aqi: 49, pm25: 15, humidity: 51, pollen: 2.6, symptom: "None", activity: "Indoor", night: false, reading: 422 },
  { day: "Oct 16", aqi: 83, pm25: 38, humidity: 68, pollen: 5.9, symptom: "Mild", activity: "Outdoor", night: false, reading: 410 },
  { day: "Oct 17", aqi: 65, pm25: 24, humidity: 58, pollen: 3.4, symptom: "Not logged", activity: "Indoor", night: false, reading: null },
  { day: "Oct 18", aqi: 86, pm25: 41, humidity: 71, pollen: 6.5, symptom: "Mild", activity: "Outdoor", night: false, reading: 412 },
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

/* ---------- 1. Personalized trigger identification ---------- */
export type TriggerProfile = {
  title: string;
  detail: string;
  confidence: number;
  evidence: string;
  tone: "rose" | "coral" | "indigo" | "mint";
};
export const triggerProfiles: TriggerProfile[] = [
  {
    title: "Air pollution (PM2.5)",
    detail: "Symptom likelihood rises when PM2.5 exceeds 30 µg/m³",
    confidence: 82,
    evidence: "4 of 5 high-PM2.5 days included symptom reports",
    tone: "rose",
  },
  {
    title: "Humidity above 70%",
    detail: "Combined with PM2.5 > 30, symptoms were 3× more likely",
    confidence: 64,
    evidence: "Both Oct 14 and Oct 18 exceeded both thresholds",
    tone: "coral",
  },
  {
    title: "Pollen during outdoor activity",
    detail: "Pollen above 5 on outdoor days preceded mild symptoms",
    confidence: 51,
    evidence: "Small sample — confidence grows as you log more days",
    tone: "indigo",
  },
  {
    title: "Nighttime waking → next-day symptoms",
    detail: "1 nighttime event was followed by reduced peak reading",
    confidence: 28,
    evidence: "Too few nighttime events to establish a pattern yet",
    tone: "mint",
  },
];

/* ---------- 2. Predictive exacerbation forecasting ---------- */
export type RiskLevel = "Low" | "Medium" | "High";
export function getForecast(mode: DemoMode, reading: number) {
  const pm25 = 41, humidity = 71, pollen = 6.5;
  let score = 0;
  if (pm25 > 30) score += 2;
  if (humidity > 70) score += 1;
  if (pollen > 5) score += 1;
  if (reading < 410) score += 1;
  if (mode === "Missing data") score = 1;
  if (mode === "Inconsistent") score = 2;
  const level: RiskLevel = score >= 4 ? "High" : score >= 2 ? "Medium" : "Low";
  const confidence = mode === "Typical" ? 74 : 41;
  return {
    level,
    confidence,
    window: "next 6–24 hours",
    drivers: [
      `Regional PM2.5 at ${pm25} µg/m³ (above your 30 µg/m³ threshold)`,
      `Humidity at ${humidity}% (above your 70% threshold)`,
      `Pollen index ${pollen} (elevated for this season)`,
      reading < 410
        ? `Latest reading ${reading} a.u. is below your 420 baseline`
        : `Latest reading ${reading} a.u. is near your 420 baseline`,
    ],
    delayedNote:
      "Effects of today's exposure can appear 6–24 hours later. The model accounts for delayed responses when enough history exists.",
  };
}

/* ---------- 3. Personalized, actionable guidance ---------- */
export const guidance: Record<RiskLevel, { headline: string; steps: string[] }> = {
  Low: {
    headline: "Your asthma is well-controlled today. Continue preventive meds as prescribed.",
    steps: [
      "Take preventive medication as prescribed",
      "Keep your normal activity plans",
      "Log symptoms tonight — it sharpens your profile",
    ],
  },
  Medium: {
    headline: "Elevated risk detected. A few precautions can help.",
    steps: [
      "Use preventive inhaler before known exposures",
      "Avoid strenuous outdoor activity today",
      "Increase symptom monitoring — watch for nighttime waking",
    ],
  },
  High: {
    headline: "High risk of symptoms predicted. Recommended actions:",
    steps: [
      "Use rescue inhaler as prescribed now",
      "Avoid known triggers — stay indoors if possible",
      "Contact your healthcare provider if symptoms worsen",
      "Consider a telehealth visit",
    ],
  },
};

export const inhalerSteps = [
  "Shake the inhaler 5–6 seconds",
  "Exhale fully, away from the mouthpiece",
  "Seal lips around the mouthpiece, start slow deep breath",
  "Press canister once, keep breathing in slowly",
  "Hold breath 10 seconds, then exhale",
  "Wait 30–60 seconds between puffs",
];

/* ---------- 4. SB-specific healthcare integration ---------- */
export type SBResource = {
  name: string;
  category: string;
  detail: string;
  phone: string;
  note: string;
};
export const sbResources: SBResource[] = [
  { name: "South Brunswick Family Health", category: "Sliding-scale clinic", detail: "FQHC · Sliding-scale fees · 3.2 mi", phone: "(732) 329-4000", note: "Accepts walk-ins Thu–Fri" },
  { name: "SB High School Health Office", category: "School nurse program", detail: "Asthma action plans on file · Consent required", phone: "(732) 329-4044", note: "Shares info only with your consent (FERPA)" },
  { name: "Middlesex Respiratory Telehealth", category: "Telehealth", detail: "Same-day video visits · Most insurance", phone: "(844) 555-0134", note: "Avg. wait 12 minutes" },
  { name: "Kendall Park Pharmacy", category: "Pharmacy & assistance", detail: "Prescription savings program enrolled", phone: "(732) 297-1200", note: "Ask about generic budesonide options" },
];
export const emergencyContacts = [
  { name: "Emergency services", detail: "Fire · Police · Medical", phone: "911" },
  { name: "NJ Poison Center", detail: "24/7 exposure guidance", phone: "1-800-222-1222" },
  { name: "SB Crisis Line", detail: "Mobile response team", phone: "(732) 329-4321" },
];

/* ---------- 5. Community health advocacy (anonymized) ---------- */
export type Hotspot = { zone: string; reports: number; aqi: number; note: string };
export const hotspots: Hotspot[] = [
  { zone: "Route 1 corridor", reports: 34, aqi: 94, note: "Supports tree-planting case for high-traffic corridors" },
  { zone: "Near SB High School", reports: 21, aqi: 81, note: "Evidence for idle-reduction policy near schools" },
  { zone: "Kingston Rd apartments", reports: 17, aqi: 77, note: "Housing inspection program — mold/moisture reports" },
  { zone: "Heathcote / Route 522", reports: 9, aqi: 63, note: "Baseline zone for comparison" },
];
export const advocacyPoints = [
  "Anonymized, aggregated counts only — no individual data is ever shared without explicit consent.",
  "Community patterns are correlated with public environmental data to support township-level advocacy.",
  "You can opt out of community contribution at any time in Settings.",
];

/* ---------- 6. Practical daily features ---------- */
export type Medication = {
  name: string;
  type: "Preventive" | "Rescue";
  schedule: string;
  refillsLeft: number;
  refillBy: string;
  techniqueTip: string;
};
export const medications: Medication[] = [
  { name: "Fluticasone (Flovent HFA)", type: "Preventive", schedule: "2 puffs · morning & evening", refillsLeft: 1, refillBy: "Nov 2", techniqueTip: "Rinse mouth after use to reduce thrush risk" },
  { name: "Albuterol (ProAir HFA)", type: "Rescue", schedule: "As needed · max 2 puffs/4 hrs", refillsLeft: 0, refillBy: "Overdue — Oct 9", techniqueTip: "Use spacer if coordination is difficult" },
];
export const costTips = [
  "GoodRx shows fluticasone generic at $38/mo near Kendall Park — ask your pharmacy to match.",
  "Albuterol HFA has a manufacturer coupon; the generic saves ~$25 per inhaler.",
  "Ask about a 90-day preventive supply — most plans discount it 20–30%.",
];

export const languages = ["English", "Spanish", "Hindi", "Gujarati"] as const;
export type Language = (typeof languages)[number];

type Dict = Record<string, string>;
const t: Record<Language, Dict> = {
  English: {},
  Spanish: {
    Summary: "Resumen", "Take a Measurement": "Tomar una medición",
    "Personal Patterns": "Patrones personales", "Symptom & Medication Log": "Registro de síntomas",
    "Care Plan & Reports": "Plan de cuidado", Triggers: "Desencadenantes", Community: "Comunidad",
    Today: "Hoy", Highlights: "Aspectos destacados", Trends: "Tendencias",
    "Risk Level": "Nivel de riesgo", "Recommended actions": "Acciones recomendadas",
    "Sign in": "Iniciar sesión", "Create account": "Crear cuenta",
  },
  Hindi: {
    Summary: "सारांश", "Take a Measurement": "माप लें",
    "Personal Patterns": "व्यक्तिगत पैटर्न", "Symptom & Medication Log": "लक्षण और दवा जर्नल",
    "Care Plan & Reports": "देखभाल योजना", Triggers: "ट्रिगर", Community: "समुदाय",
    Today: "आज", Highlights: "मुख्य बातें", Trends: "रुझान",
    "Risk Level": "जोखिम स्तर", "Recommended actions": "अनुशंसित कार्य",
    "Sign in": "साइन इन", "Create account": "खाता बनाएं",
  },
  Gujarati: {
    Summary: "સારાંશ", "Take a Measurement": "માપન લો",
    "Personal Patterns": "વ્યક્તિગત પેટર્ન", "Symptom & Medication Log": "લક્ષણ અને દવા જર્નલ",
    "Care Plan & Reports": "સંભાળ યોજના", Triggers: "ટ્રિગર", Community: "સમુદાય",
    Today: "આજે", Highlights: "મુખ્ય બાબતો", Trends: "વલણો",
    "Risk Level": "જોખમ સ્તર", "Recommended actions": "સૂચિત ક્રિયાઓ",
    "Sign in": "સાઇન ઇન", "Create account": "એકાઉન્ટ બનાવો",
  },
};
export function tr(lang: Language, key: string) {
  return t[lang]?.[key] || key;
}

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
        ? "Higher than the previous update"
        : "No new estimate available",
    inputs: [
      "Regional PM2.5 is 41 µg/m³, above your 30 µg/m³ threshold.",
      "Mild symptoms were logged on October 18.",
      `Latest reading: ${reading} arbitrary units.`,
    ],
    missing:
      mode === "Missing data"
        ? ["Latest environmental update", "Recent symptom check-in", "Recent measurement"]
        : ["No personal pollen exposure measurement", "One symptom log missing this week"],
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
    `${getOutlook(mode, reading).change}. The model uses regional PM2.5 of 41 µg/m³, the latest symptom log, and a reading of ${reading} arbitrary units. This is not a clinical forecast.`,
    `${getOutlook(mode, reading).missing.join("; ")}. Unrecorded days are unknown, not symptom-free.`,
    "In the seven-day sample, 4 higher-pollution days have symptom reports, while 2 lower-pollution days were explicitly logged symptom-free. One day has no symptom entry. The sample is too small to establish cause.",
    `There are ${logCount} entries in this session. Readings ranged from 398 to 424 arbitrary units in the seven-day sample. One day is missing a measurement and symptom entry.`,
  ][index];
}
