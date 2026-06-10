import './style.css';
import { extractAudioData } from './audioProcessor.js';
import { transliterateDevanagariToHinglish, restoreEnglishLoanwords } from './transliterate.js';
import { SubtitleRenderer } from './subtitleRenderer.js';

// DOM Elements
const systemStatusText = document.getElementById('system-status-text');
const statusDot = document.querySelector('.status-dot');

const importDropZone = document.getElementById('import-drop-zone');
const videoFileInput = document.getElementById('video-file-input');
const browseBtn = document.getElementById('browse-btn');

const playerCard = document.getElementById('player-container-card');
const mainVideoPlayer = document.getElementById('main-video-player');
const subtitleOverlay = document.getElementById('subtitle-overlay-container');
const loadedFileName = document.getElementById('loaded-file-name');
const changeVideoBtn = document.getElementById('change-video-btn');

const stylingCard = document.getElementById('styling-options-card');
const presetButtons = document.querySelectorAll('.preset-btn');
const fontFamilySelect = document.getElementById('font-family-select');
const fontSizeSlider = document.getElementById('font-size-slider');
const fontSizeVal = document.getElementById('font-size-val');
const textColorPicker = document.getElementById('text-color-picker');
const textColorHex = document.getElementById('text-color-hex');
const bgColorPicker = document.getElementById('bg-color-picker');
const bgColorHex = document.getElementById('bg-color-hex');
const bgOpacitySlider = document.getElementById('bg-opacity-slider');
const bgOpacityVal = document.getElementById('bg-opacity-val');
const verticalPosSlider = document.getElementById('vertical-pos-slider');
const verticalPosVal = document.getElementById('vertical-pos-val');
const textTransformSelect = document.getElementById('text-transform-select');

const languageSelect = document.getElementById('language-select');
const modelSelect = document.getElementById('model-select');
const generateCaptionsBtn = document.getElementById('generate-captions-btn');
const generateBtnText = document.getElementById('generate-btn-text');

const progressContainer = document.getElementById('processing-progress-container');
const progressStatusTitle = document.getElementById('progress-status-title');
const progressPercentageLabel = document.getElementById('progress-percentage-label');
const progressBarFill = document.getElementById('progress-bar-fill');
const progressStatusDesc = document.getElementById('progress-status-desc');
const modelDownloadsList = document.getElementById('model-downloads-list');

const addCaptionCardBtn = document.getElementById('add-caption-card-btn');
const totalSegmentsBadge = document.getElementById('total-segments-badge');
const totalDurationBadge = document.getElementById('total-duration-badge');
const captionTimelineList = document.getElementById('caption-timeline-list');
const timelineEmptyState = document.getElementById('timeline-empty-state');
const exportSuiteContainer = document.getElementById('export-suite-container');
const exportSrtBtn = document.getElementById('export-srt-btn');
const exportVttBtn = document.getElementById('export-vtt-btn');
const exportJsonBtn = document.getElementById('export-json-btn');
const exportVideoBtn = document.getElementById('export-video-btn');

// App State
let activeFile = null;
let extractedAudioSamples = null;
let currentCaptions = []; // Array of { id, start, end, text }
let subtitleRendererInstance = null;

// Initialize application listeners
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
  setupFileUploadListeners();
  setupStylingListeners();
  setupAIControlListeners();
  setupTimelineListeners();
}

// System Status Helper
function updateStatus(text, type = 'idle') {
  systemStatusText.textContent = text;
  statusDot.className = 'status-dot';
  if (type === 'green') {
    statusDot.classList.add('green-glow');
  } else if (type === 'loading') {
    statusDot.classList.add('loading-glow');
  }
}

// -------------------------------------------------------------
// 1. File Upload / Import Panel
// -------------------------------------------------------------
function setupFileUploadListeners() {
  // Trigger file dialog
  browseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    videoFileInput.click();
  });
  
  importDropZone.addEventListener('click', () => {
    videoFileInput.click();
  });

  // Drag & drop handlers
  importDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    importDropZone.style.borderColor = 'var(--color-primary)';
    importDropZone.style.background = 'rgba(99, 102, 241, 0.05)';
  });

  importDropZone.addEventListener('dragleave', () => {
    importDropZone.style.borderColor = '';
    importDropZone.style.background = '';
  });

  importDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    importDropZone.style.borderColor = '';
    importDropZone.style.background = '';
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectedFile(e.dataTransfer.files[0]);
    }
  });

  videoFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleSelectedFile(e.target.files[0]);
    }
  });

  changeVideoBtn.addEventListener('click', resetVideoState);
}

