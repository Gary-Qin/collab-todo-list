import { onAuthStateChanged } from "firebase/auth";

export function setupRealtime(realtime, auth) {
    onAuthStateChanged(auth, user => {
        if(user) {
            console.log(user.uid);
        }
    })
}