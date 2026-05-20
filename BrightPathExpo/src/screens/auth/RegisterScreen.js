// BrightPath - Register (Role Selector)
import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Animated,
  TouchableOpacity, StatusBar, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ROLES = [
  { role: 'parent',    emoji: '👨‍👩‍👧', title: 'Parent',    sub: "I'm a parent or guardian",  colors: ['#1A9B8B','#4ECDC4'], accent: '#E0F9F8' },
  { role: 'teacher',   emoji: '👩‍🏫', title: 'Teacher',   sub: "I'm an educator",            colors: ['#A78BFA','#7C3AED'], accent: '#EDE9FE' },
  { role: 'caregiver', emoji: '🤝',   title: 'Caregiver', sub: "I'm a therapist / caregiver", colors: ['#FB923C','#EA580C'], accent: '#FFF0E8' },
];

const RegisterScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Hero */}
      <LinearGradient colors={['#1A9B8B', '#4ECDC4', '#7EEAE4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
        <View style={s.blob1} /><View style={s.blob2} />
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Animated.View style={[s.heroContent, { opacity: fadeAnim }]}>
          <Text style={s.heroEmoji}>✨</Text>
          <Text style={s.heroTitle}>Join BrightPath</Text>
          <Text style={s.heroSub}>Select your role to begin your journey</Text>
        </Animated.View>
      </LinearGradient>

      {/* Cards */}
      <View style={s.cardsWrap}>
        <Animated.View style={[s.cards, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {ROLES.map((role) => (
            <TouchableOpacity
              key={role.role}
              style={[s.roleCard, { backgroundColor: role.accent }]}
              onPress={() => navigation.navigate('Puzzle', { role: role.role })}
              activeOpacity={0.85}
            >
              <View style={s.roleLeft}>
                <View style={[s.emojiCircle, { backgroundColor: role.colors[0] + '25' }]}>
                  <Text style={s.roleEmoji}>{role.emoji}</Text>
                </View>
                <View>
                  <Text style={s.roleTitle}>{role.title}</Text>
                  <Text style={s.roleSub}>{role.sub}</Text>
                </View>
              </View>
              <LinearGradient colors={role.colors} style={s.arrowBtn}>
                <Text style={s.arrowTxt}>›</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}

          <View style={s.divider}><View style={s.divLine} /><Text style={s.divTxt}>Already have an account?</Text><View style={s.divLine} /></View>

          <TouchableOpacity style={s.loginLink} onPress={() => navigation.navigate('Login')}>
            <Text style={s.loginLinkTxt}>Sign In Instead</Text>
          </TouchableOpacity>

          <Text style={s.secure}>🔒  Safe & secure for everyone</Text>
        </Animated.View>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4FAF8' },
  hero: { paddingTop: 55, paddingBottom: 44, paddingHorizontal: 24, overflow: 'hidden' },
  blob1: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.07)', top: -70, right: -70 },
  blob2: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -50, left: -50 },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  backIcon: { color: '#FFF', fontSize: 22, fontWeight: '900' },
  heroContent: { alignItems: 'center' },
  heroEmoji: { fontSize: 48, marginBottom: 10 },
  heroTitle: { fontSize: 32, fontWeight: '900', color: '#FFF', marginBottom: 6 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: '600', textAlign: 'center' },

  cardsWrap: { flex: 1, marginTop: -24, paddingHorizontal: 22 },
  cards: { paddingTop: 10, paddingBottom: 50 },

  roleCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 26, padding: 20, marginBottom: 16, elevation: 3 },
  roleLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  emojiCircle: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  roleEmoji: { fontSize: 32 },
  roleTitle: { fontSize: 18, fontWeight: '900', color: '#1A2B3C' },
  roleSub: { fontSize: 12, color: '#7F8C8D', fontWeight: '600', marginTop: 2 },
  arrowBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  arrowTxt: { color: '#FFF', fontSize: 24, fontWeight: '900', marginTop: -2 },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 20 },
  divLine: { flex: 1, height: 1, backgroundColor: '#D4EDE9' },
  divTxt: { fontSize: 12, color: '#7F8C8D', fontWeight: '700' },

  loginLink: { borderRadius: 22, paddingVertical: 16, alignItems: 'center', borderWidth: 2, borderColor: '#4ECDC4', marginBottom: 20 },
  loginLinkTxt: { color: '#1A9B8B', fontWeight: '900', fontSize: 15 },
  secure: { textAlign: 'center', color: '#B2BEC3', fontSize: 12, fontWeight: '700' },
});

export default RegisterScreen;





