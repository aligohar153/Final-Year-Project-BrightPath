import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/colors';
import { useApp } from '../../context/AppContext';
import { speak } from '../../utils/ttsService';

const { width } = Dimensions.get('window');

const SCENARIOS = [
  {
    id: 1,
    title: 'Meeting a Friend',
    image: '👋',
    scene: 'You see your friend at the park. They look at you and wave!',
    options: [
      { emoji: '😊', text: 'Wave back and say "Hello!"', isCorrect: true, feedback: 'Perfect! That is a friendly way to say hi.' },
      { emoji: '🚶', text: 'Walk away without looking', isCorrect: false, feedback: 'It\'s nicer to wave back so they know you saw them.' }
    ]
  },
  {
    id: 2,
    title: 'Sharing a Toy',
    image: '🧸',
    scene: 'A friend wants to play with the same toy as you.',
    options: [
      { emoji: '🤝', text: 'Ask "Can we play together?"', isCorrect: true, feedback: 'Playing together is twice the fun!' },
      { emoji: '🚫', text: 'Hide the toy behind you', isCorrect: false, feedback: 'Sharing helps us make more friends.' }
    ]
  },
  {
    id: 3,
    title: 'Saying Sorry',
    image: '🙏',
    scene: 'You accidentally knocked over your friend\'s tower of blocks.',
    options: [
      { emoji: '🗣️', text: 'Say "Sorry! Let me help fix it."', isCorrect: true, feedback: 'Saying sorry and helping out makes everything better.' },
      { emoji: '🏃', text: 'Run away quickly', isCorrect: false, feedback: 'If we make a mistake, it\'s best to say sorry.' }
    ]
  }
];

const SocialScenariosScreen = ({ navigation }) => {
  const { recordProgress } = useApp();
  const [currentScenario, setCurrentScenario] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);

  const scenario = SCENARIOS[currentScenario];
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    speak(`${scenario.title}. ${scenario.scene}`);
  }, [currentScenario]);

  const handleOptionSelect = (option) => {
    const isCorrect = option.isCorrect;
    setFeedback({ isCorrect, option });
    
    if (isCorrect) {
      setScore(prev => prev + 20);
      speak(`Great choice! ${option.feedback}`);
    } else {
      speak(`Not quite. ${option.feedback}`);
    }

    recordProgress('social', { scenario: scenario.id, correct: isCorrect });

    setTimeout(() => {
      setFeedback(null);
      if (currentScenario < SCENARIOS.length - 1) {
        setCurrentScenario(prev => prev + 1);
      } else {
        setCurrentScenario(0);
      }
    }, 3500);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F9FF" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backEmoji}>⬅️</Text>
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Social Skills</Text>
          <Text style={styles.headerSub}>Learning to be a great friend!</Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>🏆 {score}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.scenarioCard, { opacity: fadeAnim }]}>
          <View style={styles.scenarioTag}>
            <Text style={styles.tagText}>SCENARIO {currentScenario + 1}</Text>
          </View>
          <Text style={styles.scenarioImage}>{scenario.image}</Text>
          <Text style={styles.scenarioTitle}>{scenario.title}</Text>
          <Text style={styles.scenarioDesc}>{scenario.scene}</Text>
        </Animated.View>

        <Text style={styles.questionTitle}>WHAT SHOULD YOU DO?</Text>

        <View style={styles.optionsContainer}>
          {scenario.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => !feedback && handleOptionSelect(option)}
              style={[
                styles.optionBtn,
                feedback?.option === option && (feedback.isCorrect ? styles.optionCorrect : styles.optionWrong)
              ]}>
              <Text style={styles.optionEmoji}>{option.emoji}</Text>
              <Text style={styles.optionText}>{option.text}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {feedback && (
          <LinearGradient 
            colors={feedback.isCorrect ? ['#E8F5E9', '#C8E6C9'] : ['#FFF3E0', '#FFE0B2']} 
            style={styles.feedbackBanner}>
            <Text style={styles.feedbackText}>
              {feedback.isCorrect ? '🌟 ' + feedback.option.feedback : '💡 ' + feedback.option.feedback}
            </Text>
          </LinearGradient>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F9FF' },
  header: { paddingTop: 60, paddingHorizontal: 25, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backBtn: { width: 45, height: 45, borderRadius: 22, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', elevation: 2 },
  backEmoji: { fontSize: 20 },
  headerText: { flex: 1, marginLeft: 15 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: COLORS.textDark },
  headerSub: { fontSize: 12, color: COLORS.textMedium, fontWeight: '600' },
  scoreBadge: { backgroundColor: '#6BCB77', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  scoreText: { fontWeight: '900', color: '#FFF', fontSize: 14 },
  scrollContent: { paddingHorizontal: 25, paddingBottom: 50 },
  scenarioCard: { backgroundColor: '#FFF', borderRadius: 35, padding: 30, alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15, marginBottom: 25 },
  scenarioTag: { backgroundColor: '#F5F9FF', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, marginBottom: 15 },
  tagText: { fontSize: 10, fontWeight: '900', color: COLORS.primary },
  scenarioImage: { fontSize: 70, marginBottom: 15 },
  scenarioTitle: { fontSize: 22, fontWeight: '900', color: COLORS.textDark, textAlign: 'center', marginBottom: 10 },
  scenarioDesc: { fontSize: 15, color: COLORS.textMedium, textAlign: 'center', lineHeight: 22, fontWeight: '600' },
  questionTitle: { fontSize: 12, fontWeight: '900', color: COLORS.textLight, textAlign: 'center', marginBottom: 15, letterSpacing: 1 },
  optionsContainer: { gap: 12 },
  optionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 20, borderRadius: 25, elevation: 2 },
  optionEmoji: { fontSize: 24, marginRight: 15 },
  optionText: { fontSize: 15, fontWeight: '800', color: COLORS.textDark, flex: 1 },
  optionCorrect: { backgroundColor: '#E8F5E9', borderWidth: 2, borderColor: '#6BCB77' },
  optionWrong: { backgroundColor: '#FFF3E0', borderWidth: 2, borderColor: '#FF9F1C' },
  feedbackBanner: { marginTop: 20, padding: 20, borderRadius: 25, alignItems: 'center' },
  feedbackText: { fontSize: 14, fontWeight: '800', color: COLORS.textDark, textAlign: 'center', lineHeight: 20 },
});

export default SocialScenariosScreen;





