import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/colors';
import { EMOTIONS_LEVELS } from '../../data/levelData';
import { speak } from '../../utils/ttsService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { completeLevel } from '../../utils/progressService';

const EmotionsActivity = ({ navigation, route }) => {
  const { user } = useAuth();
  const { activeChild } = useApp();
  const level = Math.min(route.params?.level || 1, 20);
  const activityId = route.params?.activityId || 'emotions';
  const data = EMOTIONS_LEVELS[level - 1];
  const [phase, setPhase] = useState('learn'); // 'learn' | 'scenario' | 'complete'
  const [score, setScore] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setPhase('learn');
    setScore(0);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.spring(pulseAnim, { toValue: 1.08, useNativeDriver: true, speed: 3 }),
        Animated.spring(pulseAnim, { toValue: 1, useNativeDriver: true, speed: 3 }),
      ])
    ).start();
  }, [level]);

  const handleLearn = () => {
    speak(`This is ${data.emotion}. ${data.tip}`);
    setScore(s => s + 20);
    setPhase('scenario');
  };

  const handleGotIt = async () => {
    setScore(s => s + 30);
    await completeLevel(activityId, level, activeChild?.id || user?.uid);
    setPhase('complete');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#FFD93D', '#FF9F1C']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.levelTag}>EMOTIONS · LEVEL {level}</Text>
        <Text style={styles.title}>Feelings Explorer</Text>
        <Text style={styles.scoreText}>⭐ {score} pts</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          {phase === 'learn' && (
            <View style={styles.learnSection}>
              <Animated.Text style={[styles.bigEmoji, { transform: [{ scale: pulseAnim }] }]}>{data.emoji}</Animated.Text>
              <Text style={styles.emotionName}>{data.emotion.toUpperCase()}</Text>
              <Text style={styles.tip}>{data.tip}</Text>
              <TouchableOpacity style={styles.btn} onPress={handleLearn}>
                <LinearGradient colors={['#FFD93D', '#FF9F1C']} style={styles.btnGrad}>
                  <Text style={styles.btnText}>🔊 Hear & Learn!</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'scenario' && (
            <View style={styles.scenarioSection}>
              <Text style={styles.scenarioLabel}>💭 SCENARIO</Text>
              <Text style={styles.scenarioText}>{data.scenario}</Text>
              <Text style={styles.feelingQ}>How would you feel?</Text>
              <View style={styles.emotionRow}>
                {[data.emoji, '😐', '😢'].map((e, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.emojiChoice, i === 0 && styles.emojiChoiceCorrect]}
                    onPress={() => { if (i === 0) { speak('Correct!'); handleGotIt(); } else { speak('Try again!'); } }}
                  >
                    <Text style={styles.choiceEmoji}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.selectHint}>Tap the correct feeling!</Text>
            </View>
          )}

          {phase === 'complete' && (
            <View style={styles.completeSection}>
              <Text style={styles.completeEmoji}>🎉</Text>
              <Text style={styles.completeTitle}>Amazing! You learned</Text>
              <Text style={styles.completEmotion}>{data.emotion} {data.emoji}</Text>
              <Text style={styles.completeTip}>{data.tip}</Text>
              <Text style={styles.completeScore}>+{score} Stars Earned!</Text>
              <TouchableOpacity style={styles.btn} onPress={() => {
                if (level < 20) {
                  navigation.replace('EmotionsActivity', { level: level + 1, activityId });
                } else {
                  navigation.goBack();
                }
              }}>
                <LinearGradient colors={['#6BCB77', '#06D6A0']} style={styles.btnGrad}>
                  <Text style={styles.btnText}>{level < 20 ? `Level ${level + 1} →` : '🏆 All Done!'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDE7' },
  header: { paddingTop: 55, paddingBottom: 25, paddingHorizontal: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  backText: { fontSize: 18 },
  levelTag: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.85)', letterSpacing: 1.5, marginBottom: 4 },
  title: { fontSize: 26, fontWeight: '900', color: '#FFF', marginBottom: 6 },
  scoreText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  content: { padding: 20, paddingBottom: 100 },
  card: { backgroundColor: '#FFF', borderRadius: 35, padding: 30, elevation: 6, alignItems: 'center' },
  learnSection: { alignItems: 'center', width: '100%' },
  bigEmoji: { fontSize: 90, marginBottom: 15 },
  emotionName: { fontSize: 32, fontWeight: '900', color: '#FF9F1C', marginBottom: 15, letterSpacing: 2 },
  tip: { fontSize: 16, color: COLORS.textMedium, textAlign: 'center', lineHeight: 24, fontWeight: '600', marginBottom: 25 },
  btn: { width: '100%', borderRadius: 20, overflow: 'hidden' },
  btnGrad: { paddingVertical: 16, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
  scenarioSection: { alignItems: 'center', width: '100%' },
  scenarioLabel: { fontSize: 10, fontWeight: '900', color: COLORS.textLight, letterSpacing: 2, marginBottom: 15 },
  scenarioText: { fontSize: 18, fontWeight: '800', color: COLORS.textDark, textAlign: 'center', lineHeight: 26, marginBottom: 20 },
  feelingQ: { fontSize: 14, fontWeight: '700', color: COLORS.textMedium, marginBottom: 20 },
  emotionRow: { flexDirection: 'row', gap: 20, marginBottom: 15 },
  emojiChoice: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', elevation: 2 },
  emojiChoiceCorrect: { backgroundColor: '#FFF8E1', borderWidth: 2, borderColor: '#FFD93D' },
  choiceEmoji: { fontSize: 38 },
  selectHint: { fontSize: 11, color: COLORS.textLight, fontWeight: '700' },
  completeSection: { alignItems: 'center', width: '100%' },
  completeEmoji: { fontSize: 70, marginBottom: 10 },
  completeTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textDark, marginBottom: 5 },
  completEmotion: { fontSize: 28, fontWeight: '900', color: '#FF9F1C', marginBottom: 15 },
  completeTip: { fontSize: 14, color: COLORS.textMedium, textAlign: 'center', fontWeight: '600', marginBottom: 15 },
  completeScore: { fontSize: 16, fontWeight: '900', color: '#6BCB77', marginBottom: 20 },
});

export default EmotionsActivity;





