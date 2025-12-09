import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  ScrollView,
  Image,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";

const SettingsScreen = () => {
  const { colors, theme, toggleTheme } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View style={styles.headerContent}>
          <Image
            source={require("../assets/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Organia+
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            Configurações
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Personalize sua experiência
          </Text>

          {/* Theme Section */}
          <View
            style={[
              styles.section,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Aparência
              </Text>
            </View>

            <View
              style={[
                styles.settingItem,
                {
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View style={styles.settingContent}>
                <View style={[styles.iconContainer, { backgroundColor: '#FF69B420' }]}>
                  <Text style={[styles.iconText, { color: '#FF69B4' }]}>☾</Text>
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Tema Escuro
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Alterne entre tema claro e escuro
                  </Text>
                </View>
              </View>
              <Switch
                value={theme === "dark"}
                onValueChange={toggleTheme}
                thumbColor="#FFF"
                style={styles.switch}
              />
            </View>
          </View>

          {/* About Section */}
          <View
            style={[
              styles.section,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Sobre
              </Text>
            </View>

            <View
              style={[
                styles.settingItem,
                {
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Versão do App
                </Text>
              </View>
              <Text
                style={[styles.settingValue, { color: colors.textSecondary }]}
              >
                1.2.0
              </Text>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Desenvolvido por
                </Text>
              </View>
              <Text
                style={[styles.settingValue, { color: colors.textSecondary }]}
              >
                Organia+
              </Text>
            </View>
          </View>

          <View style={styles.spacer} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1E2430",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    width: 48,
    height: 48,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  section: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  settingContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "rgba(128, 128, 128, 0.1)",
  },
  iconText: {
    fontSize: 20,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  arrow: {
    fontSize: 20,
    marginLeft: 8,
  },
  switch: {
    marginLeft: 12,
  },
  spacer: {
    height: 80,
  },
});

export default SettingsScreen;
