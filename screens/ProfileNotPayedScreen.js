import React, { useRef, useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useGetNotPaidPostsQuery } from '../api';
import { ProfileProductCard } from '../components/ProfileProductCard';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export const ProfileNotPayedScreen = () => {
  const { data: notPayedPosts, isLoading, refetch } = useGetNotPaidPostsQuery();
  const video = useRef(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    video.current?.playAsync();
    video.current?.setStatusAsync({ isMuted: true });
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Вчера';
    if (diffDays < 7) return `${diffDays} дня назад`;
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const renderNotPayedPostCard = (item, index) => {
    const image = item.images && item.images[0] ? item.images[0].image : null;
    
    return (
      <View key={item.id} style={styles.postCardWrapper}>
        <View style={styles.postHeader}>
          <View style={styles.postHeaderLeft}>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Не оплачено</Text>
            </View>
            {item.date && (
              <Text style={styles.postDate}>
                {formatDate(item.date)}
              </Text>
            )}
          </View>
          <View style={styles.postInfo}>
            <Text style={styles.postId}>ID: {item.post_pk || item.id}</Text>
          </View>
        </View>
        <ProfileProductCard
          id={item.id}
          screen="Payed"
          title={item.title}
          image={image}
          cost={item.cost}
          media={item.images}
          pk={item.post_pk}
          condition={item.condition}
          mortage={item.mortage}
          delivery={item.delivery}
          city={item.geolocation}
          date={item.date}
        />
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9800" />
        <Text style={styles.loadingText}>Загрузка объявлений...</Text>
      </View>
    );
  }

  const notPayedCount = notPayedPosts?.length || 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#FF9800']}
          tintColor="#FF9800"
        />
      }
    >
      {/* Заголовок с статистикой */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#FF9800', '#F57C00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Ionicons name="card-outline" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Неоплаченные объявления</Text>
              <Text style={styles.headerSubtitle}>
                {notPayedCount} {notPayedCount === 1 ? 'объявление' : notPayedCount < 5 ? 'объявления' : 'объявлений'} требуют оплаты
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Информационная карточка */}
      <View style={styles.infoCard}>
        <View style={styles.infoCardItem}>
          <Ionicons name="information-circle-outline" size={20} color="#FF9800" />
          <Text style={styles.infoCardText}>
            Оплатите объявления, чтобы они стали активными и были видны другим пользователям
          </Text>
        </View>
      </View>

      {/* Список объявлений */}
      <View style={styles.postsContainer}>
        {notPayedPosts && notPayedPosts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="checkmark-circle-outline" size={64} color="#E0E0E0" />
            </View>
            <Text style={styles.emptyTitle}>Нет неоплаченных объявлений</Text>
            <Text style={styles.emptySubtitle}>
              Все ваши объявления оплачены. После создания нового объявления оно появится здесь
            </Text>
          </View>
        ) : (
          notPayedPosts && notPayedPosts.map((item, index) => renderNotPayedPostCard(item, index))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8F9',
  },
  contentContainer: {
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
    backgroundColor: '#FFF3E0',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  infoCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoCardText: {
    marginLeft: 10,
    fontFamily: 'regular',
    fontSize: 13,
    color: '#E65100',
    flex: 1,
  },
  postsContainer: {
    paddingHorizontal: 20,
  },
  postCardWrapper: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingBottom: 12,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  postHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFF3E0',
    marginRight: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF9800',
    marginRight: 6,
  },
  statusText: {
    fontFamily: 'medium',
    fontSize: 12,
    color: '#FF9800',
  },
  postDate: {
    fontFamily: 'regular',
    fontSize: 12,
    color: '#999999',
  },
  postInfo: {
    alignItems: 'flex-end',
  },
  postId: {
    fontFamily: 'regular',
    fontSize: 11,
    color: '#999999',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
