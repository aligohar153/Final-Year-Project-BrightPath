// BrightPath - Daily Routine Screen (Sprint 5)
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, TextInput, StatusBar, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { saveRoutine, getRoutine } from '../../firebase/firestoreService';
import { useApp } from '../../context/AppContext';
import { COLORS } from '../../utils/colors';

const DEFAULT_TASKS = [
  { id: '1', emoji: '⏰', title: 'Wake Up', time: '7:00 AM', done: false, color: '#FFD93D' },
  { id: '2', emoji: '🦷', title: 'Brush Teeth', time: '7:15 AM', done: false, color: '#4D96FF' },
  { id: '3', emoji: '🛁', title: 'Bath / Shower', time: '7:30 AM', done: false, color: '#06D6A0' },
  { id: '4', emoji: '👕', title: 'Get Dressed', time: '7:50 AM', done: false, color: '#FF9F1C' },
  { id: '5', emoji: '🍳', title: 'Breakfast', time: '8:00 AM', done: false, color: '#FF6B6B' },
  { id: '6', emoji: '🎒', title: 'Pack Bag', time: '8:30 AM', done: false, color: '#7B2FBE' },
  { id: '7', emoji: '🚌', title: 'Go to School', time: '8:45 AM', done: false, color: '#FF6BB5' },
  { id: '8', emoji: '📚', title: 'Study Time', time: '9:00 AM', done: false, color: '#4361EE' },
  { id: '9', emoji: '🍱', title: 'Lunch', time: '12:00 PM', done: false, color: '#6BCB77' },
  { id: '10', emoji: '🎮', title: 'Play Time', time: '3:00 PM', done: false, color: '#FF9F1C' },
  { id: '11', emoji: '🍎', title: 'Healthy Snack', time: '4:00 PM', done: false, color: '#6BCB77' },
  { id: '12', emoji: '😴', title: 'Bedtime', time: '8:00 PM', done: false, color: '#7B2FBE' },
];

const TASK_EMOJIS = ['⏰', '🦷', '🛁', '👕', '🍳', '🎒', '📚', '🍱', '🎮', '🍎', '😴', '💊', '🏃', '🎨', '📖', '🎵', '🧹', '🛏️'];

import { speak } from '../../utils/ttsService';

