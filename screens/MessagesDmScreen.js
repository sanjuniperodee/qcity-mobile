import { useGetPostByIdQuery } from '../api';
import { Video, ResizeMode } from 'expo-av';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { View,Text, TextInput, TouchableOpacity, Platform, Image,Dimensions, KeyboardAvoidingView, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import uuid from 'react-native-uuid';

export const MessagesDmScreen = ({route}) => {
    const connection_id = route.params.connection_id
    const receiver = route.params.receiver
    const post_id = route.params.post_id
    const { data, error, isLoading,refetch } = useGetPostByIdQuery(post_id || 0, { skip: !post_id || post_id === 0 });
    const user = useSelector(state => state.auth);
    const { t } = useTranslation();
    const [messages, setMessages] = useState([]);
    const video = useRef(null);
    const socketRef = useRef(null);
    const restApiLoadedRef = useRef(false); // Флаг для отслеживания загрузки через REST API
    const {height, width} = Dimensions.get('window')

    // Создание и управление WebSocket
    useEffect(() => {
        if (!user?.token || !connection_id) {
            console.log('Missing token or connection_id');
            return;
        }

        console.log('Creating WebSocket connection for connection_id:', connection_id);
        
        const socket = new WebSocket(`wss://market.qorgau-city.kz/chat/?token=${user.token}`);
        socketRef.current = socket;

        socket.addEventListener('open', () => {
            console.log('WebSocket connected');
            socket.send(
                JSON.stringify({
                    source: 'message.list',
                    connectionId: connection_id,
                })
            );
        });

        socket.addEventListener('message', (event) => {
            try {
                const rawData = JSON.parse(event.data);
                console.log('WebSocket message received (full):', JSON.stringify(rawData, null, 2));
                console.log('WebSocket message source:', rawData.source);
                console.log('WebSocket message data:', rawData.data);

                // Handle message.list response - загружаем полный список сообщений
                if (rawData.source === 'message.list' && rawData.data && rawData.data.messages) {
                    const receivedMessages = rawData.data.messages.map(msg => ({
                        _id: msg._id,
                        text: msg.text,
                        createdAt: new Date(msg.created),
                        user: {
                            _id: msg.user._id,
                            name: msg.user.username,
                            avatar: msg.user.profile_image 
                                ? `https://market.qorgau-city.kz${msg.user.profile_image}`
                                : undefined
                        }
                    }));
                    console.log('Setting messages from message.list:', receivedMessages.length);
                    setMessages(receivedMessages);

                // Handle message.send response - обновляем список сообщений (бэкенд отправляет полный список)
                } else if (rawData.source === 'message.send' && rawData.data) {
                    // Если есть полный список сообщений, обновляем его
                    if (rawData.data.messages && Array.isArray(rawData.data.messages)) {
                        const receivedMessages = rawData.data.messages.map(msg => ({
                            _id: msg._id,
                            text: msg.text,
                            createdAt: new Date(msg.created),
                            user: {
                                _id: msg.user._id,
                                name: msg.user.username,
                                avatar: msg.user.profile_image 
                                    ? `https://market.qorgau-city.kz${msg.user.profile_image}`
                                    : undefined
                            }
                        }));
                        console.log('Updating messages from message.send:', receivedMessages.length);
                        setMessages(receivedMessages);
                    } 
                    // Если есть только одно новое сообщение, добавляем его
                    else if (rawData.data.message) {
                        const newMessage = {
                            _id: rawData.data.message._id,
                            text: rawData.data.message.text,
                            createdAt: new Date(rawData.data.message.created),
                            user: {
                                _id: rawData.data.message.user._id,
                                name: rawData.data.message.user.username,
                                avatar: rawData.data.message.user.profile_image 
                                    ? `https://market.qorgau-city.kz${rawData.data.message.user.profile_image}`
                                    : undefined
                            }
                        };
                        console.log('Adding new message from message.send:', newMessage._id);
                        setMessages((prevMessages) => {
                            // Проверяем, нет ли уже такого сообщения (избегаем дубликатов)
                            const exists = prevMessages.some(msg => msg._id === newMessage._id);
                            if (exists) {
                                return prevMessages;
                            }
                            return GiftedChat.append(prevMessages, newMessage);
                        });
                    }
                } else {
                    console.log('WebSocket message format not recognized:', rawData);
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
                console.error('Raw event data:', event.data);
            }
        });

        socket.addEventListener('error', (error) => {
            console.error('WebSocket error:', error);
        });

        socket.addEventListener('close', () => {
            console.log('WebSocket closed');
        });

        // Очистка при размонтировании или изменении connection_id
        return () => {
            console.log('Cleaning up WebSocket');
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, [connection_id, user?.token]);

    // Загрузка сообщений через REST API при монтировании компонента (только один раз)
    useEffect(() => {
        const fetchMessages = async () => {
            if (!user?.token || !connection_id) {
                console.log('Missing token or connection_id for REST fetch');
                return;
            }

            // Загружаем через REST API только один раз при монтировании
            // WebSocket будет обновлять сообщения в реальном времени
            if (restApiLoadedRef.current) {
                console.log('REST API already loaded, skipping fetch');
                return;
            }

            try {
                console.log('Fetching messages via REST API for connection_id:', connection_id);
                // Используем существующий эндпоинт для получения сообщений
                const response = await fetch(
                    `https://market.qorgau-city.kz/api/connection/${connection_id}/messages/`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Token ${user.token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('REST API messages received:', result);

                if (result.messages && Array.isArray(result.messages)) {
                    const formattedMessages = result.messages.map(msg => ({
                        _id: msg._id,
                        text: msg.text,
                        createdAt: new Date(msg.created),
                        user: {
                            _id: msg.user._id,
                            name: msg.user.username,
                            avatar: msg.user.profile_image 
                                ? `https://market.qorgau-city.kz${msg.user.profile_image}`
                                : undefined
                        }
                    }));
                    console.log('Setting messages from REST API:', formattedMessages.length);
                    setMessages(formattedMessages);
                    restApiLoadedRef.current = true;
                }
            } catch (error) {
                console.error('Error fetching messages via REST API:', error);
            }
        };

        // Сбрасываем флаг при изменении connection_id
        restApiLoadedRef.current = false;
        fetchMessages();
    }, [connection_id, user?.token]);

    // Загрузка данных поста
    useEffect(() => {
        if (post_id && post_id !== 0) {
            refetch();
            video.current?.playAsync();
            video.current?.setStatusAsync({ isMuted: true });
        }
    }, [post_id, refetch]);

    const onSend = useCallback((newMessages) => {
        const messageText = newMessages[0].text;
        
        if (messageText.trim() === '' || !socketRef.current) {
            return;
        }
            
        const newMessage = {
            _id: uuid.v4(),
            text: messageText,
            createdAt: new Date(),
            user: {
                _id: user.user.id,
                name: user.user.username,
                avatar: user.user.profile_image 
                    ? `https://market.qorgau-city.kz${user.user.profile_image}`
                    : undefined
            },
        };

        setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessage));

        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(
                JSON.stringify({
                    source: 'message.send',
                    connectionId: connection_id,
                    user_receiver: receiver, 
                    message: messageText,
                })
            );
        } else {
            console.error('WebSocket is not open');
        }
    }, [connection_id, receiver, user]);

    console.log('MessagesDmScreen render - messages count:', messages.length, 'connection_id:', connection_id);

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView 
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.content}>
                    {/* Карточка объявления - показываем только если post_id существует и не равен 0 */}
                    {post_id && post_id !== 0 && data && data.images && data.images.length > 0 ? 
                        <View style={styles.postCard}>
                            <View style={styles.postCardContent}>
                                <View style={styles.postCardInner}>
                                    {data.images[0].type === 'video' ? 
                                        <Video
                                            isMuted={true}
                                            ref={video}
                                            style={styles.postImage}
                                            source={{
                                                uri: `${data.images[0].image}`,
                                            }}
                                            resizeMode={ResizeMode.COVER}
                                            isLooping
                                        />
                                    :
                                        <Image style={styles.postImage} source={{uri:`${data.images[0].image}`}}/>
                                    }
                                    <View style={styles.postInfo}>
                                        <View style={styles.postHeader}>
                                            <View style={styles.postTitleContainer}>
                                                <Text style={styles.postTitle}>{data.title}</Text>
                                                <Text style={styles.postCost}>{data.cost}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.postTags}>
                                            <View style={styles.tag}>
                                                <Text style={styles.tagText}>{data.condition}</Text>
                                            </View>
                                            {data.mortage ?
                                                <View style={styles.tag}>
                                                    <Text style={styles.tagText}>{t('messages.installment')}</Text>
                                                </View> : null}
                                            {data.delivery ?
                                                <View style={styles.tag}>
                                                    <Text style={styles.tagText}>{t('messages.delivery')}</Text>
                                                </View> : null}
                                        </View>
                                        <Text style={styles.postLocation}>{data.geolocation}</Text>
                                        {data.date && <Text style={styles.postDate}>{data.date}</Text>}
                                    </View>
                                </View>
                            </View>
                        </View> : null 
                    }
                    {/* GiftedChat - всегда отображается и занимает оставшееся пространство */}
                    <View style={styles.chatWrapper}>
                        {user && user.user && user.user.id ? (
                            <GiftedChat
                                messages={messages}
                                onSend={onSend}
                                isAnimated
                                user={{
                                    _id: user.user.id,
                                    name: user.user.username || 'User',
                                    avatar: user.user.profile_image 
                                        ? `https://market.qorgau-city.kz${user.user.profile_image}`
                                        : undefined
                                }}
                                placeholder="Введите сообщение..."
                                showUserAvatar={true}
                                alwaysShowSend={true}
                                minInputToolbarHeight={60}
                                renderInputToolbar={(props) => {
                                    // Убеждаемся, что input toolbar всегда отображается
                                    return <GiftedChat.InputToolbar {...props} />;
                                }}
                                renderEmpty={() => (
                                    <View style={styles.emptyChat}>
                                        <Text style={styles.emptyChatText}>Нет сообщений. Начните диалог!</Text>
                                    </View>
                                )}
                            />
                        ) : (
                            <View style={styles.emptyChat}>
                                <Text style={styles.emptyChatText}>Загрузка...</Text>
                            </View>
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    postCard: {
        marginTop: 20,
        width: '90%',
        alignSelf: 'center',
        marginBottom: 10,
        maxHeight: 150,
    },
    postCardContent: {
        marginBottom: 10,
    },
    postCardInner: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#F09235',
        borderRadius: 10,
        position: 'relative',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 5,
    },
    postImage: {
        width: 100,
        height: 100,
        borderRadius: 5,
        marginRight: 10,
    },
    postInfo: {
        paddingHorizontal: 7,
        flex: 1,
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    postTitleContainer: {
        flex: 1,
    },
    postTitle: {
        marginTop: 5,
        fontSize: 14,
        minHeight: 20,
        fontFamily: 'bold',
    },
    postCost: {
        fontFamily: 'medium',
        fontSize: 12,
        marginTop: 5,
    },
    postTags: {
        flexDirection: 'row',
        marginTop: 4,
        flexWrap: 'wrap',
    },
    tag: {
        borderRadius: 2,
        overflow: 'hidden',
        marginRight: 2,
        marginBottom: 2,
    },
    tagText: {
        fontFamily: 'bold-italic',
        backgroundColor: '#D6D6D6',
        fontSize: 9.5,
        color: '#fff',
        paddingHorizontal: 3,
    },
    postLocation: {
        fontFamily: 'regular',
        fontSize: 10,
        color: '#96949D',
        marginTop: 5,
    },
    postDate: {
        fontFamily: 'regular',
        fontSize: 10,
        color: '#96949D',
        marginTop: 5,
    },
    chatWrapper: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        width: '100%',
    },
    emptyChat: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    emptyChatText: {
        fontSize: 16,
        fontFamily: 'regular',
        color: '#999',
        textAlign: 'center',
    },
});