function handleSelectedFile(file) {
  activeFile = file;
  loadedFileName.textContent = file.name;
  
  // Show player, hide upload box
  importDropZone.classList.add('hidden');
  playerCard.classList.remove('hidden');
  
  // Set video source
  const fileUrl = URL.createObjectURL(file);
  mainVideoPlayer.src = fileUrl;
  mainVideoPlayer.load();

  // Reset audio samples cache
  extractedAudioSamples = null;

  // Initialize Subtitle Renderer
  subtitleRendererInstance = new SubtitleRenderer(mainVideoPlayer, subtitleOverlay);
  applyStylingToRenderer();

  // Update button state
  generateCaptionsBtn.removeAttribute('disabled');
  generateBtnText.textContent = 'Transcribe & Generate Captions';
  updateStatus('Media loaded. Ready for transcription.', 'green');
}

function resetVideoState() {
  activeFile = null;
  extractedAudioSamples = null;
  currentCaptions = [];
  
  mainVideoPlayer.pause();
  mainVideoPlayer.removeAttribute('src');
  mainVideoPlayer.load();
  
  playerCard.classList.add('hidden');
  importDropZone.classList.remove('hidden');
  
  if (subtitleRendererInstance) {
    subtitleRendererInstance.setCaptions([]);
    subtitleRendererInstance = null;
  }
  
  generateCaptionsBtn.setAttribute('disabled', 'true');
  generateBtnText.textContent = 'Import a video to begin';
  
  clearTimeline();
  updateStatus('Client Engine Idle', 'idle');
}

// -------------------------------------------------------------
// 2. Styling Suite Panel
// -------------------------------------------------------------
function setupStylingListeners() {
  // Presets
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const preset = btn.getAttribute('data-preset');
      
      // Update styling picker inputs to match presets if necessary
      adjustPickersForPreset(preset);
      applyStylingToRenderer();
    });
  });

  // Fonts & text inputs
  fontFamilySelect.addEventListener('change', applyStylingToRenderer);
  fontSizeSlider.addEventListener('input', (e) => {
    fontSizeVal.textContent = e.target.value;
    applyStylingToRenderer();
  });

  textColorPicker.addEventListener('input', (e) => {
    textColorHex.textContent = e.target.value.toUpperCase();
    applyStylingToRenderer();
  });

  bgColorPicker.addEventListener('input', (e) => {
    bgColorHex.textContent = e.target.value.toUpperCase();
    applyStylingToRenderer();
  });

  bgOpacitySlider.addEventListener('input', (e) => {
    bgOpacityVal.textContent = e.target.value;
    applyStylingToRenderer();
  });

  verticalPosSlider.addEventListener('input', (e) => {
    verticalPosVal.textContent = e.target.value;
    applyStylingToRenderer();
  });

  textTransformSelect.addEventListener('change', applyStylingToRenderer);
}

function adjustPickersForPreset(preset) {
  if (preset === 'netflix') {
    fontFamilySelect.value = 'Inter';
    textColorPicker.value = '#ffffff';
    bgColorPicker.value = '#000000';
    bgOpacitySlider.value = '60';
  } else if (preset === 'tiktok') {
    fontFamilySelect.value = 'Poppins';
    textColorPicker.value = '#ffd700'; // Yellow
    bgColorPicker.value = '#000000';
    bgOpacitySlider.value = '100';
    textTransformSelect.value = 'uppercase';
  } else if (preset === 'neon') {
    fontFamilySelect.value = 'Orbitron';
    textColorPicker.value = '#00ffff'; // Cyan
    bgOpacitySlider.value = '0';
  } else if (preset === 'meme') {
    fontFamilySelect.value = 'Impact';
    textColorPicker.value = '#ffffff';
    bgOpacitySlider.value = '0';
    textTransformSelect.value = 'uppercase';
  } else if (preset === 'karaoke') {
    fontFamilySelect.value = 'Inter';
    textColorPicker.value = '#ffffff';
    bgColorPicker.value = '#000000';
    bgOpacitySlider.value = '50';
  }

  // Update slider label texts
  fontSizeVal.textContent = fontSizeSlider.value;
  textColorHex.textContent = textColorPicker.value.toUpperCase();
  bgColorHex.textContent = bgColorPicker.value.toUpperCase();
  bgOpacityVal.textContent = bgOpacitySlider.value;
}

