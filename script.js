// script.js

import * as micButton from './body/main/toolbar/mic-button.js';
import * as videocamButton from './body/main/toolbar/videocam-button.js';
import * as callButton from './body/main/toolbar/call-button.js';
import * as chatButton from './body/main/toolbar/chat-button.js';
import * as textField from './body/sidebar/text-field.js';

import * as main from './body/main/main.js';
import * as selfVideo from './body/main/videos/self-video.js';
import * as peerVideo from './body/main/videos/peer-video.js'
import { initializeMoveNet } from './body/main/videos/movenet.js';
import { createPixi } from './body/main/videos/pixi.js';

// Main
main.initialize();
peerVideo.initialize();
// Toolbar
micButton.initialize();
videocamButton.initialize();
callButton.initialize();
chatButton.initialize();
// Sidebar
textField.initialize();

// Get User Media
navigator.mediaDevices.getUserMedia({ video: {aspectRatio: 16 / 9}, audio: true })
    .then(stream => {
        micButton.setAudioTrack(stream.getAudioTracks()[0]);
        videocamButton.setVideoTrack(stream.getVideoTracks()[0]);
        selfVideo.setSourceObject(stream)
        const pixi = createPixi()
        initializeMoveNet(pixi, selfVideo.video);
    })
    .catch(err => console.error('Video Error:', err));
