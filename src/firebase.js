import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; 

const firebaseConfig = {
  apiKey: "AIzaSyDCjHuUWxrzTr9le40T7M_qstdXpWNG55I",
  authDomain: "pre-registration-15d82.firebaseapp.com",
  projectId: "pre-registration-15d82",
  storageBucket: "pre-registration-15d82.appspot.com",
  messagingSenderId: "609443288655",
  appId: "1:609443288655:web:0affe6f76ababc1826bc3a"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app); 
export const auth = getAuth(app);