import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, RefreshControl, ScrollView, Text } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export const MessagesMainScreen = () => {
  const auth = useSelector((state) => state.auth);
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const isAuthenticated = !!auth?.isAuthenticated && !!auth?.token;

  const fetchData = async () => {
    try {
      const connection = await fetch('https://market.qorgau-city.kz/api/create_connection/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${auth.token}`,
        },
        body: JSON.stringify({
          message: '',
          user_receiver: 'admin',
          post_id: 0,
        }),
      });

      const response = await fetch('https://market.qorgau-city.kz/api/income_messages/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${auth.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error('Ошибка при получении сообщений:', error);
    }
  };

  const onRefresh = useCallback(() => {
    fetchData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        fetchData();
      }
    }, [isAuthenticated])
  );

  // --- Если пользователь не авторизован ---
  if (!isAuthenticated) {
    return (
      <View style={styles.authWrapper}>
        <Ionicons name="person-outline" size={40} color="#F09235" />
        <Text style={styles.authTitle}>{t('messages.login_required')}</Text>
        <Text style={styles.authText}>
          {t('messages.login_required_text')}
        </Text>
        <TouchableOpacity
          style={styles.authButton}
          onPress={() => {
            const parent = navigation.getParent?.();
            if (parent) {
              parent.navigate('Auth', { screen: 'LoginOrRegistration' });
            } else {
              navigation.navigate('Auth', { screen: 'LoginOrRegistration' });
            }
          }}
        >
          <Text style={styles.authButtonText}>{t('messages.login_register')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Если пользователь авторизован ---
  return (
    <ScrollView
      style={{ marginTop: 20, width: '90%', alignSelf: 'center' }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {data && data.length > 0 ? (
        data.map((item) =>
          auth.user.username !== 'admin' || (auth.user.username === 'admin' && item.last_message) ? (
            <React.Fragment key={item.id}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('MessagesDm', {
                    connection_id: item.id,
                    receiver: item.receiver,
                    post_id: item.post_id,
                  })
                }
                style={styles.messageCard}
              >
                <Image
                  style={{ height: 36, width: 36, borderRadius: 100 }}
                  source={
                    item.receiver_info.username === auth.user.username
                      ? item.sender_info.profile_image
                        ? { uri: `https://market.qorgau-city.kz${item.sender_info.profile_image}` }
                        : require('../assets/profilePurple.png')
                      : item.receiver_info.profile_image
                      ? { uri: `https://market.qorgau-city.kz${item.receiver_info.profile_image}` }
                      : require('../assets/profilePurple.png')
                  }
                />
                <View style={{ marginLeft: 10 }}>
                  <Text style={{ fontFamily: 'medium', fontSize: 16 }}>
                    {(item.receiver_info.username === 'admin' && item.sender_info.username === auth.user.username) ||
                    (item.sender_info.username === 'admin' && item.receiver_info.username === auth.user.username)
                      ? t('messages.support')
                      : item.receiver_info.username === auth.user.username
                      ? item.sender_info.username
                      : item.receiver_info.username}
                  </Text>
                  <Text style={{ fontFamily: 'regular', fontSize: 14, color: '#9C9C9C' }}>
                    {item.last_message !== null
                      ? item.last_message.text
                      : t('messages.write_app_questions')}
                  </Text>
                </View>
              </TouchableOpacity>
              {(item.receiver_info.username === 'admin' && item.sender_info.username === auth.user.username) ||
              (item.sender_info.username === 'admin' && item.receiver_info.username === auth.user.username) ? (
                <View style={{ marginTop: 15, borderTopWidth: 1, opacity: 0.15, paddingTop: 15 }} />
              ) : null}
            </React.Fragment>
          ) : null
        )
      ) : (
        <View>
          <Text
            style={{
              alignSelf: 'center',
              fontSize: 20,
              fontFamily: 'medium',
              marginTop: 100,
              color: '#6C6C6C',
            }}
          >
            {t('messages.no_messages')}
          </Text>
          <Text
            style={{
              alignSelf: 'center',
              fontSize: 15,
              fontFamily: 'regular',
              marginTop: 15,
              color: '#F09235',
            }}
          >
            {t('messages.start_dialogue')}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  authWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    marginTop: -70,
  },
  authTitle: {
    fontSize: 20,
    fontFamily: 'medium',
    marginBottom: 6,
    marginTop: 20,
  },
  authText: {
    fontSize: 14,
    fontFamily: 'regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  authButton: {
    backgroundColor: '#F09235',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  authButtonText: {
    color: '#fff',
    fontFamily: 'medium',
    fontSize: 16,
  },
  messageCard: {
    borderRadius: 10,
    backgroundColor: '#F6F6F6',
    width: '100%',
    height: 60,
    paddingHorizontal: 10,
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
  },
});
