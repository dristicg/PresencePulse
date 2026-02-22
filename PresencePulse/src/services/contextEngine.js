/*
Presence Pulse – Phase 1 Behavior Detection Engine

GOAL:
Implement a simple rule-based behavior engine for detecting Attention Drift
based on session tracking and micro-check bursts.

Implement everything cleanly below this comment.
*/

const MICRO_CHECK_THRESHOLD_SECONDS = 20;
const BURST_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const BURST_THRESHOLD = 5;

let currentSession = null;
let sessionHistory = [];
let microCheckCount = 0;
let attentionDrift = false;
let microCheckTimestamps = [];
let burstCount = 0;

const logPrefix = '[PresencePulse]';

export function startSession() {
  if (currentSession) {
    console.log(`${logPrefix} Session already active; ignoring start request.`);
    return;
  }

  currentSession = {
    startTime: Date.now(),
  };

  console.log('Session started');
}

export function endSession() {
  if (!currentSession) {
    console.log(`${logPrefix} No active session to end.`);
    return null;
  }

  const endTime = Date.now();
  const durationSeconds = (endTime - currentSession.startTime) / 1000;

  const sessionRecord = {
    startTime: currentSession.startTime,
    endTime,
    durationSeconds,
    type:
      durationSeconds < MICRO_CHECK_THRESHOLD_SECONDS
        ? 'micro-check'
        : 'session',
  };

  sessionHistory.push(sessionRecord);
  currentSession = null;

  console.log(
    `Session ended with duration ${durationSeconds.toFixed(2)}s`
  );

  if (sessionRecord.type === 'micro-check') {
    microCheckCount += 1;
    console.log(`Micro-check detected. Count: ${microCheckCount}`);
    trackBurst(endTime);
  } else {
    console.log(`${logPrefix} Standard session recorded.`);
  }

  return sessionRecord;
}

function trackBurst(referenceTime) {
  microCheckTimestamps.push(referenceTime);
  microCheckTimestamps = microCheckTimestamps.filter(
    (timestamp) => referenceTime - timestamp <= BURST_WINDOW_MS
  );

  console.log(`Burst count: ${microCheckTimestamps.length}`);

  if (microCheckTimestamps.length >= BURST_THRESHOLD && !attentionDrift) {
    attentionDrift = true;
    burstCount += 1;
    console.log('Attention drift detected');
  }
}

export function getAttentionDrift() {
  return attentionDrift;
}

export function resetDrift() {
  attentionDrift = false;
  microCheckTimestamps = [];
  console.log(`${logPrefix} Attention drift state reset.`);
}

export function getSessionHistory() {
  return [...sessionHistory];
}

export function getMicroCheckCount() {
  return microCheckCount;
}

export function getBurstCount() {
  return burstCount;
}

export function getPresenceScore() {
  const score = 100 - microCheckCount * 2;
  return Math.max(0, Math.floor(score));
}
