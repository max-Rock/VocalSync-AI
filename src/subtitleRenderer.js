/**
 * SubtitleRenderer manages the rendering of captions overlaying the HTML5 video player.
 * Supports various styling presets, typography, background styling, and interactive layouts (like Karaoke and TikTok).
 */
export class SubtitleRenderer {
  /**
   * @param {HTMLVideoElement} videoElement - The target video player
   * @param {HTMLDivElement} overlayContainer - The DOM element overlaying the video
   */
  constructor(videoElement, overlayContainer) {
    this.video = videoElement;
    this.container = overlayContainer;
    this.captions = []; // Array of { start, end, text, id }
    
    // Default Styling Settings
    this.settings = {
      preset: 'classic', // classic, netflix, tiktok, neon, meme, karaoke
      fontFamily: 'Inter',
      fontSize: 24, // in px
      color: '#ffffff',
      backgroundColor: '#000000',
      backgroundOpacity: 0.6,
      verticalPosition: 85, // percentage from top (85% = bottom)
      horizontalPosition: 50, // percentage from left (50% = center)
      textTransform: 'none', // none, uppercase, lowercase
    };

    // Keep track of the currently active caption ID to prevent unnecessary re-renders
    this.activeCaptionId = null;

    // Attach video listener
    this.video.addEventListener('timeupdate', () => this.update());

    // Setup pointer drag & resize listeners
    this.setupInteractivity();
  }

