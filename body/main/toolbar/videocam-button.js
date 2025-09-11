// videocam-button.js

const videocamButton = document.getElementById("videocam-button")
const videocamButtonIcon = videocamButton.querySelector(".material-symbols-rounded");

let isOn = false;
let selfVideoTrack = null;

export function initialize() {
    videocamButton.addEventListener("click", () => {
        if (!selfVideoTrack) return;

        if (!isOn) {
            turnOn()
        } else {
            turnOff()
        }
    });
}

export function setVideoTrack(videoTrack) {
    selfVideoTrack = videoTrack;
    turnOn();
}

function turnOn() {
    selfVideoTrack.enabled = true;
    videocamButtonIcon.textContent = "videocam";
    isOn = true;
}
function turnOff() {
    selfVideoTrack.enabled = false;
    videocamButtonIcon.textContent = "videocam_off";
    isOn = false;
}