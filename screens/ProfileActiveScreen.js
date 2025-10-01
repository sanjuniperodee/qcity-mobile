import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useGetActivePostsQuery } from '../api';
import { ProfileProductCard } from '../components/ProfileProductCard';

export const ProfileActiveScreen = () => {
  const { data: ActivePosts, isLoading, isError, refetch } = useGetActivePostsQuery();
  const video = useRef(null);

  useEffect(() => {
    video.current?.playAsync();
    video.current?.setStatusAsync({ isMuted: true });
    refetch();
  }, [ActivePosts]);

  const renderActivePostCard = (item) => {
    const image = item.images && item.images[0] ? item.images[0].image : null;
    return (
      <ProfileProductCard
        id={item.id}
        screen="Active"
        title={item.title}
        key={item.id}
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
    );
  };

  return (
    <ScrollView>
      <View style={{ width: '90%', alignSelf: 'center', marginTop: 10, marginBottom: 90 }}>
        {ActivePosts && ActivePosts.length === 0 ? (
          <Text style={{ alignSelf: 'center', fontFamily: 'medium', marginTop: 100, fontSize: 20, color: '#96949D' }}>Пусто</Text>
        ) : (
          ActivePosts && ActivePosts.map(renderActivePostCard)
        )}
      </View>
    </ScrollView>
  );
};

