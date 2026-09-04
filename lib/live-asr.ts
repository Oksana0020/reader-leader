export type LiveAsrEvent =
  | { type: "status"; text: string }
  | { type: "partial"; text: string; confidence?: number }
  | { type: "final"; text: string; confidence?: number }
  | { type: "error"; text: string };

export function createLiveAsrClient(url: string, onEvent?: (event: LiveAsrEvent) => void) {
  let socket: WebSocket | null = null;

  const connect = () => {
    if (typeof WebSocket === "undefined") {
      onEvent?.({ type: "status", text: "WebSocket API is unavailable in this browser." });
      return;
    }

    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    socket = new WebSocket(url);
    socket.binaryType = "arraybuffer";

    socket.onopen = () => {
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
      onEvent?.({ type: "error", text: "Local ASR unavailable. Start the Python Vosk server on port 8765." });
    };

    socket.onclose = () => {
      onEvent?.({ type: "status", text: "Local ASR disconnected." });
      socket = null;
    };
  };

  const sendControl = (payload: Record<string, string>) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(payload));
  };

  const startSession = () => sendControl({ type: "start" });
  const stopSession = () => sendControl({ type: "stop" });

  const sendChunk = (chunk: Uint8Array | ArrayBuffer) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    const bytes = chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk);
    socket.send(bytes.buffer.slice(0, bytes.byteLength));
  };

  const close = () => {
    if (socket) {
      socket.close();
      socket = null;
    }
  };

  return { connect, startSession, stopSession, sendChunk, close };
}
