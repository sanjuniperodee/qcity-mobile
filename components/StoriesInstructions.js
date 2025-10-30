import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  Dimensions,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { PanResponder } from 'react-native';

const { width, height } = Dimensions.get('window');
const SLIDE_DURATION = 5000;

/**
 * Component for displaying instructions for stories.
 *
 * @param {{ visible: boolean, onClose: Function, story: { title: string, slides: { image: string }[] } }} props
 * @prop {boolean} visible - whether the component is visible
 * @prop {Function} onClose - callback to call when the user wants to close the instructions
 * @prop {{ title: string, slides: { image: string }[] }} story - story object with title and slides
 * @returns {ReactElement} - instructions component
 */
export const StoriesInstructions = ({ visible, onClose, story }) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef(null);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > 20, // активируем при вертикальном свайпе
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          onClose(); // свайп вниз
        }
      },
    })
  ).current;
  

  const currentSlide = story?.slides?.[slideIndex];  

  useEffect(() => {
    if (!visible) return;
  
    setSlideIndex(0); // сбрасываем при открытии
  }, [visible]);
  
  useEffect(() => {
    if (!visible || !currentSlide) return;
    startProgress();
  
    return () => {
      progress.stopAnimation();
      clearTimeout(timeoutRef.current);
    };
  }, [slideIndex]);
  

  const startProgress = () => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: SLIDE_DURATION,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !isPaused) nextSlide();
    });
  };

  const nextSlide = () => {
    if (slideIndex < story.slides.length - 1) {
      setSlideIndex(slideIndex + 1);
    } else {
      onClose(); 
    }
  };

  const prevSlide = () => {
    if (slideIndex > 0) {
      setSlideIndex(slideIndex - 1);
    }
  };

  const handlePress = (e) => {
    const x = e.nativeEvent.locationX;
    if (x < width / 2) {
      prevSlide();
    } else {
      nextSlide();
    }
  };

  const handlePressIn = () => {
    setIsPaused(true);
    progress.stopAnimation();
  };

  const handlePressOut = () => {
    setIsPaused(false);
    startProgress();
  };

  if (!visible || !story) return null;
  if (!story || !currentSlide) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View {...panResponder.panHandlers}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
          <Text style={styles.closeTxt}>✕</Text>
        </TouchableOpacity>
        <TouchableWithoutFeedback
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <ImageBackground
            source={currentSlide.image}
            style={styles.image}
            imageStyle={{ borderRadius: 0 }}
          >
            <View style={styles.progressContainer}>
              {story.slides.map((_, index) => (
                <View key={index} style={styles.progressBackground}>
                  {index === slideIndex ? (
                    <Animated.View
                      style={[
                        styles.progressBar,
                        {
                          width: progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                          }),
                        },
                      ]}
                    />
                  ) : (
                    <View
                      style={[
                        styles.progressBar,
                        { width: index < slideIndex ? '100%' : '0%' },
                      ]}
                    />
                  )}
                </View>
              ))}
            </View>
            <View style={styles.bottomOverlay}>
              <Text style={styles.title}>{story.title}</Text>
            </View>
          </ImageBackground>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  image: {
    width,
    height,
    justifyContent: 'space-between',
  },
  closeBtn: {
    position: 'absolute',
    right: 12,
    top: 28,
    zIndex: 5,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeTxt: { color: '#fff', fontSize: 18, lineHeight: 18 },
  progressContainer: {
    flexDirection: 'row',
    paddingTop: 50,
    paddingHorizontal: 10,
  },
  progressBackground: {
    flex: 1,
    height: 4,
    backgroundColor: '#555',
    borderRadius: 2,
    marginHorizontal: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#fff',
  },
  bottomOverlay: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 12,
    marginBottom: 30,
  },
  title: {
    color: '#fff',
    fontSize: 16,
  },
});
