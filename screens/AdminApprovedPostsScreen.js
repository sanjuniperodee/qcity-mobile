import React, { useRef, useEffect } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useGetAdminApprovedPostsQuery } from '../api';
import { ProfileProductCard } from '../components/ProfileProductCard';

export const AdminApprovedPostsScreen = () => {
  const { data: approvedPosts, isLoading, refetch } = useGetAdminApprovedPostsQuery();
  const video = useRef(null);

  useEffect(() => {
    video.current?.playAsync();
    video.current?.setStatusAsync({ isMuted: true });
    refetch();
  }, [approvedPosts]);

  const renderApprovedPostCard = (item) => {
    return (
      <ProfileProductCard
        id={item.id}
        screen="Admin"
        hideActions={true}
        pk={item.post_pk}
        title={item.title}
        key={item.id}
        image={item.images?.[0]?.image}
        cost={item.cost}
        media={item.images || []}
        condition={item.condition}
        mortage={item.mortage}
        delivery={item.delivery}
        city={item.geolocation}
        date={item.date}
      />
    );
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'medium', fontSize: 16, color: '#96949D' }}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <View style={{ width: '90%', alignSelf: 'center', marginTop: 10, marginBottom: 90 }}>
        {approvedPosts && approvedPosts.length === 0 ? (
          <Text style={{ alignSelf: 'center', fontFamily: 'medium', marginTop: 100, fontSize: 20, color: '#96949D' }}>Пусто</Text>
        ) : (
          approvedPosts && approvedPosts.map(renderApprovedPostCard)
        )}
      </View>
    </ScrollView>
  );
};