const DailyRoutineScreen = ({ navigation }) => {
  const { activeChild } = useApp();
  const [tasks, setTasks] = useState(DEFAULT_TASKS);
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ emoji: '⭐', title: '', time: '' });
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    if (activeChild?.id) loadRoutine();
  }, []);

  const loadRoutine = async () => {
    const result = await getRoutine(activeChild.id);
    if (result.success && result.tasks.length > 0) {
      setTasks(result.tasks);
    }
  };

  const toggleTask = (id) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        if (!t.done) speak(`Great job! You finished ${t.title}`);
        return { ...t, done: !t.done };
      }
      return t;
    });
    setTasks(updated);

    const doneCount = updated.filter(t => t.done).length;
    if (doneCount === updated.length) {
      speak("Amazing! You finished all your tasks today. High five!");
      Animated.sequence([
        Animated.timing(confettiAnim, { toValue: 1, duration: 300, useNativeDriver: false }),
        Animated.timing(confettiAnim, { toValue: 0, duration: 1000, delay: 2000, useNativeDriver: false }),
      ]).start();
    }

    if (activeChild?.id) {
      saveRoutine(activeChild.id, updated);
    }
  };

  const addTask = () => {
    if (!newTask.title.trim()) {
      Alert.alert('Missing Info', 'Please enter a task name!');
      return;
    }
    const colors = ['#FF9F1C', '#4D96FF', '#6BCB77', '#FF6BB5', '#7B2FBE', '#FFD93D'];
    const task = {
      id: Date.now().toString(),
      ...newTask,
      done: false,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    const updated = [...tasks, task];
    setTasks(updated);
    setNewTask({ emoji: '⭐', title: '', time: '' });
    setShowAdd(false);
    if (activeChild?.id) saveRoutine(activeChild.id, updated);
  };

  const removeTask = (id) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    if (activeChild?.id) saveRoutine(activeChild.id, updated);
  };

  const resetAll = () => {
    const updated = tasks.map(t => ({ ...t, done: false }));
    setTasks(updated);
    if (activeChild?.id) saveRoutine(activeChild.id, updated);
  };

  const doneCount = tasks.filter(t => t.done).length;
  const progress = tasks.length > 0 ? doneCount / tasks.length : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4D96FF" />
      
      <View style={styles.topWave}>
        <View style={styles.blueWave} />
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnHeader}>
          <Text style={styles.backTextHeader}>←</Text>
        </TouchableOpacity>
        <Text style={styles.heroTitle}>My Daily{'\n'}<Text style={styles.heroTitlePink}>Routine</Text></Text>
      </View>

      <View style={styles.layout}>
        {/* Simple Progress Header */}
        <View style={styles.categoryContainer}>
          <View style={styles.progressHeader}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressValue}>{Math.round(progress * 100)}%</Text>
              <Text style={styles.progressLabel}>DONE</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{doneCount * 5}</Text>
              <Text style={styles.statLabel}>STARS EARNED</Text>
            </View>
          </View>
        </View>

        {/* Right Panel - Task List */}
        <View style={styles.rightPanel}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.taskList}>
            <Text style={styles.todayLabel}>📅 Today's Schedule</Text>

            {tasks.map((task, index) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={() => toggleTask(task.id)}
                onRemove={() => removeTask(task.id)}
                delay={index * 60}
              />
            ))}

            {tasks.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📋</Text>
                <Text style={styles.emptyText}>No tasks yet. Add your first task!</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const TaskItem = ({ task, onToggle, onRemove, delay }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const checkAnim = useRef(new Animated.Value(task.done ? 1 : 0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleToggle = () => {
    Animated.spring(checkAnim, {
      toValue: task.done ? 0 : 1,
      tension: 80,
      friction: 5,
      useNativeDriver: false,
    }).start();
    onToggle();
  };

  return (
    <Animated.View style={[styles.taskItem, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={handleToggle} 
        style={styles.taskTouchable}>
        <View style={[
          styles.blobShape, 
          { backgroundColor: task.done ? task.color + '20' : '#F8F8F8' },
          task.done && { borderColor: task.color, borderWidth: 2 }
        ]}>
          <Text style={styles.taskEmoji}>{task.emoji}</Text>
        </View>
        <View style={styles.taskInfo}>
          <Text style={[styles.taskTitle, task.done && styles.taskDoneTitle, { color: task.done ? task.color : '#333' }]}>
            {task.title.toUpperCase()}
          </Text>
          {task.time ? <Text style={styles.taskTime}>{task.time}</Text> : null}
        </View>
        {task.done && <View style={[styles.checkDot, { backgroundColor: task.color }]} />}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={onRemove} style={styles.taskDelete}>
        <Text style={styles.taskDeleteIcon}>×</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topWave: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  blueWave: {
    position: 'absolute',
    top: -120,
    width: '150%',
    height: 240,
    backgroundColor: '#4D96FF',
    borderRadius: 200,
  },
  backBtnHeader: {
    position: 'absolute',
    left: 20,
    top: 40,
    zIndex: 10,
  },
  backTextHeader: {
    fontSize: 30,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
    marginTop: 20,
  },
  heroTitlePink: {
    color: '#FF6B6B',
  },
  layout: {
    flex: 1,
  },
  categoryContainer: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  progressCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: '#6BCB77',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#333',
  },
  progressLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#6BCB77',
  },
  statBox: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFD93D',
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#999',
    letterSpacing: 1,
  },
  rightPanel: {
    flex: 1,
  },
  taskList: {
    padding: 20,
    paddingBottom: 40,
  },
  todayLabel: {
    fontSize: 18,
    fontWeight: '900',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  taskTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  blobShape: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderTopLeftRadius: 25,
    borderBottomRightRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    backgroundColor: '#F8F8F8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  taskEmoji: {
    fontSize: 32,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  taskDoneTitle: {
    opacity: 0.6,
  },
  taskTime: {
    fontSize: 10,
    fontWeight: '700',
    color: '#BBB',
    marginTop: 2,
  },
  checkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 10,
  },
  taskDelete: {
    padding: 10,
  },
  taskDeleteIcon: {
    fontSize: 24,
    color: '#DDD',
    fontWeight: '300',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#BBB',
    textAlign: 'center',
  },
});

export default DailyRoutineScreen;





