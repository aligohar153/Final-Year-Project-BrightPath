import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  StatusBar, Dimensions, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { changePassword } from '../../firebase/authService';

const { width } = Dimensions.get('window');

const ChangePasswordScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const result = await changePassword(user.uid, currentPassword, newPassword);
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Password has been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert('Error', result.error || 'Failed to update password.');
    }
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4FAF8" />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>⬅️</Text>
        </TouchableOpacity>
        <Text style={s.title}>Change Password</Text>
      </View>

      <View style={s.form}>
        <Text style={s.label}>CURRENT PASSWORD</Text>
        <View style={s.inputRow}>
          <Text style={s.inputIcon}>🔒</Text>
          <TextInput
            style={s.input}
            placeholder="Enter current password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry={!showPass}
          />
          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            <Text style={{ fontSize: 18 }}>{showPass ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.label}>NEW PASSWORD</Text>
        <View style={s.inputRow}>
          <Text style={s.inputIcon}>🔑</Text>
          <TextInput
            style={s.input}
            placeholder="Enter new password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showPass}
          />
        </View>

        <Text style={s.label}>CONFIRM NEW PASSWORD</Text>
        <View style={s.inputRow}>
          <Text style={s.inputIcon}>✅</Text>
          <TextInput
            style={s.input}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPass}
          />
        </View>

        <TouchableOpacity onPress={handleUpdate} disabled={loading} activeOpacity={0.9} style={{ marginTop: 20 }}>
          <LinearGradient colors={['#1A9B8B', '#4ECDC4']} style={s.btn}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={s.btnTxt}>Update Password</Text>}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4FAF8' },
  header: { paddingTop: 60, paddingHorizontal: 25, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backBtn: { width: 45, height: 45, borderRadius: 22, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', elevation: 3 },
  backText: { fontSize: 20 },
  title: { fontSize: 28, fontWeight: '900', color: '#1A2B3C', marginLeft: 20 },
  form: { paddingHorizontal: 25 },
  label: { fontSize: 10, fontWeight: '900', color: '#7F8C8D', letterSpacing: 1.5, marginBottom: 8, marginTop: 10 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 18, paddingHorizontal: 16, marginBottom: 15, borderWidth: 1.5, borderColor: '#D4F0EC', elevation: 1 },
  inputIcon: { fontSize: 18, marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, fontSize: 15, color: '#1A2B3C', fontWeight: '600' },
  btn: { borderRadius: 22, paddingVertical: 17, alignItems: 'center', elevation: 6, shadowColor: '#4ECDC4', shadowOpacity: 0.4, shadowRadius: 12 },
  btnTxt: { color: '#FFF', fontWeight: '900', fontSize: 16, letterSpacing: 0.5 },
});

export default ChangePasswordScreen;
