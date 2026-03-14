import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { markNudgeDismissed, markNudgeEngaged, saveReflection } from '../database/databaseService';

const REFLECTION_OPTIONS = [
    { id: 'boredom', emoji: '🥱', title: 'Boredom', desc: 'Just looking for something to do' },
    { id: 'anxiety', emoji: '😰', title: 'Anxiety', desc: 'Feeling stressed or avoiding something' },
    { id: 'habit', emoji: '🔄', title: 'Pure habit', desc: 'Opened phone without thinking' },
    { id: 'notification', emoji: '🔔', title: 'Notification', desc: 'Checking a specific alert' },
    { id: 'curiosity', emoji: '🤔', title: 'Curiosity', desc: 'Wondering if someone replied' },
];

export default function ReflectionModal({ visible, onClose }) {
    const [thankYouMode, setThankYouMode] = useState(false);

    const handleSelect = async (triggerType) => {
        await saveReflection(triggerType, null); // session_id null for now
        await markNudgeEngaged();

        setThankYouMode(true);
        setTimeout(() => {
            setThankYouMode(false);
            onClose();
        }, 1500);
    };

    const handleDismiss = async () => {
        await markNudgeDismissed();
        onClose();
    };

    return (
        <Modal visible={visible} animationType="fade" transparent={true}>
            <View style={styles.overlay}>
                <View style={styles.content}>

                    {thankYouMode ? (
                        <View style={styles.thankYouContainer}>
                            <Text style={styles.thankYouIcon}>🌱</Text>
                            <Text style={styles.thankYouText}>Thanks for reflecting.</Text>
                        </View>
                    ) : (
                        <>
                            <Text style={styles.title}>Why did you check your phone just now?</Text>
                            <Text style={styles.subtitle}>Taking a second to notice builds mindful habits.</Text>

                            {REFLECTION_OPTIONS.map((opt) => (
                                <TouchableOpacity
                                    key={opt.id}
                                    style={styles.optionBtn}
                                    onPress={() => handleSelect(opt.title)}
                                >
                                    <Text style={styles.emoji}>{opt.emoji}</Text>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.optTitle}>{opt.title}</Text>
                                        <Text style={styles.optDesc}>{opt.desc}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}

                            <TouchableOpacity style={styles.dismissBtn} onPress={handleDismiss}>
                                <Text style={styles.dismissText}>Not now</Text>
                            </TouchableOpacity>
                        </>
                    )}

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    content: {
        backgroundColor: '#13131A',
        borderRadius: 24,
        padding: 32,
        width: '100%',
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#27272A',
    },
    title: {
        fontSize: 26,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 8,
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        color: '#A1A1AA',
        marginBottom: 24,
        textAlign: 'center',
        fontWeight: '500',
    },
    optionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(24, 24, 27, 0.7)',
        padding: 18,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#27272A',
    },
    emoji: {
        fontSize: 32,
        marginRight: 16
    },
    textContainer: {
        flex: 1
    },
    optTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    optDesc: {
        fontSize: 13,
        color: '#A1A1AA',
        marginTop: 4,
        fontWeight: '500',
    },
    dismissBtn: {
        marginTop: 16,
        padding: 14,
        alignItems: 'center'
    },
    dismissText: {
        color: '#71717A',
        fontSize: 15,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    thankYouContainer: {
        alignItems: 'center',
        paddingVertical: 32
    },
    thankYouIcon: {
        fontSize: 56,
        marginBottom: 16
    },
    thankYouText: {
        fontSize: 24,
        fontWeight: '900',
        color: '#10B981',
        letterSpacing: -0.5,
    }
});
