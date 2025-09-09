// self-video.js

import { analyzeAudio } from "analyzer.js";

export const video = document.getElementById('self-video');
const audioVisualizer = document.getElementById("self-audio-visualizer");

export function setSourceObject(stream) {
    if (!video.srcObject) {
        video.srcObject = stream
        video.play()
        analyzeAudio(stream, audioVisualizer)
    }
}