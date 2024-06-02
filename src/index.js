// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signOut, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const whenSignedIn = document.querySelector('#signedIn');
const whenSignedOut = document.querySelector('#signedOut');
const signInBtn = document.querySelector('#signInBtn');
const signOutBtn = document.querySelector('#signOutBtn');
const userInfo = document.querySelector('#userDetails');

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB37to1BKw213Rau-8PVschGmERthH5M9c",
  authDomain: "collab-todo-list.firebaseapp.com",
  projectId: "collab-todo-list",
  storageBucket: "collab-todo-list.appspot.com",
  messagingSenderId: "573947151762",
  appId: "1:573947151762:web:43fe525890f50b0f79ad4b",
  measurementId: "G-NGC953BW7M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// https://firebase.google.com/docs/auth/web/google-signin#web-modular-api_5
signInBtn.addEventListener("click", () => signInWithPopup(auth, provider)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    const user = result.user;
  }).catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    const email = error.customData.email;
    const credential = GoogleAuthProvider.credentialFromError(error);
  })
);

signOutBtn.addEventListener("click", () => signOut(auth)
  .then(() => {

  }).catch((error) => {

  })
);


onAuthStateChanged(auth, user => {
  if(user) {
    whenSignedIn.hidden = false;
    whenSignedOut.hidden = true;
    console.log(user);
    userDetails.textContent = `Hello ${user.displayName}!`;
  } else {
    whenSignedIn.hidden = true;
    whenSignedOut.hidden = false;
    userDetails.textContent = ``;
  }
});





console.log("goodbye");
console.log("hello");
console.log("test");