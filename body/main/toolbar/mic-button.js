// mic-button.js

const micButton = document.getElementById('mic-button');
const micButtonIcon = micButton.querySelector(".material-symbols-rounded");

let isOn = false;
let selfAudioTrack = null;

export function initialize() {
    micButton.addEventListener("click", () => {
        if (!selfAudioTrack) return;
        
        if (!isOn) {
            selfAudioTrack.enabled = true;
            micButtonIcon.textContent = "mic";
            isOn = true;
        } else {
            selfAudioTrack.enabled = false;
            micButtonIcon.textContent = "mic_off";
            isOn = false;
        }
    });
}

export function setAudioTrack(audioTrack) {
    selfAudioTrack = audioTrack;
    isOn = false;
    micButtonIcon.textContent = "mic";
}
