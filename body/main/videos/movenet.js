// movenet.js

import { createCircleGraphic } from '/body/main/videos/pixi.js'

let detector;
let leftWristCircle, leftElbowCircle, leftHandCircle;
let rightWristCircle, rightElbowCircle, rightHandCircle;
let circleRadius = 36;

export async function initializeMoveNet(pixi, video) {
    detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
    );
    
    leftWristCircle = createCircleGraphic(pixi, 0x009ad6, 2);
    leftElbowCircle = createCircleGraphic(pixi, 0x009ad6, 2);
    leftHandCircle = createCircleGraphic(pixi, 0x009ad6, circleRadius);

    rightWristCircle = createCircleGraphic(pixi, 0xed1a3d, 2);
    rightElbowCircle = createCircleGraphic(pixi, 0xed1a3d, 2);
    rightHandCircle = createCircleGraphic(pixi, 0xed1a3d, circleRadius);

    async function detectHands() {
        if (video.readyState < 2) {
            requestAnimationFrame(detectHands);
            return;
        }
        const poses = await detector.estimatePoses(
            video, 
            {
                maxPoses: 1,
                flipHorizontal: true
            }
        );
        
        if (poses.length > 0) {
            const pixiWidth = pixi.renderer.width;
            const videoScale = pixiWidth / video.videoWidth;

            // Set Left Circle Scale
            leftWristCircle.scale.set(videoScale);
            leftElbowCircle.scale.set(videoScale);
            leftHandCircle.scale.set(videoScale);
            // Set Right Circle Scale
            rightWristCircle.scale.set(videoScale);
            rightElbowCircle.scale.set(videoScale);
            rightHandCircle.scale.set(videoScale);

            // Keypoints
            const keypoints = poses[0].keypoints;
            const leftWrist = keypoints.find(p => p.name === "left_wrist");
            const leftElbow = keypoints.find(p => p.name === "left_elbow");
            const rightWrist = keypoints.find(p => p.name === "right_wrist");
            const rightElbow = keypoints.find(p => p.name === "right_elbow");

            // Detect Left Hand
            positionCircles(leftWrist, leftElbow, leftWristCircle, leftElbowCircle, leftHandCircle, pixiWidth, videoScale);
            // Detect Right Hand 
            positionCircles(rightWrist, rightElbow, rightWristCircle, rightElbowCircle, rightHandCircle, pixiWidth, videoScale);
        }
        requestAnimationFrame(detectHands);
    }
    detectHands();
}

function positionCircles(wrist, elbow, wristCircle, elbowCircle, handCircle, pixiWidth, videoScale) {
    // Wrist
    if (wrist.score > 0.3) {
        // Left Circle 
        wristCircle.x = pixiWidth - wrist.x * videoScale;
        wristCircle.y = wrist.y * videoScale;
        wristCircle.visible = true;

        let leftHandX;
        let leftHandY;

        // Elbow
        if (elbow.score > 0.2) {
            // Elbow Circle
            elbowCircle.x = pixiWidth - elbow.x * videoScale;
            elbowCircle.y = elbow.y * videoScale;
            elbowCircle.visible = true;

            const dx = wrist.x - elbow.x;
            const dy = wrist.y - elbow.y;
            leftHandX = wrist.x + circleRadius * dx / Math.hypot(dx, dy);
            leftHandY = wrist.y + circleRadius * dy / Math.hypot(dx, dy);
        } else {
            leftHandX = wrist.x
            leftHandY = wrist.y
        }
        // Hand Circle
        handCircle.x = pixiWidth - leftHandX * videoScale;
        handCircle.y = leftHandY * videoScale;
        handCircle.visible = true;
    } else {
        wristCircle.visible = false;
        elbowCircle.visible = false;
        handCircle.visible = false;
    }
}