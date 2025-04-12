import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDCjHuUWxrzTr9le40T7M_qstdXpWNG55I",
  authDomain: "pre-registration-15d82.firebaseapp.com",
  projectId: "pre-registration-15d82",
  storageBucket: "pre-registration-15d82.appspot.com",
  messagingSenderId: "609443288655",
  appId: "1:609443288655:web:0affe6f76ababc1826bc3a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };