"use client";

/** Student restraint rule: own every Web Audio resource in one hook and tear it down idempotently on stop, failure, and unmount. */
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { hesitationReducer, INITIAL_HESITATION_MACHINE } from "@/lib/hesitation-fsm";

const VOICE_RMS_THRESHOLD = 0.035;
const SPEECH_RELEASE_MS = 180;
const UI_SAMPLE_INTERVAL_MS = 100;

export interface AudioCaptureResult {
  blob: Blob | null;
  elapsedMs: number;
}

export function useHesitationFSM() {
  const [machine, dispatch] = useReducer(hesitationReducer, INITIAL_HESITATION_MACHINE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const frameRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const lastVoiceAtRef = useRef<number | null>(null);
  const lastUiDispatchAtRef = useRef(0);

  const disconnectAudioGraph = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.ondataavailable = null;
      recorder.onerror = null;
      recorder.stop();
    }
    recorderRef.current = null;

    sourceRef.current?.disconnect();
    sourceRef.current = null;
    analyserRef.current?.disconnect();
    analyserRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    const audioContext = contextRef.current;
    contextRef.current = null;
    if (audioContext && audioContext.state !== "closed") {
      void audioContext.close().catch(() => undefined);
    }

    lastVoiceAtRef.current = null;
    lastUiDispatchAtRef.current = 0;
  }, []);

  const start = useCallback(async (): Promise<boolean> => {
    disconnectAudioGraph();
    chunksRef.current = [];
    setErrorMessage(null);

    if (!navigator.mediaDevices?.getUserMedia || !window.AudioContext) {
      dispatch({ type: "UNSUPPORTED" });
      setErrorMessage("Live listening is not supported in this browser. You can still continue the demo.");
      return false;
    }

    dispatch({ type: "REQUEST_PERMISSION" });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      const audioContext = new window.AudioContext();
      if (audioContext.state === "suspended") await audioContext.resume();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.25;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      streamRef.current = stream;
      contextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;
      startedAtRef.current = performance.now();
      lastVoiceAtRef.current = startedAtRef.current;

      if (typeof MediaRecorder !== "undefined") {
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunksRef.current.push(event.data);
        };
        recorder.onerror = () => setErrorMessage("The recording could not be captured, but live support can continue.");
        recorder.start(250);
        recorderRef.current = recorder;
      }

      const samples = new Uint8Array(analyser.fftSize);
      const sample = (now: number) => {
        const activeAnalyser = analyserRef.current;
        if (!activeAnalyser) return;
        activeAnalyser.getByteTimeDomainData(samples);
        let energy = 0;
        for (const value of samples) {
          const normalised = (value - 128) / 128;
          energy += normalised * normalised;
        }
        const rms = Math.sqrt(energy / samples.length);
        if (rms >= VOICE_RMS_THRESHOLD) lastVoiceAtRef.current = now;

        if (now - lastUiDispatchAtRef.current >= UI_SAMPLE_INTERVAL_MS) {
          lastUiDispatchAtRef.current = now;
          const recentlySpeaking = lastVoiceAtRef.current !== null && now - lastVoiceAtRef.current < SPEECH_RELEASE_MS;
          dispatch({ type: recentlySpeaking ? "SPEECH" : "SILENCE", atMs: now });
        }
        frameRef.current = requestAnimationFrame(sample);
      };

      dispatch({ type: "PERMISSION_GRANTED", atMs: startedAtRef.current });
      frameRef.current = requestAnimationFrame(sample);
      return true;
    } catch (error) {
      disconnectAudioGraph();
      const denied = error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "PermissionDeniedError");
      dispatch({ type: denied ? "PERMISSION_DENIED" : "FAIL" });
      setErrorMessage(denied
        ? "Microphone access was not granted. You can allow access and try again, or continue the demo."
        : "The microphone could not start. You can still continue the demo.");
      return false;
    }
  }, [disconnectAudioGraph]);

  const finish = useCallback(async (): Promise<AudioCaptureResult> => {
    dispatch({ type: "BEGIN_FINISH" });
    const elapsedMs = startedAtRef.current === null ? 5_000 : Math.max(performance.now() - startedAtRef.current, 1_000);
    const recorder = recorderRef.current;

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    let blob: Blob | null = null;
    if (recorder && recorder.state !== "inactive") {
      blob = await new Promise<Blob>((resolve) => {
        const finishRecording = () => resolve(new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" }));
        recorder.addEventListener("stop", finishRecording, { once: true });
        recorder.stop();
      });
    } else if (chunksRef.current.length > 0) {
      blob = new Blob(chunksRef.current, { type: "audio/webm" });
    }

    recorderRef.current = null;
    disconnectAudioGraph();
    startedAtRef.current = null;
    dispatch({ type: "FINISHED" });
    return { blob, elapsedMs };
  }, [disconnectAudioGraph]);

  const cancel = useCallback(() => {
    disconnectAudioGraph();
    startedAtRef.current = null;
    chunksRef.current = [];
    setErrorMessage(null);
    dispatch({ type: "RESET" });
  }, [disconnectAudioGraph]);

  useEffect(() => disconnectAudioGraph, [disconnectAudioGraph]);

  return {
    ...machine,
    errorMessage,
    isActive: ["listening", "speaking", "hesitating", "prompting"].includes(machine.phase),
    start,
    finish,
    cancel,
  };
}
