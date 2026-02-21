// Presence Pulse - Phase 1 Behavior Engine

const MICRO_CHECK_THRESHOLD_MS = 20 * 1000; // 20 seconds
const BURST_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const BURST_COUNT = 5;

class ContextEngine {
  constructor() {
    this.currentSession = null;
    this.sessionHistory = [];
    this.microCheckCount = 0;
    this.microCheckTimestamps = [];
    this.attentionDrift = false;
  }

  startSession() {
    if (this.currentSession) {
      console.warn('[ContextEngine] Attempted to start a new session before ending the current one.');
      return;
    }

    this.currentSession = {
      start: Date.now(),
      end: null,
      durationMs: null,
      type: 'pending'
    };

    console.log('[ContextEngine] Session started at', new Date(this.currentSession.start).toISOString());
  }

  endSession() {
    if (!this.currentSession) {
      console.warn('[ContextEngine] No active session to end.');
      return null;
    }

    this.currentSession.end = Date.now();
    this.currentSession.durationMs = this.currentSession.end - this.currentSession.start;

    const isMicroCheck = this.detectMicroCheck(this.currentSession);
    this.currentSession.type = isMicroCheck ? 'micro-check' : 'session';

    if (isMicroCheck) {
      this._trackMicroCheckBurst(this.currentSession.end);
    } else {
      console.log('[ContextEngine] Full session recorded. Duration ms:', this.currentSession.durationMs);
    }

    this.sessionHistory.push({ ...this.currentSession });
    const completedSession = this.currentSession;
    this.currentSession = null;

    return completedSession;
  }

  detectMicroCheck(session) {
    if (!session || session.durationMs == null) {
      return false;
    }

    const isMicroCheck = session.durationMs < MICRO_CHECK_THRESHOLD_MS;

    if (isMicroCheck) {
      this.microCheckCount += 1;
      console.log(
        '[ContextEngine] Micro-check detected. Duration ms:',
        session.durationMs,
        'Total micro-checks:',
        this.microCheckCount,
      );
    }

    return isMicroCheck;
  }

  detectBurst(referenceTimestamp = Date.now()) {
    this.microCheckTimestamps = this.microCheckTimestamps.filter(
      (entry) => referenceTimestamp - entry <= BURST_WINDOW_MS
    );

    const burstCount = this.microCheckTimestamps.length;
    console.log('[ContextEngine] Burst window count:', burstCount);

    if (burstCount >= BURST_COUNT) {
      this.attentionDrift = true;
      console.log('Attention drift detected');
      return true;
    }

    return false;
  }

  _trackMicroCheckBurst(timestamp) {
    this.microCheckTimestamps.push(timestamp);
    this.detectBurst(timestamp);
  }

  getSessionHistory() {
    return [...this.sessionHistory];
  }

  getMicroCheckCount() {
    return this.microCheckCount;
  }

  hasAttentionDrift() {
    return this.attentionDrift;
  }

  resetAttentionDrift() {
    this.attentionDrift = false;
    this.microCheckTimestamps = [];
    console.log('[ContextEngine] Attention drift state reset.');
  }
}

const contextEngine = new ContextEngine();

export const startSession = () => contextEngine.startSession();
export const endSession = () => contextEngine.endSession();
export const hasAttentionDrift = () => contextEngine.hasAttentionDrift();

export default contextEngine;
