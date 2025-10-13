import React, { useRef,useState,useEffect } from 'react';
import { View, Text, Platform, TouchableOpacity } from 'react-native';
import InsetShadow from "react-native-inset-shadow";
import { useNavigation } from '@react-navigation/native';
import { Video,ResizeMode } from 'expo-av';
import { Image } from 'expo-image';

export const ProductCardInfo = (props) => {
  const navigation = useNavigation()
  const video = useRef(null);

  useEffect(() => {
    video.current?.playAsync();
    video.current?.setStatusAsync({ isMuted: true });
    const checkAndMuteVideo = async () => {
      const status = await video.current?.getStatusAsync();
      if (!status?.isMuted) {
        await video.current?.setIsMutedAsync(true);
      }
    };
  
    checkAndMuteVideo();
  }, []);

  const shadowStyle = {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 2.84,
      },
      android: {
        elevation: 4,
      },
    }),
  };

    return (
        <TouchableOpacity onPress={()=>{navigation.navigate('ViewPost',{id:props.id})}} style={{...shadowStyle, width:140,height:200,marginRight:10, backgroundColor:'#ffffff',borderRadius:10,marginBottom:10}}>
          <InsetShadow
            containerStyle={{height:130,borderTopLeftRadius:5,borderTopRightRadius:5}}
            shadowRadius={2}
            shadowOffset={10}
            elevation={10}
            shadowOpacity={.3}
            color="rgba(128,128,128,1)"
            bottom={false}
          >
            {props.media[0].type === 'video' ? 
                <Video
                ref={video}
                style={{ width: 170, height: 200 }}
                source={{
                    uri: `https://market.qorgau-city.kz${props.media[0].image}`,
                }}
                volume={0.0}
                isMuted={true}
                resizeMode={ResizeMode.COVER}
                isLooping
                />
            :
              <Image style={{width:'100%',height:170,borderTopLeftRadius:5,borderTopRightRadius:5}} source={{uri:`https://market.qorgau-city.kz${props.image}`}}/>
            }
          </InsetShadow>
          <View style={{paddingHorizontal:7}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
              <View style={{width:'80%'}}>
                <Text style={{marginTop:5,fontSize:10,lineHeight:12,minHeight:20,fontFamily:'regular'}}>{props.title}</Text>
                <Text style={{fontFamily:'bold',fontSize:12,marginTop:5,}}>{props.cost}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
    );
  }
  