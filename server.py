import os
import sys
import numpy as np
import json
import uuid
import subprocess
from fastapi import FastAPI, Header, HTTPException, Request, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
import uvicorn
import imageio_ffmpeg


# Enable unbuffered/line-buffered stdout with UTF-8 encoding
sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

# Register NVIDIA CUDA & cuDNN DLLs to PATH on Windows if installed via pip
if sys.platform == "win32":
    try:
        import nvidia.cublas
        import nvidia.cudnn
        
        def get_pkg_dir(module):
            if hasattr(module, "__path__") and module.__path__:
                return list(module.__path__)[0]
            if hasattr(module, "__file__") and module.__file__:
                return os.path.dirname(module.__file__)
            return None

        cublas_dir = get_pkg_dir(nvidia.cublas)
        cudnn_dir = get_pkg_dir(nvidia.cudnn)

        if cublas_dir and cudnn_dir:
            cublas_bin = os.path.join(cublas_dir, "bin")
            cudnn_bin = os.path.join(cudnn_dir, "bin")
            if os.path.exists(cublas_bin):
                os.add_dll_directory(cublas_bin)
                os.environ["PATH"] = cublas_bin + os.pathsep + os.environ["PATH"]
                print(f"[AI Engine] Registered CUDA DLL path: {cublas_bin}")
            if os.path.exists(cudnn_bin):
                os.add_dll_directory(cudnn_bin)
                os.environ["PATH"] = cudnn_bin + os.pathsep + os.environ["PATH"]
                print(f"[AI Engine] Registered CuDNN DLL path: {cudnn_bin}")
        else:
            print("[AI Engine] Could not locate CUDA/CuDNN package paths.")
    except Exception as e:
        print(f"[AI Engine] CUDA pip packages DLL setup skipped: {e}")


app = FastAPI(
    title="VocalSync AI - Local Transcription Engine",
    description="A high-performance local server to transcribe resampled video audio utilizing faster-whisper."
)

# Enable CORS to allow local development page requests from Vite port 5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global models cache to prevent reloading the same model weights on every request
models_cache = {}

def get_whisper_model(model_size: str):
    """
    Loads and caches the faster-whisper model.
    Attempts CUDA initialization first, falling back to CPU (int8) if unsuccessful.
    """
    # Normalize model size parameter
    size_map = {
        "Xenova/whisper-tiny": "tiny",
        "Xenova/whisper-base": "base",
        "Xenova/whisper-small": "small",
        "Xenova/whisper-medium": "medium",
        "Xenova/whisper-large-v3": "large-v3",
        "tiny": "tiny",
        "base": "base",
        "small": "small",
        "medium": "medium",
        "large-v3": "large-v3"
    }
    
    internal_size = size_map.get(model_size, "medium")
    
    if internal_size in models_cache:
        return models_cache[internal_size]
    
    print(f"\n[AI Engine] Loading model weights for '{internal_size}'...")
    
    model = None
    # 1. Attempt CUDA execution (GPU acceleration)
    try:
        print(f"[AI Engine] Trying CUDA GPU with float16 precision...")
        model = WhisperModel(internal_size, device="cuda", compute_type="float16")
        
        # Verify execution to catch missing CUDA runtime libraries (e.g. cublas64_12.dll)
        print(f"[AI Engine] Verifying CUDA execution capabilities...")
        dummy_audio = np.zeros(16000, dtype=np.float32)
        list(model.transcribe(dummy_audio, beam_size=1)[0]) # Force generator run to check libraries
        
        print(f"[AI Engine] Model '{internal_size}' successfully loaded on GPU.")
    except Exception as cuda_err:
        print(f"[AI Engine] CUDA GPU load/execution failed: {cuda_err}")
        print(f"[AI Engine] Falling back to CPU with int8 quantization...")
        
        # 2. Fallback to CPU execution
        try:
            model = WhisperModel(internal_size, device="cpu", compute_type="int8")
            print(f"[AI Engine] Model '{internal_size}' successfully loaded on CPU.")
        except Exception as cpu_err:
            print(f"[AI Engine] Fatal: Failed to load model on CPU: {cpu_err}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to initialize Whisper model: {cpu_err}"
            )
            
    models_cache[internal_size] = model
    return model

@app.get("/health")
def health_check():
    return {"status": "ok", "cached_models": list(models_cache.keys())}

