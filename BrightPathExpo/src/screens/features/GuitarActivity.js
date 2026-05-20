import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/colors';
import { playLocalSound, GUITAR_SOUND_FILES } from '../../utils/SoundService';

const { width } = Dimensions.get('window');

const GUITAR_STRINGS = [
  { note: 'E Chord', color: '#FF6B6B', label: 'E' },
  { note: 'A Chord', color: '#4D96FF', label: 'A' },
  { note: 'D Chord', color: '#6BCB77', label: 'D' },
  { note: 'G Chord', color: '#FFD93D', label: 'G' },
  { note: 'B Chord', color: '#FF9F1C', label: 'B' },
  { note: 'e Chord', color: '#7B2FBE', label: 'e' },
];

const GuitarActivity = ({ navigation }) => {
  const playString = (note) => {
    const key = note.split(' ')[0]; // Get 'E' or 'A' or 'e'
    const fileName = GUITAR_SOUND_FILES[key];
    console.log(`[Guitar] Strumming: ${note}, Key: ${key}, File: ${fileName}`);
    if (fileName) {
      playLocalSound(fileName);
    } else {
      console.warn(`[Guitar] No sound mapping found for key: ${key}`);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#4A1E1E', '#1A0533']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mini Guitar</Text>
      </View>

      <View style={styles.guitarBody}>
        {GUITAR_STRINGS.map((string, idx) => (
          <TouchableOpacity 
            key={idx} 
            style={styles.stringContainer} 
            onPress={() => playString(string.note)}
            activeOpacity={0.6}
          >
            <View style={[styles.string, { backgroundColor: string.color }]} />
            <View style={styles.fret}>
              <Text style={styles.stringLabel}>{string.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Strum the strings to play chords! 🎸</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 25, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backBtn: { width: 45, height: 45, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 20, color: '#FFF' },
  title: { fontSize: 28, fontWeight: '900', color: '#FFF', marginLeft: 20 },
  guitarBody: { flex: 1, paddingHorizontal: 20, justifyContent: 'center' },
  stringContainer: { height: 60, flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  string: { flex: 1, height: 4, borderRadius: 2, shadowColor: '#FFF', shadowOpacity: 0.5, shadowRadius: 5 },
  fret: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginLeft: 15 },
  stringLabel: { color: '#FFF', fontWeight: '900', fontSize: 16 },
  footer: { padding: 40, alignItems: 'center' },
  footerText: { color: 'rgba(255,255,255,0.7)', fontSize: 16, fontWeight: '700' },
});

export default GuitarActivity;





