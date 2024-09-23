const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let ffmpegProcess = null;

function startRecording(testName) {
    const videoDir = path.join(__dirname, '../reports/ui/videos');
    if (!fs.existsSync(videoDir)) {
        fs.mkdirSync(videoDir, { recursive: true });
    }

    const sanitizedTestName = testName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const videoPath = path.join(videoDir, `${sanitizedTestName}.mp4`);

    const args = ['-y', '-f', 'gdigrab', '-framerate', '30', '-i', 'desktop', videoPath];
    ffmpegProcess = spawn('ffmpeg', args);

    return videoPath;
}

function stopRecording() {
    if (ffmpegProcess) {
        ffmpegProcess.kill('SIGINT');
        ffmpegProcess = null;
    }
}

module.exports = { startRecording, stopRecording };
