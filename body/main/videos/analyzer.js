// analyzer.js

export function analyzeAudio(stream, audioVisualizer) {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const spectrumData = new Uint8Array(analyser.frequencyBinCount);
    source.connect(analyser);

    function updateBorder() {
        analyser.getByteFrequencyData(spectrumData);
        const volume = spectrumData.reduce((a, b) => a + b) / spectrumData.length;
        audioVisualizer.style.display = (volume > 20) ? "block" : "none";
        requestAnimationFrame(updateBorder);
    }
    updateBorder();
}
