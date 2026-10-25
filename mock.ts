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
    "Where this forecast comes from": "De dónde viene este pronóstico",
    "Air quality and weather are provided by Open-Meteo, with air-quality data from CAMS. The model learns from your logged symptoms, activity limits, night waking, and breathing readings compared with your personal best.": "Open-Meteo proporciona el clima y CAMS los datos de calidad del aire. El modelo aprende de tus síntomas registrados, limitaciones de actividad, despertares nocturnos y mediciones respiratorias comparadas con tu mejor valor personal.",
    "It applies that recency-weighted model to hourly conditions for the next 24 hours. A personal forecast needs at least 8 days with both check-ins and local conditions. Sample readings are excluded.": "Aplica ese modelo, que da más peso a los datos recientes, a las condiciones por hora de las próximas 24 horas. Se necesitan al menos 8 días con registros y condiciones locales. Se excluyen las mediciones de muestra.",
    "AsthmaGuard SB · Your health records in one place.": "AsthmaGuard SB · Tus datos de salud en un solo lugar.",
    "Regional air data and your saved health records.": "Datos regionales del aire y tus registros de salud guardados.",
    "Log symptoms on at least 8 days to build a personal forecast": "Registra síntomas en al menos 8 días para crear un pronóstico personal.",
    "Appearance": "Apariencia", "Dark mode": "Modo oscuro", "Language & profile": "Idioma y perfil", "Mode": "Modo", "Adult": "Adulto", "Pediatric": "Pediátrico", "School mode": "Modo escolar", "Privacy & data": "Privacidad y datos", "Reminders": "Recordatorios", "Contribute to the community map": "Contribuir al mapa comunitario", "Your account saves logs, readings, and settings.": "Tu cuenta guarda registros, mediciones y ajustes.", "Personal Patterns": "Patrones personales", "Care Plan & Reports": "Plan y reportes", "Explore": "Explorar", "Current conditions": "Condiciones actuales", "What should we call you?": "¿Cómo te llamamos?", "I understand that readings and risk trends are estimates.": "Entiendo que las mediciones y tendencias de riesgo son estimaciones.",
    "Outdoor activity": "Actividad al aire libre", "No activity entered": "No se indicó actividad", "Symptom check-in": "Registro de síntomas", "Measurement": "Medición", "Medication reminder": "Recordatorio de medicamentos", "Follow your prescribed schedule": "Sigue el horario indicado", "View my saved care plan": "Ver mi plan de cuidado", "Edit outdoor activity": "Editar actividad al aire libre", "Your planned activity & time": "Actividad y horario previstos", "No care plan yet.": "Aún no hay un plan de cuidado.", "Add a clinician-provided PDF or image. The app will not create medication instructions.": "Agrega un PDF o imagen de tu profesional de salud. La app no genera instrucciones de medicamentos.", "Add care plan": "Agregar plan de cuidado", "Replace plan": "Reemplazar plan", "Open saved plan": "Abrir plan guardado", "Remove plan": "Eliminar plan", "Choose a PDF or image": "Elige un PDF o una imagen", "Care plan saved to your account": "Plan de cuidado guardado en tu cuenta", "Could not save the care plan": "No se pudo guardar el plan de cuidado", "Saved to your account": "Guardado en tu cuenta", "Enable reminders": "Activar recordatorios", "Check-in: 6:00 PM · Measurement: 7:00 PM": "Registro: 6:00 p. m. · Medición: 7:00 p. m.", "Allow notifications in your browser to turn reminders on.": "Permite las notificaciones del navegador para activar los recordatorios.", "Notifications are unavailable or blocked in this browser.": "Las notificaciones no están disponibles o están bloqueadas en este navegador.",
    "Name": "Nombre", "Medication name": "Nombre del medicamento", "Instructions (optional)": "Instrucciones (opcional)", "As prescribed": "Según lo indicado", "Type": "Tipo", "Preventive": "Preventivo", "Rescue": "Alivio rápido", "Add medication": "Agregar medicamento", "No instructions saved": "No hay instrucciones guardadas", "doses logged today": "dosis registradas hoy", "Log a dose": "Registrar una dosis", "Remove": "Eliminar", "Inhaler steps": "Pasos para el inhalador", "Six steps for using your inhaler": "Seis pasos para usar el inhalador", "Cost-saving tips": "Consejos para ahorrar", "Insurance and pharmacy savings": "Ahorros en seguro y farmacia", "Export data (JSON)": "Exportar datos (JSON)",
    "Route 1 corridor": "Corredor de la Ruta 1", "Near SB High School": "Cerca de SB High School", "Kingston Rd apartments": "Apartamentos de Kingston Rd", "Heathcote / Route 522": "Heathcote / Ruta 522", "Traffic and outdoor-air reports": "Reportes de tráfico y aire exterior", "School-area reports": "Reportes del área escolar", "Indoor air and moisture reports": "Reportes de aire interior y humedad", "Comparison-area reports": "Reportes del área de comparación", "Google map with sample community reports around South Brunswick": "Mapa de Google con reportes comunitarios de muestra en South Brunswick", "Google Maps did not load.": "No se pudo cargar Google Maps.", "Google Maps could not load.": "No se pudo cargar Google Maps.", "Add a Google Maps API key to enable the map.": "Agrega una clave de Google Maps para activar el mapa.",
    "High": "Alto", "Moderate": "Moderado", "Low": "Bajo", "Unavailable": "No disponible",
    "Humidity": "Humedad", "Symptoms": "Síntomas", "Limitation": "Limitación",
    "Waiting for regional conditions": "Esperando las condiciones regionales", "Projected index": "Índice proyectado", "Recorded trend": "Tendencia registrada",
    "Estimated risk index based on saved readings, check-ins, and regional conditions": "Índice estimado según mediciones, registros y condiciones regionales",
    "Environmental history is not available.": "No hay historial ambiental disponible.", "Air quality, fine particle, and humidity trends": "Tendencias de calidad del aire, partículas finas y humedad",
    "Add readings or check-ins to see health trends.": "Agrega mediciones o registros para ver tendencias de salud.", "Breathing readings with symptom severity and activity limitation": "Mediciones respiratorias, gravedad de síntomas y limitación de actividad",
    "Daily check-in": "Registro diario", "Take a moment to record how you are feeling.": "Tómate un momento para registrar cómo te sientes.", "Breathing reading": "Medición respiratoria", "Record a breathing measurement if it is a good time for you.": "Registra una medición cuando te resulte conveniente.",
    "Reminder · 6:00 PM": "Recordatorio · 6:00 p. m.", "Reminder · 7:00 PM": "Recordatorio · 7:00 p. m.", "Reminder paused": "Recordatorio pausado",
    "Estimated trend · next 24 hours": "Tendencia estimada · próximas 24 horas", "Please acknowledge that readings are estimates before continuing.": "Confirma que las mediciones son estimaciones antes de continuar.",
    "Air Quality": "Calidad del aire", Breathing: "Respiración", Medications: "Medicamentos",
    "Care plan": "Plan de cuidado", "Review, print, or save a copy": "Revisar, imprimir o guardar una copia",
    "Your saved readings and regional conditions": "Tus mediciones y condiciones regionales", "Air and weather": "Aire y clima",
    "Breathing and check-ins": "Respiración y registros", "Symptom severity": "Gravedad de síntomas",
    "Activity limitation": "Limitación de actividad", "No saved reading": "No hay mediciones guardadas",
    "Risk forecast": "Pronóstico de riesgo", "Regional conditions": "Condiciones regionales",
    "Estimated risk level": "Nivel de riesgo estimado", "Saved readings": "Mediciones guardadas",
    "Check-ins": "Registros", "Active days": "Días activos",
    "Today's reminders": "Recordatorios de hoy", "Print / save PDF": "Imprimir / guardar PDF",
    "Weekly report": "Informe semanal", "Local health services": "Servicios de salud locales",
    "Emergency help": "Ayuda de emergencia",
    Done: "Listo",
    Summary: "Resumen", "Take a Measurement": "Tomar una medición",
    Measure: "Medir", Patterns: "Patrones", Log: "Registro", Meds: "Medicinas", Care: "Cuidado", More: "Más", "Symptom & Medication Log": "Registro de síntomas", Triggers: "Desencadenantes", Community: "Comunidad",
    Today: "Hoy", Highlights: "Aspectos destacados", Trends: "Tendencias",
    "Risk Level": "Nivel de riesgo", "Recommended actions": "Acciones recomendadas",
    "Sign in": "Iniciar sesión", "Create account": "Crear cuenta",
  },
  Hindi: {
    "Where this forecast comes from": "यह पूर्वानुमान कहाँ से आता है",
    "Air quality and weather are provided by Open-Meteo, with air-quality data from CAMS. The model learns from your logged symptoms, activity limits, night waking, and breathing readings compared with your personal best.": "वायु गुणवत्ता और मौसम का डेटा Open-Meteo से तथा वायु गुणवत्ता का डेटा CAMS से आता है। मॉडल आपके दर्ज लक्षणों, गतिविधि की सीमाओं, रात में जागने और व्यक्तिगत सर्वोत्तम से तुलना की गई श्वास रीडिंग से सीखता है।",
    "It applies that recency-weighted model to hourly conditions for the next 24 hours. A personal forecast needs at least 8 days with both check-ins and local conditions. Sample readings are excluded.": "यह हाल के डेटा को अधिक महत्व देने वाला मॉडल अगले 24 घंटों की प्रति-घंटे की स्थितियों पर लागू करता है। व्यक्तिगत पूर्वानुमान के लिए लक्षण लॉग और स्थानीय स्थितियों वाले कम से कम 8 दिन चाहिए। नमूना रीडिंग शामिल नहीं हैं।",
    "AsthmaGuard SB · Your health records in one place.": "AsthmaGuard SB · आपके स्वास्थ्य रिकॉर्ड एक ही जगह पर।",
    "Regional air data and your saved health records.": "क्षेत्रीय वायु डेटा और आपके सहेजे गए स्वास्थ्य रिकॉर्ड।",
    "Log symptoms on at least 8 days to build a personal forecast": "व्यक्तिगत अनुमान बनाने के लिए कम से कम 8 दिनों तक लक्षण दर्ज करें।",
    "Appearance": "दिखावट", "Dark mode": "डार्क मोड", "Language & profile": "भाषा और प्रोफ़ाइल", "Mode": "मोड", "Adult": "वयस्क", "Pediatric": "बाल चिकित्सा", "School mode": "स्कूल मोड", "Privacy & data": "गोपनीयता और डेटा", "Reminders": "रिमाइंडर", "Contribute to the community map": "समुदाय मानचित्र में योगदान दें", "Your account saves logs, readings, and settings.": "आपका खाता लॉग, माप और सेटिंग सहेजता है।", "Personal Patterns": "व्यक्तिगत पैटर्न", "Care Plan & Reports": "देखभाल योजना और रिपोर्ट", "Explore": "देखें", "What should we call you?": "आपको किस नाम से बुलाएँ?",
    "Outdoor activity": "बाहरी गतिविधि", "No activity entered": "कोई गतिविधि दर्ज नहीं", "Symptom check-in": "लक्षण लॉग", "Measurement": "माप", "Medication reminder": "दवा रिमाइंडर", "Follow your prescribed schedule": "निर्धारित समय का पालन करें", "View my saved care plan": "मेरी सहेजी योजना देखें", "Edit outdoor activity": "बाहरी गतिविधि बदलें", "Your planned activity & time": "आपकी गतिविधि और समय", "No care plan yet.": "अभी कोई देखभाल योजना नहीं है।", "Add a clinician-provided PDF or image. The app will not create medication instructions.": "अपने स्वास्थ्य पेशेवर का PDF या चित्र जोड़ें। ऐप दवा के निर्देश नहीं बनाएगा।", "Add care plan": "देखभाल योजना जोड़ें", "Replace plan": "योजना बदलें", "Open saved plan": "सहेजी योजना खोलें", "Remove plan": "योजना हटाएँ", "Choose a PDF or image": "PDF या चित्र चुनें", "Care plan saved to your account": "देखभाल योजना खाते में सहेजी गई", "Could not save the care plan": "देखभाल योजना सहेजी नहीं जा सकी", "Saved to your account": "आपके खाते में सहेजा गया", "Enable reminders": "रिमाइंडर चालू करें", "Check-in: 6:00 PM · Measurement: 7:00 PM": "लक्षण लॉग: शाम 6 बजे · माप: शाम 7 बजे", "Allow notifications in your browser to turn reminders on.": "रिमाइंडर चालू करने के लिए ब्राउज़र सूचनाओं की अनुमति दें।", "Notifications are unavailable or blocked in this browser.": "इस ब्राउज़र में सूचनाएँ उपलब्ध नहीं हैं या ब्लॉक हैं।",
    "Name": "नाम", "Medication name": "दवा का नाम", "Instructions (optional)": "निर्देश (वैकल्पिक)", "As prescribed": "निर्देशानुसार", "Type": "प्रकार", "Preventive": "रोकथाम", "Rescue": "राहत", "Add medication": "दवा जोड़ें", "No instructions saved": "कोई निर्देश सहेजा नहीं गया", "doses logged today": "आज दर्ज खुराक", "Log a dose": "खुराक दर्ज करें", "Remove": "हटाएँ", "Inhaler steps": "इनहेलर के चरण", "Six steps for using your inhaler": "इनहेलर उपयोग के छह चरण", "Cost-saving tips": "बचत के सुझाव", "Insurance and pharmacy savings": "बीमा और फार्मेसी की बचत", "Export data (JSON)": "डेटा निर्यात करें (JSON)",
    "Route 1 corridor": "रूट 1 कॉरिडोर", "Near SB High School": "SB हाई स्कूल के पास", "Kingston Rd apartments": "किंग्स्टन रोड अपार्टमेंट", "Heathcote / Route 522": "हीथकोट / रूट 522", "Traffic and outdoor-air reports": "ट्रैफ़िक और बाहरी हवा की रिपोर्ट", "School-area reports": "स्कूल क्षेत्र की रिपोर्ट", "Indoor air and moisture reports": "घर के अंदर की हवा और नमी की रिपोर्ट", "Comparison-area reports": "तुलना क्षेत्र की रिपोर्ट", "Google map with sample community reports around South Brunswick": "साउथ ब्रंसविक के नमूना समुदाय रिपोर्ट वाला Google मानचित्र", "Google Maps did not load.": "Google Maps लोड नहीं हुआ।", "Google Maps could not load.": "Google Maps लोड नहीं हो सका।", "Add a Google Maps API key to enable the map.": "मानचित्र चालू करने के लिए Google Maps API कुंजी जोड़ें।",
    "High": "उच्च", "Moderate": "मध्यम", "Low": "कम", "Unavailable": "उपलब्ध नहीं",
    "Humidity": "नमी", "Symptoms": "लक्षण", "Limitation": "गतिविधि पर असर",
    "Waiting for regional conditions": "क्षेत्रीय स्थिति की प्रतीक्षा", "Projected index": "अनुमानित सूचकांक", "Recorded trend": "दर्ज रुझान",
    "Estimated risk index based on saved readings, check-ins, and regional conditions": "सहेजे गए माप, लॉग और क्षेत्रीय स्थिति पर आधारित अनुमानित जोखिम सूचकांक",
    "Environmental history is not available.": "पर्यावरण इतिहास उपलब्ध नहीं है।", "Air quality, fine particle, and humidity trends": "वायु गुणवत्ता, सूक्ष्म कण और नमी के रुझान",
    "Add readings or check-ins to see health trends.": "स्वास्थ्य रुझान देखने के लिए माप या लक्षण लॉग जोड़ें।", "Breathing readings with symptom severity and activity limitation": "साँस के माप, लक्षण की गंभीरता और गतिविधि पर असर",
    "Daily check-in": "दैनिक लक्षण लॉग", "Take a moment to record how you are feeling.": "अपनी स्थिति दर्ज करने के लिए थोड़ा समय लें।", "Breathing reading": "साँस का माप", "Record a breathing measurement if it is a good time for you.": "सुविधा होने पर साँस का माप दर्ज करें।",
    "Reminder · 6:00 PM": "रिमाइंडर · शाम 6 बजे", "Reminder · 7:00 PM": "रिमाइंडर · शाम 7 बजे", "Reminder paused": "रिमाइंडर रुका हुआ",
    "Estimated trend · next 24 hours": "अनुमानित रुझान · अगले 24 घंटे", "I understand that readings and risk trends are estimates.": "मैं समझता/समझती हूँ कि माप और जोखिम रुझान अनुमान हैं।", "Please acknowledge that readings are estimates before continuing.": "आगे बढ़ने से पहले पुष्टि करें कि माप अनुमान हैं।",
    "Air Quality": "वायु गुणवत्ता", Breathing: "साँस", Medications: "दवाएँ",
    "Care plan": "देखभाल योजना", "Review, print, or save a copy": "देखें, प्रिंट करें या प्रति सहेजें",
    "Your saved readings and regional conditions": "आपके माप और क्षेत्रीय स्थिति", "Air and weather": "हवा और मौसम",
    "Breathing and check-ins": "साँस और लक्षण लॉग", "Symptom severity": "लक्षण की गंभीरता",
    "Activity limitation": "गतिविधि पर प्रभाव", "No saved reading": "कोई माप सहेजा नहीं गया",
    "Risk forecast": "जोखिम अनुमान", "Regional conditions": "क्षेत्रीय स्थिति",
    "Estimated risk level": "अनुमानित जोखिम स्तर", "Saved readings": "सहेजे गए माप",
    "Check-ins": "लॉग", "Active days": "सक्रिय दिन",
    "Today's reminders": "आज के रिमाइंडर", "Print / save PDF": "प्रिंट / PDF सहेजें",
    "Weekly report": "साप्ताहिक रिपोर्ट", "Local health services": "स्थानीय स्वास्थ्य सेवाएँ",
    "Emergency help": "आपातकालीन सहायता",
    Done: "पूर्ण",
    Summary: "सारांश", "Take a Measurement": "माप लें",
    Measure: "माप", Patterns: "पैटर्न", Log: "लॉग", Meds: "दवाइयाँ", Care: "देखभाल", More: "और", "Symptom & Medication Log": "लक्षण और दवा जर्नल", Triggers: "ट्रिगर", Community: "समुदाय",
    Today: "आज", Highlights: "मुख्य बातें", Trends: "रुझान",
    "Risk Level": "जोखिम स्तर", "Recommended actions": "अनुशंसित कार्य",
    "Sign in": "साइन इन", "Create account": "खाता बनाएं",
  },
  Gujarati: {
    "Where this forecast comes from": "આ આગાહી ક્યાંથી આવે છે",
    "Air quality and weather are provided by Open-Meteo, with air-quality data from CAMS. The model learns from your logged symptoms, activity limits, night waking, and breathing readings compared with your personal best.": "હવાની ગુણવત્તા અને હવામાન Open-Meteo દ્વારા અને હવાની ગુણવત્તાનો ડેટા CAMS દ્વારા મળે છે. મોડેલ તમારા નોંધાયેલા લક્ષણો, પ્રવૃત્તિની મર્યાદા, રાત્રે જાગવું અને તમારા વ્યક્તિગત શ્રેષ્ઠ માપની સરખામણીમાં શ્વાસના માપ પરથી શીખે છે.",
    "It applies that recency-weighted model to hourly conditions for the next 24 hours. A personal forecast needs at least 8 days with both check-ins and local conditions. Sample readings are excluded.": "આ મોડેલ તાજેતરના ડેટાને વધુ વજન આપી આગામી 24 કલાકની કલાકવાર પરિસ્થિતિઓ પર લાગુ કરે છે. વ્યક્તિગત આગાહી માટે લક્ષણ નોંધ અને સ્થાનિક પરિસ્થિતિઓ સાથે ઓછામાં ઓછા 8 દિવસ જરૂરી છે. નમૂના માપ સામેલ નથી.",
    "AsthmaGuard SB · Your health records in one place.": "AsthmaGuard SB · તમારા આરોગ્યના રેકોર્ડ એક જ જગ્યાએ.",
    "Regional air data and your saved health records.": "પ્રાદેશિક હવાની માહિતી અને તમારા સાચવેલા આરોગ્ય રેકોર્ડ.",
    "Log symptoms on at least 8 days to build a personal forecast": "વ્યક્તિગત અંદાજ બનાવવા માટે ઓછામાં ઓછા 8 દિવસ લક્ષણો નોંધો.",
    "Appearance": "દેખાવ", "Dark mode": "ડાર્ક મોડ", "Language & profile": "ભાષા અને પ્રોફાઇલ", "Mode": "મોડ", "Adult": "પુખ્ત", "Pediatric": "બાળ", "School mode": "શાળા મોડ", "Privacy & data": "ગોપનીયતા અને ડેટા", "Reminders": "રીમાઇન્ડર", "Contribute to the community map": "સમુદાય નકશામાં યોગદાન આપો", "Your account saves logs, readings, and settings.": "તમારું ખાતું નોંધ, માપ અને સેટિંગ સાચવે છે.", "Personal Patterns": "વ્યક્તિગત પેટર્ન", "Care Plan & Reports": "કેર પ્લાન અને રિપોર્ટ", "Explore": "જુઓ", "What should we call you?": "તમને શું કહીને બોલાવીએ?",
    "Outdoor activity": "બહારની પ્રવૃત્તિ", "No activity entered": "કોઈ પ્રવૃત્તિ દાખલ નથી", "Symptom check-in": "લક્ષણ નોંધ", "Measurement": "માપ", "Medication reminder": "દવાનું રીમાઇન્ડર", "Follow your prescribed schedule": "નિર્ધારિત સમયપત્રક અનુસરો", "View my saved care plan": "મારો સાચવેલો કેર પ્લાન જુઓ", "Edit outdoor activity": "બહારની પ્રવૃત્તિ બદલો", "Your planned activity & time": "તમારી પ્રવૃત્તિ અને સમય", "No care plan yet.": "હજુ કેર પ્લાન નથી.", "Add a clinician-provided PDF or image. The app will not create medication instructions.": "તમારા આરોગ્ય વ્યવસાયીનો PDF અથવા ચિત્ર ઉમેરો. એપ દવાની સૂચના બનાવશે નહીં.", "Add care plan": "કેર પ્લાન ઉમેરો", "Replace plan": "પ્લાન બદલો", "Open saved plan": "સાચવેલો પ્લાન ખોલો", "Remove plan": "પ્લાન દૂર કરો", "Choose a PDF or image": "PDF અથવા ચિત્ર પસંદ કરો", "Care plan saved to your account": "કેર પ્લાન તમારા ખાતામાં સાચવાયો", "Could not save the care plan": "કેર પ્લાન સાચવી શકાયો નહીં", "Saved to your account": "તમારા ખાતામાં સાચવ્યું", "Enable reminders": "રીમાઇન્ડર ચાલુ કરો", "Check-in: 6:00 PM · Measurement: 7:00 PM": "નોંધ: સાંજે 6 વાગ્યે · માપ: સાંજે 7 વાગ્યે", "Allow notifications in your browser to turn reminders on.": "રીમાઇન્ડર ચાલુ કરવા બ્રાઉઝરની સૂચનાઓને મંજૂરી આપો.", "Notifications are unavailable or blocked in this browser.": "આ બ્રાઉઝરમાં સૂચનાઓ ઉપલબ્ધ નથી અથવા અવરોધિત છે.",
    "Name": "નામ", "Medication name": "દવાનું નામ", "Instructions (optional)": "સૂચના (વૈકલ્પિક)", "As prescribed": "સૂચના મુજબ", "Type": "પ્રકાર", "Preventive": "નિવારક", "Rescue": "તાત્કાલિક રાહત", "Add medication": "દવા ઉમેરો", "No instructions saved": "કોઈ સૂચના સાચવી નથી", "doses logged today": "આજે નોંધેલી માત્રા", "Log a dose": "માત્રા નોંધો", "Remove": "દૂર કરો", "Inhaler steps": "ઇન્હેલરના પગલાં", "Six steps for using your inhaler": "ઇન્હેલર વાપરવાના છ પગલાં", "Cost-saving tips": "બચતના સૂચનો", "Insurance and pharmacy savings": "વીમા અને ફાર્મસીની બચત", "Export data (JSON)": "ડેટા નિકાસ કરો (JSON)",
    "Route 1 corridor": "રૂટ 1 કોરિડોર", "Near SB High School": "SB હાઇ સ્કૂલ પાસે", "Kingston Rd apartments": "કિંગ્સ્ટન રોડ એપાર્ટમેન્ટ્સ", "Heathcote / Route 522": "હીથકોટ / રૂટ 522", "Traffic and outdoor-air reports": "ટ્રાફિક અને બહારની હવાના અહેવાલ", "School-area reports": "શાળા વિસ્તારના અહેવાલ", "Indoor air and moisture reports": "ઘરની અંદરની હવા અને ભેજના અહેવાલ", "Comparison-area reports": "તુલના વિસ્તારના અહેવાલ", "Google map with sample community reports around South Brunswick": "સાઉથ બ્રન્સવિકની નમૂના સમુદાય નોંધ સાથે Google નકશો", "Google Maps did not load.": "Google Maps લોડ થયો નથી.", "Google Maps could not load.": "Google Maps લોડ થઈ શક્યો નથી.", "Add a Google Maps API key to enable the map.": "નકશો ચાલુ કરવા Google Maps API કી ઉમેરો.",
    "High": "ઊંચું", "Moderate": "મધ્યમ", "Low": "ઓછું", "Unavailable": "ઉપલબ્ધ નથી",
    "Humidity": "ભેજ", "Symptoms": "લક્ષણો", "Limitation": "પ્રવૃત્તિ પર અસર",
    "Waiting for regional conditions": "પ્રાદેશિક સ્થિતિની રાહ જોઈ રહ્યા છીએ", "Projected index": "અંદાજિત સૂચકાંક", "Recorded trend": "નોંધાયેલ વલણ",
    "Estimated risk index based on saved readings, check-ins, and regional conditions": "સાચવેલા માપ, નોંધ અને પ્રાદેશિક સ્થિતિ પર આધારિત અંદાજિત જોખમ સૂચકાંક",
    "Environmental history is not available.": "પર્યાવરણનો ઇતિહાસ ઉપલબ્ધ નથી.", "Air quality, fine particle, and humidity trends": "હવાની ગુણવત્તા, સૂક્ષ્મ કણ અને ભેજના વલણો",
    "Add readings or check-ins to see health trends.": "આરોગ્યના વલણો જોવા માપ અથવા લક્ષણ નોંધ ઉમેરો.", "Breathing readings with symptom severity and activity limitation": "શ્વાસના માપ, લક્ષણની તીવ્રતા અને પ્રવૃત્તિ પર અસર",
    "Daily check-in": "દૈનિક લક્ષણ નોંધ", "Take a moment to record how you are feeling.": "તમને કેવું લાગે છે તે નોંધવા થોડો સમય લો.", "Breathing reading": "શ્વાસનું માપ", "Record a breathing measurement if it is a good time for you.": "અનુકૂળ હોય ત્યારે શ્વાસનું માપ નોંધો.",
    "Reminder · 6:00 PM": "રીમાઇન્ડર · સાંજે 6 વાગ્યે", "Reminder · 7:00 PM": "રીમાઇન્ડર · સાંજે 7 વાગ્યે", "Reminder paused": "રીમાઇન્ડર થોભાવ્યું",
    "Estimated trend · next 24 hours": "અંદાજિત વલણ · આગામી 24 કલાક", "I understand that readings and risk trends are estimates.": "હું સમજું છું કે માપ અને જોખમના વલણો અંદાજ છે.", "Please acknowledge that readings are estimates before continuing.": "આગળ વધતાં પહેલાં માપ અંદાજ છે તેની પુષ્ટિ કરો.",
    "Air Quality": "હવાની ગુણવત્તા", Breathing: "શ્વાસ", Medications: "દવાઓ",
    "Care plan": "કેર પ્લાન", "Review, print, or save a copy": "જુઓ, પ્રિન્ટ કરો અથવા નકલ સાચવો",
    "Your saved readings and regional conditions": "તમારા માપ અને પ્રાદેશિક સ્થિતિ", "Air and weather": "હવા અને હવામાન",
    "Breathing and check-ins": "શ્વાસ અને લક્ષણ નોંધ", "Symptom severity": "લક્ષણની તીવ્રતા",
    "Activity limitation": "પ્રવૃત્તિ પર અસર", "No saved reading": "કોઈ માપ સાચવ્યું નથી",
    "Risk forecast": "જોખમનો અંદાજ", "Regional conditions": "પ્રાદેશિક સ્થિતિ",
    "Estimated risk level": "અંદાજિત જોખમ સ્તર", "Saved readings": "સાચવેલા માપ",
    "Check-ins": "નોંધ", "Active days": "સક્રિય દિવસો",
    "Today's reminders": "આજના રીમાઇન્ડર", "Print / save PDF": "પ્રિન્ટ / PDF સાચવો",
    "Weekly report": "સાપ્તાહિક રિપોર્ટ", "Local health services": "સ્થાનિક આરોગ્ય સેવાઓ",
    "Emergency help": "તાત્કાલિક મદદ",
    Done: "થઈ ગયું",
    Summary: "સારાંશ", "Take a Measurement": "માપન લો",
    Measure: "માપો", Patterns: "પેટર્ન", Log: "નોંધ", Meds: "દવાઓ", Care: "સંભાળ", More: "વધુ", "Symptom & Medication Log": "લક્ષણ અને દવા જર્નલ", Triggers: "ટ્રિગર", Community: "સમુદાય",
    Today: "આજે", Highlights: "મુખ્ય બાબતો", Trends: "વલણો",
    "Risk Level": "જોખમ સ્તર", "Recommended actions": "સૂચિત ક્રિયાઓ",
    "Sign in": "સાઇન ઇન", "Create account": "એકાઉન્ટ બનાવો",
  },
};
const extendedTranslations: Partial<Record<Language, Dict>> = {
  Spanish: {
    "Ask about your data": "Pregunta sobre tus datos", "Try asking:": "Prueba a preguntar:", "Close chat": "Cerrar chat", "Open chat": "Abrir chat", "Chat about your data": "Pregunta sobre tus datos", "Reset conversation": "Restablecer conversación", "Could not send that message. Try again.": "No se pudo enviar el mensaje. Inténtalo de nuevo.", "Could not clear this conversation. Try again.": "No se pudo borrar la conversación. Inténtalo de nuevo.", "Type your question about your logs...": "Escribe una pregunta sobre tus registros...", "Send question": "Enviar pregunta", "Show my recent readings": "Mostrar mis mediciones recientes", "What's missing?": "¿Qué falta?", "Summarize my week": "Resume mi semana", "Checking your saved records...": "Revisando tus registros guardados...", "Hi! Ask me about the records saved in your account.": "¡Hola! Pregúntame sobre los registros guardados en tu cuenta.", "Why did my risk level change?": "¿Por qué cambió mi nivel de riesgo?", "What information is missing?": "¿Qué información falta?", "What patterns appear in my logs?": "¿Qué patrones aparecen en mis registros?", "Summarize my week.": "Resume mi semana.",
    "Risk forecast": "Estimación de riesgo", "Estimated trend · next 24 hours": "Tendencia estimada · próximas 24 horas",
    "Recent inputs and regional conditions are lower. Continue your usual routine.": "Los datos recientes y las condiciones regionales indican un nivel menor. Continúa con tu rutina habitual.",
    "Some inputs are elevated. Keep your usual check-ins and follow your care plan.": "Algunos indicadores están elevados. Registra tus síntomas y sigue tu plan de cuidado.",
    "Regional conditions and recent health inputs are elevated. Check your symptoms and follow your care plan.": "Las condiciones regionales y los datos recientes están elevados. Revisa tus síntomas y sigue tu plan de cuidado.",
    "Loading local air and weather data…": "Cargando datos locales de aire y clima…", "Regional air quality and humidity are forecasts, not personal monitor readings.": "La calidad del aire y la humedad regionales son estimaciones, no lecturas de un dispositivo personal.",
    "Recent measurements and logged symptoms are included when available.": "Se incluyen las mediciones y los síntomas registrados cuando están disponibles.", "Data used": "Datos utilizados", "Air and weather": "Aire y clima", "Breathing and check-ins": "Respiración y registros",
    "Today": "Hoy", "Highlights": "Resumen", "Trends": "Tendencias", "Measure": "Medir", "Log": "Registro", "Care": "Cuidado", "More": "Más", "Meds": "Medicinas", "Community": "Comunidad", "Triggers": "Desencadenantes", "Patterns": "Patrones",
    "Live airflow reading": "Lectura de flujo de aire", "Recent readings": "Mediciones recientes", "Three-test averages": "Promedio de tres pruebas", "Reference details": "Datos de referencia", "Reference category": "Categoría de referencia", "Choose a reference": "Elige una referencia", "Save details": "Guardar datos", "Personal best (L/min)": "Mejor valor personal (L/min)", "Enter your best": "Ingresa tu mejor valor", "Save range": "Guardar rango", "Connect device": "Conectar dispositivo", "Disconnect": "Desconectar", "Device connected": "Dispositivo conectado", "Device disconnected": "Dispositivo desconectado", "Test data": "Datos de prueba", "Ready when you are": "Listo cuando tú lo estés", "Start 3 tests": "Iniciar 3 pruebas", "Measure again": "Medir otra vez", "Three tests complete": "Tres pruebas completas", "Average airflow": "Flujo de aire promedio", "Notes (optional)": "Notas (opcional)", "Save reading": "Guardar medición", "Recent live airflow readings": "Lecturas recientes de flujo de aire", "Latest": "Más reciente", "Pressure": "Presión", "Velocity": "Velocidad", "Test": "Prueba", "Saved": "Guardado", "Saving…": "Guardando…", "Waiting for a reading": "Esperando una lectura", "No readings saved yet.": "Aún no hay mediciones guardadas.", "Reading": "Medición", "Daily average": "Promedio diario", "Earlier average": "Promedio anterior", "Today average": "Promedio de hoy",
    "Check-in": "Registro", "Your check-ins are saved to your account.": "Tus registros se guardan en tu cuenta.", "Symptom severity": "Gravedad de los síntomas", "Nighttime waking": "Despertares nocturnos", "Activity limitation": "Limitación de actividad", "Suspected exposure": "Posible exposición", "Medication use as logged": "Uso de medicamentos registrado", "Timestamp": "Fecha y hora", "Save check-in": "Guardar registro", "Recent check-ins": "Registros recientes", "Missing entries are unknown, not symptom-free days.": "Los registros faltantes son desconocidos, no días sin síntomas.", "Symptom-free": "Sin síntomas", "None": "Ninguno", "Mild": "Leve", "Moderate": "Moderado", "Severe": "Grave", "No": "No", "Yes": "Sí", "Not sure": "No estoy seguro", "Some": "Algo", "Significant": "Importante", "None noted": "Ninguno indicado", "Outdoor air": "Aire exterior", "Pollen": "Polen", "Exercise": "Ejercicio", "Other": "Otro", "Not logged": "No registrado", "Recorded as prescribed": "Registrado según lo indicado", "Use recorded — see notes": "Uso registrado; ver notas", "No use recorded": "No se registró uso",
    "Community map": "Mapa comunitario", "reports this month": "reportes este mes", "zones monitored": "zonas monitoreadas", "regional AQI": "ICA regional", "Contributing": "Participando", "Opted out": "Desactivado", "Contribute anonymously": "Contribuir de forma anónima", "sample reports": "reportes de muestra", "Local air quality": "Calidad del aire local", "How your data is protected": "Cómo se protegen tus datos", "Appearance": "Apariencia", "Language & profile": "Idioma y perfil", "App language": "Idioma de la aplicación", "Privacy & data": "Privacidad y datos", "Remember preferences on this device": "Recordar preferencias en este dispositivo", "Export data (JSON)": "Exportar datos (JSON)", "Explore": "Explorar",
    "Already have an account?": "¿Ya tienes una cuenta?", "New around here?": "¿Eres nuevo aquí?", "Reset password": "Restablecer contraseña", "What should we call you?": "¿Cómo te llamamos?", "Your first name": "Tu nombre", "Age (years)": "Edad (años)", "Height (cm)": "Altura (cm)", "Reference equation": "Ecuación de referencia", "Email address": "Correo electrónico", "Forgot password?": "¿Olvidaste tu contraseña?", "At least 8 characters": "Al menos 8 caracteres", "Your password": "Tu contraseña", "Show password": "Mostrar contraseña", "Hide password": "Ocultar contraseña", "Create account with Google": "Crear cuenta con Google", "Sign in with Google": "Iniciar sesión con Google", "Please wait…": "Espera…", "Please acknowledge the prototype notice before continuing.": "Confirma el aviso antes de continuar.", "Sign in to view your saved information.": "Inicia sesión para ver tu información guardada.", "Save your check-ins and measurements to your account.": "Guarda tus registros y mediciones en tu cuenta.", "Enter your email to reset your password.": "Ingresa tu correo para restablecer la contraseña.", "Password": "Contraseña", "Sign in": "Iniciar sesión", "Create account": "Crear cuenta",
  },
  Hindi: {
    "Ask about your data": "अपने डेटा के बारे में पूछें", "Try asking:": "यह पूछकर देखें:", "Close chat": "चैट बंद करें", "Open chat": "चैट खोलें", "Chat about your data": "अपने डेटा के बारे में पूछें", "Reset conversation": "बातचीत रीसेट करें", "Could not send that message. Try again.": "संदेश नहीं भेजा जा सका। फिर कोशिश करें।", "Could not clear this conversation. Try again.": "बातचीत साफ़ नहीं हो सकी। फिर कोशिश करें।", "Type your question about your logs...": "अपने लॉग के बारे में सवाल लिखें...", "Send question": "सवाल भेजें", "Show my recent readings": "मेरे हाल के माप दिखाएँ", "What's missing?": "क्या छूटा है?", "Summarize my week": "मेरे सप्ताह का सार दें", "Checking your saved records...": "आपके सहेजे गए रिकॉर्ड देख रहे हैं...", "Hi! Ask me about the records saved in your account.": "नमस्ते! अपने खाते में सहेजे रिकॉर्ड के बारे में पूछें।", "Why did my risk level change?": "मेरा जोखिम स्तर क्यों बदला?", "What information is missing?": "कौन-सी जानकारी छूटी है?", "What patterns appear in my logs?": "मेरे लॉग में कौन-से रुझान दिखते हैं?", "Summarize my week.": "मेरे सप्ताह का सार दें।",
    "Risk forecast": "जोखिम अनुमान", "Estimated trend · next 24 hours": "अनुमानित रुझान · अगले 24 घंटे",
    "Recent inputs and regional conditions are lower. Continue your usual routine.": "हाल के संकेत और क्षेत्रीय परिस्थितियाँ कम हैं। अपनी सामान्य दिनचर्या जारी रखें।",
    "Some inputs are elevated. Keep your usual check-ins and follow your care plan.": "कुछ संकेत बढ़े हुए हैं। नियमित लक्षण दर्ज करें और अपनी देखभाल योजना का पालन करें।",
    "Regional conditions and recent health inputs are elevated. Check your symptoms and follow your care plan.": "क्षेत्रीय परिस्थितियाँ और हाल के स्वास्थ्य संकेत बढ़े हुए हैं। लक्षण देखें और अपनी देखभाल योजना का पालन करें।",
    "Loading local air and weather data…": "स्थानीय हवा और मौसम का डेटा लोड हो रहा है…", "Regional air quality and humidity are forecasts, not personal monitor readings.": "क्षेत्रीय वायु गुणवत्ता और नमी अनुमान हैं, व्यक्तिगत सेंसर रीडिंग नहीं।",
    "Recent measurements and logged symptoms are included when available.": "उपलब्ध होने पर हाल के माप और दर्ज लक्षण शामिल हैं।", "Data used": "इस्तेमाल किया गया डेटा", "Air and weather": "हवा और मौसम", "Breathing and check-ins": "साँस और लक्षण लॉग",
    "Today": "आज", "Highlights": "मुख्य जानकारी", "Trends": "रुझान", "Measure": "माप", "Log": "लॉग", "Care": "देखभाल", "More": "और", "Meds": "दवाएँ", "Community": "समुदाय", "Triggers": "कारक", "Patterns": "पैटर्न",
    "Live airflow reading": "वास्तविक समय वायु प्रवाह माप", "Recent readings": "हाल के माप", "Three-test averages": "तीन परीक्षणों का औसत", "Reference details": "संदर्भ विवरण", "Reference category": "संदर्भ श्रेणी", "Choose a reference": "संदर्भ चुनें", "Save details": "विवरण सहेजें", "Personal best (L/min)": "व्यक्तिगत सर्वोत्तम (L/min)", "Enter your best": "अपना सर्वोत्तम दर्ज करें", "Save range": "सीमा सहेजें", "Connect device": "डिवाइस जोड़ें", "Disconnect": "डिस्कनेक्ट करें", "Device connected": "डिवाइस जुड़ा है", "Device disconnected": "डिवाइस जुड़ा नहीं है", "Test data": "परीक्षण डेटा", "Ready when you are": "आप तैयार हों तो शुरू करें", "Start 3 tests": "3 परीक्षण शुरू करें", "Measure again": "फिर से मापें", "Three tests complete": "तीन परीक्षण पूरे", "Average airflow": "औसत वायु प्रवाह", "Notes (optional)": "नोट (वैकल्पिक)", "Save reading": "माप सहेजें", "Recent live airflow readings": "हाल के वायु प्रवाह माप", "Latest": "नवीनतम", "Pressure": "दबाव", "Velocity": "वेग", "Test": "परीक्षण", "Saved": "सहेजा गया", "Saving…": "सहेज रहे हैं…", "Waiting for a reading": "माप की प्रतीक्षा", "No readings saved yet.": "अभी कोई माप सहेजा नहीं गया है।", "Reading": "माप", "Daily average": "दैनिक औसत", "Earlier average": "पहले का औसत", "Today average": "आज का औसत",
    "Check-in": "लक्षण लॉग", "Your check-ins are saved to your account.": "आपके लॉग खाते में सहेजे जाते हैं।", "Symptom severity": "लक्षण की गंभीरता", "Nighttime waking": "रात में जागना", "Activity limitation": "गतिविधि पर असर", "Suspected exposure": "संभावित संपर्क", "Medication use as logged": "दर्ज दवा उपयोग", "Timestamp": "समय", "Save check-in": "लॉग सहेजें", "Recent check-ins": "हाल के लॉग", "Missing entries are unknown, not symptom-free days.": "छूटी हुई प्रविष्टियाँ अज्ञात हैं, लक्षण-मुक्त दिन नहीं।", "Symptom-free": "लक्षण नहीं", "None": "नहीं", "Mild": "हल्का", "Moderate": "मध्यम", "Severe": "गंभीर", "No": "नहीं", "Yes": "हाँ", "Not sure": "पता नहीं", "Some": "कुछ", "Significant": "काफी", "None noted": "कुछ दर्ज नहीं", "Outdoor air": "बाहरी हवा", "Pollen": "पराग", "Exercise": "व्यायाम", "Other": "अन्य", "Not logged": "दर्ज नहीं", "Recorded as prescribed": "निर्देशानुसार दर्ज", "Use recorded — see notes": "उपयोग दर्ज — नोट देखें", "No use recorded": "उपयोग दर्ज नहीं",
    "Community map": "समुदाय मानचित्र", "reports this month": "इस महीने की रिपोर्ट", "zones monitored": "निगरानी क्षेत्र", "regional AQI": "क्षेत्रीय AQI", "Contributing": "योगदान चालू", "Opted out": "योगदान बंद", "Contribute anonymously": "गुमनाम योगदान दें", "sample reports": "नमूना रिपोर्ट", "Local air quality": "स्थानीय वायु गुणवत्ता", "How your data is protected": "आपका डेटा कैसे सुरक्षित है", "Appearance": "रूप", "Language & profile": "भाषा और प्रोफ़ाइल", "App language": "ऐप की भाषा", "Privacy & data": "गोपनीयता और डेटा", "Remember preferences on this device": "इस डिवाइस पर प्राथमिकताएँ याद रखें", "Export data (JSON)": "डेटा निर्यात करें (JSON)", "Explore": "देखें",
    "Already have an account?": "पहले से खाता है?", "New around here?": "यहाँ नए हैं?", "Reset password": "पासवर्ड रीसेट करें", "What should we call you?": "आपको किस नाम से बुलाएँ?", "Your first name": "आपका पहला नाम", "Age (years)": "आयु (वर्ष)", "Height (cm)": "ऊँचाई (सेमी)", "Reference equation": "संदर्भ समीकरण", "Email address": "ईमेल पता", "Forgot password?": "पासवर्ड भूल गए?", "At least 8 characters": "कम से कम 8 अक्षर", "Your password": "आपका पासवर्ड", "Show password": "पासवर्ड दिखाएँ", "Hide password": "पासवर्ड छिपाएँ", "Create account with Google": "Google से खाता बनाएँ", "Sign in with Google": "Google से साइन इन करें", "Please wait…": "कृपया प्रतीक्षा करें…", "Please acknowledge the prototype notice before continuing.": "आगे बढ़ने से पहले सूचना स्वीकार करें।", "Sign in to view your saved information.": "अपनी सहेजी जानकारी देखने के लिए साइन इन करें।", "Save your check-ins and measurements to your account.": "अपने लॉग और माप खाते में सहेजें।", "Enter your email to reset your password.": "पासवर्ड रीसेट करने के लिए ईमेल दर्ज करें।", "Password": "पासवर्ड", "Sign in": "साइन इन", "Create account": "खाता बनाएँ",
  },
  Gujarati: {
    "Ask about your data": "તમારા ડેટા વિશે પૂછો", "Try asking:": "આ પૂછવાનો પ્રયાસ કરો:", "Close chat": "ચેટ બંધ કરો", "Open chat": "ચેટ ખોલો", "Chat about your data": "તમારા ડેટા વિશે પૂછો", "Reset conversation": "વાતચીત રીસેટ કરો", "Could not send that message. Try again.": "સંદેશ મોકલી શકાયો નથી. ફરી પ્રયાસ કરો.", "Could not clear this conversation. Try again.": "વાતચીત સાફ કરી શકાઈ નથી. ફરી પ્રયાસ કરો.", "Type your question about your logs...": "તમારી નોંધ વિશે પ્રશ્ન લખો...", "Send question": "પ્રશ્ન મોકલો", "Show my recent readings": "મારા તાજેતરના માપ બતાવો", "What's missing?": "શું બાકી છે?", "Summarize my week": "મારા અઠવાડિયાનો સારાંશ આપો", "Checking your saved records...": "તમારા સાચવેલા રેકોર્ડ તપાસી રહ્યા છીએ...", "Hi! Ask me about the records saved in your account.": "નમસ્તે! તમારા ખાતામાં સાચવેલા રેકોર્ડ વિશે પૂછો.", "Why did my risk level change?": "મારું જોખમ સ્તર કેમ બદલાયું?", "What information is missing?": "કઈ માહિતી બાકી છે?", "What patterns appear in my logs?": "મારી નોંધોમાં કયા વલણ દેખાય છે?", "Summarize my week.": "મારા અઠવાડિયાનો સારાંશ આપો.",
    "Risk forecast": "જોખમનો અંદાજ", "Estimated trend · next 24 hours": "અંદાજિત વલણ · આગામી 24 કલાક",
    "Recent inputs and regional conditions are lower. Continue your usual routine.": "તાજેતરના સંકેતો અને પ્રાદેશિક સ્થિતિ ઓછી છે. તમારી સામાન્ય દિનચર્યા ચાલુ રાખો.",
    "Some inputs are elevated. Keep your usual check-ins and follow your care plan.": "કેટલાક સંકેતો વધેલા છે. નિયમિત લક્ષણ નોંધો અને તમારા કેર પ્લાનને અનુસરો.",
    "Regional conditions and recent health inputs are elevated. Check your symptoms and follow your care plan.": "પ્રાદેશિક સ્થિતિ અને તાજેતરના આરોગ્ય સંકેતો વધેલા છે. લક્ષણો તપાસો અને તમારા કેર પ્લાનને અનુસરો.",
    "Loading local air and weather data…": "સ્થાનિક હવા અને હવામાનનો ડેટા લોડ થઈ રહ્યો છે…", "Regional air quality and humidity are forecasts, not personal monitor readings.": "પ્રાદેશિક હવાની ગુણવત્તા અને ભેજ અંદાજ છે, વ્યક્તિગત સેન્સરની રીડિંગ નથી.",
    "Recent measurements and logged symptoms are included when available.": "ઉપલબ્ધ હોય ત્યારે તાજેતરના માપ અને નોંધાયેલા લક્ષણો સામેલ છે.", "Data used": "વપરાયેલ ડેટા", "Air and weather": "હવા અને હવામાન", "Breathing and check-ins": "શ્વાસ અને લક્ષણ નોંધ",
    "Today": "આજે", "Highlights": "મુખ્ય બાબતો", "Trends": "વલણો", "Measure": "માપ", "Log": "નોંધ", "Care": "સંભાળ", "More": "વધુ", "Meds": "દવાઓ", "Community": "સમુદાય", "Triggers": "ટ્રિગર", "Patterns": "પેટર્ન",
    "Live airflow reading": "લાઇવ હવાના પ્રવાહનું માપ", "Recent readings": "તાજેતરના માપ", "Three-test averages": "ત્રણ પરીક્ષણની સરેરાશ", "Reference details": "સંદર્ભ વિગતો", "Reference category": "સંદર્ભ શ્રેણી", "Choose a reference": "સંદર્ભ પસંદ કરો", "Save details": "વિગતો સાચવો", "Personal best (L/min)": "વ્યક્તિગત શ્રેષ્ઠ (L/min)", "Enter your best": "તમારો શ્રેષ્ઠ આંક દાખલ કરો", "Save range": "શ્રેણી સાચવો", "Connect device": "ઉપકરણ જોડો", "Disconnect": "જોડાણ તોડો", "Device connected": "ઉપકરણ જોડાયેલું છે", "Device disconnected": "ઉપકરણ જોડાયેલું નથી", "Test data": "પરીક્ષણ ડેટા", "Ready when you are": "તમે તૈયાર હો ત્યારે શરૂ કરો", "Start 3 tests": "3 પરીક્ષણ શરૂ કરો", "Measure again": "ફરી માપો", "Three tests complete": "ત્રણ પરીક્ષણ પૂર્ણ", "Average airflow": "સરેરાશ હવાનો પ્રવાહ", "Notes (optional)": "નોંધ (વૈકલ્પિક)", "Save reading": "માપ સાચવો", "Recent live airflow readings": "તાજેતરના હવાના પ્રવાહના માપ", "Latest": "તાજેતરનું", "Pressure": "દબાણ", "Velocity": "વેગ", "Test": "પરીક્ષણ", "Saved": "સાચવ્યું", "Saving…": "સાચવી રહ્યા છીએ…", "Waiting for a reading": "માપની રાહ જોઈ રહ્યા છીએ", "No readings saved yet.": "હજુ સુધી કોઈ માપ સાચવ્યું નથી.", "Reading": "માપ", "Daily average": "દૈનિક સરેરાશ", "Earlier average": "અગાઉની સરેરાશ", "Today average": "આજની સરેરાશ",
    "Check-in": "લક્ષણ નોંધ", "Your check-ins are saved to your account.": "તમારી નોંધ તમારા ખાતામાં સાચવાય છે.", "Symptom severity": "લક્ષણની તીવ્રતા", "Nighttime waking": "રાત્રે જાગવું", "Activity limitation": "પ્રવૃત્તિ પર મર્યાદા", "Suspected exposure": "સંભવિત સંપર્ક", "Medication use as logged": "નોંધાયેલ દવાનો ઉપયોગ", "Timestamp": "સમય", "Save check-in": "નોંધ સાચવો", "Recent check-ins": "તાજેતરની નોંધ", "Missing entries are unknown, not symptom-free days.": "છૂટી ગયેલી નોંધ અજ્ઞાત છે, લક્ષણ વિનાના દિવસો નથી.", "Symptom-free": "લક્ષણ વગર", "None": "નહીં", "Mild": "હળવું", "Moderate": "મધ્યમ", "Severe": "ગંભીર", "No": "ના", "Yes": "હા", "Not sure": "ખાતરી નથી", "Some": "થોડું", "Significant": "નોંધપાત્ર", "None noted": "કંઈ નોંધ્યું નથી", "Outdoor air": "બહારની હવા", "Pollen": "પરાગ", "Exercise": "કસરત", "Other": "અન્ય", "Not logged": "નોંધ્યું નથી", "Recorded as prescribed": "સૂચના મુજબ નોંધ્યું", "Use recorded — see notes": "ઉપયોગ નોંધ્યો — નોંધ જુઓ", "No use recorded": "ઉપયોગ નોંધ્યો નથી",
    "Community map": "સમુદાય નકશો", "reports this month": "આ મહિનાના અહેવાલ", "zones monitored": "નિરીક્ષણ વિસ્તાર", "regional AQI": "પ્રાદેશિક AQI", "Contributing": "યોગદાન ચાલુ", "Opted out": "યોગદાન બંધ", "Contribute anonymously": "અનામિક યોગદાન આપો", "sample reports": "નમૂના અહેવાલ", "Local air quality": "સ્થાનિક હવાની ગુણવત્તા", "How your data is protected": "તમારો ડેટા કેવી રીતે સુરક્ષિત છે", "Appearance": "દેખાવ", "Language & profile": "ભાષા અને પ્રોફાઇલ", "App language": "એપની ભાષા", "Privacy & data": "ગોપનીયતા અને ડેટા", "Remember preferences on this device": "આ ઉપકરણ પર પસંદગીઓ યાદ રાખો", "Export data (JSON)": "ડેટા નિકાસ કરો (JSON)", "Explore": "અન્વેષણ",
    "Already have an account?": "પહેલેથી ખાતું છે?", "New around here?": "અહીં નવા છો?", "Reset password": "પાસવર્ડ રીસેટ કરો", "What should we call you?": "તમને શું કહીને બોલાવીએ?", "Your first name": "તમારું પ્રથમ નામ", "Age (years)": "ઉંમર (વર્ષ)", "Height (cm)": "ઊંચાઈ (સેમી)", "Reference equation": "સંદર્ભ સમીકરણ", "Email address": "ઇમેઇલ સરનામું", "Forgot password?": "પાસવર્ડ ભૂલી ગયા?", "At least 8 characters": "ઓછામાં ઓછા 8 અક્ષરો", "Your password": "તમારો પાસવર્ડ", "Show password": "પાસવર્ડ બતાવો", "Hide password": "પાસવર્ડ છુપાવો", "Create account with Google": "Google સાથે ખાતું બનાવો", "Sign in with Google": "Google સાથે સાઇન ઇન કરો", "Please wait…": "કૃપા કરીને રાહ જુઓ…", "Please acknowledge the prototype notice before continuing.": "આગળ વધતાં પહેલાં સૂચના સ્વીકારો.", "Sign in to view your saved information.": "તમારી સાચવેલી માહિતી જોવા સાઇન ઇન કરો.", "Save your check-ins and measurements to your account.": "તમારી નોંધ અને માપ તમારા ખાતામાં સાચવો.", "Enter your email to reset your password.": "પાસવર્ડ રીસેટ કરવા તમારું ઇમેઇલ દાખલ કરો.", "Password": "પાસવર્ડ", "Sign in": "સાઇન ઇન", "Create account": "ખાતું બનાવો",
  },
};

