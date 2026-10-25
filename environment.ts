import { useEffect, useState } from "react";

export type EnvironmentPoint = {
  time: string;
  pm25: number | null;
  aqi: number | null;
  humidity: number | null;
  forecast: boolean;
};

export type EnvironmentState = {
  points: EnvironmentPoint[];
  loading: boolean;
  error: string;
  updatedAt: string | null;
};

const LATITUDE = 40.3793;
const LONGITUDE = -74.5465;
const TIMEZONE = "America/New_York";
const POLL_MS = 30 * 60 * 1000;

async function fetchEnvironment(signal: AbortSignal): Promise<EnvironmentPoint[]> {
  const params = new URLSearchParams({
    latitude: String(LATITUDE),
    longitude: String(LONGITUDE),
    timezone: "UTC",
    timeformat: "unixtime",
    past_days: "30",
    forecast_days: "2",
  });
  const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?${new URLSearchParams({ ...Object.fromEntries(params), hourly: "pm2_5,us_aqi" })}`;
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?${new URLSearchParams({ ...Object.fromEntries(params), hourly: "relative_humidity_2m" })}`;
  const [airResponse, weatherResponse] = await Promise.all([
    fetch(airUrl, { signal, cache: "no-store" }),
    fetch(weatherUrl, { signal, cache: "no-store" }),
  ]);
  if (!airResponse.ok || !weatherResponse.ok) throw new Error("Environmental data is unavailable.");
  const [air, weather] = await Promise.all([airResponse.json(), weatherResponse.json()]);
  const weatherByTime = new Map<string, number | null>();
  weather.hourly.time.forEach((time: number, index: number) => {
    weatherByTime.set(String(time), weather.hourly.relative_humidity_2m[index] ?? null);
  });
  const now = Date.now();
  return air.hourly.time.map((unixTime: number, index: number) => {
    const time = new Date(unixTime * 1000).toISOString();
    return {
      time,
      pm25: air.hourly.pm2_5[index] ?? null,
      aqi: air.hourly.us_aqi[index] ?? null,
      humidity: weatherByTime.get(String(unixTime)) ?? null,
      forecast: unixTime * 1000 > now,
    };
  }).filter((point: EnvironmentPoint) => point.pm25 !== null || point.aqi !== null || point.humidity !== null);
}

export function useEnvironmentData(): EnvironmentState {
  const [state, setState] = useState<EnvironmentState>({ points: [], loading: true, error: "", updatedAt: null });
  useEffect(() => {
    let active = true;
    let controller: AbortController | undefined;
    const load = async () => {
      controller?.abort();
      controller = new AbortController();
      try {
        const points = await fetchEnvironment(controller.signal);
        if (active) setState({ points, loading: false, error: "", updatedAt: new Date().toISOString() });
      } catch (error) {
        if (active && (error as Error).name !== "AbortError") {
          setState((current) => ({ ...current, loading: false, error: (error as Error).message || "Environmental data is unavailable." }));
        }
      }
    };
    void load();
    const interval = window.setInterval(load, POLL_MS);
    return () => { active = false; controller?.abort(); window.clearInterval(interval); };
  }, []);
  return state;
}

export const environmentAttribution = "Air quality: CAMS via Open-Meteo · Weather: Open-Meteo";

export type RiskTrendPoint = {
  time: string;
  label: string;
  risk: number;
  forecast: boolean;
};

type EnvironmentWindow = { aqi: number | null; pm25: number | null; humidity: number | null; samples: number };

function dailyMean(points: EnvironmentPoint[]) {
  const groups = new Map<string, EnvironmentPoint[]>();
  points.filter((point) => !point.forecast && new Date(point.time).getTime() <= Date.now()).forEach((point) => {
    const day = localDay(new Date(point.time));
    groups.set(day, [...(groups.get(day) || []), point]);
  });
  return new Map([...groups].map(([day, values]) => [day, {
    pm25: mean(values.map((point) => point.pm25)),
    aqi: mean(values.map((point) => point.aqi)),
    humidity: mean(values.map((point) => point.humidity)),
  }]));
}

