// BrightPath - Custom Content Upload Screen (Sprint 7)
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, Alert, TextInput, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { uploadContent, getChildContent } from '../../firebase/firestoreService';
import { useApp } from '../../context/AppContext';
import { COLORS } from '../../utils/colors';

const CustomContentScreen = ({ navigation }) => {
  const { activeChild } = useApp();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [contentName, setContentName] = useState('');
  const [activeTab, setActiveTab] = useState('gallery'); // gallery | upload

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    loadContent();
  }, []);

  const loadContent = async () => {
    if (!activeChild?.id) return;
    setLoading(true);
    const result = await getChildContent(activeChild.id);
    if (result.success) setContent(result.content);
    setLoading(false);
  };

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'Permission to access gallery is required.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        handleUpload(asset.uri, 'image', asset.fileName || 'photo.jpg');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'Permission to access camera is required.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        handleUpload(asset.uri, 'image', `photo_${Date.now()}.jpg`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture image');
    }
  };

  const handleUpload = async (uri, type, fileName) => {
    if (!activeChild?.id) {
      Alert.alert('No Child Selected', 'Please select a child profile first.');
      return;
    }
    setUploading(true);
    const name = contentName.trim() || fileName;
    const result = await uploadContent(activeChild.id, uri, type, name);
    setUploading(false);

    if (result.success) {
      Alert.alert('✅ Uploaded!', 'Content uploaded successfully!');
      setContentName('');
      loadContent();
    } else {
      Alert.alert('Upload Failed', result.error || 'Please check your connection.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#FFFFFF', '#FDFBFF', '#F5EDFF']} style={StyleSheet.absoluteFill} />

      <View style={styles.layout}>
        {/* Left Panel */}
        <Animated.View style={[styles.leftPanel, { opacity: fadeAnim }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Home</Text>
          </TouchableOpacity>

          <Text style={styles.screenTitle}>📷 My Content</Text>
          <Text style={styles.screenSubtitle}>
            {activeChild ? `${activeChild.name}'s Gallery` : 'Personal Gallery'}
          </Text>

          {/* Stats */}
          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <Text style={styles.statEmoji}>📸</Text>
              <Text style={styles.statValue}>{content.filter(c => c.type === 'image').length}</Text>
              <Text style={styles.statLabel}>Photos</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statEmoji}>🎙️</Text>
              <Text style={styles.statValue}>{content.filter(c => c.type === 'audio').length}</Text>
              <Text style={styles.statLabel}>Recordings</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'gallery' && styles.tabActive]}
              onPress={() => setActiveTab('gallery')}>
              <Text style={styles.tabText}>🖼️ Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'upload' && styles.tabActive]}
              onPress={() => setActiveTab('upload')}>
              <Text style={styles.tabText}>⬆️ Upload</Text>
            </TouchableOpacity>
          </View>

          {/* About */}
          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>💡 What is this?</Text>
            <Text style={styles.aboutText}>
              Upload personal photos and voice recordings to create custom learning materials for {activeChild?.name || 'your child'}.
            </Text>
          </View>
        </Animated.View>

        {/* Right Panel */}
        <View style={styles.rightPanel}>
          {activeTab === 'upload' ? (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.uploadContent}>
              <Text style={styles.uploadTitle}>Upload New Content</Text>
              <Text style={styles.uploadSubtitle}>Add photos or recordings to personalize learning</Text>

              <TextInput
                style={styles.nameInput}
                placeholder="Give this content a name..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={contentName}
                onChangeText={setContentName}
              />

              <View style={styles.uploadOptions}>
                <TouchableOpacity style={styles.uploadCard} onPress={handlePickImage} disabled={uploading}>
                  <LinearGradient colors={['#FF9F1C', '#FFD93D']} style={styles.uploadCardGrad}>
                    <Text style={styles.uploadCardEmoji}>🖼️</Text>
                    <Text style={styles.uploadCardTitle}>Photo Library</Text>
                    <Text style={styles.uploadCardSubtitle}>Pick from gallery</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.uploadCard} onPress={handleCamera} disabled={uploading}>
                  <LinearGradient colors={['#FF6B6B', '#FF9F1C']} style={styles.uploadCardGrad}>
                    <Text style={styles.uploadCardEmoji}>📷</Text>
                    <Text style={styles.uploadCardTitle}>Camera</Text>
                    <Text style={styles.uploadCardSubtitle}>Take a new photo</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.uploadCard}
                  onPress={() => Alert.alert('🎤 Voice Recording', 'Voice recording feature coming soon!')}
                  disabled={uploading}>
                  <LinearGradient colors={['#7B2FBE', '#FF6BB5']} style={styles.uploadCardGrad}>
                    <Text style={styles.uploadCardEmoji}>🎙️</Text>
                    <Text style={styles.uploadCardTitle}>Voice Recording</Text>
                    <Text style={styles.uploadCardSubtitle}>Record your voice</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {uploading && (
                <View style={styles.uploadingBanner}>
                  <Text style={styles.uploadingText}>⬆️ Uploading...</Text>
                </View>
              )}
            </ScrollView>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.galleryContent}>
              <Text style={styles.galleryTitle}>
                {content.length > 0 ? `📁 ${content.length} items` : 'Your Gallery'}
              </Text>

              {loading && (
                <Text style={styles.loadingText}>⏳ Loading content...</Text>
              )}

              {!loading && content.length === 0 && (
                <View style={styles.emptyGallery}>
                  <Text style={styles.emptyEmoji}>🖼️</Text>
                  <Text style={styles.emptyTitle}>No Content Yet</Text>
                  <Text style={styles.emptySubtitle}>
                    Switch to the Upload tab to add photos and recordings!
                  </Text>
                  <TouchableOpacity style={styles.goUploadBtn} onPress={() => setActiveTab('upload')}>
                    <Text style={styles.goUploadText}>Go to Upload ⬆️</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.galleryGrid}>
                {content.map((item) => (
                  <View key={item.id} style={styles.galleryItem}>
                    <View style={styles.galleryItemPreview}>
                      <Text style={styles.galleryItemEmoji}>
                        {item.type === 'image' ? '🖼️' : '🎙️'}
                      </Text>
                    </View>
                    <Text style={styles.galleryItemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.galleryItemType}>{item.type}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  layout: { flex: 1, flexDirection: 'column', paddingTop: StatusBar.currentHeight || 0 },
  leftPanel: { padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: 6, marginBottom: 10 },
  backText: { color: COLORS.textMedium, fontSize: 13, fontWeight: '600' },
  screenTitle: { fontSize: 20, fontWeight: '900', color: COLORS.primary, marginBottom: 2 },
  screenSubtitle: { fontSize: 11, color: COLORS.textMedium, marginBottom: 12 },
  statsCard: { backgroundColor: '#F8F3FF', borderRadius: 14, padding: 12, marginBottom: 12, borderWidth: 1.5, borderColor: '#E6DAF5' },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  statEmoji: { fontSize: 16 },
  statValue: { fontSize: 18, fontWeight: '900', color: COLORS.textDark },
  statLabel: { fontSize: 11, color: COLORS.textMedium, fontWeight: '600' },
  tabRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  tab: { flex: 1, padding: 8, borderRadius: 10, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.cardBg },
  tabActive: { backgroundColor: '#F8F3FF', borderColor: COLORS.primary },
  tabText: { color: COLORS.textDark, fontSize: 11, fontWeight: '700' },
  aboutCard: { backgroundColor: '#F8F3FF', borderRadius: 12, padding: 12, borderWidth: 1.5, borderColor: COLORS.border },
  aboutTitle: { color: COLORS.secondary, fontWeight: '800', fontSize: 12, marginBottom: 6 },
  aboutText: { color: COLORS.textMedium, fontSize: 10, lineHeight: 15, fontWeight: '600' },
  rightPanel: { flex: 1 },
  uploadContent: { padding: 16 },
  uploadTitle: { fontSize: 20, fontWeight: '900', color: COLORS.textDark, marginBottom: 4 },
  uploadSubtitle: { color: COLORS.textMedium, fontSize: 12, marginBottom: 16 },
  nameInput: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, color: COLORS.textDark, fontSize: 14, marginBottom: 16, borderWidth: 1.5, borderColor: COLORS.border },
  uploadOptions: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  uploadCard: { borderRadius: 20, overflow: 'hidden', elevation: 6, flex: 1, minWidth: 120 },
  uploadCardGrad: { padding: 20, alignItems: 'center', minHeight: 120, justifyContent: 'center' },
  uploadCardEmoji: { fontSize: 36, marginBottom: 8 },
  uploadCardTitle: { color: COLORS.textWhite, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  uploadCardSubtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 10, textAlign: 'center', marginTop: 4 },
  uploadingBanner: { backgroundColor: 'rgba(255,217,61,0.2)', borderRadius: 12, padding: 14, marginTop: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.yellow },
  uploadingText: { color: COLORS.yellow, fontWeight: '700', fontSize: 14 },
  galleryContent: { padding: 16 },
  galleryTitle: { fontSize: 18, fontWeight: '900', color: COLORS.textDark, marginBottom: 14 },
  loadingText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, textAlign: 'center', padding: 20 },
  emptyGallery: { alignItems: 'center', padding: 30 },
  emptyEmoji: { fontSize: 60, marginBottom: 14 },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: COLORS.textDark, marginBottom: 6 },
  emptySubtitle: { color: COLORS.textMedium, fontSize: 12, textAlign: 'center', lineHeight: 18, marginBottom: 16 },
  goUploadBtn: { backgroundColor: COLORS.secondary, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
  goUploadText: { color: COLORS.textWhite, fontWeight: '700', fontSize: 14 },
  galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  galleryItem: { width: 90, alignItems: 'center' },
  galleryItemPreview: { width: 80, height: 80, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginBottom: 4, borderWidth: 1.5, borderColor: COLORS.border },
  galleryItemEmoji: { fontSize: 32 },
  galleryItemName: { color: COLORS.textDark, fontSize: 10, fontWeight: '700', textAlign: 'center' },
  galleryItemType: { color: COLORS.textLight, fontSize: 9, textTransform: 'uppercase', fontWeight: '600' },
});

export default CustomContentScreen;





