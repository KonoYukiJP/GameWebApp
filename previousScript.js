// script.js

const primaryColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--primary")
    .trim();
const secondaryColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--secondary")
    .trim();

let isAudioMuted = false;
let isVideoMuted = false;
let selfAudioTrack = null;
let selfVideoTrack = null;
let isConnected = false;
let isChatHidden = true;

// RTC Peer Connection
let rtcPeerConnection = null;
let chatDataChannel = null;
// WebSocket
let webSocket = null;

// Main
const main = document.querySelector("main");
// Self
const selfVideo = document.getElementById("self-video");
const selfAudioVisualizer = document.getElementById("self-audio-visualizer");
// Peer
const peerVideoWrapper = document.getElementById("peer-video-wrapper")
const peerVideo = document.getElementById("peer-video");
const peerAudioVisualizer = document.getElementById("peer-audio-visualizer");
const connectionStatus = document.getElementById("connection-status");

// Sidebar
const sidebar = document.getElementById("sidebar");
const log = document.getElementById("log");
const textField = document.getElementById("text-field");

// Toolbar
const codeTextField = document.getElementById("code")
const toolbar = document.getElementById("toolbar");
const micButton = document.getElementById("mic-button");
const videocamButton = document.getElementById("videocam-button")
const callButton = document.getElementById("call-button");
const chatButton = document.getElementById("chat-button");
// Toolbar Icon
const micButtonIcon = micButton.querySelector(".material-symbols-rounded");
const videocamButtonIcon = videocamButton.querySelector(".material-symbols-rounded");
const callButtonIcon = callButton.querySelector(".material-symbols-rounded");
const chatButtonIcon = chatButton.querySelector(".material-symbols-rounded");

// Safe Area
const safeArea = parseInt(getComputedStyle(document.documentElement)
    .getPropertyValue("env(safe-area-inset-bottom)"));
if (safeArea > 0) {
    main.style.paddingBottom = "env(safe-area-inset-bottom)";
    sidebar.style.paddingBottom = "4 + env(safe-area-inset-bottom)";
} else {
    main.style.paddingBottom = "4px";
    sidebar.style.paddingBottom = "8px";
}

// Window Event Listener
window.addEventListener('resize', () => {
    setWindowInnerHeight()
    resizeVideos()
});

// PIXI
const pixi = new PIXI.Application({
    resizeTo: document.querySelector('.video-wrapper'),
    transparent: true
})
document.querySelector('.video-wrapper').appendChild(pixi.view);

pixi.view.style.position = "absolute";
pixi.view.style.top = "0";
pixi.view.style.left = "0";
pixi.view.style.pointerEvents = "none";

// MoveNet
let detector;
let leftHandSprite, rightHandSprite;
let leftWristSprite, rightWristSprite;
let leftElbowSprite, rightElbowSprite;
let circleRadius = 36;

// Initialize MoveNet
async function initializeMoveNet() {
    detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
    );
    // Left Wrist
    leftWristSprite = new PIXI.Graphics();
    leftWristSprite.beginFill(0x009ad6, 0.3); // Blue
    leftWristSprite.drawCircle(0, 0, 2);
    leftWristSprite.endFill();
    pixi.stage.addChild(leftWristSprite);
    // Left Elbow
    leftElbowSprite = new PIXI.Graphics();
    leftElbowSprite.beginFill(0x009ad6, 0.3); // Blue
    leftElbowSprite.drawCircle(0, 0, 2);
    leftElbowSprite.endFill();
    pixi.stage.addChild(leftElbowSprite);
    // Left Hand
    leftHandSprite = new PIXI.Graphics();
    leftHandSprite.beginFill(0x009ad6, 0.3); // Blue
    leftHandSprite.drawCircle(0, 0, circleRadius);
    leftHandSprite.endFill();
    pixi.stage.addChild(leftHandSprite);
    // Right Wrist
    rightWristSprite = new PIXI.Graphics();
    rightWristSprite.beginFill(0xed1a3d, 0.3); // Red
    rightWristSprite.drawCircle(0, 0, 2);
    rightWristSprite.endFill();
    pixi.stage.addChild(rightWristSprite);
    // Right Elbow
    rightElbowSprite = new PIXI.Graphics();
    rightElbowSprite.beginFill(0xed1a3d, 0.3); // Red
    rightElbowSprite.drawCircle(0, 0, 2);
    rightElbowSprite.endFill();
    pixi.stage.addChild(rightElbowSprite);
    // Right Hand
    rightHandSprite = new PIXI.Graphics();
    rightHandSprite.beginFill(0xed1a3d, 0.3); // Red
    rightHandSprite.drawCircle(0, 0, circleRadius);
    rightHandSprite.endFill();
    pixi.stage.addChild(rightHandSprite);

    detectHands();
}

