<div align="center">

# PresencePulse

_A mobile behavior engine that tracks social-mode sessions, flags micro-checks, and surfaces attention drift in real time._

</div>

## Table of Contents

1. [Overview](#overview)
2. [Feature Highlights](#feature-highlights)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
6. [Development Workflow](#development-workflow)
7. [Testing & Quality](#testing--quality)
8. [Troubleshooting](#troubleshooting)
9. [Roadmap](#roadmap)

## Overview

PresencePulse is an experimental React Native application that helps surface patterns of fragmented attention. A lightweight in-app **Social Mode** triggers the `contextEngine`, which records session boundaries, classifies micro-checks (sessions shorter than 20 seconds), and raises an **attention drift** signal when bursts of interruptions occur.

The project currently focuses on _Phase 1_ instrumentation so we can demo session tracking, logging, and visualization quickly before layering on coaching content or notifications.

## Feature Highlights

- **Social Mode Toggle** – Single CTA in `App.tsx` that starts or ends monitoring sessions with one tap.
- **Context Engine (Phase 1)** – Centralized service (`src/services/contextEngine.js`) that stores session history, micro-check counts, and burst metadata.
- **Attention Drift Detection** – Five micro-checks in a rolling 10-minute window auto-set `attentionDrift` and display a banner in the UI.
- **Behavior Snapshot Panel** – Embedded debug dashboard showing live counts for sessions, micro-checks, burst-window activity, and social-mode status to accelerate validation during demos.
- **Verbose Demo Logging** – Every significant state transition is logged with ISO timestamps for clarity when screen-sharing or reviewing device logs.

## Architecture

| Layer | Responsibility | Key Files |
| --- | --- | --- |
| UI Shell | Hosts Social Mode CTA, renders snapshot metrics, and mirrors engine state. | `App.tsx` |
| Behavior Engine | Encapsulates session lifecycle, micro-check classification, burst detection, and attention-drift flagging. | `src/services/contextEngine.js` |
| Platform Scaffolding | Standard React Native entry points, Metro, Babel, and native projects for Android/iOS. | Root config (`package.json`, `metro.config.js`, `android/`, `ios/`) |

### Context Engine Flow

1. `startSession()` captures `Date.now()` and guards against overlapping sessions.
2. `endSession()` computes duration, classifies the result, and persists it into the in-memory history.
3. `detectMicroCheck()` increments `microCheckCount` and logs when duration `< 20s`.
4. `detectBurst()` maintains a sliding 10-minute window of micro-checks and flips `attentionDrift` after five hits.
5. UI polls `contextEngine.hasAttentionDrift()` after each toggle to keep the visual alert synchronized.

## Project Structure

```
PresencePulse/
├── App.tsx                     # Social Mode UI + hook orchestration
├── src/
│   └── services/
│       └── contextEngine.js   # Phase 1 behavior engine
├── __tests__/
│   └── App.test.tsx           # Jest baseline test
├── android/                   # Native Android wrapper (Gradle)
├── ios/                       # Native iOS wrapper (Xcode/Pods)
├── package.json               # Scripts, dependencies, engines
└── ...                        # Metro, Babel, Jest, TypeScript configs
```

## Getting Started

### Prerequisites

- Node.js `>= 22.11.0`
- Watchman (macOS) and Java 17+ for Android builds
- Xcode 15+ with CocoaPods for iOS
- Android Studio / SDK Platform 35 with an emulator or USB debugging enabled device
- Follow the official [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment) for “React Native CLI”

### Installation

```sh
git clone https://github.com/<your-org>/PresencePulse.git
cd PresencePulse
npm install
```

### Running Metro (all platforms)

```sh
npm start
# or
yarn start
```

### Launching the app

```sh
# Android (emulator or device)
npm run android

# iOS (requires CocoaPods)
cd ios && bundle install && bundle exec pod install
cd ..
npm run ios
```

> **Tip:** When deploying to a physical Android device, forward Metro using `adb reverse tcp:8081 tcp:8081` to ensure the JS bundle can be reached.

## Development Workflow

- **Iterate in App.tsx**: Hook new UI elements into the Social Mode state and call the exported helpers from `contextEngine`.
- **Extend the Engine**: Add new behavior in `src/services/contextEngine.js` (e.g., persistence, analytics) while reusing the existing public helpers (`startSession`, `endSession`, `hasAttentionDrift`).
- **Logging Strategy**: Keep console statements concise and prefixed (e.g., `[ContextEngine]`, `[Session]`) to make Metro logs easy to scan during usability sessions.
- **State Resetting**: Use `contextEngine.resetAttentionDrift()` or reload the bundle (double-`R` on Android, `Cmd+R` on iOS sim) to clear demo state quickly.

## Testing & Quality

| Command | Description |
| --- | --- |
| `npm run test` | Runs Jest test suite in `__tests__/`. Add coverage for new engine utilities as they are built. |
| `npm run lint` | Executes ESLint using the React Native shared config. |
| `npm run android` / `npm run ios` | Full native builds; surface TypeScript and runtime issues early. |

Future milestones include snapshot tests for the Social Mode UI and focused unit tests around burst detection to prevent regressions.

## Troubleshooting

- **Metro cannot find the device** – Ensure `adb devices` lists your hardware/emulator and run `adb reverse tcp:8081 tcp:8081` when on USB.
- **Stuck on old bundle** – Stop Metro (`CTRL+C`) and clear its cache: `npx react-native start --reset-cache`.
- **CocoaPods failures** – Run `sudo gem install cocoapods` then `bundle exec pod repo update` inside `ios/`.
- **Permission issues on Android** – Delete the `android/app/build` folder and rerun `npm run android` to trigger a clean Gradle build.

## Roadmap

- Phase 2: Persist session history to durable storage for longitudinal insights.
- Phase 3: Layer on interventions (nudges, reminders) when attention drift is active.
- Phase 4: Sync telemetry to a backend for team-level reporting and research.

---

For questions or ideas, open an issue or start a discussion in the repository. Let’s build healthier digital habits together. ✨
