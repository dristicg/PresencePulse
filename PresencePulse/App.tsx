/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import React, { useEffect, useState } from 'react';
import {
  Button,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import contextEngine, {
  endSession as engineEndSession,
  startSession as engineStartSession,
} from './src/services/contextEngine';

const MICRO_CHECK_THRESHOLD_SECONDS = 20;
const BURST_WINDOW_MS = 10 * 60 * 1000;
const BURST_COUNT = 5;

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

type SessionRecord = {
  startTime: number;
  endTime: number | null;
  durationMs: number | null;
  durationSeconds: number | null;
  type: 'pending' | 'micro-check' | 'session';
};

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const [currentSession, setCurrentSession] = useState<SessionRecord | null>(
    null,
  );
  const [sessionHistory, setSessionHistory] = useState<SessionRecord[]>([]);
  const [microCheckCount, setMicroCheckCount] = useState(0);
  const [attentionDrift, setAttentionDrift] = useState(false);
  const [microCheckTimestamps, setMicroCheckTimestamps] = useState<number[]>(
    [],
  );
  const [isSocialMode, setIsSocialMode] = useState(false);

  const beginLocalSession = () => {
    if (currentSession) {
      console.log('Session already active');
      return false;
    }

    const newSession: SessionRecord = {
      startTime: Date.now(),
      endTime: null,
      durationMs: null,
      durationSeconds: null,
      type: 'pending',
    };

    setCurrentSession(newSession);
    console.log('Session started');
    return true;
  };

  const completeLocalSession = () => {
    if (!currentSession) {
      console.log('No active session to end');
      return false;
    }

    const endTime = Date.now();
    const durationMs = endTime - currentSession.startTime;
    const durationSeconds = durationMs / 1000;
    const isMicroCheck = durationSeconds < MICRO_CHECK_THRESHOLD_SECONDS;

    const completedSession: SessionRecord = {
      ...currentSession,
      endTime,
      durationMs,
      durationSeconds,
      type: isMicroCheck ? 'micro-check' : 'session',
    };

    setSessionHistory((prev) => [...prev, completedSession]);
    setCurrentSession(null);

    console.log(
      `[Session] Ended. Start=${new Date(
        completedSession.startTime,
      ).toISOString()} End=${new Date(endTime).toISOString()} Duration(s)=${durationSeconds.toFixed(
        2,
      )} Type=${completedSession.type}`,
    );

    if (isMicroCheck) {
      setMicroCheckCount((prev) => {
        const next = prev + 1;
        console.log(`[Session] Micro-check count=${next}`);
        return next;
      });

      setMicroCheckTimestamps((prev) => {
        const next = [...prev, endTime].filter(
          (timestamp) => endTime - timestamp <= BURST_WINDOW_MS,
        );

        console.log(
          `[Session] Micro-checks within 10-minute window=${next.length}`,
        );

        if (next.length >= BURST_COUNT) {
          console.log('[Session] Burst detected locally');
        }

        return next;
      });
    } else {
      console.log('[Session] Standard session recorded');
    }

    return true;
  };

  const updateAttentionDriftState = () => {
    setAttentionDrift(contextEngine.hasAttentionDrift());
  };

  const toggleSocialMode = () => {
    if (!isSocialMode) {
      const started = beginLocalSession();
      if (started) {
        engineStartSession();
        setIsSocialMode(true);
      }
    } else {
      const ended = completeLocalSession();
      if (ended) {
        engineEndSession();
        setIsSocialMode(false);
      }
    }

    updateAttentionDriftState();
  };

  useEffect(() => {
    console.log('[AppContent] Session state hooks initialized');
  }, []);

  return (
    <View style={styles.container}>
      <NewAppScreen
        templateFileName="App.tsx"
        safeAreaInsets={safeAreaInsets}
      />
      <View style={styles.debugPanel}>
        <Text style={styles.debugTitle}>Behavior Snapshot</Text>
        <Text style={styles.debugRow}>
          Current session: {currentSession ? 'active' : 'none'}
        </Text>
        <Text style={styles.debugRow}>
          Session history count: {sessionHistory.length}
        </Text>
        <Text style={styles.debugRow}>
          Micro-check count: {microCheckCount}
        </Text>
        <Text style={styles.debugRow}>
          Attention drift: {attentionDrift ? 'true' : 'false'}
        </Text>
        <Text style={styles.debugRow}>
          Burst window micro-checks: {microCheckTimestamps.length}
        </Text>
        <Text style={styles.debugRow}>
          Social mode: {isSocialMode ? 'active' : 'inactive'}
        </Text>
        {attentionDrift && (
          <Text style={styles.alertMessage}>Attention drift detected</Text>
        )}
        <View style={styles.spacer} />
        <Button
          title={isSocialMode ? 'End Social Mode' : 'Start Social Mode'}
          onPress={toggleSocialMode}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  spacer: {
    height: 8,
  },
  debugPanel: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
  },
  alertMessage: {
    marginTop: 8,
    color: '#b00020',
    fontWeight: '600',
  },
  debugTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  debugRow: {
    fontSize: 12,
    color: '#333',
  },
});

export default App;
