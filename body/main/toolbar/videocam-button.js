// videocam-button.js

const videocamButton = document.getElementById("videocam-button")
const videocamButtonIcon = videocamButton.querySelector(".material-symbols-rounded");

let isOn = false;
let selfVideoTrack = null;

export function initialize() {
    videocamButton.addEventListener("click", () => {
        if (!selfVideoTrack) return;

        if (!isOn) {
            selfVideoTrack.enabled = true;
            videocamButtonIcon.textContent = "videocam";
            isOn = true;
        } else {
            selfVideoTrack.enabled = false;
            videocamButtonIcon.textContent = "videocam_off";
            isOn = false;
        }
    });
}

export function setVideoTrack(videoTrack) {
    selfVideoTrack = videoTrack;
    isOn = false;
    videocamButtonIcon.textContent = "videocam";
}