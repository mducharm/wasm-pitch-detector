import "./TextEncoder.js";
import init, { WasmPitchDetector } from "./wasm-audio/wasm_audio.js";

class PitchProcessor extends AudioWorkletProcessor {
    constructor() {
        super();

        this.samples = [];
        this.totalSamples = 0;

        this.port.onmessage = (event) => this.onmessage(event.data);

        this.detector = null;
    }

    onmessage(event) {
        if (event.type === "send-wasm-module") {
            init(WebAssembly.compile(event.wasmBytes)).then(() => {
                this.port.postMessage({ type: 'wasm-module-loaded' });
            });
        } else if (event.type === 'init-detector') {
            const { sampleRate, numAudioSamplesPerAnalysis } = event;

            this.numAudioSamplesPerAnalysis = numAudioSamplesPerAnalysis;

            this.detector = WasmPitchDetector.new(sampleRate, numAudioSamplesPerAnalysis);

            this.samples = new Array(numAudioSamplesPerAnalysis).fill(0);
            this.totalSamples = 0;
        }
    };

    process(inputs, outputs) {
        const inputChannels = inputs[0];
        const inputSamples = inputChannels[0]; // array of samples

        // First: ensure buffer has enough samples to analyze
        if (this.totalSamples < this.numAudioSamplesPerAnalysis) {
            for (let val of inputSamples) {
                this.samples[this.totalSamples++] = val;
            }
        } else {
            // buffer is already full
            const numOfNewSamples = inputSamples.length;
            const numOfExistingSamples = this.samples.length - numOfNewSamples;

            for (let i = 0; i < numOfExistingSamples; i++) {
                this.samples[i] = this.samples[i + numOfNewSamples];
            }
            for (let i = 0; i < numOfNewSamples; i++) {
                this.samples[numOfExistingSamples + i] = inputSamples[i];
            }
            this.totalSamples += inputSamples.length;
        }

        // once buffer has enough samples, pass them to pitch detector
        if (this.totalSamples >= this.numAudioSamplesPerAnalysis && this.detector) {
            const result = this.detector.detect_pitch(this.samples);

            if (result !== 0) {
                this.port.postMessage({ type: "pitch", pitch: result });
            }
        }

        return true;
    }
}

registerProcessor("PitchProcessor", PitchProcessor);
