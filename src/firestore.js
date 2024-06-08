import { onAuthStateChanged } from "firebase/auth";
import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getCountFromServer, getDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import "./style.css";

const listsDiv = document.querySelector("#lists");
const addListForm = document.querySelector("#listForm");
let unsubscribe;
let currentUser;
let db;

/* ===== MAINLY FIREBASE FUNCTIONS ===== */

async function findUsersLists() {
    const usersSnap = await getDoc(doc(db, "users", currentUser.uid));

    if(usersSnap.exists()) {
        const listArray = usersSnap.data().accessibleLists
        return listArray;
    }
    return initializeUserList();
}

async function initializeUserList() {
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

async function writeToItems(listId, item, priority) {
    const itemRef = await addDoc(collection(db, "lists", listId, "items"), {
        user: currentUser.displayName,
        item: item,
        priority: priority,
        accomplished: false,
        timestamp: serverTimestamp()
    });
}

async function writeListIdToCurrentUser(listId) {
    const userRef = await updateDoc(doc(db, "users", currentUser.uid), {
        accessibleLists: arrayUnion(listId)
    });
}

async function writeUIDtoListRoles(listId, roleType) {
    const userRef = await updateDoc(doc(db, "lists", listId), {
        [`roles.${currentUser.uid}`]: roleType
    });
}

async function removeListFromUser(listId) {
    const listRef = await updateDoc(doc(db, "lists", listId), {
        [`roles.${currentUser.uid}`]: "removed"
    })

    const userRef = await updateDoc(doc(db, "users", currentUser.uid), {
        accessibleLists: arrayRemove(listId)
    });
}

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
            giveUserAccessToList(listId)
            await createListElements(listId);
            displayListInRealTime(listId);
        }
    }
}

function giveUserAccessToList(listId) {
    writeListIdToCurrentUser(listId);
    writeUIDtoListRoles(listId, "editor")
}

async function fetchAndDisplayContent() {
    // findUsersLists returns a Promise for an array of list ids that should be accessible to the user
    const usersLists = await findUsersLists(currentUser, db);
    listsDiv.replaceChildren();

    displayListId(usersLists[0]);
    activateAddListButton();
    usersLists.forEach(async (listId) => {
        await createListElements(listId);
        displayListInRealTime(listId);
    });
}

export function setupFirestore(database, auth) {
    db = database;
    onAuthStateChanged(auth, user => {
        if(user) {
            currentUser = user;
            fetchAndDisplayContent();
        }
        else {
            unsubscribe && unsubscribe();
        }
    });
}



/* ===== DISPLAYING TO-DO LIST UI FUNCTIONS ===== */

function displayListInRealTime(listId) {
    const itemList = document.querySelector(`ul.${listId}`);
    const q = query(collection(db, "lists", listId, "items"), orderBy("timestamp", "asc"));

    unsubscribe = onSnapshot(q, (querySnapshot) => {
        itemList.replaceChildren();
        querySnapshot.forEach((item) => {
            const itemInDB = doc(db, "lists", listId, "items", item.id);

            const listItem = document.createElement("li");
            const checkBox = document.createElement("input");
            const itemText = document.createElement("span");
            const deleteButton = document.createElement("button");

            checkBox.type = "checkbox";
            checkBox.checked = item.data().accomplished;
            checkBox.addEventListener("change", async () => {
                await updateDoc(itemInDB, { accomplished: checkBox.checked })
            });
            itemText.textContent = `${item.data().item}, ${item.data().priority}, by ${item.data().user}`;
            deleteButton.textContent = "Delete item";
            deleteButton.addEventListener("click", async () => await deleteDoc(itemInDB));

            listItem.appendChild(checkBox);
            listItem.appendChild(itemText);
            itemList.appendChild(listItem);
            itemList.appendChild(deleteButton);
        });
    });
}

async function createListElements(listId) {
    const listContainer = document.createElement("div");

    const listTop = document.createElement("div");
    const listTitle = document.createElement("h3");
    const listClose = document.createElement("button");

    const actualList = document.createElement("ul");
    const addItemButton = document.createElement("button");
    const addItemForm = document.createElement("form");
    const docSnap = await getDoc(doc(db, "lists", listId));

    listContainer.className = listId;
    listTop.className = "topBar";
    actualList.className = listId;
    addItemForm.className = "itemForm";

    listTitle.textContent = docSnap.data().roles[currentUser.uid] === "owner" ? "Your List" : docSnap.data().title;
    listClose.textContent = "Remove list";
    addItemButton.textContent = "Add item";
    addItemButton.addEventListener("click", () => toggleAddItem(listId, addItemForm));
    listClose.addEventListener("click", (e) => {
        listsDiv.removeChild(e.target.parentNode.parentNode);
        removeListFromUser(listId);
    });
    
    listTop.appendChild(listTitle);
    if(docSnap.data().roles[currentUser.uid] !== "owner") {
        listTop.appendChild(listClose);
    }
    listContainer.appendChild(listTop);
    listContainer.appendChild(actualList);
    listContainer.appendChild(addItemButton);
    listContainer.appendChild(addItemForm);
    listsDiv.appendChild(listContainer);
}

function toggleAddItem(listId, form) {
    form.hasChildNodes() ? form.replaceChildren() : createItemForm(listId, form);
}

function createItemForm(listId, form) {
    const items = collection(db, "lists", listId, "items");

    const itemLabel = document.createElement("label");
    const itemInput = document.createElement("input");
    const priorityLabel = document.createElement("label");
    const priorityInput = document.createElement("input");
    const confirmButton = document.createElement("button");
    
    itemLabel.textContent = "List item: ";
    itemInput.type = "text";
    itemInput.id = "item";
    itemInput.setAttribute("required", "");

    priorityLabel.textContent = "Priority:  ";
    priorityInput.type = "number";
    priorityInput.id = "priority";
    priorityInput.setAttribute("required", "");

    confirmButton.textContent = "Confirm";
    confirmButton.type = "submit";
    confirmButton.addEventListener("click", async (e) => {
        e.preventDefault();
        
        const itemCount = await getCountFromServer(items);
        if(itemCount.data().count === 20) {
            alert("can't have more than 20 items in a list")
        }
        else {
            writeToItems(listId, itemInput.value, priorityInput.value);
            itemInput.value = ``;
            priorityInput.value = ``;
        }        
    })

    form.appendChild(itemLabel)
    form.appendChild(itemInput);
    form.appendChild(priorityLabel)
    form.appendChild(priorityInput);
    form.appendChild(confirmButton);
}



/* ===== OTHER UI FUNCTIONS ===== */

function displayListId(listId) {
    const displayIdElement = document.querySelector("#listId");
    const idText = document.createElement("span");
    const toggleIdButton = document.createElement("button");
    displayIdElement.replaceChildren();

    toggleIdButton.addEventListener("click", () => {
        idText.textContent = idText.textContent === "Your list ID: " ? `Your list ID: ${listId}` : "Your list ID: ";
    });
        
    idText.textContent = "Your list ID: ";
    toggleIdButton.textContent = "Toggle ID";
    
    displayIdElement.appendChild(idText);
    displayIdElement.appendChild(toggleIdButton);
}

function activateAddListButton() {
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
        checkListId(listInput.value);
        toggleAddList();
    })

    addListForm.appendChild(listLabel)
    addListForm.appendChild(listInput);
    addListForm.appendChild(confirmButton);
}