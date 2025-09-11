// websocket.js

const codeTextField = document.getElementById("code")

let webSocket;
let isConnected = false;

window.addEventListener("callbuttonclick", (event) => {
    if (event.detail.isTurningOn) {
        connect();
    } else {
        disconnect();
    }
});
window.addEventListener("peerstatechange", (event) => {
    if (event.detail.state === "disconnected") {
        disconnect()
    }
});

window.addEventListener("signal", (event) => {
    webSocket.send(event.detail)
});

function connect() {
    codeTextField.readOnly = true;

    webSocket = new WebSocket("wss://koyu.ddns.net/ws/");

    webSocket.onopen = () => {
        console.log('WebSocket Open');

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

        window.dispatchEvent(new CustomEvent("websocketmessage", { detail: data }));
    });

    webSocket.onclose = () => {
        console.log('WebSocket Close');
    };
}

function disconnect() {
    codeTextField.readOnly = false;

    webSocket.close();
    webSocket = null;
}