const videocamMenuButton = document.getElementById("videocam-menu-button");
const videocamMenuButtonIcon = videocamMenuButton.querySelector(".material-symbols-rounded");
const videocamMenu = document.getElementById("videocam-menu");
const videocamName = document.getElementById("videocam-name");
const videocamList = document.getElementById("videocam-list");
const selfVideo = document.getElementById("self-video")

let isOn = false;
let deviceId;

// ボタン押下でポップアップを開く
videocamMenuButton.addEventListener("click", async () => {
    if (!isOn) {
        await turnOn();
    } else {
        turnOff();
    }
    
});

async function turnOn() {
    await showVideocamMenu();
    videocamMenu.style.display = "block";
    videocamMenuButtonIcon.textContent = "keyboard_arrow_up";
    isOn = true;
}

function turnOff() {
    videocamMenu.style.display = "none";
    videocamMenuButtonIcon.textContent = "keyboard_arrow_down";
    isOn = false;
}

// カメラ一覧を取得してリストに反映
async function showVideocamMenu() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(d => d.kind === "videoinput");

    videocamList.innerHTML = "";
    videoDevices.forEach((device, index) => {
        const li = document.createElement("li");
        li.textContent = device.label || `Camera ${index + 1}`;
        li.onclick = () => {
            switchCamera(device.deviceId);
            deviceId = device.deviceId;
            videocamName.textContent = li.textContent;
            videocamList.style.display = "none";
        };
        videocamList.appendChild(li);
    });

    // 現在のカメラを表示
    const current = videoDevices.find(d => d.deviceId === deviceId) || videoDevices[0];
    deviceId = current.deviceId;
    videocamName.textContent = current.label || "Camera";
}

// カメラ切り替え
async function switchCamera(deviceId) {
    selfVideo.srcObject.getTracks().forEach(track => track.stop());
    const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
        audio: true
    });
    selfVideo.srcObject = newStream;
    selfVideo.play()
}

// hoverでリスト表示 / 非表示
videocamName.addEventListener("mouseenter", () => {
    videocamList.style.display = "block";
});
videocamMenu.addEventListener("mouseleave", () => {
    videocamList.style.display = "none";
});

document.addEventListener("click", (event) => {
    if (videocamMenu.style.display === "block") {
        if (!videocamMenu.contains(event.target) && !videocamMenuButton.contains(event.target)) {
            turnOff();
        }
    }
});