// Detect Hands
async function detectHands() {
    if (selfVideo.readyState < 2) {
        requestAnimationFrame(detectHands);
        return;
    }
    const poses = await detector.estimatePoses(
        selfVideo, 
        {
            maxPoses: 1,
            flipHorizontal: true
        }
    );
    
    if (poses.length > 0) {
        const pixiWidth = pixi.renderer.width;
        const videoScale = pixiWidth / selfVideo.videoWidth;

        // Set Left Sprite Scale
        leftWristSprite.scale.set(videoScale);
        leftElbowSprite.scale.set(videoScale);
        leftHandSprite.scale.set(videoScale);
        // Set Right Sprite Scale
        rightWristSprite.scale.set(videoScale);
        rightElbowSprite.scale.set(videoScale);
        rightHandSprite.scale.set(videoScale);

        // Keypoints
        const keypoints = poses[0].keypoints;
        const leftWrist = keypoints.find(p => p.name === "left_wrist");
        const leftElbow = keypoints.find(p => p.name === "left_elbow");
        const rightWrist = keypoints.find(p => p.name === "right_wrist");
        const rightElbow = keypoints.find(p => p.name === "right_elbow");

        // Left Hand Sprite
        if (leftWrist.score > 0.3) {
            let leftHandX;
            let leftHandY;
            // Left Wrist Sprite
            leftWristSprite.x = pixiWidth - leftWrist.x * videoScale;
            leftWristSprite.y = leftWrist.y * videoScale;
            leftWristSprite.visible = true;
            if (leftElbow.score > 0.2) {
                // Left Elbow Sprite
                leftElbowSprite.x = pixiWidth - leftElbow.x * videoScale;
                leftElbowSprite.y = leftElbow.y * videoScale;
                leftElbowSprite.visible = true;
                const dx = leftWrist.x - leftElbow.x;
                const dy = leftWrist.y - leftElbow.y;
                leftHandX = leftWrist.x + circleRadius * dx / Math.hypot(dx, dy);
                leftHandY = leftWrist.y + circleRadius * dy / Math.hypot(dx, dy);
            } else {
                leftHandX = leftWrist.x
                leftHandY = leftWrist.y
            }
            leftHandSprite.x = pixiWidth - leftHandX * videoScale;
            leftHandSprite.y = leftHandY * videoScale;
            leftHandSprite.visible = true;
        } else {
            leftWristSprite.visible = false;
            leftElbowSprite.visible = false;
            leftHandSprite.visible = false;
        }
        // Right Hand Sprite
        if (rightWrist.score > 0.3) {
            let handPalmX;
            let handPalmY;
            // Right Wrist Sprite
            rightWristSprite.x = pixiWidth - rightWrist.x * videoScale;
            rightWristSprite.y = rightWrist.y * videoScale;
            rightWristSprite.visible = true;
            if (rightElbow.score > 0.2) {
                // Right Elbow Sprite
                rightElbowSprite.x = pixiWidth - rightElbow.x * videoScale;
                rightElbowSprite.y = rightElbow.y * videoScale;
                rightElbowSprite.visible = true;
                const dx = (rightWrist.x - rightElbow.x) * videoScale;
                const dy = (rightWrist.y - rightElbow.y) * videoScale;
                handPalmX = rightWrist.x + circleRadius * dx / Math.hypot(dx, dy);
                handPalmY = rightWrist.y + circleRadius * dy / Math.hypot(dx, dy);
            } else {
                handPalmX = rightWrist.x;
                handPalmY = rightWrist.y;
            }

            rightHandSprite.x = pixiWidth - handPalmX * videoScale;
            rightHandSprite.y = handPalmY * videoScale;
            rightHandSprite.visible = true;
        } else {
            rightWristSprite.visible = false;
            rightElbowSprite.visible = false;
            rightHandSprite.visible = false;
        }
    }

    requestAnimationFrame(detectHands);
}

