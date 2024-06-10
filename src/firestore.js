import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { displayListId } from "./showListId.js";
import { activateAddListButton } from "./addList.js";
import { displayList } from "./showList.js";

const listsDiv = document.querySelector("#lists");
let db;
let currentUser;

/* ===== MAINLY FIREBASE FUNCTIONS ===== */

async function findUsersLists() {
    const usersSnap = await getDoc(doc(db, "users", currentUser.uid));

    if(usersSnap.exists()) {
        const listArray = usersSnap.data().accessibleLists
        return listArray;
    }
    return initializeUserAndList();
}

async function initializeUserAndList() {
    const listRef = await addDoc(collection(db, "lists"), {
        title: `${currentUser.displayName}'s List`,
        description: serverTimestamp(),
        roles: {
            [currentUser.uid]: "owner"
        }           
    });

    const itemRef = await addDoc(collection(db, "lists", listRef.id, "items"), {
        user: "Bot",
        item: "Add to the to-do list!",
        priority: 1,
        accomplished: false,
        timestamp: serverTimestamp()
    })

    const userRef = await setDoc(doc(db, "users", currentUser.uid), {
        email: currentUser.email,
        accessibleLists: [listRef.id]
    });

    const listArray = [listRef.id]
    return listArray;
}

async function fetchAndDisplayContent() {
    // findUsersLists returns a Promise for an array of list ids that should be accessible to the user
    const usersLists = await findUsersLists();
    listsDiv.replaceChildren();

    displayListId(usersLists[0]);
    activateAddListButton(currentUser, db);
    usersLists.forEach(async (listId) => {
        await displayList(listId, currentUser, db);
    });
}

export function setupFirestore(database, auth) {
    db = database;
    onAuthStateChanged(auth, user => {
        if(user) {
            currentUser = user;
            fetchAndDisplayContent(currentUser, db);
        }
    });
}
