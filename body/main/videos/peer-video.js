// peer-video.js

import { analyzeAudio } from "./analyzer.js";

const videoWrapper = document.getElementById("peer-video-wrapper")
const video = document.getElementById("peer-video");
const audioVisualizer = document.getElementById("peer-audio-visualizer");
const connectionStatus = document.getElementById("connection-status");

export function initialize() {
    window.addEventListener("callbuttonclick", (event) => {
        if (event.detail.isTurningOn) {
            show()
        } else {
            hide()
        }
    });
    window.addEventListener("peertrack", (event) => {
        setSourceObject(event.detail)
    });
    window.addEventListener("peerstatechange", (event) => {
        if (event.detail.state === "disconnected") {
            hide();
        }
    });
}

function show() {
    videoWrapper.style.display = "block";
    connectionStatus.style.display = "flex";
}

function setSourceObject(stream) {
    if (!video.srcObject) {
        video.srcObject = stream
        video.play()
        analyzeAudio(stream, audioVisualizer)
        connectionStatus.style.display = "none";
    }
}

function hide() {
    connectionStatus.style.display = "none";
    video.srcObject = null;
    videoWrapper.style.display = "none";
}