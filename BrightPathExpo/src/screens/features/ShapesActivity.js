import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/colors';
import { SHAPES_LEVELS } from '../../data/levelData';
import { speak } from '../../utils/ttsService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { completeLevel } from '../../utils/progressService';

const ShapesActivity = ({ navigation, route }) => {
  const { user } = useAuth();
  const { activeChild } = useApp();
  const level = Math.min(route.params?.level || 1, 20);
  const activityId = route.params?.activityId || 'shapes';
  const data = SHAPES_LEVELS[level - 1];
  const [phase, setPhase] = useState('play'); // play | result
  const [score, setScore] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setPhase('play');
    setScore(0);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    speak(`Can you find the ${data.shape}?`);
  }, [level]);

  const handleChoice = async (idx) => {
    if (idx === data.correct) {
      setScore(s => s + 50);
      speak(`Correct! That is a ${data.shape}. ${data.tip}`);
      await completeLevel(activityId, level, activeChild?.id || user?.uid);
      setPhase('result');
    } else {
      speak("Not quite! Try again.");
    }
  };

  const goNextLevel = () => {
    if (level < 20) {
      navigation.replace('ShapesActivity', { level: level + 1, activityId });
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#FF6B6B', '#EE5253']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.levelTag}>SHAPES · LEVEL {level}</Text>
        <Text style={styles.title}>Shape Finder</Text>
        <Text style={styles.scoreText}>⭐ {score} pts</Text>
      </LinearGradient>

      <Animated.ScrollView contentContainerStyle={styles.content} style={{ opacity: fadeAnim }}>
        {phase === 'play' ? (
          <View style={styles.gameArea}>
            <View style={styles.questionCard}>
              <Text style={styles.questionText}>Find the {data.shape.toUpperCase()}</Text>
              <Text style={styles.mainEmoji}>{data.emoji}</Text>
            </View>

            <View style={styles.choicesGrid}>
              {data.choices.map((choice, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.choiceBtn}
                  onPress={() => handleChoice(idx)}
                >
                  <LinearGradient colors={['#FFF', '#F8F9FA']} style={styles.choiceGrad}>
                    <Text style={styles.choiceText}>{choice}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.resultCard}>
            <Text style={styles.resultEmoji}>✨</Text>
            <Text style={styles.resultTitle}>Well Done!</Text>
            <Text style={styles.tipText}>{data.tip}</Text>
            <Text style={styles.resultScore}>+50 Stars Earned</Text>
            <TouchableOpacity style={styles.nextBtn} onPress={goNextLevel}>
              <LinearGradient colors={['#FF6B6B', '#EE5253']} style={styles.nextGrad}>
                <Text style={styles.nextText}>
                  {level < 20 ? `Level ${level + 1} →` : '🏆 All Done!'}
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
  container: { flex: 1, backgroundColor: '#FFF5F5' },
  header: { paddingTop: 55, paddingBottom: 25, paddingHorizontal: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  backText: { fontSize: 18 },
  levelTag: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.85)', letterSpacing: 1.5, marginBottom: 4 },
  title: { fontSize: 26, fontWeight: '900', color: '#FFF', marginBottom: 6 },
  scoreText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  content: { padding: 20, paddingBottom: 100 },
  gameArea: { flex: 1 },
  questionCard: { backgroundColor: '#FFF', borderRadius: 30, padding: 30, alignItems: 'center', elevation: 4, marginBottom: 25 },
  questionText: { fontSize: 14, fontWeight: '900', color: COLORS.textLight, letterSpacing: 1, marginBottom: 20 },
  mainEmoji: { fontSize: 100 },
  choicesGrid: { gap: 15 },
  choiceBtn: { borderRadius: 20, overflow: 'hidden', elevation: 3 },
  choiceGrad: { paddingVertical: 18, alignItems: 'center' },
  choiceText: { fontSize: 18, fontWeight: '900', color: '#EE5253' },
  resultCard: { backgroundColor: '#FFF', borderRadius: 35, padding: 35, alignItems: 'center', elevation: 6 },
  resultEmoji: { fontSize: 70, marginBottom: 15 },
  resultTitle: { fontSize: 28, fontWeight: '900', color: '#EE5253', marginBottom: 10 },
  tipText: { fontSize: 16, color: COLORS.textMedium, textAlign: 'center', marginBottom: 25, fontWeight: '600', lineHeight: 24 },
  resultScore: { fontSize: 18, fontWeight: '900', color: '#6BCB77', marginBottom: 30 },
  nextBtn: { width: '100%', borderRadius: 20, overflow: 'hidden' },
  nextGrad: { paddingVertical: 18, alignItems: 'center' },
  nextText: { color: '#FFF', fontWeight: '900', fontSize: 18 },
});

export default ShapesActivity;





