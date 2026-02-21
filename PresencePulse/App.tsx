import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  endSession,
  getAttentionDrift,
  resetDrift,
  startSession,
} from './src/services/contextEngine';

function App() {
  return (
    <>
      <StatusBar barStyle="light-content" />
      <RootScreen />
    </>
  );
}

function RootScreen() {
  const [isSocialMode, setIsSocialMode] = useState(false);
  const [driftDetected, setDriftDetected] = useState(false);

  const handleToggle = () => {
    if (!isSocialMode) {
      startSession();
      setIsSocialMode(true);
      return;
    }

    endSession();
    setIsSocialMode(false);
    setDriftDetected(getAttentionDrift());
  };

  const handleReset = () => {
    resetDrift();
    setDriftDetected(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>Presence Pulse</Text>

        <TouchableOpacity style={styles.button} onPress={handleToggle}>
          <Text style={styles.buttonText}>
            {isSocialMode ? 'End Social Mode' : 'Start Social Mode'}
          </Text>
        </TouchableOpacity>

        {driftDetected && (
          <>
            <Text style={styles.alert}>⚠ Attention Drift Detected</Text>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    color: '#F8FAFC',
    fontWeight: '700',
    marginBottom: 36,
  },
  button: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonText: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  alert: {
    marginTop: 32,
    color: '#F43F5E',
    fontWeight: '700',
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  resetButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#F43F5E',
  },
  resetText: {
    color: '#F43F5E',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default App;
