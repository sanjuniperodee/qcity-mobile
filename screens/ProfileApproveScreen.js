import React, { useState, useRef, useMemo, useEffect } from 'react';
import { View, ScrollView,Text } from 'react-native';
import { useGetMyModerationPostsQuery } from '../api';
import { ProfileProductCard } from '../components/ProfileProductCard';

export const ProfileApproveScreen = () => {
  const { data: moderationPosts, isLoading, isError, refetch } = useGetMyModerationPostsQuery();
  const video = useRef(null);

  useEffect(() => {
    video.current?.setStatusAsync({ isMuted: true });
    video.current?.playAsync();
    refetch();
  }, [moderationPosts]);

  const renderActivePostCard = (item) => {
    return (
      <ProfileProductCard
        id={item.id}
        screen="Admin"
        pk={item.post_pk}
        title={item.title}
        key={item.id}
        image={item.images[0].image}
        cost={item.cost}
        media={item.images}
        condition={item.condition}
        mortage={item.mortage}
        delivery={item.delivery}
        city={item.geolocation}
        date={item.date}
      />
    );
  };

  return (
    <ScrollView>
    <View style={{ width: '90%', alignSelf: 'center', marginTop: 10, marginBottom: 90 }}>
      {moderationPosts && moderationPosts.length === 0 ? (
        <Text style={{ alignSelf: 'center', fontFamily: 'medium', marginTop: 100, fontSize: 20, color: '#96949D' }}>Пусто</Text>
      ) : (
        moderationPosts && moderationPosts.map(renderActivePostCard)
      )}
    </View>
  </ScrollView>
  );
};
