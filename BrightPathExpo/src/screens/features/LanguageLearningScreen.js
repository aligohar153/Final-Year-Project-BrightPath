// BrightPath - Language Learning Screen (Sprint 2)
// Tap image → play audio, learn new words
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

const { width, height } = Dimensions.get('window');

// Word Categories with emoji representations
const WORD_CATEGORIES = [
  {
    id: 'alphabet',
    title: 'Alphabet 🔤',
    color: '#FF6BB5',
    words: [
      { word: 'A - Apple', emoji: '🍎', sound: 'A', fact: 'A is for Apple!' },
      { word: 'B - Ball', emoji: '⚽', sound: 'B', fact: 'B is for Ball!' },
      { word: 'C - Cat', emoji: '🐱', sound: 'C', fact: 'C is for Cat!' },
      { word: 'D - Dog', emoji: '🐶', sound: 'D', fact: 'D is for Dog!' },
      { word: 'E - Elephant', emoji: '🐘', sound: 'E', fact: 'E is for Elephant!' },
      { word: 'F - Fish', emoji: '🐠', sound: 'F', fact: 'F is for Fish!' },
    ],
  },
  {
    id: 'numbers',
    title: 'Numbers 🔢',
    color: '#4D96FF',
    words: [
      { word: '1', emoji: '1️⃣', sound: 'One', fact: '1 + 1 = 2 🎉' },
      { word: '2', emoji: '2️⃣', sound: 'Two', fact: '2 + 2 = 4 🎉' },
      { word: '3', emoji: '3️⃣', sound: 'Three', fact: '3 - 1 = 2 🧮' },
      { word: '4', emoji: '4️⃣', sound: 'Four', fact: '4 ÷ 2 = 2 ✨' },
      { word: '5', emoji: '5️⃣', sound: 'Five', fact: '5 + 5 = 10 🏆' },
      { word: '6', emoji: '6️⃣', sound: 'Six', fact: '6 - 3 = 3 💡' },
    ],
  },
  {
    id: 'animals',
    title: 'Animals 🐾',
    color: '#FF9F1C',
    words: [
      { word: 'Cat', emoji: '🐱', sound: '...meow', fact: 'Cats purr when happy!' },
      { word: 'Dog', emoji: '🐶', sound: '...woof', fact: 'Dogs are loyal friends!' },
      { word: 'Bird', emoji: '🐦', sound: '...tweet', fact: 'Birds can fly high!' },
      { word: 'Fish', emoji: '🐠', sound: '...splash', fact: 'Fish live in water!' },
      { word: 'Rabbit', emoji: '🐰', sound: '...squeak', fact: 'Rabbits have long ears!' },
      { word: 'Lion', emoji: '🦁', sound: '...roar', fact: 'Lions are brave!' },
    ],
  },
  {
    id: 'food',
    title: 'Food 🍎',
    color: '#FF6B6B',
    words: [
      { word: 'Apple', emoji: '🍎', sound: '...crunch', fact: 'Apples are healthy!' },
      { word: 'Banana', emoji: '🍌', sound: '...yum', fact: 'Bananas give energy!' },
      { word: 'Milk', emoji: '🥛', sound: '...glug', fact: 'Milk is good for bones!' },
      { word: 'Bread', emoji: '🍞', sound: '...chomp', fact: 'Bread fills your tummy!' },
      { word: 'Cookie', emoji: '🍪', sound: '...crunch', fact: 'Cookies are sweet!' },
      { word: 'Pizza', emoji: '🍕', sound: '...yummy', fact: 'Pizza has cheese!' },
    ],
  },
  {
    id: 'colors',
    title: 'Colors 🎨',
    color: '#7B2FBE',
    words: [
      { word: 'Red', emoji: '🔴', sound: '...red', fact: 'Red is like fire!' },
      { word: 'Blue', emoji: '🔵', sound: '...blue', fact: 'Blue is like the sky!' },
      { word: 'Green', emoji: '🟢', sound: '...green', fact: 'Green is like grass!' },
      { word: 'Yellow', emoji: '🟡', sound: '...yellow', fact: 'Yellow is like sun!' },
      { word: 'Orange', emoji: '🟠', sound: '...orange', fact: 'Orange is bright!' },
      { word: 'Purple', emoji: '🟣', sound: '...purple', fact: 'Purple is royal!' },
    ],
  },
  {
    id: 'body',
    title: 'My Body 🫁',
    color: '#4D96FF',
    words: [
      { word: 'Hand', emoji: '✋', sound: '...hand', fact: 'Hands help us touch!' },
      { word: 'Eye', emoji: '👁️', sound: '...eye', fact: 'Eyes help us see!' },
      { word: 'Ear', emoji: '👂', sound: '...ear', fact: 'Ears help us hear!' },
      { word: 'Nose', emoji: '👃', sound: '...nose', fact: 'Nose helps us smell!' },
      { word: 'Mouth', emoji: '👄', sound: '...mouth', fact: 'Mouth helps us talk!' },
      { word: 'Foot', emoji: '🦶', sound: '...foot', fact: 'Feet help us walk!' },
    ],
  },
];

import { speak } from '../../utils/ttsService';

