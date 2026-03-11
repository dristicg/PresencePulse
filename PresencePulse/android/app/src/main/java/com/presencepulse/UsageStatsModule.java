package com.presencepulse;

import android.app.AppOpsManager;
import android.app.usage.UsageEvents;
import android.app.usage.UsageStatsManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Process;
import android.provider.Settings;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import com.facebook.react.modules.core.DeviceEventManagerModule;

public class UsageStatsModule extends ReactContextBaseJavaModule {

    private static final String MODULE_NAME = "UsageStatsModule";
    private final ReactApplicationContext reactContext;
    private BroadcastReceiver screenUnlockReceiver;

    public UsageStatsModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        setupUnlockReceiver();
    }

    private void setupUnlockReceiver() {
        screenUnlockReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (Intent.ACTION_USER_PRESENT.equals(intent.getAction())) {
                    sendEvent("onScreenUnlock", (double) System.currentTimeMillis());
                }
            }
        };
        IntentFilter filter = new IntentFilter(Intent.ACTION_USER_PRESENT);
        reactContext.registerReceiver(screenUnlockReceiver, filter);
    }

    private void sendEvent(String eventName, Object data) {
        if (reactContext.hasActiveCatalystInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, data);
        }
    }

    @NonNull
    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void checkUsageAccessPermission(Promise promise) {
        AppOpsManager appOps = (AppOpsManager) reactContext.getSystemService(Context.APP_OPS_SERVICE);
        if (appOps == null) {
            promise.resolve(false);
            return;
        }
        int mode = appOps.unsafeCheckOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                reactContext.getPackageName()
        );
        promise.resolve(mode == AppOpsManager.MODE_ALLOWED);
    }

    @ReactMethod
    public void openUsageAccessSettings() {
        Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        reactContext.startActivity(intent);
    }

    @ReactMethod
    public void queryEvents(Promise promise) {
        try {
            UsageStatsManager usageStatsManager = (UsageStatsManager) reactContext.getSystemService(Context.USAGE_STATS_SERVICE);
            if (usageStatsManager == null) {
                promise.reject("USAGE_STATS_ERROR", "UsageStatsManager is null");
                return;
            }

            long endTime = System.currentTimeMillis();
            long startTime = endTime - (5 * 60 * 1000); // last 5 minutes

            UsageEvents events = usageStatsManager.queryEvents(startTime, endTime);
            WritableArray results = Arguments.createArray();

            UsageEvents.Event event = new UsageEvents.Event();
            while (events.hasNextEvent()) {
                events.getNextEvent(event);
                int eventType = event.getEventType();

                // 1 = ACTIVITY_RESUMED / MOVE_TO_FOREGROUND
                // 2 = ACTIVITY_PAUSED / MOVE_TO_BACKGROUND
                if (eventType == 1 || eventType == 2) {
                    WritableMap map = Arguments.createMap();
                    map.putString("packageName", event.getPackageName());
                    map.putDouble("timestamp", event.getTimeStamp());
                    map.putString("eventType", eventType == 1 ? "FOREGROUND" : "BACKGROUND");
                    
                    results.pushMap(map);
                }
            }

            promise.resolve(results);
        } catch (Exception e) {
            promise.reject("USAGE_STATS_ERROR", e.getMessage(), e);
        }
    }
}
