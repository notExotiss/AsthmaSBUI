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

/* 24-hour risk timeline with Low/Medium/High zones */
export function RiskForecastChart({ level }: { level: "Low" | "Medium" | "High" }) {
  const id = useId().replace(/:/g, "");
  const t = useChartTokens();
  const colors = t.dark
    ? { low: "#30d158", med: "#ff9f0a", high: "#ff453a" }
    : { low: "#34c759", med: "#ff9500", high: "#ff3b30" };
  const line = level === "High" ? colors.high : level === "Medium" ? colors.med : colors.low;
  const peak = level === "High" ? 86 : level === "Medium" ? 58 : 24;
  const base = level === "High" ? 52 : level === "Medium" ? 34 : 10;
  const data = Array.from({ length: 25 }, (_, h) => {
    const x = h / 24;
    const bump = Math.sin(Math.PI * Math.min(1, x * 1.12));
    const v = base + (peak - base) * bump;
    return { h, risk: Math.round(Math.max(3, Math.min(96, v))) };
  });
  return (
    <div
      className="risk-chart"
      role="img"
      aria-label={`Predicted symptom risk over the next 24 hours: ${level.toLowerCase()} risk, peaking midafternoon`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 6, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={line} stopOpacity={0.38} />
              <stop offset="100%" stopColor={line} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            type="number"
            dataKey="h"
            domain={[0, 24]}
            ticks={[0, 6, 12, 18, 24]}
            tickFormatter={(h) => (h === 0 ? "Now" : `+${h}h`)}
            tick={t.axis}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide domain={[0, 100]} />
          <Tooltip
            contentStyle={t.tooltip}
            itemStyle={{ color: t.value }}
            labelStyle={{ color: t.label }}
            labelFormatter={(h) => (h === 0 ? "Now" : `In ${h} hours`)}
            formatter={(v) => [`${v}% risk`, "Forecast"]}
            cursor={{ stroke: line, strokeDasharray: "3 5" }}
          />
          <ReferenceArea y1={0} y2={33} fill={colors.low} fillOpacity={0.08} />
          <ReferenceArea y1={33} y2={66} fill={colors.med} fillOpacity={0.08} />
          <ReferenceArea y1={66} y2={100} fill={colors.high} fillOpacity={0.08} />
          <ReferenceLine y={33} stroke={t.refLine} strokeDasharray="2 6" />
          <ReferenceLine y={66} stroke={t.refLine} strokeDasharray="2 6" />
          <Area
            type="monotone"
            dataKey="risk"
            stroke={line}
            strokeWidth={2.5}
            fill={`url(#${id})`}
            dot={false}
            activeDot={{ r: 4, fill: line, stroke: t.dark ? "#000000" : "#ffffff", strokeWidth: 2 }}
            isAnimationActive={motionOK()}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
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
