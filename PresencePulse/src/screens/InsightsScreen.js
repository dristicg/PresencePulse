import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import WeeklyHeatmap from '../components/WeeklyHeatmap';
// import { PhubbingHeatSignature } from '../components/PhubbingHeatSignature'; // Import below
import PhubbingHeatSignature from '../components/PhubbingHeatSignature';
import MorningCheckIn from '../components/MorningCheckIn';

const InsightsScreen = ({ 
  onBack, 
  weeklyScores, 
  microChecks, 
  burstEvents, 
  triggerApps, 
  improvementStreak,
  vulnerableHourData,
  checkInDone,
  checkInResponse,
  onCheckInComplete
}) => {
  const isMorning = new Date().getHours() < 10;
  const showCheckIn = isMorning || checkInDone;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backBtn}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Attention Insights</Text>
      </View>

      {showCheckIn && (
        <MorningCheckIn 
          microChecks={microChecks}
          score={weeklyScores?.[weeklyScores.length - 1]?.presence_score || 100}
          onComplete={onCheckInComplete}
          initialResponse={checkInResponse}
        />
      )}

      <Text style={styles.sectionTitle}>Weekly Activity</Text>
      {weeklyScores && weeklyScores.length > 0 && <WeeklyHeatmap scores={weeklyScores} />}

      {/* Integration: Phubbing Heat Signature */}
      <View style={styles.featureSection}>
        <Text style={styles.featureTitle}>Phubbing Heat Signature</Text>
        <Text style={styles.featureSubtitle}>Your phone's emotional weight across the day</Text>
        <PhubbingHeatSignature />
      </View>

      <View style={styles.cardGroup}>
        <InsightCard
          label="Micro-checks Today"
          value={String(microChecks)}
          emphasize
          accentColor="#00FFA3"
        />
        <InsightCard
          label="Burst Events"
          value={String(burstEvents)}
          accentColor="#FF3366"
        />
        <InsightCard
          label="Improvement Streak"
          value={`${improvementStreak} Days`}
          accentColor="#7C3AED"
        />
      </View>

      <View style={styles.patternSection}>
        <Text style={styles.sectionTitle}>Behavioral Triggers</Text>
        {triggerApps && triggerApps.map((app, i) => (
          <View key={i} style={styles.patternCard}>
            <Text style={styles.patternLabel}>Top Trigger {i + 1}</Text>
            <Text style={styles.patternValue}>{app.package_name || 'System'}</Text>
            <Text style={styles.patternDetail}>{app.micro_check_count} checks per week</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const InsightCard = ({ label, value, emphasize, accentColor }) => (
  <View style={[styles.card, accentColor ? { borderColor: accentColor } : null]}>
    <Text style={styles.cardLabel}>{label}</Text>
    <Text style={[styles.cardValue, emphasize && styles.emphasize, accentColor ? { color: accentColor } : null]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
    backgroundColor: '#09090B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backBtn: {
    fontSize: 40,
    color: '#FFF',
    marginRight: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#E4E4E7',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  featureSection: {
    marginVertical: 32,
    backgroundColor: '#18181B',
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  featureTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 14,
    color: '#A1A1AA',
    marginBottom: 24,
    fontWeight: '500',
  },
  cardGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#18181B',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  cardLabel: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  cardValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
  },
  emphasize: {
    fontSize: 32,
  },
  patternSection: {
    marginTop: 10,
  },
  patternCard: {
    backgroundColor: '#18181B',
    borderRadius: 24,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  patternLabel: {
    color: '#A1A1AA',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  patternValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  patternDetail: {
    color: '#71717A',
    fontSize: 13,
    marginTop: 4,
  }
});

export default InsightsScreen;
