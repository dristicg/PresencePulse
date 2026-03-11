import { Vibration } from 'react-native';
import { getPresenceScore, getMicroCheckCount } from '../services/contextEngine';

let currentNudgeTier = 0; // 0 = None, 1 = Haptic, 2 = Modal, 3 = Reconnect

export const evaluateAndNudge = (isPhubbing) => {
    const score = getPresenceScore();
    const mcCount = getMicroCheckCount();

    if (score < 50 || mcCount >= 9) {
        // Severe - Tier 3
        currentNudgeTier = 3;
        console.log('[NudgeEngine] Tier 3 (Reconnect) Triggered!');
        return currentNudgeTier;
    }

    if (isPhubbing || score < 80) {
        // Moderate - Tier 2
        currentNudgeTier = 2;
        console.log('[NudgeEngine] Tier 2 (Reflection Modal) Triggered!');
        return currentNudgeTier;
    }

    if (mcCount >= 3) {
        // Mild - Tier 1 Haptic
        currentNudgeTier = 1;
        console.log('[NudgeEngine] Tier 1 (Haptic Nudge) Triggered!');
        triggerHaptic();
        return currentNudgeTier;
    }

    currentNudgeTier = 0;
    return currentNudgeTier;
};

const triggerHaptic = () => {
    // Simple double vibration pattern
    Vibration.vibrate([0, 150, 100, 150]);
};

export const getCurrentNudgeTier = () => {
    return currentNudgeTier;
};

export const resetNudgeTier = () => {
    currentNudgeTier = 0;
};
