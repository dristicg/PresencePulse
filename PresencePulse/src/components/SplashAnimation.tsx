import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashAnimation({ onFinish }: { onFinish: () => void }) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fallAnim = useRef(new Animated.Value(-height * 0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const textScaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Fall and fade-in sequence
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fallAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(textScaleAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        })
      ]),
      // Hold for a moment
      Animated.delay(1800),
      // Fade out
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start(() => {
      onFinish();
    });
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: opacityAnim }]}>
      <View style={styles.textBackground}>
        {['Goal-setting', 'Dedication', 'Workflow', 'Efficiency', 'Concentration', 'Discipline', 'Balance', 'Productivity', 'Time-manager', 'Performance'].map((word, i) => (
          <Text key={i} style={styles.bgWord}>{word}</Text>
        ))}
      </View>

      <Animated.View style={[styles.starContainer, { transform: [{ translateY: fallAnim }, { rotate: spin }] }]}>
        <View style={styles.star}>
            {/* The 4-pointed star shape using nested views */}
            <View style={styles.starPointVert} />
            <View style={styles.starPointHoriz} />
        </View>
      </Animated.View>

      <Animated.View style={[styles.titleContainer, { transform: [{ scale: textScaleAnim }] }]}>
        <Text style={styles.title}>Focus.</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F58266', // Peach from image
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBackground: {
    position: 'absolute',
    left: 20,
    top: 40,
    width: '100%',
    opacity: 0.3,
  },
  bgWord: {
    fontSize: 52,
    fontWeight: '900',
    color: '#8E4032', // Darker reddish brown for contrast
    lineHeight: 65,
    marginBottom: 5,
  },
  starContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  star: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starPointVert: {
    position: 'absolute',
    width: 40,
    height: 160,
    backgroundColor: '#F9D37A', // Yellow from image
    borderRadius: 80,
    transform: [{ scaleX: 3.5 }],
  },
  starPointHoriz: {
    position: 'absolute',
    width: 160,
    height: 40,
    backgroundColor: '#F9D37A',
    borderRadius: 80,
    transform: [{ scaleY: 3.5 }],
  },
  titleContainer: {
    position: 'absolute',
    bottom: height * 0.25,
    left: 30,
  },
  title: {
    fontSize: 72,
    fontWeight: '900',
    color: '#2B2B2B',
    letterSpacing: -2,
  }
});
