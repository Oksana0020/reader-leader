/** Audio evidence helpers keep the retained attempt bounded, local, serialisable, and free of long-lived object URLs. */
export const ATTEMPT_SNIPPET_DURATION_MS = 2_000;
export const ATTEMPT_SNIPPET_PRE_ROLL_MS = 400;
export const ATTEMPT_SNIPPET_POST_START_MS = 1_600;

export function createAttemptSnippetWindow(tokenStartMs: number) {
  const startMs = tokenStartMs - ATTEMPT_SNIPPET_PRE_ROLL_MS;
  const endMs = tokenStartMs + ATTEMPT_SNIPPET_POST_START_MS;
  return { startMs, endMs, durationMs: endMs - startMs };
}

function encodePcm16Wav(channels: Float32Array[], sampleRate: number): Blob {
  const channelCount = channels.length;
  const frameCount = channels[0]?.length ?? 0;
  const bytesPerSample = 2;
  const buffer = new ArrayBuffer(44 + frameCount * channelCount * bytesPerSample);
  const view = new DataView(buffer);
  const writeText = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) view.setUint8(offset + index, value.charCodeAt(index));
  };
  writeText(0, "RIFF");
  view.setUint32(4, 36 + frameCount * channelCount * bytesPerSample, true);
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channelCount, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channelCount * bytesPerSample, true);
  view.setUint16(32, channelCount * bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeText(36, "data");
  view.setUint32(40, frameCount * channelCount * bytesPerSample, true);

  let offset = 44;
  for (let frame = 0; frame < frameCount; frame += 1) {
    for (let channel = 0; channel < channelCount; channel += 1) {
      const sample = Math.max(-1, Math.min(1, channels[channel][frame] ?? 0));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += bytesPerSample;
    }
  }
  return new Blob([buffer], { type: "audio/wav" });
}

export async function sliceAudioBlobToWav(blob: Blob, startMs: number, durationMs: number): Promise<Blob> {
  const context = new window.AudioContext();
  try {
    const decoded = await context.decodeAudioData(await blob.arrayBuffer());
    const startFrame = Math.max(0, Math.floor(startMs * decoded.sampleRate / 1_000));
    const frameCount = Math.max(1, Math.round(durationMs * decoded.sampleRate / 1_000));
    const channels = Array.from({ length: decoded.numberOfChannels }, (_, channelIndex) => {
      const output = new Float32Array(frameCount);
      const source = decoded.getChannelData(channelIndex);
      const available = Math.max(0, Math.min(frameCount, source.length - startFrame));
      if (available > 0) output.set(source.subarray(startFrame, startFrame + available));
      return output;
    });
    return encodePcm16Wav(channels, decoded.sampleRate);
  } finally {
    if (context.state !== "closed") await context.close().catch(() => undefined);
  }
}

export function blobToAudioDataUri(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("Audio snippet could not be encoded."));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

export function audioDataUriToBlob(dataUri: string): Blob {
  const [header, encoded] = dataUri.split(",", 2);
  const mimeType = header.match(/^data:([^;]+)/)?.[1] ?? "audio/webm";
  const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
  return new Blob([bytes], { type: mimeType });
}
