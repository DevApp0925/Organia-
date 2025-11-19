import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ThemeProvider, useTheme} from './src/contexts/ThemeContext';
import {AgendaProvider} from './src/contexts/AgendaContext';
import {AppNavigator} from './src/navigation/AppNavigator';

const AppContent = () => {
  const {theme, isDarkMode} = useTheme();

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      <AppNavigator />
    </>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AgendaProvider>
          <AppContent />
        </AgendaProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
