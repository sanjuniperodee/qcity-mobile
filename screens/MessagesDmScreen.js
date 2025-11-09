import { useGetPostByIdQuery } from '../api';
import { Video, ResizeMode } from 'expo-av';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { GiftedChat, InputToolbar, Send } from 'react-native-gifted-chat';
import { View, Text, TextInput, TouchableOpacity, Platform, Image, Dimensions, KeyboardAvoidingView, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import uuid from 'react-native-uuid';

export const MessagesDmScreen = ({route}) => {
    // Безопасное получение параметров из route
    const connection_id = route?.params?.connection_id;
    const receiver = route?.params?.receiver;
    const post_id = route?.params?.post_id;
    
    const { data, error, isLoading,refetch } = useGetPostByIdQuery(post_id || 0, { skip: !post_id || post_id === 0 });
    const user = useSelector(state => state.auth);
    const { t } = useTranslation();
    const [messages, setMessages] = useState([]);
    const video = useRef(null);
    const socketRef = useRef(null);
    const restApiLoadedRef = useRef(false); // Флаг для отслеживания загрузки через REST API
    const isMountedRef = useRef(true); // Флаг для отслеживания монтирования компонента
    const {height, width} = Dimensions.get('window')

    // Создание и управление WebSocket
    useEffect(() => {
        isMountedRef.current = true;
        
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
                    // Бэкенд теперь возвращает сообщения в порядке возрастания (старые первыми)
                    // GiftedChat ожидает старые сообщения первыми, поэтому используем массив как есть
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
                    if (isMountedRef.current) {
                        setMessages(receivedMessages);
                    }

                // Handle message.send response - обновляем список сообщений (бэкенд отправляет полный список)
                } else if (rawData.source === 'message.send' && rawData.data) {
                    // Если есть полный список сообщений, обновляем его
                    if (rawData.data.messages && Array.isArray(rawData.data.messages)) {
                        // Бэкенд теперь возвращает сообщения в порядке возрастания (старые первыми)
                        // GiftedChat ожидает старые сообщения первыми, поэтому используем массив как есть
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
                        if (isMountedRef.current) {
                            setMessages(receivedMessages);
                        }
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
                        if (isMountedRef.current) {
                            setMessages((prevMessages) => {
                                // Проверяем, нет ли уже такого сообщения (избегаем дубликатов)
                                const exists = prevMessages.some(msg => msg._id === newMessage._id);
                                if (exists) {
                                    return prevMessages;
                                }
                                return GiftedChat.append(prevMessages, newMessage);
                            });
                        }
                    }
                } else {
                    // Игнорируем сообщения без source (это могут быть тестовые сообщения от бэкенда)
                    // Такие сообщения не содержат полезной информации для чата
                    if (rawData.message !== null && rawData.message !== undefined) {
                        console.log('Ignoring WebSocket message without source:', rawData);
                    }
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
            isMountedRef.current = false;
            console.log('Cleaning up WebSocket');
            if (socketRef.current) {
                try {
                    socketRef.current.close();
                } catch (error) {
                    console.error('Error closing WebSocket:', error);
                }
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

            // Сбрасываем флаг при изменении connection_id
            restApiLoadedRef.current = false;
            isMountedRef.current = true;

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
                    // Бэкенд теперь возвращает сообщения в порядке возрастания (старые первыми)
                    // GiftedChat ожидает старые сообщения первыми, поэтому используем массив как есть
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
                    if (isMountedRef.current) {
                        setMessages(formattedMessages);
                        restApiLoadedRef.current = true;
                    }
                }
            } catch (error) {
                console.error('Error fetching messages via REST API:', error);
            }
        };

        fetchMessages();
        
        return () => {
            isMountedRef.current = false;
        };
    }, [connection_id, user?.token]);

    // Загрузка данных поста
    useEffect(() => {
        if (post_id && post_id !== 0) {
            // refetch вызывается автоматически RTK Query при изменении post_id
            // Не нужно вызывать его вручную, чтобы избежать отмененных запросов
            if (video.current) {
                video.current.playAsync().catch(console.error);
                video.current.setStatusAsync({ isMuted: true }).catch(console.error);
            }
        }
    }, [post_id]); // Убрал refetch из зависимостей, чтобы избежать бесконечного цикла

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

        if (isMountedRef.current) {
            setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessage));
        }

        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(
                JSON.stringify({
                    source: 'message.send',
                    connectionId: connection_id,
                    user_receiver: receiver, 
                    message: messageText,
                    post_id: post_id || 0,  // Добавляем post_id в данные
                })
            );
        } else {
            console.error('WebSocket is not open');
        }
    }, [connection_id, receiver, user]);

    console.log('MessagesDmScreen render - messages count:', messages.length, 'connection_id:', connection_id);
    console.log('MessagesDmScreen - user:', user?.user?.id, 'username:', user?.user?.username);
    console.log('MessagesDmScreen - chatWrapper style:', styles.chatWrapper);

    // Проверяем наличие обязательных параметров и данных
    if (!connection_id) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyChat}>
                    <Text style={styles.emptyChatText}>Ошибка: отсутствует connection_id</Text>
                </View>
            </View>
        );
    }

    // Проверяем, что user загружен
    if (!user || !user.user || !user.user.id) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyChat}>
                    <Text style={styles.emptyChatText}>Загрузка...</Text>
                </View>
            </View>
        );
    }

    const content = (
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
                    bottomOffset={0}
                    textInputStyle={styles.textInput}
                    renderEmpty={() => null}
                    listViewProps={{
                        style: { flex: 1, paddingBottom: 0 },
                        contentContainerStyle: { flexGrow: 1, paddingBottom: 100 },
                    }}
                    renderInputToolbar={(props) => {
                        // Явно рендерим input toolbar, чтобы он всегда был виден
                        if (!props) {
                            return null;
                        }
                        // Принудительно показываем input toolbar
                        return (
                            <InputToolbar 
                                {...props} 
                                containerStyle={[styles.inputToolbarContainer, props.containerStyle]}
                                primaryStyle={styles.inputToolbarPrimary}
                            />
                        );
                    }}
                    renderSend={(props) => {
                        if (!props) {
                            return null;
                        }
                        // Показываем кнопку только если есть текст
                        if (!props.text || props.text.trim() === '') {
                            return null;
                        }
                        return (
                            <Send {...props} containerStyle={styles.sendContainer}>
                                <View style={styles.sendButton}>
                                    <Ionicons name="send" size={20} color="#FFFFFF" />
                                </View>
                            </Send>
                        );
                    }}
                    renderActions={() => null}
                    isKeyboardInternallyHandled={false}
                />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {Platform.OS === 'ios' ? (
                <KeyboardAvoidingView 
                    style={styles.keyboardAvoidingView}
                    behavior="padding"
                    keyboardVerticalOffset={90}
                >
                    {content}
                </KeyboardAvoidingView>
            ) : (
                content
            )}
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
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
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
        position: 'relative',
        minHeight: 200,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'visible',
        paddingBottom: 100, // Отступ снизу для предотвращения перекрытия сообщениями поля ввода
    },
    inputToolbarContainer: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingBottom: Platform.OS === 'ios' ? 20 : 10,
        minHeight: 70,
        paddingHorizontal: 16,
        paddingVertical: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    inputToolbarPrimary: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-between',
    },
    textInput: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        paddingHorizontal: 18,
        paddingVertical: 12,
        marginHorizontal: 0,
        marginLeft: 0,
        marginRight: 12,
        fontSize: 16,
        fontFamily: 'regular',
        color: '#000000',
        flex: 1,
        maxHeight: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    sendContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 0,
        marginBottom: 0,
        paddingRight: 0,
        marginLeft: 0,
    },
    sendButton: {
        backgroundColor: '#F09235',
        borderRadius: 22,
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    emptyChat: {
        position: 'absolute',
        top: '40%',
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 0,
        pointerEvents: 'none',
    },
    emptyChatText: {
        fontSize: 16,
        fontFamily: 'regular',
        color: '#999',
        textAlign: 'center',
    },
});


