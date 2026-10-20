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
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { observations } from "./mock";
const tooltip = {
  background: "#252833f2",
  border: "1px solid #ffffff26",
  borderRadius: 14,
  color: "#edf3ef",
  fontFamily: "Nunito Sans",
  fontSize: 11,
  boxShadow: "0 12px 30px #0005",
};
const axis = { fill: "#c4cce399", fontSize: 9, fontFamily: "Nunito Sans" };
const motion = () =>
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export function BreathingChart({
  missing = false,
  reading = 412,
}: {
  missing?: boolean;
  reading?: number;
}) {
  const id = useId().replace(/:/g, "");
  const data = observations.map((o, i) => ({
    day: o.day,
    value: i === 6 && !missing ? reading : o.reading,
  }));
  return (
    <div
      className="curve-chart"
      role="img"
      aria-label="Seven-day prototype measurement curve in arbitrary units. October 17 is unavailable."
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 15, right: 7, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#97e6d5" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#4c9e8b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="#ddfff014"
            strokeDasharray="2 6"
          />
          <XAxis
            dataKey="day"
            tick={axis}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v.replace("Oct ", "")}
            dy={8}
          />
          <YAxis hide domain={[380, 440]} />
          <Tooltip
            contentStyle={tooltip}
            itemStyle={{ color: "#f4e8df" }}
            labelStyle={{ color: "#c0cce5" }}
            formatter={(v) => [`${v} a.u.`, "Prototype"]}
            cursor={{ stroke: "#d6f9e62a", strokeDasharray: "3 6" }}
          />
          <ReferenceLine y={420} stroke="#d0f0da40" strokeDasharray="3 5" />
          <Area
            type="natural"
            dataKey="value"
            stroke="#b8f1dc"
            strokeWidth={2.5}
            fill={`url(#${id})`}
            connectNulls={false}
            dot={{ r: 3, fill: "#aee6cb", stroke: "#1f4b3a", strokeWidth: 2 }}
            activeDot={{
              r: 5,
              fill: "#ddfff0",
              stroke: "#7cc3a0",
              strokeWidth: 4,
            }}
            isAnimationActive={motion()}
          />
        </AreaChart>
      </ResponsiveContainer>
      {missing && <span className="historical-chart-label">SIMULATED HISTORY</span>}
    </div>
  );
}
export function PollutionChart({ compact = false }: { compact?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <div
      className={compact ? "pollution-chart mini-curve" : "pollution-chart"}
      role="img"
      aria-label="Simulated regional AQI over seven days: 42, 78, 91, 49, 83, 65, 86."
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={observations}
          margin={{ top: 10, right: 2, left: 2, bottom: 0 }}
        >
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f3b5df" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#e06cbe" stopOpacity={0} />
            </linearGradient>
          </defs>
          {!compact && (
            <XAxis
              dataKey="day"
              tick={axis}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v.slice(4)}
              dy={5}
            />
          )}
          <YAxis hide domain={[0, 110]} />
          <Tooltip
            contentStyle={tooltip}
            itemStyle={{ color: "#f4e8df" }}
            labelStyle={{ color: "#c0cce5" }}
            formatter={(v) => [v, "Demo AQI"]}
            cursor={false}
          />
          <Area
            dataKey="aqi"
            type="monotone"
            stroke="#f8bfdf"
            fill={`url(#${id})`}
            strokeWidth={2.5}
            activeDot={{ r: 4, fill: "#ffe6f6" }}
            isAnimationActive={motion()}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
const signal = [
  12, 7, 19, 13, 9, 16, 11, 24, 10, 13, 8, 18, 27, 14, 10, 18, 12, 9, 22, 13, 7,
  15, 20, 11,
];
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
  const data = signal.map((v, i) => ({
    time: i % 6 === 0 ? ["8:30", "8:45", "9:00", "9:15"][i / 6] : "",
    sample: i + 1,
    range: !live || i < (progress / 100) * 24 ? [-v, v] : [0, 0],
  }));
  return (
    <div
      className={small ? "signal-chart small-signal" : "signal-chart"}
      role="img"
      aria-label="Illustrative prototype signal. Simulated positive and negative sample amplitudes in arbitrary units."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 2, left: 2, bottom: 0 }}
          barCategoryGap="28%"
        >
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffb098" />
              <stop offset="50%" stopColor="#ec7654" />
              <stop offset="100%" stopColor="#ca523a" />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            tick={axis}
            axisLine={false}
            tickLine={false}
            interval={0}
            hide={small}
          />
          <YAxis hide domain={[-34, 34]} />
          <ReferenceLine y={0} stroke="#ffc7a732" strokeDasharray="2 7" />
          <Tooltip
            contentStyle={tooltip}
            itemStyle={{ color: "#f4e8df" }}
            labelStyle={{ color: "#c0cce5" }}
            labelFormatter={(_, payload) =>
              `Simulated sample ${payload?.[0]?.payload.sample || ""}`
            }
            formatter={(v: any) => [
              Array.isArray(v) ? `${v[0]} to ${v[1]} a.u.` : v,
              "Amplitude",
            ]}
            cursor={{ fill: "#ffffff08" }}
          />
          <Bar
            barSize={7}
            maxBarSize={7}
            dataKey="range"
            fill={`url(#${id})`}
            radius={[7, 7, 7, 7]}
            isAnimationActive={!live && motion()}
          >
            <Cell fill="#f1ba9e" fillOpacity={0.45} />
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
  return (
    <div
      className="completeness-gauge"
      role="img"
      aria-label="Six of seven sample days have explicit symptom logs. One day is missing."
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={Array.from({ length: 7 }, (_, i) => ({
              name: i < 6 ? "Logged day" : "Missing day",
              value: 1,
            }))}
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
            isAnimationActive={motion()}
          >
            {Array.from({ length: 7 }, (_, i) => (
              <Cell
                key={i}
                fill={
                  i < 6
                    ? [
                        "#00b89c",
                        "#00c7a7",
                        "#00d2ac",
                        "#29dcb5",
                        "#59e8bf",
                        "#88efd0",
                      ][i]
                    : "#d3e8db45"
                }
              />
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
export function SymptomBars({
  data = observations,
}: {
  data?: typeof observations;
}) {
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
            level:
              o.symptom === "Moderate"
                ? 2
                : o.symptom === "Mild"
                  ? 1
                  : o.symptom === "Not logged"
                    ? null
                    : 0,
          }))}
          margin={{ top: 10, right: 5, left: 5, bottom: 0 }}
        >
          <XAxis
            dataKey="day"
            tick={axis}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v.slice(4)}
          />
          <YAxis hide domain={[0, 3]} />
          <Tooltip
            contentStyle={tooltip}
            itemStyle={{ color: "#f4e8df" }}
            labelStyle={{ color: "#c0cce5" }}
            formatter={(_, __, p) => [p.payload.symptom, "Logged symptoms"]}
            cursor={{ fill: "#ffffff05" }}
          />
          <Bar
            dataKey="level"
            radius={[12, 12, 12, 12]}
            barSize={14}
            minPointSize={5}
            isAnimationActive={motion()}
          >
            {data.map((o, i) => (
              <Cell
                key={i}
                fill={o.symptom === "None" ? "#eac7a04d" : "#efab83"}
              />
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
  const ordinary = observations
    .filter((o,i) => o.reading !== null && i>0 && !observations[i-1].night && observations[i-1].symptom!=="Not logged")
    .map((o) => ({ day: Number(o.day.slice(4)), reading: o.reading }));
  const night = observations
    .filter((o,i) => o.reading!==null && i>0 && observations[i-1].night)
    .map((o) => ({ day: Number(o.day.slice(4)), reading: o.reading }));
  return (
    <div
      className="night-scatter"
      role="img"
      aria-label="Prototype readings by day. October 15, following the only nighttime symptom report, is highlighted in warm gold. No cause can be inferred."
    >
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 16, right: 15, left: 0, bottom: 1 }}>
          <CartesianGrid
            stroke="#d6dfff12"
            vertical={false}
            strokeDasharray="2 5"
          />
          <XAxis
            type="number"
            dataKey="day"
            domain={[11.5, 18.5]}
            ticks={[12, 14, 16, 18]}
            axisLine={false}
            tickLine={false}
            tick={axis}
          />
          <YAxis type="number" dataKey="reading" domain={[380, 440]} hide />
          <ZAxis range={[65, 65]} />
          <ReferenceLine y={420} stroke="#cadbff33" strokeDasharray="3 6" />
          <Tooltip
            contentStyle={tooltip}
            itemStyle={{ color: "#eef0ff" }}
            labelStyle={{ color: "#c4d1ed" }}
            cursor={{ stroke: "#b0c8ff33", strokeDasharray: "3 5" }}
            formatter={(v, name) => [
              v,
              name === "day" ? "October day" : "Prototype a.u.",
            ]}
          />
          <Scatter
            name="No prior-night waking"
            data={ordinary}
            fill="#a0bcff"
            fillOpacity={0.8}
            isAnimationActive={motion()}
          />
          <Scatter
            name="Prior-night waking"
            data={night}
            fill="#f4cf92"
            stroke="#ffe6b9"
            strokeWidth={3}
            isAnimationActive={motion()}
          />
        </ScatterChart>
      </ResponsiveContainer>
      <div className="scatter-key">
        <span>Blue · no prior-night waking</span>
        <span>Gold · prior-night waking</span>
      </div>
    </div>
  );
}
export function SymptomMix() {
  const parts = [
    { name: "Mild", value: 3, fill: "#f1b28f" },
    { name: "Moderate", value: 1, fill: "#e7805b" },
    { name: "Symptom-free", value: 2, fill: "#f5d7ad" },
    { name: "Unknown", value: 1, fill: "#c5a49440" },
  ];
  return (
    <div
      className="symptom-mix"
      role="img"
      aria-label="Seven-day symptom log breakdown: three mild, one moderate, two explicitly symptom-free, one unknown."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={[{ mild: 3, moderate: 1, none: 2, unknown: 1 }]}
          margin={{ top: 10, right: 1, left: 1, bottom: 0 }}
          barSize={22}
        >
          <XAxis type="number" domain={[0, 7]} hide />
          <YAxis type="category" hide />
          <Tooltip
            contentStyle={tooltip}
            labelFormatter={() => "7 sample days"}
            itemStyle={{ color: "#f5dbc9" }}
            formatter={(v, name) => [v, name]}
            cursor={false}
          />
          <Bar
            name="Mild"
            dataKey="mild"
            stackId="days"
            fill="#f1b28f"
            radius={[10, 0, 0, 10]}
            isAnimationActive={motion()}
          />
          <Bar
            name="Moderate"
            dataKey="moderate"
            stackId="days"
            fill="#e7805b"
            isAnimationActive={motion()}
          />
          <Bar
            name="Symptom-free"
            dataKey="none"
            stackId="days"
            fill="#f5d7ad"
            isAnimationActive={motion()}
          />
          <Bar
            name="Unknown"
            dataKey="unknown"
            stackId="days"
            fill="#c5a49455"
            radius={[0, 10, 10, 0]}
            isAnimationActive={motion()}
          />
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
