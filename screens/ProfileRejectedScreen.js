import React, { useState, useRef, useMemo, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { useGetRejectedPostsQuery } from '../api';
import { ProfileProductCard } from '../components/ProfileProductCard';

export const ProfileRejectedScreen = () => {
  const { data: rejectedPosts, isLoading, isError, refetch } = useGetRejectedPostsQuery();
  const video = useRef(null);

  useEffect(() => {
    video.current?.playAsync();
    video.current?.setStatusAsync({ isMuted: true });
    refetch();
  }, [rejectedPosts]);

  const renderRejectedPostCard = (item) => {
    return (
      <View key={item.id} style={styles.postContainer}>
        <ProfileProductCard
          id={item.id}
          screen="Rejected"
          title={item.title}
          image={item.images?.[0]?.image}
          cost={item.cost}
          pk={item.post_pk}
          media={item.images || []}
          condition={item.condition}
          mortage={item.mortage}
          delivery={item.delivery}
          city={item.geolocation}
          date={item.date}
        />
        {item.rejection_reason && (
          <View style={styles.rejectionReasonContainer}>
            <Text style={styles.rejectionReasonLabel}>Причина отклонения:</Text>
            <Text style={styles.rejectionReasonText}>{item.rejection_reason}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView>
      <View style={{ width: '90%', alignSelf: 'center', marginTop: 10, marginBottom: 90 }}>
        {rejectedPosts && rejectedPosts.length === 0 ? (
          <Text style={{ alignSelf: 'center', fontFamily: 'medium', marginTop: 100, fontSize: 20, color: '#96949D' }}>Пусто</Text>
        ) : (
          rejectedPosts && rejectedPosts.map(renderRejectedPostCard)
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  postContainer: {
    marginBottom: 15,
  },
  rejectionReasonContainer: {
    backgroundColor: '#FFF3CD',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  rejectionReasonLabel: {
    fontFamily: 'medium',
    fontSize: 14,
    color: '#FF9800',
    marginBottom: 6,
  },
  rejectionReasonText: {
    fontFamily: 'regular',
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
});

