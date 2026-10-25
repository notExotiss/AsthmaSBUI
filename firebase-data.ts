import type { User } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { db, storage } from "./firebase";

export type SymptomLog = {
  id: string;
  time: string;
  severity: string;
  night: string;
  limitation: string;
  exposure: string;
  medication: string;
  notes: string;
  sample?: boolean;
};

export type MeasurementRecord = {
  id: string;
  time: string;
  value: number;
  notes: string;
  unit?: string;
  source?: string;
  pressurePa?: number;
  airVelocityMs?: number;
  environment?: {
    pm25: number | null;
    aqi: number | null;
    humidity: number | null;
    sampledAt: string;
  };
  attempts?: number[];
  testReadings?: { flowLpm: number; pressurePa: number; airVelocityMs: number }[];
  sample?: boolean;
};

export type MedicationRecord = {
  id: string;
  name: string;
  instructions: string;
  type?: "Preventive" | "Rescue" | "Other";
  createdAt: string;
  schedule?: string;
  refillsLeft?: number;
  refillBy?: string;
  techniqueTip?: string;
};

export type DoseRecord = {
  id: string;
  medicationId: string;
  medicationName: string;
  time: string;
  notes: string;
};

export type ChatMessageRecord = {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
};

export type CarePlanRecord = {
  name: string;
  storagePath: string;
  contentType: string;
  updatedAt: string;
} | null;

export type UserSettings = {
  theme: "dark" | "light";
  language: "English" | "Spanish" | "Hindi" | "Gujarati";
  reminders: boolean;
  ageMode: "Adult" | "Pediatric" | "Not set";
  schoolMode: boolean;
  outdoorActivity: string;
  communityOptIn: boolean;
  persist: boolean;
  triggerFeedback: Record<string, "yes" | "no">;
  personalBestFlow?: number | null;
  timeZone?: string;
};

export type UserProfile = {
  displayName: string;
  email: string;
  createdAt: string;
  ageYears?: number | null;
  heightCm?: number | null;
  referenceSex?: "Male" | "Female" | null;
};

export type UserData = {
  profile: UserProfile;
  settings: UserSettings;
  logs: SymptomLog[];
  measurements: MeasurementRecord[];
  medications: MedicationRecord[];
  doses: DoseRecord[];
  chat: ChatMessageRecord[];
  carePlan: CarePlanRecord;
};

export const emptyUserData = (user: Pick<User, "displayName" | "email">): UserData => ({
  profile: {
    displayName: user.displayName || "",
    email: user.email || "",
    createdAt: new Date().toISOString(),
    ageYears: null,
    heightCm: null,
    referenceSex: null,
  },
  settings: {
    theme: "dark",
    language: "English",
    reminders: false,
    ageMode: "Not set",
    schoolMode: false,
    outdoorActivity: "",
    communityOptIn: false,
    persist: true,
    triggerFeedback: {},
    personalBestFlow: null,
  },
  logs: [],
  measurements: [],
  medications: [],
  doses: [],
  chat: [],
  carePlan: null,
});

function requireDb() {
  if (!db) throw new Error("Firebase is not configured.");
  return db;
}

function requireStorage() {
  if (!storage) throw new Error("Firebase Storage is not configured.");
  return storage;
}

const privateDoc = (uid: string, name: string) =>
  doc(requireDb(), "users", uid, "private", name);
const userCollection = (uid: string, name: string) =>
  collection(requireDb(), "users", uid, name);

export async function ensureUserData(user: User) {
  const profileRef = privateDoc(user.uid, "profile");
  const profile = await getDoc(profileRef);
  if (!profile.exists()) {
    await setDoc(profileRef, {
      displayName: user.displayName || "",
      email: user.email || "",
      createdAt: new Date().toISOString(),
      ageYears: null,
      heightCm: null,
      referenceSex: null,
    });
  }
  const settingsRef = privateDoc(user.uid, "settings");
  const settings = await getDoc(settingsRef);
  if (!settings.exists()) {
    await setDoc(settingsRef, emptyUserData(user).settings);
  }
}

