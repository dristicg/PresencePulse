import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  getBurstCount,
  getMicroCheckCount,
  getPresenceScore,
} from './src/services/contextEngine';

function App() {
  return (
    <>
      <StatusBar barStyle="light-content" />
      <ScreenManager />
    </>
  );
}

function ScreenManager() {
  const [screen, setScreen] = useState<
    'home' | 'social' | 'drift' | 'reconnect' | 'insights' | 'timeline'
  >('home');
  const [microChecks, setMicroChecks] = useState(0);
  const [burstEvents, setBurstEvents] = useState(0);
  const [presenceScore, setPresenceScore] = useState(100);

  useEffect(() => {
    if (screen === 'insights') {
      setMicroChecks(getMicroCheckCount());
      setBurstEvents(getBurstCount());
      setPresenceScore(getPresenceScore());
    }
  }, [screen]);

  const renderHome = () => (
    <View style={styles.centeredBlock}>
      <Text style={styles.title}>Presence Pulse</Text>
      <Text style={styles.tagline}>Real-time behavioral analysis</Text>
      <Text style={styles.subtitle}>
        Monitor your digital attention in real-time
      </Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => setScreen('social')}
      >
        <Text style={styles.primaryButtonText}>Start Social Mode</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSocial = () => (
    <View style={styles.centeredBlock}>
      <Text style={styles.title}>Social Mode Active</Text>
      <Text style={styles.subtitle}>Tracking your attention...</Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => setScreen('drift')}
      >
        <Text style={styles.primaryButtonText}>End Session</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDrift = () => (
    <View style={styles.centeredBlock}>
      <Text style={styles.warning}>⚠ Attention Drift Detected</Text>
      <Text style={styles.subtitle}>
        You've had multiple micro-check bursts in the last 10 minutes.
      </Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => setScreen('reconnect')}
      >
        <Text style={styles.primaryButtonText}>Return to Focus</Text>
      </TouchableOpacity>
    </View>
  );

  const renderReconnect = () => (
    <View style={styles.centeredBlock}>
      <Text style={styles.title}>Reconnect With Intention</Text>
      <Text style={styles.subtitle}>Take 2 minutes to reset your focus.</Text>
      <View style={styles.cardGroup}>
        <SuggestionCard label="Deep Breathing" />
        <SuggestionCard label="Short Walk" />
        <SuggestionCard label="Call a Friend" />
      </View>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => setScreen('insights')}
      >
        <Text style={styles.primaryButtonText}>Continue to Insights</Text>
      </TouchableOpacity>
    </View>
  );

  const renderInsights = () => (
    <View style={styles.centeredBlock}>
      <Text style={styles.title}>Your Attention Insights</Text>
      <View style={styles.cardGroup}>
        <InsightCard
          label="Micro-checks Today"
          value={String(microChecks)}
        />
        <InsightCard
          label="Burst Events"
          value={String(burstEvents)}
        />
        <InsightCard
          label="Presence Score"
          value={`${presenceScore}%`}
          emphasize
        />
      </View>
      <TouchableOpacity
        style={[styles.primaryButton, styles.fullWidthButton]}
        onPress={() => setScreen('timeline')}
      >
        <Text style={styles.primaryButtonText}>View Attention Timeline</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => setScreen('home')}
      >
        <Text style={styles.secondaryButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTimeline = () => (
    <View style={styles.centeredBlock}>
      <Text style={styles.title}>Attention Timeline</Text>
      <View style={styles.timeline}>
        <TimelineItem time="10:12 AM" event="Micro-check" />
        <TimelineItem time="10:18 AM" event="Micro-check" />
        <TimelineItem time="10:25 AM" event="Burst Detected" highlight />
        <TimelineItem time="12:05 PM" event="Session Started" />
        <TimelineItem time="12:07 PM" event="Micro-check" />
      </View>
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => setScreen('insights')}
      >
        <Text style={styles.secondaryButtonText}>Back to Insights</Text>
      </TouchableOpacity>
    </View>
  );

  const renderScreen = () => {
    switch (screen) {
      case 'social':
        return renderSocial();
      case 'drift':
        return renderDrift();
      case 'reconnect':
        return renderReconnect();
      case 'insights':
        return renderInsights();
      case 'timeline':
        return renderTimeline();
      case 'home':
      default:
        return renderHome();
    }
  };

  return <SafeAreaView style={styles.container}>{renderScreen()}</SafeAreaView>;
}

function InsightCard({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={emphasize ? styles.cardValueLarge : styles.cardValue}>
        {value}
      </Text>
    </View>
  );
}

function SuggestionCard({ label }: { label: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardValue}>{label}</Text>
    </View>
  );
}

function TimelineItem({
  time,
  event,
  highlight = false,
}: {
  time: string;
  event: string;
  highlight?: boolean;
}) {
  return (
    <View
      style={[styles.timelineItem, highlight && styles.timelineItemHighlight]}
    >
      <Text style={styles.timelineTime}>{time}</Text>
      <Text style={styles.timelineEvent}>{event}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingHorizontal: 24,
  },
  centeredBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    color: '#F1F5F9',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 12,
  },
  fullWidthButton: {
    width: '100%',
    marginBottom: 20,
  },
  primaryButtonText: {
    color: '#E2E8F0',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  warning: {
    fontSize: 22,
    color: '#F87171',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  cardGroup: {
    width: '100%',
    gap: 24,
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2F3B53',
  },
  cardLabel: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardValue: {
    color: '#F1F5F9',
    fontSize: 22,
    fontWeight: '700',
  },
  cardValueLarge: {
    color: '#F1F5F9',
    fontSize: 34,
    fontWeight: '800',
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#475569',
    marginTop: 16,
  },
  secondaryButtonText: {
    color: '#CBD5F5',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  timeline: {
    width: '100%',
    gap: 12,
    marginVertical: 24,
  },
  timelineItem: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#111C2F',
  },
  timelineItemHighlight: {
    borderColor: '#F87171',
  },
  timelineTime: {
    color: '#64748B',
    fontSize: 13,
    marginBottom: 4,
  },
  timelineEvent: {
    color: '#E2E8F0',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default App;
