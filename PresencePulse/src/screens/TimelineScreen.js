import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSessionsForDate } from '../database/databaseService';

const TOTAL_HEIGHT = 1440;

const APP_DISPLAY_NAMES = {
    'com.instagram.android': 'Instagram',
    'com.whatsapp': 'WhatsApp',
    'com.google.android.youtube': 'YouTube',
    'com.facebook.katana': 'Facebook',
    'com.reddit.frontpage': 'Reddit',
    'com.snapchat.android': 'Snapchat',
    'com.linkedin.android': 'LinkedIn'
};

const mapAppName = (packageName) => {
    if (APP_DISPLAY_NAMES[packageName]) return APP_DISPLAY_NAMES[packageName];
    if (!packageName) return 'Unknown App';
    const parts = packageName.split('.');
    return parts[parts.length - 1] || packageName;
};

// Convert timestamp to vertical pixel position
const timeToY = (timestamp) => {
    const d = new Date(timestamp);
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const seconds = d.getSeconds();
    return ((hours * 3600 + minutes * 60 + seconds) / 86400) * TOTAL_HEIGHT;
};

// Convert Duration to Height
const durationToHeight = (durationSeconds) => {
    const durationMs = durationSeconds * 1000;
    const millisecondsPerDay = 86400000;
    const h = (durationMs / millisecondsPerDay) * TOTAL_HEIGHT;
    return Math.max(4, h);
};

