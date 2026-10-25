/* Extract from app.tsx: fields collected in a symptom check-in. */

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

/* Extract from app.tsx: save the check-in under the signed-in account. */

onSave={async (entry: LogEntry) => {
  setLogs([entry, ...logs]);
  const { id: _id, ...record } = entry;
  await addSymptomLog(user.uid, record);
  toast.success("Check-in added to your log");
}}

/* Extract from firebase-data.ts: each user's logs are stored in Firestore. */

export async function addSymptomLog(
  uid: string,
  entry: Omit<SymptomLog, "id">,
) {
  await addDoc(userCollection(uid, "logs"), entry);
}
