import React, { useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useGetAdminUsersQuery } from '../api';
import { Image } from 'expo-image';

export const AdminUsersScreen = () => {
  const { data: users, isLoading, refetch } = useGetAdminUsersQuery();

  useEffect(() => {
    refetch();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указано';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const renderUserCard = (user) => {
    return (
      <View key={user.id} style={styles.userCard}>
        <View style={styles.userHeader}>
          <View style={styles.avatarContainer}>
            {user.profile_image ? (
              <Image
                source={{ uri: user.profile_image }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.username}>{user.username || 'Без имени'}</Text>
            <Text style={styles.email}>{user.email || 'Email не указан'}</Text>
            {user.phone && (
              <Text style={styles.phone}>{user.phone}</Text>
            )}
            <Text style={styles.date}>Регистрация: {formatDate(user.date_joined)}</Text>
          </View>
        </View>
        {(user.is_staff || user.is_superuser) && (
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>Администратор</Text>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {users && users.length === 0 ? (
          <Text style={styles.emptyText}>Пользователей не найдено</Text>
        ) : (
          users && users.map(renderUserCard)
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 90,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontFamily: 'medium',
    fontSize: 16,
    color: '#96949D',
  },
  emptyText: {
    alignSelf: 'center',
    fontFamily: 'medium',
    marginTop: 100,
    fontSize: 20,
    color: '#96949D',
  },
  userCard: {
    backgroundColor: '#F7F8F9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3B127',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: 'bold',
    fontSize: 24,
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontFamily: 'bold',
    fontSize: 18,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  email: {
    fontFamily: 'regular',
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  phone: {
    fontFamily: 'regular',
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  date: {
    fontFamily: 'regular',
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  adminBadge: {
    backgroundColor: '#F3B127',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  adminBadgeText: {
    fontFamily: 'medium',
    fontSize: 12,
    color: '#FFFFFF',
  },
});

