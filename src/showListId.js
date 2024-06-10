export function displayListId(listId) {
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