import { getDb } from '../database/databaseService';

export const analyzePatterns = async () => {
    const db = getDb();
    if (!db) {
        console.warn('[PatternAnalyzer] DB not initialized.');
        return { topTrigger: 'Unknown', vulnerableHour: -1 };
    }

    try {
        const triggerResult = await db.executeSql(
            `SELECT triggerType, COUNT(*) as count 
       FROM sessions 
       WHERE isPhubbing = 1 
       GROUP BY triggerType 
       ORDER BY count DESC 
       LIMIT 1`
        );

        let topTrigger = 'Unknown';
        if (triggerResult && triggerResult[0].rows.length > 0) {
            topTrigger = triggerResult[0].rows.item(0).triggerType || 'Unknown';
        }

        const hourResult = await db.executeSql(
            `SELECT CAST(strftime('%H', startTime / 1000, 'unixepoch', 'localtime') AS INTEGER) as hourOfDay, COUNT(*) as count 
       FROM sessions 
       WHERE isPhubbing = 1 
       GROUP BY hourOfDay 
       ORDER BY count DESC 
       LIMIT 1`
        );

        let vulnerableHour = -1;
        if (hourResult && hourResult[0].rows.length > 0) {
            vulnerableHour = hourResult[0].rows.item(0).hourOfDay;
        }

        console.log(`[PatternAnalyzer] Top Trigger: ${topTrigger}, Vulnerable Hour: ${vulnerableHour}`);
        return { topTrigger, vulnerableHour };

    } catch (error) {
        console.error('[PatternAnalyzer] Error analyzing patterns:', error);
        return { topTrigger: 'Error', vulnerableHour: -1 };
    }
};
