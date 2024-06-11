import { addDoc, arrayRemove, collection, deleteDoc, doc, getCountFromServer, getDoc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";

const listsDiv = document.querySelector("#lists");
let db;
let currentUser;


/* ===== FIRESTORE FUNCTIONS ===== */

async function writeToItems(listId, item, priority) {
    const itemRef = await addDoc(collection(db, "lists", listId, "items"), {
        user: currentUser.displayName,
        item: item,
        priority: priority,
        accomplished: false,
        timestamp: serverTimestamp()
    });
}

async function removeUserAccessToList(listId) {
    const listRef = await updateDoc(doc(db, "lists", listId), {
        [`roles.${currentUser.uid}`]: "removed"
    })

    const userRef = await updateDoc(doc(db, "users", currentUser.uid), {
        accessibleLists: arrayRemove(listId)
    });
}



/* ===== UI FUNCTIONS ===== */

export async function displayList(listId, cu, d) {
    db = d;
    currentUser = cu;
    await createListElements(listId);
    displayListInRealTime(listId);
    displayMembersInRealTime(listId);
}

function displayListInRealTime(listId) {
    const itemList = document.querySelector(`ul.${listId}.items`);
    const q = query(collection(db, "lists", listId, "items"), orderBy("timestamp", "asc"));

    onSnapshot(q, (querySnapshot) => {
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

function displayMembersInRealTime(listId) {
    const membersList = document.querySelector(`ul.${listId}.members`);
    membersList.replaceChildren();

    onSnapshot(doc(db, "lists", listId), async (list) => {
        for(const member in list.data().roles) {
            if(list.data().roles[member] !== "removed") {
                let userSnap = await getDoc(doc(db, "users", member));
                let memberLi = document.createElement("li");
                memberLi.textContent = userSnap.data().name;
                membersList.appendChild(memberLi);
            }
        }
    })
}

async function createListElements(listId) {
    const listContainer = document.createElement("div");

    const listTop = document.createElement("div");
    const listTitle = document.createElement("h3");
    const listClose = document.createElement("button");

    const actualList = document.createElement("ul");
    const addItemButton = document.createElement("button");
    const addItemForm = document.createElement("form");

    const listBottom = document.createElement("div");
    const membersTitle = document.createElement("h3")
    const membersList = document.createElement("ul");

    const docSnap = await getDoc(doc(db, "lists", listId));



    listContainer.className = listId;
    listTop.className = "topBar";
    actualList.className += ` ${listId}`;
    actualList.className += " items"
    addItemForm.className = "itemForm";

    listTitle.textContent = docSnap.data().roles[currentUser.uid] === "owner" ? "Your List" : docSnap.data().title;
    listClose.textContent = "Remove list";
    addItemButton.textContent = "Add item";
    addItemButton.addEventListener("click", () => toggleAddItem(listId, addItemForm));
    listClose.addEventListener("click", (e) => {
        listsDiv.removeChild(e.target.parentNode.parentNode);
        removeUserAccessToList(listId);
    });

    membersTitle.textContent = "Users";
    membersList.className += ` ${listId}`;
    membersList.className += " members";
    
    listTop.appendChild(listTitle);
    if(docSnap.data().roles[currentUser.uid] !== "owner") {
        listTop.appendChild(listClose);
    }
    listBottom.appendChild(membersTitle);
    listBottom.appendChild(membersList);

    listContainer.appendChild(listTop);
    listContainer.appendChild(actualList);
    listContainer.appendChild(addItemButton);
    listContainer.appendChild(addItemForm);
    listContainer.appendChild(listBottom);
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
        if(itemCount.data().count === 30) {
            alert("can't have more than 30 items in a list")
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