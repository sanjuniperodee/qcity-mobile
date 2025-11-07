import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, Dimensions, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import ImageViewing from 'react-native-image-viewing';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export const SliderComponent = ({ data }) => {
  const navigation = useNavigation();
  const videoRefs = useRef({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageViewerVisible, setImageViewerVisible] = useState(false);
  const [playingVideos, setPlayingVideos] = useState({});

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
    if (item.type === 'image') {
      return (
        <TouchableOpacity key={index} onPress={() => openImageViewer(index)}>
          <Image
            style={{ width, height: 410 }}
            source={{ uri: item.image }}
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    } else if (item.type === 'video') {
      const isPlaying = playingVideos[index];
      return (
        <View key={index} style={styles.videoContainer}>
          <Video
            isMuted={false}
            volume={1.0}
            ref={(ref) => {
              if (ref) {
                videoRefs.current[index] = ref;
              }
            }}
            source={{ uri: item.image }}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls
            isLooping
            onPlaybackStatusUpdate={(status) => handlePlaybackStatusUpdate(index, status)}
          />
          {/* Визуальный индикатор видео */}
          <View style={styles.videoBadge}>
            <Ionicons name="videocam" size={16} color="#FFFFFF" />
            <Text style={styles.videoBadgeText}>ВИДЕО</Text>
          </View>
          {/* Кнопка воспроизведения (если видео не воспроизводится) */}
          {!isPlaying && (
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => handleVideoPress(index)}
              activeOpacity={0.8}
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
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        pagingEnabled
        snapToAlignment="center"
        decelerationRate="fast"
        snapToInterval={width}
      />
      <ImageViewing
        images={data.filter(item => item.type === 'image').map(item => ({ uri: item.image }))}
        imageIndex={currentImageIndex}
        visible={isImageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
        swipeToCloseEnabled={true}
      />
    </>
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    width: width,
    height: 410,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
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
    zIndex: 5,
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
