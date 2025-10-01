import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Text, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

export const ProfileMainScreen = () => {
  const navigation = useNavigation();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);
  const [isImageLoading, setImageLoading] = useState(true);


  // --- Если пользователь НЕ авторизован: показываем красивый CTA-блок ---
  if (!isAuthenticated) {
    return (
      <ScrollView>
        <View style={styles.wrapper}>
          <View style={styles.ctaCard}>
            <Ionicons name="person-outline" size={40} color="#F09235" />
            <Text style={styles.ctaTitle}>Войдите в аккаунт</Text>
            <Text style={styles.ctaText}>
              Чтобы управлять профилем и размещать/редактировать объявления, пожалуйста, войдите в аккаунт.
            </Text>
            <TouchableOpacity style={styles.ctaButton} onPress={() => navigation.navigate('Auth', { screen: 'Login' })}>
              <Text style={styles.ctaButtonText}>Войти</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => navigation.navigate('Auth', { screen: 'Signup' })}
            >
              <Text style={styles.outlineButtonText}>Зарегистрироваться</Text>
            </TouchableOpacity>
          </View>

          {/* Подсказки-«серые» пункты меню — можно тапать, перекидываем на авторизацию */}
          <Text style={styles.sectionTitle}>Мои объявления</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Auth', { screen: 'Signup' })} style={styles.profileButtonDisabled}>
            <Text style={styles.profileButtonText}>Активные</Text>
            <Image style={styles.chevron} source={require('../assets/arrowRight.png')} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Auth', { screen: 'Signup' })} style={styles.profileButtonDisabled}>
            <Text style={styles.profileButtonText}>Не активные</Text>
            <Image style={styles.chevron} source={require('../assets/arrowRight.png')} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Auth', { screen: 'Signup' })} style={styles.profileButtonDisabled}>
            <Text style={styles.profileButtonText}>Не оплаченные</Text>
            <Image style={styles.chevron} source={require('../assets/arrowRight.png')} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Auth', { screen: 'Signup' })} style={styles.profileButtonDisabled}>
            <Text style={styles.profileButtonText}>Удаленные</Text>
            <Image style={styles.chevron} source={require('../assets/arrowRight.png')} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // --- Если пользователь авторизован: показываем прежний экран ---
  return (
    <ScrollView>
      <View horizontal={false} style={{ paddingBottom: 110, paddingTop: 20, width: '90%', alignSelf: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          {isImageLoading && <ActivityIndicator style={{ position: 'absolute', width: 170, height: 170 }} />}
          <Image
            style={{ height: 110, width: 110, borderRadius: 150, marginRight: 15 }}
            source={
              user?.profile_image
                ? { uri: `http://market.qorgau-city.kz${user.profile_image}` }
                : require('../assets/profilePurple.png')
            }
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
          />
          <View>
            <Text style={{ fontSize: 16, fontFamily: 'medium', marginBottom: 10 }}>{user?.username}</Text>
            <Text style={{ fontSize: 14, fontFamily: 'regular', marginBottom: 10 }}>{user?.email}</Text>
            <TouchableOpacity onPress={() => { navigation.navigate('ProfileSettings' as never); }} style={{ flexDirection: 'row' }}>
              <Image style={{ width: 16, height: 16 }} source={require('../assets/profile_settings.png')} />
              <Text style={{ fontSize: 14, fontFamily: 'regular', marginLeft: 6 }}>настройки профиля</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => { navigation.navigate('Favourite' as never); }} style={{ position: 'absolute', right: 10, top: 10 }}>
            <Image style={{ width: 22, height: 19, objectFit: 'contain' as any }} source={require('../assets/Favorite.png')} />
          </TouchableOpacity>
        </View>

        {user?.username === 'admin' ? (
          <TouchableOpacity onPress={() => { navigation.navigate('admin' as never); }} style={styles.profileButton}>
            <Text style={{ fontFamily: 'medium', fontSize: 16, opacity: 0.8 }}>Админ панель</Text>
            <Image style={styles.chevron} source={require('../assets/arrowRight.png')} />
          </TouchableOpacity>
        ) : null}

        <Text style={styles.sectionTitle}>Мои объявления</Text>
        <TouchableOpacity onPress={() => { navigation.navigate('active' as never); }} style={styles.profileButton}>
          <Text style={styles.profileButtonText}>Активные</Text>
          <Image style={styles.chevron} source={require('../assets/arrowRight.png')} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { navigation.navigate('notactive' as never); }} style={styles.profileButton}>
          <Text style={styles.profileButtonText}>Не активные</Text>
          <Image style={styles.chevron} source={require('../assets/arrowRight.png')} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { navigation.navigate('notpayed' as never); }} style={styles.profileButton}>
          <Text style={styles.profileButtonText}>Не оплаченные</Text>
          <Image style={styles.chevron} source={require('../assets/arrowRight.png')} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { navigation.navigate('deleted' as never); }} style={styles.profileButton}>
          <Text style={styles.profileButtonText}>Удаленные</Text>
          <Image style={styles.chevron} source={require('../assets/arrowRight.png')} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Другое</Text>
        <TouchableOpacity onPress={() => { navigation.navigate('Terms' as never); }} style={styles.profileButton}>
          <Text style={styles.profileButtonText}>Условия пользования</Text>
          <Image style={styles.chevron} source={require('../assets/arrowRight.png')} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { navigation.navigate('Policy' as never); }} style={styles.profileButton}>
          <Text style={styles.profileButtonText}>Политика конфиденциальности</Text>
          <Image style={styles.chevron} source={require('../assets/arrowRight.png')} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { navigation.navigate('about' as never); }} style={styles.profileButton}>
          <Text style={styles.profileButtonText}>О приложении</Text>
          <Image style={styles.chevron} source={require('../assets/arrowRight.png')} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingBottom: 110,
    paddingTop: 30,
    width: '90%',
    alignSelf: 'center',
  },
  ctaCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    padding: 18,
    alignItems: 'center',
    marginBottom: 24,
  },
  ctaTitle: {
    fontFamily: 'medium',
    fontSize: 20,
    color: '#141517',
    marginTop: 16,
    marginBottom: 6,
  },
  ctaText: {
    fontFamily: 'regular',
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 14,
  },
  ctaButton: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#F09235',
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'medium',
  },
  outlineButton: {
    width: '100%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F09235',
    paddingVertical: 12,
    alignItems: 'center',
  },
  outlineButtonText: {
    color: '#F09235',
    fontSize: 15,
    fontFamily: 'medium',
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'medium',
    marginTop: 10,
    marginBottom: 20,
  },
  profileButton: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fafafa',
    borderRadius: 12,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 10,
  },
  profileButtonDisabled: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    borderColor: '#e5e7eb',
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 10,
    opacity: 0.7,
  },
  profileButtonText: {
    fontFamily: 'medium',
    fontSize: 16,
    opacity: 0.85,
  },
  chevron: {
    height: 16,
    width: 8,
    resizeMode: 'contain',
  },
});
