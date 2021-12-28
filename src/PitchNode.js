export default class PitchNode extends AudioWorkletNode {

    init(wasmBytes, onPitchDetectedCallback, numAudioSamplesPerAnalysis) {
        this.onPitchDetectedCallback = onPitchDetectedCallback;
        this.numAudioSamplesPerAnalysis = numAudioSamplesPerAnalysis;

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
                numAudioSamplesPerAnalysis: this.numAudioSamplesPerAnalysis
            });
        } else if (ev.type === "pitch") {
            this.onPitchDetectedCallback(ev.pitch);
        }
    }
}