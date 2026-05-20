import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/colors';
import { TIME_LEVELS } from '../../data/levelData';
import { speak } from '../../utils/ttsService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { completeLevel } from '../../utils/progressService';

const TellingTimeActivity = ({ navigation, route }) => {
  const { user } = useAuth();
  const { activeChild } = useApp();
  const level = Math.min(route.params?.level || 1, 20);
  const activityId = route.params?.activityId || 'time';
  const data = TIME_LEVELS[level - 1];

  const [selected, setSelected] = useState(null);
  const [phase, setPhase] = useState('quiz'); // quiz | result
  const [score, setScore] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Generate options including the correct one
  const [options, setOptions] = useState([]);

  useEffect(() => {
    setSelected(null);
    setPhase('quiz');
    setScore(0);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    speak(data.question);
    
    // Create random options for time
    const distractors = [
      `${(data.hour % 12) + 1}:00`,
      `${data.hour}:15`,
      `${data.hour}:45`,
      `${(data.hour + 2) % 12 || 12}:30`
    ].filter(t => t !== data.time).slice(0, 2);
    
    setOptions([...distractors, data.time].sort(() => Math.random() - 0.5));
  }, [level]);

  const handleChoice = async (choice) => {
    if (selected !== null) return;
    setSelected(choice);
    
    if (choice === data.time) {
      setScore(s => s + 50);
      speak(`Correct! It is ${data.time}. ${data.tip}`);
      await completeLevel(activityId, level, activeChild?.id || user?.uid);
      setPhase('result');
    } else {
      speak("Try again!");
      setTimeout(() => setSelected(null), 1500);
    }
  };

  const goNextLevel = () => {
    if (level < 20) {
      navigation.replace('TellingTimeActivity', { level: level + 1, activityId });
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#FF9E00', '#FF7B00']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.levelTag}>TELLING TIME · LEVEL {level}</Text>
        <Text style={styles.title}>What time is it?</Text>
        <Text style={styles.scoreText}>⭐ {score} pts</Text>
      </LinearGradient>

      <Animated.ScrollView contentContainerStyle={styles.content} style={{ opacity: fadeAnim }}>
        {phase === 'quiz' ? (
          <View style={styles.quizCard}>
            <View style={styles.clockContainer}>
              <Text style={styles.clockEmoji}>⌚</Text>
              <Text style={styles.questionText}>{data.question}</Text>
            </View>
            
            <View style={styles.choices}>
              {options.map((choice, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.choiceBtn,
                    selected === choice && choice === data.time && styles.choiceCorrect,
                    selected === choice && choice !== data.time && styles.choiceWrong
                  ]}
                  onPress={() => handleChoice(choice)}
                >
                  <Text style={[styles.choiceText, selected === choice && styles.choiceTextActive]}>
                    {choice}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.resultCard}>
            <Text style={styles.resultEmoji}>⏰</Text>
            <Text style={styles.resultTitle}>Time Master!</Text>
            <Text style={styles.tip}>{data.tip}</Text>
            <Text style={styles.resultScore}>+50 Stars Earned</Text>
            
            <TouchableOpacity style={styles.nextLevelBtn} onPress={goNextLevel}>
              <LinearGradient colors={['#FF9E00', '#FF7B00']} style={styles.nextLevelGrad}>
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
  container: { flex: 1, backgroundColor: '#FFF8E1' },
  header: { paddingTop: 55, paddingBottom: 25, paddingHorizontal: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  backText: { fontSize: 18 },
  levelTag: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.8)', letterSpacing: 1.5, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '900', color: '#FFF', marginBottom: 6 },
  scoreText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  content: { padding: 20, paddingBottom: 100 },
  quizCard: { backgroundColor: '#FFF', borderRadius: 30, padding: 30, elevation: 5, alignItems: 'center' },
  clockContainer: { alignItems: 'center', marginBottom: 30 },
  clockEmoji: { fontSize: 80, marginBottom: 10 },
  questionText: { fontSize: 24, fontWeight: '900', color: '#FF7B00', textAlign: 'center' },
  choices: { gap: 15, width: '100%' },
  choiceBtn: { backgroundColor: '#F8F9FA', padding: 22, borderRadius: 20, borderWidth: 2, borderColor: '#EEE', alignItems: 'center' },
  choiceCorrect: { borderColor: '#6BCB77', backgroundColor: '#F0FFF4' },
  choiceWrong: { borderColor: '#FF6B6B', backgroundColor: '#FFF5F5' },
  choiceText: { fontSize: 24, fontWeight: '900', color: COLORS.textMedium },
  choiceTextActive: { color: COLORS.textDark },
  resultCard: { backgroundColor: '#FFF', borderRadius: 30, padding: 30, alignItems: 'center', elevation: 5 },
  resultEmoji: { fontSize: 60, marginBottom: 10 },
  resultTitle: { fontSize: 24, fontWeight: '900', color: '#FF7B00', marginBottom: 10 },
  tip: { fontSize: 15, color: COLORS.textMedium, textAlign: 'center', marginBottom: 20, fontWeight: '600' },
  resultScore: { fontSize: 16, fontWeight: '800', color: '#6BCB77', marginBottom: 20 },
  nextLevelBtn: { width: '100%', borderRadius: 20, overflow: 'hidden' },
  nextLevelGrad: { paddingVertical: 16, alignItems: 'center' },
  nextLevelText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
});

export default TellingTimeActivity;





