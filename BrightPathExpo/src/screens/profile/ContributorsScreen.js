import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Linking, Animated } from 'react-native';
import { COLORS } from '../../utils/colors';

const CONTRIBUTORS = [
  {
    id: '1',
    name: 'M. Abaid Ullah',
    role: 'Educational Psychologist & Behavior Analyst',
    color: '#4D96FF',
    initials: 'AU',
    contacts: [
      { type: 'phone', value: '+92 300 4005673', display: '+92 300 4005673' },
      { type: 'email', value: 'abaidkamoka@gmail.com', display: 'abaidkamoka@gmail.com' }
    ],
    addresses: [
      'ABA Center, 194, Gulberg A-Block Faisalabad',
      'Canal Branch, 459, C-Block Amin Town, Faisalabad'
    ]
  },
  {
    id: '2',
    name: 'Miss Rabia',
    role: 'Principal, EFA School System',
    color: '#6BCB77',
    initials: 'MR',
    contacts: [
      { type: 'phone', value: '+92 300 1401454', display: '+92 300 1401454' },
      { type: 'email', value: 'efaschool28@gmail.com', display: 'efaschool28@gmail.com' }
    ],
    addresses: [
      '165-Ladhana, Layyah'
    ]
  },
  {
    id: '3',
    name: 'Ms. Rubat',
    role: 'Certified Caregiver, ECE',
    color: '#FF6BB5',
    initials: 'MR',
    contacts: [
      { type: 'phone', value: '+92 302 6987357', display: '+92 302 6987357' }
    ],
    addresses: [
      'Govt Higher Secondary School Ladhana, Layyah'
    ]
  }
];

const ContributorsScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleContactPress = (type, value) => {
    if (type === 'phone') {
      Linking.openURL(`tel:${value.replace(/\s+/g, '')}`);
    } else if (type === 'email') {
      Linking.openURL(`mailto:${value}`);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backEmoji}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Contributors</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Meet the professional educators and behavior analysts who supported the development of BrightPath's learning curriculum.
        </Text>

        <Animated.View style={{ opacity: fadeAnim }}>
          {CONTRIBUTORS.map(c => (
            <View key={c.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.avatarCircle, { backgroundColor: c.color + '15' }]}>
                  <Text style={[styles.avatarText, { color: c.color }]}>{c.initials}</Text>
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.name}>{c.name}</Text>
                  <View style={[styles.roleTag, { backgroundColor: c.color + '12' }]}>
                    <Text style={[styles.roleText, { color: c.color }]}>{c.role}</Text>
                  </View>
                </View>
              </View>

              {c.addresses && c.addresses.map((addr, idx) => (
                <View key={idx} style={styles.detailRow}>
                  <Text style={styles.icon}>📍</Text>
                  <Text style={styles.detailText}>{addr}</Text>
                </View>
              ))}

              {c.contacts.map((contact, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={styles.detailRow}
                  onPress={() => handleContactPress(contact.type, contact.value)}
                >
                  <Text style={styles.icon}>{contact.type === 'phone' ? '📞' : '📧'}</Text>
                  <Text style={[styles.detailText, styles.linkText]}>{contact.display}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F9FF' },
  header: { paddingTop: 60, paddingHorizontal: 25, flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  backBtn: { width: 45, height: 45, borderRadius: 22, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', elevation: 2 },
  backEmoji: { fontSize: 20 },
  title: { fontSize: 24, fontWeight: '900', color: COLORS.textDark, marginLeft: 15 },
  scrollContent: { paddingHorizontal: 25, paddingBottom: 50 },
  subtitle: { fontSize: 14, color: COLORS.textMedium, fontWeight: '600', lineHeight: 22, marginBottom: 25 },
  card: { backgroundColor: '#FFF', borderRadius: 28, padding: 22, marginBottom: 20, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  avatarCircle: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 22, fontWeight: '900' },
  headerText: { flex: 1, marginLeft: 15 },
  name: { fontSize: 18, fontWeight: '900', color: COLORS.textDark },
  roleTag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginTop: 5 },
  roleText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 12, paddingHorizontal: 5 },
  icon: { fontSize: 16, marginRight: 12, marginTop: 2 },
  detailText: { flex: 1, fontSize: 13, color: COLORS.textMedium, fontWeight: '600', lineHeight: 20 },
  linkText: { color: COLORS.primary, fontWeight: '700' }
});

export default ContributorsScreen;





