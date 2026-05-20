import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/colors';
import { PATTERN_LEVELS } from '../../data/levelData';
import { speak } from '../../utils/ttsService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { completeLevel } from '../../utils/progressService';

const { width } = Dimensions.get('window');

const PatternActivity = ({ navigation, route }) => {
  const { user } = useAuth();
  const { activeChild } = useApp();
  const level = Math.min(route.params?.level || 1, 20);
  const activityId = route.params?.activityId || 'patterns';
  const data = PATTERN_LEVELS[level - 1];

  const [selected, setSelected] = useState(null);
  const [phase, setPhase] = useState('question'); // question | result
  const [score, setScore] = useState(0);
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setSelected(null);
    setPhase('question');
    setScore(0);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [level]);

  const handleChoice = async (choice) => {
    if (selected) return;
    setSelected(choice);
    const correct = choice === data.answer;
    if (correct) {
      speak('Correct! Great pattern recognition!');
      setScore(s => s + 40);
      await completeLevel(activityId, level, activeChild?.id || user?.uid);
    } else {
      speak('Not quite! Look at the pattern again.');
    }
    Animated.sequence([
      Animated.spring(bounceAnim, { toValue: -12, useNativeDriver: true, speed: 30 }),
      Animated.spring(bounceAnim, { toValue: 0, useNativeDriver: true }),
    ]).start(() => setPhase('result'));
  };

  const goNext = () => {
    if (level < 20) navigation.replace('PatternActivity', { level: level + 1, activityId });
    else navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#FF9F1C', '#FFD93D']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.levelTag}>PATTERNS · LEVEL {level}</Text>
        <Text style={styles.title}>What comes next?</Text>
        <Text style={styles.scoreText}>⭐ {score}</Text>
      </LinearGradient>

      <Animated.ScrollView contentContainerStyle={styles.content} style={{ opacity: fadeAnim }}>
        {/* Sequence display */}
        <View style={styles.sequenceCard}>
          <Text style={styles.seqLabel}>SPOT THE PATTERN</Text>
          <View style={styles.seqRow}>
            {data.sequence.map((item, i) => (
              <View key={i} style={styles.seqItem}>
                <Text style={styles.seqEmoji}>{item}</Text>
              </View>
            ))}
            <View style={[styles.seqItem, styles.seqQuestion]}>
              <Text style={styles.questionMark}>?</Text>
            </View>
          </View>
        </View>

        {/* Choices */}
        <Text style={styles.choiceLabel}>CHOOSE THE ANSWER</Text>
        <View style={styles.choiceRow}>
          {data.choices.map((choice, i) => {
            const isSelected = selected === choice;
            const isCorrect = choice === data.answer;
            let bg = '#FFF';
            if (selected) {
              if (isCorrect) bg = '#E8F5E9';
              else if (isSelected) bg = '#FFEBEE';
            }
            return (
              <Animated.View key={i} style={[styles.choiceBtn, { backgroundColor: bg }, isSelected && { transform: [{ translateY: bounceAnim }] }]}>
                <TouchableOpacity onPress={() => handleChoice(choice)} style={styles.choiceInner}>
                  <Text style={styles.choiceEmoji}>{choice}</Text>
                  {selected && isCorrect && <Text style={styles.tick}>✓</Text>}
                  {selected && isSelected && !isCorrect && <Text style={styles.cross}>✗</Text>}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {phase === 'result' && (
          <View style={styles.resultCard}>
            <Text style={styles.resultEmoji}>{selected === data.answer ? '🎉' : '💪'}</Text>
            <Text style={styles.resultTitle}>
              {selected === data.answer ? `Correct! +${score} pts` : `The answer was ${data.answer}`}
            </Text>
            <TouchableOpacity style={styles.nextBtn} onPress={goNext}>
              <LinearGradient colors={['#FF9F1C', '#FFD93D']} style={styles.nextGrad}>
                <Text style={styles.nextText}>{level < 20 ? `Level ${level + 1} →` : '🏆 All Done!'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </Animated.ScrollView>
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
  sequenceCard: { backgroundColor: '#FFF', borderRadius: 30, padding: 25, marginBottom: 25, elevation: 5, alignItems: 'center' },
  seqLabel: { fontSize: 10, fontWeight: '900', color: '#FF9F1C', letterSpacing: 2, marginBottom: 20 },
  seqRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  seqItem: { width: 56, height: 56, borderRadius: 18, backgroundColor: '#FFF8E1', alignItems: 'center', justifyContent: 'center', elevation: 2 },
  seqQuestion: { backgroundColor: '#FF9F1C', borderWidth: 0 },
  seqEmoji: { fontSize: 28 },
  questionMark: { fontSize: 28, fontWeight: '900', color: '#FFF' },
  choiceLabel: { fontSize: 10, fontWeight: '900', color: COLORS.textLight, letterSpacing: 2, textAlign: 'center', marginBottom: 20 },
  choiceRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 25 },
  choiceBtn: { borderRadius: 25, elevation: 4, borderWidth: 1, borderColor: '#FFF8E1' },
  choiceInner: { width: 90, height: 90, alignItems: 'center', justifyContent: 'center' },
  choiceEmoji: { fontSize: 40 },
  tick: { fontSize: 16, color: '#6BCB77', fontWeight: '900', marginTop: 4 },
  cross: { fontSize: 16, color: '#FF6B6B', fontWeight: '900', marginTop: 4 },
  resultCard: { backgroundColor: '#FFF', borderRadius: 30, padding: 25, alignItems: 'center', elevation: 5 },
  resultEmoji: { fontSize: 55, marginBottom: 10 },
  resultTitle: { fontSize: 18, fontWeight: '900', color: COLORS.textDark, marginBottom: 20, textAlign: 'center' },
  nextBtn: { width: '100%', borderRadius: 20, overflow: 'hidden' },
  nextGrad: { paddingVertical: 15, alignItems: 'center' },
  nextText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
});

export default PatternActivity;





