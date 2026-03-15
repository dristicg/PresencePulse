import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Keyboard } from 'react-native';

const MorningCheckIn = ({ microChecks, score, onComplete, initialResponse }) => {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState(initialResponse || '');
    const [isDone, setIsDone] = useState(!!initialResponse);

    const handleSend = async () => {
        if (!input.trim()) return;
        
        setLoading(true);
        Keyboard.dismiss();
        
        try {
            // We import this dynamically to avoid circular dependencies if any
            const { sendCheckInMessage } = require('../services/aiInsightService');
            
            const response = await sendCheckInMessage(input, {
                microChecks,
                score
            });
            
            setAiResponse(response);
            setIsDone(true);
            
            if (onComplete) {
                onComplete(response);
            }
        } catch (error) {
            console.error('[MorningCheckIn] Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Morning Check-in</Text>
            <Text style={styles.question}>How are you feeling about your focus today?</Text>
            
            {!isDone ? (
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type your reflection..."
                        placeholderTextColor="#71717A"
                        value={input}
                        onChangeText={setInput}
                        multiline
                    />
                    <TouchableOpacity 
                        style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]} 
                        onPress={handleSend}
                        disabled={loading || !input.trim()}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" size="small" />
                        ) : (
                            <Text style={styles.sendButtonText}>Send</Text>
                        )}
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.responseContainer}>
                    <View style={styles.userBubble}>
                        <Text style={styles.userText}>{input || "My reflection"}</Text>
                    </View>
                    <View style={styles.aiBubble}>
                        <Text style={styles.aiText}>{aiResponse}</Text>
                    </View>
                    <Text style={styles.footer}>Checking in helps build consciousness. See you tomorrow!</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#18181B',
        borderRadius: 30,
        padding: 24,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#7C3AED', // Highlighted with primary purple
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    label: {
        color: '#A78BFA',
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 12,
    },
    question: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '900',
        marginBottom: 20,
        lineHeight: 28,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 12,
    },
    input: {
        flex: 1,
        backgroundColor: '#27272A',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: '#FFFFFF',
        fontSize: 15,
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: '#7C3AED',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#3F3F46',
    },
    sendButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
    responseContainer: {
        marginTop: 8,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#3F3F46',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 16,
        borderBottomRightRadius: 4,
        marginBottom: 16,
        maxWidth: '85%',
    },
    userText: {
        color: '#E4E4E7',
        fontSize: 14,
        fontWeight: '500',
    },
    aiBubble: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(124, 58, 237, 0.15)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(124, 58, 237, 0.3)',
        marginBottom: 20,
        maxWidth: '90%',
    },
    aiText: {
        color: '#FFF',
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '600',
    },
    footer: {
        color: '#71717A',
        fontSize: 12,
        textAlign: 'center',
        fontStyle: 'italic',
    }
});

export default MorningCheckIn;
