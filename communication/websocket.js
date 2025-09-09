// websocket.js

import { createRtcPeerConnection, createChatDataChannel } from 'webrtc.js';

const selfVideo = document.getElementById('self-video');
const codeTextField = document.getElementById("code")

let webSocket;
let isConnected = false;

window.addEventListener("call-button", (event) => {
    if (event.detail.isTurningOn) {
        connect();
    } else {
        disconnect();
    }
});

function connect() {
    codeTextField.readOnly = true;

    const rtcPeerConnection = createRtcPeerConnection(selfVideo, sendViaWebSocket)

    webSocket = new WebSocket("wss://koyu.ddns.net/ws/");

    webSocket.onopen = () => {
        console.log('WebSocket connected');

        const code = codeTextField.value.trim();
        webSocket.send(JSON.stringify({ type: "code", code: code }));
    };

    // On Message
    webSocket.addEventListener("message", async (event) => {
        let rawData;
        if (event.data instanceof Blob) {
            rawData = await event.data.text();
        } else {
            rawData = event.data;
        }
        const data = JSON.parse(rawData);

        if (data.type === "wait") {
            console.log("Waiting for another user.");
            if (window.statusText) window.statusText.textContent = window.localized.waiting;
        }
        if (data.type === "offerer") {
            createChatDataChannel(rtcPeerConnection.createDataChannel("chat"), disconnect);
            const offer = await rtcPeerConnection.createOffer();
            await rtcPeerConnection.setLocalDescription(offer);
            webSocket.send(JSON.stringify(rtcPeerConnection.localDescription));
        } 
        if (data.type === "answerer") {
            rtcPeerConnection.ondatachannel = (event) => {
                createChatDataChannel(event.channel);
            };
        }
        if (data.type === "offer") {
            console.log("Offer received.");
            await rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(data));
            const answer = await rtcPeerConnection.createAnswer();
            await rtcPeerConnection.setLocalDescription(answer);
            webSocket.send(JSON.stringify(rtcPeerConnection.localDescription));
        }
        if (data.type === "answer") {
            console.log("Answer received.");
            await rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(data));
        }
        if (data.type === "candidate") {
            console.log("ICE candidate received.");
            await rtcPeerConnection.addIceCandidate(data.candidate);
        }
    });

    webSocket.onclose = () => {
        console.log('WebSocket disconnected');
    };

    isConnected = true;
    window.dispatchEvent(new CustomEvent("peer", { detail: { isConnected } }));
}

export function sendViaWebSocket(message) {
    webSocket.send(message);
}

function disconnect() {
    codeTextField.readOnly = false;

    // Remove Log Child
    while (log.firstChild) {
        log.removeChild(log.firstChild);
    }
    webSocket.close();
    webSocket = null;

    isConnected = false;
    window.dispatchEvent(new CustomEvent("peer", { detail: { isConnected } }));
}