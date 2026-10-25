/* Extract from app.tsx: the Summary page composition. */

{page === "Summary" && (
  <>
    <div className="dashboard-grid">
      <ForecastCard
        riskTrend={riskTrend}
        currentEnvironment={currentEnvironment}
        loading={environmentData.loading}
        error={environmentData.error}
        includeHistoricalReadings={includeHistoricalReadings}
        language={language}
      />

      <Panel title={t("Today")} icon={ClipboardList} tone="plan">
        <PlanRows reminders={reminders} activity={outdoorActivity} />
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

    <div className="highlights-grid">
      <HighlightCard
        icon={Wind}
        color="#0a84ff"
        title={t("Breathing")}
        time={synced}
        onPress={() => nav("Take a Measurement")}
      >
        <div className="highlight-big">
          {latestDisplayedMeasurement
            ? Number(latestDisplayedMeasurement.value).toFixed(1)
            : "—"}
          <span>{latestDisplayedMeasurement?.unit || "L/min"}</span>
        </div>
        <div className="highlight-sub">
          Today {todayReadings.length} readings · 7-day average{" "}
          {weeklyReadingAverage == null
            ? "—"
            : weeklyReadingAverage.toFixed(1)}
        </div>
        <MeasurementTrendChart
          measurements={displayedMeasurements}
          includeHistoricalReadings={includeHistoricalReadings}
          language={language}
        />
      </HighlightCard>

      <HighlightCard
        icon={CloudSun}
        color="#ff9f0a"
        title={`${t("Climate")} · South Brunswick, NJ`}
        time="Live data"
        className="climate-highlight-card"
      >
        <ClimateTrendCharts data={trendRows} language={language} />
        <ClimateInsights
          trendRows={trendRows}
          points={environmentData.points}
          currentEnvironment={currentEnvironment}
          language={language}
        />
      </HighlightCard>

      <HighlightCard
        icon={Heart}
        color="#30d158"
        title="Show all trends"
        onPress={() => nav("Personal Patterns")}
        className="trends-action-card"
      />
    </div>
  </>
)}
