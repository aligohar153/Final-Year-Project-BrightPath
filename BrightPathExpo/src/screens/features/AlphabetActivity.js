import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/colors';
import { ALPHABET_LEVELS } from '../../data/levelData';
import { speak } from '../../utils/ttsService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { completeLevel } from '../../utils/progressService';

const { width } = Dimensions.get('window');

const AlphabetActivity = ({ navigation, route }) => {
  const { user } = useAuth();
  const { activeChild } = useApp();
  const level = Math.min(route.params?.level || 1, 20);
  const activityId = route.params?.activityId || 'alphabet';
  const levelData = ALPHABET_LEVELS[level - 1];
  const [tapped, setTapped] = useState(null);
  const [learned, setLearned] = useState([]);
  const [score, setScore] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTapped(null);
    setLearned([]);
    setScore(0);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [level]);

  const handleTap = (item) => {
    speak(`${item.letter} is for ${item.word}`);
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.12, useNativeDriver: true, speed: 50 }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
    setTapped(item);
    if (!learned.includes(item.letter)) {
      setLearned(p => [...p, item.letter]);
      setScore(s => s + 20);
    }
    setTimeout(() => setTapped(null), 3000);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#FF6BB5', '#FF9F1C']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.levelTag}>ALPHABET · LEVEL {level}</Text>
        <Text style={styles.title}>Letter Time!</Text>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreText}>⭐ {score} pts</Text>
          <Text style={styles.progressText}>{learned.length}/{levelData.letters.length} learned</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {tapped && (
          <Animated.View style={[styles.spotlight, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.spotEmoji}>{tapped.emoji}</Text>
            <Text style={styles.spotLetter}>{tapped.letter}</Text>
            <Text style={styles.spotWord}>{tapped.word}</Text>
            <Text style={styles.spotHint}>🔊 {tapped.letter} is for {tapped.word}</Text>
          </Animated.View>
        )}

        <Text style={styles.sectionLabel}>TAP A LETTER TO LEARN</Text>
        <View style={styles.grid}>
          {levelData.letters.map((item) => {
            const isLearned = learned.includes(item.letter);
            return (
              <TouchableOpacity key={item.letter + item.word} style={[styles.card, isLearned && styles.cardLearned]} onPress={() => handleTap(item)}>
                <Text style={styles.cardEmoji}>{item.emoji}</Text>
                <Text style={[styles.cardLetter, isLearned && { color: '#FF6BB5' }]}>{item.letter}</Text>
                <Text style={styles.cardWord}>{item.word}</Text>
                {isLearned && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {learned.length === levelData.letters.length && (
          <View style={styles.completeBanner}>
            <Text style={styles.completeText}>🎉 Level {level} Complete! +{score} Stars</Text>
            <TouchableOpacity style={styles.nextBtn} onPress={async () => {
              await completeLevel(activityId, level, activeChild?.id || user?.uid);
              if (level < 20) {
                navigation.replace('AlphabetActivity', { level: level + 1, activityId });
              } else {
                navigation.goBack();
              }
            }}>
              <Text style={styles.nextBtnText}>{level < 20 ? `Level ${level + 1} →` : '🏆 All Done!'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9FF' },
  header: { paddingTop: 55, paddingBottom: 25, paddingHorizontal: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  backText: { fontSize: 18 },
  levelTag: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.8)', letterSpacing: 1.5, marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '900', color: '#FFF', marginBottom: 10 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between' },
  scoreText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  progressText: { color: 'rgba(255,255,255,0.8)', fontWeight: '700', fontSize: 12 },
  content: { padding: 20, paddingBottom: 100 },
  spotlight: { backgroundColor: '#FFF', borderRadius: 30, padding: 25, alignItems: 'center', marginBottom: 20, elevation: 8, borderWidth: 1, borderColor: '#FFE5F3' },
  spotEmoji: { fontSize: 70, marginBottom: 8 },
  spotLetter: { fontSize: 48, fontWeight: '900', color: '#FF6BB5', lineHeight: 55 },
  spotWord: { fontSize: 22, fontWeight: '900', color: COLORS.textDark, marginBottom: 8 },
  spotHint: { fontSize: 13, color: COLORS.textMedium, fontWeight: '700' },
  sectionLabel: { fontSize: 10, fontWeight: '900', color: COLORS.textLight, letterSpacing: 2, marginBottom: 15, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 15 },
  card: { width: (width - 60) / 3, backgroundColor: '#FFF', borderRadius: 25, padding: 18, alignItems: 'center', elevation: 3, borderWidth: 1, borderColor: '#FFE5F3' },
  cardLearned: { backgroundColor: '#FFF0F8', borderColor: '#FF6BB5' },
  cardEmoji: { fontSize: 36, marginBottom: 8 },
  cardLetter: { fontSize: 28, fontWeight: '900', color: COLORS.textDark, lineHeight: 32 },
  cardWord: { fontSize: 10, fontWeight: '800', color: COLORS.textLight, textAlign: 'center' },
  checkmark: { fontSize: 14, color: '#FF6BB5', fontWeight: '900', marginTop: 4 },
  completeBanner: { backgroundColor: '#FFF0F8', borderRadius: 25, padding: 25, alignItems: 'center', marginTop: 20, borderWidth: 1, borderColor: '#FF6BB5' },
  completeText: { fontSize: 16, fontWeight: '900', color: '#FF6BB5', marginBottom: 15, textAlign: 'center' },
  nextBtn: { backgroundColor: '#FF6BB5', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 20 },
  nextBtnText: { color: '#FFF', fontWeight: '900', fontSize: 14 },
});

export default AlphabetActivity;





