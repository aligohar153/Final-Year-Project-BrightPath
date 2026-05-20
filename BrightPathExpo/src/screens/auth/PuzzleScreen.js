import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/colors';
import { PUZZLE_QUESTIONS } from '../../utils/constants';

const { width } = Dimensions.get('window');

const PuzzleScreen = ({ navigation, route }) => {
  const { role } = route.params || { role: 'parent' };
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [attempts, setAttempts] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const q = PUZZLE_QUESTIONS[Math.floor(Math.random() * PUZZLE_QUESTIONS.length)];
    setQuestion(q);
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const handleSelect = (option) => {
    setSelected(option);
    const isCorrect = String(option) === String(question.answer);

    if (isCorrect) {
      setTimeout(() => {
        navigation.navigate('RegistrationForm', { role });
      }, 600);
    } else {
      triggerShake();
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= 3) {
        Alert.alert('Try Again', 'Please go back and start over.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        setTimeout(() => {
          setSelected(null);
          const q = PUZZLE_QUESTIONS[Math.floor(Math.random() * PUZZLE_QUESTIONS.length)];
          setQuestion(q);
        }, 1000);
      }
    }
  };

  const getRoleInfo = () => {
    const info = {
      parent: { color: '#4D96FF', emoji: '👨‍👩‍👧', grad: COLORS.blueGradient },
      teacher: { color: '#FF6BB5', emoji: '👩‍🏫', grad: COLORS.pinkGradient },
      caregiver: { color: '#FF9F1C', emoji: '🤝', grad: COLORS.orangeGradient },
    };
    return info[role] || info.parent;
  };

  if (!question) return null;
  const roleInfo = getRoleInfo();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F9FF" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backEmoji}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Verification</Text>
        <Text style={styles.subtitle}>A quick check for safety</Text>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateX: shakeAnim }] }]}>
        <View style={styles.puzzleCard}>
          <LinearGradient colors={roleInfo.grad} style={styles.roleHeader}>
            <Text style={styles.roleEmoji}>{roleInfo.emoji}</Text>
            <Text style={styles.roleText}>{role.toUpperCase()} SETUP</Text>
          </LinearGradient>

          <View style={styles.puzzleBody}>
            <Text style={styles.puzzleTag}>SECURITY PUZZLE</Text>
            <Text style={styles.questionText}>{question.question}</Text>
            
            <View style={styles.optionsGrid}>
              {question.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => selected === null && handleSelect(option)}
                  style={[
                    styles.optionBtn,
                    selected === option && (String(option) === String(question.answer) ? styles.optionCorrect : styles.optionWrong)
                  ]}>
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.hint}>
              {attempts > 0 ? `Attempts: ${attempts}/3` : 'Tap the correct number to continue'}
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F9FF' },
  header: { paddingTop: 60, paddingHorizontal: 25, marginBottom: 10 },
  backBtn: { width: 45, height: 45, borderRadius: 22, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', elevation: 2, marginBottom: 20 },
  backEmoji: { fontSize: 20 },
  title: { fontSize: 32, fontWeight: '900', color: COLORS.textDark },
  subtitle: { fontSize: 16, color: COLORS.textMedium, fontWeight: '600' },
  content: { flex: 1, paddingHorizontal: 25, justifyContent: 'center' },
  puzzleCard: { backgroundColor: '#FFF', borderRadius: 35, overflow: 'hidden', elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20 },
  roleHeader: { padding: 25, alignItems: 'center', flexDirection: 'row', gap: 15 },
  roleEmoji: { fontSize: 36 },
  roleText: { fontSize: 14, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  puzzleBody: { padding: 30, alignItems: 'center' },
  puzzleTag: { fontSize: 10, fontWeight: '900', color: COLORS.textLight, marginBottom: 15, letterSpacing: 2 },
  questionText: { fontSize: 32, fontWeight: '900', color: COLORS.textDark, textAlign: 'center', marginBottom: 30 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, justifyContent: 'center' },
  optionBtn: { width: (width - 150) / 2, height: 70, backgroundColor: '#F5F9FF', borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E0F2FF' },
  optionText: { fontSize: 24, fontWeight: '900', color: COLORS.textDark },
  optionCorrect: { backgroundColor: '#E8F5E9', borderColor: '#6BCB77' },
  optionWrong: { backgroundColor: '#FFE5E5', borderColor: '#FF6B6B' },
  hint: { marginTop: 25, fontSize: 12, color: COLORS.textMedium, fontWeight: '700' },
});

export default PuzzleScreen;





