import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar, ScrollView, Dimensions, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/colors';
import { NUMBERS_LEVELS } from '../../data/levelData';
import { speak } from '../../utils/ttsService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { completeLevel } from '../../utils/progressService';

const { width } = Dimensions.get('window');

const NumbersActivity = ({ navigation, route }) => {
  const { user } = useAuth();
  const { activeChild } = useApp();
  const level = Math.min(route.params?.level || 1, 20);
  const activityId = route.params?.activityId || 'numbers';
  const levelData = NUMBERS_LEVELS[level - 1];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [learned, setLearned] = useState([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setCurrentIdx(0);
    setAnswer('');
    setScore(0);
    setFeedback(null);
    setLearned([]);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [level]);

  const current = levelData.items[currentIdx];
  const isLearnType = levelData.type === 'learn';

  const handleLearnTap = async (item) => {
    speak(item.word || item.digit);
    const newLearned = learned.includes(currentIdx) ? learned : [...learned, currentIdx];
    if (!learned.includes(currentIdx)) {
      setLearned(newLearned);
      setScore(s => s + 20);
    }

    if (currentIdx < levelData.items.length - 1) {
      setTimeout(() => setCurrentIdx(c => c + 1), 1200);
    } else {
      // Last item tapped — level complete!
      await completeLevel(activityId, level, activeChild?.id || user?.uid);
    }
  };

  const handleCheckAnswer = () => {
    if (answer.trim() === current.answer) {
      setFeedback('correct');
      setScore(s => s + 30);
      speak('Correct! Well done!');
      setTimeout(async () => {
        setFeedback(null);
        setAnswer('');
        if (currentIdx < levelData.items.length - 1) {
          setCurrentIdx(c => c + 1);
        } else {
          // All items done — unlock next level
          await completeLevel(activityId, level, activeChild?.id || user?.uid);
        }
      }, 1500);
    } else {
      setFeedback('wrong');
      speak('Try again!');
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
      ]).start(() => setFeedback(null));
    }
  };

  // Level is complete when all items are either learned or last quiz is answered correctly
  const isLearnDone = isLearnType && learned.length === levelData.items.length;
  const isQuizDone = !isLearnType && currentIdx >= levelData.items.length - 1 && feedback === null && score > 0;
  const isComplete = isLearnDone || isQuizDone;

  const goNextLevel = () => {
    if (level < 20) {
      navigation.replace('NumbersActivity', { level: level + 1, activityId });
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#4D96FF', '#4361EE']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.levelTag}>NUMBERS · LEVEL {level} · {levelData.type.toUpperCase()}</Text>
        <Text style={styles.title}>
          {levelData.type === 'learn' ? 'Learn Numbers!' :
           levelData.type === 'addition' ? 'Addition Challenge!' :
           levelData.type === 'subtraction' ? 'Subtraction Challenge!' : 'Multiplication!'}
        </Text>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreText}>⭐ {score} pts</Text>
          <Text style={styles.progressText}>{currentIdx + 1}/{levelData.items.length}</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateX: shakeAnim }] }]}>
          {isLearnType ? (
            <TouchableOpacity onPress={() => handleLearnTap(current)} style={styles.learnCard}>
              <Text style={styles.bigEmoji}>{current.emoji}</Text>
              <Text style={styles.bigDigit}>{current.digit}</Text>
              <Text style={styles.wordLabel}>{current.word}</Text>
              <Text style={styles.factText}>{current.fact}</Text>
              <Text style={styles.tapHint}>🔊 Tap to hear!</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.quizCard}>
              <Text style={styles.quizEmoji}>{current.emoji}</Text>
              <Text style={styles.question}>{current.question}</Text>
              <TextInput
                style={[styles.answerInput, feedback === 'correct' && styles.inputCorrect, feedback === 'wrong' && styles.inputWrong]}
                value={answer}
                onChangeText={setAnswer}
                keyboardType="numeric"
                placeholder="Type your answer..."
                placeholderTextColor="#BDD"
                maxLength={4}
              />
              <TouchableOpacity style={styles.checkBtn} onPress={handleCheckAnswer}>
                <LinearGradient colors={['#4D96FF', '#4361EE']} style={styles.checkGrad}>
                  <Text style={styles.checkText}>CHECK ✓</Text>
                </LinearGradient>
              </TouchableOpacity>
              {feedback === 'correct' && <Text style={styles.correctMsg}>🎉 Correct! +30 pts</Text>}
              {feedback === 'wrong' && <Text style={styles.wrongMsg}>❌ Try again!</Text>}
            </View>
          )}
        </Animated.View>

        {/* Navigation dots */}
        <View style={styles.dots}>
          {levelData.items.map((_, i) => (
            <View key={i} style={[styles.dot, i <= currentIdx && styles.dotActive]} />
          ))}
        </View>

        {/* Level Complete Banner */}
        {isComplete && (
          <View style={styles.completeBanner}>
            <Text style={styles.completeEmoji}>🎉</Text>
            <Text style={styles.completeTitle}>Level {level} Complete!</Text>
            <Text style={styles.completeScore}>+{score} Stars Earned</Text>
            <TouchableOpacity style={styles.nextBtn} onPress={goNextLevel}>
              <LinearGradient colors={['#4D96FF', '#4361EE']} style={styles.nextGrad}>
                <Text style={styles.nextText}>
                  {level < 20 ? `Level ${level + 1} →` : '🏆 All Done!'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F7FF' },
  header: { paddingTop: 55, paddingBottom: 25, paddingHorizontal: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  backText: { fontSize: 18 },
  levelTag: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.8)', letterSpacing: 1.5, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '900', color: '#FFF', marginBottom: 10 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between' },
  scoreText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  progressText: { color: 'rgba(255,255,255,0.8)', fontWeight: '700', fontSize: 12 },
  content: { padding: 20, paddingBottom: 100, alignItems: 'center' },
  card: { width: '100%', backgroundColor: '#FFF', borderRadius: 35, elevation: 8, overflow: 'hidden', marginBottom: 20 },
  learnCard: { padding: 35, alignItems: 'center' },
  bigEmoji: { fontSize: 70, marginBottom: 10 },
  bigDigit: { fontSize: 72, fontWeight: '900', color: '#4D96FF', lineHeight: 80 },
  wordLabel: { fontSize: 22, fontWeight: '900', color: COLORS.textDark, marginBottom: 8 },
  factText: { fontSize: 14, color: COLORS.textMedium, textAlign: 'center', fontWeight: '700', marginBottom: 15 },
  tapHint: { fontSize: 12, color: '#4D96FF', fontWeight: '800' },
  quizCard: { padding: 30, alignItems: 'center' },
  quizEmoji: { fontSize: 50, marginBottom: 15 },
  question: { fontSize: 36, fontWeight: '900', color: COLORS.textDark, marginBottom: 25, textAlign: 'center' },
  answerInput: { width: '100%', backgroundColor: '#F0F7FF', borderRadius: 20, paddingVertical: 15, paddingHorizontal: 20, fontSize: 28, fontWeight: '900', color: '#4D96FF', textAlign: 'center', borderWidth: 2, borderColor: '#E0F2FF', marginBottom: 20 },
  inputCorrect: { borderColor: '#6BCB77', backgroundColor: '#E8F5E9' },
  inputWrong: { borderColor: '#FF6B6B', backgroundColor: '#FFE5E5' },
  checkBtn: { width: '100%', borderRadius: 20, overflow: 'hidden', marginBottom: 15 },
  checkGrad: { paddingVertical: 15, alignItems: 'center' },
  checkText: { color: '#FFF', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
  correctMsg: { fontSize: 18, fontWeight: '900', color: '#6BCB77' },
  wrongMsg: { fontSize: 18, fontWeight: '900', color: '#FF6B6B' },
  dots: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D0E8FF' },
  dotActive: { width: 20, backgroundColor: '#4D96FF' },
  completeBanner: { backgroundColor: '#FFF', borderRadius: 30, padding: 30, alignItems: 'center', elevation: 6, borderWidth: 2, borderColor: '#4D96FF' },
  completeEmoji: { fontSize: 60, marginBottom: 8 },
  completeTitle: { fontSize: 24, fontWeight: '900', color: '#4D96FF', marginBottom: 6 },
  completeScore: { fontSize: 16, fontWeight: '800', color: '#6BCB77', marginBottom: 20 },
  nextBtn: { width: '100%', borderRadius: 20, overflow: 'hidden' },
  nextGrad: { paddingVertical: 16, alignItems: 'center' },
  nextText: { color: '#FFF', fontWeight: '900', fontSize: 16, letterSpacing: 0.5 },
});

export default NumbersActivity;