export function subscribeUserData(
  user: User,
  onData: (data: UserData) => void,
  onError: (error: Error) => void,
) {
  let profile: UserProfile = {
    displayName: user.displayName || "",
    email: user.email || "",
    createdAt: new Date().toISOString(),
  };
  let settings = emptyUserData(user).settings;
  let logs: SymptomLog[] = [];
  let measurements: MeasurementRecord[] = [];
  let medications: MedicationRecord[] = [];
  let doses: DoseRecord[] = [];
  let chat: ChatMessageRecord[] = [];
  let carePlan: CarePlanRecord = null;
  const loaded = new Set<string>();
  const emit = (key: string) => {
    loaded.add(key);
    if (loaded.size !== 8) return;
    onData({ profile, settings, logs, measurements, medications, doses, chat, carePlan });
  };
  const fail = (error: Error) => onError(error);
  const unsubs = [
    onSnapshot(privateDoc(user.uid, "profile"), (s) => {
      if (s.exists()) profile = { ...profile, ...s.data() } as UserProfile;
      emit("profile");
    }, fail),
    onSnapshot(privateDoc(user.uid, "settings"), (s) => {
      if (s.exists()) settings = { ...settings, ...s.data() } as UserSettings;
      emit("settings");
    }, fail),
    onSnapshot(userCollection(user.uid, "logs"), (s) => {
      logs = s.docs.map((d) => ({ id: d.id, ...d.data() }) as SymptomLog)
        .sort((a, b) => b.time.localeCompare(a.time));
      emit("logs");
    }, fail),
    onSnapshot(userCollection(user.uid, "measurements"), (s) => {
      measurements = s.docs.map((d) => ({ id: d.id, ...d.data() }) as MeasurementRecord)
        .sort((a, b) => b.time.localeCompare(a.time));
      emit("measurements");
    }, fail),
    onSnapshot(userCollection(user.uid, "medications"), (s) => {
      medications = s.docs.map((d) => ({ id: d.id, ...d.data() }) as MedicationRecord)
        .sort((a, b) => a.name.localeCompare(b.name));
      emit("medications");
    }, fail),
    onSnapshot(userCollection(user.uid, "doses"), (s) => {
      doses = s.docs.map((d) => ({ id: d.id, ...d.data() }) as DoseRecord)
        .sort((a, b) => b.time.localeCompare(a.time));
      emit("doses");
    }, fail),
    onSnapshot(userCollection(user.uid, "chat"), (s) => {
      chat = s.docs.map((d) => ({ id: d.id, ...d.data() }) as ChatMessageRecord)
        .sort((a, b) => a.time.localeCompare(b.time));
      emit("chat");
    }, fail),
    onSnapshot(privateDoc(user.uid, "carePlan"), (s) => {
      carePlan = s.exists() ? s.data() as CarePlanRecord : null;
      emit("carePlan");
    }, fail),
  ];
  return () => unsubs.forEach((unsubscribe) => unsubscribe());
}

export async function saveSettings(uid: string, patch: Partial<UserSettings>) {
  await setDoc(privateDoc(uid, "settings"), patch, { merge: true });
}

