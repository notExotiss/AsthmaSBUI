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
  Tabs,
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
  FlaskConical,
  Feather,
  Footprints,
  Globe,
  Heart,
  House,
  Info,
  Leaf,
  LogOut,
  MapPin,
  MessageCircle,
  Microscope,
  MoreHorizontal,
  Plus,
  Printer,
  Radio,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Thermometer,
  TriangleAlert,
  Upload,
  User,
  Wind,
  X,
} from "lucide-react";
import { BackgroundGradient } from "./components/background-gradient";
import { answerQuestion, getOutlook, initialLogs, observations } from "./mock";
import {
  BreathingChart,
  NightScatter,
  SymptomMix,
  PollutionChart,
  SignalChart,
  CompletenessGauge,
  SymptomBars,
} from "./charts";
import { EntryFlow } from "./auth-flow";
import type { DemoMode, LogEntry } from "./mock";
const pages = [
  ["Dashboard", House, "Home"],
  ["Take a Measurement", Wind, "Measure"],
  ["Personal Patterns", Activity, "Patterns"],
  ["Symptom & Medication Log", ClipboardList, "Log"],
  ["Care Plan & Reports", FileText, "Care"],
];
const questions = [
  "Why did my outlook change?",
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
function Panel({
  title,
  subtitle,
  icon: Icon,
  tone = "",
  action,
  children,
  className = "",
}: any) {
  return (
    <Card className={"panel " + tone + " " + className}>
      <Card.Header>
        <div className="panel-heading">
          <div className="panel-title">
            {Icon && <Icon size={18} />}
            <Card.Title>{title}</Card.Title>
          </div>
          {action}
        </div>
        {subtitle && <Card.Description>{subtitle}</Card.Description>}
      </Card.Header>
      <Card.Content>{children}</Card.Content>
    </Card>
  );
}
function Meter({ value, label, tone = "" }: any) {
  return (
    <ProgressBar
      value={value}
      aria-label={label}
      className={"app-meter " + tone}
    >
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
function App() {
  const [page, setPage] = useState("Dashboard");
  const [mode, setMode] = useDemoPreference("mode", "Typical");
  const [connected, setConnected] = useDemoPreference("connected", true);
  const [reading, setReading] = useDemoPreference("reading", 412);
  const [language, setLanguage] = useDemoPreference("language", "English");
  const [reminders, setReminders] = useDemoPreference("reminders", true);
  const [persist, setPersist] = useDemoPreference("preferences", true);
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [careFile, setCareFile] = useState<File | null>(null);
  const [outdoorActivity, setOutdoorActivity] = useState(
    "Soccer practice · 4:00 PM",
  );
  const [dialog, setDialog] = useState("");
  const [answer, setAnswer] = useState(-1);
  const [refresh, setRefresh] = useState(false);
  const [synced, setSynced] = useState("Today, 8:42 AM");
  const outlook = getOutlook(mode, reading);
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
            {
              label: "AsthmaGuard SB simulated data",
              reading,
              mode,
              logs,
              observations,
            },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "asthmaguard-demo-report.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Demo data exported");
  }
  function reload() {
    setRefresh(true);
    setTimeout(() => {
      setRefresh(false);
      setSynced("Just now");
      toast.success("Simulated data refreshed");
    }, 700);
  }
  const nav = (p: string) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  return (
    <div
      className={
        "asthma-app dark " + (page === "Dashboard" ? "is-dashboard" : "")
      }
    >
      <Toast.Provider placement="top" />
      <aside className="sidebar">
        <div className="wordmark">
          <Feather size={27} />
          <div>
            AsthmaGuard<span>SB</span>
          </div>
        </div>
        <p className="sidebar-label">A LITTLE MORE PEACE OF MIND.</p>
        <div className="sidebar-nav">
          {pages.map(([name, Icon]) => (
            <Button
              key={name as string}
              variant="ghost"
              className={"side-link " + (page === name ? "selected" : "")}
              onPress={() => nav(name as string)}
            >
              <Icon size={19} />
              {name as string}
              {page === name && <ChevronRight size={15} />}
            </Button>
          ))}
        </div>
        <Card className="sidebar-device">
          <Card.Content>
            <div>
              <Radio size={17} />
              <strong>Breathing prototype</strong>
            </div>
            <span>
              {connected ? "Connected to demo device" : "Device disconnected"}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onPress={() => setConnected(!connected)}
            >
              {connected ? "Disconnect" : "Connect demo device"}
              <ArrowRight size={13} />
            </Button>
          </Card.Content>
        </Card>
        <div className="sidebar-bottom">
          <Tag icon={FlaskConical}>Demo mode · Simulated data</Tag>
          <p>Designed for students & families.</p>
        </div>
      </aside>
      <main className="main-content">
        <header className="app-header">
          <div className="mobile-wordmark">
            <Feather size={23} />
            <span>
              AsthmaGuard <b>SB</b>
            </span>
          </div>
          <span className="location">
            <MapPin size={13} />
            South Brunswick, NJ
          </span>
          <div className="header-tools">
            <Pick
              label="Language"
              value={language}
              onChange={setLanguage}
              items={["English", "Spanish", "Hindi", "Gujarati"]}
              className="language-select"
            />
            <Popover>
              <Button
                variant="ghost"
                className="updates-trigger"
                aria-label="Notifications"
              >
                Updates
              </Button>
              <Popover.Content className="app-popover">
                <Popover.Dialog>
                  <Popover.Heading>Today’s reminders</Popover.Heading>
                  <p>
                    Symptom check-in at 6:00 PM. Prototype measurement at 7:00
                    PM.
                  </p>
                </Popover.Dialog>
              </Popover.Content>
            </Popover>
            <Dropdown>
              <Button
                variant="ghost"
                className="profile-trigger"
                aria-label="Profile menu"
              >
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
                      : key === "welcome"
                        ? (location.hash = "welcome")
                        : key === "signout"
                          ? (location.hash = "signin")
                          : setDialog("Profile")
                  }
                >
                  <Dropdown.Item id="welcome" textValue="Welcome tour">
                    <Feather size={16} />
                    Welcome tour
                  </Dropdown.Item>
                  <Dropdown.Item id="signout" textValue="Sign out of demo">
                    <LogOut size={16} />
                    Sign out of demo
                  </Dropdown.Item>
                  <Dropdown.Item id="profile" textValue="Demo profile">
                    <User size={16} />
                    Demo profile
                  </Dropdown.Item>
                  <Dropdown.Item id="care" textValue="Privacy and care plan">
                    <ShieldCheck size={16} />
                    Privacy & care plan
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          </div>
        </header>
        <div className="mobile-demo">
          <Tag icon={FlaskConical}>Demo mode — simulated data</Tag>
          <span>
            <MapPin size={10} /> South Brunswick
          </span>
        </div>
        <section className="page-heading">
          <div>
            <p className="date-label">{date}</p>
            <h1>
              {page === "Dashboard" ? (
                <>
                  Your breathing, <span>at a glance.</span>
                </>
              ) : page === "Take a Measurement" ? (
                <>
                  One breath.<span> A little more insight.</span>
                </>
              ) : page === "Personal Patterns" ? (
                <>
                  Your days,<span> connected.</span>
                </>
              ) : page === "Symptom & Medication Log" ? (
                <>
                  How are you<span> feeling?</span>
                </>
              ) : (
                <>
                  Your care,<span> in one place.</span>
                </>
              )}
            </h1>
            <p>
              {page === "Dashboard"
                ? "Good morning, Jamie. Here’s your breathing space."
                : page === "Take a Measurement"
                  ? "A guided, simulated prototype measurement."
                  : page === "Personal Patterns"
                    ? "Explore tentative associations in your demo data."
                    : page === "Symptom & Medication Log"
                      ? "Make a little room to check in with yourself."
                      : "Your saved plan, reminders, and reports."}
            </p>
          </div>
          <div className="heading-actions">
            <Tag icon={Radio} tone={connected ? "mint" : "amber"}>
              {connected ? "Device connected" : "Disconnected"}
            </Tag>
            <Button
              isIconOnly
              variant="ghost"
              className="icon-btn"
              aria-label="Refresh demo data"
              onPress={reload}
            >
              <RefreshCw size={16} className={refresh ? "spinning" : ""} />
            </Button>
          </div>
        </section>
        <div className="demo-controls">
          <div>
            <FlaskConical size={13} />
            <span>SIMULATED PREVIEW</span>
          </div>
          <Pick
            label="Demo state"
            value={mode}
            onChange={setMode}
            items={["Typical", "Missing data", "Inconsistent"]}
          />
        </div>
        {language !== "English" && (
          <Alert className="app-alert">
            <Alert.Content>
              <Alert.Description>
                {language} preference saved. This prototype’s content is
                available in English.
              </Alert.Description>
            </Alert.Content>
          </Alert>
        )}
        {refresh ? (
          <div className="loading-grid" aria-label="Loading demo data">
            <Skeleton className="loading-card" />
            <Skeleton className="loading-card" />
            <Skeleton className="loading-card" />
          </div>
        ) : (
          <>
            {page === "Dashboard" && (
              <>
                <div className="dashboard-grid">
                  <div className="flavor-grid">
                    <Panel
                      title="A little rhythm in every breath."
                      subtitle="Prototype signal · Illustrative sample window"
                      icon={Wind}
                      tone="signal-coral"
                      action={<Tag>Simulated</Tag>}
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
                          Try the demo
                          <ArrowUpRight size={14} />
                        </Button>
                      </div>
                    </Panel>
                    <Panel
                      title="Showing up for yourself."
                      subtitle="Your week’s data completeness"
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

                  <Panel
                    title="Breathing measurement"
                    icon={Wind}
                    tone="breathing"
                    action={
                      <Tag
                        tone={
                          missing ? "neutral" : inconsistent ? "amber" : "mint"
                        }
                      >
                        {missing
                          ? "Insufficient data"
                          : inconsistent
                            ? "Inconsistent"
                            : "Usable"}
                      </Tag>
                    }
                  >
                    <div className="reading-value">
                      {missing ? 412 : reading}
                      <span>arbitrary units</span>
                    </div>
                    <div className="baseline-note">
                      <ArrowDownRight size={14} />
                      {missing
                        ? "Simulated history · live reading unavailable"
                        : `${((Math.abs(420 - reading) / 420) * 100).toFixed(1)}% ${reading <= 420 ? "below" : "above"} your recorded baseline`}
                    </div>
                    <BreathingChart missing={missing} reading={reading} />
                    <div className="chart-footnote">
                      <span>OCT 12–18 · SIMULATED</span>
                      <span>Dashed line: your baseline</span>
                    </div>
                    <div className="reading-meta">
                      <span>
                        Baseline <b>420 a.u.</b>
                      </span>
                      <span>
                        Last sync <b>{synced}</b>
                      </span>
                    </div>
                    <Button
                      className="primary-btn"
                      onPress={() => nav("Take a Measurement")}
                    >
                      <Wind size={16} />
                      Take a measurement
                      <ArrowRight size={15} />
                    </Button>
                    <p className="microcopy">
                      Simulated, uncalibrated prototype. Not clinical peak flow.
                    </p>
                  </Panel>
                  <BackgroundGradient
                    animate={false}
                    containerClassName="outlook-gradient"
                    className="outlook-content"
                  >
                    <Panel
                      title="Experimental symptom outlook"
                      icon={Sparkles}
                      tone="outlook"
                      action={<Tag tone="amber">Limited evidence</Tag>}
                    >
                      <div className="outlook-eyebrow">
                        <span /> NEXT CHECK-IN · TODAY, 6–8 PM
                      </div>
                      <h2>{outlook.headline}</h2>
                      <div className="outlook-change">
                        <ArrowUpRight size={16} />
                        {outlook.change}
                      </div>
                      <p className="outlook-summary">
                        {missing
                          ? "Recent inputs are unavailable. Refreshing the demo will not replace missing observations."
                          : inconsistent
                            ? "The latest attempt did not pass consistency checks. The last usable reading is retained."
                            : "A few signals have shifted. Your recent logs and regional air conditions are contributing inputs."}
                      </p>
                      {!missing && (
                        <div className="outlook-chart">
                          <div>
                            <span>Regional air, this week</span>
                            <b>
                              86 <small>AQI</small>
                            </b>
                          </div>
                          <PollutionChart compact />
                        </div>
                      )}
                      <Expand title="Why this estimate?">
                        <h4>Contributing inputs</h4>
                        <ul>
                          {(missing
                            ? ["Recent inputs are unavailable."]
                            : outlook.inputs
                          ).map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>
                        <h4>Missing inputs</h4>
                        <ul>
                          {outlook.missing.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>
                        <p>{outlook.limitations}</p>
                      </Expand>
                      <div className="outlook-foot">
                        <span>
                          <FlaskConical size={12} /> Simulated outlook
                        </span>
                        <span>Updated 8:45 AM</span>
                      </div>
                    </Panel>
                  </BackgroundGradient>
                  <Panel
                    title="Outside your window"
                    subtitle="Regional conditions · All values simulated"
                    icon={CloudSun}
                    tone="environment"
                    action={
                      <Tag tone="amber">
                        {missing ? "Stale data" : "Moderate AQI"}
                      </Tag>
                    }
                  >
                    <div className="environment-main">
                      <strong>
                        {missing ? "—" : "86"}
                        <span>AQI</span>
                      </strong>
                      <div>
                        <span>
                          {missing
                            ? "Update unavailable"
                            : "A little extra awareness."}
                        </span>
                        <p>
                          {missing
                            ? "Latest conditions could not be retrieved."
                            : "Regional air quality is moderate in this demo."}
                        </p>
                      </div>
                    </div>
                    <div className="environment-grid">
                      {[
                        [Wind, "PM2.5", missing ? "Unavailable" : "22 µg/m³"],
                        [CloudSun, "Ozone", missing ? "Unavailable" : "41 ppb"],
                        [
                          Thermometer,
                          "Temperature",
                          missing ? "Unavailable" : "64°F",
                        ],
                        [Wind, "Humidity", missing ? "Unavailable" : "58%"],
                        [Leaf, "Pollen", "Unavailable"],
                      ].map(([Icon, label, value]) => (
                        <Card key={label as string} className="env-tile">
                          <Card.Content>
                            <Icon size={16} />
                            <span>{label as string}</span>
                            <strong>{value as string}</strong>
                          </Card.Content>
                        </Card>
                      ))}
                    </div>
                    <div className="source-note">
                      Source: demo placeholder · Middlesex County region
                      <br />
                      {missing
                        ? "Last available: yesterday, 8:30 AM"
                        : "Updated today, 8:30 AM"}{" "}
                      · Personal exposure may vary.
                    </div>
                  </Panel>
                  <Panel
                    title="Today, at your pace"
                    subtitle="Small check-ins. A little more continuity."
                    icon={ClipboardList}
                    tone="plan"
                  >
                    <PlanRows
                      reminders={reminders}
                      activity={outdoorActivity}
                    />
                    <Expand title="Edit outdoor activity">
                      <TextField
                        className="app-field"
                        value={outdoorActivity}
                        onChange={setOutdoorActivity}
                      >
                        <Label>Your planned activity & time</Label>
                        <Input maxLength={100} />
                      </TextField>
                    </Expand>
                    <Button
                      variant="ghost"
                      className="text-btn"
                      onPress={() => nav("Care Plan & Reports")}
                    >
                      View my saved care plan
                      <ChevronRight size={15} />
                    </Button>
                  </Panel>
                </div>
                <div className="section-title">
                  <div>
                    <h2>Little signals. Possible connections.</h2>
                    <p>Patterns to explore, with room for uncertainty.</p>
                  </div>
                  <Button
                    variant="ghost"
                    className="text-btn"
                    onPress={() => nav("Personal Patterns")}
                  >
                    All patterns
                    <ArrowRight size={15} />
                  </Button>
                </div>
                <div className="patterns-grid">
                  {[
                    [
                      "Pollution & symptoms",
                      Wind,
                      "4 / 4",
                      "higher-AQI days with reported symptoms",
                      "rose",
                    ],
                    [
                      "Outdoor days & symptoms",
                      Footprints,
                      "4 / 4",
                      "outdoor days with symptom reports",
                      "coral",
                    ],
                    [
                      "Nighttime & next day",
                      Activity,
                      "1",
                      "nighttime report available",
                      "indigo",
                    ],
                  ].map(([title, Icon, n, note, tone], i) => (
                    <Panel
                      key={title as string}
                      title={title}
                      icon={Icon}
                      tone={tone}
                    >
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
                          <span>
                            Only 1 nighttime report · Too little to infer a
                            pattern
                          </span>
                        </div>
                      )}
                      <div className="pattern-bottom">
                        <span>
                          Limited evidence ·{" "}
                          {i === 2 ? "1 night" : "6 logged days"}
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
                  title="A little context, when you need it."
                  subtitle="Ask AsthmaGuard · Simulated responses grounded in this demo"
                  icon={MessageCircle}
                  className="assistant-panel"
                >
                  <div className="question-grid">
                    {questions.map((q, i) => (
                      <Button
                        variant="ghost"
                        className={
                          answer === i ? "question selected" : "question"
                        }
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
                        <Alert.Title>Simulated response</Alert.Title>
                        <Alert.Description>
                          {answerQuestion(answer, mode, reading, logs.length)}
                        </Alert.Description>
                      </Alert.Content>
                    </Alert>
                  )}
                </Panel>
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
                  toast.success(
                    "New measurement included in your experimental outlook.",
                  );
                  nav("Dashboard");
                }}
              />
            )}
            {page === "Personal Patterns" && <Patterns focus={patternFocus} />}{" "}
            {page === "Symptom & Medication Log" && (
              <LogPage
                logs={logs}
                onSave={(entry: LogEntry) => {
                  setLogs([entry, ...logs]);
                  toast.success("Check-in added to your session log");
                }}
              />
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
                    toast.info("Stored demo preferences cleared");
                  }
                }}
                exportData={exportData}
              />
            )}
          </>
        )}
        <footer className="app-footer">
          <span>
            <ShieldCheck size={12} />
            Research prototype.
          </span>
          Not for diagnosis, medication changes, or emergency decisions.
        </footer>
      </main>
      <nav className="bottom-navigation" aria-label="Mobile navigation">
        {pages.map(([name, Icon, short]) => (
          <Button
            variant="ghost"
            key={name as string}
            className={page === name ? "selected" : ""}
            onPress={() => nav(name as string)}
          >
            <Icon size={20} />
            <span>{short as string}</span>
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
                <Modal.Heading>Demo profile</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <Avatar size="lg">
                  <Avatar.Fallback>JL</Avatar.Fallback>
                </Avatar>
                <h3>Jamie Lee</h3>
                <p>Student & family demo · South Brunswick, NJ</p>
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
          "Prototype measurement",
          reminders ? "Reminder · 7:00 PM" : "Reminder paused",
          Wind,
        ],
        [
          "Medication reminder",
          "Follow your saved prescribed schedule",
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
        title="Your breathing prototype"
        subtitle="Guided demo · About 3 seconds"
        icon={Wind}
        tone="breathing"
      >
        <div className="connection-row">
          <Tag tone={connected ? "mint" : "amber"} icon={Radio}>
            {connected ? "Demo device connected" : "Device disconnected"}
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
            {connected ? "Disconnect" : "Connect demo"}
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
                  ? "Let’s try that again."
                  : "A usable reading."
                : "Ready when you are."}
          </h2>
          <p>
            {running
              ? "Simulated samples are arriving. Breathe normally."
              : complete
                ? rejected
                  ? "This set did not pass the prototype quality checks."
                  : "Three attempts checked for quality and consistency."
                : "Sit comfortably. This workflow uses a simulated signal."}
          </p>
          <SignalChart live progress={progress} />
        </div>
        <Meter value={progress} label="Measurement progress" />
        <p className="microcopy">
          {progress}% complete ·{" "}
          {running
            ? "Receiving simulated samples"
            : complete
              ? "Quality review complete"
              : "Awaiting a demo measurement"}
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
              ? "Run another demo"
              : "Start demo measurement"}
        </Button>
        {!connected && (
          <Alert className="app-alert">
            <Alert.Content>
              <Alert.Description>
                Connect the demo device to start a measurement.
              </Alert.Description>
            </Alert.Content>
          </Alert>
        )}
      </Panel>
      <Panel
        title="Quality comes first"
        subtitle="Prototype signal checks, not clinical interpretation"
        icon={ShieldCheck}
        tone="indigo"
      >
        {!complete ? (
          <div className="empty-state">
            <Microscope size={35} />
            <h3>Nothing to review yet.</h3>
            <p>
              Run a demo to see all three attempts and their quality checks.
            </p>
          </div>
        ) : (
          <>
            <div className="attempt-list">
              {[
                414,
                mode === "Inconsistent"
                  ? 335
                  : mode === "Missing data"
                    ? null
                    : 412,
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
                  ? "attempt 2 outside demo tolerance"
                  : mode === "Missing data"
                    ? "insufficient complete attempts"
                    : "within demo tolerance"}
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
                    ? "Three complete and consistent attempts are required in this demo. Switch the demo state to Typical and run again."
                    : "The set can be added to the dashboard as a simulated prototype reading."}
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
              Save usable measurement
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
  const yes = data.filter((o) =>
      ["Mild", "Moderate"].includes(o.symptom),
    ).length,
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
          <Pick
            label="Date range"
            value={range}
            onChange={setRange}
            items={["7 days", "3 days"]}
          />
          <Pick
            label="Environment"
            value={env}
            onChange={setEnv}
            items={["All conditions", "AQI above 75", "AQI 75 or below"]}
          />
          <Pick
            label="Activity"
            value={activity}
            onChange={setActivity}
            items={["All activities", "Outdoor", "Indoor"]}
          />
          <Pick
            label="Symptoms"
            value={symptom}
            onChange={setSymptom}
            items={[
              "All logs",
              "Symptom reports",
              "Symptom-free",
              "Not logged",
            ]}
          />
        </div>
      </Panel>
      <div className="comparison-grid">
        <Panel title="Explicit symptom reports" icon={Heart} tone="rose">
          <div className="stat-number">
            {yes}
            <span>days</span>
          </div>
          <Meter
            value={data.length ? (yes / data.length) * 100 : 0}
            label="Symptom days"
          />
        </Panel>
        <Panel
          title="Explicitly symptom-free"
          icon={ShieldCheck}
          tone="breathing"
        >
          <div className="stat-number">
            {no}
            <span>days</span>
          </div>
          <Meter
            value={data.length ? (no / data.length) * 100 : 0}
            label="Symptom-free days"
          />
        </Panel>
        <Panel title="Unknown, not symptom-free" icon={Info} tone="indigo">
          <div className="stat-number">
            {unknown}
            <span>missing logs</span>
          </div>
          <p className="muted">
            {data.filter((o) => o.reading === null).length} missing prototype
            measurements
          </p>
        </Panel>
      </div>
      <Panel
        title="The observations behind the pattern"
        subtitle={`${data.length} sample days match these filters. Selected topic: ${["pollution", "outdoor activity", "nighttime symptoms"][focus]}.`}
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
                  <Tag
                    tone={
                      o.symptom === "Not logged"
                        ? "neutral"
                        : o.symptom === "None"
                          ? "mint"
                          : "amber"
                    }
                  >
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
            is never treated as symptom-free. All observations are simulated.
          </p>
        </Expand>
      </Panel>
      <Panel
        title="What if the conditions looked different?"
        subtitle="An exploratory comparison, not a recommendation or prediction"
        icon={CloudSun}
      >
        <Pick
          label="Explore available conditions"
          value={scenario}
          onChange={setScenario}
          items={["Moderate AQI", "Lower AQI"]}
        />
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
        subtitle="Entries stay in this session; they are not stored on a server."
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
            <Pick
              label="Symptom severity"
              value={severity}
              onChange={setSeverity}
              items={["None", "Mild", "Moderate", "Severe"]}
            />
            <Pick
              label="Nighttime waking"
              value={night}
              onChange={setNight}
              items={["No", "Yes", "Not sure"]}
            />
            <Pick
              label="Activity limitation"
              value={limitation}
              onChange={setLimitation}
              items={["None", "Some", "Significant", "Not sure"]}
            />
            <Pick
              label="Suspected exposure"
              value={exposure}
              onChange={setExposure}
              items={[
                "None noted",
                "Outdoor air",
                "Pollen",
                "Exercise",
                "Other",
                "Not sure",
              ]}
            />
          </div>
          <Pick
            label="Medication use as logged"
            value={medication}
            onChange={setMedication}
            items={[
              "Not logged",
              "Recorded as prescribed",
              "Use recorded — see notes",
              "No use recorded",
            ]}
          />
          <TextField
            className="app-field"
            isRequired
            value={timestamp}
            onChange={setTimestamp}
          >
            <Label>Timestamp</Label>
            <Input type="datetime-local" />
          </TextField>
          <TextField className="app-field" value={notes} onChange={setNotes}>
            <Label>Notes (optional)</Label>
            <TextArea
              placeholder="Anything you’d like to remember…"
              maxLength={1000}
            />
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
    <div className="care-grid">
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
              if (
                f.type !== "application/pdf" &&
                !f.type.startsWith("image/")
              ) {
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
              onPress={() =>
                window.open(planUrl, "_blank", "noopener,noreferrer")
              }
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
        <Button
          variant="secondary"
          className="secondary-btn"
          onPress={() => file.current?.click()}
        >
          <Upload size={16} />
          {plan ? "Replace local plan" : "Choose a local care plan"}
        </Button>
      </Panel>
      <Panel title="Reminders, on your terms" icon={Bell} tone="indigo">
        <Toggle value={reminders} onChange={setReminders}>
          Enable demo reminders
        </Toggle>
        <p className="muted">Check-in: 6:00 PM · Measurement: 7:00 PM</p>
        <p className="muted">
          Medication: use the existing clinician-prescribed schedule in your
          saved plan. No medication or dose is generated here.
        </p>
        <Tag>In-app reminders only</Tag>
        <div className="settings-divider" />
        <Toggle value={persist} onChange={setPersist}>
          Remember non-sensitive demo preferences
        </Toggle>
        <p className="microcopy">
          Demo state, simulated reading, device connection, and language only.
          Check-in notes and care files remain in memory. Turning this off
          clears saved demo preferences.
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
            <span>session log entries</span>
          </div>
          <div>
            <strong>{reading}</strong>
            <span>latest arbitrary units</span>
          </div>
          <div>
            <strong>6 / 7</strong>
            <span>seeded days logged</span>
          </div>
        </div>
        <Button
          variant="ghost"
          className="text-btn"
          onPress={() => setReport(!report)}
        >
          {report ? "Hide" : "Preview"} report
          <ChevronDown size={15} />
        </Button>
        {report && (
          <div className="report-content">
            <h3>AsthmaGuard SB · Simulated report</h3>
            <p>
              Prototype readings: 398–424 arbitrary units across the seeded
              week. Current usable reading: {reading} a.u. One missing
              measurement.
            </p>
            <p>
              Symptoms:{" "}
              {logs.filter((l: LogEntry) => l.severity !== "None").length}{" "}
              session entries with symptoms;{" "}
              {logs.filter((l: LogEntry) => l.severity === "None").length}{" "}
              explicitly symptom-free entries. One seeded day has no symptom
              log.
            </p>
            <p>
              Medication use: self-reported log entries only.{" "}
              {
                logs.filter((l: LogEntry) => l.medication !== "Not logged")
                  .length
              }{" "}
              entries contain a medication-use status. This report does not
              verify adherence or recommend changes.
            </p>
            <p>
              Tentative patterns: higher demo pollution and outdoor activity
              co-occur with symptom reports in 4 sample days. Only 1 nighttime
              report. Small, confounded samples cannot establish causes.
            </p>
            <p>
              Data completeness: 6 of 7 seeded days have explicit symptom logs
              and prototype readings. No pollen exposure measurement. Regional
              environmental values are simulated placeholders.
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
          <Button
            variant="secondary"
            className="secondary-btn"
            onPress={exportData}
          >
            <Download size={16} />
            Export JSON
          </Button>
        </div>
      </Panel>
      <Panel
        title="Local support, thoughtfully listed"
        subtitle="Directory placeholders · No clinic contact details are provided"
        icon={MapPin}
      >
        <div className="resource-row">
          <strong>School health office</strong>
          <span>Add your school’s verified contact to your own care plan.</span>
          <Tag>Placeholder</Tag>
        </div>
        <div className="resource-row">
          <strong>Primary care team</strong>
          <span>
            Use the contact information from your clinician-provided plan.
          </span>
          <Tag>Placeholder</Tag>
        </div>
        <div className="resource-row">
          <strong>Regional air-quality source</strong>
          <span>Data provider not connected in this demo.</span>
          <Tag>Not connected</Tag>
        </div>
      </Panel>
    </div>
  );
}
function Experience() {
  const readRoute = () => {
    const r = location.hash.slice(1);
    return ["welcome", "signin", "signup", "reset", "dashboard"].includes(r)
      ? r
      : "welcome";
  };
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const update = () => setRoute(readRoute());
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  const navigate = (r: string) => {
    location.hash = r;
    setRoute(r);
    window.scrollTo(0, 0);
  };
  return route === "dashboard" ? (
    <App />
  ) : (
    <EntryFlow
      route={route}
      onNavigate={navigate}
      onEnter={() => navigate("dashboard")}
    />
  );
}
createRoot(document.getElementById("root")!).render(<Experience />);
