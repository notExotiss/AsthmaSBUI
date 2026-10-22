import React, { useEffect, useRef, useState } from "react";
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
  Bluetooth,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  CloudSun,
  DollarSign,
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
  Radar,
  Radio,
  RefreshCw,
  Siren,
  SlidersHorizontal,
  Sparkles,
  Stethoscope,
  Sun,
  Thermometer,
  TriangleAlert,
  Upload,
  User,
  Users,
  Wind,
  X,
} from "lucide-react";
import { BackgroundGradient } from "./components/background-gradient";
import {
  answerQuestion,
  emergencyContacts,
  getForecast,
  getOutlook,
  guidance,
  inhalerSteps,
  initialLogs,
  languages,
  medications,
  observations,
  sbResources,
  triggerProfiles,
  tr,
  type Language,
  type LogEntry,
  type DemoMode,
} from "./mock";
import {
  BreathingChart,
  NightScatter,
  SymptomMix,
  PollutionChart,
  SignalChart,
  CompletenessGauge,
  SymptomBars,
  AqiAverageChart,
  TodayVsAverageChart,
  MiniBars,
  RiskForecastChart,
} from "./charts";
import { EntryFlow } from "./auth-flow";
import { Panel, Row, GroupCard } from "./ui";
import { ThemeContext, type Theme } from "./theme";

