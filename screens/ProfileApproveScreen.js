import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useSelector } from 'react-redux';
import { useGetMyModerationPostsQuery, useGetAdminPostsQuery, useGetAdminStatsQuery } from '../api';
import { ProfileProductCard } from '../components/ProfileProductCard';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export const ProfileApproveScreen = () => {
  const user = useSelector(state => state.auth.user);
  const isAdmin = user?.email === 'admin@mail.ru';
  const { data: myModerationPosts, refetch: refetchMy, isLoading: isLoadingMy } = useGetMyModerationPostsQuery(undefined, { skip: isAdmin });
  const { data: adminPosts, refetch: refetchAdmin, isLoading: isLoadingAdmin } = useGetAdminPostsQuery(undefined, { skip: !isAdmin });
  const { data: stats } = useGetAdminStatsQuery(undefined, { skip: !isAdmin });
  const moderationPosts = isAdmin ? adminPosts : myModerationPosts;
  const isLoading = isAdmin ? isLoadingAdmin : isLoadingMy;
  const video = useRef(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    video.current?.playAsync();
    video.current?.setStatusAsync({ isMuted: true });
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    if (isAdmin) {
      await refetchAdmin();
    } else {
      await refetchMy();
    }
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

  const getPostStatus = (post) => {
    if (post.tariff === null || !post.isPayed) {
      return { label: 'Не оплачено', color: '#FF9800', bg: '#FFF3E0' };
    }
    return { label: 'Ожидает модерации', color: '#FFA500', bg: '#FFF8E1' };
  };

  const renderModerationPostCard = (item, index) => {
    const status = getPostStatus(item);
    const authorName = item.author?.username || item.author?.email?.split('@')[0] || 'Неизвестно';
    
    return (
      <View key={item.id} style={styles.postCardWrapper}>
        <View style={styles.postHeader}>
          <View style={styles.postHeaderLeft}>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <View style={[styles.statusDot, { backgroundColor: status.color }]} />
              <Text style={[styles.statusText, { color: status.color }]}>
                {status.label}
              </Text>
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
          screen={isAdmin ? 'Admin' : 'Moderation'}
          hideActions={!isAdmin}
          pk={item.post_pk}
          title={item.title}
          image={item.images?.[0]?.image}
          cost={item.cost}
          media={item.images || []}
          condition={item.condition}
          mortage={item.mortage}
          delivery={item.delivery}
          city={item.geolocation}
          date={item.date}
        />
        {isAdmin && item.author && (
          <View style={styles.postFooter}>
            <View style={styles.postFooterItem}>
              <Ionicons name="person-outline" size={14} color="#666" />
              <Text style={styles.postFooterText} numberOfLines={1}>
                {authorName}
              </Text>
            </View>
            {item.author?.email && (
              <View style={styles.postFooterItem}>
                <Ionicons name="mail-outline" size={14} color="#666" />
                <Text style={styles.postFooterText} numberOfLines={1}>
                  {item.author.email}
                </Text>
              </View>
            )}
          </View>
        )}
        {!isAdmin && (
          <View style={styles.userInfoCard}>
            <View style={styles.userInfoItem}>
              <Ionicons name="time-outline" size={16} color="#FF9800" />
              <Text style={styles.userInfoText}>
                Ваше объявление ожидает проверки администратором
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFA500" />
        <Text style={styles.loadingText}>Загрузка объявлений...</Text>
      </View>
    );
  }

  const moderationCount = moderationPosts?.length || 0;
  const statsData = stats || { moderation_posts: 0 };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#FFA500']}
          tintColor="#FFA500"
        />
      }
    >
      {/* Заголовок с статистикой */}
      <View style={styles.header}>
        <LinearGradient
          colors={isAdmin ? ['#FFA500', '#FF8C00'] : ['#FF9800', '#F57C00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Ionicons name="hourglass-outline" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Модерация</Text>
              <Text style={styles.headerSubtitle}>
                {isAdmin 
                  ? `${moderationCount} из ${statsData.moderation_posts || 0} объявлений требуют проверки`
                  : `${moderationCount} объявлений на модерации`
                }
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Информационная карточка */}
      <View style={styles.infoCard}>
        <View style={styles.infoCardItem}>
          <Ionicons 
            name={isAdmin ? "shield-checkmark-outline" : "information-circle-outline"} 
            size={20} 
            color={isAdmin ? "#FFA500" : "#FF9800"} 
          />
          <Text style={[styles.infoCardText, { color: isAdmin ? "#E65100" : "#F57C00" }]}>
            {isAdmin 
              ? "Проверьте объявления и примите решение: одобрить или отклонить"
              : "Ваши объявления находятся на проверке. После одобрения они станут активными"
            }
          </Text>
        </View>
      </View>

      {/* Список объявлений */}
      <View style={styles.postsContainer}>
        {moderationPosts && moderationPosts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons 
                name={isAdmin ? "checkmark-circle-outline" : "hourglass-outline"} 
                size={64} 
                color="#E0E0E0" 
              />
            </View>
            <Text style={styles.emptyTitle}>
              {isAdmin ? "Нет объявлений на модерации" : "Нет объявлений на модерации"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {isAdmin
                ? "Все объявления проверены. Новые объявления, требующие модерации, появятся здесь"
                : "Все ваши объявления проверены. После создания нового объявления оно появится здесь"
              }
            </Text>
          </View>
        ) : (
          moderationPosts && moderationPosts.map((item, index) => renderModerationPostCard(item, index))
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
    marginRight: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontFamily: 'medium',
    fontSize: 12,
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
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingTop: 12,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    flexWrap: 'wrap',
  },
  postFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    flex: 1,
    minWidth: '45%',
  },
  postFooterText: {
    marginLeft: 6,
    fontFamily: 'regular',
    fontSize: 12,
    color: '#666666',
    flex: 1,
  },
  userInfoCard: {
    padding: 15,
    backgroundColor: '#FFF8E1',
    borderTopWidth: 1,
    borderTopColor: '#FFE082',
  },
  userInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfoText: {
    marginLeft: 10,
    fontFamily: 'regular',
    fontSize: 13,
    color: '#E65100',
    flex: 1,
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
