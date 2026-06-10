# VocalSync AI - Multilingual Video Captioning & Styling Suite 🎬✨

VocalSync AI is a premium, local-first web application designed to automatically generate, style, edit, and burn-in multilingual captions for video and audio content. 

Built specifically to handle bilingual code-switched Hinglish/Hindi-English speech, VocalSync AI utilizes advanced Whisper transcription models to recognize spoken audio, automatically keeping English loanwords in Latin script while transcribing Hindi speech in proper Devanagari script. It also supports direct translation of spoken Hindi to English captions, alongside a robust customization dashboard.

---

## 🚀 Key Features

*   **Local AI Transcription Engine**: Powered by `faster-whisper` running locally on your machine. Infers on NVIDIA GPU (CUDA) with automated fallback to CPU.
*   **Intelligent Bilingual Hinglish Support**:
    *   **Devanagari + Latin Code-Switching**: Automatically transcribes mixed Hindi/English speech. Keeps common English terms (e.g., *subscribe*, *internet*, *computer*, *video*) in English script, and Hindi phrases in Devanagari.
    *   **Loanword Restorer**: A robust local text processing dictionary maps phonetic Devanagari loanwords back to standard English spelling (e.g., लक्जरी ➔ *luxury*, वीडियो ➔ *video*).
*   **English Translation**: Transcribes and translates spoken Hindi audio directly into clean English captions.
*   **Interactive Subtitle Timeline Editor**:
    *   Add, delete, or modify subtitle text and timing parameters on a scrollable dashboard.
    *   Auto-scrolls to the active subtitle card during video playback.
*   **Caption Styling Suite**:
    *   **Graphics Presets**: Apply pre-made subtitle designs with one click, including **TikTok**, **Netflix**, **Neon**, **Classic**, **Meme**, and **Karaoke**.
    *   **Typography Dashboard**: Tweak font families (Inter, Poppins, Montserrat, Orbitron, Playfair Display, Impact), size, colors, background box opacity, vertical alignment, and letter cases (standard vs. uppercase).
*   **Multi-Format Export**:
    *   Download caption files as standard `.SRT`, `.VTT`, or raw JSON files.
*   **Hardware-Accelerated Video Burn-in**:
    *   Burn your custom-styled captions directly into your video file.
    *   Utilizes your NVIDIA GPU (`h264_nvenc`) for blazing-fast hardware-accelerated video rendering.

---

## 🛠️ Prerequisites & Requirements

### Hardware
*   **CPU**: Multi-core processor (Intel/AMD).
*   **GPU**: NVIDIA Graphics Card (e.g., NVIDIA RTX 3050 or higher) with CUDA and cuDNN capabilities is highly recommended for real-time model loading, fast transcription, and NVENC-accelerated video rendering.

### Software Runtimes
*   **Python**: Version `3.10` to `3.13` (Python 3.13 recommended).
*   **Node.js**: Version `18.x` or higher (includes `npm`).
*   **FFmpeg**: Handled automatically via `imageio-ffmpeg` in Python, but a system-wide FFmpeg installation with libass support is also compatible.

---

## ⚙️ Local Setup & Installation

Follow these steps to set up VocalSync AI on your local Windows/Linux environment:

### 1. Clone the Repository
```bash
git clone https://github.com/max-Rock/VocalSync-AI.git
cd VocalSync-AI
```

### 2. Set Up the Python Backend
The Python server handles transcription processing and FFmpeg video rendering.

```bash
# Install required Python packages
pip install fastapi uvicorn faster-whisper numpy imageio-ffmpeg python-multipart

# (Recommended for NVIDIA GPU acceleration) Install CUDA & cuDNN DLL packages via pip
pip install nvidia-cublas-cu12 nvidia-cudnn-cu12
```

### 3. Set Up the Frontend Client
The frontend is built using Vite, Vanilla JavaScript, and Vanilla CSS.

```bash
# Install frontend dependencies
npm install
```

---

## 🚦 How to Run

To run VocalSync AI, you will need to start both the backend FastAPI server and the frontend Vite server.

### Step 1: Start the Python Backend
Run the following command in your terminal:
```bash
python server.py
```
*The server will load on `http://127.0.0.1:8000`. It will attempt to register CUDA DLLs for GPU inference (in `float16` precision) and fallback to CPU (`int8` quantization) if an NVIDIA GPU/CUDA is unavailable.*

### Step 2: Start the Vite Development Server
In a new terminal window, run:
```bash
npm run dev
```
*This starts the Vite development server (usually on `http://localhost:5173`). Open this URL in your web browser to access the application.*

---

## 💻 Technology Stack

*   **Frontend Client**: Vite, HTML5, Vanilla JavaScript (ES Modules), Vanilla CSS (glassmorphism dashboard), Lucide Icons, Google Fonts (Inter, Montserrat, Orbitron, Poppins).
*   **Backend Server**: FastAPI, Uvicorn, Python.
*   **Machine Learning / AI**: `faster-whisper` (utilizing Whisper-medium/large-v3 models under CTranslate2).
*   **Media Processing**: FFmpeg (via `imageio-ffmpeg` utilizing the `h264_nvenc` NVENC encoder and `ass` subtitle filters).

---

## 📂 Project Structure

```
VocalSync-AI/
├── src/
│   ├── assets/              # Logo, static files, and icons
│   ├── audioProcessor.js    # Extracts and resamples audio from videos to 16kHz mono Float32
│   ├── main.js              # Application controller, event handling, and endpoint requests
│   ├── style.css            # Responsive, dark-themed glassmorphism CSS styling
│   ├── subtitleRenderer.js  # Controls real-time client-side ASS/VTT subtitles overlaying
│   ├── transliterate.js     # Post-processing to restore English loanwords and spacing
│   └── whisperWorker.js     # Web worker configurations
├── index.html               # Main application entry point layout
├── server.py                # FastAPI server (Whisper transcription & FFmpeg rendering)
├── package.json             # npm dependencies and scripts
└── README.md                # Project documentation
```

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve the transcription dictionary, add style presets, or optimize the rendering pipeline:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/NewFeature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/NewFeature`).
5. Open a Pull Request.

License: MIT
