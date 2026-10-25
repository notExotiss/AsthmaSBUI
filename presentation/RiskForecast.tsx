/* Extract from environment.ts: inputs paired with each symptom check-in. */

const feature = (
  environment: {
    aqi: number | null;
    pm25: number | null;
    humidity: number | null;
  },
  readingPct: number | null,
  timeOfDayPct: number | null,
  timestamp: number,
) => {
  const hour = localHour(new Date(timestamp));
  const radians = (hour / 24) * Math.PI * 2;

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

/* Each training row pairs logged symptoms with nearby climate and breathing. */

const reading = latestFlowBefore(logTime, measurements, 30);
const typical = typicalFlowAtHour(
  localHour(new Date(logTime)),
  logTime,
  measurements,
);
const readingPct =
  personalBest && reading
    ? Number(reading.value) / personalBest * 100
    : null;
const timeOfDayPct =
  typical && reading
    ? (Number(reading.value) / typical - 1) * 100
    : null;

return {
  day,
  values: feature(environment, readingPct, timeOfDayPct, logTime),
  target,
};

/* The personal model waits for at least 14 distinct symptom days. */

if (training.length < 14) return [];

/* Recency weighting and ridge regularization stabilize the fitted model. */

const rowWeights = training.map((row) => {
  const ageDays =
    (latestTrainingDay - new Date(`${row.day}T12:00:00`).getTime()) /
    86400000;
  return Math.exp(-Math.max(0, ageDays) / 45);
});

for (let index = 1; index < dimension; index += 1) {
  matrix[index][index] += 4;
}

const weights = solveLinearSystem(matrix, vector);
if (!weights) return [];

/* Predict at each hourly climate forecast point for the next 24 hours. */

future.forEach((point) => {
  const timestamp = new Date(point.time).getTime();
  const rollingEnvironment = environmentWindow(points, timestamp);
  const forecastEnvironment =
    rollingEnvironment && rollingEnvironment.samples >= 2
      ? rollingEnvironment
      : point;

  const typical = typicalFlowAtHour(
    localHour(new Date(timestamp)),
    timestamp,
    measurements,
  );
  const expectedFlow = typical ?? forecastFlow;
  const readingPct =
    personalBest && expectedFlow != null
      ? expectedFlow / personalBest * 100
      : null;
  const timeOfDayPct =
    typical && forecastFlow != null
      ? (forecastFlow / typical - 1) * 100
      : null;

  result.push({
    time: point.time,
    label: `+${Math.max(1, Math.round((timestamp - now) / 3600000))}h`,
    risk: predict(
      feature(forecastEnvironment, readingPct, timeOfDayPct, timestamp),
    ),
    forecast: true,
  });
});

/* Extract from app.tsx: choose a level and show the forecast graph. */

const forecastPoint = riskTrend
  .filter((point) => point.forecast)
  .reduce(
    (peak, point) => !peak || point.risk > peak.risk ? point : peak,
    null,
  );
const currentIndex = forecastPoint?.risk ?? null;
const level =
  currentIndex == null
    ? "Unavailable"
    : currentIndex >= 66
      ? "High"
      : currentIndex >= 33
        ? "Moderate"
        : "Low";

<RiskForecastChart data={riskTrend} language={language} />
