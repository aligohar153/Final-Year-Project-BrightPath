import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/colors';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { addPoints, syncProgressToCloud } from '../../utils/progressService';

const { width } = Dimensions.get('window');

const COLOR_OPTIONS = [
  { name: 'Red', hex: '#FF6B6B', emoji: '🍎' },
  { name: 'Blue', hex: '#4D96FF', emoji: '🦋' },
  { name: 'Green', hex: '#6BCB77', emoji: '🌲' },
  { name: 'Yellow', hex: '#FFD93D', emoji: '☀️' },
];

const ColorMatchActivity = ({ navigation }) => {
  const { user } = useAuth();
  const { activeChild } = useApp();
  const [target, setTarget] = useState(COLOR_OPTIONS[0]);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('Match the Color!');

  useEffect(() => {
    generateRound();
  }, []);

  const generateRound = () => {
    const randomTarget = COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)];
    setTarget(randomTarget);
    setOptions([...COLOR_OPTIONS].sort(() => Math.random() - 0.5));
  };

  const handleSelect = async (option) => {
    if (option.hex === target.hex) {
      const newScore = score + 10;
      setScore(newScore);
      setMessage('Correct! ✨');
      setTimeout(() => {
        setMessage('Match the Color!');
        generateRound();
      }, 1000);
      if (newScore % 50 === 0) {
        const trackingId = activeChild?.id || user?.uid;
        if (trackingId) {
          await addPoints(10, trackingId);
          syncProgressToCloud(trackingId);
        }
      }
    } else {
      setMessage('Try Again! ❌');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#F5F9FF', '#FFFFFF']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.scoreText}>⭐ {score}</Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.targetCard, { borderColor: target.hex }]}>
          <Text style={[styles.targetText, { color: target.hex }]}>{target.name.toUpperCase()}</Text>
          <Text style={styles.targetEmoji}>{target.emoji}</Text>
        </View>

        <Text style={styles.message}>{message}</Text>

        <View style={styles.optionsGrid}>
          {options.map((opt, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={[styles.optionBtn, { backgroundColor: opt.hex }]}
              onPress={() => handleSelect(opt)}
            >
              <Text style={styles.optionEmoji}>{opt.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { width: 45, height: 45, borderRadius: 22, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', elevation: 3 },
  backText: { fontSize: 20 },
  scoreText: { fontSize: 20, fontWeight: '900', color: COLORS.primary },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  targetCard: { width: width - 80, height: 200, backgroundColor: '#FFF', borderRadius: 40, borderBottomWidth: 8, alignItems: 'center', justifyContent: 'center', elevation: 10, marginBottom: 40 },
  targetText: { fontSize: 40, fontWeight: '900', marginBottom: 10 },
  targetEmoji: { fontSize: 60 },
  message: { fontSize: 24, fontWeight: '800', color: COLORS.textMedium, marginBottom: 40 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20 },
  optionBtn: { width: (width - 100) / 2, height: 120, borderRadius: 30, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  optionEmoji: { fontSize: 50 },
});

export default ColorMatchActivity;





