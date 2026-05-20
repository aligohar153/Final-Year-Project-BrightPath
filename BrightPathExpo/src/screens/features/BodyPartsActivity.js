import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/colors';
import { BODY_PARTS_LEVELS } from '../../data/levelData';
import { speak } from '../../utils/ttsService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { completeLevel } from '../../utils/progressService';

const BodyPartsActivity = ({ navigation, route }) => {
  const { user } = useAuth();
  const { activeChild } = useApp();
  const level = Math.min(route.params?.level || 1, 20);
  const activityId = route.params?.activityId || 'body';
  const data = BODY_PARTS_LEVELS[level - 1];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState('learn'); // learn | result
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setCurrentIdx(0);
    setScore(0);
    setPhase('learn');
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    speakPart(data.parts[0]);
  }, [level]);

  const speakPart = (part) => {
    speak(part.name + ". " + part.tip);
    Animated.sequence([
      Animated.spring(bounceAnim, { toValue: 1.2, useNativeDriver: true, speed: 50 }),
      Animated.spring(bounceAnim, { toValue: 1, useNativeDriver: true, speed: 30 }),
    ]).start();
  };

  const handleNext = async () => {
    if (currentIdx < data.parts.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      speakPart(data.parts[nextIdx]);
    } else {
      setScore(s => s + 50);
      await completeLevel(activityId, level, activeChild?.id || user?.uid);
      setPhase('result');
    }
  };

  const goNextLevel = () => {
    if (level < 20) {
      navigation.replace('BodyPartsActivity', { level: level + 1, activityId });
    } else {
      navigation.goBack();
    }
  };

  const current = data.parts[currentIdx];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#F72585', '#7209B7']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.levelTag}>BODY PARTS · LEVEL {level}</Text>
        <Text style={styles.title}>Learn Your Body!</Text>
        <Text style={styles.scoreText}>⭐ {score} pts</Text>
      </LinearGradient>

      <Animated.ScrollView contentContainerStyle={styles.content} style={{ opacity: fadeAnim }}>
        {phase === 'learn' ? (
          <View style={styles.card}>
            <Animated.Text style={[styles.bigEmoji, { transform: [{ scale: bounceAnim }] }]}>
              {current.emoji}
            </Animated.Text>
            <Text style={styles.partName}>{current.name}</Text>
            <Text style={styles.tipText}>{current.tip}</Text>
            
            <TouchableOpacity style={styles.speakBtn} onPress={() => speakPart(current)}>
              <Text style={styles.speakText}>🔊 Listen Again</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
              <LinearGradient colors={['#F72585', '#7209B7']} style={styles.nextGrad}>
                <Text style={styles.nextText}>
                  {currentIdx < data.parts.length - 1 ? 'Next Part →' : 'Finish Learning ✓'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.resultCard}>
            <Text style={styles.resultEmoji}>🎉</Text>
            <Text style={styles.resultTitle}>Body Master!</Text>
            <Text style={styles.resultScore}>+50 Stars Earned</Text>
            <TouchableOpacity style={styles.nextLevelBtn} onPress={goNextLevel}>
              <LinearGradient colors={['#F72585', '#7209B7']} style={styles.nextLevelGrad}>
                <Text style={styles.nextLevelText}>
                  {level < 20 ? `Level ${level + 1} →` : '🏆 All Done!'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.dots}>
          {data.parts.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentIdx && styles.dotActive]} />
          ))}
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF0F5' },
  header: { paddingTop: 55, paddingBottom: 25, paddingHorizontal: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  backText: { fontSize: 18 },
  levelTag: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.8)', letterSpacing: 1.5, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '900', color: '#FFF', marginBottom: 6 },
  scoreText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  content: { padding: 20, paddingBottom: 100 },
  card: { backgroundColor: '#FFF', borderRadius: 30, padding: 30, alignItems: 'center', elevation: 5 },
  bigEmoji: { fontSize: 100, marginBottom: 20 },
  partName: { fontSize: 32, fontWeight: '900', color: '#7209B7', marginBottom: 10 },
  tipText: { fontSize: 16, color: COLORS.textMedium, textAlign: 'center', marginBottom: 30, fontWeight: '600' },
  speakBtn: { backgroundColor: '#F0E6FF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 15, marginBottom: 20 },
  speakText: { color: '#7209B7', fontWeight: '800' },
  nextBtn: { width: '100%', borderRadius: 20, overflow: 'hidden' },
  nextGrad: { paddingVertical: 16, alignItems: 'center' },
  nextText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
  resultCard: { backgroundColor: '#FFF', borderRadius: 30, padding: 30, alignItems: 'center', elevation: 5 },
  resultEmoji: { fontSize: 60, marginBottom: 10 },
  resultTitle: { fontSize: 24, fontWeight: '900', color: '#F72585', marginBottom: 6 },
  resultScore: { fontSize: 16, fontWeight: '800', color: '#6BCB77', marginBottom: 20 },
  nextLevelBtn: { width: '100%', borderRadius: 20, overflow: 'hidden' },
  nextLevelGrad: { paddingVertical: 16, alignItems: 'center' },
  nextLevelText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
  dots: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFD1E8' },
  dotActive: { width: 20, backgroundColor: '#F72585' },
});

export default BodyPartsActivity;





