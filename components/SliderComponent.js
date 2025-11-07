import React, { useRef, useState } from 'react';
import { View, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import ImageViewing from 'react-native-image-viewing';

const { width } = Dimensions.get('window');

export const SliderComponent = ({ data }) => {
  const video = useRef(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageViewerVisible, setImageViewerVisible] = useState(false);

  const openImageViewer = (index) => {
    const imageIndex = data.filter(item => item.type === 'image').findIndex(img => img.image === data[index].image);
    setCurrentImageIndex(imageIndex);
    setImageViewerVisible(true);
  };
  

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
      return (
        <View key={index} style={{ width, height: 410 }}>
          <Video
            isMuted={false}
            volume={1.0}
            ref={video}
            source={{ uri: item.image }}
            style={{ width, height: 410 }}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls
            isLooping
          />
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
