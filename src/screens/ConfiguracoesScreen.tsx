import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Image,
} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Logo = require('../assets/logo.png');

export const ConfiguracoesScreen = () => {
  const {theme, isDarkMode, toggleTheme} = useTheme();

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      {/* Header */}
      <View style={[styles.header, {backgroundColor: theme.background}]}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Image source={Logo} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={[styles.headerTitle, {color: theme.text}]}>Organia+</Text>
        </View>
        {/* Ícone de menu removido conforme solicitado */}
      </View>

      <ScrollView style={styles.content}>
        {/* Seção de Aparência */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.text}]}>Aparência</Text>

          <View style={[styles.settingCard, {backgroundColor: theme.surface}]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, {backgroundColor: theme.surfaceLight}]}>
                <Icon name="dark-mode" size={24} color={theme.primary} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, {color: theme.text}]}>Tema Escuro</Text>
                <Text style={[styles.settingDescription, {color: theme.textSecondary}]}>
                  Alterne entre tema claro e escuro
                </Text>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{false: theme.border, true: theme.primary}}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
        {/* As seções de Integrações e Conta foram removidas conforme solicitado */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    marginRight: 12,
  },
  logo: {
    width: 32,
    height: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
  },
});
