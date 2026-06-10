/**
 * Extracts and resamples audio from a video/audio file to 16kHz mono Float32Array
 * as required by the Whisper model.
 * 
 * @param {File} file - The uploaded video or audio file
 * @param {Function} onProgress - Callback function for processing progress
 * @returns {Promise<Float32Array>} - The processed audio samples
 */
export async function extractAudioData(file, onProgress = () => {}) {
  onProgress({ status: 'reading', message: 'Reading file data...' });
  const arrayBuffer = await file.arrayBuffer();

  onProgress({ status: 'decoding', message: 'Decoding audio track from video...' });
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error('Web Audio API is not supported in this browser.');
  }

  const audioCtx = new AudioContextClass();
  
  let audioBuffer;
  try {
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  } catch (error) {
    console.error('Error decoding audio:', error);
    throw new Error('Failed to decode audio track. Please check if the video file has a valid audio stream.');
  } finally {
    await audioCtx.close();
  }

  onProgress({ status: 'resampling', message: 'Resampling audio to 16kHz mono...' });
  const targetSampleRate = 16000;
  const numberOfChannels = 1; // Mono
  const duration = audioBuffer.duration;
  const length = Math.floor(duration * targetSampleRate);

  const OfflineAudioContextClass = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const offlineCtx = new OfflineAudioContextClass(numberOfChannels, length, targetSampleRate);

  // Create a buffer source node
  const bufferSource = offlineCtx.createBufferSource();
  bufferSource.buffer = audioBuffer;
  bufferSource.connect(offlineCtx.destination);
  bufferSource.start();

  // Perform the offline render
  const renderedBuffer = await offlineCtx.startRendering();
  
  // Return the float32 array
  const rawData = renderedBuffer.getChannelData(0);
  
  onProgress({ status: 'complete', message: 'Audio extraction complete.', duration });
  return rawData;
}
