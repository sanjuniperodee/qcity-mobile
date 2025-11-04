import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image, Text, ActivityIndicator } from 'react-native';
import { useGetAdminStatsQuery } from '../api';
import { LinearGradient } from 'expo-linear-gradient';

export const ProfileadminScreen = () => {
  const navigation = useNavigation();
  const { data: stats, isLoading, error } = useGetAdminStatsQuery();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F3B127" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Ошибка загрузки данных</Text>
      </View>
    );
  }

  const statsData = stats || {
    user_count: 0,
    post_count: 0,
    active_posts: 0,
    moderation_posts: 0,
    approved_posts: 0,
    rejected_posts: 0,
    deleted_posts: 0,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Image 
        style={styles.logo} 
        source={require('../assets/profileLogo.png')}
      />

      {/* Статистика */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Статистика</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['#F3B127', '#F26D1D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.statCardGradient}
            >
              <Text style={styles.statNumber}>{statsData.user_count || 0}</Text>
              <Text style={styles.statLabel}>Пользователей</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.statCard}>
            <LinearGradient
              colors={['#4A90E2', '#357ABD']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.statCardGradient}
            >
              <Text style={styles.statNumber}>{statsData.post_count || 0}</Text>
              <Text style={styles.statLabel}>Всего объявлений</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={['#50C878', '#3A9D5D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.statCardGradient}
            >
              <Text style={styles.statNumber}>{statsData.active_posts || 0}</Text>
              <Text style={styles.statLabel}>Активных</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={['#FFA500', '#FF8C00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.statCardGradient}
            >
              <Text style={styles.statNumber}>{statsData.moderation_posts || 0}</Text>
              <Text style={styles.statLabel}>На модерации</Text>
            </LinearGradient>
          </View>
        </View>
      </View>

      {/* Объявления */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Объявления</Text>
        
        <TouchableOpacity 
          onPress={() => navigation.navigate('approve')} 
          style={styles.actionButton}
        >
          <View style={styles.actionButtonContent}>
            <View style={styles.actionButtonIcon}>
              <Text style={styles.actionButtonIconText}>⏳</Text>
            </View>
            <View style={styles.actionButtonTextContainer}>
              <Text style={styles.actionButtonTitle}>На модерации</Text>
              <Text style={styles.actionButtonSubtitle}>
                {statsData.moderation_posts || 0} объявлений требуют проверки
              </Text>
            </View>
            <Image style={styles.chevron} source={require('../assets/arrowRight.png')} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('adminApproved')} 
          style={styles.actionButton}
        >
          <View style={styles.actionButtonContent}>
            <View style={[styles.actionButtonIcon, { backgroundColor: '#E8F5E9' }]}>
              <Text style={[styles.actionButtonIconText, { color: '#4CAF50' }]}>✓</Text>
            </View>
            <View style={styles.actionButtonTextContainer}>
              <Text style={styles.actionButtonTitle}>Одобренные</Text>
              <Text style={styles.actionButtonSubtitle}>
                {statsData.approved_posts || 0} объявлений одобрено
              </Text>
            </View>
            <Image style={styles.chevron} source={require('../assets/arrowRight.png')} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('adminRejected')} 
          style={styles.actionButton}
        >
          <View style={styles.actionButtonContent}>
            <View style={[styles.actionButtonIcon, { backgroundColor: '#FFEBEE' }]}>
              <Text style={[styles.actionButtonIconText, { color: '#F44336' }]}>✗</Text>
            </View>
            <View style={styles.actionButtonTextContainer}>
              <Text style={styles.actionButtonTitle}>Отклоненные</Text>
              <Text style={styles.actionButtonSubtitle}>
                {statsData.rejected_posts || 0} объявлений отклонено
              </Text>
            </View>
            <Image style={styles.chevron} source={require('../assets/arrowRight.png')} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Пользователи */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Пользователи</Text>
        
        <TouchableOpacity 
          onPress={() => navigation.navigate('adminUsers')} 
          style={styles.actionButton}
        >
          <View style={styles.actionButtonContent}>
            <View style={[styles.actionButtonIcon, { backgroundColor: '#E3F2FD' }]}>
              <Text style={[styles.actionButtonIconText, { color: '#2196F3' }]}>👥</Text>
            </View>
            <View style={styles.actionButtonTextContainer}>
              <Text style={styles.actionButtonTitle}>Все пользователи</Text>
              <Text style={styles.actionButtonSubtitle}>
                {statsData.user_count || 0} зарегистрированных пользователей
              </Text>
            </View>
            <Image style={styles.chevron} source={require('../assets/arrowRight.png')} />
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontFamily: 'medium',
    fontSize: 16,
    color: '#F44336',
  },
  logo: {
    alignSelf: 'center',
    width: '100%',
    height: 30,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  statsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontFamily: 'bold',
    fontSize: 20,
    marginBottom: 15,
    color: '#1A1A1A',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  statCard: {
    width: '48%',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statCardGradient: {
    padding: 20,
    borderRadius: 15,
  },
  statNumber: {
    fontFamily: 'bold',
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  statLabel: {
    fontFamily: 'medium',
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  actionButton: {
    backgroundColor: '#F7F8F9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionButtonIconText: {
    fontSize: 24,
    color: '#FF9800',
  },
  actionButtonTextContainer: {
    flex: 1,
  },
  actionButtonTitle: {
    fontFamily: 'medium',
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  actionButtonSubtitle: {
    fontFamily: 'regular',
    fontSize: 13,
    color: '#666666',
  },
  chevron: {
    width: 20,
    height: 20,
    tintColor: '#999999',
  },
});
