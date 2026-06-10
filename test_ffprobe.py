import imageio_ffmpeg
import subprocess
import json

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
print(f"FFmpeg path: {ffmpeg_exe}")

ffprobe_exe = ffmpeg_exe.replace('ffmpeg', 'ffprobe')
# Just verify it runs
res = subprocess.run([ffprobe_exe, "-version"], capture_output=True, text=True)
print(res.stdout[:100])
