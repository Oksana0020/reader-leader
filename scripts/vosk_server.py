import argparse
import json
import os
import sys
from pathlib import Path
from typing import Optional

import numpy as np
from websocket_server import WebsocketServer
from vosk import KaldiRecognizer, Model

PORT = 8765
SAMPLE_RATE = 16000
DEFAULT_MODEL_SUFFIX = "vosk-model-en-us-0.22"


def resolve_model_path(explicit_path: Optional[str] = None) -> str:
    candidates: list[str] = []
    if explicit_path:
        candidates.append(explicit_path)

    env_path = os.getenv("VOSK_MODEL_PATH")
    if env_path:
        candidates.append(env_path)

    candidates.extend([
        r"C:\asr\models\vosk-model-en-us-0.22",
        str(Path.home() / "AppData" / "Local" / "vosk" / DEFAULT_MODEL_SUFFIX),
        str(Path.home() / ".cache" / "vosk" / DEFAULT_MODEL_SUFFIX),
        str(Path.home() / DEFAULT_MODEL_SUFFIX),
        str(Path.cwd() / DEFAULT_MODEL_SUFFIX),
    ])

    seen: set[str] = set()
    for candidate in candidates:
        cleaned = candidate.strip()
        if not cleaned or cleaned in seen:
            continue
        seen.add(cleaned)
        if os.path.isdir(cleaned):
            return cleaned

    maybe_dirs = [
        Path(r"C:\asr\models"),
        Path.home() / "AppData" / "Local" / "vosk",
        Path.home() / ".cache" / "vosk",
    ]
    for root in maybe_dirs:
        if root.exists() and root.is_dir():
            for child in sorted(root.iterdir()):
                if child.is_dir() and "vosk-model" in child.name.lower():
                    return str(child)

    raise FileNotFoundError(
        "No Vosk model directory found. Download the English model and place it in C:\\asr\\models\\vosk-model-en-us-0.22 or set VOSK_MODEL_PATH."
    )


class ReaderLeaderAsrServer:
    def __init__(self, model_path: str) -> None:
        self.model = Model(model_path)
        self.server = WebsocketServer("127.0.0.1", PORT)
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
        self.server.set_fn_message_received(self._handle_message)
        self.server.run_forever()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Start the Reader Leader local Vosk server for live ASR demo transcription.")
    parser.add_argument("--model-path", dest="model_path", help="Absolute path to a Vosk model directory.")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    try:
        model_path = resolve_model_path(args.model_path)
    except FileNotFoundError as exc:
        print(f"ASR startup failed: {exc}")
        print("Download the Vosk English model from https://alphacephei.com/vosk/models and extract it to C:\\asr\\models\\vosk-model-en-us-0.22")
        sys.exit(1)

    print(f"Reader Leader Vosk ASR server starting on port {PORT} using model: {model_path}")
    server = ReaderLeaderAsrServer(model_path)
    try:
        server.start()
    except KeyboardInterrupt:
        print("Stopping ASR server.")
        sys.exit(0)
