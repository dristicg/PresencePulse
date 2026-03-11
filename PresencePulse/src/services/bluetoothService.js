import { NativeModules, PermissionsAndroid, Platform } from 'react-native';

const { BluetoothScannerModule } = NativeModules;

export async function requestBluetoothPermissions() {
    if (Platform.OS === 'android') {
        try {
            const permissions = [
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            ];

            if (Platform.Version >= 31) {
                permissions.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
                permissions.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
            }

            const result = await PermissionsAndroid.requestMultiple(permissions);

            const allGranted = Object.values(result).every(
                (val) => val === PermissionsAndroid.RESULTS.GRANTED
            );

            return allGranted;
        } catch (err) {
            console.warn('Error requesting Bluetooth permissions:', err);
            return false;
        }
    }
    return true;
}

export async function scanForDevices(durationMs = 5000) {
    if (!BluetoothScannerModule) {
        console.warn('BluetoothScannerModule is not available');
        return 0;
    }

    try {
        const hasPermission = await requestBluetoothPermissions();
        if (!hasPermission) {
            console.warn('Bluetooth permissions not granted');
            return 0;
        }

        const deviceCount = await BluetoothScannerModule.scanForDevices(durationMs);
        return deviceCount;
    } catch (error) {
        console.error('Error scanning for BLE devices:', error);
        return 0;
    }
}
