import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS } from '../../utils/colors';
import { useAuth } from '../../context/AuthContext';

const RegistrationFormScreen = ({ route, navigation }) => {
  const { role } = route.params || { role: 'parent' };
  const { register } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Missing Info', 'Please fill in all fields to protect our community.');
      return;
    }
    setLoading(true);
    try {
      await register(email, password, { fullName, role });
    } catch (error) {
      Alert.alert(
        'Registration Error',
        error?.message || (typeof error === 'string' ? error : 'An unexpected error occurred.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F9FF" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backEmoji}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Details</Text>
        <Text style={styles.subtitle}>Setting up your {role} account</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.formCard, { opacity: fadeAnim }]}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>FULL NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. John Doe"
              value={fullName}
              onChangeText={setFullName}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
            <TextInput
              style={styles.input}
              placeholder="name@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a secure password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <Text style={styles.terms}>
            By signing up, you agree to our <Text style={styles.termsLink}>Terms of Service</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>

          <TouchableOpacity 
            style={styles.submitBtn} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitBtnText}>FINISH SETUP</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F9FF' },
  header: { paddingTop: 60, paddingHorizontal: 25, marginBottom: 20 },
  backBtn: { width: 45, height: 45, borderRadius: 22, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', elevation: 2, marginBottom: 20 },
  backEmoji: { fontSize: 20 },
  title: { fontSize: 32, fontWeight: '900', color: COLORS.textDark },
  subtitle: { fontSize: 16, color: COLORS.textMedium, fontWeight: '600' },
  scrollContent: { paddingHorizontal: 25, paddingBottom: 50 },
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 35,
    padding: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 11, fontWeight: '900', color: COLORS.textDark, marginBottom: 8, letterSpacing: 1 },
  input: {
    backgroundColor: '#F5F9FF',
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    color: COLORS.textDark,
    borderWidth: 1,
    borderColor: '#E0F2FF',
  },
  terms: { fontSize: 11, color: COLORS.textLight, textAlign: 'center', lineHeight: 18, marginBottom: 25, fontWeight: '600' },
  termsLink: { color: COLORS.primary, fontWeight: '800' },
  submitBtn: {
    backgroundColor: '#6BCB77',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 4,
  },
  submitBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
});

export default RegistrationFormScreen;





