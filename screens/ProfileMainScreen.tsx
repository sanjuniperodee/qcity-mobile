import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Text, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useGetMyPostsCountsQuery } from '../api';

export const ProfileMainScreen = () => {
  const navigation = useNavigation();
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);
  const user = useSelector((state: any) => state.auth.user);
  const [isImageLoading, setImageLoading] = useState(true);
  const { data: counts, isLoading: countsLoading } = useGetMyPostsCountsQuery(undefined, { skip: !isAuthenticated });

  // --- Если пользователь НЕ авторизован: показываем красивый CTA-блок ---
  if (!isAuthenticated) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.wrapper}>
          <View style={styles.ctaCard}>
            <View style={styles.ctaIconContainer}>
              <LinearGradient
                colors={['#F3B127', '#F26D1D']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaIconGradient}
              >
                <Ionicons name="person-outline" size={40} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={styles.ctaTitle}>Войдите в аккаунт</Text>
            <Text style={styles.ctaText}>
              Чтобы управлять профилем и размещать/редактировать объявления, пожалуйста, войдите в аккаунт.
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => (navigation as any).navigate('Auth', { screen: 'Login' })}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#F3B127', '#F26D1D']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaButtonGradient}
              >
                <Text style={styles.ctaButtonText}>Войти</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => (navigation as any).navigate('Auth', { screen: 'Signup' })}
              activeOpacity={0.8}
            >
              <Text style={styles.outlineButtonText}>Зарегистрироваться</Text>
            </TouchableOpacity>
          </View>

          {/* Подсказки-«серые» пункты меню — можно тапать, перекидываем на авторизацию */}
          <Text style={styles.sectionTitle}>Мои объявления</Text>
          {['Активные', 'Не активные', 'Не оплаченные', 'Удаленные', 'На модерации', 'Отклоненные'].map((label) => (
            <TouchableOpacity
              key={label}
              onPress={() => (navigation as any).navigate('Auth', { screen: 'Signup' })}
              style={styles.profileButtonDisabled}
              activeOpacity={0.7}
            >
              <Text style={styles.profileButtonTextDisabled}>{label}</Text>
              <Ionicons name="chevron-forward" size={20} color="#D6D6D6" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  }

  // --- Если пользователь авторизован: показываем прежний экран ---
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.wrapper}>
        {/* Профиль пользователя */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            {isImageLoading && (
              <ActivityIndicator
                style={styles.profileImageLoader}
                size="large"
                color="#F09235"
              />
            )}
            <Image
              style={styles.profileImage}
              source={
                user?.profile_image
                  ? { uri: `https://market.qorgau-city.kz${user.profile_image}?cb=${Date.now()}` }
                  : require('../assets/profilePurple.png')
              }
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.username || 'Пользователь'}</Text>
              <Text style={styles.profileEmail}>{user?.email || ''}</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('ProfileSettings' as never)}
                style={styles.settingsButton}
                activeOpacity={0.7}
              >
                <Ionicons name="settings-outline" size={16} color="#F09235" />
                <Text style={styles.settingsText}>Настройки профиля</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Favourite' as never)}
              style={styles.favoriteButton}
              activeOpacity={0.7}
            >
              <Ionicons name="heart-outline" size={24} color="#F09235" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Админ панель */}
        {user?.email === 'admin@mail.ru' && (
          <TouchableOpacity
            onPress={() => navigation.navigate('admin' as never)}
            style={styles.adminButton}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#F3B127', '#F26D1D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.adminButtonGradient}
            >
              <Ionicons name="shield-checkmark-outline" size={22} color="#FFFFFF" />
              <Text style={styles.adminButtonText}>Админ панель</Text>
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Мои объявления */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Мои объявления</Text>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('active' as never)}
              style={styles.profileButton}
              activeOpacity={0.7}
            >
              <View style={styles.buttonContent}>
                <View style={[styles.buttonIcon, { backgroundColor: '#E8F5E9' }]}>
                  <Ionicons name="checkmark-circle" size={20} color="#50C878" />
                </View>
                <Text style={styles.profileButtonText}>
                  Активные{typeof counts?.active === 'number' ? ` (${counts.active})` : ''}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('notactive' as never)}
              style={styles.profileButton}
              activeOpacity={0.7}
            >
              <View style={styles.buttonContent}>
                <View style={[styles.buttonIcon, { backgroundColor: '#F5F5F5' }]}>
                  <Ionicons name="pause-circle" size={20} color="#9E9E9E" />
                </View>
                <Text style={styles.profileButtonText}>
                  Не активные{typeof counts?.not_active === 'number' ? ` (${counts.not_active})` : ''}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('notpayed' as never)}
              style={styles.profileButton}
              activeOpacity={0.7}
            >
              <View style={styles.buttonContent}>
                <View style={[styles.buttonIcon, { backgroundColor: '#FFF3E0' }]}>
                  <Ionicons name="card-outline" size={20} color="#FF9800" />
                </View>
                <Text style={styles.profileButtonText}>
                  Не оплаченные{typeof counts?.not_paid === 'number' ? ` (${counts.not_paid})` : ''}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('deleted' as never)}
              style={styles.profileButton}
              activeOpacity={0.7}
            >
              <View style={styles.buttonContent}>
                <View style={[styles.buttonIcon, { backgroundColor: '#F5F5F5' }]}>
                  <Ionicons name="trash-outline" size={20} color="#757575" />
                </View>
                <Text style={styles.profileButtonText}>
                  Удаленные{typeof counts?.deleted === 'number' ? ` (${counts.deleted})` : ''}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('approve' as never)}
              style={styles.profileButton}
              activeOpacity={0.7}
            >
              <View style={styles.buttonContent}>
                <View style={[styles.buttonIcon, { backgroundColor: '#FFF8E1' }]}>
                  <Ionicons name="hourglass-outline" size={20} color="#FFA500" />
                </View>
                <Text style={styles.profileButtonText}>
                  На модерации{typeof counts?.moderation === 'number' ? ` (${counts.moderation})` : ''}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('rejected' as never)}
              style={styles.profileButton}
              activeOpacity={0.7}
            >
              <View style={styles.buttonContent}>
                <View style={[styles.buttonIcon, { backgroundColor: '#FFEBEE' }]}>
                  <Ionicons name="close-circle" size={20} color="#F44336" />
                </View>
                <Text style={styles.profileButtonText}>
                  Отклоненные{typeof counts?.rejected === 'number' ? ` (${counts.rejected})` : ''}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Другое */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Другое</Text>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Terms' as never)}
              style={styles.profileButton}
              activeOpacity={0.7}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="document-text-outline" size={20} color="#666" />
                <Text style={styles.profileButtonText}>Условия пользования</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Policy' as never)}
              style={styles.profileButton}
              activeOpacity={0.7}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#666" />
                <Text style={styles.profileButtonText}>Политика конфиденциальности</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('about' as never)}
              style={styles.profileButton}
              activeOpacity={0.7}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="information-circle-outline" size={20} color="#666" />
                <Text style={styles.profileButtonText}>О приложении</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8F9',
  },
  wrapper: {
    paddingBottom: 110,
    paddingTop: 20,
    width: '90%',
    alignSelf: 'center',
  },
  // CTA для неавторизованных
  ctaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  ctaIconContainer: {
    marginBottom: 16,
    borderRadius: 40,
    overflow: 'hidden',
  },
  ctaIconGradient: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
  },
  ctaTitle: {
    fontFamily: 'bold',
    fontSize: 22,
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaText: {
    fontFamily: 'regular',
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  ctaButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ctaButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'bold',
  },
  outlineButton: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F09235',
    paddingVertical: 14,
    alignItems: 'center',
  },
  outlineButtonText: {
    color: '#F09235',
    fontSize: 15,
    fontFamily: 'medium',
  },
  // Профиль
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  profileImageLoader: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  profileImage: {
    height: 110,
    width: 110,
    borderRadius: 55,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'bold',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'regular',
    color: '#666',
    marginBottom: 12,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsText: {
    fontSize: 14,
    fontFamily: 'regular',
    color: '#F09235',
    marginLeft: 6,
  },
  favoriteButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Админ кнопка
  adminButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  adminButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  adminButtonText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'bold',
    color: '#FFFFFF',
  },
  // Секции
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  buttonsContainer: {
    gap: 12,
  },
  profileButton: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  profileButtonDisabled: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 16,
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  buttonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileButtonText: {
    fontFamily: 'medium',
    fontSize: 16,
    color: '#1A1A1A',
    flex: 1,
  },
  profileButtonTextDisabled: {
    fontFamily: 'medium',
    fontSize: 16,
    color: '#999',
    flex: 1,
  },
});
