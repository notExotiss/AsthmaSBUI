# AsthmaGuard SB

AsthmaGuard SB keeps symptom check-ins, breathing readings, medications, and care plans in a signed-in user's account. The app layout starts from the MayoCodes GitHub version, with the requested chat and wording changes.

## Run locally

1. Copy `.env.example` to `.env.local` and fill in the Firebase web configuration.
2. Install dependencies with `npm install`.
3. Build with `npm run build`.
4. Start the local server with `npm run serve` and open `http://127.0.0.1:4321`.

The Gemini API key is stored in Firebase Secret Manager and is never included in the browser bundle. To set or rotate it for another Firebase project, run `firebase functions:secrets:set GEMINI_API_KEY --project <project-id>` and enter the key when prompted.

## Firebase services

- Firebase Authentication provides email/password sign-in, account creation, password reset, and sign-out.
- Firestore stores account settings, symptom logs, measurements, medication entries, dose logs, chat messages, and care-plan metadata under each user's UID.
- Firebase Storage stores care-plan PDFs and images under each user's UID.
- Firestore and Storage rules restrict access to each user's own records and files.
- The authenticated `askAboutRecords` Cloud Function reads only the signed-in user's records and asks Gemini for an answer. If Gemini is unavailable, it returns a short summary from saved records.

The Firebase project is selected in `.firebaserc`. Deploy rules and functions with `firebase deploy --only firestore:rules,storage,functions --project asthmaguard-b68c1`.

## Chat

The Summary page has a floating chat button, four starter questions, follow-up suggestions, and a custom input. Chat history is saved to Firestore. The assistant uses records saved in the signed-in account. The send button is solid red; the chat has no grounded badge or research disclaimer header.

## Main files

- `app.tsx`: app pages and Firebase-backed flows.
- `auth-flow.tsx`: sign-in, account creation, and password reset screens.
- `firebase.ts` and `firebase-data.ts`: Firebase setup and account data operations.
- `functions/index.js`: authenticated Gemini chat function.
- `firestore.rules` and `storage.rules`: per-user access rules.
- `components/chat-assistant.tsx`: floating chat interface.
- `style.css`: app and chat styling.
- `dist/`: built app files.
