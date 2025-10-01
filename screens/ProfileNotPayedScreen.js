import React, { useState, useRef, useMemo, useEffect } from 'react';
import { View, ScrollView,Text } from 'react-native';
import { useGetNotPaidPostsQuery } from '../api';
import { ProfileProductCard } from '../components/ProfileProductCard';

export const ProfileNotPayedScreen = () => {
  const { data: NotPayedPosts, isLoading, isError, refetch } = useGetNotPaidPostsQuery();
  const video = useRef(null);

  useEffect(() => {
    video.current?.playAsync();
    video.current?.setStatusAsync({ isMuted: true });
    refetch();
  }, [NotPayedPosts]);

  const renderActivePostCard = (item) => {
    return (
      <ProfileProductCard
        id={item.id}
        screen="Payed"
        title={item.title}
        key={item.id}
        image={item.images[0].image}
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
      {NotPayedPosts && NotPayedPosts.length === 0 ? (
        <Text style={{ alignSelf: 'center', fontFamily: 'medium', marginTop: 100, fontSize: 20, color: '#96949D' }}>Пусто</Text>
      ) : (
        NotPayedPosts && NotPayedPosts.map(renderActivePostCard)
      )}
    </View>
  </ScrollView>
  );
};