const LanguageLearningScreen = ({ navigation, route }) => {
  const { activeChild, recordProgress } = useApp();
  const initialCat = route.params?.category 
    ? (WORD_CATEGORIES.find(c => c.id === route.params.category) || WORD_CATEGORIES[0])
    : WORD_CATEGORIES[0];
    
  const [activeCategory, setActiveCategory] = useState(initialCat);
  const [tappedWord, setTappedWord] = useState(null);
  const [score, setScore] = useState(0);
  const [wordsLearned, setWordsLearned] = useState([]);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const handleWordTap = (word) => {
    speak(word.word);
    Animated.sequence([
      Animated.spring(pulseAnim, { toValue: 1.15, useNativeDriver: true, speed: 40 }),
      Animated.spring(pulseAnim, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();

    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: -8, duration: 150, useNativeDriver: true }),
      Animated.spring(bounceAnim, { toValue: 0, tension: 80, friction: 5, useNativeDriver: true }),
    ]).start();

    setTappedWord(word);

    if (!wordsLearned.includes(word.word)) {
      const newScore = score + 10;
      setScore(newScore);
      setWordsLearned(prev => [...prev, word.word]);
      recordProgress('language', { word: word.word, score: newScore });
    }
    setTimeout(() => setTappedWord(null), 3000);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F9FF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backEmoji}>⬅️</Text>
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            {activeCategory.id === 'numbers' ? 'Math Numbers' : 
             activeCategory.id === 'alphabet' ? 'Alphabet' : 'Learn Words'}
          </Text>
          <Text style={styles.headerSub}>
            {activeCategory.id === 'numbers' ? 'Tap to learn digits & math!' : 'Tap cards to hear the sound!'}
          </Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>⭐ {score}</Text>
        </View>
      </View>

      <View style={styles.catContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {WORD_CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat.id} 
              onPress={() => setActiveCategory(cat)}
              style={[styles.catTab, activeCategory.id === cat.id && { backgroundColor: cat.color }]}>
              <Text style={[styles.catTabText, activeCategory.id === cat.id && { color: '#FFF' }]}>{cat.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Tapped Word Spotlight */}
        {tappedWord && (
          <Animated.View style={[styles.spotlight, { transform: [{ scale: pulseAnim }, { translateY: bounceAnim }] }]}>
            <LinearGradient colors={['#FFF', '#F5F9FF']} style={styles.spotlightCard}>
              <Text style={styles.spotlightEmoji}>{tappedWord.emoji}</Text>
              <Text style={styles.spotlightText}>{tappedWord.word.toUpperCase()}</Text>
              <Text style={styles.spotlightFact}>{tappedWord.fact}</Text>
            </LinearGradient>
          </Animated.View>
        )}

        <View style={styles.grid}>
          {activeCategory.words.map((word, index) => (
            <WordCard 
              key={word.word} 
              word={word} 
              color={activeCategory.color} 
              onPress={() => handleWordTap(word)} 
              isLearned={wordsLearned.includes(word.word)}
              isNumber={activeCategory.id === 'numbers'}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const WordCard = ({ word, color, onPress, isLearned, isNumber }) => (
  <TouchableOpacity onPress={onPress} style={styles.wordCard}>
    <View style={[styles.wordIcon, { backgroundColor: color + '15' }]}>
      {isNumber ? (
        <Text style={[styles.wordDigit, { color }]}>{word.word}</Text>
      ) : (
        <Text style={styles.wordEmoji}>{word.emoji}</Text>
      )}
    </View>
    <Text style={[styles.wordText, isLearned && { color }]}>
      {isNumber ? word.sound : word.word}
    </Text>
    <Text style={styles.wordFact}>{word.fact}</Text>
    {isLearned && <View style={[styles.learnedDot, { backgroundColor: color }]} />}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F9FF' },
  header: {
    paddingTop: 60,
    paddingHorizontal: 25,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: { width: 45, height: 45, borderRadius: 22, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', elevation: 2 },
  backEmoji: { fontSize: 20 },
  headerText: { flex: 1, marginLeft: 15 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: COLORS.textDark },
  headerSub: { fontSize: 12, color: COLORS.textMedium, fontWeight: '600' },
  scoreBadge: { backgroundColor: '#FFD93D', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  scoreText: { fontWeight: '900', color: COLORS.textDark, fontSize: 14 },
  
  catContainer: { marginBottom: 15 },
  catScroll: { paddingHorizontal: 25 },
  catTab: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, backgroundColor: '#FFF', marginRight: 10, elevation: 1 },
  catTabText: { fontSize: 12, fontWeight: '800', color: COLORS.textMedium },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  spotlight: { marginBottom: 20, zIndex: 10 },
  spotlightCard: { borderRadius: 35, padding: 30, alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15, borderWidth: 1, borderColor: '#EEE' },
  spotlightEmoji: { fontSize: 80, marginBottom: 10 },
  spotlightText: { fontSize: 32, fontWeight: '900', color: COLORS.textDark, letterSpacing: 2 },
  spotlightFact: { fontSize: 14, color: COLORS.textMedium, textAlign: 'center', marginTop: 10, fontWeight: '600' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  wordCard: { width: (width - 60) / 2, backgroundColor: '#FFF', borderRadius: 30, padding: 20, marginBottom: 20, alignItems: 'center', elevation: 3 },
  wordIcon: { width: 80, height: 80, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  wordEmoji: { fontSize: 40 },
  wordText: { fontSize: 16, fontWeight: '900', color: COLORS.textDark, marginTop: 4 },
  wordDigit: { fontSize: 52, fontWeight: '900', lineHeight: 60 },
  wordFact: { fontSize: 10, color: COLORS.textLight, textAlign: 'center', marginTop: 4, fontWeight: '700', paddingHorizontal: 4 },
  learnedDot: { width: 8, height: 8, borderRadius: 4, marginTop: 8 },
});

export default LanguageLearningScreen;





