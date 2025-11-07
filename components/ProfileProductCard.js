import React, { useRef, useState, useEffect, useMemo } from 'react';
import { View, Text, Platform, Pressable, Animated, StyleSheet, Dimensions, Modal, TextInput, Alert } from 'react-native';
import { colors, spacing, radius } from '../theme/tokens';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useDeactivatePostMutation, useActivatePostMutation, useDeletePostMutation, usePayPostMutation, useApprovePostMutation, useRejectPostMutation, useAdminDeletePostMutation } from '../api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ProfileProductCard = (props) => {
  const navigation = useNavigation();
  const video = useRef(null);

  const [deactivatePost] = useDeactivatePostMutation();
  const [activatePost]   = useActivatePostMutation();
  const [deletePost]     = useDeletePostMutation();
  const [payPost]        = usePayPostMutation();
  const [approvePost]    = useApprovePostMutation();
  const [rejectPost]     = useRejectPostMutation();
  const [adminDeletePost] = useAdminDeletePostMutation();

  const [hidden, setHidden] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminDeleteVisible, setAdminDeleteVisible] = useState(false);
  const [adminDeleteReason, setAdminDeleteReason] = useState('');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const isVideo = props.media?.[0]?.type === 'video';
  const mediaUri = props.media?.[0]?.image ? `https://market.qorgau-city.kz${props.media[0].image}` : undefined;

  const isSmall = SCREEN_WIDTH < 360;     // компактные телефоны
  const isNarrow = SCREEN_WIDTH < 410;    // узкие телефоны → кнопки в столбец
  

  // Убрано автоматическое воспроизведение - пользователь должен запустить видео сам
  // useEffect(() => {
  //   if (isVideo) {
  //     video.current?.playAsync();
  //     video.current?.setStatusAsync({ isMuted: true });
  //   }
  // }, [isVideo]);

  const mainButtonText = useMemo(() => {
    switch (props.screen) {
      case 'Admin':     return 'Одобрить';
      case 'Active':    return 'Деактивировать';
      case 'NotActive': return 'Активировать';
      case 'Deleted':   return 'Восстановить';
      case 'Payed':     return 'Активировать';
      case 'Rejected':  return 'Редактировать';
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
      else if (props.screen === 'Rejected') {
        navigation.navigate('edit', {
          postId: props.id,
          post: props.id, // для обратной совместимости
          from: 'Rejected',
          rejection_reason: props.rejection_reason || '',
        });
      }

      if (props.screen !== 'Rejected') {
        fadeOutAndHide();
      }
    } catch (e) {
      console.error('Error handling post action:', e);
    }
  };

  const handleAdvertise = () => {
    navigation.navigate('PostTariffs', { id: props.id });
  };

  const handleNotApprove = () => {
    if (props.screen === 'Admin') {
      // Для админа открываем модальное окно для ввода причины отклонения
      setRejectModalVisible(true);
    } else {
      // Для обычных пользователей старая логика
      deactivatePost(props.id).then(() => fadeOutAndHide()).catch(e => console.error(e));
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, укажите причину отклонения');
      return;
    }
    
    try {
      await rejectPost({ postId: props.id, rejection_reason: rejectionReason.trim() });
      setRejectModalVisible(false);
      setRejectionReason('');
      fadeOutAndHide();
    } catch (e) {
      console.error('Error rejecting post:', e);
      Alert.alert('Ошибка', 'Не удалось отклонить объявление');
    }
  };

  const handleRejectCancel = () => {
    setRejectModalVisible(false);
    setRejectionReason('');
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
        onPress={() => {
          // Определяем режим просмотра в зависимости от экрана
          const viewMode = (props.screen === 'Admin' || props.screen === 'Moderation' || props.screen === 'Rejected') ? 'admin' : 'view';
          navigation.navigate('ViewPost', { id: props.id, viewMode, fromScreen: props.screen });
        }}
        style={styles.topRow}
      >
        <View style={styles.mediaWrap}>
          {mediaUri ? (
            isVideo ? (
              <View style={styles.mediaInner}>
                <Video
                  ref={video}
                  isMuted={false}
                  volume={1.0}
                  source={{ uri: mediaUri }}
                  style={styles.media}
                  resizeMode={ResizeMode.CONTAIN}
                  useNativeControls
                  isLooping
                />
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
      {!props.hideActions && props.screen !== 'Payed' && (
        <View style={[styles.actionsWrap, isNarrow && styles.actionsWrapColumn]}>
          <Pressable
            onPress={props.screen !== 'Rejected' ? handleMainAction : props.screen === 'Rejected' ? handleMainAction : undefined}
            android_ripple={{ color: 'rgba(240,146,53,0.15)' }}
            style={[styles.outlineBtn, isNarrow && styles.buttonFull, props.screen === 'Rejected' && styles.buttonFull]}
          >
            <Text style={styles.outlineBtnText}>{mainButtonText}</Text>
          </Pressable>

          {props.screen !== 'Rejected' && (
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
          )}

          {props.screen === 'Admin' && (
            <Pressable
              onPress={() => setAdminDeleteVisible(true)}
              android_ripple={{ color: 'rgba(240,53,53,0.12)' }}
              style={[styles.outlineBtn, isNarrow && styles.buttonFull]}
            >
              <Text style={[styles.outlineBtnText, { color: '#D32F2F' }]}>Удалить</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Кнопка редактирования для неоплаченных постов */}
      {!props.hideActions && props.screen === 'Payed' && (
        <View style={[styles.actionsWrap, isNarrow && styles.actionsWrapColumn]}>
          <Pressable
            onPress={() => navigation.navigate('edit', { post: props.id })}
            android_ripple={{ color: 'rgba(240,146,53,0.15)' }}
            style={[styles.outlineBtn, styles.buttonFull]}
          >
            <Text style={styles.outlineBtnText}>Редактировать</Text>
          </Pressable>
        </View>
      )}

      {/* CTA-кнопка */}
      {props.screen !== 'Admin' && props.screen !== 'Rejected' && (
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

      {/* Модальное окно для отклонения поста */}
      <Modal
        visible={rejectModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleRejectCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Отклонить объявление</Text>
            <Text style={styles.modalSubtitle}>Укажите причину отклонения:</Text>
            <TextInput
              style={styles.modalInput}
              multiline
              numberOfLines={4}
              placeholder="Введите причину отклонения..."
              value={rejectionReason}
              onChangeText={setRejectionReason}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <Pressable
                onPress={handleRejectCancel}
                style={[styles.modalButton, styles.modalButtonCancel]}
              >
                <Text style={styles.modalButtonCancelText}>Отмена</Text>
              </Pressable>
              <Pressable
                onPress={handleRejectConfirm}
                style={[styles.modalButton, styles.modalButtonConfirm]}
              >
                <Text style={styles.modalButtonConfirmText}>Отклонить</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Модальное окно для удаления админом */}
      <Modal
        visible={adminDeleteVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAdminDeleteVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Удалить объявление</Text>
            <Text style={styles.modalSubtitle}>Укажите причину удаления:</Text>
            <TextInput
              style={styles.modalInput}
              multiline
              numberOfLines={4}
              placeholder="Введите причину удаления..."
              value={adminDeleteReason}
              onChangeText={setAdminDeleteReason}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setAdminDeleteVisible(false)}
                style={[styles.outlineBtn, styles.modalButton]}
              >
                <Text style={styles.outlineBtnText}>Отмена</Text>
              </Pressable>
              <Pressable
                onPress={async () => {
                  if (!adminDeleteReason.trim()) return Alert.alert('Ошибка', 'Укажите причину');
                  await adminDeletePost({ postId: props.id, reason: adminDeleteReason.trim() });
                  setAdminDeleteVisible(false);
                  setAdminDeleteReason('');
                  fadeOutAndHide();
                }}
                style={[styles.primaryBtn, styles.modalButton]}
              >
                <Text style={styles.primaryBtnText}>Удалить</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'medium',
    color: '#141517',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'regular',
    color: '#6B7280',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    fontFamily: 'regular',
    minHeight: 100,
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F3F4F6',
  },
  modalButtonCancelText: {
    color: '#6B7280',
    fontSize: 16,
    fontFamily: 'medium',
  },
  modalButtonConfirm: {
    backgroundColor: '#F09235',
  },
  modalButtonConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'medium',
  },
});
