import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/colors';
import { WEATHER_LEVELS } from '../../data/levelData';
import { speak } from '../../utils/ttsService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { completeLevel } from '../../utils/progressService';

const WeatherActivity = ({ navigation, route }) => {
  const { user } = useAuth();
  const { activeChild } = useApp();
  const level = Math.min(route.params?.level || 1, 20);
  const activityId = route.params?.activityId || 'weather';
  const data = WEATHER_LEVELS[level - 1];

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
    speak(`It is ${data.weather} today! What do we need?`);
  }, [level]);

  const handleChoice = async (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    
    if (idx === data.correct) {
      setScore(s => s + 50);
      speak(`Yes! We need ${data.need}. ${data.tip}`);
      await completeLevel(activityId, level, activeChild?.id || user?.uid);
      setPhase('result');
    } else {
      speak("Try another one!");
      setTimeout(() => setSelected(null), 1500);
    }
  };

  const goNextLevel = () => {
    if (level < 20) {
      navigation.replace('WeatherActivity', { level: level + 1, activityId });
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#CAF0F8', '#90E0EF']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.levelTag}>WEATHER · LEVEL {level}</Text>
        <Text style={styles.title}>Dress for the Weather!</Text>
        <Text style={styles.scoreText}>⭐ {score} pts</Text>
      </LinearGradient>

      <Animated.ScrollView contentContainerStyle={styles.content} style={{ opacity: fadeAnim }}>
        {phase === 'quiz' ? (
          <View style={styles.quizCard}>
            <Text style={styles.weatherEmoji}>{data.emoji}</Text>
            <Text style={styles.weatherText}>It is {data.weather}!</Text>
            <Text style={styles.questionText}>What do we need?</Text>
            
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
            <Text style={styles.resultEmoji}>🌈</Text>
            <Text style={styles.resultTitle}>Perfect Choice!</Text>
            <Text style={styles.tip}>{data.tip}</Text>
            <Text style={styles.resultScore}>+50 Stars Earned</Text>
            
            <TouchableOpacity style={styles.nextLevelBtn} onPress={goNextLevel}>
              <LinearGradient colors={['#CAF0F8', '#90E0EF']} style={styles.nextLevelGrad}>
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
  container: { flex: 1, backgroundColor: '#F0F9FF' },
  header: { paddingTop: 55, paddingBottom: 25, paddingHorizontal: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.4)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  backText: { fontSize: 18 },
  levelTag: { fontSize: 10, fontWeight: '900', color: '#0077B6', letterSpacing: 1.5, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '900', color: '#03045E', marginBottom: 6 },
  scoreText: { color: '#0077B6', fontWeight: '800', fontSize: 14 },
  content: { padding: 20, paddingBottom: 100 },
  quizCard: { backgroundColor: '#FFF', borderRadius: 30, padding: 30, elevation: 5, alignItems: 'center' },
  weatherEmoji: { fontSize: 80, marginBottom: 10 },
  weatherText: { fontSize: 28, fontWeight: '900', color: '#03045E', marginBottom: 5 },
  questionText: { fontSize: 16, fontWeight: '700', color: COLORS.textMedium, marginBottom: 30 },
  choices: { gap: 12, width: '100%' },
  choiceBtn: { backgroundColor: '#F8F9FA', padding: 20, borderRadius: 20, borderWidth: 2, borderColor: '#EEE', alignItems: 'center' },
  choiceCorrect: { borderColor: '#6BCB77', backgroundColor: '#F0FFF4' },
  choiceWrong: { borderColor: '#FF6B6B', backgroundColor: '#FFF5F5' },
  choiceText: { fontSize: 18, fontWeight: '700', color: COLORS.textMedium },
  choiceTextActive: { color: COLORS.textDark },
  resultCard: { backgroundColor: '#FFF', borderRadius: 30, padding: 30, alignItems: 'center', elevation: 5 },
  resultEmoji: { fontSize: 60, marginBottom: 10 },
  resultTitle: { fontSize: 24, fontWeight: '900', color: '#03045E', marginBottom: 10 },
  tip: { fontSize: 15, color: COLORS.textMedium, textAlign: 'center', marginBottom: 20, fontWeight: '600' },
  resultScore: { fontSize: 16, fontWeight: '800', color: '#6BCB77', marginBottom: 20 },
  nextLevelBtn: { width: '100%', borderRadius: 20, overflow: 'hidden' },
  nextLevelGrad: { paddingVertical: 16, alignItems: 'center' },
  nextLevelText: { color: '#03045E', fontWeight: '900', fontSize: 16 },
});

export default WeatherActivity;





