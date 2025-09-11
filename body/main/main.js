// main.js

const main = document.querySelector('main');
const toolbar = document.getElementById('toolbar')

let isSidebarHidden = true

export function initialize() {
    // Window Event Listener
    window.addEventListener('resize', () => {
        setWindowInnerHeight()
        resizeVideos()
    });
    setWindowInnerHeight()
    resizeVideos()

    window.addEventListener("chatbuttonclick", (event) => {
        isSidebarHidden = !event.detail.isTurningOn;
        resizeVideos();
    });
    window.addEventListener("callbuttonclick", (event) => {
        if (!event.detail.isTurningOn) {
            isSidebarHidden = true;
            resizeVideos();
        }
    });
    window.addEventListener("peerstatechange", (event) => {
        if (event.detail.state === "disconnected") {
            isSidebarHidden = true;
            resizeVideos();
        }
    });
}

// Set Window Inner Height
function setWindowInnerHeight() {
    const vh = window.innerHeight;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}
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
    const gridWidth = isSidebarHidden
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