// Toolbar Event Listener
micButton.addEventListener("click", () => {
    if (!selfAudioTrack) return;
    
    if (isAudioMuted) {
        isAudioMuted = false;
        selfAudioTrack.enabled = true;
        micButtonIcon.textContent = "mic";
    } else {
        isAudioMuted = true;
        selfAudioTrack.enabled = false;
        micButtonIcon.textContent = "mic_off";
    }
});
videocamButton.addEventListener("click", () => {
    if (!selfVideoTrack) return;

    if (isVideoMuted) {
        isVideoMuted = false;
        selfVideoTrack.enabled = true;
        videocamButtonIcon.textContent = "videocam";
    } else {
        isVideoMuted = true;
        selfVideoTrack.enabled = false;
        videocamButtonIcon.textContent = "videocam_off";
    }
});
callButton.addEventListener("click", () => {
    if (!isConnected) {
        connect();
    } else {
        if (chatDataChannel && chatDataChannel.readyState === "open") {
            chatDataChannel.send(JSON.stringify({ type: "disconnect" }));
        }
        disconnect();
    }
});
chatButton.addEventListener("click", () => {
    if (!isChatHidden) {
        isChatHidden = true;
        sidebar.style.display = "none";
        resizeVideos()
        chatButtonIcon.textContent = "chat_bubble";
    } else {
        isChatHidden = false;
        sidebar.style.display = "flex";
        resizeVideos()
        chatButtonIcon.textContent = "chat";
        chatButton.style.backgroundColor = "#ccc";
    }
});

// Chat Event Listener
textField.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || e.isComposing) return;

    const message = textField.value.trim();
    if (!message || chatDataChannel.readyState !== "open") return;
    
    // Self Message
    chatDataChannel.send(JSON.stringify({ type: "message", text: message }));
    const messageElement = document.createElement("div");
    messageElement.classList.add("self-message")
    messageElement.textContent = message;
    log.appendChild(messageElement);
    messageElement.scrollIntoView({ behavior: "smooth", block: "end" });
    textField.value = "";
});

// Get User Media
navigator.mediaDevices.getUserMedia({ video: {aspectRatio: 16 / 9}, audio: true })
    .then((stream) => {
        selfAudioTrack = stream.getAudioTracks()[0];
        micButtonIcon.textContent = "mic";
        selfVideoTrack = stream.getVideoTracks()[0];
        videocamButtonIcon.textContent = "videocam";
        selfVideo.srcObject = stream;
        selfVideo.onloadedmetadata = () => {
            toolbar.style.display = "flex";
        };
        selfVideo.play();

        analyzeAudioWith(stream, selfAudioVisualizer)
        initializeMoveNet();
    })
    .catch((err) => {
        console.error("Video Error:", err);
    });

// Set Window Inner Height
function setWindowInnerHeight() {
    const vh = window.innerHeight;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}
setWindowInnerHeight()

