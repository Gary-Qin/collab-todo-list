import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";

const whenSignedIn = document.querySelector('#signedIn');
const whenSignedOut = document.querySelector('#signedOut');
const signInBtn = document.querySelector('#signInBtn');
const userDetails = document.querySelector('#userDetails');

export function setupAuth(auth) {
    const provider = new GoogleAuthProvider();

    // https://firebase.google.com/docs/auth/web/google-signin#web-modular-api_5
    signInBtn.addEventListener("click", () => signInWithPopup(auth, provider)
        .then((result) => {
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

    onAuthStateChanged(auth, user => {
        if(user) {
            whenSignedIn.hidden = false;
            whenSignedOut.hidden = true;
            userDetails.textContent = `Hello ${user.displayName}!`;
        } else {
            whenSignedIn.hidden = true;
            whenSignedOut.hidden = false;
            userDetails.textContent = ``;
        }
    });
};