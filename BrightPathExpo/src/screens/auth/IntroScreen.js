// BrightPath - Intro / Data Import Screen
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/colors';

const DATA_LOGS = [
  "INITIALIZING NEURAL NETWORKS...",
  "CONNECTING TO SECURE CLOUD STORAGE...",
  "IMPORTING EDUCATIONAL ASSETS...",
  "CONFIGURING COGNITIVE MODELS...",
  "LOADING EMOTION RECOGNITION DATABASE...",
  "SYNCHRONIZING SPEECH PATTERNS...",
  "ESTABLISHING SECURE PROTOCOLS...",
  "SYSTEMS READY."
];

const IntroScreen = ({ navigation }) => {
  const [logs, setLogs] = useState([]);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef();

  useEffect(() => {
    // Animate Progress Bar
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: false,
    }).start(() => {
      navigation.replace('Welcome');
    });

    // Sequence Logs
    DATA_LOGS.forEach((log, index) => {
      setTimeout(() => {
        setLogs(prev => [...prev, log]);
      }, index * 600);
    });
  }, []);

  const width = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={['#FFFFFF', '#FDFBFF']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.header}>IMPORTING DATA</Text>
          <Text style={styles.subHeader}>Preparing personalized learning environment</Text>

          <View style={styles.progressContainer}>
            <Animated.View style={[styles.progressBar, { width }]} />
          </View>

          <View style={styles.terminal}>
            <ScrollView
              ref={scrollViewRef}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {logs.map((log, i) => (
                <Text key={i} style={styles.logText}>
                  <Text style={styles.logPrefix}>[SYS] </Text>
                  {log}
                </Text>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>V 1.0.4 - SECURE BUILD</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
  },
  content: {
    width: '100%',
  },
  header: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 4,
    marginBottom: 5,
  },
  subHeader: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '600',
    marginBottom: 40,
  },
  progressContainer: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 30,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  terminal: {
    height: 200,
    backgroundColor: '#F8F3FF',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E6DAF5',
  },
  logText: {
    fontFamily: 'monospace',
    color: COLORS.primary,
    fontSize: 12,
    lineHeight: 20,
    fontWeight: '600',
  },
  logPrefix: {
    color: COLORS.textLight,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
  },
  versionText: {
    color: COLORS.textDisabled,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
});

export default IntroScreen;





