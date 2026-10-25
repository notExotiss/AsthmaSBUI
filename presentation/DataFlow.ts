/* Extract from app.tsx: attach the current regional conditions to a reading. */

await addMeasurement(user.uid, {
  time,
  value,
  notes,
  ...details,
  ...(currentEnvironment
    ? {
        environment: {
          pm25: currentEnvironment.pm25,
          aqi: currentEnvironment.aqi,
          humidity: currentEnvironment.humidity,
          sampledAt: currentEnvironment.time,
        },
      }
    : {}),
});

/* Extract from firebase-data.ts: readings are stored per user. */

export async function addMeasurement(
  uid: string,
  entry: Omit<MeasurementRecord, "id">,
) {
  await addDoc(userCollection(uid, "measurements"), entry);
}

/* Extract from environment.ts: load and periodically refresh regional data. */

const points = await fetchEnvironment(controller.signal);
if (active) {
  setState({
    points,
    loading: false,
    error: "",
    updatedAt: new Date().toISOString(),
  });
}
