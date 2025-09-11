// call-button.js

const primaryColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--primary")
    .trim();
const secondaryColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--secondary")
    .trim();

const callButton = document.getElementById("call-button");
const callButtonIcon = callButton.querySelector(".material-symbols-rounded");

let isOn = false;

export function initialize() {
    callButton.addEventListener("click", () => {
        window.dispatchEvent(new CustomEvent("callbuttonclick", { detail: { isTurningOn: !isOn}}));
        !isOn ? turnOn() : turnOff();
    });
    window.addEventListener("peerstatechange", (event) => {
        if (event.detail.state === "disconnected") {
            turnOff();
        }
    });
}

function turnOn() {
    callButtonIcon.textContent = "call_end";
    callButton.style.backgroundColor = secondaryColor;
    isOn = true;
}

function turnOff() {
    callButtonIcon.textContent = "call";
    callButton.style.backgroundColor = primaryColor;
    isOn = false;
}