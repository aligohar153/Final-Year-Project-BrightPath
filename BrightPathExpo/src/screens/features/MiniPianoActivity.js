import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, StatusBar, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/colors';
import { playLocalSound, PIANO_SOUND_FILES } from '../../utils/SoundService';

const { width } = Dimensions.get('window');

const PIANO_KEYS = [
  { note: 'Do', color: '#FF6B6B' },
  { note: 'Re', color: '#4D96FF' },
  { note: 'Mi', color: '#6BCB77' },
  { note: 'Fa', color: '#FFD93D' },
  { note: 'Sol', color: '#FF9F1C' },
  { note: 'La', color: '#7B2FBE' },
  { note: 'Ti', color: '#FF6BB5' },
];

const MiniPianoActivity = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  const playNoteHandler = (note) => {
    const fileName = PIANO_SOUND_FILES[note];
    if (fileName) playLocalSound(fileName);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#F5F9FF', '#FFFFFF']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mini Piano</Text>
      </View>

      <View style={styles.pianoBody}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pianoScroll}>
          {PIANO_KEYS.map((key, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={[styles.whiteKey, { borderBottomColor: key.color }]} 
              onPress={() => playNoteHandler(key.note)}
              activeOpacity={0.7}
            >
              <View style={[styles.keyIndicator, { backgroundColor: key.color }]} />
              <Text style={styles.noteText}>{key.note}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.instructionCard}>
        <Text style={styles.instructionEmoji}>🎵</Text>
        <Text style={styles.instructionText}>Tap the keys to play music!</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 25, flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
  backBtn: { width: 45, height: 45, borderRadius: 22, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', elevation: 3 },
  backText: { fontSize: 20 },
  title: { fontSize: 28, fontWeight: '900', color: COLORS.textDark, marginLeft: 20 },
  pianoBody: { height: 350, backgroundColor: '#1A0533', paddingVertical: 30, elevation: 10 },
  pianoScroll: { paddingHorizontal: 20 },
  whiteKey: { width: 80, height: '100%', backgroundColor: '#FFF', marginRight: 10, borderRadius: 15, borderBottomWidth: 10, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 20 },
  keyIndicator: { width: 20, height: 20, borderRadius: 10, marginBottom: 10 },
  noteText: { fontSize: 18, fontWeight: '900', color: COLORS.textDark },
  instructionCard: { margin: 30, backgroundColor: '#FFF', borderRadius: 30, padding: 30, alignItems: 'center', elevation: 5 },
  instructionEmoji: { fontSize: 40, marginBottom: 10 },
  instructionText: { fontSize: 18, fontWeight: '800', color: COLORS.textMedium, textAlign: 'center' },
});

export default MiniPianoActivity;





