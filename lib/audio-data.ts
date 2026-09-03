/** Audio evidence helpers keep the retained attempt bounded, local, serialisable, and free of long-lived object URLs. */
export const ATTEMPT_SNIPPET_DURATION_MS = 2_000;

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