function environmentWindow(points: EnvironmentPoint[], endTime: number, hours = 3): EnvironmentWindow | null {
  const startTime = endTime - hours * 60 * 60 * 1000;
  const windowPoints = points.filter((point) => {
    const time = new Date(point.time).getTime();
    return Number.isFinite(time) && time > startTime && time <= endTime;
  });
  if (!windowPoints.length) return null;
  return {
    aqi: mean(windowPoints.map((point) => point.aqi)),
    pm25: mean(windowPoints.map((point) => point.pm25)),
    humidity: mean(windowPoints.map((point) => point.humidity)),
    samples: windowPoints.length,
  };
}

function mean(values: Array<number | null>) {
  const numbers = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  return numbers.length ? numbers.reduce((total, value) => total + value, 0) / numbers.length : null;
}

function symptomOutcome(logs: Array<{ severity?: string; limitation?: string }>) {
  const levels = logs.flatMap((log) => {
    const severity = /severe/i.test(log.severity || "") ? 3 : /moderate/i.test(log.severity || "") ? 2 : /mild/i.test(log.severity || "") ? 1 : /^(none|no)$/i.test(log.severity || "") ? 0 : null;
    const limitation = /significant|a lot|severe/i.test(log.limitation || "") ? 3 : /some|moderate/i.test(log.limitation || "") ? 2 : /mild|slight|little/i.test(log.limitation || "") ? 1 : /^(none|no)$/i.test(log.limitation || "") ? 0 : null;
    return [severity, limitation].filter((value): value is number => value !== null);
  });
  return levels.length ? levels.reduce((sum, value) => sum + value, 0) / levels.length : null;
}

function solveLinearSystem(matrix: number[][], vector: number[]) {
  const size = vector.length;
  const rows = matrix.map((row, index) => [...row, vector[index]]);
  for (let column = 0; column < size; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < size; row += 1) {
      if (Math.abs(rows[row][column]) > Math.abs(rows[pivot][column])) pivot = row;
    }
    if (Math.abs(rows[pivot][column]) < 1e-10) return null;
    [rows[column], rows[pivot]] = [rows[pivot], rows[column]];
    const divisor = rows[column][column];
    for (let j = column; j <= size; j += 1) rows[column][j] /= divisor;
    for (let row = 0; row < size; row += 1) {
      if (row === column) continue;
      const factor = rows[row][column];
      for (let j = column; j <= size; j += 1) rows[row][j] -= factor * rows[column][j];
    }
  }
  return rows.map((row) => row[size]);
}

