import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js environment for browser worker
env.allowLocalModels = false;

let transcriber = null;

self.addEventListener('message', async (event) => {
  const { audioData, language, task, modelName = 'Xenova/whisper-tiny' } = event.data;

  try {
    if (!transcriber) {
      self.postMessage({ status: 'loading', message: 'Initializing Whisper transcription model...' });

      transcriber = await pipeline('automatic-speech-recognition', modelName, {
        quantized: false,
        dtype: 'fp32',
        progress_callback: (data) => {
          if (data.status === 'progress') {
            self.postMessage({
              status: 'loading_progress',
              file: data.file,
              progress: data.progress,
              loaded: data.loaded,
              total: data.total
            });
          } else if (data.status === 'ready') {
            self.postMessage({
              status: 'loading_ready',
              file: data.file
            });
          }
        }
      });

      self.postMessage({ status: 'ready', message: 'Model loaded successfully.' });
    }

    self.postMessage({ status: 'transcribing', message: 'Analyzing audio track and generating captions...' });

    const options = {
      chunk_length_s: 30,
      stride_length_s: 5,
      return_timestamps: true,
    };

    if (language) {
      options.language = language;
      
      // Inject a prompt to guide Whisper on the vocabulary and language style (prevents distortions)
      if (language === 'hindi') {
        options.prompt = "नमस्ते दोस्तों, आज हम इस वीडियो में बात करेंगे, computer, internet, subscribe, like, share, captions, video editing.";
      } else if (language === 'english') {
        options.prompt = "Hello everyone, in this video we are going to talk about...";
      }
    }
    if (task) {
      options.task = task;
    }

    const startTime = performance.now();
    const result = await transcriber(audioData, options);
    const endTime = performance.now();
    const durationSec = ((endTime - startTime) / 1000).toFixed(2);

    self.postMessage({
      status: 'complete',
      chunks: result.chunks,
      text: result.text,
      durationSec
    });

  } catch (error) {
    console.error('Worker error:', error);
    self.postMessage({
      status: 'error',
      message: error.message || 'An error occurred during audio transcription.'
    });
  }
});