const pages = [
  ["Summary", House, "Summary"],
  ["Take a Measurement", Wind, "Measure"],
  ["Triggers", Radar, "Triggers"],
  ["Personal Patterns", Activity, "Patterns"],
  ["Symptom & Medication Log", ClipboardList, "Log"],
  ["Medications", Pill, "Meds"],
  ["Community", Users, "Community"],
  ["Care Plan & Reports", FileText, "Care"],
  ["Settings", MoreHorizontal, "More"],
];
const tabs = [
  ["Summary", House, "Summary"],
  ["Take a Measurement", Wind, "Measure"],
  ["Symptom & Medication Log", ClipboardList, "Log"],
  ["Community", Users, "Community"],
  ["Settings", MoreHorizontal, "More"],
];
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
function useDemoPreference(key: string, initial: any) {
  const [value, setValue] = useState(() => stored(key, initial));
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
  return (
    <Select
      className={"app-select " + className}
      aria-label={label}
      value={value}
      onChange={onChange}
    >
      <Label>{label}</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator>
          <ChevronDown size={14} />
        </Select.Indicator>
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {items.map((x) => (
            <ListBox.Item id={x} key={x} textValue={x}>
              {x}
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

let patternFocus = 0;
function setPatternFocus(i: number) {
  patternFocus = i;
}

function PlanRows({ reminders, activity }: any) {
  const [done, setDone] = useState<string[]>([]);
  return (
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
  );
}

/* ================= Forecast + guidance (description §2, §3) ================= */
function ForecastCard({ mode, reading }: { mode: DemoMode; reading: number }) {
  const f = getForecast(mode, reading);
  const g = guidance[f.level];
  const tone =
    f.level === "High" ? "high" : f.level === "Medium" ? "medium" : "low";
  return (
    <Panel
      title="Asthma Risk Forecast"
      icon={Sparkles}
      tone={"forecast " + tone}
      action={<Tag tone="amber">{f.confidence}% confidence</Tag>}
    >
      <p className="risk-eyebrow">RISK LEVEL · NEXT 6–24 HOURS</p>
      <span className={"risk-value " + tone}>{f.level}</span>
      <RiskForecastChart level={f.level} />
      <div className="risk-scale">
        <span>
          <i style={{ background: "var(--risk-low)" }} /> Low
        </span>
        <span>
          <i style={{ background: "var(--risk-med)" }} /> Medium
        </span>
        <span>
          <i style={{ background: "var(--risk-high)" }} /> High
        </span>
      </div>
      <p className="forecast-headline">{g.headline}</p>
      <div className="guidance-list">
        {g.steps.map((s, i) => (
          <div key={i} className="guidance-step">
            <i />
            <span>{s}</span>
          </div>
        ))}
      </div>
      <Expand title="Why this forecast?">
        <h4>Contributing inputs</h4>
        <ul>
          {(mode === "Missing data"
            ? ["Recent inputs are unavailable."]
            : f.drivers
          ).map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p>{f.delayedNote}</p>
        <p>{getOutlook(mode, reading).limitations}</p>
      </Expand>
    </Panel>
  );
}

function HighlightCard({
  icon: Icon,
  color,
  title,
  time,
  children,
  onPress,
}: any) {
  return (
    <button type="button" className="highlight-card" onClick={onPress}>
      <div className="highlight-head">
        <span className="highlight-title" style={{ color }}>
          <Icon size={16} />
          {title}
        </span>
        <span className="highlight-time">
          {time}
          <ChevronRight size={14} />
        </span>
      </div>
      {children}
    </button>
  );
}

/* ================= Triggers page (description §1) ================= */
function TriggersPage() {
  const [feedback, setFeedback] = useState<Record<string, "yes" | "no">>({});
  return (
    <div className="page-stack">
      <Panel
        title="Your personal trigger profile"
        subtitle="Built from your logs, environment, and medication timing"
        icon={Radar}
      >
        <div className="trigger-list">
          {triggerProfiles.map((t) => {
            const fb = feedback[t.title];
            const conf = Math.min(
              95,
              Math.max(5, t.confidence + (fb === "yes" ? 4 : fb === "no" ? -4 : 0)),
            );
            return (
              <div key={t.title} className={"trigger-card " + t.tone}>
                <div className="trigger-head">
                  <strong>{t.title}</strong>
                  <Tag>{conf}% match</Tag>
                </div>
                <p>{t.detail}</p>
                <Meter value={conf} label={t.title + " confidence"} tone={t.tone} />
                <p className="trigger-evidence">{t.evidence}</p>
                <div className="trigger-feedback">
                  <span>Does this match your experience?</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={fb === "yes" ? "picked" : ""}
                    onPress={() => setFeedback({ ...feedback, [t.title]: "yes" })}
                  >
                    <Check size={13} /> Yes
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={fb === "no" ? "picked" : ""}
                    onPress={() => setFeedback({ ...feedback, [t.title]: "no" })}
                  >
                    <X size={13} /> Not quite
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <Expand title="How these profiles are built">
          <p>
            Each profile correlates your timestamped symptom logs with
            environmental conditions, physiological readings, activity and
            sleep patterns, and medication timing. Thresholds like
            &ldquo;PM2.5 &gt; 30 µg/m³&rdquo; are personalized — they come from
            your own history, not population averages.
          </p>
          <p>
            Your feedback refines the weights. The more days you log, the more
            confident and specific these profiles become.
          </p>
        </Expand>
      </Panel>
      <Panel
        title="Avoidance strategies"
        subtitle="Specific to your triggers"
        icon={Leaf}
      >
        <GroupCard>
          <Row icon={Wind} iconColor="#ff9f0a" label="High PM2.5 days" value="Stay indoors, close windows" last />
          <Row icon={CloudSun} iconColor="#66d4cf" label="High humidity + pollen" value="Limit outdoor morning activity" />
          <Row icon={Bed} iconColor="#5e5ce6" label="Nighttime waking" value="Pre-medicate before bed on high-risk days" last />
        </GroupCard>
        <p className="microcopy">
          Strategies adapt as your trigger profile evolves.
        </p>
      </Panel>
    </div>
  );
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
  { name: "Route 1 corridor", x: 298, y: 76, reports: 34, aqi: 94, note: "Supports tree-planting case for high-traffic corridors" },
  { name: "Near SB High School", x: 148, y: 150, reports: 21, aqi: 81, note: "Evidence for idle-reduction policy near schools" },
  { name: "Kingston Rd apartments", x: 88, y: 56, reports: 17, aqi: 77, note: "Housing inspection program — mold/moisture reports" },
  { name: "Heathcote / Route 522", x: 250, y: 206, reports: 9, aqi: 63, note: "Baseline zone for comparison" },
];
function zoneColor(aqi: number) {
  return aqi > 85 ? "#ff453a" : aqi > 75 ? "#ff9f0a" : "#30d158";
}
function CommunityMap({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (z: string) => void;
}) {
  const max = Math.max(...mapZones.map((z) => z.reports));
  return (
    <div className="map-wrap">
      <svg
        className="community-map"
        viewBox="0 0 400 250"
        role="img"
        aria-label="Community hotspot map of South Brunswick with four monitored zones"
      >
        <g className="grid-lines">
          {[50, 100, 150, 200, 250, 350].map((x) => (
            <line key={"v" + x} x1={x} y1={0} x2={x} y2={250} />
          ))}
          {[50, 100, 150, 200].map((y) => (
            <line key={"h" + y} x1={0} y1={y} x2={400} y2={y} />
          ))}
        </g>
        <rect x={30} y={140} width={90} height={80} rx={10} className="park" />
        <path d="M 312 -5 L 292 255" className="road major" />
        <path d="M -5 202 L 405 216" className="road" />
        <path d="M -5 110 L 405 96" className="road" />
        <text x={322} y={26} className="road-label">RT 1</text>
        <text x={14} y={196} className="road-label">RT 522</text>
        {mapZones.map((z) => {
          const r = 13 + (z.reports / max) * 26;
          const c = zoneColor(z.aqi);
          const isSel = selected === z.name;
          return (
            <g
              key={z.name}
              className={"map-zone" + (isSel ? " selected" : "")}
              onClick={() => onSelect(z.name)}
            >
              <circle cx={z.x} cy={z.y} r={r + 6} fill={c} fillOpacity={0.1} className="halo" />
              <circle cx={z.x} cy={z.y} r={r} fill={c} fillOpacity={0.22} />
              <circle cx={z.x} cy={z.y} r={r * 0.45} fill={c} fillOpacity={0.5} />
              <circle
                cx={z.x}
                cy={z.y}
                r={5.5}
                fill={c}
                stroke={isSel ? "var(--ios-label, #ffffff)" : "transparent"}
                strokeWidth={2.5}
              />
              <text x={z.x} y={z.y - r - 10} textAnchor="middle" className="map-zone-label">
                {z.reports}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
function CommunityPage({
  optIn,
  setOptIn,
}: {
  optIn: boolean;
  setOptIn: (v: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const total = mapZones.reduce((s, z) => s + z.reports, 0);
  const max = Math.max(...mapZones.map((z) => z.reports));
  const worst = mapZones.reduce((a, b) => (b.aqi > a.aqi ? b : a));
  return (
    <div className="page-stack">
      <Panel
        title="Community asthma map"
        subtitle={`${total} anonymized reports · 4 zones monitored`}
        icon={MapPin}
        action={<Tag tone={optIn ? "mint" : "neutral"}>{optIn ? "Contributing" : "Opted out"}</Tag>}
      >
        <div className="community-stats">
          <div>
            <strong>{total}</strong>
            <span>reports this month</span>
          </div>
          <div>
            <strong>4</strong>
            <span>zones monitored</span>
          </div>
          <div>
            <strong style={{ color: zoneColor(worst.aqi) }}>{worst.aqi}</strong>
            <span>highest zone AQI</span>
          </div>
        </div>
        <CommunityMap selected={selected} onSelect={(z) => setSelected(z === selected ? null : z)} />
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
                <span>
                  {z.reports} reports · AQI {z.aqi}
                </span>
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
      </Panel>
      <Panel
        title="From patterns to advocacy"
        subtitle="Township-level environmental evidence"
        icon={Users}
      >
        <GroupCard>
          <div className="ios-row static">
            <span className="ios-row-icon" style={{ color: "#30d158" }}>
              <Leaf size={17} />
            </span>
            <span className="ios-row-label">
              Tree planting
              <small>High-traffic corridors · backed by {worst.reports} reports</small>
            </span>
          </div>
          <div className="ios-row static">
            <span className="ios-row-icon" style={{ color: "#ff9f0a" }}>
              <GraduationCap size={17} />
            </span>
            <span className="ios-row-label">
              Idle-reduction zones
              <small>Near schools · supported by 21 reports</small>
            </span>
          </div>
          <div className="ios-row static last">
            <span className="ios-row-icon" style={{ color: "#5e5ce6" }}>
              <House size={17} />
            </span>
            <span className="ios-row-label">
              Housing inspections
              <small>Mold and moisture reports</small>
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
function MedicationsPage() {
  const [doses, setDoses] = useState<Record<string, number>>({});
  return (
    <div className="page-stack">
      {medications.map((m) => {
        const overdue = m.refillBy.startsWith("Overdue");
        return (
          <Panel
            key={m.name}
            title={m.name}
            icon={Pill}
            tone={m.type === "Rescue" ? "coral" : "breathing"}
            action={<Tag tone={m.type === "Rescue" ? "amber" : "mint"}>{m.type}</Tag>}
          >
            <p className="med-schedule">{m.schedule}</p>
            <div className="med-stats">
              <div>
                <strong>{doses[m.name] || 0}</strong>
                <span>doses logged today</span>
              </div>
              <div>
                <strong className={overdue ? "overdue" : ""}>{m.refillsLeft}</strong>
                <span>refills left</span>
              </div>
              <div>
                <strong className={overdue ? "overdue" : ""}>{m.refillBy}</strong>
                <span>refill by</span>
              </div>
            </div>
            {overdue && (
              <Alert className="app-alert">
                <Alert.Content>
                  <Alert.Title>Refill needed</Alert.Title>
                  <Alert.Description>
                    This prescription is past its refill date. Contact your
                    pharmacy today to stay covered.
                  </Alert.Description>
                </Alert.Content>
              </Alert>
            )}
            <div className="button-row">
              <Button
                className="primary-btn"
                onPress={() => {
                  setDoses({ ...doses, [m.name]: (doses[m.name] || 0) + 1 });
                  toast.success(`${m.name} dose logged`);
                }}
              >
                <Plus size={16} />
                Log a dose
              </Button>
            </div>
            <p className="microcopy">Technique: {m.techniqueTip}</p>
          </Panel>
        );
      })}
      <Panel
        title="Inhaler technique refresher"
        subtitle="Six steps for proper metered-dose use"
        icon={Stethoscope}
      >
        <ol className="technique-list">
          {inhalerSteps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
        <p className="microcopy">
          Video guidance can be enabled in Settings when available.
        </p>
      </Panel>
      <Panel
        title="Cost-saving tips"
        subtitle="Insurance and pharmacy savings"
        icon={DollarSign}
      >
        <ul className="advocacy-list">
          {costTipsLocal.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
import { costTips as costTipsLocal } from "./mock";

/* ================= Settings page (description §6 + theme) ================= */
function SettingsPage({
  theme,
  setTheme,
  language,
  setLanguage,
  reminders,
  setReminders,
  persist,
  setPersist,
  ageMode,
  setAgeMode,
  schoolMode,
  setSchoolMode,
  communityOptIn,
  setCommunityOptIn,
  exportData,
  nav,
}: any) {
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
        <Pick
          label="App language"
          value={language}
          onChange={setLanguage}
          items={[...languages]}
        />
        <div className="settings-divider" />
        <Pick
          label="Mode"
          value={ageMode}
          onChange={setAgeMode}
          items={["Adult", "Pediatric"]}
        />
        <div className="settings-divider" />
        <Toggle value={schoolMode} onChange={setSchoolMode}>
          School mode (FERPA-aligned)
        </Toggle>
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
          Core tracking and guidance work offline — your data stays on your
          device.
        </p>
      </Panel>
      <Panel title="Explore" icon={GridIcon}>
        <GroupCard>
          <Row
            icon={Radar}
            iconColor="#bf5af2"
            label="Triggers"
            onPress={() => nav("Triggers")}
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
        AsthmaGuard SB · Research prototype. Not for diagnosis, medication
        changes, or emergency decisions.
      </p>
    </div>
  );
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
function Measurement({ connected, setConnected, mode, onSave }: any) {
  const [progress, setProgress] = useState(0),
    [running, setRunning] = useState(false),
    [complete, setComplete] = useState(false),
    [saved, setSaved] = useState(false);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(
      () => setProgress((v) => Math.min(100, v + 5)),
      120,
    );
    return () => clearInterval(timer);
  }, [running]);
  useEffect(() => {
    if (progress === 100) {
      setRunning(false);
      setComplete(true);
    }
  }, [progress]);
  useEffect(() => {
    setRunning(false);
    setProgress(0);
    setComplete(false);
    setSaved(false);
  }, [mode]);
  useEffect(() => {
    if (!connected) {
      setRunning(false);
      setProgress(0);
      setComplete(false);
    }
  }, [connected]);
  const attempt = Math.min(3, Math.floor(progress / 34) + 1);
  const rejected = mode !== "Typical";
  return (
    <div className="workflow-grid">
      <Panel
        title="Your breathing device"
        subtitle="Guided session · About 3 seconds"
        icon={Wind}
        tone="breathing"
      >
        <div className="connection-row">
          <Tag tone={connected ? "mint" : "amber"} icon={Bluetooth}>
            {connected ? "Device connected" : "Device disconnected"}
          </Tag>
          <Button
            size="sm"
            variant="ghost"
            onPress={() => {
              setConnected(!connected);
              if (running) {
                setRunning(false);
                setProgress(0);
                toast.warning("Measurement stopped: device disconnected");
              }
            }}
          >
            {connected ? "Disconnect" : "Connect device"}
          </Button>
        </div>
        <div className="measurement-stage">
          <Wind
            size={64}
            strokeWidth={1.2}
            className={running ? "breathing-icon" : ""}
          />
          <h2>
            {running
              ? `Attempt ${attempt} of 3`
              : complete
                ? rejected
                  ? "Let's try that again."
                  : "A usable reading."
                : "Ready when you are."}
          </h2>
          <p>
            {running
              ? "Samples are arriving. Breathe normally."
              : complete
                ? rejected
                  ? "This set did not pass the quality checks."
                  : "Three attempts checked for quality and consistency."
                : "Sit comfortably and follow the prompts."}
          </p>
          <SignalChart live progress={progress} />
        </div>
        <Meter value={progress} label="Measurement progress" />
        <p className="microcopy">
          {progress}% complete ·{" "}
          {running
            ? "Receiving samples"
            : complete
              ? "Quality review complete"
              : "Awaiting a measurement"}
        </p>
        <Button
          className="primary-btn"
          isDisabled={!connected || running}
          onPress={() => {
            setProgress(0);
            setComplete(false);
            setSaved(false);
            setRunning(true);
          }}
        >
          <Wind size={17} />
          {running
            ? "Measuring…"
            : complete
              ? "Run again"
              : "Start measurement"}
        </Button>
        {!connected && (
          <Alert className="app-alert">
            <Alert.Content>
              <Alert.Description>
                Connect a device to start — the built-in microphone and motion
                sensors, or a Bluetooth peak flow meter.
              </Alert.Description>
            </Alert.Content>
          </Alert>
        )}
        <Expand title="Supported devices & sensors">
          <p>
            <strong>Zero-cost option:</strong> your phone's built-in sensors —
            the microphone detects cough and wheeze patterns (audio features
            only, never recordings), motion sensors track activity and sleep,
            and the light sensor logs light exposure.
          </p>
          <p>
            <strong>Low-cost enhancement:</strong> an optional $15–20 Bluetooth
            peak flow meter measures lung function directly, or connect an
            existing home device.
          </p>
        </Expand>
      </Panel>
      <Panel
        title="Quality comes first"
        subtitle="Signal checks, not clinical interpretation"
        icon={ShieldCheckIcon}
        tone="indigo"
      >
        {!complete ? (
          <div className="empty-state">
            <MicroscopeIcon size={35} />
            <h3>Nothing to review yet.</h3>
            <p>Run a session to see all three attempts and their quality checks.</p>
          </div>
        ) : (
          <>
            <div className="attempt-list">
              {[
                414,
                mode === "Inconsistent" ? 335 : mode === "Missing data" ? null : 412,
                416,
              ].map((v, i) => (
                <div key={i}>
                  <span>Attempt {i + 1}</span>
                  <strong>
                    {v ?? "—"} <small>a.u.</small>
                  </strong>
                  <Tag tone={i === 1 && rejected ? "amber" : "mint"}>
                    {i === 1 && rejected ? "Rejected" : "Usable"}
                  </Tag>
                </div>
              ))}
            </div>
            <div className="quality-checks">
              <p>
                <Check size={15} />
                Signal clipping: none detected
              </p>
              <p>
                {mode === "Missing data" ? (
                  <TriangleAlert size={15} />
                ) : (
                  <Check size={15} />
                )}
                Missing samples:{" "}
                {mode === "Missing data" ? "attempt 2 incomplete" : "none"}
              </p>
              <p>
                {rejected ? <TriangleAlert size={15} /> : <Check size={15} />}
                Consistency:{" "}
                {mode === "Inconsistent"
                  ? "attempt 2 outside tolerance"
                  : mode === "Missing data"
                    ? "insufficient complete attempts"
                    : "within tolerance"}
              </p>
            </div>
            <Alert className="app-alert">
              <Alert.Content>
                <Alert.Title>
                  {rejected
                    ? "Set not accepted"
                    : "Accepted · 414 arbitrary units"}
                </Alert.Title>
                <Alert.Description>
                  {rejected
                    ? "Three complete and consistent attempts are required. Switch the data preview to Typical and run again."
                    : "The set can be added to your dashboard reading."}
                </Alert.Description>
              </Alert.Content>
            </Alert>
            <Button
              className="primary-btn"
              isDisabled={rejected || saved}
              onPress={() => {
                setSaved(true);
                onSave(414);
              }}
            >
              <Check size={16} />
              Save measurement
            </Button>
          </>
        )}
        <p className="microcopy">
          Uncalibrated, arbitrary units. This is not a clinical assessment or a
          measurement of FEV1, FVC, or clinical peak flow.
        </p>
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
function MicroscopeIcon(props: any) {
  const { size = 16, ...rest } = props;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
      <path d="M6 18h8" />
      <path d="M3 22h18" />
      <path d="M14 22a7 7 0 1 0 0-14h-1" />
      <path d="M9 14h2" />
      <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z" />
      <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />
    </svg>
  );
}

/* ================= Patterns page ================= */
function Patterns({ focus }: any) {
  const [range, setRange] = useState("7 days"),
    [env, setEnv] = useState("All conditions"),
    [activity, setActivity] = useState("All activities"),
    [symptom, setSymptom] = useState("All logs"),
    [scenario, setScenario] = useState("Moderate AQI");
  const data = observations.filter(
    (o, i) =>
      (range === "7 days" || i >= 4) &&
      (env === "All conditions" ||
        (env === "AQI above 75" ? o.aqi > 75 : o.aqi <= 75)) &&
      (activity === "All activities" || o.activity === activity) &&
      (symptom === "All logs" ||
        (symptom === "Symptom reports"
          ? ["Mild", "Moderate"].includes(o.symptom)
          : symptom === "Symptom-free"
            ? o.symptom === "None"
            : o.symptom === "Not logged")),
  );
  const yes = data.filter((o) => ["Mild", "Moderate"].includes(o.symptom)).length,
    no = data.filter((o) => o.symptom === "None").length,
    unknown = data.filter((o) => o.symptom === "Not logged").length;
  return (
    <>
      <Panel
        title="Look a little closer"
        subtitle="Filters apply to the observation comparison below"
        icon={SlidersHorizontal}
      >
        <div className="filter-grid">
          <Pick label="Date range" value={range} onChange={setRange} items={["7 days", "3 days"]} />
          <Pick label="Environment" value={env} onChange={setEnv} items={["All conditions", "AQI above 75", "AQI 75 or below"]} />
          <Pick label="Activity" value={activity} onChange={setActivity} items={["All activities", "Outdoor", "Indoor"]} />
          <Pick label="Symptoms" value={symptom} onChange={setSymptom} items={["All logs", "Symptom reports", "Symptom-free", "Not logged"]} />
        </div>
      </Panel>
      <div className="comparison-grid">
        <Panel title="Explicit symptom reports" icon={Heart} tone="rose">
          <div className="stat-number">
            {yes}
            <span>days</span>
          </div>
          <Meter value={data.length ? (yes / data.length) * 100 : 0} label="Symptom days" />
        </Panel>
        <Panel title="Explicitly symptom-free" icon={ShieldCheckIcon} tone="breathing">
          <div className="stat-number">
            {no}
            <span>days</span>
          </div>
          <Meter value={data.length ? (no / data.length) * 100 : 0} label="Symptom-free days" />
        </Panel>
        <Panel title="Unknown, not symptom-free" icon={Info} tone="indigo">
          <div className="stat-number">
            {unknown}
            <span>missing logs</span>
          </div>
          <p className="muted">
            {data.filter((o) => o.reading === null).length} missing measurements
          </p>
        </Panel>
      </div>
      <Panel
        title="The observations behind the pattern"
        subtitle={`${data.length} days match these filters. Selected topic: ${["pollution", "outdoor activity", "nighttime symptoms"][focus]}.`}
        icon={Activity}
      >
        {data.length === 0 ? (
          <div className="empty-state">
            <Info size={30} />
            <p>No observations match. Broaden the filters.</p>
          </div>
        ) : (
          <>
            <div className="patterns-chart-view">
              <SymptomBars data={data} />
            </div>
            <div className="observation-table">
              {data.map((o) => (
                <div key={o.day}>
                  <strong>{o.day}</strong>
                  <span>AQI {o.aqi}</span>
                  <span>{o.activity}</span>
                  <Tag tone={o.symptom === "Not logged" ? "neutral" : o.symptom === "None" ? "mint" : "amber"}>
                    {o.symptom === "None" ? "Symptom-free" : o.symptom}
                  </Tag>
                </div>
              ))}
            </div>
          </>
        )}
        <Expand title="Supporting and contradictory observations">
          <p>
            Supporting: October 13, 14, 16, and 18 had AQI above 75, outdoor
            activity, and symptom reports.
          </p>
          <p>
            Counterpoint: elevated pollution and outdoor activity occur together
            in this small sample, so their individual roles cannot be separated.
            Six logged days and only one nighttime report are insufficient to
            establish a reliable relationship.
          </p>
          <p>
            October 17 is missing a symptom entry and measurement. Missing data
            is never treated as symptom-free.
          </p>
        </Expand>
      </Panel>
      <Panel
        title="What if the conditions looked different?"
        subtitle="An exploratory comparison, not a recommendation or prediction"
        icon={CloudSun}
      >
        <Pick label="Explore available conditions" value={scenario} onChange={setScenario} items={["Moderate AQI", "Lower AQI"]} />
        <p className="scenario-result">
          {scenario === "Moderate AQI"
            ? "4 of 4 sample days with AQI above 75 have symptom reports."
            : "2 sample days with AQI 75 or below were explicitly logged symptom-free; 1 has no symptom entry."}
        </p>
        <p className="microcopy">
          This comparison cannot predict whether a particular action would
          prevent symptoms. Many personal factors are missing.
        </p>
      </Panel>
    </>
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
        title="A quick check-in"
        subtitle="Entries stay on your device; they are not stored on a server."
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
        title="Your recent check-ins"
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
  logs,
  reading,
  reminders,
  setReminders,
  persist,
  setPersist,
  exportData,
}: any) {
  const [planUrl, setPlanUrl] = useState(""),
    [report, setReport] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!plan) return;
    const url = URL.createObjectURL(plan);
    setPlanUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [plan]);
  return (
    <>
      <Panel
        title="Your clinician-provided plan"
        subtitle="A home for the plan you already have."
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
              setPlan(f);
              toast.success("Plan available for this session only");
            }
          }}
        />
        {plan ? (
          <div className="saved-plan">
            <FileText size={32} />
            <strong>{plan.name}</strong>
            <p>Local file · Session only · No upload to a server</p>
            <Button
              className="primary-btn"
              onPress={() => window.open(planUrl, "_blank", "noopener,noreferrer")}
            >
              Open saved plan
              <ArrowUpRight size={15} />
            </Button>
          </div>
        ) : (
          <div className="empty-state">
            <BookOpen size={35} />
            <h3>Your plan belongs here.</h3>
            <p>
              Add a clinician-provided PDF or image. The app will not create
              medication instructions.
            </p>
          </div>
        )}
        <Button variant="secondary" className="secondary-btn" onPress={() => file.current?.click()}>
          <Upload size={16} />
          {plan ? "Replace local plan" : "Choose a local care plan"}
        </Button>
      </Panel>
      <Panel title="South Brunswick health directory" subtitle="Updated local resources for asthma care" icon={Hospital}>
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
      <Panel title="One-tap emergency help" subtitle="Crisis lines and emergency services" icon={Siren} tone="rose">
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
      <Panel title="Reminders, on your terms" icon={Bell} tone="indigo">
        <Toggle value={reminders} onChange={setReminders}>
          Enable reminders
        </Toggle>
        <p className="muted">Check-in: 6:00 PM · Measurement: 7:00 PM</p>
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
        title="Your week, in context"
        subtitle="A report you can review, print, or save as PDF"
        icon={FileText}
        className="report-panel"
      >
        <div className="report-summary">
          <div>
            <strong>{logs.length}</strong>
            <span>log entries</span>
          </div>
          <div>
            <strong>{reading}</strong>
            <span>latest a.u.</span>
          </div>
          <div>
            <strong>6 / 7</strong>
            <span>days logged</span>
          </div>
        </div>
        <Button variant="ghost" className="text-btn" onPress={() => setReport(!report)}>
          {report ? "Hide" : "Preview"} report
          <ChevronDown size={15} />
        </Button>
        {report && (
          <div className="report-content">
            <h3>AsthmaGuard SB · Report</h3>
            <p>
              Readings: 398–424 arbitrary units across the week. Current usable
              reading: {reading} a.u. One missing measurement.
            </p>
            <p>
              Symptoms:{" "}
              {logs.filter((l: LogEntry) => l.severity !== "None").length}{" "}
              entries with symptoms;{" "}
              {logs.filter((l: LogEntry) => l.severity === "None").length}{" "}
              explicitly symptom-free entries. One day has no symptom log.
            </p>
            <p>
              Medication use: self-reported log entries only.{" "}
              {logs.filter((l: LogEntry) => l.medication !== "Not logged").length}{" "}
              entries contain a medication-use status. This report does not
              verify adherence or recommend changes.
            </p>
            <p>
              Tentative patterns: higher pollution and outdoor activity co-occur
              with symptom reports on 4 sample days. Only 1 nighttime report.
              Small, confounded samples cannot establish causes.
            </p>
            <p>
              Data completeness: 6 of 7 days have explicit symptom logs and
              readings. No pollen exposure measurement.
            </p>
            <p>
              Research prototype. Not for diagnosis, medication changes, or
              emergency decisions.
            </p>
          </div>
        )}
        <div className="button-row">
          <Button
            className="primary-btn"
            onPress={() => {
              setReport(true);
              setTimeout(() => window.print(), 100);
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
    </>
  );
}

/* ================= App ================= */
function App({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  const [page, setPage] = useState("Summary");
  const [mode, setMode] = useDemoPreference("mode", "Typical");
  const [connected, setConnected] = useDemoPreference("connected", true);
  const [reading, setReading] = useDemoPreference("reading", 412);
  const [language, setLanguage] = useDemoPreference<Language>("language", "English");
  const [reminders, setReminders] = useDemoPreference("reminders", true);
  const [persist, setPersist] = useDemoPreference("preferences", true);
  const [ageMode, setAgeMode] = useDemoPreference("ageMode", "Adult");
  const [schoolMode, setSchoolMode] = useDemoPreference("schoolMode", false);
  const [communityOptIn, setCommunityOptIn] = useDemoPreference("communityOptIn", true);
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [careFile, setCareFile] = useState<File | null>(null);
  const [outdoorActivity, setOutdoorActivity] = useState("Soccer practice · 4:00 PM");
  const [dialog, setDialog] = useState("");
  const [answer, setAnswer] = useState(-1);
  const [refresh, setRefresh] = useState(false);
  const [synced, setSynced] = useState("Today, 8:42 AM");
  const forecast = getForecast(mode, reading);
  const missing = mode === "Missing data";
  const inconsistent = mode === "Inconsistent";
  const date = new Date().toLocaleDateString("en-US", {
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
            { label: "AsthmaGuard SB data export", reading, mode, logs, observations },
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
  const greeting =
    ageMode === "Pediatric"
      ? "Hi Jamie! Ready to check your breathing today?"
      : "Good morning, Jamie. Here's your breathing space.";
  return (
    <ThemeContext.Provider value={theme}>
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
                    <Avatar.Fallback>JL</Avatar.Fallback>
                  </Avatar>
                  <span className="profile-name">Jamie</span>
                  <ChevronDown size={12} />
                </Button>
                <Dropdown.Popover>
                  <Dropdown.Menu
                    aria-label="Profile options"
                    onAction={(key) =>
                      key === "care"
                        ? nav("Care Plan & Reports")
                        : key === "settings"
                          ? nav("Settings")
                          : key === "signout"
                            ? (location.hash = "signin")
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
            {schoolMode && <Tag icon={GraduationCap}>School mode</Tag>}
            <span>
              <MapPin size={10} /> South Brunswick
            </span>
          </div>
          <section className="page-heading">
            <div>
              <h1>{page === "Summary" ? t("Summary") : t(page)}</h1>
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
          <div className="demo-controls">
            <div>
              <SlidersHorizontal size={13} />
              <span>DATA PREVIEW</span>
            </div>
            <Pick
              label="Data preview"
              value={mode}
              onChange={setMode}
              items={["Typical", "Missing data", "Inconsistent"]}
            />
          </div>
          {refresh ? (
            <div className="loading-grid" aria-label="Loading data">
              <Skeleton className="loading-card" />
              <Skeleton className="loading-card" />
              <Skeleton className="loading-card" />
            </div>
          ) : (
            <>
              {page === "Summary" && (
                <>
                  <div className="dashboard-grid">
                    <ForecastCard mode={mode} reading={reading} />
                    <Panel title="Today" icon={ClipboardList} tone="plan">
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
                      <h2>Highlights</h2>
                    </div>
                  </div>
                  <div className="highlights-grid">
                    <HighlightCard
                      icon={Wind}
                      color="#0a84ff"
                      title="Breathing"
                      time={synced}
                      onPress={() => nav("Take a Measurement")}
                    >
                      <div className="highlight-big">
                        {missing ? 412 : reading}
                        <span>a.u.</span>
                      </div>
                      <div className="highlight-sub">
                        {missing
                          ? "Partial history · live reading unavailable"
                          : `${((Math.abs(420 - reading) / 420) * 100).toFixed(1)}% ${reading <= 420 ? "below" : "above"} your 420 baseline`}
                      </div>
                      <BreathingChart missing={missing} reading={reading} />
                    </HighlightCard>
                    <HighlightCard
                      icon={CloudSun}
                      color="#ff9f0a"
                      title="Air Quality"
                      time="8:30 AM"
                      onPress={() => nav("Triggers")}
                    >
                      <div className="highlight-big">
                        {missing ? "—" : 86}
                        <span>AQI</span>
                      </div>
                      <div className="highlight-sub">Moderate · PM2.5 is the main driver today</div>
                      <AqiAverageChart />
                    </HighlightCard>
                    <HighlightCard
                      icon={Activity}
                      color="#30d158"
                      title="Today vs Average"
                      time="Live"
                      onPress={() => nav("Personal Patterns")}
                    >
                      <div className="tva-legend">
                        <span className="today">
                          <i style={{ background: "#ff9f0a" }} /> Today
                          <b>{missing ? "—" : 413} a.u.</b>
                        </span>
                        <span>
                          <i style={{ background: "#8d8d93" }} /> Average
                          <b>415 a.u.</b>
                        </span>
                      </div>
                      <TodayVsAverageChart />
                    </HighlightCard>
                    <HighlightCard
                      icon={Pill}
                      color="#bf5af2"
                      title="Medications"
                      time="7:00 PM"
                      onPress={() => nav("Medications")}
                    >
                      {medications.map((m) => (
                        <div key={m.name} className="med-inline">
                          <strong>{m.name.split(" (")[0]}</strong>
                          <span className={m.refillBy.startsWith("Overdue") ? "overdue" : ""}>
                            {m.refillBy.startsWith("Overdue") ? "Refill overdue" : `Refill by ${m.refillBy}`}
                          </span>
                        </div>
                      ))}
                    </HighlightCard>
                    <HighlightCard
                      icon={Heart}
                      color="#ff375f"
                      title="Check-in streak"
                      time="This week"
                      onPress={() => nav("Symptom & Medication Log")}
                    >
                      <div className="streak-row">
                        <div className="highlight-big">
                          6<span>/7 days</span>
                        </div>
                        <MiniBars />
                      </div>
                      <p className="highlight-note">October 17 has no entry — missing days stay unknown</p>
                    </HighlightCard>
                  </div>
                  <div className="flavor-grid">
                    <Panel
                      title="Breathing signal"
                      subtitle="Sample window · 8:30–9:15 AM"
                      icon={Wind}
                      tone="signal-coral"
                      action={<Tag>24 samples</Tag>}
                    >
                      <div className="signal-summary">
                        <strong>
                          24<span>samples</span>
                        </strong>
                        <span>
                          Arbitrary units
                          <br />
                          8:30–9:15 AM
                        </span>
                      </div>
                      <SignalChart />
                      <div className="signal-bottom">
                        <span>Incoming signal, a closer look.</span>
                        <Button
                          variant="ghost"
                          className="text-btn"
                          onPress={() => nav("Take a Measurement")}
                        >
                          Try it
                          <ArrowUpRight size={14} />
                        </Button>
                      </div>
                    </Panel>
                    <Panel
                      title="Weekly completeness"
                      subtitle="Your week's data completeness"
                      icon={Heart}
                      tone="gauge-mint"
                      action={<Tag>Oct 12–18</Tag>}
                    >
                      <CompletenessGauge />
                      <div className="gauge-legend">
                        <span>
                          <Check size={12} />6 logged days
                        </span>
                        <span>1 day missing</span>
                      </div>
                      <p className="microcopy">
                        Logged days, not a wellness score or health assessment.
                      </p>
                    </Panel>
                  </div>
                  <div className="section-title">
                    <div>
                      <h2>Trends</h2>
                      <p>Patterns to explore, with room for uncertainty.</p>
                    </div>
                    <Button variant="ghost" className="text-btn" onPress={() => nav("Personal Patterns")}>
                      See all
                      <ArrowRight size={15} />
                    </Button>
                  </div>
                  <div className="patterns-grid">
                    {[
                      ["Pollution & symptoms", Wind, "4 / 4", "high-AQI days with reported symptoms", "rose"],
                      ["Outdoor days & symptoms", Footprints, "4 / 4", "outdoor days with symptom reports", "coral"],
                      ["Nighttime & next day", Activity, "1", "nighttime report available", "indigo"],
                    ].map(([title, Icon, n, note, tone], i) => (
                      <Panel key={title as string} title={title} icon={Icon} tone={tone}>
                        <Tag>Possible association</Tag>
                        <div className="pattern-number">
                          {n as string}
                          <span>{note as string}</span>
                        </div>
                        {i === 0 ? (
                          <PollutionChart />
                        ) : i === 1 ? (
                          <SymptomMix />
                        ) : (
                          <div className="night-curve">
                            <NightScatter />
                            <span>Only 1 nighttime report · Too little to infer a pattern</span>
                          </div>
                        )}
                        <div className="pattern-bottom">
                          <span>
                            Limited evidence · {i === 2 ? "1 night" : "6 logged days"}
                          </span>
                          <Button
                            isIconOnly
                            variant="ghost"
                            aria-label={"Explore " + title}
                            onPress={() => {
                              setPatternFocus(i);
                              nav("Personal Patterns");
                            }}
                          >
                            <ArrowUpRight size={18} />
                          </Button>
                        </div>
                      </Panel>
                    ))}
                  </div>
                  <Panel
                    title="Ask about your data"
                    subtitle="Grounded responses from your own logs and environment"
                    icon={MessageCircle}
                    className="assistant-panel"
                  >
                    <div className="question-grid">
                      {questions.map((q, i) => (
                        <Button
                          variant="ghost"
                          className={answer === i ? "question selected" : "question"}
                          key={q}
                          onPress={() => setAnswer(i)}
                        >
                          {q}
                          <ArrowUpRight size={14} />
                        </Button>
                      ))}
                    </div>
                    {answer >= 0 && (
                      <Alert className="assistant-answer">
                        <Alert.Content>
                          <Alert.Title>Response</Alert.Title>
                          <Alert.Description>
                            {answerQuestion(answer, mode, reading, logs.length)}
                          </Alert.Description>
                        </Alert.Content>
                      </Alert>
                    )}
                  </Panel>
                  <p className="microcopy center">
                    {greeting}
                  </p>
                </>
              )}
              {page === "Take a Measurement" && (
                <Measurement
                  connected={connected}
                  setConnected={setConnected}
                  mode={mode}
                  onSave={(value: number) => {
                    setReading(value);
                    setMode("Typical");
                    setSynced("Just now");
                    toast.success("New measurement included in your risk forecast.");
                    nav("Summary");
                  }}
                />
              )}
              {page === "Triggers" && <TriggersPage />}
              {page === "Personal Patterns" && <Patterns focus={patternFocus} />}
              {page === "Symptom & Medication Log" && (
                <LogPage
                  logs={logs}
                  onSave={(entry: LogEntry) => {
                    setLogs([entry, ...logs]);
                    toast.success("Check-in added to your log");
                  }}
                />
              )}
              {page === "Medications" && <MedicationsPage />}
              {page === "Community" && (
                <CommunityPage optIn={communityOptIn} setOptIn={setCommunityOptIn} />
              )}
              {page === "Care Plan & Reports" && (
                <Care
                  plan={careFile}
                  setPlan={setCareFile}
                  logs={logs}
                  reading={reading}
                  reminders={reminders}
                  setReminders={setReminders}
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
                  language={language}
                  setLanguage={setLanguage}
                  reminders={reminders}
                  setReminders={setReminders}
                  persist={persist}
                  setPersist={setPersist}
                  ageMode={ageMode}
                  setAgeMode={setAgeMode}
                  schoolMode={schoolMode}
                  setSchoolMode={setSchoolMode}
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
              Research prototype.
            </span>
            Not for diagnosis, medication changes, or emergency decisions.
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
                  <h3>Jamie Lee</h3>
                  <p>Student & family profile · South Brunswick, NJ</p>
                  <p>
                    This is a sample profile. No account or health device is
                    connected. Check-in notes are kept in memory for this session
                    only.
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
    </ThemeContext.Provider>
  );
}

/* ================= Hash router + theme root ================= */
function Experience() {
  const readRoute = () => {
    const r = location.hash.slice(1);
    return ["signin", "signup", "reset", "dashboard"].includes(r) ? r : "signin";
  };
  const [route, setRoute] = useState(readRoute);
  const [theme, setTheme] = useDemoPreference<Theme>("theme", "dark");
  useEffect(() => {
    const update = () => setRoute(readRoute());
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
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
  return route === "dashboard" ? (
    <App theme={theme} setTheme={setTheme} />
  ) : (
    <EntryFlow
      route={route}
      onNavigate={navigate}
      onEnter={() => navigate("dashboard")}
      theme={theme}
      setTheme={setTheme}
    />
  );
}
createRoot(document.getElementById("root")!).render(<Experience />);