const supplementalTranslations: Partial<Record<Language, Dict>> = {
  Spanish: {
    "Sex": "Sexo", "Select sex": "Selecciona el sexo",
    "Climate": "Clima", "Recent average": "Promedio reciente", "Trend": "Tendencia",
    "Daily values · past 30 days": "Valores diarios · últimos 30 días",
    "No live reading saved today yet.": "Aún no hay una medición real guardada hoy.", "Add readings on another day to compare your trend.": "Agrega mediciones de otro día para comparar la tendencia.", "Today's airflow is higher than your recent average.": "El flujo de aire de hoy es mayor que el promedio reciente.", "Today's airflow is lower than your recent average.": "El flujo de aire de hoy es menor que el promedio reciente.", "Today's airflow is close to your recent average.": "El flujo de aire de hoy está cerca del promedio reciente.",
    "More days needed for a trend.": "Se necesitan más días para ver la tendencia.",
    "A full 24-hour PM2.5 average is not available yet.": "Aún no hay un promedio completo de PM2.5 de 24 horas.", "Good 24-hour range.": "Rango bueno en 24 horas.", "Moderate 24-hour range.": "Rango moderado en 24 horas.", "Unhealthy for sensitive groups by the 24-hour PM2.5 scale.": "Insalubre para grupos sensibles según la escala de PM2.5 de 24 horas.", "Unhealthy 24-hour range.": "Rango insalubre en 24 horas.", "Very high 24-hour PM2.5.": "PM2.5 muy alto en 24 horas.",
    "AQI is unavailable.": "El ICA no está disponible.", "Good · little or no concern for most people.": "Bueno · poca o ninguna preocupación para la mayoría.", "Moderate · unusually sensitive people may be affected.": "Moderado · puede afectar a personas especialmente sensibles.", "Unhealthy for sensitive groups.": "Insalubre para grupos sensibles.", "Unhealthy · more people may notice effects.": "Insalubre · más personas podrían notar efectos.", "Very unhealthy.": "Muy insalubre.", "Hazardous.": "Peligroso.",
    "Outdoor humidity is unavailable.": "La humedad exterior no está disponible.", "Regional outdoor humidity; indoor levels may differ.": "Humedad exterior regional; la interior puede variar.", "More humid than the recent week; this is an outdoor reading.": "Más humedad que la semana reciente; es una medición exterior.", "Less humid than the recent week; this is an outdoor reading.": "Menos humedad que la semana reciente; es una medición exterior.", "Close to the recent weekly average; this is an outdoor reading.": "Cerca del promedio semanal reciente; es una medición exterior.",
    "Reminders can arrive when this app is closed.": "Los recordatorios pueden llegar con la aplicación cerrada.",
    "Keep this app open for reminders.": "Mantén esta aplicación abierta para recibir recordatorios.",
    "Lower": "Bajo", "Mid": "Medio", "Higher": "Alto", "Latest reading": "Última medición", "Personal best": "Mejor valor personal",
    "Recent measurements and logged symptoms are included when available.": "Se incluyen las mediciones recientes y los síntomas registrados cuando están disponibles.",
    "Regional air quality and humidity are forecasts, not personal monitor readings.": "La calidad del aire y la humedad regionales son estimaciones, no mediciones personales.",
    "Does this match your experience?": "¿Coincide con lo que has sentido?", "reports this month": "informes este mes", "zones monitored": "zonas observadas", "regional AQI": "ICA regional",
    "Map and roads are real. The plotted community entries are presentation samples.": "El mapa y las carreteras son reales. Los informes de la comunidad son ejemplos.", "Near schools · supported by 21 reports": "Cerca de escuelas · 21 informes", "Mold and moisture reports": "Informes de moho y humedad",
    "Name": "Nombre", "Medication name": "Nombre del medicamento", "Instructions (optional)": "Indicaciones (opcional)", "As prescribed": "Según la receta", "Add medication": "Añadir medicamento", "doses logged today": "dosis registradas hoy", "Remove": "Eliminar",
    "Pressure": "Presión", "Velocity": "Velocidad", "Test": "Prueba", "Sample": "Muestra", "Average airflow": "Flujo de aire promedio", "Set your best reading to see a comparison.": "Establece tu mejor medición para ver una comparación.", "Use your personal best for comparison.": "Usa tu mejor valor personal para comparar.",
    "Experimental airflow estimate, not a clinical peak-flow measurement.": "Estimación experimental del flujo de aire; no es una medición clínica de flujo máximo.", "Reference details": "Datos de referencia", "Reference category": "Categoría de referencia", "Used for an adult reference estimate from ages 15–85.": "Se usa para una estimación de referencia en adultos de 15 a 85 años.", "Personal best (L/min)": "Mejor valor personal (L/min)", "Set your best on this device to see a range.": "Establece tu mejor valor en este dispositivo para ver un rango.", "Save range": "Guardar rango", "Pressure · sensor pressure difference": "Presión · diferencia de presión del sensor", "Velocity · estimated air speed": "Velocidad · velocidad estimada del aire", "No readings saved yet.": "Aún no hay mediciones guardadas.", "Readings": "Mediciones", "Check-ins": "Registros", "Days shown": "Días mostrados", "Breathing": "Respiración", "Symptoms": "Síntomas", "Limitation": "Limitación", "Only saved measurements and symptom check-ins are shown.": "Solo se muestran las mediciones y los registros de síntomas guardados.",
    "Saved to your account": "Guardado en tu cuenta", "No care plan yet.": "Aún no hay un plan de cuidado.", "Remove plan": "Eliminar plan", "Check-in: 6:00 PM · Measurement: 7:00 PM": "Registro: 6:00 p. m. · Medición: 7:00 p. m.", "log entries": "registros", "readings": "mediciones", "Hide": "Ocultar", "Preview": "Vista previa", "report": "informe", "Print / save PDF": "Imprimir / guardar PDF", "AsthmaGuard · Report": "AsthmaGuard · Informe", "AsthmaGuard · Weekly report": "AsthmaGuard · Informe semanal", "Generated": "Generado", "Latest:": "Última medición:", "Saved readings:": "Mediciones guardadas:", "saved entries;": "registros guardados;", "report symptoms.": "indicaron síntomas.", "Regional conditions": "Condiciones regionales", "AQI unavailable": "ICA no disponible", "PM2.5 unavailable": "PM2.5 no disponible", "Humidity unavailable": "Humedad no disponible", "Risk estimate": "Estimación de riesgo", "Regional air and weather values are modelled estimates. This summary does not diagnose or recommend treatment.": "Los datos regionales del aire y el tiempo son estimaciones. Este resumen no diagnostica ni recomienda tratamientos.",
    "Today's reminders": "Recordatorios de hoy", "School mode": "Modo escolar", "Your planned activity & time": "Actividad y hora previstas", "Active days": "Días activos", "days with a log or reading": "días con un registro o una medición", "Open your readings, air quality, and check-in history.": "Consulta tus mediciones, la calidad del aire y el historial de registros.", "Only saved readings and check-ins are plotted. No entry is treated as missing data.": "Solo se muestran las mediciones y los registros guardados. Las entradas ausentes se indican como datos faltantes.", "Done": "Listo", "Profile": "Perfil", "Could not load your account. Check your connection and reload.": "No se pudo cargar tu cuenta. Comprueba la conexión y vuelve a cargar la página.", "Choose a reference": "Elige una referencia", "Female": "Femenino", "Male": "Masculino", "or": "o",
    "Hi {name}! Ready to check your breathing today?": "¡Hola, {name}! ¿Listo para revisar tu respiración hoy?", "Good morning, {name}. Here's your breathing summary.": "Buenos días, {name}. Aquí está tu resumen de respiración.",
    "Push reminders could not be enabled on this device.": "No se pudieron activar los recordatorios en este dispositivo.", "You have a reminder.": "Tienes un recordatorio.", "Allow notifications in your browser to turn reminders on.": "Permite las notificaciones en el navegador para activar los recordatorios.", "Notifications are unavailable or blocked in this browser.": "Las notificaciones no están disponibles o están bloqueadas en este navegador.", "Sample care plan added to your account": "Se añadió un plan de cuidado de muestra a tu cuenta", "Could not add the sample care plan. Check Firebase Storage access.": "No se pudo añadir el plan de cuidado de muestra. Comprueba el acceso a Firebase Storage.", "Take a moment to record how you are feeling.": "Tómate un momento para registrar cómo te sientes.", "Record a breathing measurement if it is a good time for you.": "Registra una medición respiratoria cuando te resulte conveniente.", "Daily check-in": "Registro diario", "Breathing reading": "Medición respiratoria",
    "Not quite": "No exactamente", "Your feedback refines the weights. The more days you log, the more confident and specific these profiles become.": "Tus comentarios ajustan los valores. Cuantos más días registres, más precisos serán estos perfiles.", "Strategies adapt as your trigger profile evolves.": "Las estrategias se adaptan a medida que cambia tu perfil de desencadenantes.", "Unhealthy": "Insalubre", "Good": "Bueno", "Tree planting": "Plantación de árboles", "High-traffic corridors · backed by": "Corredores con mucho tráfico · respaldados por", "Idle-reduction zones": "Zonas para reducir el ralentí", "Housing inspections": "Inspecciones de viviendas", "Only anonymized, aggregated counts are contributed — never individual data. You can opt out at any time here or in Settings.": "Solo se aportan recuentos anónimos y agrupados, nunca datos individuales. Puedes dejar de participar aquí o en Ajustes.", "Video guidance can be enabled in Settings when available.": "La guía en vídeo se podrá activar en Ajustes cuando esté disponible.", "AsthmaGuard SB · Your health records in one place.": "AsthmaGuard SB · Tus datos de salud en un solo lugar.", "Test data": "Datos de prueba", "Device connected": "Dispositivo conectado", "Device disconnected": "Dispositivo desconectado", "Connect device": "Conectar dispositivo", "Disconnect": "Desconectar", "Mean of three test results. Pressure averages": "Promedio de tres pruebas. Presión promedio:", "Pa; air speed averages": "Pa; velocidad promedio del aire:",
    "The device is reporting simulated values. Live sensor data is required to save a reading.": "El dispositivo está mostrando valores simulados. Se necesitan datos reales del sensor para guardar una medición.", "School nurse programs share information only with your explicit consent (FERPA). Telehealth options accept most insurance.": "Los programas de enfermería escolar comparten información solo con tu consentimiento expreso (FERPA). Las opciones de telesalud aceptan la mayoría de los seguros.", "If symptoms are severe — trouble speaking, lips or fingernails turning blue, or rescue medication not helping — call 911 immediately.": "Si los síntomas son graves —dificultad para hablar, labios o uñas azulados, o el medicamento de rescate no ayuda— llama al 911 de inmediato.", "Medication: use the existing clinician-prescribed schedule in your saved plan. No medication or dose is generated here.": "Medicamentos: sigue el horario indicado por tu profesional en el plan guardado. Aquí no se indican medicamentos ni dosis.", "Preferences, risk inputs, and device connection only. Check-in notes and care files remain in memory. Turning this off clears saved preferences.": "Solo se guardan las preferencias, los datos de riesgo y la conexión del dispositivo. Las notas y los archivos de cuidado permanecen en memoria. Al desactivarlo, se borran las preferencias guardadas.", "Printable summaries include trends, medication use, and identified triggers — ready for your next provider visit.": "Los informes imprimibles incluyen tendencias, uso de medicamentos y desencadenantes identificados, listos para tu próxima consulta.", "Your check-ins, measurements, and chat are saved to your account.": "Tus registros, mediciones y conversaciones se guardan en tu cuenta.", "Sign in is unavailable until Firebase is configured.": "No se puede iniciar sesión hasta configurar Firebase.", "Your readings and records are saved to your account.": "Tus mediciones y registros se guardan en tu cuenta.",
    "Based on your logs and local conditions": "Según tus registros y las condiciones locales", "About these triggers": "Sobre estos desencadenantes", "Reduce exposure": "Reduce la exposición", "Specific to your triggers": "Según tus desencadenantes", "Community reports": "Informes de la comunidad", "Add a note": "Añadir una nota", "Age": "Edad", "Height": "Estatura", "Anything you'd like to remember…": "Algo que quieras recordar…", "South Brunswick resources": "Recursos de South Brunswick", "Crisis lines and emergency services": "Líneas de ayuda y servicios de emergencia",
  },
  Hindi: {
    "Sex": "\u0932\u093f\u0902\u0917", "Select sex": "\u0932\u093f\u0902\u0917 \u091a\u0941\u0928\u0947\u0902",
    "Climate": "जलवायु", "Recent average": "हाल का औसत", "Trend": "रुझान",
    "Daily values · past 30 days": "दैनिक मान · पिछले 30 दिन",
    "No live reading saved today yet.": "आज की कोई वास्तविक रीडिंग अभी सेव नहीं है।", "Add readings on another day to compare your trend.": "तुलना के लिए किसी और दिन की रीडिंग जोड़ें।", "Today's airflow is higher than your recent average.": "आज का वायु प्रवाह हाल के औसत से अधिक है।", "Today's airflow is lower than your recent average.": "आज का वायु प्रवाह हाल के औसत से कम है।", "Today's airflow is close to your recent average.": "आज का वायु प्रवाह हाल के औसत के करीब है।",
    "More days needed for a trend.": "रुझान देखने के लिए और दिनों का डेटा चाहिए।",
    "A full 24-hour PM2.5 average is not available yet.": "अभी पूरा 24 घंटे का PM2.5 औसत उपलब्ध नहीं है।", "Good 24-hour range.": "24 घंटे की अच्छी सीमा।", "Moderate 24-hour range.": "24 घंटे की मध्यम सीमा।", "Unhealthy for sensitive groups by the 24-hour PM2.5 scale.": "24 घंटे के PM2.5 पैमाने के अनुसार संवेदनशील समूहों के लिए अस्वास्थ्यकर।", "Unhealthy 24-hour range.": "24 घंटे की अस्वास्थ्यकर सीमा।", "Very high 24-hour PM2.5.": "24 घंटे का PM2.5 बहुत अधिक है।",
    "AQI is unavailable.": "AQI उपलब्ध नहीं है।", "Good · little or no concern for most people.": "अच्छा · अधिकांश लोगों के लिए बहुत कम या कोई चिंता नहीं।", "Moderate · unusually sensitive people may be affected.": "मध्यम · बहुत संवेदनशील लोगों पर असर हो सकता है।", "Unhealthy for sensitive groups.": "संवेदनशील समूहों के लिए अस्वास्थ्यकर।", "Unhealthy · more people may notice effects.": "अस्वास्थ्यकर · अधिक लोगों पर असर हो सकता है।", "Very unhealthy.": "बहुत अस्वास्थ्यकर।", "Hazardous.": "खतरनाक।",
    "Outdoor humidity is unavailable.": "बाहरी आर्द्रता उपलब्ध नहीं है।", "Regional outdoor humidity; indoor levels may differ.": "क्षेत्रीय बाहरी आर्द्रता; घर के अंदर का स्तर अलग हो सकता है।", "More humid than the recent week; this is an outdoor reading.": "हाल के सप्ताह से अधिक आर्द्र; यह बाहरी माप है।", "Less humid than the recent week; this is an outdoor reading.": "हाल के सप्ताह से कम आर्द्र; यह बाहरी माप है।", "Close to the recent weekly average; this is an outdoor reading.": "हाल के साप्ताहिक औसत के करीब; यह बाहरी माप है।",
    "Reminders can arrive when this app is closed.": "ऐप बंद होने पर भी रिमाइंडर आ सकते हैं।",
    "Keep this app open for reminders.": "रिमाइंडर के लिए ऐप खुला रखें।",
    "Lower": "कम", "Mid": "मध्यम", "Higher": "अधिक", "Latest reading": "नवीनतम माप", "Personal best": "आपका सर्वोत्तम माप",
    "Recent measurements and logged symptoms are included when available.": "उपलब्ध होने पर हाल के माप और दर्ज लक्षण शामिल हैं।", "Regional air quality and humidity are forecasts, not personal monitor readings.": "क्षेत्रीय वायु गुणवत्ता और नमी पूर्वानुमान हैं, व्यक्तिगत मॉनिटर के माप नहीं।", "Does this match your experience?": "क्या यह आपके अनुभव से मेल खाता है?",
    "reports this month": "इस महीने की रिपोर्ट", "zones monitored": "निगरानी वाले क्षेत्र", "regional AQI": "क्षेत्रीय AQI", "Map and roads are real. The plotted community entries are presentation samples.": "नक्शा और सड़कें वास्तविक हैं। समुदाय की दिखाई गई प्रविष्टियाँ प्रस्तुति के नमूने हैं।", "Near schools · supported by 21 reports": "स्कूलों के पास · 21 रिपोर्ट", "Mold and moisture reports": "फफूंदी और नमी की रिपोर्ट",
    "Name": "नाम", "Medication name": "दवा का नाम", "Instructions (optional)": "निर्देश (वैकल्पिक)", "As prescribed": "पर्चे के अनुसार", "Add medication": "दवा जोड़ें", "doses logged today": "आज दर्ज खुराक", "Remove": "हटाएँ", "Pressure": "दबाव", "Velocity": "वेग", "Test": "जाँच", "Sample": "नमूना", "Average airflow": "औसत वायु प्रवाह", "Set your best reading to see a comparison.": "तुलना देखने के लिए अपना सर्वोत्तम माप सेट करें।", "Use your personal best for comparison.": "तुलना के लिए अपने सर्वोत्तम माप का उपयोग करें।",
    "Experimental airflow estimate, not a clinical peak-flow measurement.": "प्रायोगिक वायु प्रवाह अनुमान; यह क्लिनिकल पीक-फ्लो माप नहीं है।", "Reference details": "संदर्भ विवरण", "Reference category": "संदर्भ श्रेणी", "Used for an adult reference estimate from ages 15–85.": "15–85 वर्ष के वयस्कों के संदर्भ अनुमान के लिए उपयोग किया जाता है।", "Personal best (L/min)": "सर्वोत्तम व्यक्तिगत माप (L/min)", "Set your best on this device to see a range.": "सीमा देखने के लिए इस उपकरण पर अपना सर्वोत्तम माप सेट करें।", "Save range": "सीमा सहेजें", "Pressure · sensor pressure difference": "दबाव · सेंसर का दबाव अंतर", "Velocity · estimated air speed": "वेग · अनुमानित हवा की गति", "No readings saved yet.": "अभी तक कोई माप सहेजा नहीं गया।", "Readings": "माप", "Check-ins": "लक्षण लॉग", "Days shown": "दिखाए गए दिन", "Breathing": "साँस", "Symptoms": "लक्षण", "Limitation": "गतिविधि की सीमा", "Only saved measurements and symptom check-ins are shown.": "केवल सहेजे गए माप और लक्षण लॉग दिखाए जाते हैं।",
    "Saved to your account": "आपके खाते में सहेजा गया", "No care plan yet.": "अभी कोई देखभाल योजना नहीं है।", "Remove plan": "योजना हटाएँ", "Check-in: 6:00 PM · Measurement: 7:00 PM": "लक्षण लॉग: शाम 6:00 · माप: शाम 7:00", "log entries": "लॉग प्रविष्टियाँ", "readings": "माप", "Hide": "छिपाएँ", "Preview": "पूर्वावलोकन", "report": "रिपोर्ट", "Print / save PDF": "प्रिंट / PDF सहेजें", "AsthmaGuard · Report": "AsthmaGuard · रिपोर्ट", "AsthmaGuard · Weekly report": "AsthmaGuard · साप्ताहिक रिपोर्ट", "Generated": "बनाई गई", "Latest:": "नवीनतम:", "Saved readings:": "सहेजे गए माप:", "saved entries;": "सहेजी प्रविष्टियाँ;", "report symptoms.": "में लक्षण दर्ज हुए।", "Regional conditions": "क्षेत्रीय स्थिति", "AQI unavailable": "AQI उपलब्ध नहीं", "PM2.5 unavailable": "PM2.5 उपलब्ध नहीं", "Humidity unavailable": "नमी उपलब्ध नहीं", "Risk estimate": "जोखिम अनुमान", "Regional air and weather values are modelled estimates. This summary does not diagnose or recommend treatment.": "क्षेत्रीय हवा और मौसम के मान अनुमान हैं। यह सारांश निदान या उपचार की सलाह नहीं देता।",
    "Today's reminders": "आज के रिमाइंडर", "School mode": "स्कूल मोड", "Your planned activity & time": "आपकी नियोजित गतिविधि और समय", "Active days": "सक्रिय दिन", "days with a log or reading": "लॉग या माप वाले दिन", "Open your readings, air quality, and check-in history.": "अपने माप, वायु गुणवत्ता और लक्षण लॉग का इतिहास देखें।", "Only saved readings and check-ins are plotted. No entry is treated as missing data.": "केवल सहेजे गए माप और लॉग दिखाए जाते हैं। अनुपस्थित प्रविष्टियों को लक्षण-मुक्त दिन नहीं माना जाता।", "Done": "हो गया", "Profile": "प्रोफ़ाइल", "Could not load your account. Check your connection and reload.": "आपका खाता लोड नहीं हुआ। कनेक्शन जाँचें और पृष्ठ फिर से लोड करें।", "Choose a reference": "संदर्भ चुनें", "Female": "महिला", "Male": "पुरुष", "or": "या",
    "Hi {name}! Ready to check your breathing today?": "नमस्ते {name}! आज साँस की जाँच के लिए तैयार हैं?", "Good morning, {name}. Here's your breathing summary.": "सुप्रभात {name}। यहाँ आपकी साँस का सारांश है।",
    "Push reminders could not be enabled on this device.": "इस डिवाइस पर रिमाइंडर चालू नहीं हो सके।", "You have a reminder.": "आपके लिए एक रिमाइंडर है।", "Allow notifications in your browser to turn reminders on.": "रिमाइंडर चालू करने के लिए ब्राउज़र में सूचनाओं की अनुमति दें।", "Notifications are unavailable or blocked in this browser.": "इस ब्राउज़र में सूचनाएँ उपलब्ध नहीं हैं या अवरुद्ध हैं।", "Sample care plan added to your account": "आपके खाते में नमूना देखभाल योजना जोड़ दी गई है", "Could not add the sample care plan. Check Firebase Storage access.": "नमूना देखभाल योजना नहीं जोड़ी जा सकी। Firebase Storage की पहुँच जाँचें।", "Take a moment to record how you are feeling.": "आप कैसा महसूस कर रहे हैं, यह दर्ज करने के लिए थोड़ा समय लें।", "Record a breathing measurement if it is a good time for you.": "सुविधा होने पर साँस का माप दर्ज करें।", "Daily check-in": "दैनिक लक्षण लॉग", "Breathing reading": "साँस का माप",
    "Not quite": "पूरी तरह नहीं", "Your feedback refines the weights. The more days you log, the more confident and specific these profiles become.": "आपकी प्रतिक्रिया अनुमान को बेहतर बनाती है। जितने अधिक दिन आप दर्ज करेंगे, ये प्रोफ़ाइल उतनी स्पष्ट होंगी।", "Strategies adapt as your trigger profile evolves.": "आपकी ट्रिगर प्रोफ़ाइल बदलने पर सुझाव भी बदलते हैं।", "Unhealthy": "खराब", "Good": "अच्छा", "Tree planting": "वृक्षारोपण", "High-traffic corridors · backed by": "अधिक यातायात वाले मार्ग · रिपोर्टों के आधार पर", "Idle-reduction zones": "वाहन निष्क्रियता घटाने वाले क्षेत्र", "Housing inspections": "आवास निरीक्षण", "Only anonymized, aggregated counts are contributed — never individual data. You can opt out at any time here or in Settings.": "केवल गुमनाम, समेकित गणना साझा होती है—व्यक्तिगत डेटा नहीं। आप यहाँ या सेटिंग्स में कभी भी साझा करना बंद कर सकते हैं।", "Video guidance can be enabled in Settings when available.": "उपलब्ध होने पर सेटिंग्स में वीडियो मार्गदर्शन चालू किया जा सकता है।", "AsthmaGuard SB · Your health records in one place.": "AsthmaGuard SB · आपके स्वास्थ्य रिकॉर्ड एक ही जगह।", "Test data": "परीक्षण डेटा", "Device connected": "डिवाइस जुड़ा है", "Device disconnected": "डिवाइस जुड़ा नहीं है", "Connect device": "डिवाइस जोड़ें", "Disconnect": "डिस्कनेक्ट", "Mean of three test results. Pressure averages": "तीन परीक्षणों का औसत। दबाव का औसत:", "Pa; air speed averages": "Pa; हवा की गति का औसत:",
    "The device is reporting simulated values. Live sensor data is required to save a reading.": "डिवाइस सिम्युलेटेड मान दिखा रहा है। माप सहेजने के लिए सेंसर का वास्तविक डेटा ज़रूरी है।", "School nurse programs share information only with your explicit consent (FERPA). Telehealth options accept most insurance.": "स्कूल नर्स कार्यक्रम आपकी स्पष्ट सहमति से ही जानकारी साझा करते हैं (FERPA)। टेलीहेल्थ सेवाएँ अधिकतर बीमा स्वीकार करती हैं।", "If symptoms are severe — trouble speaking, lips or fingernails turning blue, or rescue medication not helping — call 911 immediately.": "यदि लक्षण गंभीर हों—बोलने में कठिनाई, होंठ या नाखून नीले पड़ना, या राहत की दवा से मदद न मिलना—तो तुरंत 911 पर कॉल करें।", "Medication: use the existing clinician-prescribed schedule in your saved plan. No medication or dose is generated here.": "दवा: अपने सहेजे गए प्लान में चिकित्सक द्वारा दिए गए समय का पालन करें। यहाँ कोई दवा या खुराक सुझाई नहीं जाती।", "Preferences, risk inputs, and device connection only. Check-in notes and care files remain in memory. Turning this off clears saved preferences.": "केवल प्राथमिकताएँ, जोखिम के संकेत और डिवाइस कनेक्शन सहेजे जाते हैं। लॉग नोट और देखभाल फ़ाइलें स्मृति में रहती हैं। इसे बंद करने से सहेजी प्राथमिकताएँ मिट जाएँगी।", "Printable summaries include trends, medication use, and identified triggers — ready for your next provider visit.": "प्रिंट करने योग्य सारांश में रुझान, दवा का उपयोग और पहचाने गए ट्रिगर शामिल हैं—अगली चिकित्सकीय मुलाक़ात के लिए तैयार।", "Your check-ins, measurements, and chat are saved to your account.": "आपके लॉग, माप और चैट आपके खाते में सहेजे जाते हैं।", "Sign in is unavailable until Firebase is configured.": "Firebase सेट होने तक साइन इन उपलब्ध नहीं है।", "Your readings and records are saved to your account.": "आपके माप और रिकॉर्ड आपके खाते में सहेजे जाते हैं।",
    "Based on your logs and local conditions": "आपके लॉग और स्थानीय परिस्थितियों के आधार पर", "About these triggers": "इन ट्रिगर के बारे में", "Reduce exposure": "संपर्क कम करें", "Specific to your triggers": "आपके ट्रिगर के अनुसार", "Community reports": "समुदाय की रिपोर्ट", "Add a note": "नोट जोड़ें", "Age": "उम्र", "Height": "लंबाई", "Anything you'd like to remember…": "कुछ याद रखना चाहते हैं…", "South Brunswick resources": "साउथ ब्रंसविक के संसाधन", "Crisis lines and emergency services": "संकट हेल्पलाइन और आपातकालीन सेवाएँ",
  },
  Gujarati: {
    "Sex": "\u0ab2\u0abf\u0a82\u0a97", "Select sex": "\u0ab2\u0abf\u0a82\u0a97 \u0aaa\u0ab8\u0a82\u0aa6 \u0a95\u0ab0\u0acb",
    "Climate": "આબોહવા", "Recent average": "તાજેતરની સરેરાશ", "Trend": "વલણ",
    "Daily values · past 30 days": "દૈનિક મૂલ્યો · છેલ્લા 30 દિવસ",
    "No live reading saved today yet.": "આજે હજી કોઈ વાસ્તવિક માપ સાચવ્યું નથી.", "Add readings on another day to compare your trend.": "વલણની તુલના માટે બીજા દિવસના માપ ઉમેરો.", "Today's airflow is higher than your recent average.": "આજનો હવાનો પ્રવાહ તાજેતરની સરેરાશ કરતાં વધુ છે.", "Today's airflow is lower than your recent average.": "આજનો હવાનો પ્રવાહ તાજેતરની સરેરાશ કરતાં ઓછો છે.", "Today's airflow is close to your recent average.": "આજનો હવાનો પ્રવાહ તાજેતરની સરેરાશની નજીક છે.",
    "More days needed for a trend.": "વલણ જોવા માટે વધુ દિવસોના માપ જરૂરી છે.",
    "A full 24-hour PM2.5 average is not available yet.": "હજુ સંપૂર્ણ 24 કલાકની PM2.5 સરેરાશ ઉપલબ્ધ નથી.", "Good 24-hour range.": "24 કલાકની સારી મર્યાદા.", "Moderate 24-hour range.": "24 કલાકની મધ્યમ મર્યાદા.", "Unhealthy for sensitive groups by the 24-hour PM2.5 scale.": "24 કલાકના PM2.5 માપદંડ મુજબ સંવેદનશીલ જૂથો માટે અસ્વસ્થ.", "Unhealthy 24-hour range.": "24 કલાકની અસ્વસ્થ મર્યાદા.", "Very high 24-hour PM2.5.": "24 કલાકનું PM2.5 ખૂબ ઊંચું છે.",
    "AQI is unavailable.": "AQI ઉપલબ્ધ નથી.", "Good · little or no concern for most people.": "સારું · મોટાભાગના લોકો માટે ઓછી કે કોઈ ચિંતા નહીં.", "Moderate · unusually sensitive people may be affected.": "મધ્યમ · અત્યંત સંવેદનશીલ લોકોને અસર થઈ શકે.", "Unhealthy for sensitive groups.": "સંવેદનશીલ જૂથો માટે અસ્વસ્થ.", "Unhealthy · more people may notice effects.": "અસ્વસ્થ · વધુ લોકોને અસર જણાઈ શકે.", "Very unhealthy.": "ખૂબ અસ્વસ્થ.", "Hazardous.": "જોખમી.",
    "Outdoor humidity is unavailable.": "બહારની ભેજ ઉપલબ્ધ નથી.", "Regional outdoor humidity; indoor levels may differ.": "પ્રાદેશિક બહારની ભેજ; અંદરની ભેજ અલગ હોઈ શકે.", "More humid than the recent week; this is an outdoor reading.": "તાજેતરના અઠવાડિયા કરતાં વધુ ભેજ; આ બહારનું માપ છે.", "Less humid than the recent week; this is an outdoor reading.": "તાજેતરના અઠવાડિયા કરતાં ઓછી ભેજ; આ બહારનું માપ છે.", "Close to the recent weekly average; this is an outdoor reading.": "તાજેતરના સાપ્તાહિક સરેરાશ જેટલી ભેજ; આ બહારનું માપ છે.",
    "Reminders can arrive when this app is closed.": "એપ બંધ હોય ત્યારે પણ રીમાઇન્ડર મળી શકે છે.",
    "Keep this app open for reminders.": "રીમાઇન્ડર માટે એપ ખુલ્લી રાખો.",
    "Lower": "ઓછું", "Mid": "મધ્યમ", "Higher": "વધુ", "Latest reading": "તાજેતરનું માપ", "Personal best": "તમારું શ્રેષ્ઠ માપ",
    "Recent measurements and logged symptoms are included when available.": "ઉપલબ્ધ હોય ત્યારે તાજેતરના માપ અને નોંધાયેલા લક્ષણો સામેલ છે.", "Regional air quality and humidity are forecasts, not personal monitor readings.": "પ્રાદેશિક હવાની ગુણવત્તા અને ભેજ અંદાજ છે, વ્યક્તિગત મોનિટરના માપ નથી.", "Does this match your experience?": "શું આ તમારા અનુભવ સાથે મેળ ખાય છે?",
    "reports this month": "આ મહિનાના અહેવાલ", "zones monitored": "નિરીક્ષણ કરાયેલા વિસ્તારો", "regional AQI": "પ્રાદેશિક AQI", "Map and roads are real. The plotted community entries are presentation samples.": "નકશો અને રસ્તા વાસ્તવિક છે. દર્શાવેલી સમુદાય નોંધો પ્રસ્તુતિ માટેના નમૂના છે.", "Near schools · supported by 21 reports": "શાળાઓ પાસે · 21 અહેવાલ", "Mold and moisture reports": "ફૂગ અને ભેજના અહેવાલ",
    "Name": "નામ", "Medication name": "દવાનું નામ", "Instructions (optional)": "સૂચનાઓ (વૈકલ્પિક)", "As prescribed": "પ્રિસ્ક્રિપ્શન મુજબ", "Add medication": "દવા ઉમેરો", "doses logged today": "આજે નોંધાયેલા ડોઝ", "Remove": "દૂર કરો", "Pressure": "દબાણ", "Velocity": "વેગ", "Test": "પરીક્ષણ", "Sample": "નમૂનો", "Average airflow": "સરેરાશ હવાનો પ્રવાહ", "Set your best reading to see a comparison.": "તુલના જોવા માટે તમારું શ્રેષ્ઠ માપ સેટ કરો.", "Use your personal best for comparison.": "તુલના માટે તમારા શ્રેષ્ઠ માપનો ઉપયોગ કરો.",
    "Experimental airflow estimate, not a clinical peak-flow measurement.": "પ્રાયોગિક હવા પ્રવાહનો અંદાજ; આ ક્લિનિકલ પીક-ફ્લો માપ નથી.", "Reference details": "સંદર્ભની વિગતો", "Reference category": "સંદર્ભ શ્રેણી", "Used for an adult reference estimate from ages 15–85.": "15–85 વર્ષની વયના પુખ્ત વયના અંદાજ માટે વપરાય છે.", "Personal best (L/min)": "શ્રેષ્ઠ વ્યક્તિગત માપ (L/min)", "Set your best on this device to see a range.": "શ્રેણી જોવા માટે આ ઉપકરણ પર તમારું શ્રેષ્ઠ માપ સેટ કરો.", "Save range": "શ્રેણી સાચવો", "Pressure · sensor pressure difference": "દબાણ · સેન્સર દબાણનો તફાવત", "Velocity · estimated air speed": "વેગ · અંદાજિત હવાની ઝડપ", "No readings saved yet.": "હજુ સુધી કોઈ માપ સાચવ્યું નથી.", "Readings": "માપ", "Check-ins": "લક્ષણ નોંધ", "Days shown": "દર્શાવેલા દિવસો", "Breathing": "શ્વાસ", "Symptoms": "લક્ષણો", "Limitation": "પ્રવૃત્તિ મર્યાદા", "Only saved measurements and symptom check-ins are shown.": "માત્ર સાચવેલા માપ અને લક્ષણ નોંધ દર્શાવાય છે.",
    "Saved to your account": "તમારા ખાતામાં સાચવ્યું", "No care plan yet.": "હજુ કોઈ સંભાળ યોજના નથી.", "Remove plan": "યોજના દૂર કરો", "Check-in: 6:00 PM · Measurement: 7:00 PM": "લક્ષણ નોંધ: સાંજે 6:00 · માપ: સાંજે 7:00", "log entries": "નોંધ", "readings": "માપ", "Hide": "છુપાવો", "Preview": "પૂર્વાવલોકન", "report": "અહેવાલ", "Print / save PDF": "પ્રિન્ટ / PDF સાચવો", "AsthmaGuard · Report": "AsthmaGuard · અહેવાલ", "AsthmaGuard · Weekly report": "AsthmaGuard · સાપ્તાહિક અહેવાલ", "Generated": "બનાવ્યું", "Latest:": "તાજેતરનું:", "Saved readings:": "સાચવેલા માપ:", "saved entries;": "સાચવેલી નોંધ;", "report symptoms.": "માં લક્ષણ નોંધ્યાં.", "Regional conditions": "પ્રાદેશિક સ્થિતિ", "AQI unavailable": "AQI ઉપલબ્ધ નથી", "PM2.5 unavailable": "PM2.5 ઉપલબ્ધ નથી", "Humidity unavailable": "ભેજ ઉપલબ્ધ નથી", "Risk estimate": "જોખમનો અંદાજ", "Regional air and weather values are modelled estimates. This summary does not diagnose or recommend treatment.": "પ્રાદેશિક હવા અને હવામાનના આંકડા અંદાજ છે. આ સારાંશ નિદાન કે સારવારની સલાહ આપતો નથી.",
    "Today's reminders": "આજના રિમાઇન્ડર", "School mode": "શાળા મોડ", "Your planned activity & time": "તમારી નક્કી કરેલી પ્રવૃત્તિ અને સમય", "Active days": "સક્રિય દિવસો", "days with a log or reading": "નોંધ અથવા માપવાળા દિવસો", "Open your readings, air quality, and check-in history.": "તમારા માપ, હવાની ગુણવત્તા અને નોંધનો ઇતિહાસ જુઓ.", "Only saved readings and check-ins are plotted. No entry is treated as missing data.": "માત્ર સાચવેલા માપ અને નોંધ દર્શાવાય છે. ન હોય તેવી નોંધને લક્ષણ વિનાનો દિવસ માનવામાં આવતો નથી.", "Done": "થઈ ગયું", "Profile": "પ્રોફાઇલ", "Could not load your account. Check your connection and reload.": "તમારું ખાતું લોડ થઈ શક્યું નથી. કનેક્શન તપાસો અને ફરીથી લોડ કરો.", "Choose a reference": "સંદર્ભ પસંદ કરો", "Female": "સ્ત્રી", "Male": "પુરુષ", "or": "અથવા",
    "Hi {name}! Ready to check your breathing today?": "નમસ્તે {name}! આજે શ્વાસ તપાસવા તૈયાર છો?", "Good morning, {name}. Here's your breathing summary.": "સુપ્રભાત {name}. અહીં તમારા શ્વાસનો સારાંશ છે.",
    "Push reminders could not be enabled on this device.": "આ ઉપકરણ પર રિમાઇન્ડર ચાલુ થઈ શક્યા નથી.", "You have a reminder.": "તમારા માટે એક રિમાઇન્ડર છે.", "Allow notifications in your browser to turn reminders on.": "રિમાઇન્ડર ચાલુ કરવા બ્રાઉઝરમાં સૂચનાઓની મંજૂરી આપો.", "Notifications are unavailable or blocked in this browser.": "આ બ્રાઉઝરમાં સૂચનાઓ ઉપલબ્ધ નથી અથવા અવરોધિત છે.", "Sample care plan added to your account": "તમારા ખાતામાં નમૂનાની સંભાળ યોજના ઉમેરાઈ છે", "Could not add the sample care plan. Check Firebase Storage access.": "નમૂનાની સંભાળ યોજના ઉમેરી શકાઈ નથી. Firebase Storage ઍક્સેસ તપાસો.", "Take a moment to record how you are feeling.": "તમને કેવું લાગે છે તે નોંધવા થોડો સમય લો.", "Record a breathing measurement if it is a good time for you.": "અનુકૂળ હોય ત્યારે શ્વાસનું માપ નોંધો.", "Daily check-in": "દૈનિક લક્ષણ નોંધ", "Breathing reading": "શ્વાસનું માપ",
    "Not quite": "સંપૂર્ણપણે નહીં", "Your feedback refines the weights. The more days you log, the more confident and specific these profiles become.": "તમારો પ્રતિસાદ અંદાજ સુધારે છે. તમે જેટલા વધુ દિવસ નોંધશો, આ પ્રોફાઇલ એટલી સ્પષ્ટ બનશે.", "Strategies adapt as your trigger profile evolves.": "તમારી ટ્રિગર પ્રોફાઇલ બદલાતાં સૂચનો પણ બદલાય છે.", "Unhealthy": "અસ્વસ્થ", "Good": "સારું", "Tree planting": "વૃક્ષારોપણ", "High-traffic corridors · backed by": "વધુ ટ્રાફિકવાળા માર્ગ · અહેવાલોના આધારે", "Idle-reduction zones": "વાહન નિષ્ક્રિયતા ઘટાડવાના વિસ્તારો", "Housing inspections": "ઘરની તપાસ", "Only anonymized, aggregated counts are contributed — never individual data. You can opt out at any time here or in Settings.": "માત્ર અનામી, એકત્રિત ગણતરીઓ જ શેર થાય છે—વ્યક્તિગત ડેટા નહીં. તમે અહીં અથવા સેટિંગ્સમાં ક્યારે પણ બહાર નીકળી શકો છો.", "Video guidance can be enabled in Settings when available.": "ઉપલબ્ધ થાય ત્યારે સેટિંગ્સમાં વિડિયો માર્ગદર્શન ચાલુ કરી શકાય છે.", "AsthmaGuard SB · Your health records in one place.": "AsthmaGuard SB · તમારા આરોગ્યના રેકોર્ડ એક જ જગ્યાએ.", "Test data": "પરીક્ષણ ડેટા", "Device connected": "ઉપકરણ જોડાયેલું છે", "Device disconnected": "ઉપકરણ જોડાયેલું નથી", "Connect device": "ઉપકરણ જોડો", "Disconnect": "જોડાણ દૂર કરો", "Mean of three test results. Pressure averages": "ત્રણ પરીક્ષણોની સરેરાશ. દબાણની સરેરાશ:", "Pa; air speed averages": "Pa; હવાની ઝડપની સરેરાશ:",
    "The device is reporting simulated values. Live sensor data is required to save a reading.": "ઉપકરણ સિમ્યુલેટેડ મૂલ્યો બતાવે છે. માપ સાચવવા સેન્સરનો વાસ્તવિક ડેટા જરૂરી છે.", "School nurse programs share information only with your explicit consent (FERPA). Telehealth options accept most insurance.": "શાળા નર્સ કાર્યક્રમો તમારી સ્પષ્ટ સંમતિથી જ માહિતી વહેંચે છે (FERPA). ટેલિહેલ્થ વિકલ્પો મોટાભાગના વીમા સ્વીકારે છે.", "If symptoms are severe — trouble speaking, lips or fingernails turning blue, or rescue medication not helping — call 911 immediately.": "લક્ષણો ગંભીર હોય—બોલવામાં તકલીફ, હોઠ કે નખ વાદળી થવા, અથવા રાહતની દવા કામ ન કરે—તો તરત 911 પર ફોન કરો.", "Medication: use the existing clinician-prescribed schedule in your saved plan. No medication or dose is generated here.": "દવા: સાચવેલી યોજનામાં તમારા તબીબે આપેલો સમયપત્રક અનુસરો. અહીં કોઈ દવા કે માત્રા સૂચવાતી નથી.", "Preferences, risk inputs, and device connection only. Check-in notes and care files remain in memory. Turning this off clears saved preferences.": "માત્ર પસંદગીઓ, જોખમના સંકેતો અને ઉપકરણનું જોડાણ સાચવાય છે. નોંધો અને સંભાળ ફાઇલો સ્મૃતિમાં રહે છે. આ બંધ કરવાથી સાચવેલી પસંદગીઓ દૂર થાય છે.", "Printable summaries include trends, medication use, and identified triggers — ready for your next provider visit.": "છાપી શકાય એવા સારાંશમાં વલણો, દવાનો ઉપયોગ અને ઓળખાયેલા ટ્રિગર છે—આગામી તબીબી મુલાકાત માટે તૈયાર.", "Your check-ins, measurements, and chat are saved to your account.": "તમારી નોંધ, માપ અને ચેટ તમારા ખાતામાં સાચવાય છે.", "Sign in is unavailable until Firebase is configured.": "Firebase ગોઠવાય ત્યાં સુધી સાઇન ઇન ઉપલબ્ધ નથી.", "Your readings and records are saved to your account.": "તમારા માપ અને નોંધ તમારા ખાતામાં સાચવાય છે.",
    "Based on your logs and local conditions": "તમારી નોંધ અને સ્થાનિક પરિસ્થિતિના આધારે", "About these triggers": "આ ટ્રિગર વિશે", "Reduce exposure": "સંપર્ક ઘટાડો", "Specific to your triggers": "તમારા ટ્રિગર મુજબ", "Community reports": "સમુદાયના અહેવાલ", "Add a note": "નોંધ ઉમેરો", "Age": "ઉંમર", "Height": "ઊંચાઈ", "Anything you'd like to remember…": "યાદ રાખવા જેવું કંઈ…", "South Brunswick resources": "સાઉથ બ્રન્સવિકના સંસાધનો", "Crisis lines and emergency services": "સંકટ હેલ્પલાઇન અને કટોકટી સેવાઓ",
  },
};

export function tr(lang: Language, key: string) {
  return supplementalTranslations[lang]?.[key] || extendedTranslations[lang]?.[key] || t[lang]?.[key] || key;
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
