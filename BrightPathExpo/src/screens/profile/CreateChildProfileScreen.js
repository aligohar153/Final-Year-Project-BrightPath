// BrightPath - Create / Edit Child Profile Screen
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createChildProfile, updateChildProfile } from '../../firebase/firestoreService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import { COLORS } from '../../utils/colors';
import { AUTISM_LEVELS, GENDER_OPTIONS, FEATURES } from '../../utils/constants';

const CreateChildProfileScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const { setActiveChild, setChildren } = useApp();
  const editChild = route.params?.editChild;
  const isEditing = !!editChild;

  const [name, setName] = useState(editChild?.name || '');
  const [age, setAge] = useState(editChild?.age ? String(editChild.age) : '');
  const [gender, setGender] = useState(editChild?.gender || '');
  const [autismLevel, setAutismLevel] = useState(editChild?.autismLevel || null);
  const [className, setClassName] = useState(editChild?.className || '');
  const [selectedFeatures, setSelectedFeatures] = useState(
    editChild?.selectedFeatures || []
  );
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  // Auto-populate features when level is selected
  useEffect(() => {
    if (autismLevel) {
      const levelKey = `LEVEL_${autismLevel}`;
      const levelConfig = AUTISM_LEVELS[levelKey];
      if (levelConfig) {
        setSelectedFeatures(levelConfig.features);
      }
    }
  }, [autismLevel]);

  const toggleFeature = (featureId) => {
    setSelectedFeatures(prev =>
      prev.includes(featureId)
        ? prev.filter(f => f !== featureId)
        : [...prev, featureId]
    );
  };

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!age || isNaN(age) || Number(age) < 1 || Number(age) > 18) {
      errs.age = 'Please enter a valid age (1-18)';
    }
    if (!gender) errs.gender = 'Please select a gender';
    if (!autismLevel) errs.autismLevel = 'Please select a support level';
    if (user?.role === 'teacher' && !className.trim()) {
      errs.className = 'Class Name is required for teachers';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    setSaveSuccess(false);

    const childData = {
      name: name.trim(),
      age: Number(age),
      gender,
      autismLevel,
      selectedFeatures,
      className: user?.role === 'teacher' ? className.trim() : null,
      updatedAt: new Date().toISOString(),
    };

    try {
      console.log('Starting save operation...', childData);
      let result;
      if (isEditing) {
        result = await updateChildProfile(editChild.id, childData);
        if (result.success) {
          setActiveChild({ ...editChild, ...childData });
        }
      } else {
        result = await createChildProfile(user.uid, childData);
        if (result.success || result.offline) {
          const newId = result.id || `temp_${Date.now()}`;
          const newChild = { id: newId, parentUid: user.uid, ...childData };
          setActiveChild(newChild);
          setChildren(prev => [...prev, newChild]);
        }
      }

      console.log('Save result:', result);
      setLoading(false);

      if (result.success || result.offline) {
        setSaveSuccess(true);
        // Instant feedback and move to dashboard
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
          });
        }, 800);
      } else {
        Alert.alert('Try Again', result.error || 'Connection busy');
      }
    } catch (error) {
      console.error('Save error:', error);
      setLoading(false);
      // Even on error, if it's a connection issue, we've already queued it offline
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } finally {
      setLoading(false);
    }
  };

  const levelConfig = autismLevel ? AUTISM_LEVELS[`LEVEL_${autismLevel}`] : null;
  const allFeatures = Object.values(FEATURES);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* TOP NAVIGATION BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.topBarTitleContainer}>
          <Text style={styles.topBarTitle}>{isEditing ? 'EDIT' : 'NEW'} PROFILE</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}>
        
        {/* HERO SECTION */}
        <View style={styles.heroSection}>
          <LinearGradient colors={['#4D96FF', '#6BCCFF']} style={styles.heroGradient}>
             <Text style={styles.heroEmoji}>👶</Text>
             <View>
               <Text style={styles.heroTitle}>
                 {isEditing ? 'Update' : 'Create'}
               </Text>
               <Text style={styles.heroTitleBold}>Child Profile</Text>
             </View>
          </LinearGradient>
        </View>

        {/* Profile Preview Floating */}
        {!!(name || autismLevel) && (
          <View style={styles.previewContainer}>
             <View style={[styles.previewBlob, { backgroundColor: levelConfig ? levelConfig.color + '15' : '#F8F8F8' }]}>
               <Text style={styles.previewEmoji}>
                 {gender === 'male' ? '👦' : gender === 'female' ? '👧' : '🧒'}
               </Text>
               <View style={styles.previewInfo}>
                 <Text style={styles.previewName}>{name ? name.toUpperCase() : 'CHILD NAME'}</Text>
                 <Text style={styles.previewAge}>
                   {age ? `Age ${age}` : 'Enter Age'} {!!className && `• ${className}`}
                 </Text>
               </View>
             </View>
          </View>
        )}

        {/* Basic Info Blob */}
        <View style={styles.sectionBlob}>
          <Text style={styles.sectionTitle}>📋 BASIC INFORMATION</Text>

          <AppInput
            label="CHILD'S NAME"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Zara"
            error={errors.name}
          />

          <AppInput
            label="AGE"
            value={age}
            onChangeText={setAge}
            placeholder="e.g. 7"
            keyboardType="number-pad"
            error={errors.age}
          />

          {user?.role === 'teacher' && (
            <AppInput
              label="CLASS NAME"
              value={className}
              onChangeText={setClassName}
              placeholder="e.g. Grade 1-A"
              error={errors.className}
            />
          )}

          <Text style={styles.subLabel}>GENDER</Text>
          <View style={styles.optionRow}>
            {GENDER_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.optionChip,
                  gender === opt.value && styles.optionChipActive,
                ]}
                onPress={() => setGender(opt.value)}>
                <Text style={[
                  styles.optionChipText,
                  gender === opt.value && styles.optionChipTextActive,
                ]}>
                  {opt.label.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {!!errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
        </View>

        {/* Level Blob */}
        <View style={styles.sectionBlob}>
          <Text style={styles.sectionTitle}>🧠 ASSISTIVE LEVEL</Text>

          {Object.values(AUTISM_LEVELS).map((level) => (
            <TouchableOpacity
              key={level.id}
              onPress={() => setAutismLevel(level.id)}
              style={[
                styles.levelOption,
                autismLevel === level.id && { borderColor: level.color, backgroundColor: level.color + '08' }
              ]}>
              <View style={[styles.levelDot, { backgroundColor: level.color }]} />
              <View style={styles.levelInfo}>
                <Text style={styles.levelName}>{level.label.toUpperCase()}</Text>
                <Text style={styles.levelDesc}>{level.subtitle}</Text>
              </View>
              {autismLevel === level.id && <Text style={[styles.check, { color: level.color }]}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Features Blob */}
        <View style={styles.sectionBlob}>
          <Text style={styles.sectionTitle}>🎯 FEATURES</Text>
          <View style={styles.featuresGrid}>
            {allFeatures.map((feature) => {
              const isSelected = selectedFeatures.includes(feature.id);
              return (
                <TouchableOpacity
                  key={feature.id}
                  onPress={() => toggleFeature(feature.id)}
                  style={[
                    styles.featureChip,
                    isSelected && { backgroundColor: feature.color + '10', borderColor: feature.color }
                  ]}>
                  <Text style={styles.featureEmoji}>{feature.emoji}</Text>
                  <Text style={[styles.featureText, isSelected && { color: feature.color }]}>
                    {feature.title.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity 
          style={styles.saveBtn} 
          onPress={handleSave}
          disabled={loading}>
          <LinearGradient colors={saveSuccess ? ['#6BCB77', '#48BB78'] : ['#4D96FF', '#6BCCFF']} style={styles.saveBtnGrad}>
            <Text style={styles.saveBtnText}>
              {loading ? 'SAVING...' : saveSuccess ? '✅ SAVED!' : isEditing ? 'UPDATE PROFILE' : 'CREATE PROFILE'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 20,
    color: '#4D96FF',
    fontWeight: '900',
  },
  topBarTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#333',
    letterSpacing: 2,
  },
  heroSection: {
    margin: 20,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#4D96FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  heroGradient: {
    padding: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  heroEmoji: {
    fontSize: 50,
  },
  heroTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  heroTitleBold: {
    fontSize: 24,
    fontWeight: '900',
  },
  previewContainer: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  previewBlob: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 30,
    borderTopLeftRadius: 10,
    width: '100%',
  },
  previewEmoji: { fontSize: 40, marginRight: 15 },
  previewInfo: { flex: 1 },
  previewName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#333',
    letterSpacing: 1,
  },
  previewAge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#999',
    marginTop: 2,
  },
  mainContent: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionBlob: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#CCC',
    letterSpacing: 1,
    marginBottom: 15,
  },
  subLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#999',
    marginBottom: 10,
    marginTop: 10,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 15,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  optionChipActive: {
    backgroundColor: '#FFE5E5',
    borderColor: '#FF6B6B',
  },
  optionChipText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#999',
  },
  optionChipTextActive: {
    color: '#FF6B6B',
  },
  levelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#EEE',
    marginBottom: 10,
  },
  levelDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 15,
  },
  levelInfo: { flex: 1 },
  levelName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#333',
    letterSpacing: 0.5,
  },
  levelDesc: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    marginTop: 2,
  },
  check: {
    fontSize: 20,
    fontWeight: '900',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#EEE',
    gap: 6,
  },
  featureEmoji: { fontSize: 16 },
  featureText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#999',
  },
  saveBtn: {
    marginTop: 20,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 4,
  },
  saveBtnGrad: {
    padding: 18,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  errorText: {
    fontSize: 10,
    color: '#FF6B6B',
    fontWeight: '800',
    marginTop: 5,
  },
});

export default CreateChildProfileScreen;





