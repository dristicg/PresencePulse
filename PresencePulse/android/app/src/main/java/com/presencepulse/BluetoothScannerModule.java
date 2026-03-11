package com.presencepulse;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothManager;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanResult;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Handler;
import android.os.Looper;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.HashSet;
import java.util.Set;

public class BluetoothScannerModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "BluetoothScannerModule";
    private final ReactApplicationContext reactContext;
    private BluetoothAdapter bluetoothAdapter;
    private BluetoothLeScanner bluetoothLeScanner;
    private final Set<String> discoveredDevices = new HashSet<>();
    private boolean isScanning = false;

    public BluetoothScannerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        BluetoothManager bluetoothManager = (BluetoothManager) reactContext.getSystemService(Context.BLUETOOTH_SERVICE);
        if (bluetoothManager != null) {
            bluetoothAdapter = bluetoothManager.getAdapter();
        }
    }

    @NonNull
    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void scanForDevices(int durationMs, Promise promise) {
        if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled()) {
            promise.reject("BLUETOOTH_DISABLED", "Bluetooth is turned off or not supported.");
            return;
        }

        if (ContextCompat.checkSelfPermission(reactContext, Manifest.permission.BLUETOOTH_SCAN) != PackageManager.PERMISSION_GRANTED) {
             if (ContextCompat.checkSelfPermission(reactContext, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                 promise.reject("PERMISSION_DENIED", "Missing Bluetooth or Location permissions");
                 return;
             }
        }

        bluetoothLeScanner = bluetoothAdapter.getBluetoothLeScanner();
        if (bluetoothLeScanner == null) {
            promise.reject("SCANNER_UNAVAILABLE", "Bluetooth LE Scanner is unavailable");
            return;
        }

        if (isScanning) {
            promise.resolve(discoveredDevices.size());
            return;
        }

        discoveredDevices.clear();
        isScanning = true;

        ScanCallback scanCallback = new ScanCallback() {
            @Override
            public void onScanResult(int callbackType, ScanResult result) {
                if (result.getDevice() != null) {
                    discoveredDevices.add(result.getDevice().getAddress());
                }
            }
        };

        try {
            bluetoothLeScanner.startScan(scanCallback);
            
            new Handler(Looper.getMainLooper()).postDelayed(() -> {
                if (isScanning) {
                    try {
                        bluetoothLeScanner.stopScan(scanCallback);
                    } catch (SecurityException e) {
                        // Ignore
                    }
                    isScanning = false;
                    promise.resolve(discoveredDevices.size());
                }
            }, durationMs);
            
        } catch (SecurityException e) {
            isScanning = false;
            promise.reject("SECURITY_EXCEPTION", "Permission error starting scan", e);
        }
    }
}
