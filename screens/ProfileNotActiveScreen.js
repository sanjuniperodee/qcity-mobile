import React, { useState, useRef, useMemo, useEffect } from 'react';
import { View, ScrollView,Text } from 'react-native';
import { useGetNotActivePostsQuery } from '../api';
import { ProfileProductCard } from '../components/ProfileProductCard';

export const ProfileNotActiveScreen = () => {
  const { data: notActivePosts, isLoading, isError, refetch } = useGetNotActivePostsQuery();
  const video = useRef(null);

  useEffect(() => {
    video.current?.playAsync();
    video.current?.setStatusAsync({ isMuted: true });
    refetch();
  }, [notActivePosts]);

  const renderNotActivePostCard = (item) => {
    return (
      <ProfileProductCard
        id={item.id}
        screen="NotActive"
        title={item.title}
        key={item.id}
        image={item.images[0].image}
        cost={item.cost}
        pk={item.post_pk}
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
      {notActivePosts && notActivePosts.length === 0 ? (
        <Text style={{ alignSelf: 'center', fontFamily: 'medium', marginTop: 100, fontSize: 20, color: '#96949D' }}>Пусто</Text>
      ) : (
        notActivePosts && notActivePosts.map(renderNotActivePostCard)
      )}
    </View>
  </ScrollView>
  );
};
