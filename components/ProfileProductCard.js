import React, { useRef, useState, useEffect, useMemo } from 'react';
import { View, Text, Platform, Pressable, Animated, StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, radius } from '../theme/tokens';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useDeactivatePostMutation, useActivatePostMutation, useDeletePostMutation, usePayPostMutation, useApprovePostMutation } from '../api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ProfileProductCard = (props) => {
  const navigation = useNavigation();
  const video = useRef(null);

  const [deactivatePost] = useDeactivatePostMutation();
  const [activatePost]   = useActivatePostMutation();
  const [deletePost]     = useDeletePostMutation();
  const [payPost]        = usePayPostMutation();
  const [approvePost]    = useApprovePostMutation();

  const [hidden, setHidden] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const isVideo = props.media?.[0]?.type === 'video';
  const mediaUri = props.media?.[0]?.image ? `https://market.qorgau-city.kz${props.media[0].image}` : undefined;

  const isSmall = SCREEN_WIDTH < 360;     // компактные телефоны
  const isNarrow = SCREEN_WIDTH < 410;    // узкие телефоны → кнопки в столбец
  

  useEffect(() => {
    if (isVideo) {
      video.current?.playAsync();
      video.current?.setStatusAsync({ isMuted: true });
    }
  }, [isVideo]);

  const mainButtonText = useMemo(() => {
    switch (props.screen) {
      case 'Admin':     return 'Одобрить';
      case 'Active':    return 'Деактивировать';
      case 'NotActive': return 'Активировать';
      case 'Deleted':   return 'Восстановить';
      case 'Payed':     return 'Активировать';
      default:          return 'Активировать';
    }
  }, [props.screen]);

  const fadeOutAndHide = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setHidden(true));
  };

  const handleMainAction = async () => {
    try {
      if (props.screen === 'Active')      await deactivatePost(props.id);
      else if (props.screen === 'Admin')  await approvePost(props.id);
      else if (props.screen === 'NotActive') await activatePost(props.id);
      else if (props.screen === 'Deleted')   await deletePost(props.id);
      else if (props.screen === 'Payed')     await payPost(props.id);

      fadeOutAndHide();
    } catch (e) {
      console.error('Error handling post action:', e);
    }
  };

  const handleAdvertise = () => {
    navigation.navigate('PostTariffs', { id: props.id });
  };

  const handleNotApprove = async () => {
    try {
      await deactivatePost(props.id);
      fadeOutAndHide();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePost(props.id);
      fadeOutAndHide();
    } catch (e) {
      console.error(e);
    }
  };

  if (hidden) return null;

  return (
    <Animated.View
      key={props.id}
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [
            {
              scale: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.98, 1],
              }),
            },
          ],
        },
      ]}
    >
      {/* Верхняя зона с медиа и краткой информацией */}
      <Pressable
        android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
        onPress={() => navigation.navigate('ViewPost', { id: props.id })}
        style={styles.topRow}
      >
        <View style={styles.mediaWrap}>
          {mediaUri ? (
            isVideo ? (
              <View style={styles.mediaInner}>
                <Video
                  ref={video}
                  isMuted
                  source={{ uri: mediaUri }}
                  style={styles.media}
                  resizeMode={ResizeMode.COVER}
                  isLooping
                />
                <View style={styles.playOverlay}>
                  <View style={styles.playTriangle} />
                </View>
              </View>
            ) : (
              <Image
                source={{ uri: mediaUri }}
                style={styles.media}
                contentFit="cover"
                transition={150}
              />
            )
          ) : (
            <View style={[styles.media, styles.mediaPlaceholder]}>
              <Text style={styles.mediaPlaceholderText}>Нет фото</Text>
            </View>
          )}
          {props.screen !== 'Admin' && (
            <Pressable
              onPress={handleDelete}
              hitSlop={12}
              android_ripple={{ color: 'rgba(0,0,0,0.08)', borderless: true }}
              style={styles.deleteBtn}
            >
              <Image
                source={require('../assets/trash.png')}
                style={{ width: 18, height: 22, tintColor: '#fff' }}
              />
            </Pressable>
          )}
        </View>

        <View style={styles.infoWrap}>
          <Text
            numberOfLines={2}
            style={[styles.title, isSmall && { fontSize: 13 }]}
          >
            {props.title}
          </Text>
          <Text style={[styles.price, isSmall && { fontSize: 12 }]}>{props.cost}</Text>

          <View style={styles.badgesRow}>
            {!!props.condition && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{props.condition}</Text>
              </View>
            )}
            {props.mortage && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>в рассрочку</Text>
              </View>
            )}
            {props.delivery && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>доставка</Text>
              </View>
            )}
          </View>

          <Text numberOfLines={1} style={styles.subText}>{props.city || 'Астана'}</Text>
          <Text numberOfLines={1} style={styles.subText}>{props.date || 'Сегодня, 15:24'}</Text>
        </View>
      </Pressable>

      {/* Кнопки действия */}
      {!props.hideActions && (
        <View style={[styles.actionsWrap, isNarrow && styles.actionsWrapColumn]}>
          <Pressable
            onPress={props.screen !== 'Payed' ? handleMainAction : undefined}
            android_ripple={{ color: 'rgba(240,146,53,0.15)' }}
            style={[styles.outlineBtn, isNarrow && styles.buttonFull]}
          >
            <Text style={styles.outlineBtnText}>{mainButtonText}</Text>
          </Pressable>

          <Pressable
            onPress={
              props.screen === 'Admin'
                ? handleNotApprove
                : () => navigation.navigate('edit', { post: props.id })
            }
            android_ripple={{ color: 'rgba(240,146,53,0.15)' }}
            style={[styles.outlineBtn, isNarrow && styles.buttonFull]}
          >
            <Text style={styles.outlineBtnText}>
              {props.screen === 'Admin' ? 'Отклонить' : 'Редактировать'}
            </Text>
          </Pressable>
        </View>
      )}

      {/* CTA-кнопка */}
      {props.screen !== 'Admin' && (
        <Pressable
          onPress={handleAdvertise}
          style={styles.ctaWrap}
        >
          <LinearGradient
            colors={['#F3B127', '#F26D1D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaBtn}
          >
            <Text style={styles.ctaText}>
              {props.screen === 'Payed' ? 'Оплатить' : 'Рекламировать'}
            </Text>
          </LinearGradient>
        </Pressable>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 3,
      },
    }),
  },
  topRow: {
    flexDirection: 'row',
  },
  mediaWrap: {
    width: 120,
    height: 120,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#F1F2F4',
    marginRight: spacing.md,
    position: 'relative',
  },
  mediaInner: {
    flex: 1,
  },
  media: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mediaPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaPlaceholderText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  playOverlay: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderLeftColor: '#fff',
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 2,
  },
  deleteBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 30,
    height: 30,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoWrap: {
    flex: 1,
    minHeight: 120,
    paddingVertical: 2,
  },
  title: {
    fontFamily: 'medium',
    fontSize: 18,
    marginTop: 8,
    color: '#141517',
  },
  price: {
    marginTop: 6,
    fontFamily: 'medium',
    fontSize: 13.5,
    color: colors.primary,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  badge: {
    backgroundColor: '#16181B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'bold-italic',
  },
  subText: {
    fontFamily: 'regular',
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },

  actionsWrap: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  actionsWrapColumn: {
    flexDirection: 'column',
  },
  outlineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnText: {
    color: colors.primary,
    fontSize: 15,
    fontFamily: 'medium',
  },
  buttonFull: {
    width: '100%',
  },

  ctaWrap: {
    marginTop: 10,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  ctaBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#F7F8F9',
    fontSize: 16,
    fontFamily: 'medium',
  },
});
