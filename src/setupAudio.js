import PitchNode from "./PitchNode";

async function getAudioStream() {
    if (!window.navigator.mediaDevices)
        throw new Error("This browser does not support web audio.");

    try {
        const result = await window.navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false
        })

        return result;
    }
    catch (e) {
        switch (e.name) {
            case "NotAllowedError":
                throw new Error(
                    "A recording device was found but has been disallowed for this application. Enable the device in the browser settings."
                );

            case "NotFoundError":
                throw new Error(
                    "No recording device was found. Please attach a microphone and click Retry."
                );

            default:
                throw e;
        }
    }
}

export async function setupAudio(onPitchDetectedCallback) {
    const mediaStream = await getAudioStream();

    const context = new window.AudioContext();
    const audioSource = context.createMediaStreamSource(mediaStream);

    let node;

    try {
        const response = await window.fetch("wasm-audio/wasm_audio_bg.wasm");
        const wasmBytes = await response.arrayBuffer();

        const processorUrl = "PitchProcessor.js";

        try {
            await context.audioWorklet.addModule(processorUrl);
        } catch (err) {
            throw new Error(
                `Failed to load audio analyzer worklet at url: ${processorUrl}. Further info: ${err.message}`
            );
        }

        node = new PitchNode(context, "PitchProcessor");

        const numAudioSamplesPerAnalysis = 1024;

        node.init(wasmBytes, onPitchDetectedCallback, numAudioSamplesPerAnalysis)

        audioSource.connect(node);

        node.connect(context.destination);

    } catch (e) {
        throw new Error(
            `Failed to load audio analyzer WASM module. Further info: ${e.message}`
        );
    }

    return { context, node };
}