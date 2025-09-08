// text-field.js

import { sendOnChatDataChannel } from '/communication/webrtc.js';

const textField = document.getElementById("text-field")

export function initialize() {
    textField.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" || e.isComposing) return;

        const message = textField.value.trim();
        if (!message) return;
        
        // Message
        sendOnChatDataChannel(message);
        const messageElement = document.createElement("div");
        messageElement.classList.add("self-message");
        messageElement.textContent = message;
        log.appendChild(messageElement);
        messageElement.scrollIntoView({ behavior: "smooth", block: "end" });
        textField.value = "";
    });
}