export default class PitchNode extends AudioWorkletNode {

    init(wasmBytes, onPitchDetectedCallback, numOfSamplesPerAnalysis) {
        this.onPitchDetectedCallback = onPitchDetectedCallback;
        this.numOfSamplesPerAnalysis = numOfSamplesPerAnalysis;

        this.port.onmessage = (ev) => this.onmessage(ev.data);

        this.port.postMessage({
            type: "send-wasm-module",
            wasmBytes
        });
    }

    onprocessorerror(err) {
        console.log(`An error from AudioWorkletProcessor.process() occurred: ${err}`);
    }

    onmessage(ev) {
        if (ev.type === 'wasm-module-loaded') {
            this.port.postMessage({
                type: "init-detector",
                sampleRate: this.context.sampleRate,
                numAudioSamplesPerAnalysis: this.numOfSamplesPerAnalysis
            });
        } else if (ev.type === "pitch") {
            this.onPitchDetectedCallback(ev.pitch);
        }
    }
}