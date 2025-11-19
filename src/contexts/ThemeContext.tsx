import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ThemeColors} from '../types';

const darkTheme: ThemeColors = {
  background: '#0A0E27',
  surface: '#1A1F3A',
  surfaceLight: '#252B47',
  primary: '#E91E63',
  primaryGradientStart: '#9C27B0',
  primaryGradientEnd: '#E91E63',
  text: '#FFFFFF',
  textSecondary: '#B0B3C1',
  textTertiary: '#6B7280',
  border: '#2D3348',
  icon: '#8B8FA3',
  iconActive: '#E91E63',
  error: '#EF4444',
  success: '#10B981',
  calendar: {
    background: '#1A1F3A',
    dayText: '#FFFFFF',
    selectedDay: '#E91E63',
    selectedDayText: '#FFFFFF',
    todayBackground: '#9C27B0',
    todayText: '#FFFFFF',
    weekDayText: '#6B7280',
  },
};

const lightTheme: ThemeColors = {
  background: '#F5F5F7',
  surface: '#FFFFFF',
  surfaceLight: '#F9FAFB',
  primary: '#E91E63',
  primaryGradientStart: '#9C27B0',
  primaryGradientEnd: '#E91E63',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  icon: '#6B7280',
  iconActive: '#E91E63',
  error: '#EF4444',
  success: '#10B981',
  calendar: {
    background: '#FFFFFF',
    dayText: '#1F2937',
    selectedDay: '#E91E63',
    selectedDayText: '#FFFFFF',
    todayBackground: '#9C27B0',
    todayText: '#FFFFFF',
    weekDayText: '#6B7280',
  },
};

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({children}: {children: ReactNode}) => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Padrão: tema escuro

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Erro ao carregar tema:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{isDarkMode, toggleTheme, theme}}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  }
  return context;
};
