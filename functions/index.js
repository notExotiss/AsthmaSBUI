const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const { getStorage } = require("firebase-admin/storage");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const webPush = require("web-push");

initializeApp();
const db = getFirestore();
const geminiKey = defineSecret("GEMINI_API_KEY");
const webPushPrivateKey = defineSecret("WEB_PUSH_PRIVATE_KEY");
const webPushVapidPublicKey = "BIoqpFpjG9F8G2y8X2PevJ5Yt6CyN84mC7OCOFoAW-tyTqkDqp2KJHTrZ8NfLluVX7mxi7JIiGVsqMUWNi0D-5E";

function remapCopiedValue(value, sourceUid, targetUid, sourcePrefix, targetPrefix) {
  if (typeof value === "string") {
    if (value === sourceUid) return targetUid;
    return value.startsWith(sourcePrefix) ? targetPrefix + value.slice(sourcePrefix.length) : value;
  }
  if (Array.isArray(value)) return value.map((item) => remapCopiedValue(item, sourceUid, targetUid, sourcePrefix, targetPrefix));
  if (!value || typeof value !== "object" || Object.getPrototypeOf(value) !== Object.prototype) return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, remapCopiedValue(item, sourceUid, targetUid, sourcePrefix, targetPrefix)]));
}

exports.copyPresentationAccountData = onCall({ region: "us-central1", timeoutSeconds: 540, memory: "1GiB" }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in to copy the account records.");
  const sourceAccount = await getAuth().getUser(request.auth.uid);
  if (sourceAccount.email?.trim().toLowerCase() !== "twoawesome9@gmail.com") {
    throw new HttpsError("permission-denied", "This copy is limited to the designated source account.");
  }
  const targetAccount = await getAuth().getUserByEmail("app@gmail.com").catch(() => null);
  if (!targetAccount) throw new HttpsError("not-found", "The destination account could not be found.");
  if (targetAccount.uid === sourceAccount.uid) throw new HttpsError("failed-precondition", "The source and destination accounts must differ.");

  const sourceUser = db.collection("users").doc(sourceAccount.uid);
  const targetUser = db.collection("users").doc(targetAccount.uid);
  const migrationRef = targetUser.collection("private").doc("presentationCopyState");
  const priorCopy = await migrationRef.get();
  if (priorCopy.exists) {
    const { documents = 0, files = 0 } = priorCopy.data();
    console.info("Presentation account data was already copied", { documents, files });
    return { copied: false, reason: "already-copied", documents, files };
  }

  const sourcePrefix = `users/${sourceAccount.uid}/`;
  const targetPrefix = `users/${targetAccount.uid}/`;
  const stats = { documents: 0, files: 0 };

  async function copyTree(sourceRef, targetRef) {
    const sourceSnapshot = await sourceRef.get();
    if (sourceSnapshot.exists) {
      const data = remapCopiedValue(sourceSnapshot.data(), sourceAccount.uid, targetAccount.uid, sourcePrefix, targetPrefix);
      if (sourceRef.path === `users/${sourceAccount.uid}/private/profile` && data && typeof data === "object") {
        data.email = targetAccount.email || "app@gmail.com";
      }
      await targetRef.set(data);
      stats.documents += 1;
    }

    const collections = await sourceRef.listCollections();
    for (const collection of collections) {
      // Push registrations identify a particular browser/device installation and
      // must remain attached only to the account that registered them.
      if (collection.id === "pushTokens" || collection.id === "pushSubscriptions") continue;
      const snapshot = await collection.get();
      for (let start = 0; start < snapshot.docs.length; start += 450) {
        const batch = db.batch();
        const page = snapshot.docs.slice(start, start + 450);
        for (const sourceDoc of page) {
          const data = remapCopiedValue(sourceDoc.data(), sourceAccount.uid, targetAccount.uid, sourcePrefix, targetPrefix);
          if (sourceDoc.ref.path === `users/${sourceAccount.uid}/private/profile` && data && typeof data === "object") {
            data.email = targetAccount.email || "app@gmail.com";
          }
          batch.set(targetRef.collection(collection.id).doc(sourceDoc.id), data);
          stats.documents += 1;
        }
        await batch.commit();
      }
      for (const sourceDoc of snapshot.docs) {
        await copyTree(sourceDoc.ref, targetRef.collection(collection.id).doc(sourceDoc.id));
      }
    }
  }

  await copyTree(sourceUser, targetUser);
  const bucket = getStorage().bucket();
  const [files] = await bucket.getFiles({ prefix: sourcePrefix });
  for (let start = 0; start < files.length; start += 20) {
    await Promise.all(files.slice(start, start + 20).map(async (file) => {
      const targetName = targetPrefix + file.name.slice(sourcePrefix.length);
      await file.copy(bucket.file(targetName));
      stats.files += 1;
    }));
  }

  await migrationRef.set({ completedAt: new Date().toISOString(), sourceUid: sourceAccount.uid, ...stats });
  console.info("Presentation account data copy completed", stats);
  return { copied: true, ...stats };
});
const reminderCopy = {
  English: {
    checkin: ["Daily check-in", "Take a moment to record how you are feeling."],
    measurement: ["Breathing reading", "Record a breathing measurement if it is a good time for you."],
  },
  Spanish: {
    checkin: ["Registro diario", "Tómate un momento para registrar cómo te sientes."],
    measurement: ["Medición respiratoria", "Registra una medición cuando te resulte conveniente."],
  },
  Hindi: {
    checkin: ["दैनिक लक्षण लॉग", "अपनी स्थिति दर्ज करने के लिए थोड़ा समय लें।"],
    measurement: ["साँस का माप", "सुविधा होने पर साँस का माप दर्ज करें।"],
  },
  Gujarati: {
    checkin: ["દૈનિક લક્ષણ નોંધ", "તમને કેવું લાગે છે તે નોંધવા થોડો સમય લો."],
    measurement: ["શ્વાસનું માપ", "અનુકૂળ હોય ત્યારે શ્વાસનું માપ નોંધો."],
  },
};

