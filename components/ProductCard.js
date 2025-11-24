import React, { useRef,useState,useEffect } from 'react';
import { View, Text, Dimensions, TouchableOpacity,ActivityIndicator, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { colors, spacing, radius, shadows } from '../theme/tokens';
import { useNavigation } from '@react-navigation/native';
import { Video, InterruptionModeAndroid, InterruptionModeIOS, ResizeMode } from 'expo-av';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAddToFavouritesMutation, useRemoveFromFavouritesMutation,useListFavouritesQuery } from '../api';

export const ProductCard = (props) => {
  const navigation = useNavigation()
  const { data: userFavourites, isLoading: isLoadingFavourites } = useListFavouritesQuery();
  const video = useRef(null);
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const [isFavourite, setIsFavourite] = useState(false);
  const [addToFavourites, { isLoading: isAdding }] = useAddToFavouritesMutation();
  const [removeFromFavourites, { isLoading: isRemoving }] = useRemoveFromFavouritesMutation();
  
  // Автопревью видео
  const allowAutoPreview = props.allowAutoPreview || false;
  const isVisible = props.isVisible || false;
  const shouldPlayVideo = allowAutoPreview && isVisible && props.media?.[0]?.type === 'video';

  useEffect(() => {    
    if (userFavourites && !isLoadingFavourites) {
      const isFav = userFavourites.some(fav => fav.id === props.id);
      setIsFavourite(isFav);
    }
  }, [userFavourites, isLoadingFavourites, props.id]);

  // Управление автопревью видео
  useEffect(() => {
    if (!allowAutoPreview || props.media?.[0]?.type !== 'video' || !video.current) return;

    const videoRef = video.current;
    
    const handleVisibility = async () => {
      try {
        if (shouldPlayVideo) {
          // Видео видимо - запускаем воспроизведение
          const status = await videoRef.getStatusAsync();
          if (status.isLoaded && !status.isPlaying) {
            await videoRef.playAsync();
          }
        } else {
          // Видео не видимо - ставим на паузу
          const status = await videoRef.getStatusAsync();
          if (status.isLoaded && status.isPlaying) {
            await videoRef.pauseAsync();
          }
        }
      } catch (error) {
        // Игнорируем ошибки, если видео еще не загружено
        console.log('Video visibility error:', error);
      }
    };

    handleVisibility();
  }, [shouldPlayVideo, allowAutoPreview, props.media]);

  // Остановка видео при размонтировании
  useEffect(() => {
    return () => {
      if (allowAutoPreview && props.media?.[0]?.type === 'video' && video.current) {
        video.current.pauseAsync().catch(() => {});
      }
    };
  }, [allowAutoPreview, props.media]);

  const toggleFavourite = async () => {
    if (isFavourite) {
      await removeFromFavourites(props.id);
      setIsFavourite(false);
    } else {
      await addToFavourites(props.id);
      setIsFavourite(true);
    }
  };

  const handleCardPress = () => {
    navigation.push('ViewPost', { id: props.id });
  };
  


  const [isImageLoading, setImageLoading] = useState(true);


    return (
        <TouchableOpacity 
          onPress={handleCardPress}
          activeOpacity={0.9} // Apple HIG: standard active opacity
          style={[
            styles.card,
            props.tariff === 2 && styles.cardFeatured
          ]}>
          <View>
            <View style={styles.tagsContainer}>
              <View style={styles.tagsWrapper}>
              {Array.isArray(props.extra_fields) &&
                props.extra_fields.map((extra_field, index) => (
                  <View
                    key={index}
                    style={styles.tag}
                  >
                    <Text style={styles.tagText}>
                      {extra_field}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            {props.media[0]?.type === 'video' ? 
              <View style={styles.mediaContainer}>
                {props.tariff === 1 && (
                  <View style={styles.topBadge}>
                    <LinearGradient
                      colors={[colors.primary, colors.primaryDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.topBadgeGradient}
                    >
                      <Text style={styles.topBadgeText}>ТОП</Text>
                    </LinearGradient>
                  </View>  
                )}
                <TouchableOpacity 
                  style={styles.favouriteButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleFavourite();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.favouriteButtonInner}>
                    <Ionicons 
                      name={isFavourite ? "heart" : "heart-outline"} 
                      size={22} 
                      color={isFavourite ? colors.systemRed : colors.text} 
                    />
                  </View>
                </TouchableOpacity>
                {/* Визуальный индикатор видео */}
                <View style={styles.videoBadge}>
                  <Ionicons name="videocam" size={14} color="#FFFFFF" />
                  <Text style={styles.videoBadgeText}>ВИДЕО</Text>
                </View>
                {/* Обертка для видео с pointerEvents="none" чтобы предотвратить нажатие на видео */}
                <View style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
                  <Video
                    ref={video}
                    playsInSilentModeIOS={allowAutoPreview ? true : false}
                    allowsRecordingIOS={false}
                    allowsExternalPlayback={false}
                    interruptionModeIOS={InterruptionModeIOS.DoNotMix}
                    interruptionModeAndroid={InterruptionModeAndroid.DoNotMix}
                    shouldDuckAndroid={true}
                    staysActiveInBackground={false}
                    style={{ width: '100%', height: '100%' }}
                    source={{
                      uri: `https://market.qorgau-city.kz${props.media[0].image}`,
                    }}
                    volume={0}
                    resizeMode={ResizeMode.CONTAIN}
                    useNativeControls={allowAutoPreview ? false : false}
                    isLooping={allowAutoPreview ? true : false}
                    isMuted={true}
                    shouldPlay={shouldPlayVideo}
                  />
                </View>
              </View>
            :
            <View style={styles.mediaContainer}>
                {props.tariff === 1 && (
                  <View style={{backgroundColor:colors.primary,paddingHorizontal:10,paddingVertical:5,borderRadius:10,position:'absolute',top:10,left:10,zIndex:2,}}>
                    <Text style={{fontFamily: 'bold', fontSize: 12, color: '#fff'}}>ТОП</Text>
                  </View>  
                )}
                <TouchableOpacity 
                  style={styles.favouriteButton}
                  onPress={toggleFavourite}
                  activeOpacity={0.7}
                >
                  <View style={styles.favouriteButtonInner}>
                    <Ionicons 
                      name={isFavourite ? "heart" : "heart-outline"} 
                      size={22} 
                      color={isFavourite ? colors.systemRed : colors.text} 
                    />
                  </View>
                </TouchableOpacity>
                {isImageLoading && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                  </View>
                )}
                <Image
                    style={styles.cardImage}
                    source={props.image === '/media/defaults/post.png' ? require('../assets/post.png') : {uri: `https://market.qorgau-city.kz${props.image}`}}
                    onLoadStart={() => setImageLoading(true)}
                    onLoadEnd={() => setImageLoading(false)}
                    contentFit={'cover'}
                    transition={200}
                />
            </View>
            }
          </View>

          <View style={styles.cardContent}>
            <Text
              numberOfLines={2}
              ellipsizeMode="tail"
              style={styles.cardTitle}
            >{props.title}</Text>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.cardPrice}
            >
              {props.cost} ₸
            </Text>
            <View style={styles.cardFooter}>
              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={styles.cardLocation}
                >{props.city}</Text>
              </View>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.cardDate}
              >{props.date}</Text>
            </View>
          </View>
        </TouchableOpacity>
    );
  }

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 'max-content',
    borderRadius: radius.xl, // Apple HIG: more rounded for modern look
    backgroundColor: colors.surface,
    overflow: 'hidden',
    marginBottom: spacing.md, // Space between cards
    ...shadows.lg, // Apple HIG: more prominent shadow for depth
    borderWidth: 1,
    borderColor: colors.borderLight, // Subtle border for definition
  },
  cardFeatured: {
    borderWidth: 2.5,
    borderColor: colors.primary,
    ...shadows.xl, // Extra shadow for featured cards
  },
  videoBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)', // More opaque for better visibility
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    zIndex: 2,
    ...shadows.sm, // Shadow for badge
  },
  videoBadgeText: {
    color: colors.primaryText,
    fontFamily: 'bold',
    fontSize: 11,
    marginLeft: spacing.xs,
    letterSpacing: 0.5,
  },
  tagsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    bottom: spacing.sm,
    zIndex: 2,
    left: spacing.md,
    position: 'absolute',
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  tagText: {
    fontFamily: 'bold',
    backgroundColor: colors.primary,
    fontSize: 11,
    color: colors.primaryText,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    letterSpacing: 0.3,
  },
  topBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    zIndex: 3,
    ...shadows.md,
  },
  topBadgeGradient: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  topBadgeText: {
    fontFamily: 'bold',
    fontSize: 12,
    color: colors.primaryText,
    letterSpacing: 0.5,
  },
  favouriteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: spacing.xs,
    borderRadius: radius.round,
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 3,
    ...shadows.sm,
  },
  favouriteButtonInner: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    lineHeight: 22,
    minHeight: 44,
    marginTop: spacing.xs,
    fontFamily: 'semibold',
    maxWidth: '100%',
    color: colors.text,
    letterSpacing: 0.2,
  },
  cardPrice: {
    fontFamily: 'bold',
    marginTop: spacing.sm,
    fontSize: 20,
    color: colors.primary,
    textAlign: 'left',
    lineHeight: 24,
    minHeight: 24,
    maxWidth: '100%',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  cardLocation: {
    fontFamily: 'regular',
    fontSize: 13,
    color: colors.textMuted,
    flex: 1,
  },
  cardDate: {
    fontFamily: 'regular',
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
  },
  mediaContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.bgSecondary,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
  },
});
  