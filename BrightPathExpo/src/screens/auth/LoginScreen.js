import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Animated, StatusBar, ScrollView, Dimensions, ActivityIndicator, Alert, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -12, duration: 2800, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('BrightPath', 'Please enter your email and password.'); return;
    }
    setLoading(true);
    try { await login(email, password); }
    catch (e) {
      Alert.alert(
        'Login Failed',
        e?.message || (typeof e === 'string' ? e : 'An unexpected error occurred.')
      );
    }
    finally { setLoading(false); }
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Hero */}
      <LinearGradient colors={['#1A9B8B', '#4ECDC4', '#7EEAE4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
        <View style={s.blob1} /><View style={s.blob2} />

        <Animated.View style={[s.floatEmoji, { transform: [{ translateY: floatAnim }] }]}>
          <Text style={{ fontSize: 48 }}>🌟</Text>
        </Animated.View>

        <Animated.View style={[s.heroInner, { opacity: fadeAnim }]}>
          <View style={s.logoCircle}>
            <Image source={require('../../../assets/logo.png')} style={s.logoImg} resizeMode="contain" />
          </View>
          <Text style={s.heroSub}>WELCOME TO</Text>
          <Text style={s.heroTitle}>BrightPath</Text>
          <Text style={s.heroTagline}>Nurturing potential, together.</Text>
        </Animated.View>
      </LinearGradient>

      {/* Card */}
      <View style={s.cardWrap}>
        <ScrollView contentContainerStyle={s.scroll} bounces={false} keyboardShouldPersistTaps="handled">
          <Animated.View style={[s.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={s.cardTitle}>Sign In</Text>
            <View style={s.underline} />

            {/* Email */}
            <Text style={s.label}>EMAIL</Text>
            <View style={s.inputRow}>
              <Text style={s.inputIcon}>📧</Text>
              <TextInput
                style={s.input}
                placeholder="parent@example.com"
                placeholderTextColor="#A0AEC0"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* Password */}
            <Text style={s.label}>PASSWORD</Text>
            <View style={s.inputRow}>
              <Text style={s.inputIcon}>🔒</Text>
              <TextInput
                style={s.input}
                placeholder="Your secure password"
                placeholderTextColor="#A0AEC0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                <Text style={{ fontSize: 18 }}>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>



            <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.9}>
              <LinearGradient colors={['#1A9B8B', '#4ECDC4']} style={s.loginBtn}>
                {loading
                  ? <ActivityIndicator color="#FFF" />
                  : <Text style={s.loginBtnTxt}>Sign In  →</Text>}
              </LinearGradient>
            </TouchableOpacity>

            <View style={s.registerRow}>
              <Text style={s.registerTxt}>New to BrightPath? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={s.registerLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4FAF8' },
  hero: { height: height * 0.44, paddingTop: 60, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  blob1: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(255,255,255,0.07)', top: -80, right: -60 },
  blob2: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -50, left: -50 },
  floatEmoji: { position: 'absolute', right: 45, top: 75 },
  heroInner: { alignItems: 'center' },
  logoCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)', overflow: 'hidden' },
  logoImg: { width: '88%', height: '88%' },
  heroSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '900', letterSpacing: 3, marginBottom: 4 },
  heroTitle: { color: '#FFF', fontSize: 46, fontWeight: '900', letterSpacing: -1 },
  heroTagline: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600', marginTop: 6 },

  cardWrap: { flex: 1, marginTop: -36 },
  scroll: { paddingHorizontal: 22, paddingBottom: 40 },
  card: { backgroundColor: '#FFF', borderRadius: 36, padding: 32, elevation: 18, shadowColor: '#4ECDC4', shadowOpacity: 0.15, shadowRadius: 25 },
  cardTitle: { fontSize: 28, fontWeight: '900', color: '#1A2B3C' },
  underline: { width: 44, height: 5, backgroundColor: '#4ECDC4', borderRadius: 3, marginTop: 8, marginBottom: 28 },
  label: { fontSize: 10, fontWeight: '900', color: '#7F8C8D', letterSpacing: 1.5, marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4FAF8', borderRadius: 18, paddingHorizontal: 16, marginBottom: 20, borderWidth: 1.5, borderColor: '#D4F0EC' },
  inputIcon: { fontSize: 18, marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, fontSize: 15, color: '#1A2B3C', fontWeight: '600' },
  forgotRow: { alignSelf: 'flex-end', marginBottom: 26 },
  forgotTxt: { color: '#4ECDC4', fontWeight: '800', fontSize: 13 },
  loginBtn: { borderRadius: 22, paddingVertical: 17, alignItems: 'center', elevation: 6, shadowColor: '#4ECDC4', shadowOpacity: 0.4, shadowRadius: 12 },
  loginBtnTxt: { color: '#FFF', fontWeight: '900', fontSize: 16, letterSpacing: 0.5 },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  registerTxt: { color: '#7F8C8D', fontSize: 14, fontWeight: '600' },
  registerLink: { color: '#1A9B8B', fontSize: 14, fontWeight: '900' },
});

export default LoginScreen;





