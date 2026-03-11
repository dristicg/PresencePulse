import { NativeModules, NativeEventEmitter } from 'react-native';

const { UsageStatsModule } = NativeModules;
const usageEventEmitter = new NativeEventEmitter(UsageStatsModule);

export function listenForUnlockEvents(callback) {
  if (!UsageStatsModule) return null;

  // onScreenUnlock event is emitted from the native side
  return usageEventEmitter.addListener('onScreenUnlock', callback);
}

export async function checkUsageAccessPermission() {
  if (!UsageStatsModule) {
    console.warn('UsageStatsModule is not available');
    return false;
  }
  return await UsageStatsModule.checkUsageAccessPermission();
}

export function openUsageAccessSettings() {
  if (!UsageStatsModule) {
    console.warn('UsageStatsModule is not available');
    return;
  }
  UsageStatsModule.openUsageAccessSettings();
}

export async function getRecentUsageEvents() {
  if (!UsageStatsModule) {
    console.warn('UsageStatsModule is not available');
    return [];
  }
  try {
    const hasPermission = await checkUsageAccessPermission();
    if (!hasPermission) {
      console.warn('Usage Access Permission is not granted.');
      return [];
    }
    const events = await UsageStatsModule.queryEvents();
    return events;
  } catch (error) {
    console.error('Error fetching usage events:', error);
    return [];
  }
}