function applyStylingToRenderer() {
  if (!subtitleRendererInstance) return;

  const activePresetBtn = document.querySelector('.preset-btn.active');
  const preset = activePresetBtn ? activePresetBtn.getAttribute('data-preset') : 'classic';

  subtitleRendererInstance.updateSettings({
    preset,
    fontFamily: fontFamilySelect.value,
    fontSize: Number(fontSizeSlider.value),
    color: textColorPicker.value,
    backgroundColor: bgColorPicker.value,
    backgroundOpacity: Number(bgOpacitySlider.value) / 100,
    verticalPosition: Number(verticalPosSlider.value),
    textTransform: textTransformSelect.value
  });
}

// -------------------------------------------------------------
// 3. AI Controller and Processing
// -------------------------------------------------------------
function setupAIControlListeners() {
  generateCaptionsBtn.addEventListener('click', async () => {
    if (!activeFile) return;
    
    // Disable inputs during processing
    setControlsDisabled(true);
    progressContainer.classList.remove('hidden');
    
    try {
      // Step 1: Extract audio samples if not already cached
      if (!extractedAudioSamples) {
        updateStatus('Extracting audio track...', 'loading');
        extractedAudioSamples = await extractAudioData(activeFile, (progress) => {
          updateAudioExtractionProgress(progress);
        });
      }

      // Step 2: Trigger Web Worker transcription
      updateStatus('Loading transcription model...', 'loading');
      startTranscriptionWorker();

    } catch (error) {
      console.error(error);
      alert(`Error processing video: ${error.message}`);
      setControlsDisabled(false);
      progressContainer.classList.add('hidden');
      updateStatus('Media processing failed.', 'idle');
    }
  });
}

function setControlsDisabled(disabled) {
  generateCaptionsBtn.disabled = disabled;
  languageSelect.disabled = disabled;
  modelSelect.disabled = disabled;
  videoFileInput.disabled = disabled;
  browseBtn.disabled = disabled;
  changeVideoBtn.disabled = disabled;
}

function updateAudioExtractionProgress(progress) {
  let percent = 0;
  if (progress.status === 'reading') percent = 10;
  else if (progress.status === 'decoding') percent = 40;
  else if (progress.status === 'resampling') percent = 75;
  else if (progress.status === 'complete') percent = 100;

  progressPercentageLabel.textContent = `${percent}%`;
  progressBarFill.style.width = `${percent}%`;
  progressStatusTitle.textContent = progress.status.charAt(0).toUpperCase() + progress.status.slice(1);
  progressStatusDesc.textContent = progress.message;
}

// -------------------------------------------------------------
// 4. Local Python Server Integration
// -------------------------------------------------------------
async function startTranscriptionWorker() {
  const selectedLang = languageSelect.value;
  const modelName = modelSelect.value;

  updateStatus('Connecting to local AI server...', 'loading');
  progressStatusTitle.textContent = 'Connecting to Local Server';
  progressStatusDesc.textContent = 'Contacting Python backend on port 8000...';
  progressBarFill.style.width = '10%';
  progressPercentageLabel.textContent = '10%';

  try {
    // Start simulated progress bar animation to keep user informed
    animateTranscriptionProgress();

    // Make the POST request sending the raw Float32Array PCM samples
    const response = await fetch('http://127.0.0.1:8000/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-Language': selectedLang,
        'X-Model-Size': modelName
      },
      body: extractedAudioSamples.buffer // Send raw PCM ArrayBuffer
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      const errorMsg = errorJson.detail || `Server returned status ${response.status}`;
      throw new Error(errorMsg);
    }

    const data = await response.json();
    
    if (transcribingInterval) clearInterval(transcribingInterval);

    if (data.status === 'success') {
      progressBarFill.style.width = '100%';
      progressPercentageLabel.textContent = '100%';
      handleTranscriptionCompletion(data.chunks);
    } else {
      throw new Error('Transcription did not return success status.');
    }

  } catch (error) {
    console.error('Transcription error:', error);
    if (transcribingInterval) clearInterval(transcribingInterval);
    
    alert(`Local Python Server Error: ${error.message}\n\nPlease make sure server.py is running on port 8000.\nRun command: python server.py`);
    
    setControlsDisabled(false);
    progressContainer.classList.add('hidden');
    updateStatus('Local transcription connection failed.', 'idle');
  }
}

