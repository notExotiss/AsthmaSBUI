import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";

declare const __FIREBASE_API_KEY__: string;
declare const __FIREBASE_AUTH_DOMAIN__: string;
declare const __FIREBASE_PROJECT_ID__: string;
declare const __FIREBASE_STORAGE_BUCKET__: string;
declare const __FIREBASE_MESSAGING_SENDER_ID__: string;
declare const __FIREBASE_APP_ID__: string;

const config = {
  apiKey: __FIREBASE_API_KEY__,
  authDomain: __FIREBASE_AUTH_DOMAIN__,
  projectId: __FIREBASE_PROJECT_ID__,
  storageBucket: __FIREBASE_STORAGE_BUCKET__,
  messagingSenderId: __FIREBASE_MESSAGING_SENDER_ID__,
  appId: __FIREBASE_APP_ID__,
};

export const firebaseConfigured = Boolean(
  config.apiKey && config.authDomain && config.projectId && config.appId,
);

const firebaseApp = firebaseConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(config)
  : null;

export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const db = firebaseApp ? getFirestore(firebaseApp) : null;
export const storage = firebaseApp ? getStorage(firebaseApp) : null;
export const functions = firebaseApp ? getFunctions(firebaseApp, "us-central1") : null;
function decodeVapidKey(value: string) {
  const padded = value.padEnd(value.length + ((4 - value.length % 4) % 4), "=");
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}
export async function registerForPushNotifications(vapidKey: string, createIfMissing = false): Promise<PushSubscriptionJSON | null> {
  if (!firebaseApp || !vapidKey || typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) return null;
  const registration = await navigator.serviceWorker.register("/service-worker.js", { scope: "/" });
  await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  if (existing || !createIfMissing) return existing?.toJSON() || null;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: decodeVapidKey(vapidKey),
  });
  return subscription.toJSON();
}
export async function askGemini(question: string, language = "English") {
  if (!functions) throw new Error("Firebase Functions is not configured.");
  const call = httpsCallable<{ question: string; language: string }, { answer: string }>(functions, "askAboutRecords");
  const result = await call({ question, language });
  return result.data.answer;
}
export async function sendAccountTestNotification(title: string, body: string, page: string) {
  if (!functions) throw new Error("Firebase Functions is not configured.");
  const call = httpsCallable<
    { title: string; body: string; page: string },
    { devices: number; sent: number }
  >(functions, "sendTestNotification");
  const result = await call({ title, body, page });
  return result.data;
}
export async function copyPresentationAccountData() {
  if (!functions) throw new Error("Firebase Functions is not configured.");
  const call = httpsCallable<void, { copied: boolean; documents?: number; files?: number; reason?: string }>(functions, "copyPresentationAccountData");
  const result = await call();
  return result.data;
}
