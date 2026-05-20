// BrightPath - App Constants

export const APP_NAME = 'BrightPath';
export const APP_TAGLINE = 'Every Child Shines Differently ✨';
export const APP_VERSION = '1.0.0';

// User Roles
export const USER_ROLES = {
  PARENT: 'parent',
  TEACHER: 'teacher',
  CAREGIVER: 'caregiver',
  GUEST: 'guest',
};

// Autism Levels
export const AUTISM_LEVELS = {
  LEVEL_1: {
    id: 1,
    label: 'Level 1',
    title: 'Requiring Support',
    subtitle: 'Mild',
    description: 'Needs some support in social communication and has inflexible behaviors that cause significant interference.',
    color: '#6BCB77',
    bgColor: '#E8F8EA',
    emoji: '🟢',
    features: ['language', 'cognitive', 'emotion', 'social', 'routine', 'progress', 'content', 'communication'],
  },
  LEVEL_2: {
    id: 2,
    label: 'Level 2',
    title: 'Requiring Substantial Support',
    subtitle: 'Moderate',
    description: 'Marked deficits in verbal and nonverbal social communication skills; social impairments apparent even with supports.',
    color: '#FFD93D',
    bgColor: '#FFF8DC',
    emoji: '🟡',
    features: ['language', 'cognitive', 'emotion', 'social', 'routine', 'progress', 'motor', 'communication'],
  },
  LEVEL_3: {
    id: 3,
    label: 'Level 3',
    title: 'Requiring Very Substantial Support',
    subtitle: 'Severe',
    description: 'Severe deficits in verbal and nonverbal communication; very limited initiation of social interaction.',
    color: '#FF6B6B',
    bgColor: '#FFE5E5',
    emoji: '🔴',
    features: ['language', 'emotion', 'routine', 'progress', 'motor', 'music', 'communication'],
  },
};

// Features
export const FEATURES = {
  language: {
    id: 'language',
    title: 'Language Learning',
    subtitle: 'Words & Communication',
    icon: 'language',
    emoji: '🗣️',
    color: '#4D96FF',
    gradient: ['#4D96FF', '#4361EE'],
    screen: 'LanguageLearning',
    description: 'Learn words by tapping pictures and hearing sounds',
  },
  cognitive: {
    id: 'cognitive',
    title: 'Cognitive Skills',
    subtitle: 'Memory & Thinking',
    icon: 'brain',
    emoji: '🧩',
    color: '#7B2FBE',
    gradient: ['#7B2FBE', '#C850C0'],
    screen: 'CognitiveSkills',
    description: 'Fun matching and sorting games',
  },
  emotion: {
    id: 'emotion',
    title: 'Emotions',
    subtitle: 'Feelings & Expression',
    icon: 'emoticon-happy',
    emoji: '😊',
    color: '#FF6BB5',
    gradient: ['#FF6BB5', '#FF9F1C'],
    screen: 'EmotionRecognition',
    description: 'Learn to recognize and express feelings',
  },
  social: {
    id: 'social',
    title: 'Social Skills',
    subtitle: 'Friends & Play',
    icon: 'account-group',
    emoji: '👥',
    color: '#6BCB77',
    gradient: ['#6BCB77', '#06D6A0'],
    screen: 'SocialScenarios',
    description: 'Practice social situations and scenarios',
  },
  routine: {
    id: 'routine',
    title: 'Daily Routine',
    subtitle: 'Schedule & Tasks',
    icon: 'calendar-clock',
    emoji: '📅',
    color: '#FF9F1C',
    gradient: ['#FF9F1C', '#FFD93D'],
    screen: 'DailyRoutine',
    description: 'Build and follow daily schedules',
  },
  progress: {
    id: 'progress',
    title: 'My Progress',
    subtitle: 'Growth & Achievements',
    icon: 'chart-line',
    emoji: '📊',
    color: '#06D6A0',
    gradient: ['#06D6A0', '#4D96FF'],
    screen: 'ProgressTracking',
    description: 'Track learning milestones and achievements',
  },
  content: {
    id: 'content',
    title: 'My Content',
    subtitle: 'Photos & Recordings',
    icon: 'camera',
    emoji: '📷',
    color: '#FF6B6B',
    gradient: ['#FF6B6B', '#FF6BB5'],
    screen: 'CustomContent',
    description: 'Upload personal photos and voice recordings',
  },
  music: {
    id: 'music',
    title: 'Music & Sounds',
    subtitle: 'Rhythm & Joy',
    icon: 'music-note',
    emoji: '🎵',
    color: '#FFD93D',
    gradient: ['#FFD93D', '#FF9F1C'],
    screen: 'Music',
    description: 'Explore songs, rhythms and calming sounds',
  },
  motor: {
    id: 'motor',
    title: 'Motor Skills',
    subtitle: 'Touch & Move',
    icon: 'hand-pointing-up',
    emoji: '🤚',
    color: '#4361EE',
    gradient: ['#4361EE', '#7B2FBE'],
    screen: 'MotorSkills',
    description: 'Practice fine motor skill activities',
  },
  communication: {
    id: 'communication',
    title: 'Communication',
    subtitle: 'AAC & Symbols',
    icon: 'chat-processing',
    emoji: '💬',
    color: '#FF6BB5',
    gradient: ['#FF6BB5', '#7B2FBE'],
    screen: 'Communication',
    description: 'Picture-based communication boards',
  },
};

// Gender Options
export const GENDER_OPTIONS = [
  { label: 'Boy 👦', value: 'male' },
  { label: 'Girl 👧', value: 'female' },
  { label: 'Other 🌈', value: 'other' },
];

// Puzzle Questions for verification
export const PUZZLE_QUESTIONS = [
  { question: 'What is 3 + 4 =', answer: 7, options: [5, 6, 7, 8] },
  { question: 'What is 10 - 3 =', answer: 7, options: [4, 6, 7, 9] },
  { question: 'What is 2 × 4 =', answer: 8, options: [6, 7, 8, 10] },
  { question: 'What is 15 ÷ 3 =', answer: 5, options: [3, 4, 5, 6] },
  { question: 'What is 6 + 8 =', answer: 14, options: [12, 13, 14, 15] },
  { question: 'Which is BIGGER: 45 or 54?', answer: '54', options: ['45', '54', 'Equal', "I don't know"] },
  { question: 'How many days in a week?', answer: 7, options: [5, 6, 7, 8] },
];

// AsyncStorage Keys
export const STORAGE_KEYS = {
  USER: '@brightpath_user',
  CHILDREN: '@brightpath_children',
  ACTIVE_CHILD: '@brightpath_active_child',
  PROGRESS: '@brightpath_progress',
  OFFLINE_QUEUE: '@brightpath_offline_queue',
  FIRST_LAUNCH: '@brightpath_first_launch',
};

// Firebase Collections
export const COLLECTIONS = {
  USERS: 'users',
  CHILDREN: 'children',
  PROGRESS: 'progress',
  CONTENT: 'content',
  ROUTINES: 'routines',
  NOTIFICATIONS: 'notifications',
};

export default {
  APP_NAME,
  APP_TAGLINE,
  USER_ROLES,
  AUTISM_LEVELS,
  FEATURES,
  GENDER_OPTIONS,
  PUZZLE_QUESTIONS,
  STORAGE_KEYS,
  COLLECTIONS,
};





