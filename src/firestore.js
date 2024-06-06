import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";

let database;
let unsubscribe;
let currentUser;

const itemList = document.querySelector("#itemList");
const addItemButton = document.querySelector("#addItemBtn");
const inputForm = document.querySelector("#inputForm");

function toggleAddItem() {
    inputForm.hasChildNodes() ? inputForm.replaceChildren() : createForm();
}

function createForm() {
    const nameLabel = document.createElement("label");
    const nameInput = document.createElement("input");
    const priorityLabel = document.createElement("label");
    const priorityInput = document.createElement("input");
    const confirmButton = document.createElement("button");
    
    nameLabel.textContent = "List item: ";
    nameInput.type = "text";
    nameInput.id = "name";
    nameInput.setAttribute("required", "");

    priorityLabel.textContent = "Priority:  ";
    priorityInput.type = "number";
    priorityInput.id = "priority";
    priorityInput.setAttribute("required", "");

    confirmButton.textContent = "Confirm";
    confirmButton.type = "submit";
    confirmButton.addEventListener("click", (e) => {
        e.preventDefault();
        writeToDoc(nameInput.value, priorityInput.value);
        nameInput.value = ``;
        priorityInput.value = ``;
    })

    inputForm.appendChild(nameLabel)
    inputForm.appendChild(nameInput);
    inputForm.appendChild(priorityLabel)
    inputForm.appendChild(priorityInput);
    inputForm.appendChild(confirmButton);
}

async function writeToDoc(name, priority) {
    const docRef = await addDoc(collection(database, "things"), {
        user: currentUser,
        name: name,
        priority: priority,
        timestamp: serverTimestamp()
    });
    console.log("Document written with ID: ", docRef.id);
}

function displayDB() {
    const q = query(collection(database, "things"), orderBy("timestamp", "asc"))
    unsubscribe = onSnapshot(q, querySnapshot => {
        itemList.replaceChildren();
        querySnapshot.forEach((item) => {

            const listItem = document.createElement("li");
            const deleteButton = document.createElement("button");
            listItem.textContent = `By ${item.data().user}: ${item.data().name}, Priority: ${item.data().priority}`;
            deleteButton.textContent = "Delete item";
            deleteButton.addEventListener("click", async () => await deleteDoc(doc(database, "things", item.id)))

            itemList.appendChild(listItem);
            itemList.appendChild(deleteButton);
        })
    })
}

export function setupFirestore(db, auth) {
    onAuthStateChanged(auth, user => {
        if(user) {
            try {
                database = db;
                currentUser = user.displayName;
                console.log(currentUser);
                addItemBtn.addEventListener("click", () => {
                    console.log("clicked");
                    toggleAddItem()
                });
                displayDB();
            } catch (e) {
                console.error("Error adding document: ", e);
            }
        }
        else {
            unsubscribe && unsubscribe();
        }
    })
}
