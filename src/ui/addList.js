import { arrayUnion, collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { displayList } from "./showList.js";

const listsDiv = document.querySelector("#lists");
const addListForm = document.querySelector("#listForm");
let db;
let currentUser;

/* ===== FIRESTORE FUNCTIONS ===== */

async function checkListId(listId) {
    let listExists = false;

    const listsSnapshot = await getDocs(collection(db, "lists"));
    listsSnapshot.forEach((list) => {
        if(list.id === listId) {
            listExists = true;
        }
    })

    if(listExists === false) {
        alert("list doesn't exist!");
    }
    else {
        const userSnap = await getDoc(doc(db, "users", currentUser.uid));
        if(userSnap.data().accessibleLists.includes(listId)) {
            alert("list is already on your account!")
        }
        else {
            giveUserAccessToList(listId, "editor")
            await displayList(listId, currentUser, db);
        }
    }
}

async function giveUserAccessToList(listId, roleType) {
    const listRef = await updateDoc(doc(db, "lists", listId), {
        [`roles.${currentUser.uid}`]: roleType
    });

    const userRef = await updateDoc(doc(db, "users", currentUser.uid), {
        accessibleLists: arrayUnion(listId)
    });
}


/* ===== UI FUNCTIONS ===== */

export function activateAddListButton(cu, d) {
    db = d;
    currentUser = cu;
    const container = document.querySelector("#addButtonContainer");
    const addListButton = document.createElement("button");

    container.replaceChildren();

    addListButton.textContent = "Add List";
    addListButton.addEventListener("click", () => toggleAddList());

    container.appendChild(addListButton);
}

function toggleAddList() {
    addListForm.hasChildNodes() ? addListForm.replaceChildren() : checkIfMaxLists();
}

function checkIfMaxLists() {
    listsDiv.childNodes.length === 3 ? alert("only 3 lists are allowed!"): createListForm();
}

function createListForm() {
    const listLabel = document.createElement("label");
    const listInput = document.createElement("input");
    const confirmButton = document.createElement("button");
    
    listLabel.textContent = "List ID: ";
    listInput.type = "text";
    listInput.id = "listID";
    listInput.setAttribute("required", "");

    confirmButton.textContent = "Confirm";
    confirmButton.type = "submit";
    confirmButton.addEventListener("click", async (e) => {
        e.preventDefault();
        checkListId((listInput.value).trim());
        toggleAddList();
    })

    addListForm.appendChild(listLabel)
    addListForm.appendChild(listInput);
    addListForm.appendChild(confirmButton);
}