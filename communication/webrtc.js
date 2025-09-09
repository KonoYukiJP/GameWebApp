// webrtc.js

import * as peerVideo from '../body/main/videos/peer-video.js'
import * as chatButton from '../body/main/toolbar/chat-button.js'

let rtcPeerConnection = null;
let chatDataChannel = null;

window.addEventListener("call-button", (event) => {
    if (!event.detail.isTurningOn) {
        disconnect();
    }
});

// Create RTC Peer Connection
export function createRtcPeerConnection(selfVideo, sendViaWebSocket) {
    // RTC Peer Connection
    rtcPeerConnection = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    // Add Video Track 
    selfVideo.srcObject.getTracks().forEach((track) => {
        rtcPeerConnection.addTrack(track, selfVideo.srcObject);
    });

    // On ICE Candidate
    rtcPeerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            sendViaWebSocket(JSON.stringify({ type: "candidate", candidate: event.candidate }));
        }
    };

    // On Track
    rtcPeerConnection.ontrack = (event) => {
        peerVideo.setSourceObject(event.streams[0]);
    };

    // On Data Channel
    rtcPeerConnection.ondatachannel = (event) => {
        chatDataChannel = event.channel;
        setupChatDataChannel(chatDataChannel);
    };

    return rtcPeerConnection;
}

export { rtcPeerConnection, chatDataChannel };

// Chat Data Channel
export function createChatDataChannel(dataChannel, disconnect) {
    chatDataChannel = dataChannel

    // Peer Message
    chatDataChannel.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "message") {
            const messageElement = document.createElement("div");
            messageElement.classList.add("peer-message");
            messageElement.textContent = data.text;
            log.appendChild(messageElement);
            messageElement.scrollIntoView({ behavior: "smooth", block: "end" });
            window.dispatchEvent(new Event("peer-message"));
        } else if (data.type === "disconnect") {
            disconnect()
        }
    };
    chatDataChannel.onopen = () => {
        console.log("chatDataChannel.onopen");
        chatButton.show()
    };
    chatDataChannel.onclose = () => {
        console.log("chatDataChannel.onclose");
        chatButton.hide()
    };
}

function disconnect() {
    if (chatDataChannel && chatDataChannel.readyState === "open") {
        chatDataChannel.send(JSON.stringify({ type: "disconnect" }));
    }
    rtcPeerConnection.close();
    rtcPeerConnection = null;
}

export function sendOnChatDataChannel(message) {
    if (chatDataChannel.readyState !== "open") return;
    chatDataChannel.send(JSON.stringify({ type: "message", text: message }));
}