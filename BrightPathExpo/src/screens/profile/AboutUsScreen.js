import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Image } from 'react-native';
import { COLORS } from '../../utils/colors';

const AboutUsScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backEmoji}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.title}>About Us</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/logo.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.appName}>BrightPath</Text>
          <Text style={styles.tagline}>Helping every star shine bright.</Text>
        </View>

        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.paragraph}>
          BrightPath was created to provide high-quality, accessible education for children with diverse learning needs. We believe that with the right tools, every child can achieve their full potential.
        </Text>

        <Text style={styles.sectionTitle}>Our Vision</Text>
        <Text style={styles.paragraph}>
          We aim to be the leading platform for assistive education, combining play with scientifically-backed learning methods to build social, cognitive, and physical skills.
        </Text>

        <Text style={styles.sectionTitle}>Join the Journey</Text>
        <Text style={styles.paragraph}>
          We are constantly expanding our curriculum and features. Thank you for being a part of our community.
        </Text>
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
  logoContainer: { alignItems: 'center', marginBottom: 30, padding: 30, backgroundColor: '#FFF', borderRadius: 40, elevation: 5 },
  logoImage: { width: 100, height: 100, marginBottom: 15 },
  appName: { fontSize: 28, fontWeight: '900', color: COLORS.primary },
  tagline: { fontSize: 14, color: COLORS.textMedium, fontWeight: '700', marginTop: 5 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: COLORS.primary, marginTop: 25, marginBottom: 10 },
  paragraph: { fontSize: 15, color: COLORS.textMedium, lineHeight: 24, fontWeight: '600' },
  footer: { marginTop: 40, padding: 20, alignItems: 'center' },
  footerText: { fontSize: 13, color: COLORS.textLight, fontWeight: '700' },
});

export default AboutUsScreen;





