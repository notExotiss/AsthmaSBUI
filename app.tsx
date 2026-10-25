import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Accordion,
  Alert,
  Avatar,
  Button,
  Card,
  Checkbox,
  Chip,
  Dropdown,
  Form,
  Input,
  Label,
  ListBox,
  Modal,
  Popover,
  ProgressBar,
  Select,
  Skeleton,
  Switch,
  TextArea,
  TextField,
  Toast,
  toast,
} from "@heroui/react";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  CloudSun,
  Download,
  FileText,
  Footprints,
  Globe,
  GraduationCap,
  Heart,
  HeartPulse,
  Hospital,
  House,
  Info,
  Languages,
  Leaf,
  LogOut,
  MapPin,
  MessageCircle,
  Mic,
  Moon,
  MoreHorizontal,
  Phone,
  Pill,
  Plus,
  Printer,
  Radio,
  RefreshCw,
  Siren,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Thermometer,
  Trash2,
  Upload,
  User,
  Users,
  Wind,
  X,
} from "lucide-react";
import { BackgroundGradient } from "./components/background-gradient";
import {
  emergencyContacts,
  languages,
  sbResources,
  tr,
  type Language,
  type LogEntry,
} from "./mock";
import {
  MeasurementTrendChart,
  ClimateTrendCharts,
  EnvironmentTrendChart,
  HealthTrendChart,
  type TrendChartRow,
  RiskForecastChart,
} from "./charts";
import { EntryFlow } from "./auth-flow";
import { Panel, Row, GroupCard } from "./ui";
import { ThemeContext, type Theme } from "./theme";
import { LanguageContext, languageLocale, TranslateTree } from "./i18n";
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider, signOut, updateProfile, type User as FirebaseUser } from "firebase/auth";
import { addChatMessage, addMeasurement, addMedication, addSymptomLog, clearChatHistory, ensureUserData, recordDose, removeMeasurement, removeMedication, saveProfile, savePushSubscription, saveSettings, subscribeUserData, uploadCarePlan, getCarePlanUrl, removeCarePlan, seedSampleMeasurements, seedHistoricalRiskReadings, seedRiskForecastCheckins, seedMayoCodesMedications, type UserData, type UserProfile } from "./firebase-data";
import { askGemini, auth, copyPresentationAccountData, firebaseConfigured, registerForPushNotifications, sendAccountTestNotification } from "./firebase";
import { ChatAssistant } from "./components/chat-assistant";
import type { Message } from "./components/chat-assistant";
import { buildRiskTrend, environmentAttribution, getCurrentEnvironment, useEnvironmentData, type EnvironmentPoint } from "./environment";

const pages = [
  ["Summary", House, "Summary"],
  ["Take a Measurement", Wind, "Measure"],
  ["Personal Patterns", Activity, "Patterns"],
  ["Symptom & Medication Log", ClipboardList, "Log"],
  ["Medications", Pill, "Meds"],
  ["Community", Users, "Community"],
  ["Care Plan & Reports", FileText, "Care"],
  ["Notifications", Bell, "Notifications"],
  ["Settings", MoreHorizontal, "More"],
];
declare const __GOOGLE_MAPS_API_KEY__: string;
declare const __WEB_PUSH_PUBLIC_KEY__: string;
const tabs = [
  ["Summary", House, "Summary"],
  ["Take a Measurement", Wind, "Measure"],
  ["Symptom & Medication Log", ClipboardList, "Log"],
  ["Community", Users, "Community"],
  ["Settings", MoreHorizontal, "More"],
];
const simplePageLabels: Record<string, string> = {
  Summary: "Summary", "Take a Measurement": "Measure",
  "Personal Patterns": "Patterns", "Symptom & Medication Log": "Log",
  Medications: "Meds", Community: "Community", "Care Plan & Reports": "Care", Settings: "More",
  Notifications: "Notifications",
};
const questions = [
  "Why did my risk level change?",
  "What information is missing?",
  "What patterns appear in my logs?",
  "Summarize my week.",
];

