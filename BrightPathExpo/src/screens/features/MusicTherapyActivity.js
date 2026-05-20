import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/colors';
import { MUSIC_LEVELS } from '../../data/levelData';
import { speak } from '../../utils/ttsService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { completeLevel } from '../../utils/progressService';

const { width } = Dimensions.get('window');

// Maps each emoji to its spoken instrument name
const INSTRUMENT_NAMES = {
  '🥁': 'Drum',
  '🔔': 'Bell',
  '🪇': 'Maracas',
  '🎹': 'Piano',
  '🎸': 'Guitar',
  '🎺': 'Trumpet',
  '🎻': 'Violin',
  '🪈': 'Flute',
  '🎵': 'Xylophone',
  '🎷': 'Saxophone',
  '🎼': 'Harp',
  '🪘': 'Bongo',
  '🪗': 'Accordion',
};

const speakInstrument = (emoji) => {
  const name = INSTRUMENT_NAMES[emoji] || 'Music';
  speak(name);
};

const MusicTherapyActivity = ({ navigation, route }) => {
  const { user } = useAuth();
  const { activeChild } = useApp();
  const level = Math.min(route.params?.level || 1, 20);
  const activityId = route.params?.activityId || 'music';
  const data = MUSIC_LEVELS[level - 1];

  const [phase, setPhase] = useState('watch');   // watch | repeat | result
  const [playIdx, setPlayIdx] = useState(0);
  const [userSeq, setUserSeq] = useState([]);
  const [score, setScore] = useState(0);
  const [highlight, setHighlight] = useState(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setPhase('watch');
    setPlayIdx(0);
    setUserSeq([]);
    setScore(0);
    setHighlight(null);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    const timer = setTimeout(playSequence, 800);
    return () => clearTimeout(timer);
  }, [level]);

  const pulseItem = () => {
    Animated.sequence([
      Animated.spring(pulseAnim, { toValue: 1.2, useNativeDriver: true, speed: 50 }),
      Animated.spring(pulseAnim, { toValue: 1, useNativeDriver: true, speed: 30 }),
    ]).start();
  };

  const playSequence = () => {
    setPhase('watch');
    data.beats.forEach((beat, i) => {
      setTimeout(() => {
        setHighlight(beat);
        speakInstrument(beat);
        pulseItem();
        setTimeout(() => setHighlight(null), 500);
        if (i === data.beats.length - 1) {
          setTimeout(() => { setPhase('repeat'); setUserSeq([]); }, 700);
        }
      }, i * 800);
    });
  };

  const handleTap = async (beat) => {
    if (phase !== 'repeat') return;
    const newSeq = [...userSeq, beat];
    setUserSeq(newSeq);
    speakInstrument(beat);
    pulseItem();

    if (newSeq.length === data.beats.length) {
      const correct = newSeq.every((b, i) => b === data.beats[i]);
      if (correct) {
        setScore(s => s + 50);
        await completeLevel(activityId, level, activeChild?.id || user?.uid);
        setPhase('result');
      } else {
        setPhase('watch');
        setUserSeq([]);
        speak('Try again! Watch the sequence.');
        setTimeout(playSequence, 1000);
      }
    }
  };

  const goNext = () => {
    if (level < 20) navigation.replace('MusicTherapyActivity', { level: level + 1, activityId });
    else navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#7B2FBE', '#4361EE']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.levelTag}>MUSIC THERAPY · LEVEL {level}</Text>
        <Text style={styles.title}>{data.instrument} Rhythm!</Text>
        <Text style={styles.scoreText}>⭐ {score}</Text>
      </LinearGradient>

      <Animated.ScrollView contentContainerStyle={styles.content} style={{ opacity: fadeAnim }}>
        <View style={styles.phaseCard}>
          <Text style={styles.phaseLabel}>
            {phase === 'watch' ? '👀 WATCH THE PATTERN' : phase === 'repeat' ? '🎵 NOW REPEAT IT!' : '🎉 PERFECT!'}
          </Text>
          <Text style={styles.tipText}>{data.tip}</Text>

          {/* Sequence display */}
          <View style={styles.seqRow}>
            {data.beats.map((b, i) => (
              <Animated.View key={i} style={[styles.beatCircle, highlight === b && i === playIdx && { transform: [{ scale: pulseAnim }] }]}>
                <Text style={styles.beatEmoji}>{b}</Text>
              </Animated.View>
            ))}
          </View>

          {/* User progress */}
          {phase === 'repeat' && (
            <View style={styles.userRow}>
              {data.beats.map((_, i) => (
                <View key={i} style={[styles.userDot, i < userSeq.length && styles.userDotFilled]} />
              ))}
            </View>
          )}
        </View>

        {/* Instrument buttons */}
        {phase === 'repeat' && (
          <View style={styles.btnGrid}>
            {[...new Set(data.beats)].map((beat) => (
              <TouchableOpacity key={beat} style={styles.instrBtn} onPress={() => handleTap(beat)}>
                <LinearGradient colors={['#7B2FBE', '#4361EE']} style={styles.instrGrad}>
                  <Text style={styles.instrEmoji}>{beat}</Text>
                  <Text style={styles.instrLabel}>{INSTRUMENT_NAMES[beat]}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {phase === 'watch' && (
          <TouchableOpacity style={styles.replayBtn} onPress={playSequence}>
            <Text style={styles.replayText}>🔁 Replay Pattern</Text>
          </TouchableOpacity>
        )}

        {phase === 'result' && (
          <View style={styles.resultCard}>
            <Text style={styles.resultEmoji}>🎉</Text>
            <Text style={styles.resultTitle}>Perfect Rhythm!</Text>
            <Text style={styles.resultScore}>+50 Stars!</Text>
            <TouchableOpacity style={styles.nextBtn} onPress={goNext}>
              <LinearGradient colors={['#7B2FBE', '#4361EE']} style={styles.nextGrad}>
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
  container: { flex: 1, backgroundColor: '#F5F0FF' },
  header: { paddingTop: 55, paddingBottom: 25, paddingHorizontal: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  backText: { fontSize: 18 },
  levelTag: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.8)', letterSpacing: 1.5, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '900', color: '#FFF', marginBottom: 6 },
  scoreText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  content: { padding: 20, paddingBottom: 100 },
  phaseCard: { backgroundColor: '#FFF', borderRadius: 30, padding: 25, marginBottom: 20, elevation: 5, alignItems: 'center' },
  phaseLabel: { fontSize: 12, fontWeight: '900', color: '#7B2FBE', letterSpacing: 1.5, marginBottom: 8 },
  tipText: { fontSize: 13, color: COLORS.textMedium, textAlign: 'center', marginBottom: 20, fontWeight: '600' },
  seqRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 15 },
  beatCircle: { width: 55, height: 55, borderRadius: 28, backgroundColor: '#F0EBFF', alignItems: 'center', justifyContent: 'center', elevation: 2 },
  beatEmoji: { fontSize: 28 },
  userRow: { flexDirection: 'row', gap: 8, marginTop: 5 },
  userDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E0D0FF' },
  userDotFilled: { backgroundColor: '#7B2FBE' },
  btnGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15, marginBottom: 20 },
  instrBtn: { borderRadius: 25, overflow: 'hidden' },
  instrGrad: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center' },
  instrEmoji: { fontSize: 36 },
  instrLabel: { color: '#FFF', fontSize: 10, fontWeight: '900', marginTop: 4, textTransform: 'uppercase' },
  replayBtn: { backgroundColor: '#FFF', borderRadius: 20, padding: 15, alignItems: 'center', elevation: 2, borderWidth: 1, borderColor: '#E0D0FF' },
  replayText: { color: '#7B2FBE', fontWeight: '900', fontSize: 14 },
  resultCard: { backgroundColor: '#FFF', borderRadius: 30, padding: 30, alignItems: 'center', elevation: 5 },
  resultEmoji: { fontSize: 60, marginBottom: 10 },
  resultTitle: { fontSize: 24, fontWeight: '900', color: '#7B2FBE', marginBottom: 6 },
  resultScore: { fontSize: 16, fontWeight: '800', color: '#6BCB77', marginBottom: 20 },
  nextBtn: { width: '100%', borderRadius: 20, overflow: 'hidden' },
  nextGrad: { paddingVertical: 15, alignItems: 'center' },
  nextText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
});

export default MusicTherapyActivity;





