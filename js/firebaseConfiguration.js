import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, get, set, ref, child, orderByChild, onValue } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getStorage, ref as sRef, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDGBV9s_-L23g0rCM9N48IvZVuhRaWMyX4",
  authDomain: "book-review-notebook.firebaseapp.com",
  projectId: "book-review-notebook",
  storageBucket: "book-review-notebook.appspot.com",
  messagingSenderId: "240784539463",
  appId: "1:240784539463:web:1e54be88165d676a5c1662",
  measurementId: "G-J66LNVCTVR"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase();
const auth = getAuth(app);
const dbref = ref(db);
const storage = getStorage();


export { app, db, auth, set, get, ref, dbref, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, child, sRef, uploadBytesResumable, getDownloadURL, storage, onValue };