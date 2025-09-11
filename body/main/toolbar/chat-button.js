// chat-button.js

const chatButton = document.getElementById("chat-button");
const chatButtonIcon = chatButton.querySelector(".material-symbols-rounded");

// Sidebar
const sidebar = document.getElementById('sidebar');
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

    window.addEventListener("chatdatachannelopen", () => {
        show()
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
    window.addEventListener("peer-message", () => {
        if (!isOn) {
            notify();
        }
    });
}

function show() {
    chatButton.style.display = "inline-block";
}
function hide() {
    chatButton.style.display = "none";
    chatButtonIcon.textContent = "chat_bubble";
    chatButton.style.backgroundColor = "#ccc";
    isOn = true;
    sidebar.style.display = "none";
}

function notify() {
    chatButtonIcon.textContent = "mark_chat_unread";
    chatButton.style.backgroundColor = "rgba(65, 147, 239)";
}