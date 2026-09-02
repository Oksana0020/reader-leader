import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { rmSync, writeFileSync } from "node:fs";

const DEBUG_PORT = 9333;
const APP_PORT = 3100;
const APP_URL = `http://127.0.0.1:${APP_PORT}`;
const AUDIO_PATH = "/tmp/reader-leader-silence.wav";
const PROFILE_PATH = `/tmp/reader-leader-cdp-profile-${process.pid}`;

function createSilentWav(path, seconds = 8, sampleRate = 44_100) {
  const samples = seconds * sampleRate;
  const dataSize = samples * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  writeFileSync(path, buffer);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForApp() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(APP_URL);
      if (response.ok) return;
    } catch {
      // The temporary production server is still starting.
    }
    await sleep(100);
  }
  throw new Error("Reader Leader verification server did not start.");
}

async function waitForEndpoint() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`);
      if (response.ok) return response.json();
    } catch {
      // Chromium is still starting.
    }
    await sleep(100);
  }
  throw new Error("Chromium debugging endpoint did not start.");
}

function createCdpClient(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  let nextId = 1;
  const pending = new Map();
  const events = [];

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id) {
      if (["Runtime.exceptionThrown", "Runtime.consoleAPICalled", "Log.entryAdded"].includes(message.method)) events.push(message);
      return;
    }
    const waiter = pending.get(message.id);
    if (!waiter) return;
    pending.delete(message.id);
    if (message.error) waiter.reject(new Error(message.error.message));
    else waiter.resolve(message.result);
  });

  const ready = new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  async function command(method, params = {}) {
    await ready;
    const id = nextId;
    nextId += 1;
    socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
  }

  async function evaluate(expression) {
    const result = await command("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  }

  return { command, evaluate, events, close: () => socket.close() };
}

async function waitForValue(evaluate, expression, timeoutMs = 8_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const value = await evaluate(expression);
    if (value) return value;
    await sleep(100);
  }
  throw new Error(`Timed out waiting for: ${expression}`);
}

createSilentWav(AUDIO_PATH);
rmSync(PROFILE_PATH, { force: true, recursive: true });

const appServer = spawn(process.execPath, [
  "node_modules/next/dist/bin/next",
  "start",
  "--hostname",
  "127.0.0.1",
  "--port",
  String(APP_PORT),
], {
  cwd: process.cwd(),
  env: { ...process.env, NODE_ENV: "production", NEXT_DIST_DIR: ".next-browser" },
  stdio: "ignore",
});

let chromium;
let client;
try {
  await waitForApp();
  chromium = spawn("/usr/bin/chromium", [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--no-proxy-server",
    "--proxy-bypass-list=*",
    "--use-fake-ui-for-media-stream",
    "--use-fake-device-for-media-stream",
    "--autoplay-policy=no-user-gesture-required",
    `--use-file-for-fake-audio-capture=${AUDIO_PATH}`,
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${PROFILE_PATH}`,
    "about:blank",
  ], { stdio: "ignore" });

  const targets = await waitForEndpoint();
  const page = targets.find((target) => target.type === "page");
  assert.ok(page?.webSocketDebuggerUrl, "A Chromium page target is required.");
  client = createCdpClient(page.webSocketDebuggerUrl);
  await client.command("Page.enable");
  await client.command("Runtime.enable");
  await client.command("Log.enable");
  await client.command("Page.navigate", { url: APP_URL });
  await waitForValue(client.evaluate, "document.documentElement.dataset.readerLeaderHydrated === 'true'");

  await client.evaluate(`(() => {
    const target = [...document.querySelectorAll('button')].find((button) => button.textContent?.includes('The Brave Knight'));
    if (!target) throw new Error('Brave Knight card not found');
    target.click();
    return true;
  })()`);
  await waitForValue(client.evaluate, "location.pathname === '/read'");
  const selectedState = await client.evaluate("localStorage.getItem('reader-leader-session-v2')");
  assert.match(selectedState, /brave-knight/);
  assert.match(selectedState, /The brave knight went out into the cold night to find his lost horse/);

  await client.evaluate(`(() => {
    const microphone = document.querySelector('button[aria-label="Start microphone"]');
    if (!microphone) throw new Error('Microphone button not found');
    microphone.click();
    return true;
  })()`);
  await waitForValue(client.evaluate, "document.querySelector('button[aria-label=\"Stop recording and finish\"]') !== null");
  await sleep(3_450);
  const hesitation = await client.evaluate(`(() => {
    const highlighted = [...document.querySelectorAll('span')].find((span) => span.className.includes('E5A93C'));
    return highlighted?.textContent ?? null;
  })()`);
  assert.equal(hesitation, "knight");

  await sleep(2_150);
  assert.equal(await client.evaluate("document.body.textContent.includes('The k is silent: /n-aɪ-t/')"), true);
  await client.evaluate("document.querySelector('button[aria-label=\"Stop recording and finish\"]')?.click()");
  await waitForValue(client.evaluate, "location.pathname === '/celebrate'", 12_000);
  assert.match(await client.evaluate("localStorage.getItem('reader-leader-session-v2')"), /k-night/);

  await client.evaluate(`(() => {
    const link = [...document.querySelectorAll('a')].find((anchor) => anchor.textContent?.includes('View Educator Record'));
    if (!link) throw new Error('Educator record link not found');
    link.click();
    return true;
  })()`);
  await waitForValue(client.evaluate, "location.pathname === '/dashboard/student'");
  await client.evaluate(`(() => {
    const token = [...document.querySelectorAll('button')].find((button) => button.textContent?.trim() === 'knight');
    if (!token) throw new Error('Flagged knight token not found');
    token.click();
    return true;
  })()`);
  await waitForValue(client.evaluate, "document.body.textContent.includes('Spoken as: /k-n-aɪ-t/')");
  await client.evaluate(`[...document.querySelectorAll('button')].find((button) => button.textContent?.includes('Review Override'))?.click()`);
  await waitForValue(client.evaluate, "document.body.textContent.includes('Accept Pronunciation')");
  await client.evaluate(`[...document.querySelectorAll('button')].find((button) => button.textContent?.includes('Accept Pronunciation'))?.click()`);
  await waitForValue(client.evaluate, "document.body.textContent.includes('Accepted by explicit teacher override')");
  await waitForValue(client.evaluate, "localStorage.getItem('reader-leader-session-v2')?.includes('accepted-teacher-override')");

  const finalState = await client.evaluate("localStorage.getItem('reader-leader-session-v2')");
  assert.match(finalState, /accepted-teacher-override/);
  assert.match(finalState, /Educator accepted the explicitly sounded silent/);

  console.log("Browser flow passed: hydration, Green Band selection, 3s hesitation, 5s cue, alignment, and two-click teacher override.");
} catch (error) {
  console.error("Browser verification failed:", error);
  if (client) console.error("Captured runtime events:", JSON.stringify(client.events, null, 2));
  throw error;
} finally {
  client?.close();
  chromium?.kill("SIGTERM");
  appServer.kill("SIGTERM");
  await sleep(500);
  rmSync(PROFILE_PATH, { force: true, recursive: true, maxRetries: 5, retryDelay: 100 });
}
