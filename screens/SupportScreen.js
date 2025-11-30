import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../theme/tokens';

export const SupportScreen = () => {
  const handleEmailPress = () => {
    const email = 'support@qorgau-city.kz';
    const subject = encodeURIComponent('Qorgau Marketplace - Support Request');
    const body = encodeURIComponent('Здравствуйте,\n\nЯ обращаюсь по поводу:\n\n');
    const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
    
    Linking.canOpenURL(mailtoLink).then(supported => {
      if (supported) {
        Linking.openURL(mailtoLink);
      } else {
        // Fallback: copy email to clipboard or show alert
        console.log('Email app not available');
      }
    });
  };

  const handlePhonePress = () => {
    const phoneNumber = '+77000000000'; // Замените на реальный номер
    const phoneLink = Platform.OS === 'ios' ? `telprompt:${phoneNumber}` : `tel:${phoneNumber}`;
    
    Linking.canOpenURL(phoneLink).then(supported => {
      if (supported) {
        Linking.openURL(phoneLink);
      }
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={['#F3B127', '#F26D1D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logoGradient}
          >
            <Text style={styles.logoText}>Qorgau</Text>
            <Text style={styles.logoSubtext}>City</Text>
          </LinearGradient>
        </View>

        {/* Title */}
        <Text style={styles.title}>Служба поддержки</Text>
        <Text style={styles.subtitle}>
          Мы всегда готовы помочь вам с любыми вопросами или проблемами
        </Text>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Свяжитесь с нами</Text>
          
          {/* Email */}
          <TouchableOpacity 
            style={styles.contactCard}
            onPress={handleEmailPress}
            activeOpacity={0.7}
          >
            <View style={styles.contactIconContainer}>
              <Ionicons name="mail-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>support@qorgau-city.kz</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Phone */}
          <TouchableOpacity 
            style={styles.contactCard}
            onPress={handlePhonePress}
            activeOpacity={0.7}
          >
            <View style={styles.contactIconContainer}>
              <Ionicons name="call-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Телефон</Text>
              <Text style={styles.contactValue}>+7 (700) 000-00-00</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Часто задаваемые вопросы</Text>
          
          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>Как создать объявление?</Text>
            <Text style={styles.faqAnswer}>
              Нажмите на кнопку "+" в нижней панели навигации, выберите категорию, заполните информацию о товаре, добавьте фотографии и опубликуйте объявление.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>Как связаться с продавцом?</Text>
            <Text style={styles.faqAnswer}>
              На странице объявления нажмите кнопку "Позвонить" или "Написать сообщение" для связи с продавцом.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>Как изменить свой профиль?</Text>
            <Text style={styles.faqAnswer}>
              Перейдите в раздел "Профиль", нажмите на иконку настроек и выберите "Редактировать профиль".
            </Text>
          </View>

          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>Мое объявление не опубликовано. Почему?</Text>
            <Text style={styles.faqAnswer}>
              Все объявления проходят модерацию перед публикацией. Обычно это занимает до 24 часов. Если объявление отклонено, вы получите уведомление с указанием причины.
            </Text>
          </View>
        </View>

        {/* Help Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Нужна помощь?</Text>
          <Text style={styles.helpText}>
            Если вы не нашли ответ на свой вопрос в разделе FAQ, пожалуйста, свяжитесь с нами по email или телефону. Наша служба поддержки работает ежедневно с 9:00 до 18:00 по времени Алматы.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 Qorgau Marketplace. Все права защищены.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  contentContainer: {
    paddingBottom: spacing.xxl,
  },
  content: {
    width: '90%',
    alignSelf: 'center',
    paddingTop: spacing.lg,
  },
  logoContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  logoGradient: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoText: {
    fontSize: 22,
    fontFamily: 'bold',
    color: '#FFFFFF',
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  logoSubtext: {
    fontSize: 18,
    fontFamily: 'medium',
    color: '#FFFFFF',
    lineHeight: 20,
    letterSpacing: 0.3,
    marginLeft: 3,
    opacity: 0.95,
  },
  title: {
    fontSize: 28,
    fontFamily: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'regular',
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'semibold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.mutedBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    fontFamily: 'regular',
    color: colors.textMuted,
    marginBottom: spacing.xxs,
  },
  contactValue: {
    fontSize: 16,
    fontFamily: 'medium',
    color: colors.text,
  },
  faqCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  faqQuestion: {
    fontSize: 16,
    fontFamily: 'semibold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  faqAnswer: {
    fontSize: 14,
    fontFamily: 'regular',
    color: colors.textSecondary,
    lineHeight: 20,
  },
  helpText: {
    fontSize: 14,
    fontFamily: 'regular',
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'regular',
    color: colors.textMuted,
    textAlign: 'center',
  },
});