// Simulated active transcribing loading bar animation
let transcribingInterval = null;
function animateTranscriptionProgress() {
  let progress = 0;
  progressBarFill.style.width = '0%';
  progressPercentageLabel.textContent = '0%';
  
  if (transcribingInterval) clearInterval(transcribingInterval);
  
  transcribingInterval = setInterval(() => {
    if (progress < 95) {
      progress += (95 - progress) * 0.08; // asymptotic progression
      const rounded = Math.round(progress);
      progressBarFill.style.width = `${rounded}%`;
      progressPercentageLabel.textContent = `${rounded}%`;
    }
  }, 350);
}

// -------------------------------------------------------------
// 5. Timeline Generation & Transliteration Pipeline
// -------------------------------------------------------------
function handleTranscriptionCompletion(rawChunks) {
  if (transcribingInterval) clearInterval(transcribingInterval);
  updateStatus('Transcription completed!', 'green');

  // Clear progress bars
  progressContainer.classList.add('hidden');
  setControlsDisabled(false);

  const targetLang = languageSelect.value;
  
  // Parse transcription output
  currentCaptions = rawChunks.map((chunk, idx) => {
    let cleanText = chunk.text.trim();
    
    // Process text translation / transliteration
    if (targetLang === 'hindi_code_switched') {
      // Keep Hindi in Devanagari, but restore English loanwords to Latin script
      cleanText = restoreEnglishLoanwords(cleanText);
    }
    
    const start = chunk.start !== undefined ? Number(chunk.start) : (chunk.timestamp && chunk.timestamp[0] !== null ? Number(chunk.timestamp[0]) : 0);
    const end = chunk.end !== undefined ? Number(chunk.end) : (chunk.timestamp && chunk.timestamp[1] !== null ? Number(chunk.timestamp[1]) : 3);
    
    return {
      id: `cap-${idx}-${Date.now()}`,
      start: start,
      end: end,
      text: cleanText
    };
  });

  // Sort captions chronologically just in case
  sortCaptions();
  
  // Render timeline elements
  renderTimelineList();
  
  // Push captions to renderer overlay
  if (subtitleRendererInstance) {
    subtitleRendererInstance.setCaptions(currentCaptions);
  }

  // Enable exporting
  exportSuiteContainer.classList.remove('hidden');
}

function sortCaptions() {
  currentCaptions.sort((a, b) => a.start - b.start);
}

// -------------------------------------------------------------
// 6. Interactive Subtitle Timeline Editor
// -------------------------------------------------------------
function setupTimelineListeners() {
  // Add Empty Card
  addCaptionCardBtn.addEventListener('click', () => {
    if (!subtitleRendererInstance) {
      alert('Please import a video first.');
      return;
    }

    const playheadTime = mainVideoPlayer.currentTime;
    const newCard = {
      id: `cap-manual-${Date.now()}`,
      start: Number(playheadTime.toFixed(2)),
      end: Number((playheadTime + 2.5).toFixed(2)),
      text: 'New Caption Text'
    };

    currentCaptions.push(newCard);
    sortCaptions();
    renderTimelineList();
    subtitleRendererInstance.setCaptions(currentCaptions);
    exportSuiteContainer.classList.remove('hidden');
  });

  // Export buttons
  exportSrtBtn.addEventListener('click', () => downloadSubtitleFile('srt'));
  exportVttBtn.addEventListener('click', () => downloadSubtitleFile('vtt'));
  exportJsonBtn.addEventListener('click', () => downloadSubtitleFile('json'));
  exportVideoBtn.addEventListener('click', () => renderEditedVideo());

  // Highlight and focus matching timeline item during video playback
  mainVideoPlayer.addEventListener('timeupdate', highlightActiveTimelineItem);
}