def split_into_subtitle_chunks(segments, max_chars=40, max_duration=3.2):
    """
    Splits long paragraph segments into short, subtitle-friendly chunks
    based on punctuation limits and word counts.
    """
    import re
    chunks = []
    for seg in segments:
        text = seg["text"].strip()
        start = seg["start"]
        end = seg["end"]
        duration = end - start
        
        if len(text) <= max_chars and duration <= max_duration:
            chunks.append(seg)
            continue
            
        # Split on natural clause boundaries first (, . ! ? ।)
        clauses = re.split(r'([,\.!\?।])', text)
        
        temp_clauses = []
        i = 0
        while i < len(clauses):
            clause = clauses[i].strip()
            if not clause:
                i += 1
                continue
            if i + 1 < len(clauses) and len(clauses[i+1]) == 1 and clauses[i+1] in ",.!?।":
                clause += clauses[i+1]
                i += 2
            else:
                i += 1
            temp_clauses.append(clause)
            
        # For any clause that is still too long, split it by words
        sub_segments = []
        for clause in temp_clauses:
            words = clause.split()
            if not words:
                continue
                
            if len(clause) <= max_chars:
                sub_segments.append(words)
            else:
                word_groups = []
                current_group = []
                current_len = 0
                for w in words:
                    # Limit to ~6 words or max_chars characters per chunk
                    if current_group and (current_len + len(w) + 1 > max_chars or len(current_group) >= 6):
                        word_groups.append(current_group)
                        current_group = [w]
                        current_len = len(w)
                    else:
                        current_group.append(w)
                        current_len += len(w) + 1
                if current_group:
                    word_groups.append(current_group)
                sub_segments.extend(word_groups)
                
        # Allocate time fractionally based on the character length of each sub-segment
        total_chars = sum(len(" ".join(g)) for g in sub_segments)
        if total_chars == 0:
            chunks.append(seg)
            continue
            
        current_start = start
        for group in sub_segments:
            group_text = " ".join(group)
            group_len = len(group_text)
            
            fraction = group_len / total_chars
            chunk_duration = duration * fraction
            current_end = current_start + chunk_duration
            
            chunks.append({
                "start": round(current_start, 2),
                "end": round(current_end, 2),
                "text": group_text
            })
            current_start = current_end
            
    return chunks

@app.post("/transcribe")
async def transcribe_audio(
    request: Request,
    x_language: str = Header("hinglish", alias="X-Language"),
    x_model_size: str = Header("Xenova/whisper-medium", alias="X-Model-Size")
):
    """
    POST endpoint that receives binary raw Float32 mono 16kHz audio data.
    """
    body = await request.body()
    if not body:
        raise HTTPException(status_code=400, detail="Empty audio buffer received.")
        
    try:
        # Convert binary buffer back into Float32 NumPy array
        audio_samples = np.frombuffer(body, dtype=np.float32)
        duration_sec = len(audio_samples) / 16000
        print(f"\n[Transcribe] Received {len(audio_samples)} samples (approx. {duration_sec:.2f}s of audio).")
        
        # Retrieve or initialize the Whisper Model
        model = get_whisper_model(x_model_size)
        
        # Determine transcription parameters
        # If target language is English, we translate the spoken Hindi audio to English text.
        # Otherwise if Hindi with code-switching, we use None to allow auto-detect and code-switching native Latin English words.
        task = "translate" if x_language == "english" else "transcribe"
        transcribe_lang = None
        
        # Formulate initial prompt to guide code-mixed spoken recognition
        initial_prompt = None
        if x_language == "hindi_code_switched" or x_language in ["hindi", "hinglish"]:
            initial_prompt = "नमस्ते दोस्तों, आज हम इस वीडियो में बात करेंगे, computer, internet, subscribe, like, share, captions, video editing."
        elif x_language == "english":
            initial_prompt = "Hello everyone, in this video we are going to talk about..."
            
        print(f"[Transcribe] Starting Whisper run. Language code: '{transcribe_lang}', Task: '{task}', Prompt: {initial_prompt is not None}")
        
        # Execute transcription
        segments, info = model.transcribe(
            audio_samples,
            language=transcribe_lang,
            task=task,
            initial_prompt=initial_prompt,
            beam_size=5,
            word_timestamps=False,
            vad_filter=True,
            vad_parameters=dict(min_silence_duration_ms=500),
            condition_on_previous_text=False
        )
        
        # Parse segments generator into list
        parsed_segments = []
        for segment in segments:
            parsed_segments.append({
                "start": round(segment.start, 2),
                "end": round(segment.end, 2),
                "text": segment.text.strip()
            })
            
        # Split long paragraph chunks into clean, subtitle-length segments
        split_segments_list = split_into_subtitle_chunks(parsed_segments)
        
        print(f"[Transcribe] Completed. Transcribed {len(parsed_segments)} raw segments, split into {len(split_segments_list)} subtitle chunks.")
        for chunk in split_segments_list:
            try:
                print(f"  [{chunk['start']:.2f}s -> {chunk['end']:.2f}s]: {chunk['text']}")
            except Exception:
                pass
        
        return {
            "status": "success",
            "detected_language": info.language,
            "language_probability": round(info.language_probability, 3),
            "chunks": split_segments_list
        }
        
    except Exception as err:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Transcription pipeline failure: {str(err)}")

