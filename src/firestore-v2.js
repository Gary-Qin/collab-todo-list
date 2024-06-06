import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

async function findUsersLists(user, db) {
    const usersSnap = await getDoc(doc(db, "users", user.uid));

    if(usersSnap.exists()) {
        return usersSnap.data().accessibleLists;
    }
    return initializeUser(user, db);
}

async function initializeUser(user, db) {
    const listsRef = await addDoc(collection(db, "lists"), {
        title: `${user.displayName}'s List`,
        description: serverTimestamp(),
        roles: {
            [user.uid]: "owner"
        }           
    });

    const itemsRef = await setDoc(doc(db, "lists", listsRef.id, "items", "first"), {
        user: "Bot",
        content: "Add to the to-do list!",
        priority: 1,
    })

    const usersRef = await setDoc(doc(db, "users", user.uid), {
        accessibleLists: [listsRef.id]
    });

    return [listsRef.id];
}


export function setupFirestoreV2(database, auth) {
    onAuthStateChanged(auth, user => {
        if(user) {
            // findUser returns an array of list ids that should be accessible to the user
            const listsToDisplay = findUsersLists(user, database);
            console.log(listsToDisplay);
        }
    })
}