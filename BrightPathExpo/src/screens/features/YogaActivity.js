import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/colors';
import { YOGA_LEVELS } from '../../data/levelData';
import { speak } from '../../utils/ttsService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { completeLevel } from '../../utils/progressService';

const YogaActivity = ({ navigation, route }) => {
  const { user } = useAuth();
  const { activeChild } = useApp();
  const level = Math.min(route.params?.level || 1, 20);
  const activityId = route.params?.activityId || 'yoga';
  const data = YOGA_LEVELS[level - 1];

  const [phase, setPhase] = useState('pose'); // pose | done
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setPhase('pose');
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    speak(`Let us do the ${data.pose}. ${data.instructions}`);
    
    // Breathing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.1, duration: 2000, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, [level]);

  const handleDone = async () => {
    await completeLevel(activityId, level, activeChild?.id || user?.uid);
    setPhase('done');
    speak("Wonderful! You are so calm and strong.");
  };

  const goNextLevel = () => {
    if (level < 20) {
      navigation.replace('YogaActivity', { level: level + 1, activityId });
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#9C27B0', '#7B1FA2']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.levelTag}>YOGA · LEVEL {level}</Text>
        <Text style={styles.title}>Calm & Strong</Text>
      </LinearGradient>

      <Animated.ScrollView contentContainerStyle={styles.content} style={{ opacity: fadeAnim }}>
        {phase === 'pose' ? (
          <View style={styles.card}>
            <Animated.Text style={[styles.poseEmoji, { transform: [{ scale: scaleAnim }] }]}>
              {data.emoji}
            </Animated.Text>
            <Text style={styles.poseName}>{data.pose}</Text>
            <Text style={styles.instructions}>{data.instructions}</Text>
            
            <View style={styles.breathIndicator}>
              <Text style={styles.breathText}>Breathe in... Breathe out...</Text>
            </View>

            <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
              <LinearGradient colors={['#9C27B0', '#7B1FA2']} style={styles.doneGrad}>
                <Text style={styles.doneText}>I Did It! ✓</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.resultCard}>
            <Text style={styles.resultEmoji}>🧘</Text>
            <Text style={styles.resultTitle}>Namaste</Text>
            <Text style={styles.tip}>{data.tip}</Text>
            <Text style={styles.resultScore}>+50 Stars Earned</Text>
            
            <TouchableOpacity style={styles.nextLevelBtn} onPress={goNextLevel}>
              <LinearGradient colors={['#9C27B0', '#7B1FA2']} style={styles.nextLevelGrad}>
                <Text style={styles.nextLevelText}>
                  {level < 20 ? `Next Pose →` : '🏆 All Done!'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3E5F5' },
  header: { paddingTop: 55, paddingBottom: 25, paddingHorizontal: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  backText: { fontSize: 18 },
  levelTag: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.8)', letterSpacing: 1.5, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '900', color: '#FFF', marginBottom: 6 },
  content: { padding: 20, paddingBottom: 100 },
  card: { backgroundColor: '#FFF', borderRadius: 30, padding: 30, alignItems: 'center', elevation: 5 },
  poseEmoji: { fontSize: 100, marginBottom: 20 },
  poseName: { fontSize: 32, fontWeight: '900', color: '#7B1FA2', marginBottom: 10 },
  instructions: { fontSize: 18, color: COLORS.textMedium, textAlign: 'center', marginBottom: 30, fontWeight: '700' },
  breathIndicator: { backgroundColor: '#F3E5F5', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, marginBottom: 30 },
  breathText: { color: '#7B1FA2', fontWeight: '800', fontStyle: 'italic' },
  doneBtn: { width: '100%', borderRadius: 20, overflow: 'hidden' },
  doneGrad: { paddingVertical: 18, alignItems: 'center' },
  doneText: { color: '#FFF', fontWeight: '900', fontSize: 18 },
  resultCard: { backgroundColor: '#FFF', borderRadius: 30, padding: 30, alignItems: 'center', elevation: 5 },
  resultEmoji: { fontSize: 60, marginBottom: 10 },
  resultTitle: { fontSize: 24, fontWeight: '900', color: '#7B1FA2', marginBottom: 10 },
  tip: { fontSize: 15, color: COLORS.textMedium, textAlign: 'center', marginBottom: 20, fontWeight: '600' },
  resultScore: { fontSize: 16, fontWeight: '800', color: '#6BCB77', marginBottom: 20 },
  nextLevelBtn: { width: '100%', borderRadius: 20, overflow: 'hidden' },
  nextLevelGrad: { paddingVertical: 16, alignItems: 'center' },
  nextLevelText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
});

export default YogaActivity;





