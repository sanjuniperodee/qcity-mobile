import React, { useRef,useState,useEffect } from 'react';
import { View, Text, Dimensions, TouchableOpacity,ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme/tokens';
import { useNavigation } from '@react-navigation/native';
import { Video, InterruptionModeAndroid, InterruptionModeIOS, ResizeMode } from 'expo-av';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
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

  useEffect(() => {    
    if (userFavourites && !isLoadingFavourites) {
      const isFav = userFavourites.some(fav => fav.id === props.id);
      setIsFavourite(isFav);
    }
  }, [userFavourites, isLoadingFavourites, props.id]);

  const toggleFavourite = async () => {
    if (isFavourite) {
      await removeFromFavourites(props.id);
      setIsFavourite(false);
    } else {
      await addToFavourites(props.id);
      setIsFavourite(true);
    }
  };

  const handleCardPress = async () => {
    // Останавливаем видео перед навигацией, если оно воспроизводится
    if (props.media[0]?.type === 'video' && video.current) {
      try {
        const status = await video.current.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await video.current.pauseAsync();
        }
      } catch (error) {
        console.log('Error stopping video:', error);
      }
    }
    navigation.push('ViewPost', { id: props.id });
  };
  


  const [isImageLoading, setImageLoading] = useState(true);


    return (
        <TouchableOpacity 
          onPress={handleCardPress}
          style={{
            width: '100%',
            height: 'max-content',
            // Let content define height; keep a minimal height to avoid collapse
            borderRadius: radius.md,
            borderWidth: props.tariff === 2 ? 2 : 0, 
            borderColor: props.tariff === 2 ? colors.primary : 'transparent',
            backgroundColor: '#FFFFFF',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2
          }}>
          <View>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',bottom:10,zIndex:2,left:10,position:'absolute'}}>
              <View style={{flexDirection:'row',marginTop:4}}>
              {Array.isArray(props.extra_fields) &&
                props.extra_fields.map((extra_field, index) => (
                  <View
                    key={index}
                    style={{
                      borderRadius: 5,
                      overflow: 'hidden',
                      marginRight: 3,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'bold',
                        backgroundColor: colors.primary,
                        fontSize: 11,
                        color: colors.primaryText,
                        paddingHorizontal: 5,
                        paddingVertical: 3,
                      }}
                    >
                      {extra_field}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            {props.media[0]?.type === 'video' ? 
              <View style={{position:'relative', width:'100%', aspectRatio:1, borderRadius:8, overflow:'hidden', backgroundColor:'#000000'}}>
                {props.tariff === 1 && (
                  <View style={{backgroundColor:colors.primary,paddingHorizontal:10,paddingVertical:5,borderRadius:10,position:'absolute',top:10,left:10,zIndex:3,}}>
                    <Text style={{fontFamily: 'bold', fontSize: 12, color: '#fff'}}>ТОП</Text>
                  </View>  
                )}
                <TouchableOpacity 
                  style={{backgroundColor:'rgba(255,255,255,0.6)',padding:5,borderRadius:10,position:'absolute',top:5,right:5,zIndex:3}} 
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleFavourite();
                  }}
                >
                  <Image
                    source={isFavourite ? require('../assets/Heart.png') : require('../assets/Favorite.png')}
                    style={{ height: 23, width: 25, objectFit:'contain' }}
                  />
                </TouchableOpacity>
                {/* Визуальный индикатор видео */}
                <View style={styles.videoBadge}>
                  <Ionicons name="videocam" size={14} color="#FFFFFF" />
                  <Text style={styles.videoBadgeText}>ВИДЕО</Text>
                </View>
                <Video
                  ref={video}
                  playsInSilentModeIOS={false}
                  allowsRecordingIOS={false}
                  interruptionModeIOS={InterruptionModeIOS.DoNotMix}
                  interruptionModeAndroid={InterruptionModeAndroid.DoNotMix}
                  shouldDuckAndroid={true}
                  staysActiveInBackground={false}
                  style={{ width: '100%', height: '100%' }}
                  source={{
                    uri: `https://market.qorgau-city.kz${props.media[0].image}`,
                  }}
                  volume={1.0}
                  resizeMode={ResizeMode.CONTAIN}
                  useNativeControls
                  isLooping={false}
                  isMuted={false}
                  shouldPlay={false}
                />
              </View>
            :
            <View style={{position:'relative', width:'100%', aspectRatio:1, borderRadius:8, overflow:'hidden'}}>
                {props.tariff === 1 && (
                  <View style={{backgroundColor:colors.primary,paddingHorizontal:10,paddingVertical:5,borderRadius:10,position:'absolute',top:10,left:10,zIndex:2,}}>
                    <Text style={{fontFamily: 'bold', fontSize: 12, color: '#fff'}}>ТОП</Text>
                  </View>  
                )}
                <TouchableOpacity style={{backgroundColor:'rgba(255,255,255,0.6)',padding:5,borderRadius:10,position:'absolute',top:5,right:5,zIndex:2}} onPress={toggleFavourite}>
                  <Image
                    source={isFavourite ? require('../assets/Heart.png') : require('../assets/Favorite.png')}
                    style={{ height: 23, width: 25,objectFit:'contain' }}
                  />
                </TouchableOpacity>
                {isImageLoading && <ActivityIndicator style={{ position: 'absolute', width: '100%', height: '100%' }} />}
                <Image
                    style={{width:'100%', height:'100%'}}
                    source={props.image === '/media/defaults/post.png' ? require('../assets/post.png') : {uri: `https://market.qorgau-city.kz${props.image}`}}
                    onLoadStart={() => setImageLoading(true)}
                    onLoadEnd={() => setImageLoading(false)}
                    contentFit={'cover'}
                />
            </View>
            }
          </View>

          <View style={{paddingHorizontal:spacing.sm}}>
            <Text
              numberOfLines={2}
              ellipsizeMode="tail"
              style={{
                opacity:.9,
                fontSize:15,
                lineHeight:20,
                minHeight:40,
                marginTop:10,
                fontFamily:'medium',
                maxWidth:'100%'
              }}
            >{props.title}</Text>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                fontFamily:'medium',
                marginTop:5,
                fontSize:18,
                color:colors.text,
                textAlign:'left',
                lineHeight:22,
                minHeight:22,
                maxWidth:'100%'
              }}
            >
              {props.cost} ₸
            </Text>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{fontFamily:'regular',fontSize:12,color:colors.textMuted, width:'56%'}}
              >{props.city}</Text>
              <View style={{width:'42%', alignItems:'flex-end'}}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{fontFamily:'regular',fontSize:12,color:colors.textMuted, textAlign:'right'}}
                >{props.date}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
    );
  }

const styles = StyleSheet.create({
  videoBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    zIndex: 2,
  },
  videoBadgeText: {
    color: '#FFFFFF',
    fontFamily: 'bold',
    fontSize: 10,
    marginLeft: 4,
  },
});
  