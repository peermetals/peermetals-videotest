import { Config } from '@remotion/cli/config';

// Optimized settings for faster rendering while maintaining quality
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setCodec('h264');

// Increase concurrency based on available CPU cores (auto-detect or use max)
Config.setConcurrency('50%'); // Uses 50% of available CPU cores for better performance

// Faster encoding preset
Config.setFfmpegExecutable('ffmpeg');

// Quality settings - CRF 28 is faster than 23, still good quality
Config.setCrf(28); // Higher = faster encoding, slightly lower quality (23-28 is good range)
Config.setPixelFormat('yuv420p');

// Enable faster processing
Config.setChromiumOpenGlRenderer('angle'); // Use ANGLE for faster rendering
