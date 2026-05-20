import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/colors';
import { MEMORY_LEVELS } from '../../data/levelData';
import { speak } from '../../utils/ttsService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { completeLevel } from '../../utils/progressService';

const { width } = Dimensions.get('window');

const MemoryGameActivity = ({ navigation, route }) => {
  const { user } = useAuth();
  const { activeChild } = useApp();
  const level = Math.min(route.params?.level || 1, 20);
  const activityId = route.params?.activityId || 'memory';
  const data = MEMORY_LEVELS[level - 1];

  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [canFlip, setCanFlip] = useState(true);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [complete, setComplete] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    initGame();
  }, [level]);

  const initGame = () => {
    const pairs = [...data.emojis, ...data.emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({ id: i, emoji }));
    setCards(pairs);
    setFlipped([]);
    setMatched([]);
    setCanFlip(true);
    setScore(0);
    setMoves(0);
    setComplete(false);
  };

  const handleFlip = (idx) => {
    if (!canFlip || flipped.includes(idx) || matched.includes(idx)) return;
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setCanFlip(false);
      const [a, b] = newFlipped;
      if (cards[a].emoji === cards[b].emoji) {
        const newMatched = [...matched, a, b];
        setMatched(newMatched);
        setFlipped([]);
        setCanFlip(true);
        setScore(s => s + 20);
        if (newMatched.length === cards.length) {
          speak('Amazing! You matched them all!');
          completeLevel(activityId, level, activeChild?.id || user?.uid);
          setComplete(true);
        }
      } else {
        setTimeout(() => { setFlipped([]); setCanFlip(true); }, 1000);
      }
    }
  };

  const cardSize = data.pairs <= 4 ? (width - 80) / 3 : data.pairs <= 6 ? (width - 80) / 4 : (width - 80) / 4;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#4D96FF', '#06D6A0']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.levelTag}>MEMORY GAME · LEVEL {level}</Text>
        <Text style={styles.title}>Match the Pairs!</Text>
        <View style={styles.statsRow}>
          <Text style={styles.stat}>⭐ {score}</Text>
          <Text style={styles.stat}>{matched.length / 2}/{data.pairs} pairs</Text>
          <Text style={styles.stat}>Moves: {moves}</Text>
        </View>
      </LinearGradient>

      <Animated.ScrollView contentContainerStyle={styles.content} style={{ opacity: fadeAnim }}>
        <View style={styles.grid}>
          {cards.map((card, idx) => {
            const isFlipped = flipped.includes(idx) || matched.includes(idx);
            const isMatched = matched.includes(idx);
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.card, { width: cardSize, height: cardSize }, isMatched && styles.cardMatched]}
                onPress={() => handleFlip(idx)}
                activeOpacity={0.85}
              >
                {isFlipped ? (
                  <Text style={styles.cardEmoji}>{card.emoji}</Text>
                ) : (
                  <Text style={styles.cardHidden}>❓</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.resetBtn} onPress={initGame}>
          <Text style={styles.resetText}>🔄 New Game</Text>
        </TouchableOpacity>

        {complete && (
          <View style={styles.resultCard}>
            <Text style={styles.resultEmoji}>🎉</Text>
            <Text style={styles.resultTitle}>All Pairs Found!</Text>
            <Text style={styles.resultSub}>Matched in {moves} moves · +{score} Stars</Text>
            <TouchableOpacity style={styles.nextBtn} onPress={() => {
              if (level < 20) navigation.replace('MemoryGameActivity', { level: level + 1, activityId });
              else navigation.goBack();
            }}>
              <LinearGradient colors={['#4D96FF', '#06D6A0']} style={styles.nextGrad}>
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
  container: { flex: 1, backgroundColor: '#F0FFFA' },
  header: { paddingTop: 55, paddingBottom: 25, paddingHorizontal: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  backText: { fontSize: 18 },
  levelTag: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.85)', letterSpacing: 1.5, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '900', color: '#FFF', marginBottom: 8 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { color: '#FFF', fontWeight: '800', fontSize: 12 },
  content: { padding: 20, paddingBottom: 100 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 20 },
  card: { borderRadius: 20, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', elevation: 4, borderWidth: 2, borderColor: '#E0F7FA' },
  cardMatched: { backgroundColor: '#E8F5E9', borderColor: '#6BCB77' },
  cardEmoji: { fontSize: 32 },
  cardHidden: { fontSize: 28, color: '#B2EBF2' },
  resetBtn: { backgroundColor: '#FFF', borderRadius: 20, padding: 12, alignItems: 'center', elevation: 2, marginBottom: 20 },
  resetText: { color: '#4D96FF', fontWeight: '900', fontSize: 13 },
  resultCard: { backgroundColor: '#FFF', borderRadius: 30, padding: 30, alignItems: 'center', elevation: 5 },
  resultEmoji: { fontSize: 60, marginBottom: 10 },
  resultTitle: { fontSize: 24, fontWeight: '900', color: '#4D96FF', marginBottom: 6 },
  resultSub: { fontSize: 13, color: COLORS.textMedium, marginBottom: 20, fontWeight: '700' },
  nextBtn: { width: '100%', borderRadius: 20, overflow: 'hidden' },
  nextGrad: { paddingVertical: 15, alignItems: 'center' },
  nextText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
});

export default MemoryGameActivity;





