import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/colors';
import { SOCIAL_LEVELS } from '../../data/levelData';
import { speak } from '../../utils/ttsService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { completeLevel } from '../../utils/progressService';

const SocialActivity = ({ navigation, route }) => {
  const { user } = useAuth();
  const { activeChild } = useApp();
  const level = Math.min(route.params?.level || 1, 20);
  const activityId = route.params?.activityId || 'social';
  const data = SOCIAL_LEVELS[level - 1];
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState('question'); // 'question' | 'result'
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setSelected(null);
    setScore(0);
    setPhase('question');
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    speak(data.scenario);
  }, [level]);

  const handleChoice = async (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = idx === data.correct;
    if (isCorrect) {
      speak('Correct! Great social skill!');
      setScore(s => s + 50);
      await completeLevel(activityId, level, activeChild?.id || user?.uid);
    } else {
      speak('Think about others feelings. Try again next time!');
    }
    Animated.spring(bounceAnim, { toValue: -10, useNativeDriver: true, speed: 20 }).start(() => {
      Animated.spring(bounceAnim, { toValue: 0, useNativeDriver: true }).start();
    });
    setTimeout(() => setPhase('result'), 1200);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#6BCB77', '#06D6A0']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.levelTag}>SOCIAL SKILLS · LEVEL {level}</Text>
        <Text style={styles.title}>{data.title}</Text>
        <Text style={styles.scoreText}>⭐ {score} pts</Text>
      </LinearGradient>

      <Animated.ScrollView contentContainerStyle={styles.content} style={{ opacity: fadeAnim }}>
        <View style={styles.scenarioCard}>
          <Text style={styles.scenarioIcon}>💭</Text>
          <Text style={styles.scenarioText}>{data.scenario}</Text>
        </View>

        <Text style={styles.choiceLabel}>WHAT WOULD YOU DO?</Text>

        {data.choices.map((choice, idx) => {
          const isCorrect = idx === data.correct;
          const isSelected = selected === idx;
          let bg = '#FFF';
          if (selected !== null) {
            if (isCorrect) bg = '#E8F5E9';
            else if (isSelected && !isCorrect) bg = '#FFEBEE';
          }
          return (
            <Animated.View key={idx} style={[styles.choiceBtn, { backgroundColor: bg, transform: isSelected ? [{ translateY: bounceAnim }] : [] }]}>
              <TouchableOpacity onPress={() => handleChoice(idx)} style={styles.choiceInner}>
                <View style={[styles.choiceNum, selected !== null && isCorrect && styles.numCorrect, selected !== null && isSelected && !isCorrect && styles.numWrong]}>
                  <Text style={styles.numText}>{String.fromCharCode(65 + idx)}</Text>
                </View>
                <Text style={styles.choiceText}>{choice}</Text>
                {selected !== null && isCorrect && <Text style={styles.tick}>✓</Text>}
                {selected !== null && isSelected && !isCorrect && <Text style={styles.cross}>✗</Text>}
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {phase === 'result' && (
          <View style={styles.resultCard}>
            <Text style={styles.resultEmoji}>{selected === data.correct ? '🎉' : '💪'}</Text>
            <Text style={styles.resultTitle}>{selected === data.correct ? 'Well done!' : 'Keep learning!'}</Text>
            <Text style={styles.tipText}>💡 {data.tip}</Text>
            {selected === data.correct && <Text style={styles.pointsEarned}>+50 Stars!</Text>}
            <TouchableOpacity style={styles.nextBtn} onPress={() => {
              if (level < 20) {
                navigation.replace('SocialActivity', { level: level + 1, activityId });
              } else {
                navigation.goBack();
              }
            }}>
              <LinearGradient colors={['#6BCB77', '#06D6A0']} style={styles.nextGrad}>
                <Text style={styles.nextText}>{level < 20 ? `Level ${level + 1} →` : '🏆 All Done!'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 80 }} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FFF4' },
  header: { paddingTop: 55, paddingBottom: 25, paddingHorizontal: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  backText: { fontSize: 18 },
  levelTag: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.85)', letterSpacing: 1.5, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '900', color: '#FFF', marginBottom: 6 },
  scoreText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  content: { padding: 20 },
  scenarioCard: { backgroundColor: '#FFF', borderRadius: 25, padding: 25, marginBottom: 20, elevation: 4, alignItems: 'center' },
  scenarioIcon: { fontSize: 40, marginBottom: 12 },
  scenarioText: { fontSize: 18, fontWeight: '800', color: COLORS.textDark, textAlign: 'center', lineHeight: 26 },
  choiceLabel: { fontSize: 10, fontWeight: '900', color: COLORS.textLight, letterSpacing: 2, textAlign: 'center', marginBottom: 15 },
  choiceBtn: { borderRadius: 20, marginBottom: 12, elevation: 3, borderWidth: 1, borderColor: '#E8F5E9' },
  choiceInner: { flexDirection: 'row', alignItems: 'center', padding: 18 },
  choiceNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  numCorrect: { backgroundColor: '#6BCB77' },
  numWrong: { backgroundColor: '#FF6B6B' },
  numText: { fontWeight: '900', color: '#FFF', fontSize: 14 },
  choiceText: { flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.textDark },
  tick: { fontSize: 18, color: '#6BCB77', fontWeight: '900' },
  cross: { fontSize: 18, color: '#FF6B6B', fontWeight: '900' },
  resultCard: { backgroundColor: '#FFF', borderRadius: 25, padding: 25, marginTop: 10, elevation: 4, alignItems: 'center' },
  resultEmoji: { fontSize: 60, marginBottom: 10 },
  resultTitle: { fontSize: 22, fontWeight: '900', color: COLORS.textDark, marginBottom: 10 },
  tipText: { fontSize: 14, color: COLORS.textMedium, textAlign: 'center', fontWeight: '700', lineHeight: 22, marginBottom: 15 },
  pointsEarned: { fontSize: 18, fontWeight: '900', color: '#6BCB77', marginBottom: 20 },
  nextBtn: { width: '100%', borderRadius: 20, overflow: 'hidden' },
  nextGrad: { paddingVertical: 15, alignItems: 'center' },
  nextText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
});

export default SocialActivity;





