import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Linking } from 'react-native';
import { COLORS } from '../../utils/colors';

const ContactUsScreen = ({ navigation }) => {
  const emailAddress = '2022ag7776@uaf.edu.pk';
  const phoneNumber = '+92 (0309) 702 653';

  const handleEmail = () => {
    Linking.openURL(`mailto:${emailAddress}`);
  };

  const handleCall = () => {
    Linking.openURL(`tel:${phoneNumber.replace(/[\s()]/g, '')}`);
  };

  const handleWebsite = () => {
    Linking.openURL('https://www.brightpath.app');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backEmoji}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Contact Us</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>Have questions or feedback? We'd love to hear from you!</Text>
        
        <TouchableOpacity style={styles.contactCard} onPress={handleEmail} activeOpacity={0.8}>
          <Text style={styles.contactEmoji}>📧</Text>
          <Text style={styles.contactLabel}>Email Us</Text>
          <Text style={styles.contactValue}>{emailAddress}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactCard} onPress={handleCall} activeOpacity={0.8}>
          <Text style={styles.contactEmoji}>📞</Text>
          <Text style={styles.contactLabel}>Call Us</Text>
          <Text style={styles.contactValue}>{phoneNumber}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactCard} onPress={handleWebsite} activeOpacity={0.8}>
          <Text style={styles.contactEmoji}>🌐</Text>
          <Text style={styles.contactLabel}>Website</Text>
          <Text style={styles.contactValue}>www.brightpath.app</Text>
        </TouchableOpacity>

        <View style={styles.formNote}>
          <Text style={styles.noteTitle}>Direct Message</Text>
          <Text style={styles.noteText}>Our team typically responds within 24 hours on business days.</Text>
        </View>

        <TouchableOpacity style={styles.emailBtn} onPress={handleEmail} activeOpacity={0.8}>
          <Text style={styles.emailBtnText}>Send an Email Now</Text>
        </TouchableOpacity>
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
  intro: { fontSize: 16, color: COLORS.textMedium, fontWeight: '600', marginBottom: 30, textAlign: 'center' },
  contactCard: { backgroundColor: '#FFF', borderRadius: 30, padding: 25, alignItems: 'center', marginBottom: 20, elevation: 3 },
  contactEmoji: { fontSize: 35, marginBottom: 10 },
  contactLabel: { fontSize: 12, fontWeight: '800', color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 1 },
  contactValue: { fontSize: 18, fontWeight: '900', color: COLORS.textDark, marginTop: 5 },
  formNote: { marginTop: 20, alignItems: 'center', paddingHorizontal: 20 },
  noteTitle: { fontSize: 16, fontWeight: '900', color: COLORS.primary, marginBottom: 8 },
  noteText: { fontSize: 13, color: COLORS.textLight, textAlign: 'center', fontWeight: '600' },
  emailBtn: { marginTop: 40, backgroundColor: COLORS.primary, paddingVertical: 20, borderRadius: 25, alignItems: 'center', elevation: 5 },
  emailBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
});

export default ContactUsScreen;





