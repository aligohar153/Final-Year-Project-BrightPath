import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/colors';
import { SPACE_LEVELS } from '../../data/levelData';
import { speak } from '../../utils/ttsService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { completeLevel } from '../../utils/progressService';

const SpaceActivity = ({ navigation, route }) => {
  const { user } = useAuth();
  const { activeChild } = useApp();
  const level = Math.min(route.params?.level || 1, 20);
  const activityId = route.params?.activityId || 'space';
  const data = SPACE_LEVELS[level - 1];

  const [selected, setSelected] = useState(null);
  const [phase, setPhase] = useState('quiz'); // quiz | result
  const [score, setScore] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setSelected(null);
    setPhase('quiz');
    setScore(0);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    speak(data.question);
  }, [level]);

  const handleChoice = async (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    
    if (idx === data.correct) {
      setScore(s => s + 50);
      speak("Correct! " + data.tip);
      await completeLevel(activityId, level, activeChild?.id || user?.uid);
      setPhase('result');
    } else {
      speak("Try again!");
      setTimeout(() => setSelected(null), 1500);
    }
  };

  const goNextLevel = () => {
    if (level < 20) {
      navigation.replace('SpaceActivity', { level: level + 1, activityId });
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#1A0533', '#4B0082']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.levelTag}>SPACE · LEVEL {level}</Text>
        <Text style={styles.title}>Explore the Stars!</Text>
        <Text style={styles.scoreText}>⭐ {score} pts</Text>
      </LinearGradient>

      <Animated.ScrollView contentContainerStyle={styles.content} style={{ opacity: fadeAnim }}>
        {phase === 'quiz' ? (
          <View style={styles.quizCard}>
            <Text style={styles.questionText}>{data.question}</Text>
            
            <View style={styles.choices}>
              {data.choices.map((choice, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.choiceBtn,
                    selected === i && i === data.correct && styles.choiceCorrect,
                    selected === i && i !== data.correct && styles.choiceWrong
                  ]}
                  onPress={() => handleChoice(i)}
                >
                  <Text style={[styles.choiceText, selected === i && styles.choiceTextActive]}>
                    {choice}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.resultCard}>
            <Text style={styles.resultEmoji}>🚀</Text>
            <Text style={styles.resultTitle}>Space Explorer!</Text>
            <Text style={styles.tip}>{data.tip}</Text>
            <Text style={styles.resultScore}>+50 Stars Earned</Text>
            
            <TouchableOpacity style={styles.nextLevelBtn} onPress={goNextLevel}>
              <LinearGradient colors={['#1A0533', '#4B0082']} style={styles.nextLevelGrad}>
                <Text style={styles.nextLevelText}>
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
  container: { flex: 1, backgroundColor: '#0D0221' },
  header: { paddingTop: 55, paddingBottom: 25, paddingHorizontal: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  backText: { fontSize: 18 },
  levelTag: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.6)', letterSpacing: 1.5, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '900', color: '#FFF', marginBottom: 6 },
  scoreText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  content: { padding: 20, paddingBottom: 100 },
  quizCard: { backgroundColor: '#1A0533', borderRadius: 30, padding: 30, elevation: 5, borderWidth: 1, borderColor: '#4B0082' },
  questionText: { fontSize: 22, fontWeight: '800', color: '#FFF', textAlign: 'center', marginBottom: 30, lineHeight: 30 },
  choices: { gap: 15 },
  choiceBtn: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 22, borderRadius: 20, borderWidth: 2, borderColor: '#4B0082', alignItems: 'center' },
  choiceCorrect: { borderColor: '#00FFC8', backgroundColor: 'rgba(0,255,200,0.1)' },
  choiceWrong: { borderColor: '#FF0055', backgroundColor: 'rgba(255,0,85,0.1)' },
  choiceText: { fontSize: 18, fontWeight: '700', color: '#BC96E6' },
  choiceTextActive: { color: '#FFF' },
  resultCard: { backgroundColor: '#1A0533', borderRadius: 30, padding: 30, alignItems: 'center', elevation: 5, borderWidth: 1, borderColor: '#4B0082' },
  resultEmoji: { fontSize: 60, marginBottom: 10 },
  resultTitle: { fontSize: 24, fontWeight: '900', color: '#FFF', marginBottom: 10 },
  tip: { fontSize: 15, color: '#BC96E6', textAlign: 'center', marginBottom: 20, fontWeight: '600', fontStyle: 'italic' },
  resultScore: { fontSize: 16, fontWeight: '800', color: '#00FFC8', marginBottom: 20 },
  nextLevelBtn: { width: '100%', borderRadius: 20, overflow: 'hidden' },
  nextLevelGrad: { paddingVertical: 16, alignItems: 'center' },
  nextLevelText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
});

export default SpaceActivity;





