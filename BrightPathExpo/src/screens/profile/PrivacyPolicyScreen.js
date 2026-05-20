import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { COLORS } from '../../utils/colors';

const PrivacyPolicyScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backEmoji}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Policy</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.date}>Last Updated: April 2026</Text>
        
        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.paragraph}>
          Welcome to BrightPath. We are committed to protecting your personal information and your right to privacy. This policy explains how we handle data for our young learners and their families.
        </Text>

        <Text style={styles.sectionTitle}>2. Child Safety</Text>
        <Text style={styles.paragraph}>
          BrightPath is designed with children's safety as our top priority. We do not collect personally identifiable information from children without parental consent.
        </Text>

        <Text style={styles.sectionTitle}>3. Data Collection</Text>
        <Text style={styles.paragraph}>
          We collect progress data, points, and earned badges locally on your device to provide a rewarding learning experience. If synced with our cloud services, this data is encrypted and secure.
        </Text>

        <Text style={styles.sectionTitle}>4. Your Rights</Text>
        <Text style={styles.paragraph}>
          You have the right to request access to your data, or to ask us to delete any information we have stored about your child's learning journey.
        </Text>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for trusting BrightPath.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F9FF' },
  header: { paddingTop: 60, paddingHorizontal: 25, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backBtn: { width: 45, height: 45, borderRadius: 22, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', elevation: 2 },
  backEmoji: { fontSize: 20 },
  title: { fontSize: 24, fontWeight: '900', color: COLORS.textDark, marginLeft: 15 },
  content: { padding: 25 },
  date: { fontSize: 12, color: COLORS.textLight, marginBottom: 20, fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: COLORS.primary, marginTop: 25, marginBottom: 10 },
  paragraph: { fontSize: 15, color: COLORS.textMedium, lineHeight: 24, fontWeight: '600' },
  footer: { marginTop: 40, padding: 20, backgroundColor: '#FFF', borderRadius: 20, alignItems: 'center' },
  footerText: { fontSize: 13, color: COLORS.textLight, fontWeight: '700' },
});

export default PrivacyPolicyScreen;





