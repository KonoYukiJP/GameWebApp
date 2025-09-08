// chat-button.js

const chatButton = document.getElementById("chat-button");
const chatButtonIcon = chatButton.querySelector(".material-symbols-rounded");

// Sidebar
const sidebar = document.getElementById('sidebar');
const log = document.getElementById('log');
const textField = document.getElementById('text-field');

let isOn = false;

export function initialize() {
    chatButton.addEventListener("click", () => {
        if (!isOn) {
            sidebar.style.display = "flex";
            chatButtonIcon.textContent = "chat";
            chatButton.style.backgroundColor = "#ccc";
            isOn = true;
        } else {
            sidebar.style.display = "none";
            chatButtonIcon.textContent = "chat_bubble";
            isOn = false;
        }
        window.dispatchEvent(new CustomEvent("sidebar", { detail: { isHidden: !isOn } }));
    });

    window.addEventListener("peer-message", () => {
        if (!isOn) {
            notify();
        }
    });
}

export function hide() {
    chatButton.style.display = "none";
    chatButtonIcon.textContent = "chat_bubble";
    chatButton.style.backgroundColor = "#ccc";
    isOn = true;
    sidebar.style.display = "none";
}

export function show() {
    chatButton.style.display = "inline-block";
}

export function notify() {
    chatButtonIcon.textContent = "mark_chat_unread";
    chatButton.style.backgroundColor = "rgba(65, 147, 239)";
}