function localDay(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

function localHour(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: TIMEZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour")?.value || 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value || 0);
  return hour + minute / 60;
}

type FlowRecord = { time?: string; value?: number; unit?: string };

function latestFlowBefore(time: number, measurements: FlowRecord[], lookbackDays = 7) {
  return measurements
    .filter((item) => {
      const timestamp = item.time ? new Date(item.time).getTime() : NaN;
      return item.unit === "L/min" && Number.isFinite(timestamp) && timestamp <= time && timestamp >= time - lookbackDays * 86400000 && Number(item.value) > 0;
    })
    .sort((a, b) => new Date(b.time!).getTime() - new Date(a.time!).getTime())[0] || null;
}

function typicalFlowAtHour(hour: number, time: number, measurements: FlowRecord[]) {
  const available = measurements.filter((item) => {
    const timestamp = item.time ? new Date(item.time).getTime() : NaN;
    return item.unit === "L/min" && Number.isFinite(timestamp) && timestamp <= time && timestamp >= time - 30 * 86400000 && Number(item.value) > 0;
  });
  const overall = mean(available.map((item) => Number(item.value)));
  if (overall == null) return null;
  const nearby = available.filter((item) => {
    const delta = Math.abs(localHour(new Date(item.time!)) - hour);
    return Math.min(delta, 24 - delta) <= 2;
  });
  const timeOfDayMean = mean(nearby.map((item) => Number(item.value)));
  if (timeOfDayMean == null) return overall;
  // Shrink sparse time-of-day buckets toward the user's all-day baseline.
  const support = nearby.length / (nearby.length + 4);
  return timeOfDayMean * support + overall * (1 - support);
}

export function buildRiskTrend(
  points: EnvironmentPoint[],
  measurements: Array<{ time?: string; value?: number; unit?: string; environment?: { pm25: number | null; aqi: number | null; humidity: number | null } }>,
  logs: Array<{ time?: string; severity?: string; limitation?: string }>,
  personalBest: number | null,
): RiskTrendPoint[] {
  if (!points.length) return [];
  const byDay = dailyMean(points);
  measurements.forEach((item) => {
    if (!item.time || !item.environment) return;
    const day = localDay(new Date(item.time));
    if (!byDay.has(day)) byDay.set(day, item.environment);
  });
  const feature = (environment: { pm25: number | null; aqi: number | null; humidity: number | null }, readingPct: number | null, timeOfDayPct: number | null, timestamp: number) => {
    const hour = localHour(new Date(timestamp));
    const radians = hour / 24 * Math.PI * 2;
    return [
    environment.aqi,
    environment.pm25,
    environment.humidity,
    readingPct,
    timeOfDayPct,
    Math.sin(radians),
    Math.cos(radians),
  ];
  };
  const targetByDay = new Map<string, number>();
  const logsByDay = new Map<string, typeof logs>();
  logs.forEach((log) => {
    if (!log.time) return;
    const day = localDay(new Date(log.time));
    logsByDay.set(day, [...(logsByDay.get(day) || []), log]);
  });
  logsByDay.forEach((dayLogs, day) => {
    const outcome = symptomOutcome(dayLogs);
    if (outcome !== null) targetByDay.set(day, outcome);
  });
  const training = [...targetByDay.entries()].flatMap(([day, target]) => {
    const dayLogs = logsByDay.get(day) || [];
    const logTime = Math.max(...dayLogs.map((log) => log.time ? new Date(log.time).getTime() : NaN).filter(Number.isFinite));
    if (!Number.isFinite(logTime)) return [];
    const windowEnvironment = environmentWindow(points, logTime);
    const environment = windowEnvironment && windowEnvironment.samples >= 2
      ? windowEnvironment
      : byDay.get(day);
    if (!environment) return [];
    const reading = latestFlowBefore(logTime, measurements, 30);
    const typical = typicalFlowAtHour(localHour(new Date(logTime)), logTime, measurements);
    const readingValue = reading ? Number(reading.value) : null;
    const readingPct = personalBest && readingValue ? readingValue / personalBest * 100 : null;
    const timeOfDayPct = typical && readingValue ? (readingValue / typical - 1) * 100 : null;
    return [{ day, values: feature(environment, readingPct, timeOfDayPct, logTime), target }];
  });
  // Require enough distinct symptom days to fit a personal trend.
  if (training.length < 14) return [];
  const columns = 7;
  const columnMeans = Array.from({ length: columns }, (_, column) => {
    const observed = training.map((row) => row.values[column]).filter((value): value is number => value !== null);
    return observed.length ? observed.reduce((sum, value) => sum + value, 0) / observed.length : 0;
  });
  const columnScales = Array.from({ length: columns }, (_, column) => {
    const variance = training.reduce((sum, row) => sum + ((row.values[column] ?? columnMeans[column]) - columnMeans[column]) ** 2, 0) / training.length;
    return Math.sqrt(variance) || 1;
  });
  const rows = training.map((row) => [1, ...row.values.map((value, column) => Math.max(-2.5, Math.min(2.5, ((value ?? columnMeans[column]) - columnMeans[column]) / columnScales[column])))]);
  const latestTrainingDay = Math.max(...training.map((row) => new Date(`${row.day}T12:00:00`).getTime()));
  const rowWeights = training.map((row) => {
    const ageDays = Math.max(0, (latestTrainingDay - new Date(`${row.day}T12:00:00`).getTime()) / 86400000);
    return Math.exp(-ageDays / 45);
  });
  const dimension = columns + 1;
  const matrix = Array.from({ length: dimension }, () => Array(dimension).fill(0));
  const vector = Array(dimension).fill(0);
  rows.forEach((row, index) => {
    const weight = rowWeights[index];
    for (let i = 0; i < dimension; i += 1) {
      vector[i] += weight * row[i] * training[index].target;
      for (let j = 0; j < dimension; j += 1) matrix[i][j] += weight * row[i] * row[j];
    }
  });
  // Stronger ridge regularization limits swings from correlated pollutants
  // and small personal histories; the intercept remains the symptom baseline.
  for (let index = 1; index < dimension; index += 1) matrix[index][index] += 4;
  const weights = solveLinearSystem(matrix, vector);
  if (!weights) return [];
  // Keep effects directionally sensible: worse air cannot lower the score,
  // and lower flow cannot lower it. Humidity remains user-specific.
  const unconstrainedWeights = [...weights];
  // Small directional priors keep changing climate and airflow visible even
  // when the symptom history is too uniform to learn their effects itself.
  weights[1] = Math.max(0.12, weights[1]);
  weights[2] = Math.max(0.1, weights[2]);
  weights[4] = Math.min(-0.2, weights[4]);
  weights[5] = Math.min(-0.12, weights[5]);
  const totalWeight = rowWeights.reduce((sum, value) => sum + value, 0) || 1;
  for (let column = 1; column < dimension; column += 1) {
    const weightedFeatureMean = rows.reduce((sum, row, index) => sum + rowWeights[index] * row[column], 0) / totalWeight;
    weights[0] += (unconstrainedWeights[column] - weights[column]) * weightedFeatureMean;
  }
  const predict = (values: Array<number | null>) => {
    const row = [1, ...values.map((value, column) => Math.max(-2.5, Math.min(2.5, ((value ?? columnMeans[column]) - columnMeans[column]) / columnScales[column])))];
    const estimate = row.reduce((sum, value, column) => sum + value * weights[column], 0);
    // A smooth calibration avoids clipping every elevated prediction to 100,
    // while retaining meaningful separation between changing hourly inputs.
    const bounded = Math.max(-4, Math.min(7, estimate));
    const calibrated = 10 + 80 / (1 + Math.exp(-1.4 * (bounded - 1.5)));
    return Math.round(calibrated);
  };
  const result: RiskTrendPoint[] = [];
  const historyDays = [...targetByDay.keys()].sort().slice(-14);
  historyDays.forEach((day) => {
    const date = new Date(`${day}T12:00:00`);
    const time = `${day}T12:00`;
    const target = targetByDay.get(day)!;
    result.push({ time, label: new Intl.DateTimeFormat("en-US", { timeZone: TIMEZONE, weekday: "short" }).format(date), risk: Math.round(target / 3 * 100), forecast: false });
  });
  const now = Date.now();
  const recentByDay = new Map<string, { time: string; value: number }>();
  measurements.forEach((item) => {
    if (!item.time || item.unit !== "L/min" || !Number.isFinite(Number(item.value)) || Number(item.value) <= 0) return;
    const timestamp = new Date(item.time).getTime();
    if (timestamp < now - 7 * 86400000 || timestamp > now) return;
    const day = localDay(new Date(timestamp));
    const existing = recentByDay.get(day);
    if (!existing || item.time > existing.time) recentByDay.set(day, { time: item.time, value: Number(item.value) });
  });
  const observedDays = [...recentByDay.values()].map((item) => item.value);
  const forecastFlow = observedDays.length ? mean(observedDays) : null;
  const future = points.filter((point) => {
    const timestamp = new Date(point.time).getTime();
    return point.forecast && timestamp >= now && timestamp <= now + 24 * 60 * 60 * 1000;
  });
  // Use each hourly forecast point through the next day so the risk curve
  // follows the changing air and weather rather than a few sampled snapshots.
  future.forEach((point) => {
    const timestamp = new Date(point.time).getTime();
    const hour = Math.max(1, Math.round((timestamp - now) / 3600000));
    const rollingEnvironment = environmentWindow(points, timestamp);
    const forecastEnvironment = rollingEnvironment && rollingEnvironment.samples >= 2 ? rollingEnvironment : point;
    const typical = typicalFlowAtHour(localHour(new Date(timestamp)), timestamp, measurements);
    const expectedFlow = typical ?? forecastFlow;
    const readingPct = personalBest && expectedFlow !== null && expectedFlow !== undefined ? expectedFlow / personalBest * 100 : null;
    const timeOfDayPct = typical && forecastFlow !== null ? (forecastFlow / typical - 1) * 100 : null;
    result.push({
      time: point.time,
      label: `+${hour}h`,
      risk: predict(feature(forecastEnvironment, readingPct, timeOfDayPct, timestamp)),
      forecast: true,
    });
  });
  return result;
}

export function getCurrentEnvironment(points: EnvironmentPoint[]) {
  const now = Date.now();
  return points.filter((point) => new Date(point.time).getTime() <= now && (point.aqi !== null || point.pm25 !== null || point.humidity !== null)).at(-1) || null;
}
