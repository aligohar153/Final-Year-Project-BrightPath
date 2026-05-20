import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/colors';
import { playLocalSound } from '../../utils/SoundService';

const { width } = Dimensions.get('window');

const DRUM_PADS = [
  { id: 'kick', name: 'KICK', color: '#FF6B6B', file: 'drum_kick' },
  { id: 'snare', name: 'SNARE', color: '#4D96FF', file: 'drum_snare' },
  { id: 'hihat', name: 'HI-HAT', color: '#6BCB77', file: 'drum_hihat' },
  { id: 'clap', name: 'CLAP', color: '#FFD93D', file: 'drum_clap' },
  { id: 'boom', name: 'BOOM', color: '#FF9F1C', file: 'drum_boom' },
];

const DrumKitActivity = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  const hitDrum = (fileName) => {
    console.log(`[DrumKit] Hitting drum: ${fileName}`);
    playLocalSound(fileName, 'wav');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#F5F9FF', '#FFFFFF']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Drum Kit</Text>
      </View>

      <Animated.View style={[styles.padContainer, { opacity: fadeAnim }]}>
        <View style={styles.grid}>
          {DRUM_PADS.map((pad) => (
            <TouchableOpacity 
              key={pad.id} 
              style={[styles.drumPad, { backgroundColor: pad.color }]} 
              onPress={() => hitDrum(pad.file)}
              activeOpacity={0.7}
            >
              <Text style={styles.padName}>{pad.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      <View style={styles.instructionCard}>
        <Text style={styles.instructionEmoji}>🥁</Text>
        <Text style={styles.instructionText}>Tap the pads to create a beat!</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 25, flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  backBtn: { width: 45, height: 45, borderRadius: 22, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', elevation: 3 },
  backText: { fontSize: 20 },
  title: { fontSize: 28, fontWeight: '900', color: COLORS.textDark, marginLeft: 20 },
  padContainer: { paddingHorizontal: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20 },
  drumPad: { width: (width - 80) / 2, height: (width - 80) / 2, borderRadius: 30, alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
  padName: { color: '#FFF', fontWeight: '900', fontSize: 18, letterSpacing: 1 },
  instructionCard: { margin: 30, backgroundColor: '#FFF', borderRadius: 30, padding: 30, alignItems: 'center', elevation: 5 },
  instructionEmoji: { fontSize: 40, marginBottom: 10 },
  instructionText: { fontSize: 18, fontWeight: '800', color: COLORS.textMedium, textAlign: 'center' },
});

export default DrumKitActivity;





