import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

import { setupAuth } from "./auth.js";
import { setupFirestore } from "./firestore.js";
import { setupRealtime } from "./realtime.js";
import "./css/style.css";



const firebaseConfig = {
  apiKey: "AIzaSyB37to1BKw213Rau-8PVschGmERthH5M9c",
  authDomain: "collab-todo-list.firebaseapp.com",
  projectId: "collab-todo-list",
  storageBucket: "collab-todo-list.appspot.com",
  messagingSenderId: "573947151762",
  appId: "1:573947151762:web:43fe525890f50b0f79ad4b",
  measurementId: "G-NGC953BW7M",
  databaseURL: "https://collab-todo-list-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const realtime = getDatabase(app);

setupAuth(auth);
setupFirestore(firestore, auth);
setupRealtime(realtime, auth);
