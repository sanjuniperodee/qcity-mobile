import React, { useState, useRef, useMemo, useEffect } from 'react';
import { View, StyleSheet, TextInput,  TouchableOpacity, FlatList, ScrollView, Image, Text } from 'react-native';
import { useGetDeletedPostsQuery } from '../api';
import { Video, ResizeMode } from 'expo-av';
import { ProfileProductCard } from '../components/ProfileProductCard';

export const ProfileDeletedScreen = () => {
  const { data: notActivePosts, isLoading, isError, refetch } = useGetDeletedPostsQuery();
  const video = useRef(null);

  useEffect(() => {
    video.current?.playAsync();
    video.current?.setStatusAsync({ isMuted: true });
    refetch();
  }, [notActivePosts]);

  const renderNotActivePostCard = (item) => {
    return (
        <View style={{marginBottom:10}}>
            <View style={{flexDirection:'row',borderWidth:1,borderColor:'#F09235',borderRadius:10,position:'relative',alignItems:'center'}}>
              {item.images[0].type === 'video' ? 
                      <Video
                      isMuted={true}
                      ref={video}
                      style={{width:120,height:120,borderTopLeftRadius:5,borderTopRightRadius:5,marginRight:10}}
                      source={{
                          uri: `http://market.qorgau-city.kz${item.images[0].image}`,
                      }}
                      resizeMode={ResizeMode.COVER}
                      isLooping
                      />
                  :
                    <Image style={{width:120,height:120,borderTopLeftRadius:5,borderTopRightRadius:5,marginRight:10}} source={{uri:`http://market.qorgau-city.kz${item.images[0].image}`}}/>
                  }
              <View style={{paddingHorizontal:7}}>
                  <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                    <View style={{width:190}}>
                      <Text style={{marginTop:5,fontSize:14,minHeight:20,fontFamily:'bold'}}>{item.title}</Text>
                      <Text style={{fontFamily:'medium',fontSize:12,marginTop:5,}}>{item.cost}</Text>
                    </View>
                  </View>
                  <View style={{flexDirection:'row',marginTop:4}}>
                        <View style={{borderRadius:2,overflow:'hidden',marginRight:2}}>
                          <Text style={{fontFamily:'bold-italic',backgroundColor:'#D6D6D6',fontSize:9.5,color:'#fff',paddingHorizontal:3}}>{item.condition}</Text>
                        </View>
                        {item.mortage ?
                        <View style={{borderRadius:2,overflow:'hidden',marginRight:4}}>
                          <Text style={{fontFamily:'bold-italic',backgroundColor:'#D6D6D6',fontSize:9.5,color:'#fff',paddingHorizontal:3}}>в рассрочку</Text>
                        </View> : null}
                        {item.delivery ?
                        <View style={{borderRadius:2,overflow:'hidden'}}>
                          <Text style={{fontFamily:'bold-italic',backgroundColor:'#D6D6D6',fontSize:9.5,color:'#fff',paddingHorizontal:5}}>доставка</Text>
                        </View> : null}
                      </View>
                  <Text style={{fontFamily:'regular',fontSize:10,color:'#96949D',marginTop:5}}>{item.geolocation}</Text>
                  <Text style={{fontFamily:'regular',fontSize:10,color:'#96949D',marginTop:5}}>{item.date}</Text>
                </View>
            </View>
        </View>
    );
  };

  return (
    <ScrollView>
    <View style={{ width: '90%', alignSelf: 'center', marginTop: 10, marginBottom: 90 }}>
      {notActivePosts && notActivePosts.length === 0 ? (
        <Text style={{ alignSelf: 'center', fontFamily: 'medium', marginTop: 100, fontSize: 20, color: '#96949D' }}>Пусто</Text>
      ) : (
        notActivePosts && notActivePosts.map(renderNotActivePostCard)
      )}
    </View>
  </ScrollView>
  );
};
