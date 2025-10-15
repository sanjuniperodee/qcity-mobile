import { useGetPostByIdQuery } from '../api';
import { Video, ResizeMode } from 'expo-av';
import React, { useEffect, useState, useRef } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { View,Text, TextInput, TouchableOpacity, Platform, Image,Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import uuid from 'react-native-uuid';

export const MessagesDmScreen = ({route}) => {
    const connection_id = route.params.connection_id
    const receiver = route.params.receiver
    const post_id = route.params.post_id
    const { data, error, isLoading,refetch } = useGetPostByIdQuery(post_id);
    const user = useSelector(state => state.auth);
    const [messages, setMessages] = useState([]);
    const video = useRef(null);
    const socket = new WebSocket(`wss://market.qorgau-city.kz/chat/?token=${user.token}`);
    const {height, width} = Dimensions.get('window')

    useEffect(() => {
        refetch()
        video.current?.playAsync();
        video.current?.setStatusAsync({ isMuted: true });
        socket.addEventListener('open', () => {
            socket.send(
                JSON.stringify({
                    source: 'message.list',
                    connectionId: connection_id,
                })
            );
        });
    }, []);

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.source === 'message.list' && data.data && data.data.messages) {
            const receivedMessages = data.data.messages.map(msg => ({
                _id: msg._id,
                text: msg.text,
                createdAt: new Date(msg.created),
                user: {
                    _id: msg.user._id,
                    name: msg.user.username,
                    avatar: `https://market.qorgau-city.kz/${msg.user.profile_image}`
                }
            }));
            setMessages(receivedMessages);

        } else if (data.source === 'message.send' && data.data && data.data.messages) {
            const receivedMessages = data.data.messages.map(msg => ({
                _id: msg._id,
                text: msg.text,
                createdAt: new Date(msg.created),
                user: {
                    _id: msg.user._id,
                    name: msg.user.username,
                    avatar: `https://market.qorgau-city.kz/${msg.user.profile_image}`
                }
            }));

            setMessages(receivedMessages);
        } else {
            
        }
    };

    const onSend = (newMessages) => {
        const messageText = newMessages[0].text;
        
        if (messageText.trim() === '') {
                return;
            }
            
        const newMessage = {
            _id: uuid.v4(),
            text: messageText,
            createdAt: new Date(),
            user: {
                _id: user.user.id,
                name: user.user.username,
                avatar: `https://market.qorgau-city.kz/${user.user.profile_image}`
            },
        };

        setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessage));

        socket.send(
            JSON.stringify({
                source: 'message.send',
                connectionId: connection_id,
                user_receiver:receiver, 
                message: messageText,
            })
        );

    };

    const handleSocketDisconnect = () => {
        socket.removeEventListener('message', handleMessage);
        socket.close();
    };
    
    socket.addEventListener('disconnect', handleSocketDisconnect);

    return (
        <View style={{ height:height - 180, marginBottom: 0, flex: 1 }}>
            {data ? 
                <View style={{marginTop:20,width:'90%',alignSelf:'center'}}>
                    <View style={{marginBottom:10}}>
                    <View style={{flexDirection:'row',borderWidth:1,borderColor:'#F09235',borderRadius:10,position:'relative',alignItems:'center'}}>
                    {data.images[0].type === 'video' ? 
                            <Video
                            isMuted={true}
                            ref={video}
                            style={{width:120,height:120,borderTopLeftRadius:5,borderTopRightRadius:5,marginRight:10}}
                            source={{
                                uri: `${data.images[0].image}`,
                            }}
                            resizeMode={ResizeMode.COVER}
                            isLooping
                            />
                        :
                            <Image style={{width:120,height:120,borderTopLeftRadius:5,borderTopRightRadius:5,marginRight:10}} source={{uri:`${data.images[0].image}`}}/>
                        }
                    <View style={{paddingHorizontal:7}}>
                        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                            <View style={{width:190}}>
                            <Text style={{marginTop:5,fontSize:14,minHeight:20,fontFamily:'bold'}}>{data.title}</Text>
                            <Text style={{fontFamily:'medium',fontSize:12,marginTop:5,}}>{data.cost}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection:'row',marginTop:4}}>
                                <View style={{borderRadius:2,overflow:'hidden',marginRight:2}}>
                                <Text style={{fontFamily:'bold-italic',backgroundColor:'#D6D6D6',fontSize:9.5,color:'#fff',paddingHorizontal:3}}>{data.condition}</Text>
                                </View>
                                {data.mortage ?
                                <View style={{borderRadius:2,overflow:'hidden',marginRight:4}}>
                                <Text style={{fontFamily:'bold-italic',backgroundColor:'#D6D6D6',fontSize:9.5,color:'#fff',paddingHorizontal:3}}>в рассрочку</Text>
                                </View> : null}
                                {data.delivery ?
                                <View style={{borderRadius:2,overflow:'hidden'}}>
                                <Text style={{fontFamily:'bold-italic',backgroundColor:'#D6D6D6',fontSize:9.5,color:'#fff',paddingHorizontal:5}}>доставка</Text>
                                </View> : null}
                            </View>
                        <Text style={{fontFamily:'regular',fontSize:10,color:'#96949D',marginTop:5}}>{data.geolocation}</Text>
                        <Text style={{fontFamily:'regular',fontSize:10,color:'#96949D',marginTop:5}}>{data.date}</Text>
                        </View>
                    </View>
                </View>
            </View> : null }
            <GiftedChat
                messages={messages}
                onSend={onSend}
                isAnimated
                user={{
                    _id: user.user.id,
                }}
            />
        </View>
    );
};

