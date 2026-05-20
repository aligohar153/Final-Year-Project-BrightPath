import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  StatusBar,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/colors';
import { resetPassword } from '../../firebase/authService';

const { width } = Dimensions.get('window');

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  const handleReset = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      Alert.alert('BrightPath', 'Please enter your email to receive the reset link.');
      return;
    }
    setLoading(true);
    const result = await resetPassword(cleanEmail);
    setLoading(false);

    if (result.success) {
      Alert.alert(
        'Email Sent! 📧',
        'A password reset link has been sent to your email address. Please check your inbox (and spam folder).',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#F5F9FF', '#FFFFFF']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backEmoji}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Enter your email and we'll send you a recovery link.</Text>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
            <View style={styles.inputField}>
              <Text style={styles.inputEmoji}>📧</Text>
              <TextInput
                style={styles.input}
                placeholder="parent@example.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.resetBtn} 
            onPress={handleReset}
            disabled={loading}
          >
            <LinearGradient colors={['#4D96FF', '#6BCB77']} style={styles.btnGrad}>
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.resetBtnText}>SEND RESET LINK</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.helpBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.helpText}>Back to Login</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 30, marginBottom: 40 },
  backBtn: { width: 45, height: 45, borderRadius: 22, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', elevation: 4, marginBottom: 25 },
  backEmoji: { fontSize: 20 },
  title: { fontSize: 32, fontWeight: '900', color: COLORS.textDark, marginBottom: 10 },
  subtitle: { fontSize: 16, color: COLORS.textDark, fontWeight: '600', lineHeight: 22 },
  content: { paddingHorizontal: 30 },
  card: { backgroundColor: '#FFF', borderRadius: 35, padding: 30, elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20 },
  inputGroup: { marginBottom: 30 },
  inputLabel: { fontSize: 11, fontWeight: '900', color: COLORS.textDark, marginBottom: 10, letterSpacing: 1 },
  inputField: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F9FF', borderRadius: 20, paddingHorizontal: 15, borderWidth: 1, borderColor: '#E0F2FF' },
  inputEmoji: { fontSize: 18, marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, fontSize: 16, color: COLORS.textDark, fontWeight: '600' },
  resetBtn: { borderRadius: 20, overflow: 'hidden', elevation: 6 },
  btnGrad: { paddingVertical: 20, alignItems: 'center' },
  resetBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
  helpBtn: { marginTop: 40, alignItems: 'center' },
  helpText: { color: COLORS.primary, fontWeight: '800', fontSize: 14 },
});

export default ForgotPasswordScreen;





