// webrtc.js

const selfVideo = document.getElementById('self-video');

let rtcPeerConnection;
let chatDataChannel;

window.addEventListener("callbuttonclick", (event) => {
    if (event.detail.isTurningOn) {
        connect();
    } else {
        sendMessage(JSON.stringify({ type: "disconnect" }));
        disconnect();
    }
});

window.addEventListener("websocketmessage", async (event) => {
    const data = event.detail
    if (data.type === "wait") {
        if (window.statusText) window.statusText.textContent = window.localized.waiting;
    }
    if (data.type === "offerer") {
        chatDataChannel = createChatDataChannel(rtcPeerConnection.createDataChannel("chat"));
        const offer = await rtcPeerConnection.createOffer();
        await rtcPeerConnection.setLocalDescription(offer);
        window.dispatchEvent(new CustomEvent("signal", { detail: JSON.stringify(rtcPeerConnection.localDescription) }));
    } 
    if (data.type === "answerer") {
        rtcPeerConnection.ondatachannel = (event) => {
            chatDataChannel = createChatDataChannel(event.channel);
        };
    }
    if (data.type === "offer") {
        await rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(data));
        const answer = await rtcPeerConnection.createAnswer();
        await rtcPeerConnection.setLocalDescription(answer);
        window.dispatchEvent(new CustomEvent("signal", { detail: JSON.stringify(rtcPeerConnection.localDescription) }));
    }
    if (data.type === "answer") {
        await rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(data));
    }
    if (data.type === "candidate") {
        await rtcPeerConnection.addIceCandidate(data.candidate);
    }
});

window.addEventListener("selfmessage", (event) => {
    sendMessage(JSON.stringify({ type: "message", text: event.detail }));
});

// Create RTC Peer Connection
function connect() {
    // RTC Peer Connection
    rtcPeerConnection = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    // On Connection State Shange
    rtcPeerConnection.onconnectionstatechange = () => {
        if (rtcPeerConnection.connectionState === "failed") {
            window.dispatchEvent(new CustomEvent("peerstatechange", { detail: { state: "disconnected" } }));
        }
    };

    // Add Video Track 
    selfVideo.srcObject.getTracks().forEach((track) => {
        rtcPeerConnection.addTrack(track, selfVideo.srcObject);
    });

    // On ICE Candidate
    rtcPeerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            window.dispatchEvent(new CustomEvent("signal", { detail: JSON.stringify({ type: "candidate", candidate: event.candidate }) }));
        }
    };

    // On Track
    rtcPeerConnection.ontrack = (event) => {
        window.dispatchEvent(new CustomEvent("peertrack", { detail: event.streams[0] }));
    };
}

// Chat Data Channel
function createChatDataChannel(dataChannel) {
    // Peer Message
    dataChannel.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "message") {
            const messageElement = document.createElement("div");
            messageElement.classList.add("peer-message");
            messageElement.textContent = data.text;
            log.appendChild(messageElement);
            messageElement.scrollIntoView({ behavior: "smooth", block: "end" });
            window.dispatchEvent(new Event("peer-message"));
        } else if (data.type === "disconnect") {
            window.dispatchEvent(new CustomEvent("peerstatechange", { detail: { state: "disconnected" } }));
            disconnect()
        }
    };
    dataChannel.onopen = () => {
        window.dispatchEvent(new CustomEvent("chatdatachannelopen"));
    };
    return dataChannel;
}

function disconnect() {
    if (chatDataChannel) {
        chatDataChannel.close();
        chatDataChannel = null;
    }
    rtcPeerConnection.close();
    rtcPeerConnection = null;
}

function sendMessage(message) {
    if (chatDataChannel && chatDataChannel.readyState === "open") {
        chatDataChannel.send(message);
    }
}