import React, { useEffect } from 'react';
import { View, StyleSheet,  TouchableOpacity, TouchableWithoutFeedback, FlatList, ScrollView, RefreshControl, Dimensions, Image, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, shadows } from '../theme/tokens';


export const SelectLanguageScreen = () => {
    const navigation = useNavigation()
    const { t, i18n } = useTranslation();
    
    const handleLanguage = (language) => {
        i18n.changeLanguage(language)
        try { 
            if (typeof window !== 'undefined') window.localStorage.setItem('lng', language); 
        } catch (e) {
            console.error("Error saving language to localStorage:", e);
        }
        
        // Force reload of all translations
        setTimeout(() => {
            navigation.navigate('LoginOrRegistration')
        }, 100);
    }
    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <LinearGradient
                    colors={[colors.primaryLight, colors.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.logoGradient}
                >
                    <Text style={styles.logoText}>Qorgau</Text>
                    <Text style={styles.logoSubtext}>City</Text>
                </LinearGradient>
            </View>
            <Text style={styles.title}>{t('select_language.select_language')}</Text>
            <Text style={styles.subtitle}>{t('select_language.you_could_change_language')}</Text>

            <View style={styles.languagesContainer}>
                <TouchableOpacity 
                    onPress={() => {handleLanguage('kz')}} 
                    style={styles.languageButton}
                    activeOpacity={0.7}
                >
                    <Text style={styles.languageText}>{t('kaz')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => {handleLanguage('ru')}} 
                    style={styles.languageButton}
                    activeOpacity={0.7}
                >
                    <Text style={styles.languageText}>{t('rus')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => {handleLanguage('en')}} 
                    style={styles.languageButton}
                    activeOpacity={0.7}
                >
                    <Text style={styles.languageText}>{t('eng')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      width: '90%',
      marginHorizontal: '5%',
      marginTop: 80,
    },
    logoContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xl,
    },
    logoGradient: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.lg,
      flexDirection: 'row',
      alignItems: 'baseline',
      ...shadows.md,
    },
    logoText: {
      fontSize: 22,
      fontFamily: 'bold',
      color: colors.primaryText,
      lineHeight: 24,
      letterSpacing: 0.5,
    },
    logoSubtext: {
      fontSize: 18,
      fontFamily: 'medium',
      color: colors.primaryText,
      lineHeight: 20,
      letterSpacing: 0.3,
      marginLeft: spacing.xxs,
      opacity: 0.95,
    },
    title: {
      fontFamily: 'bold',
      fontSize: 28,
      textAlign: 'center',
      marginTop: spacing.lg,
      color: colors.text,
    },
    subtitle: {
      fontFamily: 'regular',
      fontSize: 15,
      color: colors.textMuted,
      width: 280,
      lineHeight: 21,
      marginTop: spacing.sm,
      textAlign: 'center',
    },
    languagesContainer: {
      marginTop: 220,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      gap: spacing.sm,
    },
    languageButton: {
      flex: 1,
      paddingVertical: spacing.md,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: colors.border,
      borderWidth: 1,
      minHeight: 50,
      ...shadows.sm,
    },
    languageText: {
      color: colors.primary,
      fontSize: 16,
      fontFamily: 'semibold',
    },
  });