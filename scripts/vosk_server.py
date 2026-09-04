import json
import math
import sys
import wave
from typing import Optional

import numpy as np
import sounddevice as sd
from websocket_server import WebsocketServer
from vosk import KaldiRecognizer, Model

PORT = 8765
CHUNK_DURATION_MS = 300
SAMPLE_RATE = 16000

MODEL_PATH = r"C:\asr\models\vosk-model-en-us-0.22"

if not Model:
    raise RuntimeError("Vosk model could not be loaded.")


class ReaderLeaderAsrServer:
    def __init__(self, model_path: str) -> None:
        self.model = Model(model_path)
        self.server = WebsocketServer(PORT, "127.0.0.1")
        self.recognizer: Optional[KaldiRecognizer] = None
        self.stream_active = False
        self.last_text = ""

    def _new_recognizer(self) -> KaldiRecognizer:
        recognizer = KaldiRecognizer(self.model, SAMPLE_RATE)
        recognizer.SetWords(True)
        return recognizer

    def _handle_message(self, client, server, message):
        if isinstance(message, str):
            try:
                data = json.loads(message)
            except json.JSONDecodeError:
                return
            if data.get("type") == "start":
                self.recognizer = self._new_recognizer()
                self.stream_active = True
                server.send_message(client, json.dumps({"type": "status", "text": "ASR stream started."}))
            elif data.get("type") == "stop":
                self.stream_active = False
                self.recognizer = None
                server.send_message(client, json.dumps({"type": "status", "text": "ASR stream stopped."}))
            return

        if not self.stream_active or self.recognizer is None:
            return

        raw = np.frombuffer(message, dtype=np.int16)
        if raw.size == 0:
            return

        if self.recognizer.AcceptWaveform(message):
            result = json.loads(self.recognizer.Result())
            text = result.get("text", "").strip()
            if text:
                self.last_text = text
                server.send_message(client, json.dumps({"type": "final", "text": text}))
        else:
            partial = json.loads(self.recognizer.PartialResult())
            text = partial.get("partial", "").strip()
            if text:
                server.send_message(client, json.dumps({"type": "partial", "text": text}))

    def start(self) -> None:
        self.server.set_fn_message(self._handle_message)
        self.server.run_forever()


if __name__ == "__main__":
    print(f"Reader Leader Vosk ASR server starting on port {PORT} using model: {MODEL_PATH}")
    server = ReaderLeaderAsrServer(MODEL_PATH)
    try:
        server.start()
    except KeyboardInterrupt:
        print("Stopping ASR server.")
        sys.exit(0)
