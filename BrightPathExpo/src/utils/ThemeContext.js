import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from './colors';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const contrast = await AsyncStorage.getItem('theme_contrast');
      setIsHighContrast(contrast === 'true');
    } catch (e) {
      console.log('Load theme error:', e);
    }
  };

  const toggleHighContrast = async () => {
    const newVal = !isHighContrast;
    setIsHighContrast(newVal);
    await AsyncStorage.setItem('theme_contrast', String(newVal));
  };

  // Dynamic theme colors
  const theme = {
    isHighContrast,
    toggleHighContrast,
    colors: {
      ...COLORS,
      bgLight: isHighContrast ? '#FFFFFF' : COLORS.bgLight,
      bgWhite: '#FFFFFF',
      bgCard: '#FFFFFF',
      textDark: isHighContrast ? '#000000' : COLORS.textDark,
      textMedium: isHighContrast ? '#000000' : COLORS.textMedium,
      border: isHighContrast ? '#000000' : COLORS.border,
      primary: isHighContrast ? '#0000FF' : COLORS.primary,
      accent: isHighContrast ? '#FFFF00' : COLORS.accent,
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);





