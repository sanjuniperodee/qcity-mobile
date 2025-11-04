import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, RefreshControl, ScrollView, Text } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';

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

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return 'только что';
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays === 1) return 'вчера';
    if (diffDays < 7) return `${diffDays} дн назад`;
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const getSenderName = (item) => {
    const isSupport = 
      ((item.receiver_info?.email === 'admin@mail.ru' || item.receiver_info?.username === 'admin') && item.sender_info.username === auth.user.username) ||
      ((item.sender_info?.email === 'admin@mail.ru' || item.sender_info?.username === 'admin') && item.receiver_info.username === auth.user.username);
    
    if (isSupport) return t('messages.support');
    if (item.receiver_info.username === auth.user.username) return item.sender_info.username;
    return item.receiver_info.username;
  };

  const getSenderImage = (item) => {
    if (item.receiver_info.username === auth.user.username) {
      return item.sender_info.profile_image
        ? { uri: `https://market.qorgau-city.kz${item.sender_info.profile_image}` }
        : require('../assets/profilePurple.png');
    }
    return item.receiver_info.profile_image
      ? { uri: `https://market.qorgau-city.kz${item.receiver_info.profile_image}` }
      : require('../assets/profilePurple.png');
  };

  const isSupportChat = (item) => {
    return ((item.receiver_info?.email === 'admin@mail.ru' || item.receiver_info?.username === 'admin') && item.sender_info.username === auth.user.username) ||
           ((item.sender_info?.email === 'admin@mail.ru' || item.sender_info?.username === 'admin') && item.receiver_info.username === auth.user.username);
  };

  const filteredData = data && data.length > 0
    ? data.filter(item => 
        auth.user.email !== 'admin@mail.ru' || (auth.user.email === 'admin@mail.ru' && item.last_message)
      )
    : [];

  const messagesCount = filteredData.length;

  // --- Если пользователь не авторизован ---
  if (!isAuthenticated) {
    return (
      <View style={styles.authWrapper}>
        <View style={styles.authIconContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color="#F09235" />
        </View>
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
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#F3B127', '#F26D1D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.authButtonGradient}
          >
            <Text style={styles.authButtonText}>{t('messages.login_register')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Если пользователь авторизован ---
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#F09235']}
            tintColor="#F09235"
          />
        }
      >
        {/* Заголовок с статистикой */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#F3B127', '#F26D1D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerIcon}>
                <Ionicons name="chatbubbles" size={32} color="#FFFFFF" />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Сообщения</Text>
                <Text style={styles.headerSubtitle}>
                  {messagesCount} {messagesCount === 1 ? 'диалог' : messagesCount < 5 ? 'диалога' : 'диалогов'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Информационная карточка */}
        <View style={styles.infoCard}>
          <View style={styles.infoCardItem}>
            <Ionicons name="information-circle-outline" size={20} color="#F09235" />
            <Text style={styles.infoCardText}>
              Общайтесь с продавцами и покупателями напрямую
            </Text>
          </View>
        </View>

        {/* Список сообщений */}
        {filteredData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="chatbubbles-outline" size={64} color="#E0E0E0" />
            </View>
            <Text style={styles.emptyTitle}>{t('messages.no_messages')}</Text>
            <Text style={styles.emptySubtitle}>
              {t('messages.start_dialogue')}
            </Text>
          </View>
        ) : (
          <View style={styles.messagesContainer}>
            {filteredData.map((item, index) => (
              <React.Fragment key={item.id}>
                {index > 0 && isSupportChat(filteredData[index - 1]) && !isSupportChat(item) && (
                  <View style={styles.divider} />
                )}
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('MessagesDm', {
                      connection_id: item.id,
                      receiver: item.receiver,
                      post_id: item.post_id,
                    })
                  }
                  style={styles.messageCard}
                  activeOpacity={0.7}
                >
                  <View style={styles.avatarContainer}>
                    <Image
                      style={styles.avatar}
                      source={getSenderImage(item)}
                    />
                    {item.last_message && (
                      <View style={styles.avatarBadge} />
                    )}
                  </View>
                  <View style={styles.messageContent}>
                    <View style={styles.messageHeader}>
                      <Text style={styles.senderName} numberOfLines={1}>
                        {getSenderName(item)}
                      </Text>
                      {item.last_message && (
                        <Text style={styles.messageTime}>
                          {formatTime(item.last_message.created_at)}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.messagePreview} numberOfLines={2}>
                      {item.last_message !== null
                        ? item.last_message.text
                        : t('messages.write_app_questions')}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8F9',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontFamily: 'medium',
    fontSize: 16,
    color: '#666666',
  },
  authWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#FFFFFF',
  },
  authIconContainer: {
    marginBottom: 24,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF5E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authTitle: {
    fontSize: 24,
    fontFamily: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#1A1A1A',
  },
  authText: {
    fontSize: 15,
    fontFamily: 'regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  authButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  authButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  authButtonText: {
    color: '#fff',
    fontFamily: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    marginBottom: 20,
    borderRadius: 0,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 25,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 15,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: 'regular',
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  infoCard: {
    backgroundColor: '#FFF5E6',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#F09235',
  },
  infoCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoCardText: {
    marginLeft: 10,
    fontFamily: 'regular',
    fontSize: 13,
    color: '#B85C1A',
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 15,
    marginHorizontal: 10,
  },
  messageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F0F0',
  },
  avatarBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#F09235',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  messageContent: {
    flex: 1,
    marginRight: 8,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  senderName: {
    fontFamily: 'bold',
    fontSize: 16,
    color: '#1A1A1A',
    flex: 1,
    marginRight: 8,
  },
  messageTime: {
    fontFamily: 'regular',
    fontSize: 12,
    color: '#999999',
  },
  messagePreview: {
    fontFamily: 'regular',
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: 'bold',
    fontSize: 20,
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: 'regular',
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
  },
});