  /**
   * Sets up drag and resize listeners using event delegation.
   */
  setupInteractivity() {
    let isDragging = false;
    let isResizing = false;
    let startX = 0, startY = 0;
    let startFontSize = 24;

    this.container.addEventListener('pointerdown', (e) => {
      const wrapper = e.target.closest('.caption-wrapper');
      if (!wrapper) return;

      const isResizeHandle = e.target.classList.contains('resize-handle');
      
      e.preventDefault();
      
      if (isResizeHandle) {
        isResizing = true;
        startX = e.clientX;
        startFontSize = this.settings.fontSize;
      } else {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
      }

      const onPointerMove = (moveEvent) => {
        if (isDragging) {
          const rect = this.video.parentElement.getBoundingClientRect();
          const x = ((moveEvent.clientX - rect.left) / rect.width) * 100;
          const y = ((moveEvent.clientY - rect.top) / rect.height) * 100;
          
          this.settings.horizontalPosition = Math.max(5, Math.min(95, x));
          this.settings.verticalPosition = Math.max(5, Math.min(95, y));
          
          this.container.style.left = `${this.settings.horizontalPosition}%`;
          this.container.style.top = `${this.settings.verticalPosition}%`;
          
          // Sync vertical position slider
          const verticalSlider = document.getElementById('vertical-pos-slider');
          const verticalLabel = document.getElementById('vertical-pos-val');
          if (verticalSlider) verticalSlider.value = Math.round(this.settings.verticalPosition);
          if (verticalLabel) verticalLabel.textContent = Math.round(this.settings.verticalPosition);
        } else if (isResizing) {
          const deltaX = moveEvent.clientX - startX;
          const newSize = Math.max(14, Math.min(64, startFontSize + deltaX * 0.5));
          
          this.settings.fontSize = newSize;
          wrapper.style.fontSize = `${newSize}px`;
          
          // Sync font size slider
          const sizeSlider = document.getElementById('font-size-slider');
          const sizeLabel = document.getElementById('font-size-val');
          if (sizeSlider) sizeSlider.value = Math.round(newSize);
          if (sizeLabel) sizeLabel.textContent = Math.round(newSize);
        }
      };

      const onPointerUp = () => {
        isDragging = false;
        isResizing = false;
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    });
  }

  /**
   * Updates the caption list
   * @param {Array} newCaptions 
   */
  setCaptions(newCaptions) {
    this.captions = newCaptions.map((cap, index) => ({
      id: cap.id || `cap-${index}`,
      start: Number(cap.start),
      end: Number(cap.end),
      text: cap.text.trim()
    }));
    this.activeCaptionId = null;
    this.update();
  }

  /**
   * Updates the styling settings and forces a render update
   * @param {Object} newSettings 
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.activeCaptionId = null; // Reset to force re-render with new styles
    this.update();
  }

  /**
   * The core render cycle, executed on video timeupdate.
   */
  update() {
    if (!this.container) return;

    const currentTime = this.video.currentTime;
    
    // Find the caption segment that covers the current video time
    const active = this.captions.find(
      cap => currentTime >= cap.start && currentTime <= cap.end
    );

    if (!active) {
      this.container.innerHTML = '';
      this.container.style.display = 'none';
      this.activeCaptionId = null;
      return;
    }

    // If the active caption hasn't changed, skip rendering (except for Karaoke and TikTok styles which need constant updates)
    if (this.activeCaptionId === active.id && this.settings.preset !== 'karaoke' && this.settings.preset !== 'tiktok') {
      return;
    }

    this.activeCaptionId = active.id;
    this.container.style.display = 'flex';
    this.container.innerHTML = '';

    // Apply container horizontal and vertical positions
    this.container.style.top = `${this.settings.verticalPosition}%`;
    this.container.style.left = `${this.settings.horizontalPosition || 50}%`;
    this.container.style.transform = 'translate(-50%, -50%)';

    // Render based on preset style
    const wrapper = document.createElement('div');
    wrapper.className = `caption-wrapper preset-${this.settings.preset}`;
    this.applyBaseStyles(wrapper);

    // Make wrapper receive events for dragging/resizing
    wrapper.style.pointerEvents = 'auto';
    wrapper.style.position = 'relative';
    wrapper.style.cursor = 'move';
    wrapper.style.userSelect = 'none';

    if (this.settings.preset === 'karaoke') {
      this.renderKaraoke(wrapper, active, currentTime);
    } else if (this.settings.preset === 'tiktok') {
      this.renderTikTok(wrapper, active, currentTime);
    } else {
      // Standard render for classic, netflix, neon, meme
      const textNode = document.createElement('span');
      textNode.textContent = this.settings.textTransform === 'uppercase' 
        ? active.text.toUpperCase() 
        : active.text;
      
      wrapper.appendChild(textNode);
    }

    // Add a visual drag / resize handle inside the caption box
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    resizeHandle.innerHTML = '⤡';
    wrapper.appendChild(resizeHandle);

    this.container.appendChild(wrapper);
  }

  /**
   * Applies baseline typography, sizing, and color styling to the wrapper.
   */
  applyBaseStyles(element) {
    element.style.fontFamily = `"${this.settings.fontFamily}", sans-serif`;
    element.style.fontSize = `${this.settings.fontSize}px`;
    element.style.color = this.settings.color;
    element.style.textAlign = 'center';
    element.style.lineHeight = '1.4';
    element.style.padding = '4px 12px';
    element.style.borderRadius = '6px';
    element.style.wordBreak = 'break-word';
    element.style.maxWidth = '90%';

    const hexToRgba = (hex, opacity) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    // Apply styles depending on presets
    switch (this.settings.preset) {
      case 'netflix':
        element.style.backgroundColor = hexToRgba(this.settings.backgroundColor, this.settings.backgroundOpacity);
        element.style.textShadow = 'none';
        break;
      case 'tiktok':
        element.style.backgroundColor = hexToRgba(this.settings.backgroundColor, 0.95);
        element.style.fontWeight = '900';
        element.style.borderRadius = '12px';
        element.style.padding = '8px 18px';
        element.style.border = `3px solid ${this.settings.color}`;
        element.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
        break;
      case 'neon':
        element.style.backgroundColor = 'transparent';
        element.style.fontWeight = 'bold';
        element.style.textShadow = `0 0 5px ${this.settings.color}, 0 0 15px ${this.settings.color}, 0 0 30px ${this.settings.color}`;
        break;
      case 'meme':
        element.style.backgroundColor = 'transparent';
        element.style.fontFamily = '"Impact", "Arial Black", sans-serif';
        element.style.fontWeight = 'bold';
        element.style.textTransform = 'uppercase';
        element.style.webkitTextStroke = '1.5px black';
        element.style.textShadow = '2px 2px 0px #000';
        break;
      case 'karaoke':
        element.style.backgroundColor = hexToRgba(this.settings.backgroundColor, this.settings.backgroundOpacity);
        element.style.fontWeight = 'bold';
        break;
      case 'classic':
      default:
        element.style.backgroundColor = 'transparent';
        element.style.textShadow = '1px 1px 2px #000, -1px -1px 2px #000, 1px -1px 2px #000, -1px 1px 2px #000';
        break;
    }
  }

  /**
   * Renders Karaoke highlighting by splitting words and estimating durations.
   */
  renderKaraoke(wrapper, active, currentTime) {
    const words = active.text.split(/\s+/);
    if (words.length === 0) return;

    const duration = active.end - active.start;
    const wordDuration = duration / words.length;

    words.forEach((word, index) => {
      const wordStart = active.start + index * wordDuration;
      const wordEnd = wordStart + wordDuration;
      
      const span = document.createElement('span');
      span.textContent = word + ' ';
      
      if (currentTime >= wordStart && currentTime <= wordEnd) {
        // Highlight active word
        span.style.color = '#ffd700'; // Golden/Yellow highlight
        span.style.transform = 'scale(1.15)';
        span.style.display = 'inline-block';
        span.style.transition = 'transform 0.1s ease, color 0.1s ease';
      } else {
        span.style.color = this.settings.color;
        span.style.display = 'inline-block';
      }
      
      wrapper.appendChild(span);
    });
  }

  /**
   * Renders fast-paced TikTok style captions by showing fewer words at a time with a pop animation.
   */
  renderTikTok(wrapper, active, currentTime) {
    const words = active.text.split(/\s+/);
    if (words.length === 0) return;

    // Show 1-2 words at a time
    const wordsPerGroup = 2;
    const duration = active.end - active.start;
    const groupsCount = Math.ceil(words.length / wordsPerGroup);
    const groupDuration = duration / groupsCount;

    const currentGroupIndex = Math.min(
      Math.floor((currentTime - active.start) / groupDuration),
      groupsCount - 1
    );

    const startIndex = currentGroupIndex * wordsPerGroup;
    const visibleWords = words.slice(startIndex, startIndex + wordsPerGroup).join(' ');

    const textNode = document.createElement('span');
    textNode.textContent = visibleWords.toUpperCase();
    textNode.style.display = 'inline-block';
    
    // Trigger popup micro-animation
    textNode.style.animation = 'tiktokPop 0.15s ease-out';
    
    wrapper.appendChild(textNode);
  }
}
