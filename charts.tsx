import React, { useId } from "react";
import {
  Scatter,
  ScatterChart,
  ZAxis,
  Legend,
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { observations } from "./mock";
import { useChartTheme } from "./theme";
import type { RiskTrendPoint } from "./environment";
import { tr, type Language } from "./mock";

const FONT = "-apple-system, BlinkMacSystemFont, SF Pro Text, Helvetica Neue, sans-serif";
const motionOK = () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function useChartTokens() {
  const dark = useChartTheme() === "dark";
  return {
    dark,
    tooltip: {
      background: dark ? "#2c2c2ef2" : "#fffffffa",
      border: `1px solid ${dark ? "#3a3a3c" : "#e5e5ea"}`,
      borderRadius: 14,
      color: dark ? "#ffffff" : "#000000",
      fontFamily: FONT,
      fontSize: 12,
      boxShadow: dark ? "0 12px 30px #0007" : "0 8px 24px #0002",
    },
    axis: { fill: dark ? "#8d8d93" : "#8e8e93", fontSize: 10, fontFamily: FONT },
    grid: dark ? "#ffffff12" : "#0000000d",
    refLine: dark ? "#48484a" : "#c7c7cc",
    label: dark ? "#8d8d93" : "#6d6d72",
    value: dark ? "#ffffff" : "#000000",
  };
}

export function BreathingChart({
  missing = false,
  reading = 412,
}: {
  missing?: boolean;
  reading?: number;
}) {
  const id = useId().replace(/:/g, "");
  const t = useChartTokens();
  const blue = t.dark ? "#0a84ff" : "#007aff";
  const data = observations.map((o, i) => ({
    day: o.day,
    value: i === 6 && !missing ? reading : o.reading,
  }));
  return (
    <div
      className="curve-chart"
      role="img"
      aria-label="Seven-day measurement curve in arbitrary units. October 17 is unavailable."
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 15, right: 7, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={blue} stopOpacity={0.35} />
              <stop offset="100%" stopColor={blue} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={t.grid} strokeDasharray="2 6" />
          <XAxis dataKey="day" tick={t.axis} axisLine={false} tickLine={false} tickFormatter={(v) => v.replace("Oct ", "")} dy={8} />
          <YAxis hide domain={[380, 440]} />
          <Tooltip
            contentStyle={t.tooltip}
            itemStyle={{ color: t.value }}
            labelStyle={{ color: t.label }}
            formatter={(v) => [`${v} a.u.`, "Prototype"]}
            cursor={{ stroke: blue + "33", strokeDasharray: "3 6" }}
          />
          <ReferenceLine y={420} stroke={t.refLine} strokeDasharray="3 5" />
          <Area
            type="natural"
            dataKey="value"
            stroke={blue}
            strokeWidth={2.5}
            fill={`url(#${id})`}
            connectNulls={false}
            dot={{ r: 3, fill: blue, stroke: t.dark ? "#000000" : "#ffffff", strokeWidth: 2 }}
            activeDot={{ r: 5, fill: t.dark ? "#ffffff" : "#007aff", stroke: blue, strokeWidth: 4 }}
            isAnimationActive={!window.matchMedia("(prefers-reduced-motion: reduce)").matches}
          />
        </AreaChart>
      </ResponsiveContainer>
      {missing && <span className="historical-chart-label">PARTIAL HISTORY</span>}
    </div>
  );
}

export function PollutionChart({ compact = false }: { compact?: boolean }) {
  const id = useId().replace(/:/g, "");
  const t = useChartTokens();
  const orange = t.dark ? "#ff9f0a" : "#ff9500";
  return (
    <div
      className={compact ? "pollution-chart mini-curve" : "pollution-chart"}
      role="img"
      aria-label="Regional AQI over seven days: 42, 78, 91, 49, 83, 65, 86."
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={observations} margin={{ top: 10, right: 2, left: 2, bottom: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={orange} stopOpacity={0.4} />
              <stop offset="100%" stopColor={orange} stopOpacity={0} />
            </linearGradient>
          </defs>
          {!compact && (
            <XAxis dataKey="day" tick={t.axis} axisLine={false} tickLine={false} tickFormatter={(v) => v.slice(4)} dy={5} />
          )}
          <YAxis hide domain={[0, 110]} />
          <Tooltip
            contentStyle={t.tooltip}
            itemStyle={{ color: t.value }}
            labelStyle={{ color: t.label }}
            formatter={(v) => [v, "AQI"]}
            cursor={false}
          />
          <Area dataKey="aqi" type="monotone" stroke={orange} fill={`url(#${id})`} strokeWidth={2.5} activeDot={{ r: 4, fill: orange }} isAnimationActive={!window.matchMedia("(prefers-reduced-motion: reduce)").matches} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const signal = [12, 7, 19, 13, 9, 16, 11, 24, 10, 13, 8, 18, 27, 14, 10, 18, 12, 9, 22, 13, 7, 15, 20, 11];

export function SignalChart({
  live = false,
  progress = 100,
  small = false,
}: {
  live?: boolean;
  progress?: number;
  small?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const t = useChartTokens();
  const orange = t.dark ? "#ff9f0a" : "#ff9500";
  const data = signal.map((v, i) => ({
    time: i % 6 === 0 ? ["8:30", "8:45", "9:00", "9:15"][i / 6] : "",
    sample: i + 1,
    range: !live || i < (progress / 100) * 24 ? [-v, v] : [0, 0],
  }));
  return (
    <div
      className={small ? "signal-chart small-signal" : "signal-chart"}
      role="img"
      aria-label="Illustrative signal. Positive and negative sample amplitudes in arbitrary units."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 2, left: 2, bottom: 0 }} barCategoryGap="28%">
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={orange} />
              <stop offset="50%" stopColor={orange} />
              <stop offset="100%" stopColor={orange} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" tick={t.axis} axisLine={false} tickLine={false} interval={0} hide={small} />
          <YAxis hide domain={[-34, 34]} />
          <ReferenceLine y={0} stroke={t.refLine} strokeDasharray="2 7" />
          <Tooltip
            contentStyle={t.tooltip}
            itemStyle={{ color: t.value }}
            labelStyle={{ color: t.label }}
            labelFormatter={(_, payload) => `Sample ${payload?.[0]?.payload.sample || ""}`}
            formatter={(v: any) => [Array.isArray(v) ? `${v[0]} to ${v[1]} a.u.` : v, "Amplitude"]}
            cursor={{ fill: t.dark ? "#ffffff0a" : "#00000008" }}
          />
          <Bar barSize={7} maxBarSize={7} dataKey="range" fill={`url(#${id})`} radius={[7, 7, 7, 7]} isAnimationActive={!live && !window.matchMedia("(prefers-reduced-motion: reduce)").matches}>
            <Cell fill={orange} fillOpacity={0.45} />
            {signal.slice(1).map((_, i) => (
              <Cell key={i} fillOpacity={i % 4 === 0 ? 0.45 : 1} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CompletenessGauge() {
  const t = useChartTokens();
  const green = t.dark ? "#30d158" : "#34c759";
  return (
    <div
      className="completeness-gauge"
      role="img"
      aria-label="Six of seven sample days have explicit symptom logs. One day is missing."
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={Array.from({ length: 7 }, (_, i) => ({ name: i < 6 ? "Logged day" : "Missing day", value: 1 }))}
            dataKey="value"
            cx="50%"
            cy="83%"
            innerRadius="77%"
            outerRadius="100%"
            startAngle={180}
            endAngle={0}
            paddingAngle={8}
            cornerRadius={9}
            stroke="none"
            isAnimationActive={!window.matchMedia("(prefers-reduced-motion: reduce)").matches}
          >
            {Array.from({ length: 7 }, (_, i) => (
              <Cell key={i} fill={i < 6 ? green : t.dark ? "#3a3a3c" : "#e5e5ea"} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="gauge-caption">
        <strong>
          6<span>/7</span>
        </strong>
        <span>days checked in</span>
      </div>
    </div>
  );
}

export function SymptomBars({ data = observations }: { data?: typeof observations }) {
  const t = useChartTokens();
  const orange = t.dark ? "#ff9f0a" : "#ff9500";
  return (
    <div
      className="symptom-bars"
      role="img"
      aria-label="Explicitly logged symptom severity by day. Pale dots are explicitly symptom-free days. Missing days have no bar and remain unknown."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data.map((o) => ({
            ...o,
            level: o.symptom === "Moderate" ? 2 : o.symptom === "Mild" ? 1 : o.symptom === "Not logged" ? null : 0,
          }))}
          margin={{ top: 10, right: 5, left: 5, bottom: 0 }}
        >
          <XAxis dataKey="day" tick={t.axis} axisLine={false} tickLine={false} tickFormatter={(v) => v.slice(4)} />
          <YAxis hide domain={[0, 3]} />
          <Tooltip
            contentStyle={t.tooltip}
            itemStyle={{ color: t.value }}
            labelStyle={{ color: t.label }}
            formatter={(_, __, p) => [p.payload.symptom, "Logged symptoms"]}
            cursor={{ fill: t.dark ? "#ffffff08" : "#00000006" }}
          />
          <Bar dataKey="level" radius={[12, 12, 12, 12]} barSize={14} minPointSize={5} isAnimationActive={!window.matchMedia("(prefers-reduced-motion: reduce)").matches}>
            {data.map((o, i) => (
              <Cell key={i} fill={o.symptom === "None" ? (t.dark ? "#48484a" : "#d1d1d6") : orange} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mini-chart-key">
        None · Mild · Moderate <span>17th: not logged</span>
      </div>
    </div>
  );
}

export function NightScatter() {
  const t = useChartTokens();
  const blue = t.dark ? "#0a84ff" : "#007aff";
  const gold = t.dark ? "#ffd60a" : "#ffcc00";
  const ordinary = observations
    .filter((o, i) => o.reading !== null && i > 0 && !observations[i - 1].night && observations[i - 1].symptom !== "Not logged")
    .map((o) => ({ day: Number(o.day.slice(4)), reading: o.reading }));
  const night = observations
    .filter((o, i) => o.reading !== null && i > 0 && observations[i - 1].night)
    .map((o) => ({ day: Number(o.day.slice(4)), reading: o.reading }));
  return (
    <div
      className="night-scatter"
      role="img"
      aria-label="Readings by day. October 15, following the only nighttime symptom report, is highlighted in gold. No cause can be inferred."
    >
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 16, right: 15, left: 0, bottom: 1 }}>
          <CartesianGrid stroke={t.grid} vertical={false} strokeDasharray="2 5" />
          <XAxis type="number" dataKey="day" domain={[11.5, 18.5]} ticks={[12, 14, 16, 18]} axisLine={false} tickLine={false} tick={t.axis} />
          <YAxis type="number" dataKey="reading" domain={[380, 440]} hide />
          <ZAxis range={[65, 65]} />
          <ReferenceLine y={420} stroke={t.refLine} strokeDasharray="3 6" />
          <Tooltip
            contentStyle={t.tooltip}
            itemStyle={{ color: t.value }}
            labelStyle={{ color: t.label }}
            cursor={{ stroke: blue + "33", strokeDasharray: "3 5" }}
            formatter={(v, name) => [v, name === "day" ? "October day" : "a.u."]}
          />
          <Scatter name="No prior-night waking" data={ordinary} fill={blue} fillOpacity={0.85} isAnimationActive={!window.matchMedia("(prefers-reduced-motion: reduce)").matches} />
          <Scatter name="Prior-night waking" data={night} fill={gold} stroke={gold} strokeWidth={3} isAnimationActive={!window.matchMedia("(prefers-reduced-motion: reduce)").matches} />
        </ScatterChart>
      </ResponsiveContainer>
      <div className="scatter-key">
        <span>Blue · no prior-night waking</span>
        <span>Gold · prior-night waking</span>
      </div>
    </div>
  );
}

/* Risk trend based on saved health inputs and regional forecasts. */
export function RiskForecastChart({ data, language = "English" }: { data: RiskTrendPoint[]; language?: Language }) {
  const id = useId().replace(/:/g, "");
  const t = useChartTokens();
  const colors = t.dark
    ? { low: "#30d158", med: "#ff9f0a", high: "#ff453a" }
    : { low: "#34c759", med: "#ff9500", high: "#ff3b30" };
  const chartData = data.filter((point) => point.forecast);
  if (!chartData.length) return <div className="risk-chart-empty">{data.length ? "Forecast unavailable" : tr(language, "Log symptoms on at least 14 days to build a personal forecast")}</div>;
  const peakRisk = Math.max(...chartData.map((point) => point.risk));
  const line = peakRisk >= 66 ? colors.high : peakRisk >= 33 ? colors.med : colors.low;
  return (
    <div
      className="risk-chart"
      role="img"
      aria-label={tr(language, "Estimated risk index based on saved readings, check-ins, and regional conditions")}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 6, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={line} stopOpacity={0.38} />
              <stop offset="100%" stopColor={line} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" tick={t.axis} axisLine={false} tickLine={false} interval={3} />
          <YAxis hide domain={[0, 100]} />
          <Tooltip
            contentStyle={t.tooltip}
            itemStyle={{ color: t.value }}
            labelStyle={{ color: t.label }}
            formatter={(v, _name, item) => [`${v}/100`, tr(language, item.payload.forecast ? "Projected index" : "Recorded trend")]}
            cursor={{ stroke: line, strokeDasharray: "3 5" }}
          />
          <ReferenceArea y1={0} y2={33} fill={colors.low} fillOpacity={0.08} />
          <ReferenceArea y1={33} y2={66} fill={colors.med} fillOpacity={0.08} />
          <ReferenceArea y1={66} y2={100} fill={colors.high} fillOpacity={0.08} />
          <ReferenceLine y={33} stroke={t.refLine} strokeDasharray="2 6" />
          <ReferenceLine y={66} stroke={t.refLine} strokeDasharray="2 6" />
          <Area type="monotone" dataKey="risk" stroke={line} strokeWidth={2.5} fill={`url(#${id})`} dot={false} activeDot={{ r: 4, fill: line, stroke: t.dark ? "#000000" : "#ffffff", strokeWidth: 2 }} isAnimationActive={motionOK()} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MeasurementTrendChart({ measurements, includeHistoricalReadings = false, language = "English" }: { measurements: Array<{ time: string; value: number; unit?: string; sample?: boolean }>; includeHistoricalReadings?: boolean; language?: Language }) {
  const gradientId = useId().replace(/:/g, "");
  const t = useChartTokens();
  const locale = language === "Spanish" ? "es-ES" : language === "Hindi" ? "hi-IN" : language === "Gujarati" ? "gu-IN" : "en-US";
  const values = [...measurements]
    .filter((item) => Number.isFinite(Number(item.value)) && Number.isFinite(Date.parse(item.time)))
    .sort((a, b) => Date.parse(a.time) - Date.parse(b.time));
  if (!values.length) return <div className="chart-empty">Save a breathing reading to see its trend.</div>;
  const dayKey = (value: string) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
  const todayKey = dayKey(new Date().toISOString());
  const displayedValues = values.filter((item) => includeHistoricalReadings || !item.sample);
  const grouped = new Map<string, number[]>();
  displayedValues.forEach((item) => {
    const key = dayKey(item.time);
    grouped.set(key, [...(grouped.get(key) || []), Number(item.value)]);
  });
  const generatedByDay = new Map<string, number[]>();
  values.filter((item) => !includeHistoricalReadings && item.sample).forEach((item) => {
    const key = dayKey(item.time);
    generatedByDay.set(key, [...(generatedByDay.get(key) || []), Number(item.value)]);
  });
  const recentDays = [...grouped].slice(-8);
  const earlier = recentDays.filter(([key]) => key !== todayKey).map(([, dayValues]) => dayValues.reduce((sum, value) => sum + value, 0) / dayValues.length);
  const average = earlier.length ? earlier.reduce((total, value) => total + value, 0) / earlier.length : null;
  const generatedEarlier = [...generatedByDay].filter(([key]) => key !== todayKey).map(([, dayValues]) => dayValues.reduce((sum, value) => sum + value, 0) / dayValues.length);
  const generatedAverage = generatedEarlier.length ? generatedEarlier.reduce((sum, value) => sum + value, 0) / generatedEarlier.length : null;
  const lineAverage = average ?? generatedAverage;
  const todayValues = grouped.get(todayKey);
  const todayAverage = todayValues?.length ? todayValues.reduce((sum, value) => sum + value, 0) / todayValues.length : null;
  // Plot every saved reading over the full available history. Keep sample
  // entries visible for demo history, with a separate marker and tooltip label.
  const data = values.map((item) => {
    const date = new Date(item.time);
    const key = dayKey(item.time);
    const timeLabel = new Intl.DateTimeFormat(locale, { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" }).format(date);
    const dateLabel = new Intl.DateTimeFormat(locale, { timeZone: "America/New_York", month: "short", day: "numeric" }).format(date);
    return { day: key === todayKey ? timeLabel : `${dateLabel} ${timeLabel}`, timestamp: date.getTime(), value: Number(item.value), sample: Boolean(item.sample && !includeHistoricalReadings) };
  });
  const step = displayedValues.every((item) => item.unit === "L/min") ? 100 : 10;
  const lowest = Math.min(...data.map((point) => point.value));
  const highest = Math.max(...data.map((point) => point.value));
  const yMin = Math.max(0, Math.floor(lowest / step) * step - step);
  const yMax = Math.ceil(highest / step) * step + step;
  const yTicks = Array.from({ length: Math.floor((yMax - yMin) / step) + 1 }, (_, index) => yMin + index * step);
  const color = "#0a84ff";
  const timeSpan = data.at(-1)!.timestamp - data[0].timestamp;
  const xDomain: [number | string, number | string] = data.length > 1
    ? ["dataMin", "dataMax"]
    : [data[0].timestamp - 12 * 60 * 60 * 1000, data[0].timestamp + 12 * 60 * 60 * 1000];
  const formatAxisTime = (timestamp: number) => new Intl.DateTimeFormat(locale, timeSpan >= 24 * 60 * 60 * 1000
    ? { timeZone: "America/New_York", month: "short", day: "numeric" }
    : { timeZone: "America/New_York", hour: "numeric" }).format(new Date(timestamp));
  const trendSummary = todayAverage == null
    ? "No live reading saved today yet."
    : average == null
      ? "Add readings on another day to compare your trend."
      : todayAverage > average * 1.03
        ? "Today's airflow is higher than your recent average."
        : todayAverage < average * 0.97
          ? "Today's airflow is lower than your recent average."
          : "Today's airflow is close to your recent average.";
  return <div className="tva-chart" role="img" aria-label="Saved breathing readings compared with their average">
    <div className="tva-plot">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 9, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.22} />
            <stop offset="100%" stopColor={color} stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={t.grid} strokeDasharray="3 5" />
        <XAxis type="number" dataKey="timestamp" scale="time" domain={xDomain} tickFormatter={formatAxisTime} tick={t.axis} tickCount={5} axisLine={false} tickLine={false} minTickGap={16} />
        <YAxis domain={[yMin, yMax]} ticks={yTicks} tick={t.axis} tickLine={false} axisLine={false} width={34} />
        <Tooltip contentStyle={t.tooltip} itemStyle={{ color: t.value }} labelStyle={{ color: t.label }} labelFormatter={(timestamp) => new Intl.DateTimeFormat(locale, { timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(Number(timestamp)))} formatter={(value, _name, item: any) => [`${Number(value).toFixed(1)} ${displayedValues[0]?.unit || "L/min"}`, item.payload.sample ? tr(language, "Sample") : tr(language, "Reading")]} />
        <Area type="monotone" dataKey="value" stroke="none" fill={`url(#${gradientId})`} tooltipType="none" isAnimationActive={false} />
        {lineAverage != null && <ReferenceLine y={lineAverage} stroke={t.dark ? "#8d8d93" : "#8e8e93"} strokeDasharray="4 4" />}
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={(props: any) => <circle cx={props.cx} cy={props.cy} r={4} fill={props.payload?.sample ? "#8e8e93" : color} stroke={t.dark ? "#1c1c1e" : "#ffffff"} strokeWidth={1.5} />} activeDot={{ r: 5 }} isAnimationActive={motionOK()} />
      </LineChart>
    </ResponsiveContainer>
    </div>
    <div className="breathing-insight-box">
      <div className="breathing-average-pair">
        <div><span>{tr(language, "Today average")}</span><strong>{todayAverage == null ? "—" : `${todayAverage.toFixed(1)} ${displayedValues[0]?.unit || "L/min"}`}</strong></div>
        <div><span>{tr(language, "Recent average")}</span><strong>{average == null ? "—" : `${average.toFixed(1)} ${displayedValues[0]?.unit || "L/min"}`}</strong></div>
      </div>
      <p className="breathing-generated-trend"><span>{tr(language, "Trend")}</span>{tr(language, trendSummary)}</p>
    </div>
    <div className="breathing-chart-key"><span><i className="reading-line" />Readings</span>{average != null && <span><i className="average-line" />Average</span>}{!includeHistoricalReadings && average == null && generatedAverage != null && <span><i className="average-line" />Estimated average</span>}{!includeHistoricalReadings && values.some((item) => item.sample) && <span><i className="sample-dot" />Sample readings</span>}</div>
  </div>;
}

export type TrendChartRow = { label: string; pm25?: number | null; aqi?: number | null; humidity?: number | null; airflow?: number | null; severity?: number | null; limitation?: number | null };

export function EnvironmentTrendChart({ data, language = "English" }: { data: TrendChartRow[]; language?: Language }) {
  const t = useChartTokens();
  const usable = data.filter((row) => row.pm25 != null || row.aqi != null || row.humidity != null);
  if (!usable.length) return <div className="chart-empty">{tr(language, "Environmental history is not available.")}</div>;
  const metrics = [
    { key: "pm25" as const, name: tr(language, "PM2.5"), unit: "µg/m³", color: "#ff453a", domain: [0, "auto"] as [number, "auto"] },
    { key: "aqi" as const, name: tr(language, "AQI"), unit: "AQI", color: "#ff9f0a", domain: [0, "auto"] as [number, "auto"] },
    { key: "humidity" as const, name: tr(language, "Humidity"), unit: "%", color: "#0a84ff", domain: [0, 100] as [number, number] },
  ];
  const smooth = (index: number, key: typeof metrics[number]["key"]) => {
    const values = usable.slice(Math.max(0, index - 2), Math.min(usable.length, index + 3))
      .map((row) => row[key]).filter((value): value is number => value != null && Number.isFinite(value));
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  };
  return <div className="environment-trend-chart" role="img" aria-label={tr(language, "Air quality, fine particle, and humidity trends; five-day averages")}>
    {metrics.map((metric, metricIndex) => {
      const chartData = usable.map((row, index) => ({ label: row.label, value: smooth(index, metric.key) }));
      const latest = [...chartData].reverse().find((row) => row.value != null)?.value;
      return <section className="environment-trend-series" key={metric.key}>
        <div className="environment-trend-heading"><strong>{metric.name}</strong><span>{latest == null ? "—" : `${latest.toFixed(metric.key === "pm25" ? 1 : 0)} ${metric.unit}`}</span></div>
        <div className="environment-trend-plot">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke={t.grid} strokeDasharray="3 5" />
              <XAxis dataKey="label" hide={metricIndex !== metrics.length - 1} tick={t.axis} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={24} />
              <YAxis tick={t.axis} tickLine={false} axisLine={false} domain={metric.domain} tickCount={4} width={34} />
              <Tooltip contentStyle={t.tooltip} labelStyle={{ color: t.label }} formatter={(value) => [`${Number(value).toFixed(metric.key === "pm25" ? 1 : 0)} ${metric.unit} · 5-day average`, metric.name]} />
              <Line type="monotone" dataKey="value" name={metric.name} stroke={metric.color} strokeWidth={2.4} dot={false} activeDot={{ r: 4, fill: metric.color, stroke: t.dark ? "#1c1c1e" : "#ffffff", strokeWidth: 1.5 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>;
    })}
  </div>;
}

export function ClimateTrendCharts({ data, language = "English" }: { data: TrendChartRow[]; language?: Language }) {
  const t = useChartTokens();
  const metrics = [
    { key: "pm25" as const, label: tr(language, "PM2.5"), unit: "µg/m³", color: "#ff453a", domain: [0, "auto"] as [number, "auto"] },
    { key: "aqi" as const, label: tr(language, "AQI"), unit: "AQI", color: "#ff9f0a", domain: [0, "auto"] as [number, "auto"] },
    { key: "humidity" as const, label: tr(language, "Humidity"), unit: "%", color: "#0a84ff", domain: [0, 100] as [number, number] },
  ];
  return <div className="climate-trend-grid">
    {metrics.map((metric) => {
      const values = data.filter((row) => row[metric.key] != null && Number.isFinite(Number(row[metric.key])));
      const latest = values.at(-1);
      return <section className="climate-trend-tile" key={metric.key} aria-label={`${metric.label} over time`}>
        <header><span>{metric.label}</span><strong>{latest ? Number(latest[metric.key]).toFixed(metric.key === "humidity" || metric.key === "aqi" ? 0 : 1) : "—"}<small> {metric.unit}</small></strong></header>
        {values.length < 2 ? <div className="climate-chart-empty">{tr(language, "More days needed for a trend.")}</div> : <div className="climate-mini-chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={values} margin={{ top: 8, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke={t.grid} strokeDasharray="3 5" />
              <XAxis dataKey="label" tick={t.axis} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={24} />
              <YAxis hide domain={metric.domain} />
              <Tooltip contentStyle={t.tooltip} labelStyle={{ color: t.label }} formatter={(value) => [`${Number(value).toFixed(metric.key === "humidity" || metric.key === "aqi" ? 0 : 1)} ${metric.unit}`, metric.label]} />
              <Line type="monotone" dataKey={metric.key} name={metric.label} stroke={metric.color} strokeWidth={2.2} dot={{ r: 1.5, fill: metric.color, strokeWidth: 0 }} activeDot={{ r: 4 }} isAnimationActive={motionOK()} />
            </LineChart>
          </ResponsiveContainer>
        </div>}
      </section>;
    })}
  </div>;
}

export function HealthTrendChart({ data, unit, language = "English" }: { data: TrendChartRow[]; unit: string; language?: Language }) {
  const t = useChartTokens();
  const usable = data.filter((row) => row.airflow != null || row.severity != null || row.limitation != null);
  if (!usable.length) return <div className="chart-empty">Add readings or check-ins to see health trends.</div>;
  return <div className="trend-chart health-trend-chart" role="img" aria-label="Breathing readings with symptom severity and activity limitation">
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={usable} margin={{ top: 10, right: 4, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} stroke={t.grid} strokeDasharray="3 5" />
        <XAxis dataKey="label" tick={t.axis} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={20} />
        <YAxis yAxisId="flow" tick={t.axis} axisLine={false} tickLine={false} width={42} />
        <YAxis yAxisId="logs" orientation="right" tick={t.axis} axisLine={false} tickLine={false} domain={[0, 3]} ticks={[0, 1, 2, 3]} width={25} />
        <Tooltip contentStyle={t.tooltip} labelStyle={{ color: t.label }} formatter={(v, name) => [name === "Breathing" ? `${Number(v).toFixed(1)} ${unit}` : `${v}/3`, tr(language, String(name))]} />
        <Line yAxisId="flow" type="monotone" dataKey="airflow" name="Breathing" stroke="#0a84ff" strokeWidth={2.6} dot={{ r: 3, fill: "#0a84ff", stroke: t.dark ? "#1c1c1e" : "#ffffff", strokeWidth: 1 }} activeDot={{ r: 4.5 }} connectNulls />
        <Line yAxisId="logs" type="monotone" dataKey="severity" name="Symptoms" stroke="#ff453a" strokeWidth={2.2} dot={{ r: 2.5, fill: "#ff453a", stroke: t.dark ? "#1c1c1e" : "#ffffff", strokeWidth: 1 }} activeDot={{ r: 4.5 }} connectNulls />
        <Line yAxisId="logs" type="monotone" dataKey="limitation" name="Limitation" stroke="#30d158" strokeWidth={2.2} dot={{ r: 2.5, fill: "#30d158", stroke: t.dark ? "#1c1c1e" : "#ffffff", strokeWidth: 1 }} activeDot={{ r: 4.5 }} connectNulls />
      </ComposedChart>
    </ResponsiveContainer>
  </div>;
}

/* Apple-style gray bars with a colored average line */
export function AqiAverageChart() {
  const t = useChartTokens();
  const orange = t.dark ? "#ff9f0a" : "#ff9500";
  const bar = t.dark ? "#5a5a5e" : "#c7c7cc";
  const avg = Math.round(observations.reduce((s, o) => s + o.aqi, 0) / observations.length);
  return (
    <div
      className="avg-chart"
      role="img"
      aria-label={`Seven-day air quality with an average of ${avg}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={observations.map((o) => ({ day: o.day.slice(4), aqi: o.aqi }))}
          margin={{ top: 18, right: 4, left: 4, bottom: 0 }}
        >
          <XAxis dataKey="day" tick={t.axis} axisLine={false} tickLine={false} interval={0} />
          <YAxis hide domain={[0, 110]} />
          <Tooltip
            contentStyle={t.tooltip}
            itemStyle={{ color: t.value }}
            labelStyle={{ color: t.label }}
            formatter={(v) => [v, "AQI"]}
            cursor={{ fill: t.dark ? "#ffffff08" : "#00000006" }}
          />
          <ReferenceLine y={avg} stroke={orange} strokeWidth={2.5} />
          <Bar dataKey="aqi" radius={[4, 4, 4, 4]} maxBarSize={20} isAnimationActive={motionOK()}>
            {observations.map((_, i) => (
              <Cell key={i} fill={bar} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );}

/* Today vs weekly average comparison curve */
const todayCurve = [402, 403, 405, 404, 407, 409, 408, 411, 414, 412, 415, 413];
const avgCurve = [410, 411, 412, 411, 413, 414, 413, 415, 416, 415, 417, 416];
export function TodayVsAverageChart() {
  const t = useChartTokens();
  const orange = t.dark ? "#ff9f0a" : "#ff9500";
  const gray = t.dark ? "#8d8d93" : "#8e8e93";
  const data = todayCurve.map((v, i) => ({
    hour: i,
    today: v,
    avg: avgCurve[i],
  }));
  return (
    <div
      className="tva-chart"
      role="img"
      aria-label="Today's readings compared with your weekly average across the day"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="tva-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={orange} stopOpacity={0.25} />
              <stop offset="100%" stopColor={orange} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            type="number"
            dataKey="hour"
            domain={[0, 11]}
            ticks={[0, 3, 6, 9, 11]}
            tickFormatter={(h) => ["12AM", "6AM", "12PM", "6PM", "12AM"][ [0, 3, 6, 9, 11].indexOf(h) ]}
            tick={t.axis}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide domain={[395, 425]} />
          <Tooltip
            contentStyle={t.tooltip}
            itemStyle={{ color: t.value }}
            labelStyle={{ color: t.label }}
            labelFormatter={(h) => ["12AM", "2AM", "4AM", "6AM", "8AM", "10AM", "12PM", "2PM", "4PM", "6PM", "8PM", "10PM"][h]}
            formatter={(v, name) => [`${v} a.u.`, name === "today" ? "Today" : "Average"]}
            cursor={{ stroke: gray, strokeDasharray: "3 5" }}
          />
          <Area type="monotone" dataKey="avg" name="avg" stroke={gray} strokeWidth={2} fill="none" strokeDasharray="1 0" dot={false} isAnimationActive={motionOK()} />
          <Area type="monotone" dataKey="today" name="today" stroke={orange} strokeWidth={2.5} fill={`url(#tva-fill)`} dot={false} activeDot={{ r: 4, fill: orange, stroke: t.dark ? "#000" : "#fff", strokeWidth: 2 }} isAnimationActive={motionOK()} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );}

/* Tiny sparkline bars for highlight cards */
const miniValues = [5, 8, 4, 9, 6, 11, 7, 10, 5, 8, 12, 9];
export function MiniBars() {
  const t = useChartTokens();
  const orange = t.dark ? "#ff9f0a" : "#ff9500";
  const bar = t.dark ? "#5a5a5e" : "#c7c7cc";
  return (
    <div className="mini-bars" role="img" aria-label="Daily check-ins over the last two weeks">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={miniValues.map((v, i) => ({ i, v }))} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} barCategoryGap="30%">
          <XAxis dataKey="i" hide />
          <YAxis hide domain={[0, 14]} />
          <Tooltip
            contentStyle={t.tooltip}
            itemStyle={{ color: t.value }}
            labelStyle={{ color: t.label }}
            labelFormatter={() => "Check-ins"}
            formatter={(v) => [v, "Days"]}
            cursor={false}
          />
          <Bar dataKey="v" radius={[3, 3, 3, 3]} maxBarSize={10} isAnimationActive={motionOK()}>
            {miniValues.map((_, i) => (
              <Cell key={i} fill={i === miniValues.length - 1 ? orange : bar} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );}

export function SymptomMix() {
  const t = useChartTokens();
  const parts = [
    { name: "Mild", value: 3, fill: t.dark ? "#ff9f0a" : "#ff9500" },
    { name: "Moderate", value: 1, fill: t.dark ? "#ff453a" : "#ff3b30" },
    { name: "Symptom-free", value: 2, fill: t.dark ? "#30d158" : "#34c759" },
    { name: "Unknown", value: 1, fill: t.dark ? "#48484a" : "#d1d1d6" },
  ];
  return (
    <div
      className="symptom-mix"
      role="img"
      aria-label="Seven-day symptom log breakdown: three mild, one moderate, two explicitly symptom-free, one unknown."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={[{ mild: 3, moderate: 1, none: 2, unknown: 1 }]} margin={{ top: 10, right: 1, left: 1, bottom: 0 }} barSize={22}>
          <XAxis type="number" domain={[0, 7]} hide />
          <YAxis type="category" hide />
          <Tooltip
            contentStyle={t.tooltip}
            labelFormatter={() => "7 sample days"}
            itemStyle={{ color: t.value }}
            labelStyle={{ color: t.label }}
            formatter={(v, name) => [v, name]}
            cursor={false}
          />
          <Bar name="Mild" dataKey="mild" stackId="days" fill={parts[0].fill} radius={[10, 0, 0, 10]} isAnimationActive={!window.matchMedia("(prefers-reduced-motion: reduce)").matches} />
          <Bar name="Moderate" dataKey="moderate" stackId="days" fill={parts[1].fill} isAnimationActive={!window.matchMedia("(prefers-reduced-motion: reduce)").matches} />
          <Bar name="Symptom-free" dataKey="none" stackId="days" fill={parts[2].fill} isAnimationActive={!window.matchMedia("(prefers-reduced-motion: reduce)").matches} />
          <Bar name="Unknown" dataKey="unknown" stackId="days" fill={parts[3].fill} radius={[0, 10, 10, 0]} isAnimationActive={!window.matchMedia("(prefers-reduced-motion: reduce)").matches} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mix-legend">
        {parts.map((p) => (
          <span key={p.name}>
            <i style={{ background: p.fill }} />
            {p.name}
            <b>{p.value}</b>
          </span>
        ))}
      </div>
    </div>
  );
}
