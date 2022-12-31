import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAarU2Wx7AqsAc8b1LxmBB50xnSxOcJP8o",
  authDomain: "attendance-hub-36a03.firebaseapp.com",
  projectId: "attendance-hub-36a03",
  storageBucket: "attendance-hub-36a03.appspot.com",
  messagingSenderId: "955503916750",
  appId: "1:955503916750:web:fbeaa38790e9680aa7029f",
  measurementId: "G-9303X0SL1Q"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