function clearTimeline() {
  captionTimelineList.innerHTML = '';
  timelineEmptyState.classList.remove('hidden');
  exportSuiteContainer.classList.add('hidden');
  totalSegmentsBadge.textContent = '0 Segments';
  totalDurationBadge.textContent = '0:00 Duration';
}

function renderTimelineList() {
  if (currentCaptions.length === 0) {
    clearTimeline();
    return;
  }

  timelineEmptyState.classList.add('hidden');
  captionTimelineList.innerHTML = '';

  // Calculate duration
  const lastCap = currentCaptions[currentCaptions.length - 1];
  const totalDuration = lastCap ? lastCap.end : 0;
  const mins = Math.floor(totalDuration / 60);
  const secs = Math.floor(totalDuration % 60);
  
  totalSegmentsBadge.textContent = `${currentCaptions.length} Segments`;
  totalDurationBadge.textContent = `${mins}:${String(secs).padStart(2, '0')} Duration`;

  currentCaptions.forEach((cap) => {
    const card = document.createElement('div');
    card.className = 'caption-card';
    card.id = `timeline-card-${cap.id}`;
    card.setAttribute('data-id', cap.id);

    card.innerHTML = `
      <div class="card-meta-row">
        <div class="card-time-inputs">
          <input type="text" class="card-time-in" data-field="start" value="${cap.start.toFixed(2)}" title="Start Time (seconds)" />
          <span class="card-time-sep">➔</span>
          <input type="text" class="card-time-out" data-field="end" value="${cap.end.toFixed(2)}" title="End Time (seconds)" />
        </div>
        <div class="card-buttons">
          <button class="card-icon-btn card-jump-btn" title="Jump video playhead to start time">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </button>
          <button class="card-icon-btn card-icon-btn-danger card-delete-btn" title="Delete subtitle segment">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
      <textarea class="card-text-textarea" placeholder="Enter caption text...">${cap.text}</textarea>
    `;

    // Hook events inside the card
    const startInput = card.querySelector('input[data-field="start"]');
    const endInput = card.querySelector('input[data-field="end"]');
    const textarea = card.querySelector('.card-text-textarea');
    const jumpBtn = card.querySelector('.card-jump-btn');
    const deleteBtn = card.querySelector('.card-delete-btn');

    // 1. Time edit
    const onTimeChange = () => {
      const startVal = Number(startInput.value);
      const endVal = Number(endInput.value);
      
      if (!isNaN(startVal) && !isNaN(endVal) && startVal >= 0 && endVal >= startVal) {
        cap.start = startVal;
        cap.end = endVal;
        
        // Dynamic re-sort and live update
        sortCaptions();
        if (subtitleRendererInstance) {
          subtitleRendererInstance.setCaptions(currentCaptions);
        }
      }
    };
    startInput.addEventListener('change', onTimeChange);
    endInput.addEventListener('change', onTimeChange);

    // 2. Text edit
    textarea.addEventListener('input', (e) => {
      cap.text = e.target.value;
      if (subtitleRendererInstance) {
        subtitleRendererInstance.setCaptions(currentCaptions);
      }
    });

    // 3. Jump head playhead
    jumpBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mainVideoPlayer.currentTime = cap.start;
      mainVideoPlayer.play();
    });

    // 4. Delete segment
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentCaptions = currentCaptions.filter(c => c.id !== cap.id);
      renderTimelineList();
      if (subtitleRendererInstance) {
        subtitleRendererInstance.setCaptions(currentCaptions);
      }
    });

    // Jump to timeline item on card body click
    card.addEventListener('click', () => {
      mainVideoPlayer.currentTime = cap.start;
    });

    captionTimelineList.appendChild(card);
  });
}

// Automatically highlight and scroll to active subtitle item on playhead update
let activeCardId = null;
function highlightActiveTimelineItem() {
  if (currentCaptions.length === 0) return;
  
  const time = mainVideoPlayer.currentTime;
  const active = currentCaptions.find(c => time >= c.start && time <= c.end);
  
  // Remove previous highlights
  const cards = captionTimelineList.querySelectorAll('.caption-card');
  cards.forEach(c => c.classList.remove('active'));

  if (active) {
    const activeCard = document.getElementById(`timeline-card-${active.id}`);
    if (activeCard) {
      activeCard.classList.add('active');
      
      // Prevent constant jumping scroll requests if playing the same segment
      if (activeCardId !== active.id) {
        activeCardId = active.id;
        
        // Scroll inside container smoothly
        captionTimelineList.scrollTo({
          top: activeCard.offsetTop - captionTimelineList.offsetTop - 20,
          behavior: 'smooth'
        });
      }
    }
  } else {
    activeCardId = null;
  }
}

