import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import { getDb } from './sqliteDb';

// Local array of observers for onAuthStateChanged
const authObservers = [];
let currentUser = null;

// Helper to notify observers
const notifyObservers = (user) => {
  currentUser = user;
  authObservers.forEach(callback => {
    try {
      callback(user);
    } catch (e) {
      console.log('Observer error:', e);
    }
  });
};

// Auto-load current user on startup to initialize auth state
(async () => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    if (stored) {
      currentUser = JSON.parse(stored);
      notifyObservers(currentUser);
    }
  } catch (e) {
    console.log('Failed to load initial user:', e);
  }
})();

// ─── Register User ──────────────────────────────────────────────────────────
export const registerUser = async ({ email, password, role, profileData }) => {
  try {
    const db = await getDb();
    
    // Check if email already exists
    const existing = await db.getFirstAsync('SELECT * FROM users WHERE email = ?', [email]);
    if (existing) {
      return { success: false, error: 'This email is already registered.' };
    }
    
    const uid = 'usr_' + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    
    const userData = {
      uid,
      email,
      role,
      fullName: profileData?.fullName || '',
      createdAt: now,
      updatedAt: now,
    };
    
    await db.runAsync(
      'INSERT INTO users (uid, email, password, role, fullName, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [uid, email, password, role, userData.fullName, now, now]
    );
    
    // Save locally
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    
    notifyObservers(userData);
    return { success: true, user: userData };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ─── Login User ──────────────────────────────────────────────────────────────
export const loginUser = async ({ email, password }) => {
  try {
    const db = await getDb();
    const userRow = await db.getFirstAsync(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      [email, password]
    );
    
    if (!userRow) {
      return { success: false, error: 'Incorrect email or password. Please try again.' };
    }
    
    const userData = {
      uid: userRow.uid,
      email: userRow.email,
      role: userRow.role,
      fullName: userRow.fullName,
      createdAt: userRow.createdAt,
      updatedAt: userRow.updatedAt,
    };
    
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    
    notifyObservers(userData);
    return { success: true, user: userData };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ─── Logout User ─────────────────────────────────────────────────────────────
export const logoutUser = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER,
      STORAGE_KEYS.ACTIVE_CHILD,
    ]);
    
    notifyObservers(null);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ─── Get Current User ────────────────────────────────────────────────────────
export const getCurrentUser = () => currentUser;

// ─── Get Stored User ─────────────────────────────────────────────────────────
export const getStoredUser = async () => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

// ─── Auth State Observer ─────────────────────────────────────────────────────
export const onAuthStateChanged = (callback) => {
  authObservers.push(callback);
  // Trigger immediately with current value
  callback(currentUser);
  
  // Return unsubscribe function
  return () => {
    const index = authObservers.indexOf(callback);
    if (index > -1) {
      authObservers.splice(index, 1);
    }
  };
};

// ─── Password Reset ──────────────────────────────────────────────────────────
export const resetPassword = async (email) => {
  try {
    const db = await getDb();
    const userRow = await db.getFirstAsync('SELECT * FROM users WHERE email = ?', [email]);
    if (!userRow) {
      return { success: false, error: 'No account found with this email.' };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ─── Change Password (SQLite) ────────────────────────────────────────────────
export const changePassword = async (uid, currentPassword, newPassword) => {
  try {
    const db = await getDb();
    const userRow = await db.getFirstAsync(
      'SELECT * FROM users WHERE uid = ? AND password = ?',
      [uid, currentPassword]
    );
    
    if (!userRow) {
      return { success: false, error: 'Current password is incorrect.' };
    }
    
    const now = new Date().toISOString();
    await db.runAsync(
      'UPDATE users SET password = ?, updatedAt = ? WHERE uid = ?',
      [newPassword, now, uid]
    );
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