export default function TimelineScreen({ onBack }) {
    const insets = useSafeAreaInsets();
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [currentTimeY, setCurrentTimeY] = useState(0);
    const scrollViewRef = useRef(null);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        getSessionsForDate(today).then(data => {
            setSessions(data);
        });

        const updateCurrentTime = () => {
            const now = new Date();
            const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
            setCurrentTimeY((currentSeconds / 86400) * TOTAL_HEIGHT);
        };

        updateCurrentTime();
        const interval = setInterval(updateCurrentTime, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (currentTimeY > 0 && scrollViewRef.current) {
            // Scroll to current hour minus some padding
            const scrollOffset = Math.max(0, currentTimeY - 150);
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({ y: scrollOffset, animated: true });
            }, 500);
        }
    }, [currentTimeY]);

    const hours = Array.from({ length: 24 }).map((_, i) => i);

    return (
        <View style={styles.container}>
            {/* Title section & Legend */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
                <Text style={styles.title}>Attention Timeline</Text>
                <Text style={styles.subtitle}>Your presence map for today</Text>

                <View style={styles.legend}>
                    <View style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                        <Text style={styles.legendText}>Normal session</Text>
                    </View>
                    <View style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                        <Text style={styles.legendText}>Micro-check</Text>
                    </View>
                    <View style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: '#F43F5E' }]} />
                        <Text style={styles.legendText}>Phubbing</Text>
                    </View>
                    <View style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: '#E11D48' }]} />
                        <Text style={styles.legendText}>Burst</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>Back to Home</Text>
                </TouchableOpacity>
            </View>

            <ScrollView ref={scrollViewRef} style={styles.scrollContainer} contentContainerStyle={styles.timelineContent}>
                {/* Draw Hour Grid */}
                {hours.map(hour => {
                    const ampm = hour >= 12 ? 'PM' : 'AM';
                    const h = hour % 12 === 0 ? 12 : hour % 12;
                    return (
                        <View key={`hour-${hour}`} style={[styles.hourLineContainer, { top: (hour / 24) * TOTAL_HEIGHT }]}>
                            <Text style={styles.hourText}>{`${h}${ampm}`}</Text>
                            <View style={styles.gridLine} />
                        </View>
                    );
                })}

                {/* Render Session Bars */}
                {sessions.map((session, index) => {
                    let barColor = '#10B981'; // Normal
                    if (session.session_type === 'micro-check') {
                        if (session.is_social_context) {
                            barColor = '#F43F5E'; // Phubbing
                        } else {
                            barColor = '#F59E0B'; // Micro-check
                        }
                    }
                    if (session.isPhubbing && session.session_type !== 'micro-check') {
                        // Dark Red burst or extended phubbing 
                        barColor = '#E11D48';
                    }

                    const yPos = timeToY(session.start_time);
                    const barHeight = durationToHeight(session.duration);

                    return (
                        <TouchableOpacity
                            key={`session-${session.id || index}`}
                            style={[styles.sessionBar, { top: yPos, height: barHeight, backgroundColor: barColor }]}
                            onPress={() => setSelectedSession(session)}
                        />
                    );
                })}

                {/* Current Time Indicator */}
                <View style={[styles.currentTimeIndicator, { top: currentTimeY }]} />
                <View style={[styles.currentTimeGlow, { top: currentTimeY }]} />
            </ScrollView>

            {/* Detail Modal */}
            <Modal visible={!!selectedSession} animationType="fade" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedSession && (
                            <>
                                <Text style={styles.modalTitle}>{mapAppName(selectedSession.package_name)}</Text>

                                <Text style={styles.modalText}>
                                    Type: {selectedSession.session_type === 'micro-check' ? '⚡ Micro-check' : '📱 Normal session'}
                                </Text>
                                <Text style={styles.modalText}>
                                    Duration: {selectedSession.duration}s
                                </Text>
                                <Text style={styles.modalText}>
                                    Context: {selectedSession.is_social_context ? '👥 Others nearby (phubbing risk)' : '👤 Alone'}
                                </Text>
                                <Text style={styles.modalText}>
                                    Time: {new Date(selectedSession.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>

                                <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedSession(null)}>
                                    <Text style={styles.closeButtonText}>Close</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#09090B',
    },
    header: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        backgroundColor: 'rgba(24,24,27,0.8)',
        borderBottomWidth: 1,
        borderBottomColor: '#27272A',
    },
    title: {
        fontSize: 32,
        color: '#FFFFFF',
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        color: '#A1A1AA',
        marginTop: 6,
        fontWeight: '500',
    },
    legend: {
        marginTop: 20,
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    legendDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        marginRight: 10,
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 3,
    },
    legendText: {
        color: '#D4D4D8',
        fontSize: 14,
        fontWeight: '600',
    },
    backButton: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: '#27272A',
        borderRadius: 12,
        alignSelf: 'flex-start'
    },
    backButtonText: {
        color: '#F4F4F5',
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    scrollContainer: {
        flex: 1,
    },
    timelineContent: {
        height: TOTAL_HEIGHT,
        position: 'relative',
        backgroundColor: '#09090B',
    },
    hourLineContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
    },
    hourText: {
        width: 50,
        color: '#A1A1AA',
        fontSize: 12,
        textAlign: 'right',
        paddingRight: 10,
        fontWeight: '700',
    },
    gridLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#27272A',
    },
    sessionBar: {
        position: 'absolute',
        left: 70,
        right: 20,
        borderRadius: 8,
        minHeight: 6,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.2)',
        opacity: 0.9,
    },
    currentTimeIndicator: {
        position: 'absolute',
        left: 50,
        right: 0,
        height: 2,
        backgroundColor: '#06B6D4',
        shadowColor: '#06B6D4',
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 5,
    },
    currentTimeGlow: {
        position: 'absolute',
        left: 50,
        right: 0,
        height: 10,
        backgroundColor: 'rgba(6, 182, 212, 0.2)',
        marginTop: -4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        backgroundColor: '#18181B',
        padding: 30,
        borderRadius: 24,
        width: '85%',
        borderWidth: 1,
        borderColor: '#27272A',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    modalText: {
        fontSize: 16,
        color: '#D4D4D8',
        marginBottom: 12,
        lineHeight: 24,
        fontWeight: '500',
    },
    closeButton: {
        marginTop: 24,
        backgroundColor: '#7C3AED',
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#7C3AED',
        elevation: 8,
    },
    closeButtonText: {
        color: 'white',
        fontWeight: '900',
        fontSize: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    }
});
