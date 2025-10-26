import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;
let isLoading = false;
let isLoaded = false;

async function loadFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg && isLoaded) {
    return ffmpeg;
  }

  if (isLoading) {
    // Wait for loading to complete
    while (isLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return ffmpeg!;
  }

  isLoading = true;
  ffmpeg = new FFmpeg();

  try {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.11/dist/esm';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    isLoaded = true;
  } catch (error) {
    console.error('Failed to load FFmpeg:', error);
    throw error;
  } finally {
    isLoading = false;
  }

  return ffmpeg;
}

export async function convertAudioToOgg(file: File): Promise<Blob> {
  // If already an ogg file, return as-is
  if (file.type === 'audio/ogg' || file.name.endsWith('.ogg')) {
    return file;
  }

  const ff = await loadFFmpeg();

  // Generate unique filenames
  const inputName = `input_${Date.now()}.${file.name.split('.').pop()}`;
  const outputName = `output_${Date.now()}.ogg`;

  try {
    // Write input file to FFmpeg filesystem
    await ff.writeFile(inputName, await fetchFile(file));

    // Convert to ogg vorbis
    await ff.exec([
      '-i', inputName,
      '-c:a', 'libvorbis',
      '-q:a', '4', // Quality level (0-10, 4 is good quality)
      outputName
    ]);

    // Read output file
    const data = await ff.readFile(outputName);

    // Clean up
    await ff.deleteFile(inputName);
    await ff.deleteFile(outputName);

    // Convert Uint8Array to Blob
    return new Blob([data], { type: 'audio/ogg' });
  } catch (error) {
    console.error('Audio conversion failed:', error);
    throw new Error('音声ファイルの変換に失敗しました');
  }
}

export async function fileToDataURL(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
