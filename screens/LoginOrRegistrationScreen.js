import React from 'react';
import { View, TouchableOpacity, Image, Text, Dimensions, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, shadows } from '../theme/tokens';


export const LoginOrRegistrationScreen = () => {
    const navigation = useNavigation()
    const {t} = useTranslation();
    const { width } = Dimensions.get('window');

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
            <Text style={styles.title}>{t('welcome')}</Text>
            <Text style={styles.subtitle}>{t('welcome_desc')}</Text>

            <View style={[styles.buttonsContainer, { maxWidth: width - 40 }]}>
                <TouchableOpacity 
                    onPress={() => {navigation.navigate('Signup')}} 
                    style={styles.secondaryButton}
                    activeOpacity={0.6}
                >
                    <Text style={styles.secondaryButtonText}>{t('register.register')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => {navigation.navigate('Login')}} 
                    style={styles.primaryButton}
                    activeOpacity={0.6}
                >
                    <Text style={styles.primaryButtonText}>{t('login.login')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      width: '90%',
      marginHorizontal: '5%',
      backgroundColor: colors.bg, // Apple HIG: system background
    },
    logoContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xl, // Apple HIG: consistent spacing
    },
    logoGradient: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.lg, // Apple HIG: consistent rounding
      flexDirection: 'row',
      alignItems: 'baseline',
      ...shadows.md, // Apple HIG: subtle depth
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
      fontSize: 28, // Apple HIG: large title
      textAlign: 'center',
      marginTop: spacing.lg,
      color: colors.text, // Apple HIG: primary text
    },
    subtitle: {
      fontFamily: 'regular',
      fontSize: 15,
      color: colors.textSecondary, // Apple HIG: secondary text
      width: 280,
      lineHeight: 21,
      marginTop: spacing.sm,
      textAlign: 'center',
    },
    buttonsContainer: {
      marginTop: spacing.xxxl, // Apple HIG: generous spacing
      justifyContent: 'center',
      width: '100%',
    },
    primaryButton: {
      paddingVertical: spacing.md,
      width: '100%',
      backgroundColor: colors.primary,
      borderRadius: radius.lg, // Apple HIG: consistent rounding
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 50, // Apple HIG: comfortable touch target
      ...shadows.md, // Apple HIG: subtle depth
      marginBottom: spacing.sm,
    },
    primaryButtonText: {
      color: colors.primaryText,
      fontSize: 17, // Apple HIG: body text size
      fontFamily: 'semibold',
    },
    secondaryButton: {
      paddingVertical: spacing.md,
      width: '100%',
      borderRadius: radius.lg, // Apple HIG: consistent rounding
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: colors.primary,
      borderWidth: 1.5,
      backgroundColor: colors.surface, // Apple HIG: system surface
      minHeight: 50, // Apple HIG: comfortable touch target
      marginBottom: spacing.sm,
      ...shadows.sm, // Apple HIG: subtle depth
    },
    secondaryButtonText: {
      color: colors.primary,
      fontSize: 17, // Apple HIG: body text size
      fontFamily: 'semibold',
    },
  });
