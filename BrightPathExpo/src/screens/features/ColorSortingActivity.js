import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/colors';
import { COLOR_LEVELS } from '../../data/levelData';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { speak } from '../../utils/ttsService';
import { completeLevel } from '../../utils/progressService';

const ColorSortingActivity = ({ navigation, route }) => {
  const { user } = useAuth();
  const { activeChild } = useApp();
  const level = Math.min(route.params?.level || 1, 20);
  const activityId = route.params?.activityId || 'colorsort';
  const data = COLOR_LEVELS[level - 1];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [phase, setPhase] = useState('quiz'); // quiz | result
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setCurrentIdx(0);
    setScore(0);
    setAnswers([]);
    setPhase('quiz');
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [level]);

  const current = data.items[currentIdx];

  const handleAnswer = async (color) => {
    const correct = color === current.correct;
    speak(correct ? `Yes! ${current.emoji} is ${color}!` : `Try again! It is ${current.correct}.`);

    const newAnswers = [...answers, { emoji: current.emoji, correct, chosen: color, actual: current.correct }];
    setAnswers(newAnswers);

    if (correct) setScore(s => s + 30);

    Animated.sequence([
      Animated.spring(bounceAnim, { toValue: correct ? -10 : 5, useNativeDriver: true, speed: 50 }),
      Animated.spring(bounceAnim, { toValue: 0, useNativeDriver: true }),
    ]).start();

    setTimeout(async () => {
      if (currentIdx < data.items.length - 1) {
        setCurrentIdx(c => c + 1);
      } else {
        await completeLevel(activityId, level, activeChild?.id || user?.uid);
        setPhase('result');
      }
    }, 900);
  };

  const correctCount = answers.filter(a => a.correct).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#FF6B6B', '#FF9F1C']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.levelTag}>COLOR SORTING · LEVEL {level}</Text>
        <Text style={styles.title}>What color is this?</Text>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>{currentIdx + 1}/{data.items.length}</Text>
          <Text style={styles.scoreText}>⭐ {score}</Text>
        </View>
      </LinearGradient>

      <Animated.ScrollView contentContainerStyle={styles.content} style={{ opacity: fadeAnim }}>
        {phase === 'quiz' && (
          <>
            {/* Current item */}
            <Animated.View style={[styles.itemCard, { transform: [{ translateY: bounceAnim }] }]}>
              <Text style={styles.itemEmoji}>{current.emoji}</Text>
              <Text style={styles.itemQuestion}>What color is this?</Text>
            </Animated.View>

            {/* Dot progress */}
            <View style={styles.dots}>
              {data.items.map((_, i) => (
                <View key={i} style={[styles.dot, i < currentIdx && styles.dotDone, i === currentIdx && styles.dotActive]} />
              ))}
            </View>

            {/* Color choices */}
            <Text style={styles.choiceLabel}>TAP THE CORRECT COLOR</Text>
            <View style={styles.colorGrid}>
              {data.colors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorBtn, { backgroundColor: colorHex(color) }]}
                  onPress={() => handleAnswer(color)}
                >
                  <Text style={styles.colorLabel}>{color}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {phase === 'result' && (
          <View style={styles.resultCard}>
            <Text style={styles.resultEmoji}>🎨</Text>
            <Text style={styles.resultTitle}>Level {level} Complete!</Text>
            <Text style={styles.resultScore}>{correctCount}/{data.items.length} correct · +{score} Stars</Text>

            {/* Answer review */}
            <View style={styles.reviewList}>
              {answers.map((a, i) => (
                <View key={i} style={styles.reviewItem}>
                  <Text style={styles.reviewEmoji}>{a.emoji}</Text>
                  <Text style={styles.reviewColor}>{a.actual}</Text>
                  <Text style={a.correct ? styles.tick : styles.cross}>{a.correct ? '✓' : '✗'}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.nextBtn} onPress={() => {
              if (level < 20) navigation.replace('ColorSortingActivity', { level: level + 1, activityId });
              else navigation.goBack();
            }}>
              <LinearGradient colors={['#FF6B6B', '#FF9F1C']} style={styles.nextGrad}>
                <Text style={styles.nextText}>{level < 20 ? `Level ${level + 1} →` : '🏆 All Done!'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
};

const colorHex = (name) => {
  const map = { Red: '#FF6B6B', Yellow: '#FFD93D', Blue: '#4D96FF', Green: '#6BCB77', Orange: '#FF9F1C', Purple: '#7B2FBE', Pink: '#FF6BB5', White: '#F5F5F5', Brown: '#8B4513', Black: '#333', Gray: '#9E9E9E' };
  return map[name] || '#EEE';
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F5' },
  header: { paddingTop: 55, paddingBottom: 25, paddingHorizontal: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  backText: { fontSize: 18 },
  levelTag: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.85)', letterSpacing: 1.5, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '900', color: '#FFF', marginBottom: 8 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  scoreText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  content: { padding: 20, paddingBottom: 100 },
  itemCard: { backgroundColor: '#FFF', borderRadius: 35, padding: 35, alignItems: 'center', elevation: 6, marginBottom: 20 },
  itemEmoji: { fontSize: 90, marginBottom: 15 },
  itemQuestion: { fontSize: 16, fontWeight: '800', color: COLORS.textMedium },
  dots: { flexDirection: 'row', gap: 6, justifyContent: 'center', marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFD0D0' },
  dotActive: { width: 20, backgroundColor: '#FF6B6B' },
  dotDone: { backgroundColor: '#6BCB77' },
  choiceLabel: { fontSize: 10, fontWeight: '900', color: COLORS.textLight, letterSpacing: 2, textAlign: 'center', marginBottom: 15 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  colorBtn: { paddingHorizontal: 22, paddingVertical: 14, borderRadius: 20, elevation: 3, minWidth: 90, alignItems: 'center' },
  colorLabel: { fontSize: 13, fontWeight: '900', color: '#FFF', textShadowColor: 'rgba(0,0,0,0.2)', textShadowRadius: 4 },
  resultCard: { backgroundColor: '#FFF', borderRadius: 30, padding: 25, elevation: 6, alignItems: 'center' },
  resultEmoji: { fontSize: 60, marginBottom: 10 },
  resultTitle: { fontSize: 22, fontWeight: '900', color: COLORS.textDark, marginBottom: 6 },
  resultScore: { fontSize: 14, fontWeight: '800', color: '#6BCB77', marginBottom: 20 },
  reviewList: { width: '100%', marginBottom: 20 },
  reviewItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#FFF0F0' },
  reviewEmoji: { fontSize: 28, marginRight: 12 },
  reviewColor: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.textDark },
  tick: { fontSize: 18, color: '#6BCB77', fontWeight: '900' },
  cross: { fontSize: 18, color: '#FF6B6B', fontWeight: '900' },
  nextBtn: { width: '100%', borderRadius: 20, overflow: 'hidden' },
  nextGrad: { paddingVertical: 15, alignItems: 'center' },
  nextText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
});

export default ColorSortingActivity;





