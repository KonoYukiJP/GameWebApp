// sidebar.js

const textField = document.getElementById("text-field");
const log = document.getElementById("log");

export function initialize() {
    textField.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" || e.isComposing) return;

        const message = textField.value.trim();
        if (!message) return;
        
        // Message
        window.dispatchEvent(new CustomEvent("selfmessage", { detail: message }));
        const messageElement = document.createElement("div");
        messageElement.classList.add("self-message");
        messageElement.textContent = message;
        log.appendChild(messageElement);
        messageElement.scrollIntoView({ behavior: "smooth", block: "end" });
        textField.value = "";
    });
    window.addEventListener("callbuttonclick", (event) => {
        if (event.detail.isTurningOn) {
            // Remove Log Child
            while (log.firstChild) {
                log.removeChild(log.firstChild);
            }
        }
    });
    window.addEventListener("peerstatechange", (event) => {
        if (event.detail.state === "disconnected") {
            // Remove Log Child
            while (log.firstChild) {
                log.removeChild(log.firstChild);
            }
        }
    });
}