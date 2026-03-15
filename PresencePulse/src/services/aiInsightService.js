import { GEMINI_API_KEY } from '../constants/apiKeys';

const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// STEP 3: Create AI Insight Service
export function buildBehaviorSummary(metrics, patterns) {
    // NEVER send raw package names to the LLM. Map package names to generic categories.
    const packageCategoryMap = {
        'com.instagram.android': 'Social Media',
        'com.whatsapp': 'Messaging',
        'com.google.android.youtube': 'Video',
        'com.linkedin.android': 'Professional Social',
        'com.snapchat.android': 'Social Media',
        'com.reddit.frontpage': 'Social Media'
    };

    const mapPackageToCategory = (packageName) => {
        return packageCategoryMap[packageName] || "Unknown App Category";
    };

    return {
        micro_checks_today: metrics?.microChecks || 0,
        bursts_today: metrics?.burstEvents || 0,
        presence_score: metrics?.presenceScore || 100,
        worst_hour_today: patterns?.vulnerableHour || -1,
        top_trigger_category: mapPackageToCategory(patterns?.topTrigger),
        phubbing_events_today: metrics?.phubbingEvents || 0,
        days_tracked: patterns?.daysTracked || 1,
        avg_score_this_week: patterns?.avgScoreThisWeek || metrics?.presenceScore || 100,
        best_score_this_week: patterns?.bestScoreThisWeek || metrics?.presenceScore || 100,
        vulnerable_hour: patterns?.vulnerableHour || -1,
        improvement_streak_days: patterns?.improvementStreakDays || 0,
        total_social_context_minutes: metrics?.totalSocialContextMinutes || 0
    };
}

// STEP 6: Implement Fallback Insight
export function getFallbackInsight(metrics) {
    const score = metrics?.presenceScore || 100;
    if (score >= 80) {
        return "Great job staying present today. Your discipline is paying off—keep protecting your focus.";
    }
    if (score >= 60) {
        return "You had some moments of drift today, but you're doing okay. Try to notice what triggers your phone checks tomorrow.";
    }
    return "Today was heavily fragmented by phone use. Tomorrow, try putting your phone in another room during your most vulnerable hours to regain your focus.";
}

// STEP 4 & 5: Implement generateDailyInsight and call API
export async function generateDailyInsight(metrics, patterns) {
    const summary = buildBehaviorSummary(metrics, patterns);

    const prompt = `Act as a warm, non-judgmental digital wellness coach specializing in mindful phone habits.

Here is the user's behavioral summary:
- Micro-checks: ${summary.micro_checks_today}
- Bursts: ${summary.bursts_today}
- Presence Score: ${summary.presence_score}
- Worst Hour: ${summary.worst_hour_today}
- Top Trigger Category: ${summary.top_trigger_category}
- Phubbing Events: ${summary.phubbing_events_today}
- Weekly Average Score: ${summary.avg_score_this_week}
- Improvement Streak: ${summary.improvement_streak_days} days

Provide exactly 4 sentences:
1. One sentence acknowledging today's behavioral pattern.
2. One sentence explaining the likely emotional trigger (based on their top trigger category).
3. One sentence suggesting a concrete action tomorrow.
4. One sentence encouraging the user.

Rules:
- Total response under 80 words.
- No bullet points.
- No numbered lists.
- Just natural sentences.`;

    try {
        const response = await fetch(GEMINI_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) throw new Error('Gemini API Error');

        const data = await response.json();
        const insight = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        console.log('[PresencePulse] AI insight generated via Gemini');
        return insight ? insight.trim() : getFallbackInsight(metrics);
    } catch (error) {
        console.log('[PresencePulse] AI fallback triggered:', error);
        return getFallbackInsight(metrics);
    }
}

export async function sendCheckInMessage(userMessage, behaviorContext) {
    try {
        const systemPrompt = `You are a warm digital wellness coach. The user is checking in about their phone habits.
                         Their presence score today is ${behaviorContext.score}/100.
                         They have had ${behaviorContext.microChecks} micro-checks so far.
                         Respond in 2-3 sentences. Be conversational, not clinical.
                         Do not repeat their words back. Offer one specific, actionable thought.`;

        const response = await fetch(GEMINI_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    { role: 'user', parts: [{ text: `SYSTEM CONTEXT: ${systemPrompt}\n\nUSER MESSAGE: ${userMessage}` }] }
                ]
            })
        });

        if (!response.ok) throw new Error('Gemini API Error');

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        return text ? text.trim() : "I understand. Focus on one small moment of presence right now, and let's try to be more intentional with our next pick-up.";
    } catch (error) {
        console.error('[PresencePulse] Check-in API error:', error);
        return "I understand. Focus on one small moment of presence right now, and let's try to be more intentional with our next pick-up.";
    }
}
