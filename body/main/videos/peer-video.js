// peer-video.js

import { analyzeAudio } from "analyzer.js";

const videoWrapper = document.getElementById("peer-video-wrapper")
const video = document.getElementById("peer-video");
const audioVisualizer = document.getElementById("peer-audio-visualizer");
const connectionStatus = document.getElementById("connection-status");

export function initialize() {
    window.addEventListener("peer", (event) => {
        if (event.detail.isConnected) {
            show();
        } else {
            hide();
        }
    });
}

export function show() {
    videoWrapper.style.display = "block";
    connectionStatus.style.display = "flex";
}

export function setSourceObject(stream) {
    if (!video.srcObject) {
        video.srcObject = stream
        video.play()
        analyzeAudio(stream, audioVisualizer)
        connectionStatus.style.display = "none";
    }
}

export function hide() {
    connectionStatus.style.display = "none";
    video.srcObject = null;
    videoWrapper.style.display = "none";
}