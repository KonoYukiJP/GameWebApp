// chat-button.js

const chatButton = document.getElementById("chat-button");
const chatButtonIcon = chatButton.querySelector(".material-symbols-rounded");

let isOn = false;

export function initialize() {
    chatButton.addEventListener("click", () => {
        window.dispatchEvent(new CustomEvent("chatbuttonclick", { detail: { isTurningOn: !isOn } }));
        !isOn ? turnOn() : turnOff();
    });

    window.addEventListener("chatdatachannelopen", () => {
        show()
    });
    window.addEventListener("peer-message", () => {
        if (!isOn) {
            notify();
        }
    });
    window.addEventListener("callbuttonclick", (event) => {
        if (!event.detail.isTurningOn) {
            hide()
        }
    });
    window.addEventListener("peerstatechange", (event) => {
        if (event.detail.state === "disconnected") {
            hide();
        }
    });
}

function show() {
    chatButton.style.display = "inline-block";
}
function hide() {
    chatButton.style.display = "none";
    turnOff()
}
function turnOn() {
    chatButtonIcon.textContent = "chat";
    chatButton.style.backgroundColor = "#ccc";
    isOn = true;
}
function turnOff() {
    chatButtonIcon.textContent = "chat_bubble";
    chatButton.style.backgroundColor = "#ccc";
    isOn = false;
}
function notify() {
    chatButtonIcon.textContent = "mark_chat_unread";
    chatButton.style.backgroundColor = "rgba(65, 147, 239)";
}