// -------------------------------------------------------------
// 7. Subtitle Export Generators (.SRT / .VTT / .JSON)
// -------------------------------------------------------------
function downloadSubtitleFile(format) {
  if (currentCaptions.length === 0) return;

  let content = '';
  let mimeType = 'text/plain';
  let fileExtension = format;

  if (format === 'srt') {
    content = generateSrtFormat();
    mimeType = 'text/srt';
  } else if (format === 'vtt') {
    content = generateVttFormat();
    mimeType = 'text/vtt';
  } else if (format === 'json') {
    content = JSON.stringify(currentCaptions, null, 2);
    mimeType = 'application/json';
  }

  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  const baseName = activeFile ? activeFile.name.split('.').slice(0, -1).join('.') : 'subtitle';
  a.href = url;
  a.download = `${baseName}_subtitle.${fileExtension}`;
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generateSrtFormat() {
  return currentCaptions.map((cap, idx) => {
    return `${idx + 1}\n${formatTime(cap.start, false)} --> ${formatTime(cap.end, false)}\n${cap.text}\n`;
  }).join('\n');
}

function generateVttFormat() {
  const header = 'WEBVTT\n\n';
  const body = currentCaptions.map((cap, idx) => {
    return `${idx + 1}\n${formatTime(cap.start, true)} --> ${formatTime(cap.end, true)}\n${cap.text}\n`;
  }).join('\n');
  return header + body;
}

// Helper: Formats seconds to HH:MM:SS,mmm (SRT) or HH:MM:SS.mmm (VTT)
function formatTime(seconds, isVtt = false) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  const pad = (num, len) => String(num).padStart(len, '0');
  const sep = isVtt ? '.' : ',';

  return `${pad(hrs, 2)}:${pad(mins, 2)}:${pad(secs, 2)}${sep}${pad(ms, 3)}`;
}

// -------------------------------------------------------------
// 8. Video Export
// -------------------------------------------------------------
async function renderEditedVideo() {
  if (!activeFile || currentCaptions.length === 0) return;

  const exportVideoBtn = document.getElementById('export-video-btn');
  const originalText = exportVideoBtn.innerHTML;
  exportVideoBtn.innerHTML = '<span class="status-dot loading-glow" style="display:inline-block; margin-right:8px;"></span> Rendering on GPU...';
  exportVideoBtn.disabled = true;

  try {
    const styleConfig = {
      fontFamily: fontFamilySelect.value,
      fontSize: fontSizeVal.textContent.replace('px', ''),
      textColor: textColorHex.textContent,
      bgColor: bgColorHex.textContent,
      bgOpacity: bgOpacityVal.textContent.replace('%', ''),
      verticalPos: verticalPosVal.textContent.replace('%', ''),
      textTransform: textTransformSelect.value
    };

    const formData = new FormData();
    formData.append('video', activeFile);
    formData.append('captions', JSON.stringify(currentCaptions));
    formData.append('styleConfig', JSON.stringify(styleConfig));

    const response = await fetch('http://127.0.0.1:8000/render', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server returned ${response.status}: ${errorText}`);
    }

    const blob = await response.blob();
    
    // File Save Flow
    const defaultFileName = `${activeFile.name.split('.').slice(0, -1).join('.')}_captioned.mp4`;
    
    if (window.showSaveFilePicker) {
      try {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: defaultFileName,
          types: [{
            description: 'MP4 Video',
            accept: { 'video/mp4': ['.mp4'] },
          }],
        });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
      } catch (err) {
        if (err.name !== 'AbortError') throw err;
      }
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = defaultFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    
    alert('Video export complete!');
  } catch (err) {
    console.error('Render Error:', err);
    alert(`Video rendering failed: ${err.message}`);
  } finally {
    exportVideoBtn.innerHTML = originalText;
    exportVideoBtn.disabled = false;
  }
}
