import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, getFirestore, serverTimestamp } from "firebase/firestore";

const itemList = document.querySelector("#itemList");
const addItem = document.querySelector("#addItem");

export async function setupFirestore(app, auth) {
    const db = getFirestore(app);
    let thingsRef;

    onAuthStateChanged(auth, user => {
        if(user) {
            try {
                thingsRef = collection(db, "things");

                addItem.addEventListener("click", async () => {
                    const docRef = await addDoc(thingsRef, {
                        name: "walk dog",
                        priority: 3,
                        timestamp: serverTimestamp()
                    });
                    console.log("Document written with ID: ", docRef.id);
                })

            } catch (e) {
                console.error("Error adding document: ", e);
            }
        }
    })

    
}
