import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "halogen-appliance-84k5l",
  appId: "1:741205287002:web:5ecc5c54519f9690967863",
  apiKey: "AIzaSyCsD6BtMQq56zQvViJz1qj8xq6tpK6WJvQ",
  authDomain: "halogen-appliance-84k5l.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-37bc2c50-f576-4b00-a769-3780985e21a1",
  storageBucket: "halogen-appliance-84k5l.firebasestorage.app",
  messagingSenderId: "741205287002",
  measurementId: ""
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();