function localClock(timeZone, date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value || "00";
  return {
    day: `${get("year")}-${get("month")}-${get("day")}`,
    minute: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

async function sendUserPushNotifications(userDoc, message) {
  webPush.setVapidDetails("mailto:twoawesome9@gmail.com", webPushVapidPublicKey, webPushPrivateKey.value());
  const [tokenSnapshot, subscriptionSnapshot] = await Promise.all([
    userDoc.collection("pushTokens").get(),
    userDoc.collection("pushSubscriptions").get(),
  ]);
  const tokenDocs = tokenSnapshot.docs.filter((tokenDoc) => typeof tokenDoc.data().token === "string");
  const subscriptions = subscriptionSnapshot.docs.filter((doc) => doc.data().subscription?.endpoint);
  let sent = 0;
  const invalidRefs = [];
  for (const subscriptionDoc of subscriptions) {
    try {
      await webPush.sendNotification(subscriptionDoc.data().subscription, JSON.stringify(message), {
        TTL: 86400,
        urgency: "normal",
      });
      sent += 1;
    } catch (error) {
      if (error.statusCode === 404 || error.statusCode === 410) invalidRefs.push(subscriptionDoc.ref);
      else console.warn("Web push delivery failed", error.statusCode || "unknown");
    }
  }
  for (let start = 0; start < tokenDocs.length; start += 500) {
    const batch = tokenDocs.slice(start, start + 500);
    const response = await getMessaging().sendEachForMulticast({
      tokens: batch.map((tokenDoc) => tokenDoc.data().token),
      data: { title: message.title, body: message.body, page: message.page },
      webpush: { headers: { TTL: "86400" } },
    });
    sent += response.successCount;
    response.responses.forEach((result, index) => {
      const code = result.error?.code || "";
      if (["messaging/registration-token-not-registered", "messaging/invalid-registration-token"].includes(code)) {
        invalidRefs.push(batch[index].ref);
      }
    });
  }
  await Promise.all(invalidRefs.map((ref) => ref.delete()));
  return { devices: subscriptions.length + tokenDocs.length, sent };
}

exports.sendScheduledReminders = onSchedule({ schedule: "every 5 minutes", timeZone: "UTC", timeoutSeconds: 120, secrets: [webPushPrivateKey] }, async () => {
  const settings = await db.collectionGroup("private").where("reminders", "==", true).get();
  const now = new Date();
  for (const settingsDoc of settings.docs) {
    const userDoc = settingsDoc.ref.parent.parent;
    if (!userDoc) continue;
    const userId = userDoc.id;
    const preferences = settingsDoc.data();
    const language = Object.hasOwn(reminderCopy, preferences.language) ? preferences.language : "English";
    const timeZone = typeof preferences.timeZone === "string" ? preferences.timeZone : "America/New_York";
    let clock;
    try { clock = localClock(timeZone, now); } catch { clock = localClock("America/New_York", now); }
    const due = [
      { key: "check-in", field: "checkInDate", minute: 18 * 60, page: "check-in" },
      { key: "measurement", field: "measurementDate", minute: 19 * 60, page: "measurement" },
    ].filter((item) => clock.minute >= item.minute && clock.minute < item.minute + 60);
    if (!due.length) continue;
    const [tokensSnapshot, subscriptionsSnapshot] = await Promise.all([
      userDoc.collection("pushTokens").get(), userDoc.collection("pushSubscriptions").get(),
    ]);
    const hasTokens = tokensSnapshot.docs.some((tokenDoc) => typeof tokenDoc.data().token === "string");
    const hasSubscriptions = subscriptionsSnapshot.docs.some((doc) => doc.data().subscription?.endpoint);
    if (!hasTokens && !hasSubscriptions) continue;
    const stateRef = userDoc.collection("private").doc("reminderState");
    const state = (await stateRef.get()).data() || {};
    for (const reminder of due) {
      if (state[reminder.field] === clock.day) continue;
      const [title, body] = reminderCopy[language][reminder.key === "check-in" ? "checkin" : "measurement"];
      const result = await sendUserPushNotifications(userDoc, { title, body, page: reminder.page });
      if (result.sent > 0) {
        await stateRef.set({ [reminder.field]: clock.day, updatedAt: now.toISOString() }, { merge: true });
        state[reminder.field] = clock.day;
      }
    }
  }
});

exports.sendTestNotification = onCall({ region: "us-central1", timeoutSeconds: 30, secrets: [webPushPrivateKey] }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in to send a test notification.");
  const title = String(request.data?.title || "").trim();
  const body = String(request.data?.body || "").trim();
  const page = String(request.data?.page || "");
  const allowedPages = new Set(["Medications", "Take a Measurement", "Symptom & Medication Log"]);
  if (!title || title.length > 120 || !body || body.length > 500 || !allowedPages.has(page)) {
    throw new HttpsError("invalid-argument", "The notification content is invalid.");
  }

  const userDoc = db.collection("users").doc(request.auth.uid);
  return sendUserPushNotifications(userDoc, { title, body, page });
});

exports.askAboutRecords = onCall({ region: "us-central1", secrets: [geminiKey], timeoutSeconds: 60 }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in to ask about your records.");
  const question = String(request.data?.question || "").trim();
  const allowedLanguages = ["English", "Spanish", "Hindi", "Gujarati"];
  const language = allowedLanguages.includes(request.data?.language) ? request.data.language : "English";
  if (!question || question.length > 2000) throw new HttpsError("invalid-argument", "Enter a question under 2,000 characters.");
  const uid = request.auth.uid;
  const userRef = db.collection("users").doc(uid);
  const [profile, settings, logs, measurements, medications, doses] = await Promise.all([
    userRef.collection("private").doc("profile").get(),
    userRef.collection("private").doc("settings").get(),
    userRef.collection("logs").orderBy("time", "desc").limit(50).get(),
    userRef.collection("measurements").orderBy("time", "desc").limit(50).get(),
    userRef.collection("medications").limit(50).get(),
    userRef.collection("doses").orderBy("time", "desc").limit(50).get(),
  ]);
  const context = {
    profile: profile.data() || {}, settings: settings.data() || {},
    symptoms: logs.docs.map((d) => d.data()),
    measurements: measurements.docs.map((d) => d.data()),
    medications: medications.docs.map((d) => d.data()),
    doses: doses.docs.map((d) => d.data()),
  };
  const prompt = `Answer in ${language}, using clear natural language and the usual writing system for that language. Use only these saved account records. Use plain language: one direct answer, 2 or 3 short bullets with useful values, and one practical takeaway. Say clearly when information is missing. Do not diagnose, assess emergencies, or recommend medication changes. This is not medical advice.\nRecords: ${JSON.stringify(context)}\nQuestion: ${question}`;
  for (const model of ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.8-flash"]) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": geminiKey.value() },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      if (!response.ok) continue;
      const result = await response.json();
      const answer = result.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n").trim();
      if (answer) return { answer };
    } catch (error) {
      console.error("Assistant request failed", error?.message || "unknown error");
    }
  }
  const latest = context.measurements[0];
  const symptomSummary = context.symptoms.length
    ? `${context.symptoms.length}; ${context.symptoms[0].severity}`
    : "0";
  const readingSummary = latest ? String(latest.value) : "";
  const fallbacks = {
    English: ["Here is what your saved records show:", `- ${symptomSummary} symptom check-ins; latest reading ${readingSummary || "none saved"}.`, "Takeaway: keep logging symptoms and readings so changes are easier to review. This summary cannot diagnose or recommend treatment."],
    Spanish: ["Esto muestran tus registros guardados:", `- Registros de síntomas: ${symptomSummary}; última medición: ${readingSummary || "ninguna guardada"}.`, "Sugerencia: sigue registrando síntomas y mediciones para revisar los cambios. Este resumen no diagnostica ni recomienda tratamiento."],
    Hindi: ["आपके सहेजे गए रिकॉर्ड यह दिखाते हैं:", `- लक्षण लॉग: ${symptomSummary}; नवीनतम माप: ${readingSummary || "कोई सहेजा नहीं गया"}।`, "सुझाव: बदलावों की समीक्षा के लिए लक्षण और माप दर्ज करते रहें। यह सारांश निदान या उपचार की सलाह नहीं देता।"],
    Gujarati: ["તમારા સાચવેલા રેકોર્ડ આ બતાવે છે:", `- લક્ષણ નોંધ: ${symptomSummary}; તાજેતરનું માપ: ${readingSummary || "કોઈ સાચવ્યું નથી"}.`, "સૂચન: ફેરફારોની સમીક્ષા માટે લક્ષણો અને માપ નોંધતા રહો. આ સારાંશ નિદાન કે સારવારની સલાહ આપતો નથી."],
  };
  return { answer: fallbacks[language].join("\n") };
});
