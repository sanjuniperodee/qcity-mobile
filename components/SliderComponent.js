import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, useWindowDimensions, Platform, Image as RNImage } from 'react-native';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import ImageViewing from 'react-native-image-viewing';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useResponsive } from '../hooks/useResponsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const buildAssetUri = (value) => {
  if (!value) {
    return null;
  }
  const raw = value.startsWith('http') ? value : `https://market.qorgau-city.kz${value}`;
  // iOS не воспроизводит видео с пробелами/кириллицей без кодирования
  try {
    return encodeURI(raw);
  } catch {
    return raw.replace(/\s/g, '%20');
  }
};

export const SliderComponent = ({ data }) => {
  const navigation = useNavigation();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { isWeb } = useResponsive();
  const insets = useSafeAreaInsets();
  const videoRefs = useRef({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageViewerVisible, setImageViewerVisible] = useState(false);
  const [playingVideos, setPlayingVideos] = useState({});
  const [aspectRatios, setAspectRatios] = useState({});

  // Вычисляем адаптивные размеры контейнера
  const sliderDimensions = useMemo(() => {
    const maxWidth = isWeb ? 800 : windowWidth;
    const sliderWidth = Math.min(windowWidth, maxWidth);
    // Максимальная высота: min(70vh, screenWidth*1.2) для страницы поста
    const maxHeight = Math.min(windowHeight * 0.7, sliderWidth * 1.2);
    
    return {
      width: sliderWidth,
      maxHeight,
      maxWidth,
    };
  }, [windowWidth, windowHeight, isWeb]);

  // Получаем размеры изображения
  const getImageDimensions = useCallback(async (uri, index) => {
    try {
      if (Platform.OS === 'web') {
        // Для web используем HTML Image
        return new Promise((resolve) => {
          const img = new window.Image();
          img.onload = () => {
            const aspectRatio = img.width / img.height;
            setAspectRatios(prev => ({ ...prev, [index]: aspectRatio }));
            resolve(aspectRatio);
          };
          img.onerror = () => {
            // Fallback к 1:1 если не удалось загрузить
            setAspectRatios(prev => ({ ...prev, [index]: 1 }));
            resolve(1);
          };
          img.src = uri;
        });
      } else {
        // Для мобильных используем Image.getSize из react-native (более надежный способ)
        return new Promise((resolve) => {
          RNImage.getSize(
            uri,
            (width, height) => {
              const aspectRatio = width / height;
              setAspectRatios(prev => ({ ...prev, [index]: aspectRatio }));
              resolve(aspectRatio);
            },
            (error) => {
              console.log('Image.getSize error:', error);
              // Fallback к 1:1 при ошибке
              setAspectRatios(prev => ({ ...prev, [index]: 1 }));
              resolve(1);
            }
          );
        });
      }
    } catch (error) {
      console.log('Error getting image dimensions:', error);
      // Fallback к 1:1
      setAspectRatios(prev => ({ ...prev, [index]: 1 }));
      return 1;
    }
  }, []);

  // Загружаем размеры изображений при монтировании
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    data.forEach((item, index) => {
      if (item.type === 'image' && item.image) {
        const imageUri = buildAssetUri(item.image);
        getImageDimensions(imageUri, index);
      }
    });
  }, [data, getImageDimensions]);

  const openImageViewer = (index) => {
    const imageIndex = data.filter(item => item.type === 'image').findIndex(img => img.image === data[index].image);
    setCurrentImageIndex(imageIndex);
    setImageViewerVisible(true);
  };

  const handleVideoPress = async (index) => {
    const videoRef = videoRefs.current[index];
    if (!videoRef) return;

    try {
      const status = await videoRef.getStatusAsync();
      if (status.isPlaying) {
        await videoRef.pauseAsync();
        setPlayingVideos(prev => ({ ...prev, [index]: false }));
      } else {
        await videoRef.playAsync();
        setPlayingVideos(prev => ({ ...prev, [index]: true }));
      }
    } catch (error) {
      console.log('Video play error:', error);
    }
  };

  const handlePlaybackStatusUpdate = (index, status) => {
    if (status.isLoaded) {
      setPlayingVideos(prev => ({
        ...prev,
        [index]: status.isPlaying || false,
      }));
    }
  };

  const handleVideoLoad = async (index, status) => {
    // Убеждаемся, что видео загружено и готово к воспроизведению
    const videoRef = videoRefs.current[index];
    if (videoRef) {
      try {
        await videoRef.setStatusAsync({ shouldPlay: false });
        
        // Получаем размеры видео для aspectRatio
        if (status.isLoaded && status.naturalSize) {
          const { width, height } = status.naturalSize;
          if (width && height) {
            const aspectRatio = width / height;
            setAspectRatios(prev => ({ ...prev, [index]: aspectRatio }));
          } else {
            // Fallback к 9:16 для вертикальных видео
            setAspectRatios(prev => ({ ...prev, [index]: 9 / 16 }));
          }
        } else {
          // Fallback к 9:16 если размеры недоступны
          setAspectRatios(prev => ({ ...prev, [index]: 9 / 16 }));
        }
      } catch (error) {
        console.log('Error setting video status:', error);
        // Fallback к 9:16 при ошибке
        setAspectRatios(prev => ({ ...prev, [index]: 9 / 16 }));
      }
    }
  };

  const stopAllVideos = useCallback(async () => {
    try {
      const videoRefsArray = Object.values(videoRefs.current);
      const stopPromises = videoRefsArray.map(async (videoRef) => {
        if (videoRef) {
          try {
            const status = await videoRef.getStatusAsync();
            if (status.isLoaded && status.isPlaying) {
              await videoRef.pauseAsync();
              await videoRef.setPositionAsync(0);
            }
          } catch (error) {
            console.log('Error stopping video:', error);
          }
        }
      });
      await Promise.all(stopPromises);
      setPlayingVideos({});
    } catch (error) {
      console.log('Error stopping all videos:', error);
    }
  }, []);

  // Остановка всех видео при изменении данных (переход на другое объявление)
  // Используем длину массива и первый элемент для отслеживания изменений
  const dataKey = data?.length ? `${data.length}-${data[0]?.image}` : 'empty';
  useEffect(() => {
    stopAllVideos();
    // Очищаем refs при изменении данных
    videoRefs.current = {};
  }, [dataKey, stopAllVideos]);

  // Остановка всех видео при уходе со страницы через навигацию
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      stopAllVideos();
    });
    return unsubscribe;
  }, [navigation, stopAllVideos]);

  // Остановка всех видео при размонтировании компонента
  useEffect(() => {
    return () => {
      stopAllVideos();
    };
  }, [stopAllVideos]);

  // Остановка всех видео при уходе со страницы
  useFocusEffect(
    useCallback(() => {
      return () => {
        stopAllVideos();
      };
    }, [stopAllVideos])
  );

  const renderItem = ({ item, index }) => {
    const aspectRatio = aspectRatios[index] || 1; // Fallback к 1:1 если еще не загружено
    const itemWidth = sliderDimensions.width;
    const calculatedHeight = itemWidth / aspectRatio;
    const itemHeight = Math.min(calculatedHeight, sliderDimensions.maxHeight);
    
      if (item.type === 'image') {
        const imageUri = buildAssetUri(item.image);
      return (
        <TouchableOpacity 
          key={index} 
          onPress={() => openImageViewer(index)}
          style={{ width: itemWidth, height: itemHeight }}
        >
          <Image
            style={{ width: '100%', height: '100%' }}
            source={{ uri: imageUri }}
            contentFit="contain"
            transition={200}
          />
        </TouchableOpacity>
      );
    } else if (item.type === 'video') {
      const isPlaying = playingVideos[index];
      const videoUri = buildAssetUri(item.image);
      if (!videoUri) {
        return null;
      }
      return (
        <View 
          key={index} 
          style={[
            styles.videoContainer, 
            { 
              width: itemWidth, 
              height: itemHeight,
              backgroundColor: '#000000'
            }
          ]}
        >
          {Platform.OS === 'web' ? (
            <video
              key={`${videoUri}-${index}`}
              src={videoUri}
              controls
              playsInline
              controlsList="nodownload noplaybackrate"
              preload="metadata"
              style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000000' }}
            >
              <source src={videoUri} type="video/mp4" />
            </video>
          ) : (
            <Video
              isMuted={false}
              volume={1.0}
              ref={(ref) => {
                if (ref) {
                  videoRefs.current[index] = ref;
                }
              }}
              source={{ uri: videoUri }}
              style={styles.video}
              resizeMode={ResizeMode.CONTAIN}
              useNativeControls={true}
              isLooping={false}
              playsInSilentModeIOS={true}
              playsInline={true}
              allowsExternalPlayback={false}
              shouldPlay={false}
              onPlaybackStatusUpdate={(status) => {
                handlePlaybackStatusUpdate(index, status);
                // Получаем размеры при первой загрузке
                if (status.isLoaded && status.naturalSize && !aspectRatios[index]) {
                  handleVideoLoad(index, status);
                }
              }}
            />
          )}
          {/* Визуальный индикатор видео */}
          <View style={styles.videoBadge} pointerEvents="none">
            <Ionicons name="videocam" size={16} color="#FFFFFF" />
            <Text style={styles.videoBadgeText}>ВИДЕО</Text>
          </View>
          {/* Кнопка воспроизведения (если видео не воспроизводится и нативные элементы управления скрыты) */}
          {!isPlaying && (
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => handleVideoPress(index)}
              activeOpacity={0.8}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <View style={styles.playButtonCircle}>
                <Ionicons name="play" size={40} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    return null;
  };

  return (
    <>
      <View style={[styles.container, isWeb && styles.containerWeb]}>
        <FlatList
          data={data}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => `${index}-${aspectRatios[index] || 'loading'}`}
          renderItem={renderItem}
          pagingEnabled
          snapToAlignment="center"
          decelerationRate="fast"
          snapToInterval={sliderDimensions.width}
          contentContainerStyle={isWeb && styles.flatListContentWeb}
          getItemLayout={(data, index) => ({
            length: sliderDimensions.width,
            offset: sliderDimensions.width * index,
            index,
          })}
        />
      </View>
      <ImageViewing
        images={data
          .filter(item => item.type === 'image')
          .map(item => ({ uri: buildAssetUri(item.image) }))}
        imageIndex={currentImageIndex}
        visible={isImageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
        swipeToCloseEnabled={true}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  containerWeb: {
    alignItems: 'center',
    maxWidth: 800,
    alignSelf: 'center',
  },
  flatListContentWeb: {
    alignItems: 'center',
  },
  videoContainer: {
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  videoBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  videoBadgeText: {
    color: '#FFFFFF',
    fontFamily: 'bold',
    fontSize: 12,
    marginLeft: 6,
  },
  playButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // Уменьшен zIndex, чтобы не перекрывать нативные элементы управления
  },
  playButtonCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
});