function stored(key: string, fallback: any) {
  try {
    return (
      JSON.parse(localStorage.getItem("asthmaguard-" + key) || "null") ??
      fallback
    );
  } catch {
    return fallback;
  }
}
function profileInitials(name?: string | null, email?: string | null) {
  const label = name?.trim() || email?.split("@")[0] || "";
  const parts = label.split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : label.slice(0, 2)).toUpperCase() || "U";
}
function useDemoPreference<T = any>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => stored(key, initial));
  useEffect(() => {
    try {
      if (key === "preferences" || stored("preferences", true))
        localStorage.setItem("asthmaguard-" + key, JSON.stringify(value));
    } catch {}
  }, [value]);
  return [value, setValue] as const;
}
function Pick({
  label,
  value,
  onChange,
  items,
  className = "",
}: {
  label: string;
  value: string;
  onChange: any;
  items: string[];
  className?: string;
}) {
  const language = useContext(LanguageContext);
  return (
    <Select
      className={"app-select " + className}
      aria-label={tr(language, label)}
      value={value}
      onChange={onChange}
    >
      <Label>{tr(language, label)}</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator>
          <ChevronDown size={14} />
        </Select.Indicator>
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {items.map((x) => (
              <ListBox.Item id={x} key={x} textValue={tr(language, x)}>
              {tr(language, x)}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
function Tag({ children, tone = "neutral", icon: Icon }: any) {
  return (
    <Chip size="sm" className={"tag " + tone}>
      {Icon && <Icon size={12} />}
      <Chip.Label>{children}</Chip.Label>
    </Chip>
  );
}
function Meter({ value, label, tone = "" }: any) {
  return (
    <ProgressBar value={value} aria-label={label} className={"app-meter " + tone}>
      <ProgressBar.Track>
        <ProgressBar.Fill />
      </ProgressBar.Track>
    </ProgressBar>
  );
}
function Expand({ title, children }: any) {
  return (
    <Accordion className="explanation">
      <Accordion.Item>
        <Accordion.Heading>
          <Accordion.Trigger>
            {title}
            <Accordion.Indicator />
          </Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <Accordion.Body>{children}</Accordion.Body>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
function Toggle({ children, value, onChange }: any) {
  return (
    <Switch isSelected={value} onChange={onChange} className="app-switch">
      <Switch.Content>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Label>{children}</Label>
      </Switch.Content>
    </Switch>
  );
}

function PlanRows({ reminders, activity }: any) {
  const [done, setDone] = useState<string[]>([]);
  return (
    <TranslateTree>
    <div className="plan-rows">
      {[
        ["Outdoor activity", activity || "No activity entered", Footprints],
        [
          "Symptom check-in",
          reminders ? "Reminder · 6:00 PM" : "Reminder paused",
          Heart,
        ],
        [
          "Measurement",
          reminders ? "Reminder · 7:00 PM" : "Reminder paused",
          Wind,
        ],
        [
          "Medication reminder",
          "Follow your prescribed schedule",
          ClipboardList,
        ],
      ].map(([title, note, Icon]) => (
        <Checkbox
          key={title as string}
          isSelected={done.includes(title as string)}
          onChange={(v) =>
            setDone(
              v ? [...done, title as string] : done.filter((x) => x !== title),
            )
          }
          className="plan-check"
        >
          <Checkbox.Control>
            <Checkbox.Indicator>
              <Check size={12} />
            </Checkbox.Indicator>
          </Checkbox.Control>
          <Checkbox.Content>
            <strong>{title as string}</strong>
            <span>{note as string}</span>
          </Checkbox.Content>
        </Checkbox>
      ))}
    </div>
    </TranslateTree>
  );
}

/* ================= Forecast + guidance (description §2, §3) ================= */
function ForecastCard({ riskTrend, currentEnvironment, loading, error, includeHistoricalReadings = false, language = "English" }: any) {
  const translate = (key: string) => tr(language, key);
  const forecastPoint = riskTrend.filter((point: any) => point.forecast).reduce((peak: any, point: any) => !peak || point.risk > peak.risk ? point : peak, null);
  const currentIndex = forecastPoint?.risk ?? null;
  const level = currentIndex == null ? "Unavailable" : currentIndex >= 66 ? "High" : currentIndex >= 33 ? "Moderate" : "Low";
  const tone = level === "High" ? "high" : level === "Moderate" ? "medium" : "low";
  const poorAir = (currentEnvironment?.aqi ?? 0) >= 51 || (currentEnvironment?.pm25 ?? 0) >= 12;
  const actions = level === "High"
    ? [
      "Check how you feel and follow your saved asthma plan.",
      poorAir ? "Consider staying indoors while regional air quality is elevated." : "Check symptoms before outdoor activity.",
      "Keep your prescribed reliever with you.",
    ]
    : level === "Moderate"
      ? [
        "Check symptoms before exercise or outdoor activity.",
        poorAir ? "Consider moving activity indoors while air quality is elevated." : "Continue usual activity and watch for changes.",
        "Keep logging your breathing and symptoms.",
      ]
      : level === "Low"
        ? ["Continue your usual activities.", "Keep up with breathing readings and symptom check-ins."]
        : [
          loading ? "Wait for local air and weather data to load." : riskTrend.length === 0 ? "Add symptom check-ins on more days to build your personal forecast." : error || "Wait for updated local air and weather data.",
          "Follow your saved asthma plan.",
        ];
  return (
    <Panel
        title={translate("Risk forecast")}
      icon={Sparkles}
      tone={"forecast " + tone}
      action={<Tag tone={level === "High" ? "rose" : level === "Moderate" ? "amber" : "mint"}>{currentIndex == null ? "—" : `${currentIndex}/100`}</Tag>}
    >
      <p className="risk-eyebrow">Personal symptom trend · next 24 hours</p>
      <span className={"risk-value " + tone}>{level}</span>
      <RiskForecastChart data={riskTrend} language={language} />
      <div className="guidance-list">
        {actions.map((action: string) => <div className="guidance-step" key={action}><i /><span>{action}</span></div>)}
      </div>
      <Expand title="Where this forecast comes from">
        <p>{translate("Air quality and humidity come from Open-Meteo, with air-quality data from CAMS. The model learns from symptom check-ins paired with local conditions and breathing readings available at that time.")}</p>
        <p>{translate("It compares each upcoming hour with breathing readings around that time of day and the rolling hourly climate forecast. A personal forecast needs at least 14 days of symptom check-ins.")}{!includeHistoricalReadings && <> {translate("Sample readings are excluded.")}</>}</p>
      </Expand>
    </Panel>
  );
}

function ClimateInsights({ trendRows, points, currentEnvironment, language }: any) {
  const translate = (text: string) => tr(language, text);
  const aqi = currentEnvironment?.aqi;
  const aqiStatus = aqi == null ? "AQI is unavailable." : aqi <= 50
    ? "Good · little or no concern for most people."
    : aqi <= 100
      ? "Moderate · unusually sensitive people may be affected."
      : aqi <= 150
        ? "Unhealthy for sensitive groups."
        : aqi <= 200
          ? "Unhealthy · more people may notice effects."
          : aqi <= 300 ? "Very unhealthy." : "Hazardous.";
  const now = Date.now();
  const hourly = points.filter((point: EnvironmentPoint) => {
    const time = new Date(point.time).getTime();
    return !point.forecast && time <= now && time >= now - 24 * 60 * 60 * 1000;
  });
  const particulate = hourly.filter((point: EnvironmentPoint) => point.pm25 != null);
  const covered24h = particulate.length >= 20 && particulate.at(-1) && particulate[0]
    && new Date(particulate.at(-1)!.time).getTime() - new Date(particulate[0].time).getTime() >= 22 * 60 * 60 * 1000;
  const pmAverage = covered24h ? particulate.reduce((sum: number, point: EnvironmentPoint) => sum + Number(point.pm25), 0) / particulate.length : null;
  const pmStatus = pmAverage == null ? "A full 24-hour PM2.5 average is not available yet." : pmAverage <= 9
    ? "Good 24-hour range."
    : pmAverage <= 35.4
      ? "Moderate 24-hour range."
      : pmAverage <= 55.4
        ? "Unhealthy for sensitive groups by the 24-hour PM2.5 scale."
        : pmAverage <= 125.4 ? "Unhealthy 24-hour range." : "Very high 24-hour PM2.5.";
  const humidity = currentEnvironment?.humidity;
  const recentHumidity = trendRows.slice(-8, -1).map((row: TrendChartRow) => row.humidity).filter((value: number | null | undefined): value is number => value != null);
  const humidityAverage = recentHumidity.length ? recentHumidity.reduce((sum: number, value: number) => sum + value, 0) / recentHumidity.length : null;
  const humidityStatus = humidity == null ? "Outdoor humidity is unavailable." : humidityAverage == null
    ? "Regional outdoor humidity; indoor levels may differ."
    : humidity > humidityAverage + 5 ? "More humid than the recent week; this is an outdoor reading."
      : humidity < humidityAverage - 5 ? "Less humid than the recent week; this is an outdoor reading."
        : "Close to the recent weekly average; this is an outdoor reading.";
  return <ul className="climate-insights">
    <li><i className="pm" /><span><b>PM2.5</b> {pmAverage == null ? "—" : `${pmAverage.toFixed(1)} µg/m³, 24-hour avg`} · {translate(pmStatus)}</span></li>
    <li><i className="aqi" /><span><b>AQI {aqi == null ? "—" : Math.round(aqi)}</b> · {translate(aqiStatus)}</span></li>
    <li><i className="humidity" /><span><b>Humidity {humidity == null ? "—" : `${Math.round(humidity)}%`}</b> · {translate(humidityStatus)}</span></li>
  </ul>;
}

function buildActualTrendRows(environment: EnvironmentPoint[], measurements: any[], logs: any[], language: Language = "English"): TrendChartRow[] {
  const locale = languageLocale(language);
  const dayKey = (value: string) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
  const days = new Map<string, any>();
  const get = (day: string) => {
    const current = days.get(day) || { label: "", env: [], readings: [], logs: [] };
    days.set(day, current);
    return current;
  };
  environment.filter((point) => !point.forecast).forEach((point) => get(dayKey(point.time)).env.push(point));
  measurements.forEach((item) => {
    if (!item.time) return;
    const group = get(dayKey(item.time));
    if (Number.isFinite(Number(item.value))) group.readings.push(item);
    if (item.environment && group.env.length === 0) group.env.push({ ...item.environment, time: item.environment.sampledAt || item.time, forecast: false });
  });
  logs.forEach((item) => { if (item.time) get(dayKey(item.time)).logs.push(item); });
  const sorted = [...days.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-30);
  return sorted.map(([day, group]) => {
    const date = new Date(`${day}T12:00:00`);
    const mean = (key: "pm25" | "aqi" | "humidity") => {
      const values = group.env.map((point: any) => point[key]).filter((value: any) => value != null && Number.isFinite(Number(value)));
      return values.length ? values.reduce((sum: number, value: number) => sum + Number(value), 0) / values.length : null;
    };
    const level = (value: string, axis: "severity" | "limitation") => {
      const text = (value || "").toLowerCase();
      if (/severe|very|extreme|a lot/.test(text)) return 3;
      if (/moderate|some/.test(text)) return 2;
      if (/mild|slight|little/.test(text)) return 1;
      if (/none|no/.test(text)) return 0;
      return axis === "severity" ? null : null;
    };
    const meanLevel = (key: "severity" | "limitation") => {
      const values = group.logs.map((item: any) => level(item[key], key)).filter((value: number | null) => value !== null) as number[];
      return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
    };
    const readings = group.readings as any[];
    const airflow = readings.length ? readings.reduce((sum, item) => sum + Number(item.value), 0) / readings.length : null;
    return {
      label: new Intl.DateTimeFormat(locale, { timeZone: "America/New_York", month: "short", day: "numeric" }).format(date),
      pm25: mean("pm25"), aqi: mean("aqi"), humidity: mean("humidity"), airflow,
      severity: meanLevel("severity"), limitation: meanLevel("limitation"),
    };
  });
}

function HighlightCard({
  icon: Icon,
  color,
  title,
  time,
  children,
  onPress,
  className = "",
}: any) {
  const content = <>
      <div className="highlight-head">
        <span className="highlight-title" style={{ color }}>
          <Icon size={16} />
          {title}
        </span>
        {time && <span className="highlight-time">
          {time}<ChevronRight size={14} />
        </span>}
      </div>
      {children}
    </>;
  return onPress
    ? <button type="button" className={`highlight-card ${className}`} onClick={onPress}>{content}</button>
    : <div className={`highlight-card ${className}`}>{content}</div>;
}

function Bed(props: any) {
  const { size = 16, ...rest } = props;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <path d="M2 4v16" />
      <path d="M2 8h18a2 2 0 0 1 2 2v10" />
      <path d="M2 17h20" />
      <path d="M6 8v9" />
    </svg>
  );
}

/* ================= Community page (description §5) ================= */
const mapZones = [
  { name: "Route 1 corridor", lat: 40.4052, lng: -74.546, reports: 34, aqi: 94, note: "Traffic and outdoor-air reports" },
  { name: "Near SB High School", lat: 40.4026, lng: -74.5398, reports: 21, aqi: 81, note: "School-area reports" },
  { name: "Kingston Rd apartments", lat: 40.3738, lng: -74.6173, reports: 17, aqi: 77, note: "Indoor air and moisture reports" },
  { name: "Heathcote / Route 522", lat: 40.3845, lng: -74.568, reports: 9, aqi: 63, note: "Comparison-area reports" },
  { name: "Kendall Park", lat: 40.422, lng: -74.557, reports: 14, aqi: 88, note: "Outdoor-air and traffic reports" },
  { name: "Dayton", lat: 40.3728, lng: -74.5125, reports: 11, aqi: 72, note: "Neighborhood air and symptom reports" },
  { name: "Monmouth Junction", lat: 40.3818, lng: -74.5467, reports: 18, aqi: 84, note: "Outdoor-air and seasonal reports" },
  { name: "Deans", lat: 40.4145, lng: -74.606, reports: 8, aqi: 68, note: "Neighborhood comparison reports" },
  { name: "Princeton border", lat: 40.357, lng: -74.596, reports: 7, aqi: 59, note: "Southern-area reports" },
  { name: "Cranbury Road", lat: 40.3378, lng: -74.498, reports: 10, aqi: 75, note: "Roadside and outdoor-air reports" },
  { name: "Davidson's Mill Road", lat: 40.408, lng: -74.572, reports: 9, aqi: 79, note: "Outdoor-air and activity reports" },
  { name: "Fresh Ponds Road", lat: 40.3985, lng: -74.528, reports: 9, aqi: 66, note: "Neighborhood comparison reports" },
];
function zoneColor(aqi: number) {
  return aqi > 85 ? "#ff453a" : aqi > 75 ? "#ff9f0a" : "#30d158";
}
function mapZoneInfoContent(zone: (typeof mapZones)[number], language: Language) {
  const content = document.createElement("div");
  content.className = "community-map-info";
  const heading = document.createElement("strong");
  heading.textContent = tr(language, zone.name);
  const status = document.createElement("span");
  status.className = "community-map-info-status";
  status.style.setProperty("--zone-color", zoneColor(zone.aqi));
  status.textContent = `${tr(language, zone.aqi > 85 ? "Unhealthy" : zone.aqi > 75 ? "Moderate" : "Good")} · AQI ${zone.aqi}`;
  const count = document.createElement("span");
  count.className = "community-map-info-count";
  count.textContent = `${zone.reports} ${tr(language, "sample reports this month")}`;
  const note = document.createElement("p");
  note.textContent = tr(language, zone.note);
  content.append(heading, status, count, note);
  return content;
}
let googleMapsLoader: Promise<any> | null = null;
function loadGoogleMaps() {
  const existingGoogle = (window as any).google;
  if (existingGoogle?.maps?.Map) return Promise.resolve({ google: existingGoogle, maps: existingGoogle.maps });
  if (typeof existingGoogle?.maps?.importLibrary === "function") {
    if (!googleMapsLoader) {
      googleMapsLoader = existingGoogle.maps.importLibrary("maps").then((maps: any) => {
        if (typeof maps.Map !== "function") throw new Error("Google Maps map tools are unavailable.");
        return { google: existingGoogle, maps };
      });
    }
    return googleMapsLoader;
  }
  if (googleMapsLoader) return googleMapsLoader;
  googleMapsLoader = new Promise((resolve, reject) => {
    if (!__GOOGLE_MAPS_API_KEY__) { reject(new Error("Add a Google Maps API key to enable the map.")); return; }
    const script = document.createElement("script");
    const callbackName = "__asthmaGuardMapsReady";
    (window as any)[callbackName] = async () => {
      const google = (window as any).google;
      try {
        let maps = google?.maps;
        if (typeof maps?.Map !== "function" && typeof maps?.importLibrary === "function") {
          maps = await maps.importLibrary("maps");
        }
        if (typeof maps?.Map !== "function" || typeof maps?.InfoWindow !== "function") {
          throw new Error("Google Maps did not load its map library.");
        }
        resolve({ google, maps });
      } catch (error) { reject(error); }
      delete (window as any)[callbackName];
    };
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(__GOOGLE_MAPS_API_KEY__)}&libraries=maps,marker&callback=${callbackName}&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onerror = () => { delete (window as any)[callbackName]; reject(new Error("Google Maps could not load.")); };
    document.head.appendChild(script);
  });
  return googleMapsLoader;
}

function CommunityMap({ selected, onSelect, theme, language }: { selected: string | null; onSelect: (z: string) => void; theme: Theme; language: Language }) {
  const container = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const infoRef = useRef<any>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    let listeners: any[] = [];
    void loadGoogleMaps().then(({ google, maps }) => {
      if (!active || !container.current) return;
      const map = new maps.Map(container.current, {
        center: { lat: 40.3793, lng: -74.5465 }, zoom: 11,
        mapTypeControl: false, streetViewControl: false, fullscreenControl: true,
        styles: theme === "dark" ? [{ elementType: "geometry", stylers: [{ color: "#202c3a" }] }, { elementType: "labels.text.fill", stylers: [{ color: "#9caec4" }] }, { featureType: "road", elementType: "geometry", stylers: [{ color: "#34485e" }] }, { featureType: "water", elementType: "geometry", stylers: [{ color: "#111b27" }] }] : undefined,
      });
      const info = new maps.InfoWindow();
      mapRef.current = map;
      infoRef.current = info;
      mapZones.forEach((zone, index) => {
        const marker = new google.maps.Marker({
          map, position: { lat: zone.lat, lng: zone.lng }, title: tr(language, zone.name),
          label: { text: String(index + 1), color: "#ffffff", fontWeight: "700" },
          icon: { path: maps.SymbolPath.CIRCLE, scale: 9 + Math.min(5, zone.reports / 9), fillColor: zoneColor(zone.aqi), fillOpacity: 0.95, strokeColor: "#ffffff", strokeWeight: 2 },
        });
        markersRef.current.set(zone.name, marker);
        listeners.push(marker.addListener("click", () => {
          onSelectRef.current(zone.name);
          info.setContent(mapZoneInfoContent(zone, language));
          info.open({ map, anchor: marker });
        }));
      });
    }).catch((reason) => { if (active) setError(reason.message || "Google Maps is unavailable."); });
    return () => {
      active = false;
      listeners.forEach((listener) => listener.remove());
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current.clear();
      mapRef.current = null;
      googleMapsLoader = null;
    };
  }, [theme, language]);
  useEffect(() => {
    if (!selected || !mapRef.current || !infoRef.current) return;
    const zone = mapZones.find((item) => item.name === selected);
    const marker = markersRef.current.get(selected);
    if (!zone || !marker) return;
    infoRef.current.setContent(mapZoneInfoContent(zone, language));
    infoRef.current.open({ map: mapRef.current, anchor: marker });
  }, [selected, language]);
  return <div className="map-wrap">
    {error
      ? <div className="community-map-error" role="alert">{tr(language, error)}</div>
      : <div ref={container} className="google-community-map" role="application" aria-label={tr(language, "Google map with sample community reports around South Brunswick")} />}
  </div>;
}
function CommunityPage({
  optIn,
  setOptIn,
  theme,
  currentEnvironment,
}: {
  optIn: boolean;
  setOptIn: (v: boolean) => void;
  theme: Theme;
  currentEnvironment: EnvironmentPoint | null;
}) {
  const language = useContext(LanguageContext);
  const [selected, setSelected] = useState<string | null>(null);
  const total = mapZones.reduce((s, z) => s + z.reports, 0);
  const max = Math.max(...mapZones.map((z) => z.reports));
  const mostReported = mapZones.reduce((a, b) => (b.reports > a.reports ? b : a));
  return (
    <div className="page-stack">
      <Panel
        title="Community map"
        subtitle={`${total} sample community reports · ${mapZones.length} areas`}
        icon={MapPin}
        action={<Tag tone={optIn ? "mint" : "neutral"}>{optIn ? "Contributing" : "Opted out"}</Tag>}
      >
        <div className="community-stats">
          <div>
            <strong>{total}</strong>
            <span>reports this month</span>
          </div>
          <div>
            <strong>{mapZones.length}</strong>
            <span>zones monitored</span>
          </div>
          <div>
            <strong>{currentEnvironment?.aqi == null ? "—" : Math.round(currentEnvironment.aqi)}</strong>
            <span>regional AQI</span>
          </div>
        </div>
        <CommunityMap selected={selected} onSelect={(z) => setSelected(z === selected ? null : z)} theme={theme} language={language} />
        <div className="map-legend">
          <span>
            <i style={{ background: zoneColor(90) }} /> Unhealthy
          </span>
          <span>
            <i style={{ background: zoneColor(80) }} /> Moderate
          </span>
          <span>
            <i style={{ background: zoneColor(60) }} /> Good
          </span>
        </div>
        <Toggle value={optIn} onChange={setOptIn}>
          Contribute anonymously
        </Toggle>
        <details className="community-alerts-dropdown">
          <summary>
            <strong>Community alerts</strong>
            <span>{mapZones.length} areas</span>
          </summary>
          <div className="hotspot-list">
          {mapZones.map((z) => (
            <div
              key={z.name}
              className={"hotspot-row" + (selected === z.name ? " selected" : "")}
              onClick={() => setSelected(z.name === selected ? null : z.name)}
            >
              <div className="hotspot-head">
                <strong>
                  <i style={{ background: zoneColor(z.aqi) }} />
                  {z.name}
                </strong>
                <span>{z.reports} sample reports</span>
              </div>
              <div className="hotspot-bar" aria-hidden="true">
                <i
                  style={{
                    width: `${(z.reports / max) * 100}%`,
                    background: zoneColor(z.aqi),
                  }}
                />
              </div>
              <p>{z.note}</p>
            </div>
          ))}
          </div>
        </details>
      </Panel>
      <Panel
        title="Possible local actions"
        subtitle="Ideas to reduce common neighborhood triggers"
        icon={Users}
      >
        <GroupCard>
          <div className="ios-row static">
            <span className="ios-row-icon" style={{ color: "#30d158" }}>
              <Leaf size={17} />
            </span>
            <span className="ios-row-label">
              More tree cover
              <small>Could help near busy roads · {mostReported.reports} example reports</small>
            </span>
          </div>
          <div className="ios-row static">
            <span className="ios-row-icon" style={{ color: "#ff9f0a" }}>
              <GraduationCap size={17} />
            </span>
            <span className="ios-row-label">
              Less idling near schools
              <small>Could reduce vehicle exhaust · 21 example reports</small>
            </span>
          </div>
          <div className="ios-row static last">
            <span className="ios-row-icon" style={{ color: "#5e5ce6" }}>
              <House size={17} />
            </span>
            <span className="ios-row-label">
              Check homes for moisture
              <small>Could help identify mold concerns</small>
            </span>
          </div>
        </GroupCard>
        <Expand title="How your data is protected">
          <p>
            Only anonymized, aggregated counts are contributed — never
            individual data. You can opt out at any time here or in Settings.
          </p>
        </Expand>
      </Panel>
    </div>
  );
}

/* ================= Medications page (description §6) ================= */
function MedicationsPage({ medicationList, doseList, onAdd, onDose, onRemove }: any) {
  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [refillsLeft, setRefillsLeft] = useState("");
  const [refillBy, setRefillBy] = useState("");
  return (
    <div className="page-stack">
      <Panel title="Medications" icon={Pill}>
        <TextField className="app-field" value={name} onChange={setName}>
          <Label>Name</Label><Input placeholder="Medication name" maxLength={100} />
        </TextField>
        <TextField className="app-field" value={instructions} onChange={setInstructions}>
          <Label>Instructions (optional)</Label><Input placeholder="As prescribed" maxLength={300} />
        </TextField>
        <TextField className="app-field" value={refillsLeft} onChange={setRefillsLeft}>
          <Label># of refills left</Label><Input type="number" min="0" step="1" placeholder="0" />
        </TextField>
        <TextField className="app-field" value={refillBy} onChange={setRefillBy}>
          <Label>Refill by date</Label><Input type="date" />
        </TextField>
        <Button className="primary-btn" isDisabled={!name.trim() || refillsLeft === "" || !Number.isInteger(Number(refillsLeft)) || Number(refillsLeft) < 0 || !refillBy} onPress={async () => { await onAdd(name.trim(), instructions.trim(), Number(refillsLeft), refillBy); setName(""); setInstructions(""); setRefillsLeft(""); setRefillBy(""); }}><Plus size={16} />Add medication</Button>
      </Panel>
      {medicationList.map((m: any) => {
        const count = doseList.filter((dose: any) => dose.medicationId === m.id && new Date(dose.time).toDateString() === new Date().toDateString()).length;
        const isRescue = m.type === "Rescue";
        const enteredDate = /^\d{4}-\d{2}-\d{2}$/.test(m.refillBy || "") ? new Date(`${m.refillBy}T00:00:00`) : null;
        const isOverdue = /overdue/i.test(m.refillBy || "") || Boolean(enteredDate && enteredDate < new Date(new Date().toDateString()));
        const refillDateLabel = enteredDate && Number.isFinite(enteredDate.getTime())
          ? `${isOverdue ? "Overdue — " : ""}${enteredDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
          : m.refillBy || "—";
        return (
          <section className={`medication-card${isRescue ? " rescue" : " preventive"}`} key={m.id}>
            <div className="medication-card-header">
              <div className="medication-card-name"><Pill size={14} /><strong>{m.name}</strong></div>
              {m.type && <span className="medication-card-type">{m.type}</span>}
            </div>
            <p className="med-schedule">{m.schedule || m.instructions || "No instructions saved"}</p>
            <div className="med-stats">
              <div><strong>{count}</strong><span>doses logged<br />today</span></div>
              <div><strong className={m.refillsLeft === 0 ? "medication-alert-value" : ""}>{m.refillsLeft ?? "—"}</strong><span>refills left</span></div>
              <div><strong className={isOverdue ? "medication-alert-value" : ""}>{refillDateLabel}</strong><span>refill by</span></div>
            </div>
            {isOverdue && <div className="medication-refill-alert">
              <strong>Refill needed</strong>
              <span>This prescription is past its refill date. Contact your pharmacy today to stay covered.</span>
            </div>}
            <Button className="primary-btn medication-dose-button" onPress={() => onDose(m)}>
              <Plus size={16} />Log a dose
            </Button>
            <Button variant="ghost" className="text-btn medication-remove-button" onPress={() => onRemove(m.id)}>Remove</Button>
          </section>
        );
      })}
    </div>
  );
}

/* ================= Settings page (description §6 + theme) ================= */
function SettingsPage({
  theme,
  setTheme,
  profile,
  onSaveProfile,
  personalBestFlow,
  onSavePersonalBest,
  reminders,
  setReminders,
  persist,
  setPersist,
  communityOptIn,
  setCommunityOptIn,
  exportData,
  nav,
}: any) {
  const [personalBestDraft, setPersonalBestDraft] = useState(personalBestFlow ? String(personalBestFlow) : "");
  const [ageDraft, setAgeDraft] = useState(profile?.ageYears ? String(profile.ageYears) : "");
  const [heightDraft, setHeightDraft] = useState(profile?.heightCm ? String(profile.heightCm) : "");
  const [referenceSexDraft, setReferenceSexDraft] = useState(profile?.referenceSex || "");
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => setPersonalBestDraft(personalBestFlow ? String(personalBestFlow) : ""), [personalBestFlow]);
  useEffect(() => {
    setAgeDraft(profile?.ageYears ? String(profile.ageYears) : "");
    setHeightDraft(profile?.heightCm ? String(profile.heightCm) : "");
    setReferenceSexDraft(profile?.referenceSex || "");
  }, [profile?.ageYears, profile?.heightCm, profile?.referenceSex]);

  const saveReferenceDetails = async () => {
    const ageYears = Number(ageDraft);
    const heightCm = Number(heightDraft);
    if (!Number.isFinite(ageYears) || ageYears < 5 || ageYears > 110 || !Number.isFinite(heightCm) || heightCm < 50 || heightCm > 250 || !["Male", "Female"].includes(referenceSexDraft)) return;
    await onSaveProfile({ ageYears, heightCm, referenceSex: referenceSexDraft });
    setProfileSaved(true);
  };

  return (
    <div className="page-stack">
      <Panel title="Appearance" icon={theme === "dark" ? Moon : Sun}>
        <Toggle
          value={theme === "dark"}
          onChange={(v: boolean) => setTheme(v ? "dark" : "light")}
        >
          Dark mode
        </Toggle>
      </Panel>
      <Panel title="Language & profile" icon={Languages}>
        <div className="personal-best-setting reference-details-setting">
          <strong>Reference details</strong>
          <div className="entry-demographics">
            <TextField className="app-field" value={ageDraft} onChange={(value: string) => { setAgeDraft(value); setProfileSaved(false); }}>
              <Label>Age (years)</Label>
              <Input type="number" min="5" max="110" step="1" placeholder="Age" />
            </TextField>
            <TextField className="app-field" value={heightDraft} onChange={(value: string) => { setHeightDraft(value); setProfileSaved(false); }}>
              <Label>Height (cm)</Label>
              <Input type="number" min="50" max="250" step="0.1" placeholder="Height" />
            </TextField>
          </div>
          <div className="reference-save-row">
            <label className="entry-reference-field app-reference-field">
              <span>Sex</span>
              <select className="entry-select" value={referenceSexDraft} onChange={(event) => { setReferenceSexDraft(event.target.value); setProfileSaved(false); }}>
                <option value="">Select sex</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </label>
            <Button className="secondary-btn" isDisabled={!Number.isFinite(Number(ageDraft)) || Number(ageDraft) < 5 || Number(ageDraft) > 110 || !Number.isFinite(Number(heightDraft)) || Number(heightDraft) < 50 || Number(heightDraft) > 250 || !referenceSexDraft} onPress={saveReferenceDetails}>{profileSaved ? "Saved" : "Save details"}</Button>
          </div>
          <p className="microcopy">Used for an adult reference estimate from ages 15–85.</p>
        </div>
        <div className="personal-best-setting">
          <div className="personal-best-save-row">
            <TextField className="app-field" value={personalBestDraft} onChange={setPersonalBestDraft}>
              <Label>Personal best (L/min)</Label>
              <Input type="number" min="1" step="0.1" placeholder="Enter your best" />
            </TextField>
            <Button className="secondary-btn" isDisabled={!Number.isFinite(Number(personalBestDraft)) || Number(personalBestDraft) <= 0} onPress={() => onSavePersonalBest(Number(personalBestDraft))}>Save range</Button>
          </div>
          <p className="microcopy">Set your best on this device to see a range.</p>
        </div>
      </Panel>
      <Panel title="Privacy & data" icon={Bell}>
        <Toggle value={reminders} onChange={setReminders}>
          Reminders
        </Toggle>
        <div className="settings-divider" />
        <Toggle value={persist} onChange={setPersist}>
          Remember preferences on this device
        </Toggle>
        <div className="settings-divider" />
        <Toggle value={communityOptIn} onChange={setCommunityOptIn}>
          Contribute to the community map
        </Toggle>
        <div className="settings-divider" />
        <Button
          variant="secondary"
          className="secondary-btn"
          onPress={exportData}
        >
          <Download size={16} />
          Export data (JSON)
        </Button>
        <p className="microcopy">
          Your account saves logs, readings, and settings.
        </p>
      </Panel>
      <Panel title="Explore" icon={GridIcon}>
        <GroupCard>
          <Row
            icon={Bell}
            iconColor="#ff9f0a"
            label="Notifications"
            onPress={() => nav("Notifications")}
          />
          <Row
            icon={Activity}
            iconColor="#0a84ff"
            label="Personal Patterns"
            onPress={() => nav("Personal Patterns")}
          />
          <Row
            icon={Pill}
            iconColor="#30d158"
            label="Medications"
            onPress={() => nav("Medications")}
          />
          <Row
            icon={FileText}
            iconColor="#ff9f0a"
            label="Care Plan & Reports"
            onPress={() => nav("Care Plan & Reports")}
            last
          />
        </GroupCard>
      </Panel>
      <p className="microcopy center">
        AsthmaGuard SB · Your health records in one place.
      </p>
    </div>
  );
}
function NotificationPage({ onTestNotification, onEnableNotifications }: any) {
  const examples = [
    { icon: Pill, label: "Medicine reminder", title: "Use your medicine", body: "Take your scheduled medicine if it is time.", page: "Medications" },
    { icon: Wind, label: "Breathing reading", title: "Time for a breathing reading", body: "Record a breathing reading when you are ready.", page: "Take a Measurement" },
    { icon: ClipboardList, label: "Daily check-in", title: "How are you feeling?", body: "Record your symptoms and activity for today.", page: "Symptom & Medication Log" },
  ];
  return <div className="page-stack">
    <Panel title="Test notifications" subtitle="Send a reminder to enabled devices on this account." icon={Bell}>
      <p className="microcopy">On iPhone, open AsthmaGuard from its Home Screen icon, then enable notifications here. Each device must be enabled once.</p>
      <Button className="secondary-btn" onPress={onEnableNotifications}>Enable on this device</Button>
      <div className="notification-test-list">
        {examples.map(({ icon: Icon, label, title, body, page }) => (
          <div className="notification-test-row" key={label}>
            <div className="notification-test-copy"><Icon size={17} /><strong>{label}</strong></div>
            <Button className="secondary-btn" onPress={() => onTestNotification(title, body, page)}>Send test</Button>
          </div>
        ))}
      </div>
    </Panel>
  </div>;
}
function GridIcon(props: any) {
  const { size = 16, ...rest } = props;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...rest}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

/* ================= Measurement workflow ================= */
function predictedPeakFlow(profile: UserProfile) {
  const age = Number(profile.ageYears);
  const height = Number(profile.heightCm);
  if (!Number.isFinite(age) || age < 15 || age > 85 || !Number.isFinite(height) || height <= 0 || !profile.referenceSex) return null;
  const logPrediction = profile.referenceSex === "Male"
    ? 0.544 * Math.log(age) - 0.0151 * age - 74.7 / height + 5.48
    : 0.376 * Math.log(age) - 0.012 * age - 58.8 / height + 5.63;
  const predicted = Math.exp(logPrediction);
  return Number.isFinite(predicted) && predicted > 0 ? predicted : null;
}

function Measurement({ onSave, measurements, personalBestFlow, profile, onDeleteMeasurement, hideGeneratedMetadata = false }: any) {
  const language = useContext(LanguageContext);
  const locale = languageLocale(language);
  const endpoint = __AIRFLOW_URL__;
  const [deviceEnabled, setDeviceEnabled] = useState(false);
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [sensorError, setSensorError] = useState("");
  const [sensor, setSensor] = useState<any>(null);
  const [samples, setSamples] = useState<any[]>([]);
  const [phase, setPhase] = useState<"idle" | "countdown" | "capturing" | "complete">("idle");
  const [countdown, setCountdown] = useState(3);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [captured, setCaptured] = useState<any>(null);
  const [captureError, setCaptureError] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deletingMeasurementId, setDeletingMeasurementId] = useState("");
  const runRef = useRef(false);
  const samplesRef = useRef<any[]>([]);
  const runStartRef = useRef(0);

  const deleteReading = async (id: string) => {
    setDeletingMeasurementId(id);
    try {
      await onDeleteMeasurement(id);
    } catch {
      toast.error("Could not delete this reading. Try again.");
    } finally {
      setDeletingMeasurementId("");
    }
  };

  useEffect(() => {
    if (!deviceEnabled) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    let controller: AbortController | undefined;
    const poll = async () => {
      controller = new AbortController();
      try {
        const response = await fetch(endpoint, { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error(`Device returned HTTP ${response.status}`);
        const result = await response.json();
        if (![result.pressure_pa, result.air_velocity_ms, result.estimated_flow_lpm].every((v) => typeof v === "number" && Number.isFinite(v))) {
          throw new Error("Device sent an unexpected reading");
        }
        if (active) {
          const receivedAt = new Date().toISOString();
          setSensor({ ...result, receivedAt });
          setSamples((current) => [...current, result.estimated_flow_lpm].slice(-24));
          setDeviceConnected(true);
          setSensorError("");
          if (runRef.current && !result.simulated) {
            samplesRef.current = [...samplesRef.current, {
              flow: result.estimated_flow_lpm,
              pressure: result.pressure_pa,
              velocity: result.air_velocity_ms,
              time: receivedAt,
            }];
          } else if (runRef.current && result.simulated) {
            runRef.current = false;
            setPhase("idle");
            setProgress(0);
            setCaptureError("The device switched to simulated data. Connect live sensor data and try again.");
          }
        }
      } catch (error: any) {
        if (active && error?.name !== "AbortError") {
          setDeviceConnected(false);
          setSensorError(error?.message || "Could not reach the device");
          runRef.current = false;
          setPhase("idle");
          setProgress(0);
        }
      } finally {
        if (active) timer = setTimeout(poll, 1000);
      }
    };
    poll();
    return () => {
      active = false;
      clearTimeout(timer);
      controller?.abort();
    };
  }, [deviceEnabled, endpoint]);

  useEffect(() => {
    if (phase !== "countdown") return;
    let remaining = 3;
    setCountdown(remaining);
    const interval = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(interval);
        setProgress(0);
        setPhase("capturing");
      } else {
        setCountdown(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== "capturing") return;
    samplesRef.current = [];
    runStartRef.current = Date.now();
    runRef.current = true;
    const interval = setInterval(() => {
      const elapsed = Date.now() - runStartRef.current;
      setProgress(Math.min(100, Math.round((elapsed / 3000) * 100)));
      if (elapsed >= 3000) {
        runRef.current = false;
        setProgress(100);
        const readings = samplesRef.current;
        if (readings.length < 2) {
          setCaptureError("Not enough live samples. Check the device connection and try again.");
          setAttempts([]);
          setAttemptNumber(1);
          setPhase("idle");
          return;
        }
        const peak = readings.reduce((best, item) => item.flow > best.flow ? item : best, readings[0]);
        const completedAttempt = { ...peak, sampleCount: readings.length };
        const allAttempts = [...attempts, completedAttempt];
        setAttempts(allAttempts);
        setCaptureError("");
        if (allAttempts.length < 3) {
          setAttemptNumber(allAttempts.length + 1);
          setCountdown(3);
          setPhase("countdown");
        } else {
          const average = (key: string) => allAttempts.reduce((sum, item) => sum + item[key], 0) / allAttempts.length;
          setCaptured({
            flow: average("flow"),
            pressure: average("pressure"),
            velocity: average("velocity"),
            attempts: allAttempts,
            sampleCount: allAttempts.reduce((sum, item) => sum + item.sampleCount, 0),
          });
          setPhase("complete");
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, [phase, attempts]);

  const startMeasurement = () => {
    if (!deviceConnected || sensor?.simulated) return;
    samplesRef.current = [];
    setAttempts([]);
    setAttemptNumber(1);
    setCountdown(3);
    setCaptured(null);
    setSaved(false);
    setCaptureError("");
    setProgress(0);
    setPhase("countdown");
  };

  const disconnectDevice = () => {
    runRef.current = false;
    setPhase("idle");
    setDeviceEnabled(false);
    setDeviceConnected(false);
    setProgress(0);
  };

  const saveMeasurement = async () => {
    if (!captured || saving) return;
    setSaving(true);
    try {
      await onSave(captured.flow, notes.trim(), {
        unit: "L/min",
        source: "Arduino airflow sensor",
        pressurePa: captured.pressure,
        airVelocityMs: captured.velocity,
        attempts: captured.attempts.map((item: any) => item.flow),
        testReadings: captured.attempts.map((item: any) => ({ flowLpm: item.flow, pressurePa: item.pressure, airVelocityMs: item.velocity })),
      });
      setSaved(true);
    } catch {
      setCaptureError("Could not save the reading. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="workflow-grid">
      <Panel title="Measure" subtitle="Live airflow reading" icon={Wind} tone="breathing">
        <div className="connection-row">
          <Tag tone={deviceConnected ? "mint" : "amber"}>
            {deviceConnected ? (sensor?.simulated ? "Test data" : "Device connected") : "Device disconnected"}
          </Tag>
          <Button size="sm" variant="ghost" onPress={deviceEnabled ? disconnectDevice : () => setDeviceEnabled(true)}>
            {deviceEnabled ? "Disconnect" : "Connect device"}
          </Button>
        </div>
        <div className="measurement-stage live-measurement-stage">
          <Wind size={54} strokeWidth={1.2} className={phase === "capturing" ? "breathing-icon" : ""} />
          <h2>{phase === "countdown" ? `Test ${attemptNumber} of 3` : phase === "capturing" ? `Test ${attemptNumber} of 3` : phase === "complete" ? "Three tests complete" : deviceConnected ? "Ready when you are" : "Connect your device"}</h2>
          <p>{phase === "countdown" ? "Breathe in fully, then blow out hard and fast when the countdown ends." : phase === "capturing" ? "Blow out through the mouthpiece for this test." : phase === "complete" ? "Your average is based on three live attempts." : deviceConnected ? "Take a deep breath in before each test." : sensorError || "Connect to your airflow sensor to see live readings."}</p>
          {phase === "countdown" && <div className="measurement-countdown" key={countdown} aria-live="assertive">{countdown}</div>}
          <div className="live-flow-value" aria-live="polite">
            {sensor ? <><strong>{sensor.estimated_flow_lpm.toFixed(1)}</strong><span>L/min</span></> : <><strong>—</strong><span>L/min</span></>}
          </div>
          <div className="live-sensor-details">
            <span>Pressure <strong>{sensor ? `${sensor.pressure_pa.toFixed(1)} Pa` : "—"}</strong></span>
            <span>Velocity <strong>{sensor ? `${sensor.air_velocity_ms.toFixed(2)} m/s` : "—"}</strong></span>
          </div>
          <div className="live-flow-bars" role="img" aria-label="Recent live airflow readings">
            {samples.map((flow, index) => <span key={`${index}-${flow}`} style={{ height: `${Math.max(8, Math.min(100, Math.abs(flow) / Math.max(1, ...samples.map(Math.abs)) * 100))}%` }} />)}
          </div>
          <p className="microcopy">{sensor?.receivedAt ? `Updated ${new Date(sensor.receivedAt).toLocaleTimeString()}` : "Waiting for a reading"}</p>
        </div>
        {phase === "capturing" && <ProgressBar value={progress} aria-label={`Test ${attemptNumber} progress`} />}
        {attempts.length > 0 && <div className="attempt-results" aria-label="Test results">
          {attempts.map((item: any, index: number) => <div key={index} className="attempt-result">
            <span>Test {index + 1}</span><strong>{item.flow.toFixed(1)} <small>L/min</small></strong>
          </div>)}
          {phase !== "complete" && phase !== "idle" && <div className="attempt-result pending"><span>Test {attemptNumber}</span><strong>{phase === "countdown" ? `Starts in ${countdown}` : "Collecting…"}</strong></div>}
        </div>}
        {captureError && <Alert className="app-alert"><Alert.Content><Alert.Description>{captureError}</Alert.Description></Alert.Content></Alert>}
        {sensor?.simulated && <Alert className="app-alert"><Alert.Content><Alert.Description>The device is reporting simulated values. Live sensor data is required to save a reading.</Alert.Description></Alert.Content></Alert>}
        <Button className="primary-btn" isDisabled={!deviceConnected || Boolean(sensor?.simulated) || phase === "countdown" || phase === "capturing"} onPress={startMeasurement}>
          <Wind size={17} />{phase === "countdown" ? "Starting…" : phase === "capturing" ? "Measuring…" : captured ? "Measure again" : "Start 3 tests"}
        </Button>
        {captured && phase === "complete" && <>
          <div className="captured-reading">
            <div><span>Average airflow</span><strong>{captured.flow.toFixed(1)} L/min</strong></div>
            <p>Mean of three test results. Pressure averages {captured.pressure.toFixed(1)} Pa; air speed averages {captured.velocity.toFixed(2)} m/s.</p>
            {personalBestFlow > 0 ? (() => {
              const percent = (captured.flow / personalBestFlow) * 100;
              const status = percent >= 80 ? "In range" : percent >= 50 ? "Below range" : "Low";
              const tone = percent >= 80 ? "in-range" : percent >= 50 ? "below-range" : "low-range";
              return <p className={`reading-explanation ${tone}`}>{Math.round(percent)}% of your best · {status}</p>;
            })() : <p className="reading-explanation">Set your best reading to see a comparison.</p>}
            {(() => {
              const predicted = predictedPeakFlow(profile);
              return predicted ? <p className="reading-explanation">{Math.round(captured.flow / predicted * 100)}% of adult reference estimate ({Math.round(predicted)} L/min)</p> : profile?.ageYears && Number(profile.ageYears) < 15 ? <p className="reading-explanation">Use your personal best for comparison.</p> : null;
            })()}
          </div>
          <TextField className="app-field" value={notes} onChange={setNotes}>
            <Label>Notes (optional)</Label>
            <TextArea maxLength={500} placeholder="Add a note" />
          </TextField>
          <Button className="primary-btn" isDisabled={saving || saved} onPress={saveMeasurement}>
            <Check size={16} />{saving ? "Saving…" : saved ? "Saved" : "Save reading"}
          </Button>
        </>}
        <p className="microcopy">Experimental airflow estimate, not a clinical peak-flow measurement.</p>
      </Panel>
      <Panel title="Recent readings" subtitle="Three-test averages" icon={Activity} tone="indigo">
        {measurements.length ? <div className="recent-measurements">
          {measurements.map((item: any, index: number) => <div key={item.id} className={`reading-card${index === 0 ? " latest" : ""}`}>
            <div className="reading-card-heading"><span>{index === 0 ? tr(language, "Latest") : new Date(item.time).toLocaleDateString(locale)}{item.sample && !hideGeneratedMetadata && <b className="sample-reading-badge">{tr(language, "Sample")}</b>}</span><div className="reading-card-actions"><time>{new Date(item.time).toLocaleTimeString(locale)}</time><Button isIconOnly variant="ghost" className="reading-delete" aria-label={`${tr(language, "Delete reading from")} ${new Date(item.time).toLocaleString(locale)}`} isDisabled={deletingMeasurementId === item.id} onPress={() => deleteReading(item.id)}><Trash2 size={15} /></Button></div></div>
            <div className="reading-average"><span className="reading-average-label">{item.unit === "L/min" ? "Average airflow" : "Reading"}</span><strong>{Number(item.value).toFixed(1)}</strong><span>{item.unit || "a.u."}</span></div>
            {item.testReadings?.length === 3 ? <div className="reading-attempts">
              {item.testReadings.map((test: any, attempt: number) => <div className="reading-test-card" key={attempt}><span>{tr(language, "Test")} {attempt + 1}</span><strong>{Number(test.flowLpm).toFixed(1)} <small>L/min</small></strong><small>{tr(language, "Pressure")}: {Number(test.pressurePa).toFixed(1)} Pa</small><small>{tr(language, "Velocity")}: {Number(test.airVelocityMs).toFixed(2)} m/s</small></div>)}
            </div> : item.attempts?.length === 3 && <div className="reading-attempts">
              {item.attempts.map((value: number, attempt: number) => <div key={attempt}><span>Test {attempt + 1}</span><strong>{Number(value).toFixed(1)} <small>L/min</small></strong></div>)}
            </div>}
            <div className="reading-metrics">
              <div><strong>{item.pressurePa == null ? "—" : `${Number(item.pressurePa).toFixed(1)} Pa`}</strong><span>Pressure · sensor pressure difference</span></div>
              <div><strong>{item.airVelocityMs == null ? "—" : `${Number(item.airVelocityMs).toFixed(2)} m/s`}</strong><span>Velocity · estimated air speed</span></div>
            </div>
            {(() => {
              const percent = item.unit === "L/min" && personalBestFlow > 0 ? (Number(item.value) / personalBestFlow) * 100 : null;
              const status = percent === null ? "" : percent >= 80 ? "In range" : percent >= 50 ? "Below range" : "Low";
              const statusClass = percent === null ? "" : percent >= 80 ? "in-range" : percent >= 50 ? "below-range" : "low-range";
              const predicted = item.unit === "L/min" ? predictedPeakFlow(profile) : null;
              return <><p className={`reading-explanation ${statusClass}`}>{percent === null ? item.unit === "L/min" ? "Set your best reading to see a comparison." : "No range set for this reading." : `${Math.round(percent)}% of your best · ${status}`}</p>{predicted && <p className="reading-explanation">{Math.round(Number(item.value) / predicted * 100)}% of adult reference estimate ({Math.round(predicted)} L/min)</p>}</>;
            })()}
            {item.notes && (!item.sample || !hideGeneratedMetadata) && <p className="reading-note">{item.notes}</p>}
          </div>)}
        </div> : <div className="empty-state"><Activity size={32} /><p>No readings saved yet.</p></div>}
      </Panel>
    </div>
  );
}
function ShieldCheckIcon(props: any) {
  const { size = 16, ...rest } = props;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

/* ================= Patterns page ================= */
function TrendGeminiSummary({ kind, rows, unit, language }: { kind: "climate" | "health"; rows: TrendChartRow[]; unit: string; language: Language }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const climateRows = rows.slice(-30);
  const values = (kind === "climate"
    ? climateRows.map((row, index) => {
      const window = climateRows.slice(Math.max(0, index - 2), Math.min(climateRows.length, index + 3));
      const average = (key: "pm25" | "aqi" | "humidity") => {
        const numbers = window.map((item) => item[key]).filter((value): value is number => value != null && Number.isFinite(value));
        return numbers.length ? numbers.reduce((sum, value) => sum + value, 0) / numbers.length : null;
      };
      const pm = average("pm25"); const aqi = average("aqi"); const humidity = average("humidity");
      return { d: row.label, pm: pm == null ? null : Number(pm.toFixed(1)), aq: aqi == null ? null : Math.round(aqi), h: humidity == null ? null : Math.round(humidity) };
    }).slice(-14)
    : rows.slice(-14).map((row) => ({ d: row.label, b: row.airflow == null ? null : Number(row.airflow.toFixed(1)), s: row.severity, l: row.limitation })))
    .filter((row) => Object.values(row).some((value) => typeof value === "number" && Number.isFinite(value)));
  const dataSignature = JSON.stringify(values);
  useEffect(() => {
    let active = true;
    if (!values.length) {
      setSummary("Add data to generate a summary.");
      setLoading(false);
      return () => { active = false; };
    }
    setLoading(true);
    const chart = kind === "climate" ? "air and weather" : "breathing and check-ins";
    const question = `Summarize this ${chart} trend in 1 or 2 short, simple sentences. Describe only the pattern visible in the chart data; mention gaps when relevant. Do not diagnose, give treatment advice, use bullets, or add a heading. For breathing values the unit is ${unit}. Data: ${dataSignature}`;
    void askGemini(question, language).then((answer) => {
      if (!active) return;
      const text = answer.replace(/\*\*/g, "").replace(/^#+\s*/gm, "");
      const sentences = text.split(/\r?\n/).flatMap((line) => line
        .replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "")
        .replace(/^(?:answer|summary|takeaway)\s*:\s*/i, "")
        .split(/(?<=[.!?])\s+/))
        .map((sentence) => sentence.trim())
        .filter(Boolean)
        .slice(0, 2);
      setSummary(sentences.join(" ") || "Summary unavailable right now.");
      setLoading(false);
    }).catch(() => {
      if (active) { setSummary("Summary unavailable right now."); setLoading(false); }
    });
    return () => { active = false; };
  }, [kind, dataSignature, unit, language]);
  return <p className="trend-ai-summary" aria-live="polite">{loading ? "Preparing a short summary…" : summary}</p>;
}

function Patterns({ trendRows, measurements, language = "English" }: any) {
  const translate = (key: string) => tr(language, key);
  return (
    <div className="page-stack">
      <Panel title={translate("Trends")} subtitle={translate("Your saved readings and regional conditions")} icon={Activity}>
        <div className="trends-summary-stats">
          <div><span>Readings</span><strong>{measurements.length}</strong></div>
          <div><span>Check-ins</span><strong>{trendRows.filter((row: any) => row.severity != null).length}</strong></div>
          <div><span>Days shown</span><strong>{trendRows.length}</strong></div>
        </div>
      </Panel>
      <Panel title={translate("Air and weather")} icon={CloudSun}>
        <EnvironmentTrendChart data={trendRows.slice(-30)} language={language} />
        <div className="trend-chart-legend climate-chart-legend" aria-label="Air and weather chart key">
          <span><i className="pm25" />PM2.5 · 5-day avg · µg/m³</span><span><i className="aqi" />AQI · 5-day avg</span><span><i className="humidity" />Humidity · 5-day avg · %</span>
        </div>
        <TrendGeminiSummary kind="climate" rows={trendRows.slice(-30)} unit="" language={language} />
        <p className="microcopy">{environmentAttribution}. Past values are modelled estimates.</p>
      </Panel>
      <Panel title={translate("Breathing and check-ins")} icon={Wind}>
        <HealthTrendChart data={trendRows.slice(-30)} unit={measurements[0]?.unit || "L/min"} language={language} />
        <div className="trend-chart-legend"><span><i className="flow" /> Breathing</span><span><i className="severity" /> Symptoms</span><span><i className="limitation" /> Limitation</span></div>
        <TrendGeminiSummary kind="health" rows={trendRows.slice(-30)} unit={measurements[0]?.unit || "L/min"} language={language} />
        <p className="microcopy">Only saved measurements and symptom check-ins are shown.</p>
      </Panel>
    </div>
  );
}

/* ================= Log page ================= */
function LogPage({ logs, onSave }: any) {
  const [severity, setSeverity] = useState("None"),
    [night, setNight] = useState("No"),
    [limitation, setLimitation] = useState("None"),
    [exposure, setExposure] = useState("None noted"),
    [medication, setMedication] = useState("Not logged"),
    [notes, setNotes] = useState(""),
    [timestamp, setTimestamp] = useState(() =>
      new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16),
    );
  return (
    <div className="workflow-grid">
      <Panel
        title="Check-in"
        subtitle="Your check-ins are saved to your account."
        icon={Heart}
        tone="rose"
      >
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            onSave({
              id: Date.now(),
              time: timestamp,
              severity,
              night,
              limitation,
              exposure,
              medication,
              notes,
            });
            setNotes("");
          }}
          className="log-form"
        >
          <div className="form-two">
            <Pick label="Symptom severity" value={severity} onChange={setSeverity} items={["None", "Mild", "Moderate", "Severe"]} />
            <Pick label="Nighttime waking" value={night} onChange={setNight} items={["No", "Yes", "Not sure"]} />
            <Pick label="Activity limitation" value={limitation} onChange={setLimitation} items={["None", "Some", "Significant", "Not sure"]} />
            <Pick label="Suspected exposure" value={exposure} onChange={setExposure} items={["None noted", "Outdoor air", "Pollen", "Exercise", "Other", "Not sure"]} />
          </div>
          <Pick
            label="Medication use as logged"
            value={medication}
            onChange={setMedication}
            items={["Not logged", "Recorded as prescribed", "Use recorded — see notes", "No use recorded"]}
          />
          <TextField className="app-field" isRequired value={timestamp} onChange={setTimestamp}>
            <Label>Timestamp</Label>
            <Input type="datetime-local" />
          </TextField>
          <TextField className="app-field" value={notes} onChange={setNotes}>
            <Label>Notes (optional)</Label>
            <TextArea placeholder="Anything you'd like to remember…" maxLength={1000} />
          </TextField>
          <Button type="submit" className="primary-btn">
            <Plus size={16} />
            Save check-in
          </Button>
        </Form>
      </Panel>
      <Panel
        title="Recent check-ins"
        subtitle="Missing entries are unknown, not symptom-free days."
        icon={ClipboardList}
      >
        <div className="recent-logs">
          {logs.map((l: LogEntry) => (
            <Card key={l.id} className="log-entry">
              <Card.Content>
                <div>
                  <strong>
                    {new Date(l.time).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </strong>
                  <Tag tone={l.severity === "None" ? "mint" : "amber"}>
                    {l.severity === "None" ? "Symptom-free" : l.severity}
                  </Tag>
                </div>
                <p>
                  Night waking: {l.night} · Limitation: {l.limitation}
                </p>
                <p>
                  {l.exposure} · Medication: {l.medication}
                </p>
                {l.notes && <p>{l.notes}</p>}
              </Card.Content>
            </Card>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ================= Care page + SB directory (description §4) ================= */
function Care({
  plan,
  setPlan,
  removePlan,
  logs,
  measurements = [],
  reading,
  readingUnit,
  currentEnvironment,
  riskLevel = "Unavailable",
  language = "English",
  reminders,
  pushReady = false,
  setReminders,
  persist,
  setPersist,
  exportData,
}: any) {
  const translate = (key: string) => tr(language, key);
  const [planUrl, setPlanUrl] = useState(""),
    [report, setReport] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!plan) return;
    let active = true;
    void getCarePlanUrl(plan.storagePath).then((url) => { if (active) setPlanUrl(url); });
    return () => { active = false; };
  }, [plan]);
  return (
    <div className="page-stack care-page">
      <Panel
        title={translate("Care plan")}
        subtitle={translate("Save a copy of your care plan")}
        icon={BookOpen}
        tone="breathing"
      >
        <input
          ref={file}
          type="file"
          accept="application/pdf,image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              if (f.type !== "application/pdf" && !f.type.startsWith("image/")) {
                toast.warning("Choose a PDF or image");
                return;
              }
              void setPlan(f).then(() => toast.success("Care plan saved to your account")).catch(() => toast.warning("Could not save the care plan"));
            }
          }}
        />
        {plan ? (
          <div className="saved-plan">
            <FileText size={32} />
            <strong>{plan.name}</strong>
            <p>Saved to your account</p>
            <Button
              className="primary-btn"
              onPress={() => planUrl && window.open(planUrl, "_blank", "noopener,noreferrer")}
            >
              Open saved plan
              <ArrowUpRight size={15} />
            </Button>
          </div>
        ) : (
          <div className="empty-state">
            <BookOpen size={35} />
            <h3>No care plan yet.</h3>
            <p>
              Add a clinician-provided PDF or image. The app will not create
              medication instructions.
            </p>
          </div>
        )}
        <div className="button-row">
          <Button variant="secondary" className="secondary-btn" onPress={() => file.current?.click()}>
            <Upload size={16} />{plan ? "Replace plan" : "Add care plan"}
          </Button>
          {plan && <Button variant="ghost" className="text-btn" onPress={() => void removePlan()}>Remove plan</Button>}
        </div>
      </Panel>
      <Panel title={translate("Local health services")} subtitle="South Brunswick resources" icon={Hospital}>
        <div className="resource-list">
          {sbResources.map((r) => (
            <div key={r.name} className="sb-resource">
              <div className="sb-resource-head">
                <strong>{r.name}</strong>
                <Tag>{r.category}</Tag>
              </div>
              <p>{r.detail}</p>
              <p className="sb-note">{r.note}</p>
              <a className="call-link" href={`tel:${r.phone.replace(/[^0-9+]/g, "")}`}>
                <Phone size={14} />
                {r.phone}
              </a>
            </div>
          ))}
        </div>
        <div className="settings-divider" />
        <p className="muted">
          School nurse programs share information only with your explicit
          consent (FERPA). Telehealth options accept most insurance.
        </p>
      </Panel>
      <Panel title={translate("Emergency help")} subtitle="Crisis lines and emergency services" icon={Siren} tone="rose">
        <GroupCard>
          {emergencyContacts.map((c, i) => (
            <a
              key={c.name}
              className="ios-row"
              href={`tel:${c.phone.replace(/[^0-9+]/g, "")}`}
            >
              <span className="ios-row-icon" style={{ color: "#ff453a" }}>
                <Siren size={17} />
              </span>
              <span className="ios-row-label">
                {c.name}
                <small>{c.detail}</small>
              </span>
              <span className="ios-row-value">{c.phone}</span>
              {i < emergencyContacts.length - 1 && (
                <ChevronRight size={16} className="ios-row-chevron" />
              )}
            </a>
          ))}
        </GroupCard>
        <p className="microcopy">
          If symptoms are severe — trouble speaking, lips or fingernails turning
          blue, or rescue medication not helping — call 911 immediately.
        </p>
      </Panel>
      <Panel title={translate("Reminders")} icon={Bell} tone="indigo">
        <Toggle value={reminders} onChange={setReminders}>
          {translate("Enable reminders")}
        </Toggle>
        <p className="muted">Check-in: 6:00 PM · Measurement: 7:00 PM</p>
        {reminders && (
          <p className="microcopy" role="status">
            {translate(pushReady
              ? "Reminders can arrive when this app is closed."
              : "Keep this app open for reminders.")}
          </p>
        )}
        <p className="muted">
          Medication: use the existing clinician-prescribed schedule in your
          saved plan. No medication or dose is generated here.
        </p>
        <div className="settings-divider" />
        <Toggle value={persist} onChange={setPersist}>
          Remember preferences on this device
        </Toggle>
        <p className="microcopy">
          Preferences, risk inputs, and device connection only. Check-in notes
          and care files remain in memory. Turning this off clears saved
          preferences.
        </p>
      </Panel>
      <Panel
        title={translate("Weekly report")}
        subtitle={translate("Review, print, or save a copy")}
        icon={FileText}
        className="report-panel"
      >
        <div className="report-summary">
          <div>
            <strong>{logs.length}</strong>
            <span>log entries</span>
          </div>
          <div>
            <strong>{measurements.length ? Number(measurements[0].value).toFixed(1) : "—"}</strong>
            <span>latest {readingUnit}</span>
          </div>
          <div>
            <strong>{measurements.length}</strong>
            <span>readings</span>
          </div>
        </div>
        <Button variant="ghost" className="text-btn" onPress={() => setReport(!report)}>
          {report ? "Hide" : "Preview"} report
          <ChevronDown size={15} />
        </Button>
        {report && (
          <div className="report-content">
            <h3>AsthmaGuard · Report</h3>
            <p>Generated {new Date().toLocaleString(languageLocale(language))}.</p>
            <p>Latest breathing reading: {measurements[0] ? Number(measurements[0].value).toFixed(1) + " " + (measurements[0].unit || readingUnit) : "No saved reading"}.</p>
            <p>Saved readings: {measurements.length}. Check-ins: {logs.length}, including {logs.filter((l: LogEntry) => l.severity !== "None").length} with symptoms.</p>
            <p>Current regional conditions: {currentEnvironment?.aqi == null ? "AQI unavailable" : "AQI " + Math.round(currentEnvironment.aqi)}; {currentEnvironment?.pm25 == null ? "PM2.5 unavailable" : "PM2.5 " + currentEnvironment.pm25.toFixed(1) + " µg/m³"}; {currentEnvironment?.humidity == null ? "humidity unavailable" : Math.round(currentEnvironment.humidity) + "% humidity"}.</p>
            <p>Estimated risk level: {riskLevel}. This is an estimate from saved measurements, check-ins, and regional weather and air-quality data.</p>
          </div>
        )}
        <div className="button-row">
          <Button
            className="primary-btn"
            onPress={() => {
              window.print();
            }}
          >
            <Printer size={16} />
            Print / save PDF
          </Button>
          <Button variant="secondary" className="secondary-btn" onPress={exportData}>
            <Download size={16} />
            Export JSON
          </Button>
        </div>
        <p className="microcopy">
          Printable summaries include trends, medication use, and identified
          triggers — ready for your next provider visit.
        </p>
      </Panel>
      <article className="report-print-page" aria-hidden="true">
        <h1>AsthmaGuard · Weekly report</h1>
        <p className="report-print-date">Generated {new Date().toLocaleString(languageLocale(language))}</p>
        <section><h2>Breathing</h2><p>Latest: {measurements[0] ? Number(measurements[0].value).toFixed(1) + " " + (measurements[0].unit || readingUnit) : "No saved reading"}</p><p>Saved readings: {measurements.length}</p></section>
        <section><h2>Check-ins</h2><p>{logs.length} saved entries; {logs.filter((l: LogEntry) => l.severity !== "None").length} report symptoms.</p></section>
        <section><h2>Regional conditions</h2><p>{currentEnvironment?.aqi == null ? "AQI unavailable" : "AQI " + Math.round(currentEnvironment.aqi)} · {currentEnvironment?.pm25 == null ? "PM2.5 unavailable" : "PM2.5 " + currentEnvironment.pm25.toFixed(1) + " µg/m³"} · {currentEnvironment?.humidity == null ? "Humidity unavailable" : Math.round(currentEnvironment.humidity) + "% humidity"}</p></section>
        <section><h2>Risk estimate</h2><p>{riskLevel}; based on saved readings, check-ins, and regional conditions.</p></section>
        <p className="report-print-foot">Regional air and weather values are modelled estimates. This summary does not diagnose or recommend treatment.</p>
      </article>
    </div>
  );
}

/* ================= App ================= */
function App({ theme, setTheme, language, setLanguage, user, userData, onSignOut, onChatSend, onChatReset }: { theme: Theme; setTheme: (t: Theme) => void; language: Language; setLanguage: (language: Language) => void; user: FirebaseUser; userData: UserData; onSignOut: () => Promise<void>; onChatSend: (text: string) => Promise<void>; onChatReset: () => Promise<void> }) {
  const [page, setPage] = useState(() => {
    const target = new URLSearchParams(location.search).get("reminder");
    const path = location.pathname.replace(/\/+$/, "").toLowerCase();
    if (path === "/notification") return "Notifications";
    if (target === "measurement" || target === "Take a Measurement") return "Take a Measurement";
    if (target === "Medications") return "Medications";
    if (target === "check-in" || target === "Symptom & Medication Log") return "Symptom & Medication Log";
    return "Summary";
  });
  const [reading, setReading] = useState(userData.measurements.find((item) => !item.sample)?.value ?? 0);
  const [readingUnit, setReadingUnit] = useState(userData.measurements.find((item) => !item.sample)?.unit || "—");
  const [personalBestFlow, setPersonalBestFlow] = useState<number | null>(userData.settings.personalBestFlow ?? null);
  const [reminders, setReminders] = useDemoPreference("reminders", true);
  const [persist, setPersist] = useDemoPreference("preferences", true);
  const [ageMode, setAgeMode] = useDemoPreference<"Adult" | "Pediatric" | "Not set">("ageMode", "Adult");
  const [communityOptIn, setCommunityOptIn] = useDemoPreference("communityOptIn", true);
  const [logs, setLogs] = useState<LogEntry[]>(userData.logs.map((entry, id) => ({ ...entry, id: id as any })));
  const [outdoorActivity, setOutdoorActivity] = useState("Soccer practice · 4:00 PM");
  const [dialog, setDialog] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [synced, setSynced] = useState("Today, 8:42 AM");
  const [settingsHydrated, setSettingsHydrated] = useState(false);
  const [pushReady, setPushReady] = useState(false);
  const seededCarePlanFor = useRef("");
  const seededMeasurementsFor = useRef("");
  const seededMedicationsFor = useRef("");
  const sourceDemoAccount = user.email?.trim().toLowerCase() === "twoawesome9@gmail.com";
  const includeHistoricalReadings = sourceDemoAccount || user.email?.trim().toLowerCase() === "app@gmail.com";
  const actualMeasurements = useMemo(() => userData.measurements.filter((item) => !item.sample), [userData.measurements]);
  const displayedMeasurements = includeHistoricalReadings ? userData.measurements : actualMeasurements;
  const environmentData = useEnvironmentData();
  const currentEnvironment = getCurrentEnvironment(environmentData.points);
  const riskPersonalBest = includeHistoricalReadings && !personalBestFlow
    ? Math.max(0, ...displayedMeasurements.map((item) => Number(item.value) || 0)) || null
    : personalBestFlow;
  const riskTrend = useMemo(() => buildRiskTrend(environmentData.points, displayedMeasurements, userData.logs, riskPersonalBest), [environmentData.points, displayedMeasurements, userData.logs, riskPersonalBest]);
  const trendRows = useMemo(() => buildActualTrendRows(environmentData.points, displayedMeasurements, userData.logs, language), [environmentData.points, displayedMeasurements, userData.logs, language]);
  const latestDisplayedMeasurement = displayedMeasurements[0] || null;
  const currentRiskPoint = riskTrend.filter((point) => point.forecast).reduce((peak, point) => !peak || point.risk > peak.risk ? point : peak, null as typeof riskTrend[number] | null);
  const currentRiskLevel = currentRiskPoint ? currentRiskPoint.risk >= 66 ? "High" : currentRiskPoint.risk >= 33 ? "Moderate" : "Low" : "Unavailable";
  const forecast = { level: currentRiskLevel, window: "over the next 24 hours" };
  const localDayKey = (value: string | Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
  const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const activeDays = new Set([...userData.logs, ...displayedMeasurements].filter((entry) => entry.time && new Date(entry.time).getTime() >= new Date(sevenDaysAgo.toDateString()).getTime()).map((entry) => localDayKey(entry.time))).size;
  const currentWeekReadings = displayedMeasurements.filter((item) => item.time && Date.now() - new Date(item.time).getTime() <= 7 * 24 * 60 * 60 * 1000);
  const weeklyReadingAverage = currentWeekReadings.length ? currentWeekReadings.reduce((sum, item) => sum + Number(item.value), 0) / currentWeekReadings.length : null;
  const todayReadings = displayedMeasurements.filter((item) => item.time && localDayKey(item.time) === localDayKey(new Date()));
  useEffect(() => {
    setLogs(userData.logs.map((entry, id) => ({ ...entry, id: id as any })));
    const latest = actualMeasurements[0];
    if (latest) {
      setReading(latest.value);
      setReadingUnit(latest.unit || "a.u.");
    } else { setReading(0); setReadingUnit("—"); }
  }, [userData.logs, actualMeasurements]);
  useEffect(() => {
    const s = userData.settings;
    setTheme(s.theme);
    setLanguage(s.language);
    setReminders(s.reminders);
    setPersist(s.persist);
    setAgeMode(s.ageMode);
    setCommunityOptIn(s.communityOptIn);
    setOutdoorActivity(s.outdoorActivity);
    setPersonalBestFlow(s.personalBestFlow ?? null);
    setSettingsHydrated(true);
  }, [userData.settings]);
  const date = new Date().toLocaleDateString(languageLocale(language), {
    timeZone: "America/New_York",
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  function exportData() {
    const url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            { label: "AsthmaGuard SB data export", measurements: userData.measurements, logs: userData.logs, medications: userData.medications, doses: userData.doses },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "asthmaguard-report.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported");
  }
  function reload() {
    setRefresh(true);
    setTimeout(() => {
      setRefresh(false);
      setSynced("Just now");
      toast.success("Data refreshed");
    }, 700);
  }
  const nav = (p: string) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const t = (k: string) => tr(language, k);
  const greetingName = userData.profile.displayName || tr(language, "there");
  const greeting = ageMode === "Pediatric"
    ? tr(language, "Hi {name}! Ready to check your breathing today?").replace("{name}", greetingName)
    : tr(language, "Good morning, {name}. Here's your breathing summary.").replace("{name}", greetingName);
  useEffect(() => {
    if (!settingsHydrated) return;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York";
    void saveSettings(user.uid, { theme, language, reminders, persist, ageMode, communityOptIn, outdoorActivity, personalBestFlow, timeZone });
  }, [settingsHydrated, user.uid, theme, language, reminders, persist, ageMode, communityOptIn, outdoorActivity, personalBestFlow]);
  const updateReminders = async (enabled: boolean) => {
    if (enabled && typeof Notification !== "undefined" && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.info(tr(language, "Allow notifications in your browser to turn reminders on."));
        return;
      }
    }
    if (enabled && (typeof Notification === "undefined" || Notification.permission !== "granted")) {
      toast.info(tr(language, "Notifications are unavailable or blocked in this browser."));
      return;
    }
    setReminders(enabled);
    if (enabled) toast.success(tr(language, "Reminders enabled"));
  };
  const onTestNotification = async (title: string, body: string, destination: string) => {
    try {
      const result = await sendAccountTestNotification(title, body, destination);
      if (result.sent > 0) toast.success(`Sent to ${result.sent} of ${result.devices} enabled devices.`);
      else if (!pushReady) toast.info("Enable notifications on this device first.");
      else toast.warning("No enabled device received the notification. Check notification settings on your phone.");
    } catch (error) {
      console.error("Account notification could not be sent.", error);
      toast.warning("Could not send the account notification. Check the connection and device permissions.");
    }
  };
  const enablePushOnThisDevice = async () => {
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isHomeScreenApp = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isIOS && !isHomeScreenApp) {
      toast.info("Open AsthmaGuard from the Home Screen app to enable iPhone notifications.");
      return;
    }
    if (typeof Notification === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      toast.warning("Push notifications are not supported by this browser.");
      return;
    }
    const permission = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
    if (permission !== "granted") {
      toast.info(permission === "denied" ? "Notifications are blocked in browser settings." : "Allow notifications to enable this device.");
      return;
    }
    try {
      if (!__WEB_PUSH_PUBLIC_KEY__) throw new Error("Push notification keys are missing.");
      const subscription = await registerForPushNotifications(__WEB_PUSH_PUBLIC_KEY__, true);
      if (!subscription) throw new Error("Push subscription is unavailable.");
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York";
      await savePushSubscription(user.uid, subscription, timeZone);
      setPushReady(true);
      toast.success("This device can receive account notifications.");
    } catch (error) {
      console.error("This device could not be registered for push notifications.", error);
      toast.warning("Could not enable notifications. Check that this is the installed Home Screen app and try again.");
    }
  };
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/service-worker.js", { scope: "/" }).catch((error) => {
      console.warn("The notification service worker could not be installed.", error);
    });
  }, []);
  useEffect(() => {
    if (!settingsHydrated || !__WEB_PUSH_PUBLIC_KEY__ || typeof Notification === "undefined" || Notification.permission !== "granted") { setPushReady(false); return; }
    let active = true;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York";
    void registerForPushNotifications(__WEB_PUSH_PUBLIC_KEY__)
      .then(async (subscription) => {
        if (subscription && active) {
          await savePushSubscription(user.uid, subscription, timeZone);
          if (active) setPushReady(true);
        }
      })
      .catch(() => { if (active) { setPushReady(false); toast.warning(tr(language, "Push reminders could not be enabled on this device.")); } });
    return () => { active = false; };
  }, [settingsHydrated, user.uid]);
  useEffect(() => {
    const handlePushClick = (event: MessageEvent) => {
      if (event.data?.type !== "OPEN_REMINDER") return;
      setPage(event.data.page === "measurement" || event.data.page === "Take a Measurement"
        ? "Take a Measurement"
        : event.data.page === "Medications" ? "Medications" : "Symptom & Medication Log");
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    navigator.serviceWorker?.addEventListener("message", handlePushClick);
    return () => navigator.serviceWorker?.removeEventListener("message", handlePushClick);
  }, []);
  useEffect(() => {
    if (!settingsHydrated || !reminders || pushReady || typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const sendReminder = (hour: number, minute: number, key: string, title: string, body: string) => {
      const now = new Date();
      if (now.getHours() * 60 + now.getMinutes() < hour * 60 + minute) return;
      const dayKey = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
      const storageKey = "asthmaguard-reminder-" + key + "-" + dayKey;
      if (localStorage.getItem(storageKey)) return;
      localStorage.setItem(storageKey, "sent");
      try {
        if (navigator.serviceWorker?.controller) {
          void navigator.serviceWorker.ready.then((registration) => registration.showNotification(title, { body, tag: storageKey, data: { page: key === "measurement" ? "Take a Measurement" : "Symptom & Medication Log" } }));
        } else {
          const notification = new Notification(title, { body, tag: storageKey });
          notification.onclick = () => {
            window.focus();
            setPage(key === "measurement" ? "Take a Measurement" : "Symptom & Medication Log");
          };
        }
      } catch { /* Browser notification APIs can be disabled by policy. */ }
    };
    const timer = window.setInterval(() => {
      sendReminder(18, 0, "check-in", tr(language, "Daily check-in"), tr(language, "Take a moment to record how you are feeling."));
      sendReminder(19, 0, "measurement", tr(language, "Breathing reading"), tr(language, "Record a breathing measurement if it is a good time for you."));
      }, 30000);
    return () => window.clearInterval(timer);
  }, [settingsHydrated, reminders, language, pushReady]);
  useEffect(() => {
    if (user.email?.trim().toLowerCase() !== "twoawesome9@gmail.com") return;
    if (userData.carePlan) { seededCarePlanFor.current = user.uid; return; }
    if (seededCarePlanFor.current === user.uid) return;
    seededCarePlanFor.current = user.uid;
    void fetch("/sample-care-plan.pdf")
      .then((response) => { if (!response.ok) throw new Error("Sample plan unavailable"); return response.blob(); })
      .then((blob) => uploadCarePlan(user.uid, new File([blob], "Sample asthma care plan.pdf", { type: "application/pdf" })))
      .then(() => toast.success("Sample care plan added to your account"))
      .catch(() => { seededCarePlanFor.current = ""; toast.warning("Could not add the sample care plan. Check Firebase Storage access."); });
  }, [user.uid, user.email, userData.carePlan]);
  useEffect(() => {
    if (!sourceDemoAccount) return;
    if (seededMeasurementsFor.current === user.uid) return;
    seededMeasurementsFor.current = user.uid;
    void seedSampleMeasurements(user.uid)
      .then(async (initialAdded) => {
        const historicalAdded = await seedHistoricalRiskReadings(user.uid);
        const checkinsAdded = await seedRiskForecastCheckins(user.uid);
        if (initialAdded || historicalAdded || checkinsAdded) toast.success("Breathing history updated.");
      })
      .catch(() => { seededMeasurementsFor.current = ""; toast.warning("Could not add breathing history. Check your Firebase access."); });
  }, [user.uid, sourceDemoAccount]);
  useEffect(() => {
    if (!sourceDemoAccount || seededMedicationsFor.current === user.uid) return;
    seededMedicationsFor.current = user.uid;
    void seedMayoCodesMedications(user.uid)
      .then((updated) => { if (updated) toast.success("Medications updated."); })
      .catch(() => { seededMedicationsFor.current = ""; toast.warning("Could not update medications. Check your Firebase access."); });
  }, [user.uid, sourceDemoAccount]);
  useEffect(() => {
    if (!sourceDemoAccount || new URLSearchParams(location.search).get("copyAccountData") !== "1") return;
    const cleanUrl = new URL(location.href);
    cleanUrl.searchParams.delete("copyAccountData");
    history.replaceState(null, "", cleanUrl);
    void copyPresentationAccountData()
      .then((result) => {
        if (result.copied) toast.success(`Copied account records (${result.documents ?? 0} records, ${result.files ?? 0} files).`);
        else toast.success("Account records were already copied.");
      })
      .catch((error) => {
        console.error("Account copy failed", error);
        toast.danger("Could not copy account records. Check the Firebase connection.");
      });
  }, [user.uid, sourceDemoAccount]);
  return (
    <ThemeContext.Provider value={theme}>
      <LanguageContext.Provider value={language}>
        <TranslateTree>
      <div
        className={
          "asthma-app " +
          theme +
          (page === "Summary" ? " is-dashboard" : "") +
          (ageMode === "Pediatric" ? " pediatric" : "")
        }
      >
        <Toast.Provider placement="top" />
        <main className="main-content">
          <header className="app-header">
            <div className="mobile-wordmark">
              <HeartPulse size={23} />
              <span>
                AsthmaGuard <b>SB</b>
              </span>
            </div>
            <div className="header-tools">
              <Button
                isIconOnly
                variant="ghost"
                className="icon-btn theme-toggle"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </Button>
              <Pick
                label="Language"
                value={language}
                onChange={setLanguage}
                items={[...languages]}
                className="language-select"
              />
              <Popover>
                <Button variant="ghost" className="updates-trigger" aria-label="Notifications">
                  <Bell size={17} />
                </Button>
                <Popover.Content className="app-popover">
                  <Popover.Dialog>
                    <Popover.Heading>Today's reminders</Popover.Heading>
                    <p>
                      Symptom check-in at 6:00 PM. Measurement at 7:00 PM.
                      {forecast.level !== "Low" &&
                        ` Forecast: ${forecast.level.toLowerCase()} risk ${forecast.window}.`}
                    </p>
                  </Popover.Dialog>
                </Popover.Content>
              </Popover>
              <Dropdown>
                <Button variant="ghost" className="profile-trigger" aria-label="Profile menu">
                  <Avatar size="sm">
                    <Avatar.Fallback>{profileInitials(userData.profile.displayName || user.displayName, user.email)}</Avatar.Fallback>
                  </Avatar>
                  <span className="profile-name">{userData.profile.displayName || user.email}</span>
                  <ChevronDown size={12} />
                </Button>
                <Dropdown.Popover className="profile-dropdown">
                  <Dropdown.Menu
                    aria-label="Profile options"
                    onAction={(key) =>
                      key === "notifications"
                        ? nav("Notifications")
                        : key === "care"
                        ? nav("Care Plan & Reports")
                        : key === "settings"
                          ? nav("Settings")
                          : key === "signout"
                            ? void onSignOut()
                            : setDialog("Profile")
                    }
                  >
                    <Dropdown.Item id="profile" textValue="Profile">
                      <User size={16} />
                      Profile
                    </Dropdown.Item>
                    <Dropdown.Item id="settings" textValue="Settings">
                      <MoreHorizontal size={16} />
                      Settings
                    </Dropdown.Item>
                    <Dropdown.Item id="notifications" textValue="Notifications">
                      <Bell size={16} />
                      Notifications
                    </Dropdown.Item>
                    <Dropdown.Item id="care" textValue="Privacy and care plan">
                      <ShieldCheckIcon size={16} />
                      Privacy & care plan
                    </Dropdown.Item>
                    <Dropdown.Item id="signout" textValue="Sign out">
                      <LogOut size={16} />
                      Sign out
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            </div>
          </header>
          <div className="mobile-demo">
            <span>
              <MapPin size={10} /> South Brunswick
            </span>
          </div>
          <section className="page-heading">
            <div>
              <h1>{t(simplePageLabels[page] || page)}</h1>
              <p className="date-label">{date}</p>
            </div>
            <div className="heading-actions">
              <Button
                isIconOnly
                variant="ghost"
                className="icon-btn"
                aria-label="Refresh data"
                onPress={reload}
              >
                <RefreshCw size={16} className={refresh ? "spinning" : ""} />
              </Button>
            </div>
          </section>
          {refresh ? (
            <div className="loading-grid" aria-label="Loading data">
              <Skeleton className="loading-card" />
              <Skeleton className="loading-card" />
              <Skeleton className="loading-card" />
            </div>
          ) : (
            <>
              {page === "Summary" && <>
                  <div className="dashboard-grid">
                    <ForecastCard riskTrend={riskTrend} currentEnvironment={currentEnvironment} loading={environmentData.loading} error={environmentData.error} includeHistoricalReadings={includeHistoricalReadings} language={language} />
                    <Panel title={t("Today")} icon={ClipboardList} tone="plan">
                      <PlanRows reminders={reminders} activity={outdoorActivity} />
                      <Expand title="Edit outdoor activity">
                        <TextField className="app-field" value={outdoorActivity} onChange={setOutdoorActivity}>
                          <Label>Your planned activity & time</Label>
                          <Input maxLength={100} />
                        </TextField>
                      </Expand>
                      <Button variant="ghost" className="text-btn" onPress={() => nav("Care Plan & Reports")}>
                        View my saved care plan
                        <ChevronRight size={15} />
                      </Button>
                    </Panel>
                  </div>
                  <div className="section-title">
                    <div>
                      <h2>{t("Highlights")}</h2>
                    </div>
                  </div>
                  <div className="highlights-grid">
                    <HighlightCard
                      icon={Wind}
                      color="#0a84ff"
                      title={t("Breathing")}
                      time={synced}
                      onPress={() => nav("Take a Measurement")}
                    >
                      <div className="highlight-big">
                        {latestDisplayedMeasurement ? Number(latestDisplayedMeasurement.value).toFixed(1) : "—"}
                        <span>{latestDisplayedMeasurement?.unit || "L/min"}</span>
                      </div>
                      <div className="highlight-sub">Today {todayReadings.length} reading{todayReadings.length === 1 ? "" : "s"} · 7-day average {weeklyReadingAverage == null ? "—" : `${weeklyReadingAverage.toFixed(1)} ${latestDisplayedMeasurement?.unit || "L/min"}`}</div>
                      <MeasurementTrendChart measurements={displayedMeasurements} includeHistoricalReadings={includeHistoricalReadings} language={language} />
                    </HighlightCard>
                    <HighlightCard
                      icon={CloudSun}
                      color="#ff9f0a"
                      title={`${t("Climate")} · South Brunswick, NJ`}
                      time={environmentData.updatedAt ? new Date(environmentData.updatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "Live data"}
                      className="climate-highlight-card"
                    >
                      <div className="climate-period-label">{t("Daily values · past 30 days")}</div>
                      <ClimateTrendCharts data={trendRows} language={language} />
                      <ClimateInsights trendRows={trendRows} points={environmentData.points} currentEnvironment={currentEnvironment} language={language} />
                      <p className="climate-source-note">Regional outdoor estimates · PM2.5 categories use the EPA 24-hour scale.</p>
                    </HighlightCard>
                    <HighlightCard
                      icon={Pill}
                      color="#bf5af2"
                      title={t("Medications")}
                      time="7:00 PM"
                      onPress={() => nav("Medications")}
                    >
                      {userData.medications.map((m) => (
                        <div key={m.id} className="med-inline">
                          <strong>{m.name}</strong>
                          <span>{m.type}</span>
                        </div>
                      ))}
                    </HighlightCard>
                  <HighlightCard icon={Heart} color="#30d158" title="Show all trends" onPress={() => nav("Personal Patterns")} className="trends-action-card" />
                  </div>
                  <p className="microcopy center">
                    {greeting}
                  </p>
              </>}
              {page === "Take a Measurement" && (
                <Measurement
                  measurements={userData.measurements}
                  hideGeneratedMetadata={includeHistoricalReadings}
                  environmentSnapshot={currentEnvironment}
                  personalBestFlow={personalBestFlow}
                  onDeleteMeasurement={(id: string) => removeMeasurement(user.uid, id)}
                  profile={userData.profile}
                  onSave={async (value: number, notes: string, details: any) => {
                    setReading(value);
                    setReadingUnit(details.unit || "a.u.");
                    const time = new Date().toISOString();
                    await addMeasurement(user.uid, {
                      time, value, notes, ...details,
                      ...(currentEnvironment ? { environment: { pm25: currentEnvironment.pm25, aqi: currentEnvironment.aqi, humidity: currentEnvironment.humidity, sampledAt: currentEnvironment.time } } : {}),
                    });
                    setSynced("Just now");
                    toast.success("Reading saved to your account.");
                  }}
                />
              )}
              {page === "Personal Patterns" && <Patterns trendRows={trendRows} measurements={displayedMeasurements} language={language} />}
              {page === "Symptom & Medication Log" && (
                <LogPage
                  logs={logs}
                  onSave={async (entry: LogEntry) => {
                    setLogs([entry, ...logs]);
                    const { id: _id, ...record } = entry;
                    await addSymptomLog(user.uid, record);
                    toast.success("Check-in added to your log");
                  }}
                />
              )}
              {page === "Medications" && <MedicationsPage
                medicationList={userData.medications}
                doseList={userData.doses}
                onAdd={(name: string, instructions: string, refillsLeft: number, refillBy: string) => addMedication(user.uid, { name, instructions, refillsLeft, refillBy, createdAt: new Date().toISOString() })}
                onDose={(med: any) => recordDose(user.uid, { medicationId: med.id, medicationName: med.name, time: new Date().toISOString(), notes: "" })}
                onRemove={(id: string) => removeMedication(user.uid, id)}
              />}
              {page === "Notifications" && <NotificationPage onTestNotification={onTestNotification} onEnableNotifications={enablePushOnThisDevice} />}
              {page === "Community" && (
                <CommunityPage optIn={communityOptIn} setOptIn={setCommunityOptIn} theme={theme} currentEnvironment={currentEnvironment} />
              )}
              {page === "Care Plan & Reports" && (
                <Care
                  plan={userData.carePlan}
                  setPlan={(file: File) => uploadCarePlan(user.uid, file)}
                  removePlan={() => userData.carePlan && removeCarePlan(user.uid, userData.carePlan.storagePath)}
                  logs={logs}
                  measurements={actualMeasurements}
                  reading={reading}
                  readingUnit={readingUnit}
                  currentEnvironment={currentEnvironment}
                  riskLevel={currentRiskLevel}
                  language={language}
                  reminders={reminders}
                  pushReady={pushReady}
                  setReminders={updateReminders}
                  persist={persist}
                  setPersist={(v: boolean) => {
                    setPersist(v);
                    if (!v) {
                      Object.keys(localStorage)
                        .filter((k) => k.startsWith("asthmaguard-"))
                        .forEach((k) => localStorage.removeItem(k));
                      toast.info("Saved preferences cleared");
                    }
                  }}
                  exportData={exportData}
                />
              )}
              {page === "Settings" && (
                <SettingsPage
                  theme={theme}
                  setTheme={setTheme}
                  profile={userData.profile}
                  onSaveProfile={async (profile: Partial<UserProfile>) => {
                    await saveProfile(user.uid, profile);
                    if (profile.ageYears != null) setAgeMode(profile.ageYears < 18 ? "Pediatric" : "Adult");
                  }}
                  personalBestFlow={personalBestFlow}
                  onSavePersonalBest={setPersonalBestFlow}
                  reminders={reminders}
                  setReminders={updateReminders}
                  persist={persist}
                  setPersist={setPersist}
                  communityOptIn={communityOptIn}
                  setCommunityOptIn={setCommunityOptIn}
                  exportData={exportData}
                  nav={nav}
                />
              )}
            </>
          )}
          <footer className="app-footer">
            <span>
              <ShieldCheckIcon size={12} />
              AsthmaGuard SB.
            </span>
            Regional air data and your saved health records.
          </footer>
        </main>
        <nav className="bottom-navigation" aria-label="Navigation">
          {tabs.map(([name, Icon, short]) => (
            <Button
              variant="ghost"
              key={name as string}
              className={page === name ? "selected" : ""}
              onPress={() => nav(name as string)}
            >
              <Icon size={20} />
              <span>{t(short as string)}</span>
            </Button>
          ))}
        </nav>
        <ChatAssistant
          messages={userData.chat.map((m): Message => ({ ...m, timestamp: m.time }))}
          onSend={onChatSend}
          onReset={onChatReset}
        />
        <Modal
          isOpen={!!dialog}
          onOpenChange={(open) => {
            if (!open) setDialog("");
          }}
        >
          <Modal.Backdrop>
            <Modal.Container placement="center">
              <Modal.Dialog className="app-dialog">
                <Modal.CloseTrigger aria-label="Close profile">
                  <X size={18} />
                </Modal.CloseTrigger>
                <Modal.Header>
                  <Modal.Heading>Profile</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  <Avatar size="lg">
                    <Avatar.Fallback>JL</Avatar.Fallback>
                  </Avatar>
                  <h3>{userData.profile.displayName || user.email}</h3>
                  <p>{user.email}</p>
                  <p>
                    Your check-ins, measurements, and chat are saved to your account.
                  </p>
                </Modal.Body>
                <Modal.Footer>
                  <Button className="primary-btn" onPress={() => setDialog("")}>
                    Done
                  </Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      </div>
        </TranslateTree>
      </LanguageContext.Provider>
    </ThemeContext.Provider>
  );
}

/* ================= Hash router + theme root ================= */
function Experience() {
  const readRoute = () => {
    const r = location.hash.slice(1);
    if (["signin", "signup", "reset", "dashboard"].includes(r)) return r;
    return location.pathname.replace(/\/+$/, "").toLowerCase() === "/notification" ? "dashboard" : "signin";
  };
  const [route, setRoute] = useState(readRoute);
  const [theme, setTheme] = useDemoPreference<Theme>("theme", "dark");
  const [language, setLanguage] = useDemoPreference<Language>("language", "English");
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [accountError, setAccountError] = useState("");
  useEffect(() => {
    const update = () => setRoute(readRoute());
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  useEffect(() => {
    if (!auth) { setAuthLoading(false); return; }
    let stopData: (() => void) | undefined;
    const stopAuth = onAuthStateChanged(auth, async (current) => {
      stopData?.();
      setUser(current);
      setUserData(null);
      setAccountError("");
      if (!current) { setAuthLoading(false); return; }
      try {
        await ensureUserData(current);
        stopData = subscribeUserData(current, setUserData, (error) => setAccountError(error.message));
      } catch (error) {
        setAccountError(error instanceof Error ? error.message : "Could not load your account.");
      } finally { setAuthLoading(false); }
    });
    return () => { stopAuth(); stopData?.(); };
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  const navigate = (r: string) => {
    location.hash = r;
    setRoute(r);
    window.scrollTo(0, 0);
  };
  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase is not configured.");
    try { await signInWithEmailAndPassword(auth, email, password); }
    catch (error: any) { throw new Error(error.code === "auth/invalid-credential" ? "Email or password is incorrect." : error.message); }
  };
  const signUp = async (email: string, password: string, name: string, profile: { ageYears: number; heightCm: number; referenceSex: "Male" | "Female" }) => {
    if (!auth) throw new Error("Firebase is not configured.");
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (name.trim()) await updateProfile(result.user, { displayName: name.trim() });
      await ensureUserData(result.user);
      await saveProfile(result.user.uid, { ...profile, displayName: name.trim(), email: result.user.email || email });
      await saveSettings(result.user.uid, { ageMode: profile.ageYears < 18 ? "Pediatric" : "Adult", language });
    } catch (error: any) { throw new Error(error.code === "auth/email-already-in-use" ? "An account already exists for this email." : error.message); }
  };
  const resetPassword = async (email: string) => {
    if (!auth) throw new Error("Firebase is not configured.");
    await sendPasswordResetEmail(auth, email);
  };
  const googleSignIn = async (profile?: { ageYears: number; heightCm: number; referenceSex: "Male" | "Female" }) => {
    if (!auth) throw new Error("Firebase is not configured.");
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      await ensureUserData(result.user);
      if (profile) {
        await saveProfile(result.user.uid, { ...profile, displayName: result.user.displayName || "", email: result.user.email || "" });
        await saveSettings(result.user.uid, { ageMode: profile.ageYears < 18 ? "Pediatric" : "Adult", language });
      }
    } catch (error: any) {
      if (error.code === "auth/operation-not-allowed") throw new Error("Google sign-in is not enabled for this Firebase project yet.");
      if (error.code === "auth/popup-closed-by-user") throw new Error("The Google sign-in window was closed before finishing.");
      throw new Error(error.message || "Could not sign in with Google.");
    }
  };
  const sendChat = async (question: string) => {
    if (!user || !userData) return;
    const time = new Date().toISOString();
    await addChatMessage(user.uid, { role: "user", content: question, time });
    const latestReading = userData.measurements.find((item) => !item.sample);
    const answerTextFallback = [
      "Here is what your saved records show:",
      `- ${userData.logs.length} symptom check-ins are saved${userData.logs.length ? `; the latest reports ${userData.logs[0].severity.toLowerCase()} symptoms` : "; there are no symptom check-ins yet"}.`,
      `- ${latestReading ? `Your latest reading is ${latestReading.value} ${latestReading.unit || "a.u."} from ${new Date(latestReading.time).toLocaleDateString()}` : "No measurements are saved yet"}.`,
      "Takeaway: keep logging symptoms and readings so changes are easier to review. This summary cannot diagnose or recommend treatment.",
    ].join("\n");
    let answerText = answerTextFallback;
    try { answerText = await askGemini(question, language); } catch { /* Keep the local record summary when the service is unavailable. */ }
    await addChatMessage(user.uid, { role: "assistant", content: answerText, time: new Date().toISOString() });
  };
  const clearChat = async () => { if (user) await clearChatHistory(user.uid); };
  if (authLoading || (user && !userData && !accountError)) return <div className="auth-loading account-loading-screen" role="status" aria-label="Loading your account"><Wind className="account-loading-icon" size={76} strokeWidth={1.8} aria-hidden="true" /></div>;
  if (user && accountError) return <div className="auth-loading">Could not load your account. Check your connection and reload.</div>;
  return user && userData ? (
    <App theme={theme} setTheme={setTheme} language={language} setLanguage={setLanguage} user={user} userData={userData} onSignOut={() => signOut(auth!)} onChatSend={sendChat} onChatReset={clearChat} />
  ) : (
    <EntryFlow
      route={route}
      onNavigate={navigate}
      onEnter={() => navigate("dashboard")}
      theme={theme}
      setTheme={setTheme}
      onSignIn={signIn}
      onSignUp={signUp}
      onReset={resetPassword}
      onGoogle={googleSignIn}
      firebaseReady={firebaseConfigured}
      language={language}
      setLanguage={setLanguage}
    />
  );
}
createRoot(document.getElementById("root")!).render(<Experience />);
