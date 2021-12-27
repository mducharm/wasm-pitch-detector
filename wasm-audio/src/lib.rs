use pitch_detection::{McLeodDetector, PitchDetector};
use wasm_bindgen::prelude::*;

mod utils;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

// #[wasm_bindgen]
// extern {
//     fn alert(s: &str);
// }

// #[wasm_bindgen]
// pub fn greet() {
//     alert("Hello, wasm-audio!");
// }

#[wasm_bindgen]
pub struct WasmPitchDetector {
    sample_rate: usize,
    fft_size: usize,
    detector: McLeodDetector<f32>,
}

impl WasmPitchDetector {
    pub fn new(sample_rate: usize, fft_size: usize) -> WasmPitchDetector {
        utils::set_panic_hook();

        let fft_pad = fft_size / 2;

        WasmPitchDetector {
            sample_rate,
            fft_size,
            detector: McLeodDetector::<f32>::new(fft_size, fft_pad),
        }
    }

    pub fn detect_pitch(&mut self, audio_samples: Vec<f32>) -> f32 {
        if audio_samples.len() < self.fft_size {
            panic!("Insufficient samples passed to detect_pitch. Got {} instead of array containing {} elements", audio_samples.len(), self.fft_size)
        }

        const POWER_THRESHOLD: f32 = 5.0;

        todo!();
    }
}
