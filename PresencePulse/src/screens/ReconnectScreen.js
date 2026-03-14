import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ReconnectScreen({ burstCount, onComplete, onSkip }) {
    const insets = useSafeAreaInsets();
    const [mode, setMode] = useState('gate'); // 'gate' | 'menu' | 'breathe'
    const [gateTimeLeft, setGateTimeLeft] = useState(30);
    const [timeLeft, setTimeLeft] = useState(120);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const timerRef = useRef(null);
    const gateTimerRef = useRef(null);

    // Start the 30-second forced breathing gate immediately
    useEffect(() => {
        startGateBreathing();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (gateTimerRef.current) clearInterval(gateTimerRef.current);
            scaleAnim.stopAnimation();
        };
    }, []);

    const startGateBreathing = () => {
        // Start breathing animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.6,
                    duration: 4000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 4000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true
                })
            ])
        ).start();

        // 30-second countdown
        gateTimerRef.current = setInterval(() => {
            setGateTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(gateTimerRef.current);
                    scaleAnim.stopAnimation();
                    scaleAnim.setValue(1);
                    setMode('menu');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const startFullBreathing = () => {
        setMode('breathe');
        setTimeLeft(120);

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.6,
                    duration: 4000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 4000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true
                })
            ])
        ).start();
    };

    const isInhaling = (mode === 'gate' ? gateTimeLeft : timeLeft) % 8 >= 4;

    // FORCED 30-SECOND BREATHING GATE — no skip, no interaction
    if (mode === 'gate') {
        return (
            <View style={styles.container}>
                <Text style={styles.gateTitle}>Take a moment to breathe.</Text>
                <Text style={styles.gateSubtitle}>
                    You've been drifting. Let's reset together.
                </Text>

                <Text style={styles.gateTimer}>{gateTimeLeft}s</Text>

                <View style={styles.animationContainer}>
                    <Animated.View style={[styles.circle, { transform: [{ scale: scaleAnim }] }]} />
                    <Text style={styles.breatheText}>{isInhaling ? 'Inhale' : 'Exhale'}</Text>
                </View>

                <Text style={styles.gateHint}>Options appear after breathing</Text>
            </View>
        );
    }

    // FULL 2-MINUTE BREATHING (post-gate choice)
    if (mode === 'breathe') {
        if (timeLeft === 0) {
            return (
                <View style={styles.container}>
                    <Text style={styles.successTitle}>Well done. You are back.</Text>
                    <TouchableOpacity style={styles.primaryBtn} onPress={onComplete}>
                        <Text style={styles.btnText}>I am back ✓</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                <Text style={[styles.timer, { top: Math.max(insets.top + 20, 60) }]}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</Text>
                <View style={styles.animationContainer}>
                    <Animated.View style={[styles.circle, { transform: [{ scale: scaleAnim }] }]} />
                    <Text style={styles.breatheText}>{isInhaling ? 'Inhale' : 'Exhale'}</Text>
                </View>
            </View>
        );
    }

    // MENU — shown after the 30-second gate
    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <Text style={styles.title}>You drifted into phone mode again.</Text>
            <Text style={styles.subtitle}>
                We detected {burstCount} burst limits exceeded today. Let's disconnect for a moment.
            </Text>

            <View style={styles.optionsList}>
                <TouchableOpacity style={styles.optionCard} onPress={startFullBreathing}>
                    <Text style={styles.cardTitle}>1. Guided breathing</Text>
                    <Text style={styles.cardDesc}>2-minute visual exercise to reset your nervous system.</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionCard} onPress={() => {/* Mock */ }}>
                    <Text style={styles.cardTitle}>2. Take a short walk</Text>
                    <Text style={styles.cardDesc}>Leave your phone on the desk and walk for 5 minutes.</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionCard} onPress={() => {/* Mock */ }}>
                    <Text style={styles.cardTitle}>3. 30-minute block</Text>
                    <Text style={styles.cardDesc}>Commit to staying off your phone and lock distracting apps.</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
                <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#09090B',
        padding: 24,
        justifyContent: 'center'
    },
    gateTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#F1F5F9',
        textAlign: 'center',
        marginBottom: 8
    },
    gateSubtitle: {
        fontSize: 16,
        color: '#94A3B8',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24
    },
    gateTimer: {
        fontSize: 48,
        fontWeight: '200',
        color: '#60A5FA',
        textAlign: 'center',
        marginBottom: 20
    },
    gateHint: {
        fontSize: 13,
        color: '#475569',
        textAlign: 'center',
        marginTop: 40,
        letterSpacing: 0.5
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#A1A1AA',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
        fontWeight: '500',
    },
    optionsList: {
        width: '100%',
        gap: 16,
    },
    optionCard: {
        backgroundColor: 'rgba(124, 58, 237, 0.15)', // Glassy Purple accent
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#7C3AED',
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    cardDesc: {
        fontSize: 15,
        color: '#D4D4D8',
        fontWeight: '500',
    },
    skipBtn: {
        marginTop: 32,
        alignItems: 'center',
        paddingVertical: 12,
    },
    skipText: {
        color: '#71717A',
        fontSize: 15,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    timer: {
        fontSize: 48,
        fontWeight: '900',
        color: '#FFFFFF',
        position: 'absolute',
        alignSelf: 'center',
        letterSpacing: 2,
    },
    animationContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        maxHeight: 300
    },
    circle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: '#10B981', // Neon Green accent
        opacity: 0.2,
        position: 'absolute',
        borderWidth: 2,
        borderColor: '#10B981',
        shadowColor: '#10B981',
        elevation: 10,
    },
    breatheText: {
        fontSize: 36,
        fontWeight: '900',
        color: '#FFFFFF',
        zIndex: 10,
        letterSpacing: -1,
    },
    successTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#10B981',
        textAlign: 'center',
        marginBottom: 40,
        letterSpacing: -1,
    },
    primaryBtn: {
        backgroundColor: '#10B981',
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#10B981',
        elevation: 10,
    },
    btnText: {
        color: '#09090B',
        fontSize: 18,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
    }
});