// Resize Videos
function resizeVideos() {
    const mainStyle = window.getComputedStyle(main);
    const mainPadding = parseInt(mainStyle.padding);
    const mainPaddingBottom = parseInt(mainStyle.paddingBottom);
    const mainGap = parseInt(mainStyle.gap);
    const toolbarHeight = toolbar.offsetHeight;
    // Grid
    const grid = document.getElementById("grid");
    const gridGap = parseInt(window.getComputedStyle(grid).gap);
    const gridWidth = isChatHidden
        ? window.innerWidth / 2 - mainPadding - gridGap / 2
        : window.innerWidth * 2 / 5 - 2 * mainPadding - gridGap / 2;
    const gridHeight = window.innerHeight - mainPadding - mainPaddingBottom - mainGap - toolbarHeight;
    if (gridWidth / gridHeight > 16 / 9) {
        document.querySelectorAll(".video-wrapper") .forEach((videWrapper) => {
            videWrapper.style.height = gridHeight + "px";
            videWrapper.style.width = (gridHeight * 16 / 9) + "px";
        });
    } else {
        document.querySelectorAll(".video-wrapper") .forEach((videoWrapper) => {
            videoWrapper.style.width = (gridWidth) + "px";
            videoWrapper.style.height = (gridWidth / 16 * 9) + "px";
        });
    }
}
resizeVideos()
pixi.renderer.resize(
    pixi.view.parentElement.clientWidth,
    pixi.view.parentElement.clientHeight
);

// Audio Analysis
function analyzeAudioWith(stream, audioVisualizer) {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const spectrumData = new Uint8Array(analyser.frequencyBinCount);
    source.connect(analyser);

    function updateBorder() {
        analyser.getByteFrequencyData(spectrumData);
        const volume = spectrumData.reduce((a, b) => a + b) / spectrumData.length;
        if (volume > 20) {
            
        }
        audioVisualizer.style.display = (volume > 20) ? "block" : "none";
        
        requestAnimationFrame(updateBorder);
    }
    updateBorder();
}

// Connect
function connect() {
    codeTextField.readOnly = true;
    callButtonIcon.textContent = "call_end";
    callButton.style.backgroundColor = secondaryColor;
    peerVideoWrapper.style.display = "block";
    connectionStatus.style.display = "flex";

    if (window.statusText) {
        window.statusText.textContent = window.localized.connecting;
    }

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
            webSocket.send(JSON.stringify({ type: "candidate", candidate: event.candidate }));
        }
    };

    // On Track
    rtcPeerConnection.ontrack = (event) => {
        if (!peerVideo.srcObject) {
            peerVideo.srcObject = event.streams[0];
            peerVideo.play();
            connectionStatus.style.display = "none";
            analyzeAudioWith(event.streams[0], peerAudioVisualizer);
        }
    };

    // Websocket
    webSocket = new WebSocket("wss://winesystem.servehttp.com/ws/");
    webSocket.addEventListener("open", async () => {
        console.log("WebSocket Connected");

        const code = codeTextField.value.trim();
        webSocket.send(JSON.stringify({ type: "code", code: code }));
    });

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
            createChatDataChannel(rtcPeerConnection.createDataChannel("chat"));
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
        if (data.type === "disconnect") {
            disconnect()
        }
    });

    isConnected = true
}

// Disconnect
function disconnect() {
    connectionStatus.style.display = "none";

    chatButton.style.display = "none";
    isChatHidden = true;
    chatButtonIcon.textContent = "chat_bubble";
    chatButton.style.backgroundColor = "#ccc";
    sidebar.style.display = "none";
    peerVideo.srcObject = null;
    peerVideoWrapper.style.display = "none";
    callButtonIcon.textContent = "call";
    callButton.style.backgroundColor = primaryColor;
    codeTextField.readOnly = false;

    // Remove Log Child
    while (log.firstChild) {
        log.removeChild(log.firstChild);
    }
    rtcPeerConnection.close();
    rtcPeerConnection = null;
    webSocket.close();
    webSocket = null;

    isConnected = false
}

// Chat Data Channel
function createChatDataChannel(dataChannel) {
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
            if (isChatHidden) {
                chatButtonIcon.textContent = "mark_chat_unread";
                chatButton.style.backgroundColor = "rgba(65, 147, 239)";
            }
        } else if (data.type === "disconnect") {
            disconnect()
        }
    };
    chatDataChannel.onopen = () => {
        chatButton.style.display = "inline-block";
    };
}