// BrightPath App Context - Child profiles and global state
import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [activeChild, setActiveChildState] = useState(null);
  const [childProfiles, setChildProfiles] = useState([]);
  const [sessionProgress, setSessionProgress] = useState({});

  const setActiveChild = useCallback(async (child) => {
    setActiveChildState(child);
    // Background task - don't block the UI
    if (child) {
      AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_CHILD, JSON.stringify(child)).catch(e => console.log(e));
    } else {
      AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_CHILD).catch(e => console.log(e));
    }
  }, []);

  const loadActiveChild = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_CHILD);
      if (stored) setActiveChildState(JSON.parse(stored));
    } catch (e) {
      console.log(e);
    }
  }, []);

  const recordProgress = useCallback((feature, data) => {
    setSessionProgress(prev => ({
      ...prev,
      [feature]: {
        ...prev[feature],
        ...data,
        timestamp: Date.now(),
      },
    }));
  }, []);

  const clearSession = useCallback(() => {
    setSessionProgress({});
  }, []);

  return (
    <AppContext.Provider
      value={{
        activeChild,
        setActiveChild,
        loadActiveChild,
        children: childProfiles,
        setChildren: setChildProfiles,
        sessionProgress,
        recordProgress,
        clearSession,
      }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export default AppContext;





