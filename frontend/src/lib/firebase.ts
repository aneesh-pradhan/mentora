import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const missingFirebaseKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

function firebaseConfigError(): Error {
  return new Error(
    `Firebase is not configured (missing ${missingFirebaseKeys.join(
      ", "
    )}). Copy frontend/.env.example to frontend/.env.local and set the NEXT_PUBLIC_FIREBASE_* values.`
  );
}

export function getFirebaseApp(): FirebaseApp {
  if (missingFirebaseKeys.length > 0) {
    throw firebaseConfigError();
  }

  const existing = getApps()[0];
  if (existing) {
    return existing;
  }

  return initializeApp({
    apiKey: firebaseConfig.apiKey!,
    authDomain: firebaseConfig.authDomain!,
    projectId: firebaseConfig.projectId!,
    storageBucket: firebaseConfig.storageBucket!,
    messagingSenderId: firebaseConfig.messagingSenderId!,
    appId: firebaseConfig.appId!,
  });
}

export function getFirebaseDb(): Firestore {
  return getFirestore(getFirebaseApp());
}