def hex_to_ass_color(hex_str, opacity_pct=100):
    if not hex_str.startswith('#'):
        return "&H00FFFFFF"
    hex_str = hex_str.lstrip('#')
    if len(hex_str) != 6:
        return "&H00FFFFFF"
    r, g, b = hex_str[0:2], hex_str[2:4], hex_str[4:6]
    alpha = int((1 - (int(opacity_pct) / 100)) * 255)
    return f"&H{alpha:02X}{b}{g}{r}"

def format_ass_time(seconds):
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = seconds % 60
    return f"{hours}:{minutes:02d}:{secs:05.2f}"

def cleanup_temp_files(*file_paths):
    for path in file_paths:
        try:
            if path and os.path.exists(path):
                os.remove(path)
                print(f"[Cleanup] Removed temporary file: {path}")
        except Exception as e:
            print(f"[Cleanup] Error removing {path}: {e}")

@app.post("/render")
async def render_video(
    background_tasks: BackgroundTasks,
    video: UploadFile = File(...),
    captions: str = Form(...),
    styleConfig: str = Form(...)
):
    input_vid_path = None
    ass_path = None
    output_vid_path = None
    try:
        import json
        caps = json.loads(captions)
        style = json.loads(styleConfig)
        
        job_id = str(uuid.uuid4())
        input_vid_path = f"temp_{job_id}_in.mp4"
        ass_path = f"temp_{job_id}.ass"
        output_vid_path = f"temp_{job_id}_out.mp4"
        
        with open(input_vid_path, "wb") as f:
            f.write(await video.read())
            
        # Build ASS styling
        font_name = style.get("fontFamily", "Arial")
        font_size = int(style.get("fontSize", 24)) * 2  # Scale up for 1080p virtual resolution
        text_color = hex_to_ass_color(style.get("textColor", "#FFFFFF"), 100)
        bg_color = hex_to_ass_color(style.get("bgColor", "#000000"), style.get("bgOpacity", 60))
        
        vert_pos_pct = int(style.get("verticalPos", 85))
        margin_v = int(((100 - vert_pos_pct) / 100) * 1080)
        
        # Opaque box background
        border_style = 3 # 3 is Opaque box, 1 is Outline
        
        ass_content = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,{font_name},{font_size},{text_color},&H000000FF,&H00000000,{bg_color},-1,0,0,0,100,100,0,0,{border_style},2,0,2,10,10,{margin_v},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
        
        for cap in caps:
            start_ass = format_ass_time(cap['start'])
            end_ass = format_ass_time(cap['end'])
            text = cap['text'].replace('\\n', '\\N').replace('\n', '\\N')
            if style.get('textTransform') == 'uppercase':
                text = text.upper()
            ass_content += f"Dialogue: 0,{start_ass},{end_ass},Default,,0,0,0,,{text}\n"
            
        with open(ass_path, "w", encoding="utf-8") as f:
            f.write(ass_content)
            
        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        
        # Use NVENC for fast encoding on RTX 3050, convert ASS path slashes
        ass_filter_path = ass_path.replace("\\", "/")
        cmd = [
            ffmpeg_exe, "-y",
            "-i", input_vid_path,
            "-vf", f"ass={ass_filter_path}",
            "-c:v", "h264_nvenc",
            "-preset", "p4",
            "-c:a", "copy",
            output_vid_path
        ]
        
        print(f"[Render] Starting FFmpeg: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"[Render] FFmpeg error: {result.stderr}")
            raise Exception("Video rendering failed.")
            
        # Clean up input video and ASS file immediately as they are no longer needed
        cleanup_temp_files(input_vid_path, ass_path)
        
        # Schedule cleanup of the output video to execute after client downloads it
        background_tasks.add_task(cleanup_temp_files, output_vid_path)
        
        return FileResponse(output_vid_path, media_type="video/mp4", filename="edited_captions.mp4")
        
    except Exception as e:
        print(f"[Render] Error: {str(e)}")
        # Clean up any leftover files on failure
        paths_to_clean = [p for p in [input_vid_path, ass_path, output_vid_path] if p is not None]
        cleanup_temp_files(*paths_to_clean)
        raise HTTPException(status_code=500, detail=str(e))



if __name__ == "__main__":
    # Run locally on port 8000
    uvicorn.run(app, host="127.0.0.1", port=8000)
