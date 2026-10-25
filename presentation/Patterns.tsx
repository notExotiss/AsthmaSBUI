/* Extract from app.tsx: the Trends page combines saved data and climate. */

<Panel
  title={translate("Air and weather")}
  icon={CloudSun}
>
  <EnvironmentTrendChart data={trendRows.slice(-30)} language={language} />
  <div className="trend-chart-legend climate-chart-legend">
    <span><i className="pm25" />PM2.5 · µg/m³</span>
    <span><i className="aqi" />AQI</span>
    <span><i className="humidity" />Humidity · %</span>
  </div>
  <TrendGeminiSummary
    kind="climate"
    rows={trendRows.slice(-30)}
    unit=""
    language={language}
  />
</Panel>

<Panel
  title={translate("Breathing and check-ins")}
  icon={Wind}
>
  <HealthTrendChart
    data={trendRows.slice(-30)}
    unit={measurements[0]?.unit || "L/min"}
    language={language}
  />
  <div className="trend-chart-legend">
    <span><i className="flow" />Breathing</span>
    <span><i className="severity" />Symptoms</span>
    <span><i className="limitation" />Limitation</span>
  </div>
  <TrendGeminiSummary
    kind="health"
    rows={trendRows.slice(-30)}
    unit={measurements[0]?.unit || "L/min"}
    language={language}
  />
</Panel>

/* Extract from environment.ts: personal forecasting requires 14 symptom days. */

if (training.length < 14) return [];
