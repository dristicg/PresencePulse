import { getDailyMetrics, getSessionsForDate } from '../database/databaseService';
import { analyzePatterns } from '../engine/patternAnalyzer';
import { GEMINI_API_KEY } from '../constants/apiKeys';

const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Behavioral Blueprint — structured output from deep pattern analysis
 */

/**
 * Query last 7 days of sessions and build a behavioral data summary
 * for the LLM to reason over.
 */
async function build7DaySessionSummary() {
    const dailySummaries = [];

    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        try {
            const sessions = await getSessionsForDate(dateStr);
            if (!sessions || sessions.length === 0) continue;

            // Aggregate hourly micro-check counts
            const hourlyMicroChecks = {};
            const appMicroChecks = {};
            let totalMicroChecks = 0;
            let totalSessions = 0;

            for (const s of sessions) {
                totalSessions++;
                if (s.session_type === 'micro-check' || s.type === 'micro-check') {
                    totalMicroChecks++;
                    const hour = new Date(s.start_time || s.startTime).getHours();
                    hourlyMicroChecks[hour] = (hourlyMicroChecks[hour] || 0) + 1;

                    const pkg = s.package_name || s.packageName || 'unknown';
                    appMicroChecks[pkg] = (appMicroChecks[pkg] || 0) + 1;
                }
            }

            dailySummaries.push({
                date: dateStr,
                totalSessions,
                totalMicroChecks,
                hourlyMicroChecks,
                topTriggerApps: Object.entries(appMicroChecks)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([pkg, count]) => ({ package: pkg, count }))
            });
        } catch (e) {
            console.warn(`[LLMService] Error fetching sessions for ${dateStr}:`, e);
        }
    }

    return dailySummaries;
}

/**
 * Generate a Behavioral Blueprint using Gemini 1.5 Pro
 * Returns structured insights about vulnerability windows, triggers, and trends.
 */
export const generateBehavioralBlueprint = async () => {
    try {
        const sessionSummary = await build7DaySessionSummary();
        const metrics = await getDailyMetrics();
        const patterns = await analyzePatterns();

        if (sessionSummary.length === 0) {
            return getDefaultBlueprint();
        }

        const prompt = `You are a high-performance behavioral psychologist. Analyze this 7-day usage data and return a JSON behavior blueprint.
        
        DATA: ${JSON.stringify(sessionSummary)}
        TODAY: Score ${metrics?.presenceScore || 100}, MC ${metrics?.microChecks || 0}, Bursts ${metrics?.burstEvents || 0}
        
        Return ONLY valid JSON:
        {
          "vulnerabilityWindows": [{"startHour": <number>, "endHour": <number>, "severity": "high|medium|low"}],
          "triggerPatterns": [{"app": "<readable name>", "category": "<social|entertainment|messaging>", "frequency": <number>}],
          "weeklyTrend": "improving|stable|declining",
          "coachingInsight": "<Strict 4-sentence structure: 1. Observation of today's pattern. 2. Identification of the emotional trigger. 3. One concrete habit-swap for tomorrow. 4. High-impact encouragement.>"
        }
        
        Rules:
        - Map package names to readable names.
        - Advice must be DATA-DRIVEN and UNCOMFORTABLY SPECIFIC.`;

        const response = await fetch(GEMINI_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 500
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[LLMService] Gemini error:', response.status, errorText);
            return getDefaultBlueprint();
        }

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) return getDefaultBlueprint();

        // Parse JSON from response (strip any markdown fences)
        const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const blueprint = JSON.parse(cleaned);
        blueprint.generatedAt = new Date().toISOString();

        console.log('[LLMService] Behavioral Blueprint generated');
        return blueprint;
    } catch (error) {
        console.error('[LLMService] Blueprint generation error:', error);
        return getDefaultBlueprint();
    }
};

/**
 * Lightweight daily insight — quick tip for the insights screen
 */
export const fetchDailyInsight = async () => {
    try {
        const metrics = await getDailyMetrics();
        const patterns = await analyzePatterns();

        let microChecks = metrics ? metrics.microChecks : 0;
        let presenceScore = metrics ? metrics.presenceScore : 100;
        let topTrigger = patterns ? patterns.topTrigger : 'Unknown';

        const prompt = `
            You are a digital wellbeing coach. Analyze this data:
            - Presence Score: ${presenceScore}/100
            - Micro-checks: ${microChecks}
            - Top Trigger: ${topTrigger}
            
            Provide exactly 4 sentences of coaching:
            1. One sentence acknowledging today's pattern.
            2. One sentence explaining the likely emotional trigger (boredom, anxiety, curiosity).
            3. One sentence suggesting a concrete action for tomorrow.
            4. One sentence of punchy encouragement.
            
            Keep it under 60 words total. No intro/outro.
        `;

        const response = await fetch(GEMINI_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[LLMService] HTTP error response:', response.status, errorText);
            return "Take a deep breath. Let's focus on being present tomorrow.";
        }

        const data = await response.json();
        const insight = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        return insight ? insight.trim() : "Tomorrow is a new day to be present.";
    } catch (error) {
        console.error('[LLMService] Error fetching insight:', error);
        return "Disconnect to reconnect. Your presence matters.";
    }
};

function getDefaultBlueprint() {
    return {
        vulnerabilityWindows: [],
        triggerPatterns: [],
        weeklyTrend: 'stable',
        coachingInsight: 'Keep using the app to build your behavioral profile. Insights will appear after a few days of tracking.',
        generatedAt: new Date().toISOString()
    };
}