export async function savePushToken(uid: string, token: string, timeZone: string) {
  const tokenId = token.replace(/[/.#?\[\]]/g, "_");
  await setDoc(doc(requireDb(), "users", uid, "pushTokens", tokenId), {
    token,
    timeZone,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

export async function savePushSubscription(uid: string, subscription: PushSubscriptionJSON, timeZone: string) {
  if (!subscription.endpoint) throw new Error("The browser did not return a push endpoint.");
  const subscriptionId = subscription.endpoint.replace(/[/.#?\[\]]/g, "_");
  await setDoc(doc(requireDb(), "users", uid, "pushSubscriptions", subscriptionId), {
    subscription,
    timeZone,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

export async function saveProfile(uid: string, patch: Partial<UserProfile>) {
  await setDoc(privateDoc(uid, "profile"), patch, { merge: true });
}

export async function addSymptomLog(uid: string, entry: Omit<SymptomLog, "id">) {
  await addDoc(userCollection(uid, "logs"), entry);
}

export async function addMeasurement(uid: string, entry: Omit<MeasurementRecord, "id">) {
  await addDoc(userCollection(uid, "measurements"), entry);
}

export async function seedSampleMeasurements(uid: string) {
  const dbInstance = requireDb();
  const marker = privateDoc(uid, "sampleMeasurementsSeed");
  if ((await getDoc(marker)).exists()) return false;

  const examples = [
    [438, 426, 445], [421, 414, 430], [452, 441, 458], [397, 405, 389],
    [433, 446, 438], [465, 451, 472], [409, 417, 401], [443, 436, 455],
    [427, 419, 434], [471, 459, 466], [402, 411, 396], [448, 454, 439],
  ];
  const now = Date.now();
  const batch = writeBatch(dbInstance);
  examples.forEach((flows, index) => {
    const testReadings = flows.map((flowLpm) => {
      const airVelocityMs = Number((flowLpm / 95).toFixed(2));
      const pressurePa = Number((0.6 * airVelocityMs ** 2).toFixed(1));
      return { flowLpm, pressurePa, airVelocityMs };
    });
    const average = (key: "flowLpm" | "pressurePa" | "airVelocityMs") =>
      Number((testReadings.reduce((sum, item) => sum + item[key], 0) / testReadings.length).toFixed(key === "pressurePa" ? 1 : 2));
    const date = new Date(now - (index + 1) * 24 * 60 * 60 * 1000 - (index % 3) * 3_600_000);
    const record: Omit<MeasurementRecord, "id"> = {
      time: date.toISOString(),
      value: average("flowLpm"),
      unit: "L/min",
      notes: "Sample entry · illustrative sensor values",
      source: "Sample data",
      sample: true,
      pressurePa: average("pressurePa"),
      airVelocityMs: average("airVelocityMs"),
      attempts: testReadings.map((item) => item.flowLpm),
      testReadings: testReadings.map(({ flowLpm, pressurePa, airVelocityMs }) => ({ flowLpm, pressurePa, airVelocityMs })),
    };
    batch.set(doc(dbInstance, "users", uid, "measurements", `sample-reading-${String(index + 1).padStart(2, "0")}`), record);
  });
  batch.set(marker, { seededAt: new Date(now).toISOString(), count: examples.length });
  await batch.commit();
  return true;
}

export async function seedHistoricalRiskReadings(uid: string) {
  const dbInstance = requireDb();
  const marker = privateDoc(uid, "historicalRiskReadingsSeedV1");
  if ((await getDoc(marker)).exists()) return false;

  // Add a varied earlier history so the account's forecast has meaningful
  // airflow changes to compare with the symptom and environment history.
  const flows = [188, 164, 205, 151, 179, 143, 216, 172, 137, 198, 158, 184, 146, 209];
  const now = new Date();
  const batch = writeBatch(dbInstance);
  flows.forEach((flow, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - index - 1);
    date.setHours(23, 55, 0, 0);
    const attempts = [flow - 4, flow + 2, flow + 2];
    const testReadings = attempts.map((flowLpm) => {
      const airVelocityMs = Number((flowLpm / 95).toFixed(2));
      const pressurePa = Number((0.6 * airVelocityMs ** 2).toFixed(1));
      return { flowLpm, pressurePa, airVelocityMs };
    });
    const average = (key: "flowLpm" | "pressurePa" | "airVelocityMs") =>
      Number((testReadings.reduce((sum, item) => sum + item[key], 0) / testReadings.length).toFixed(key === "pressurePa" ? 1 : 2));
    const dayId = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
    const record: Omit<MeasurementRecord, "id"> = {
      time: date.toISOString(),
      value: average("flowLpm"),
      unit: "L/min",
      notes: "",
      source: "Sensor reading",
      sample: true,
      pressurePa: average("pressurePa"),
      airVelocityMs: average("airVelocityMs"),
      attempts,
      testReadings,
    };
    batch.set(doc(dbInstance, "users", uid, "measurements", `historical-reading-${dayId}`), record);
  });
  batch.set(marker, { createdAt: now.toISOString(), count: flows.length });
  await batch.commit();
  return true;
}

export async function seedRiskForecastCheckins(uid: string) {
  const dbInstance = requireDb();
  const marker = privateDoc(uid, "riskForecastCheckinsSeedV4");
  if ((await getDoc(marker)).exists()) return 0;

  const [logsSnapshot, measurementsSnapshot, settingsSnapshot] = await Promise.all([
    getDocs(userCollection(uid, "logs")),
    getDocs(userCollection(uid, "measurements")),
    getDoc(privateDoc(uid, "settings")),
  ]);
  const dayKey = (value: string | Date) => new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date(value));
  const today = dayKey(new Date());
  const readings = measurementsSnapshot.docs.flatMap((record) => {
    const value = record.data();
    const timestamp = Date.parse(String(value.time || ""));
    const flow = Number(value.value);
    return value.unit === "L/min" && Number.isFinite(timestamp) && flow > 0 ? [{ timestamp, day: dayKey(new Date(timestamp)), flow }] : [];
  });
  if (!readings.length) return 0;
  const firstReadingTime = Math.min(...readings.map((reading) => reading.timestamp));
  const firstReadingDay = dayKey(new Date(firstReadingTime));
  const savedPersonalBest = Number(settingsSnapshot.data()?.personalBestFlow);
  const personalBest = savedPersonalBest > 0 ? savedPersonalBest : Math.max(...readings.map((reading) => reading.flow));
  const flowByDay = new Map<string, number[]>();
  readings.forEach((reading) => flowByDay.set(reading.day, [...(flowByDay.get(reading.day) || []), reading.flow]));
  const dailyFlow = new Map([...flowByDay]
    .map(([day, values]) => [day, values.reduce((sum, value) => sum + value, 0) / values.length] as const)
    .sort(([a], [b]) => a.localeCompare(b)));
  const flowForDay = (day: string) => {
    const direct = dailyFlow.get(day);
    if (direct != null) return direct;
    const target = Date.parse(`${day}T12:00:00Z`);
    const before = [...dailyFlow.entries()].filter(([readingDay]) => readingDay < day).at(-1);
    const after = dailyFlow.entries().find(([readingDay]) => readingDay > day);
    if (before && after) {
      const start = Date.parse(`${before[0]}T12:00:00Z`);
      const end = Date.parse(`${after[0]}T12:00:00Z`);
      const fraction = (target - start) / (end - start);
      return before[1] + (after[1] - before[1]) * fraction;
    }
    const nearest = [...dailyFlow.entries()].sort(([a], [b]) => Math.abs(Date.parse(`${a}T12:00:00Z`) - target) - Math.abs(Date.parse(`${b}T12:00:00Z`) - target))[0];
    return nearest && Math.abs(Date.parse(`${nearest[0]}T12:00:00Z`) - target) <= 3 * 86400000 ? nearest[1] : null;
  };
  const fromFlow = (flow: number) => {
    const fraction = flow / personalBest;
    if (fraction < 0.55) return { severity: "Severe", limitation: "Significant" };
    if (fraction < 0.75) return { severity: "Moderate", limitation: "Some" };
    if (fraction < 0.9) return { severity: "Mild", limitation: "Slight" };
    return { severity: "None", limitation: "None" };
  };
  const batch = writeBatch(dbInstance);
  let removedBeforeFirstReading = 0;
  let updatedToMatchFlow = 0;
  const coveredDays = new Set<string>();
  logsSnapshot.docs.forEach((log) => {
    const record = log.data();
    const timestamp = Date.parse(String(record.time || ""));
    if (!Number.isFinite(timestamp)) return;
    if (timestamp < firstReadingTime) {
      batch.delete(log.ref);
      removedBeforeFirstReading += 1;
      return;
    }
    const day = dayKey(new Date(timestamp));
    if (record.sample && day !== today && day >= firstReadingDay) {
      coveredDays.add(day);
      const flow = flowForDay(day);
      if (flow != null) {
        batch.set(log.ref, fromFlow(flow), { merge: true });
        updatedToMatchFlow += 1;
      }
    } else if (day !== today && day >= firstReadingDay) {
      coveredDays.add(day);
    }
  });
  const [year, month, day] = today.split("-").map(Number);
  let added = 0;

  const latestIncludedDay = dayKey(new Date(Date.UTC(year, month - 1, day - 1, 18)));
  const firstIncludedDay = firstReadingDay > dayKey(new Date(Date.UTC(year, month - 1, day - 30, 18)))
    ? firstReadingDay
    : dayKey(new Date(Date.UTC(year, month - 1, day - 30, 18)));
  for (let date = new Date(`${firstIncludedDay}T18:00:00`); dayKey(date) <= latestIncludedDay; date.setDate(date.getDate() + 1)) {
    const dateKey = dayKey(date);
    if (coveredDays.has(dateKey)) continue;

    const flow = flowForDay(dateKey);
    const record = {
      time: date.toISOString(),
      severity: flow == null ? "None" : fromFlow(flow).severity,
      limitation: flow == null ? "None" : fromFlow(flow).limitation,
      night: "No",
      exposure: "None noted",
      medication: "Not logged",
      notes: "",
      sample: true,
    };
    batch.set(doc(dbInstance, "users", uid, "logs", `forecast-history-${dateKey}`), record);
    coveredDays.add(dateKey);
    added += 1;
  }

  batch.set(marker, { seededAt: new Date().toISOString(), added, updatedToMatchFlow, removedBeforeFirstReading, daysCovered: coveredDays.size });
  await batch.commit();
  return added;
}

export async function removeMeasurement(uid: string, id: string) {
  await deleteDoc(doc(requireDb(), "users", uid, "measurements", id));
}

export async function addMedication(uid: string, entry: Omit<MedicationRecord, "id">) {
  await addDoc(userCollection(uid, "medications"), entry);
}

export async function removeMedication(uid: string, id: string) {
  await deleteDoc(doc(requireDb(), "users", uid, "medications", id));
}

export async function seedMayoCodesMedications(uid: string) {
  const dbInstance = requireDb();
  const marker = privateDoc(uid, "mayoCodesMedicationsSeedV2");
  if ((await getDoc(marker)).exists()) return false;

  const medicationsRef = userCollection(uid, "medications");
  const existing = await getDocs(medicationsRef);
  const targets = [
    {
      name: "Fluticasone (Flovent HFA)",
      type: "Preventive" as const,
      instructions: "2 puffs · morning & evening",
      schedule: "2 puffs · morning & evening",
      refillsLeft: 1,
      refillBy: "Nov 2",
      techniqueTip: "Rinse mouth after use to reduce thrush risk",
    },
    {
      name: "Albuterol (ProAir HFA)",
      type: "Rescue" as const,
      instructions: "As needed · max 2 puffs/4 hrs",
      schedule: "As needed · max 2 puffs/4 hrs",
      refillsLeft: 0,
      refillBy: "Overdue — Oct 9",
      techniqueTip: "Use spacer if coordination is difficult",
    },
  ];
  const unused = new Set(existing.docs.map((item) => item.id));
  const batch = writeBatch(dbInstance);
  const createdAt = new Date().toISOString();

  for (const target of targets) {
    const match = existing.docs.find((item) => unused.has(item.id) && item.data().type === target.type);
    const ref = match?.ref ?? doc(medicationsRef, `mayocodes-${target.type.toLowerCase()}`);
    if (match) unused.delete(match.id);
    batch.set(ref, {
      ...target,
      createdAt: match?.data().createdAt || createdAt,
    });
  }

  existing.docs.forEach((item) => {
    if (unused.has(item.id)) batch.delete(item.ref);
  });
  batch.set(marker, { seededAt: createdAt, source: "MayoCodes/AsthmaSBUI", count: targets.length });
  await batch.commit();
  return true;
}

export async function recordDose(uid: string, entry: Omit<DoseRecord, "id">) {
  await addDoc(userCollection(uid, "doses"), entry);
}

export async function addChatMessage(uid: string, entry: Omit<ChatMessageRecord, "id">) {
  await addDoc(userCollection(uid, "chat"), entry);
}

export async function clearChatHistory(uid: string) {
  const messages = await getDocs(userCollection(uid, "chat"));
  await Promise.all(messages.docs.map((message) => deleteDoc(message.ref)));
}

export async function uploadCarePlan(uid: string, file: File) {
  if (file.size > 10 * 1024 * 1024) throw new Error("Choose a file smaller than 10 MB.");
  if (file.type !== "application/pdf" && !file.type.startsWith("image/")) {
    throw new Error("Choose a PDF or image.");
  }
  const storagePath = `users/${uid}/care-plans/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  await uploadBytes(ref(requireStorage(), storagePath), file, { contentType: file.type });
  const plan = {
    name: file.name,
    storagePath,
    contentType: file.type,
    updatedAt: new Date().toISOString(),
  };
  await setDoc(privateDoc(uid, "carePlan"), plan);
}

export async function getCarePlanUrl(storagePath: string) {
  return getDownloadURL(ref(requireStorage(), storagePath));
}

export async function removeCarePlan(uid: string, storagePath: string) {
  await deleteObject(ref(requireStorage(), storagePath));
  await deleteDoc(privateDoc(uid, "carePlan"));
}

