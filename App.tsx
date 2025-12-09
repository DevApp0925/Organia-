import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, StyleSheet, Image } from "react-native";
import { ThemeProvider, useTheme } from "./src/contexts/ThemeContext";
import { AppointmentProvider } from "./src/contexts/AppointmentContext";
import { TaskProvider } from "./src/contexts/TaskContext";
import AgendaScreen from "./src/screens/AgendaScreen";
import CalendarScreen from "./src/screens/CalendarScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 24,
  },
});

const TabIcon = ({ name, color, focused }: { name: string; color: string; focused: boolean }) => {
  const iconMap: { [key: string]: any } = {
    Agenda: require("./src/assets/agenda_icon.png"),
    Calendar: require("./src/assets/calendar_icon.png"),
    Settings: require("./src/assets/settings_icon.png"),
  };

  return (
    <Image
      source={iconMap[name]}
      style={{
        width: 24,
        height: 24,
        tintColor: focused ? color : "#8E8E93", // Use color when focused, gray when not
        resizeMode: "contain",
      }}
    />
  );
};

const AgendaStackNavigator = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text, fontWeight: "600" },
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen
        name="AgendaList"
        component={AgendaScreen}
        options={{
          title: "Agenda",
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

const CalendarStackNavigator = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text, fontWeight: "600" },
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen
        name="CalendarList"
        component={CalendarScreen}
        options={{
          title: "Calendário",
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

const SettingsStackNavigator = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text, fontWeight: "600" },
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen
        name="SettingsList"
        component={SettingsScreen}
        options={{
          title: "Configurações",
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

const AppContent = () => {
  const { colors } = useTheme();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            paddingBottom: 8,
            paddingTop: 8,
            height: 70,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
            marginTop: 4,
          },
        }}
      >
        <Tab.Screen
          name="Agenda"
          component={AgendaStackNavigator}
          options={{
            title: "Agenda",
            tabBarIcon: ({ color, focused }) => <TabIcon name="Agenda" color={color} focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Calendar"
          component={CalendarStackNavigator}
          options={{
            title: "Calendário",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="Calendar" color={color} focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsStackNavigator}
          options={{
            title: "Configurações",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="Settings" color={color} focused={focused} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  // Note: We need a way to access AsyncStorage here. 
  // It's already imported in OnboardingScreen, but we need it here too.
  // Adding import at top of file is cleaner, but for this specific tool call let's focus on logic.

  // Since we can't easily add the import line with replace_file_content if it's far away, 
  // let's assume we'll fix the import in the next step or use a require.
  // Actually, let's use a MultiReplace or ensure we add the import.
  // Since I am constrained to one replacement chunk here, I will use MultiReplace next or rewrite the file.

  // Let's rewrite the App component logic first.

  React.useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      // Inline require to avoid import issues for now if possible, 
      // but best practice is top-level. I'll stick to top-level import in next step.
      // For now, let's pretend AsyncStorage is available or use a helper.
      // Wait, I can't assume imports. I should check imports first.
      // I'll proceed with the component structure and then fix imports.

      const value = await require('@react-native-async-storage/async-storage').default.getItem('hasSeenOnboarding');
      if (value === null) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Error checking onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null; // Or a Splash Screen
  }

  if (showOnboarding) {
    return (
      <ThemeProvider>
        <OnboardingScreen onFinish={() => setShowOnboarding(false)} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <AppointmentProvider>
        <TaskProvider>
          <AppContent />
        </TaskProvider>
      </AppointmentProvider>
    </ThemeProvider>
  );
};

export default App;
