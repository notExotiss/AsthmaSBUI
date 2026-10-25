/* Extract from app.tsx: one measurement averages three live attempts. */

if (allAttempts.length < 3) {
  setAttemptNumber(allAttempts.length + 1);
  setCountdown(3);
  setPhase("countdown");
} else {
  const average = (key: string) =>
    allAttempts.reduce((sum, item) => sum + item[key], 0) /
    allAttempts.length;

  setCaptured({
    flow: average("flow"),
    pressure: average("pressure"),
    velocity: average("velocity"),
    attempts: allAttempts,
    sampleCount: allAttempts.reduce(
      (sum, item) => sum + item.sampleCount,
      0,
    ),
  });
  setPhase("complete");
}

/* The completed average is saved with its unit and three test values. */

const saveMeasurement = async () => {
  if (!captured || saving) return;

  setSaving(true);
  try {
    await onSave(captured.flow, notes.trim(), {
      unit: "L/min",
      source: "Arduino airflow sensor",
      pressurePa: captured.pressure,
      airVelocityMs: captured.velocity,
      attempts: captured.attempts.map((item) => item.flow),
      testReadings: captured.attempts.map((item) => ({
        flowLpm: item.flow,
        pressurePa: item.pressure,
        airVelocityMs: item.velocity,
      })),
    });
    setSaved(true);
  } finally {
    setSaving(false);
  }
};
