import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

const signOutBtn = document.querySelector('#signOutBtn');

export function setupPresence(firestore, auth) {
    let userFirestoreRef;
    const isOffline = {
        "status.last_changed": serverTimestamp(),
        "status.state": "offline"
    };

    const isOnline = {
        "status.last_changed": serverTimestamp(),
        "status.state": "online"
    }
    
    onAuthStateChanged(auth, user => {
        if(user) {
            userFirestoreRef = doc(firestore, "users", user.uid)
            updateDoc(userFirestoreRef, isOnline, { merge: true })

            signOutBtn.addEventListener("click", async () => {
                await updateDoc(userFirestoreRef, isOffline, { merge: true });
                signOut(auth).then(() => {
                    // Sign out successful
                }).catch((error) => {
                    // Sign out failed
                })
            });
            
            window.addEventListener('visibilitychange', () => {
                if(document.visibilityState === "hidden") {
                    updateDoc(userFirestoreRef, isOffline, { merge: true })
                }
                else {
                    updateDoc(userFirestoreRef, isOnline, { merge: true })
                }
            })

            window.addEventListener('beforeunload', () => {
                updateDoc(userFirestoreRef, isOffline, { merge: true })
            });
        }
    })

}