export type LiveAsrEvent =
  | { type: "status"; text: string }
  | { type: "partial"; text: string; confidence?: number }
  | { type: "final"; text: string; confidence?: number }
  | { type: "error"; text: string };

interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
}

export function createLiveAsrClient(url: string, onEvent?: (event: LiveAsrEvent) => void) {
  let socket: WebSocket | null = null;
  let recognition: BrowserSpeechRecognition | null = null;
  let fallbackActive = false;
  let fallbackTimer: number | null = null;

  const clearFallbackTimer = () => {
    if (fallbackTimer !== null) {
      clearTimeout(fallbackTimer);
      fallbackTimer = null;
    }
  };

  const startBrowserFallback = () => {
    const RecognitionCtor = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!RecognitionCtor) {
      onEvent?.({ type: "error", text: "No local browser speech engine is available for the demo fallback." });
      return;
    }

    fallbackActive = true;
    recognition = new RecognitionCtor() as BrowserSpeechRecognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-GB";

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        transcript += result[0]?.transcript ?? "";
      }
      const trimmed = transcript.trim();
      if (!trimmed) return;

      const finalResult = event.results[event.results.length - 1];
      const isFinal = finalResult ? finalResult.isFinal : false;
      onEvent?.({ type: isFinal ? "final" : "partial", text: trimmed });
    };

    recognition.onerror = (event: any) => {
      const errorType = event?.error ? String(event.error) : "unknown";
      if (errorType === "network") {
        onEvent?.({ type: "status", text: "Browser fallback unavailable; local ASR server remains active." });
        try {
          recognition?.stop();
        } catch {
          // Ignore stop errors from short-lived browser fallback failures.
        }
        fallbackActive = false;
        recognition = null;
        return;
      }

      const message = errorType === "not-allowed"
        ? "Microphone access was blocked for the browser fallback."
        : errorType === "no-speech"
          ? "The browser did not detect speech. Please try again."
          : "Speech fallback unavailable. Local ASR remains the primary path.";

      onEvent?.({ type: "error", text: message });
    };

    recognition.onend = () => {
      fallbackActive = false;
      recognition = null;
    };

    onEvent?.({ type: "status", text: "Browser speech fallback active." });
    recognition.start();
  };

  const connect = () => {
    clearFallbackTimer();

    if (typeof WebSocket === "undefined") {
      onEvent?.({ type: "status", text: "WebSocket API is unavailable in this browser." });
      startBrowserFallback();
      return;
    }

    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    socket = new WebSocket(url);
    socket.binaryType = "arraybuffer";

    socket.onopen = () => {
      clearFallbackTimer();
      onEvent?.({ type: "status", text: "Local ASR connected." });
    };

    socket.onmessage = (event: MessageEvent) => {
      if (typeof event.data !== "string") return;
      try {
        const payload = JSON.parse(event.data) as LiveAsrEvent;
        onEvent?.(payload);
      } catch {
        // Ignore malformed server messages during prototype startup.
      }
    };

    socket.onerror = () => {
      if (fallbackActive) return;
      onEvent?.({ type: "status", text: "Local ASR connection unstable; checking fallback route." });
      fallbackTimer = window.setTimeout(() => {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
          startBrowserFallback();
        }
      }, 1500);
    };

    socket.onclose = () => {
      clearFallbackTimer();
      onEvent?.({ type: "status", text: "Local ASR disconnected." });
      socket = null;
      if (!fallbackActive) {
        fallbackTimer = window.setTimeout(() => startBrowserFallback(), 1500);
      }
    };
  };

  const sendControl = (payload: Record<string, string>) => {
    if (recognition) {
      if (payload.type === "start") {
        recognition.start();
      } else if (payload.type === "stop") {
        recognition.stop();
      }
      return;
    }

    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(payload));
  };

  const startSession = () => {
    if (recognition) {
      recognition.start();
      return;
    }
    sendControl({ type: "start" });
  };

  const stopSession = () => {
    if (recognition) {
      recognition.stop();
      return;
    }
    sendControl({ type: "stop" });
  };

  const sendChunk = (chunk: Uint8Array | ArrayBuffer) => {
    if (recognition) return;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    const bytes = chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk);
    socket.send(bytes.buffer.slice(0, bytes.byteLength));
  };

  const close = () => {
    clearFallbackTimer();

    if (recognition) {
      recognition.stop();
      recognition = null;
      fallbackActive = false;
    }

    if (socket) {
      socket.close();
      socket = null;
    }
  };

  return { connect, startSession, stopSession, sendChunk, close };
}
