import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTheme} from '../contexts/ThemeContext';

import {AgendaScreen} from '../screens/AgendaScreen';
import {CalendarioScreen} from '../screens/CalendarioScreen';
import {ConfiguracoesScreen} from '../screens/ConfiguracoesScreen';

const Tab = createBottomTabNavigator();

export const AppNavigator = () => {
  const {theme} = useTheme();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
            borderTopWidth: 1,
            height: 70,
            paddingBottom: 10,
            paddingTop: 10,
          },
          tabBarActiveTintColor: theme.iconActive,
          tabBarInactiveTintColor: theme.icon,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}>
        <Tab.Screen
          name="Agenda"
          component={AgendaScreen}
          options={{
            tabBarIcon: ({color, size}) => (
              <Icon name="event-note" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Calendário"
          component={CalendarioScreen}
          options={{
            tabBarIcon: ({color, size}) => (
              <Icon name="calendar-today" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Configurações"
          component={ConfiguracoesScreen}
          options={{
            tabBarIcon: ({color, size}) => (
              <Icon name="settings" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
