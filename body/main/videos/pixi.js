// pixi.js

// PixiJS
export function createPixi() {
    const pixi = new PIXI.Application({
        resizeTo: document.querySelector('.video-wrapper'),
        transparent: true
    });
    document.querySelector('.video-wrapper').appendChild(pixi.view);

    pixi.view.style.position = "absolute";
    pixi.view.style.top = "0";
    pixi.view.style.left = "0";
    pixi.view.style.pointerEvents = "none";

    pixi.renderer.resize(
        pixi.view.parentElement.clientWidth,
        pixi.view.parentElement.clientHeight
    );

    return pixi
}

export function createCircleGraphic(pixi, color, radius) {
    const graphic = new PIXI.Graphics();
    graphic.beginFill(color, 0.3);
    graphic.drawCircle(0, 0, radius);
    graphic.endFill();
    graphic.visible = false;
    pixi.stage.addChild(graphic);
    return graphic;
}