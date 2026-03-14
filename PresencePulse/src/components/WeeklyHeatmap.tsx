import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const getScoreColor = (score: number | null | undefined) => {
    if (score === null || score === undefined) return 'rgba(255,255,255,0.05)';
    if (score >= 80) return '#10B981'; // Neon Green
    if (score >= 65) return '#34D399'; // Mint Green
    if (score >= 50) return '#F59E0B'; // Neon Orange
    if (score >= 35) return '#F43F5E'; // Vibrant Pink
    return '#E11D48'; // Neon Red
};

const generateLast7Days = (scores: any[]) => {
    const days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayLabel = DAY_LABELS[d.getDay()];

        const match = scores.find((s: any) => s.date === dateStr);
        days.push({
            date: dateStr,
            score: match ? match.presence_score : null,
            dayLabel,
        });
    }

    return days;
};

export default function WeeklyHeatmap({ scores = [] }: { scores?: any[] }) {
    const days = generateLast7Days(scores);

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>7-DAY PRESENCE</Text>
            <View style={styles.row}>
                {days.map((day) => {
                    const bgColor = getScoreColor(day.score);
                    const textColor = day.score === null ? '#999' : '#FFF';
                    return (
                        <View key={day.date} style={styles.dayColumn}>
                            <View style={[styles.square, { backgroundColor: bgColor }]}>
                                <Text style={[styles.scoreText, { color: textColor }]}>
                                    {day.score !== null ? day.score : '–'}
                                </Text>
                            </View>
                            <Text style={styles.dayLabel}>{day.dayLabel}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: 'rgba(24, 24, 27, 0.7)',
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#27272A',
    },
    sectionTitle: {
        color: '#A1A1AA',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dayColumn: {
        alignItems: 'center',
        gap: 8,
    },
    square: {
        width: 38,
        height: 38,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scoreText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    dayLabel: {
        color: '#71717A',
        fontSize: 12,
        fontWeight: '700',
    },
});
