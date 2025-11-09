import { useGetPostByIdQuery } from '../api';
import { Video, ResizeMode } from 'expo-av';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { View, Text, TextInput, TouchableOpacity, Platform, Image, Dimensions, KeyboardAvoidingView, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import uuid from 'react-native-uuid';

export const MessagesDmScreen = ({route}) => {
    // Безопасное получение параметров из route
    const connection_id = route?.params?.connection_id;
    const receiver = route?.params?.receiver;
    const post_id = route?.params?.post_id;
    
    const { data, error, isLoading,refetch } = useGetPostByIdQuery(post_id || 0, { skip: !post_id || post_id === 0 });
    const user = useSelector(state => state.auth);
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const video = useRef(null);
    const socketRef = useRef(null);
    const restApiLoadedRef = useRef(false); // Флаг для отслеживания загрузки через REST API
    const isMountedRef = useRef(true); // Флаг для отслеживания монтирования компонента
    const inputRef = useRef(null);
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
                    // Бэкенд возвращает сообщения в порядке возрастания (старые первыми)
                    // GiftedChat ожидает сообщения в порядке от старых к новым для правильного отображения
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
                        // Переворачиваем массив, чтобы новые сообщения были снизу
                        setMessages(receivedMessages.reverse());
                    }

                // Handle message.send response - обновляем список сообщений (бэкенд отправляет полный список)
                } else if (rawData.source === 'message.send' && rawData.data) {
                    // Если есть полный список сообщений, обновляем его
                    if (rawData.data.messages && Array.isArray(rawData.data.messages)) {
                        // Бэкенд возвращает сообщения в порядке возрастания (старые первыми)
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
                            // Переворачиваем массив, чтобы новые сообщения были снизу
                            setMessages(receivedMessages.reverse());
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
                    // Бэкенд возвращает сообщения в порядке возрастания (старые первыми)
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
                        // Переворачиваем массив, чтобы новые сообщения были снизу
                        setMessages(formattedMessages.reverse());
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

    const handleSendMessage = useCallback(() => {
        const messageText = inputText.trim();
        
        if (messageText === '' || !socketRef.current) {
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
            setInputText(''); // Очищаем поле ввода
        }

        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(
                JSON.stringify({
                    source: 'message.send',
                    connectionId: connection_id,
                    user_receiver: receiver, 
                    message: messageText,
                    post_id: post_id || 0,
                })
            );
        } else {
            console.error('WebSocket is not open');
        }
    }, [connection_id, receiver, user, inputText]);

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
                    post_id: post_id || 0,
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
                    <View style={styles.postCardInner}>
                        {/* Изображение с градиентным оверлеем */}
                        <View style={styles.postImageWrapper}>
                            <View style={styles.postImageContainer}>
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
                                    <Image 
                                        style={styles.postImage} 
                                        source={{uri: data.images[0].image}}
                                    />
                                }
                            </View>
                            {/* Бейдж состояния */}
                            <View style={styles.conditionBadge}>
                                <Text style={styles.conditionBadgeText}>{data.condition}</Text>
                            </View>
                        </View>
                        
                        {/* Информация о посте */}
                        <View style={styles.postInfo}>
                            {/* Заголовок и цена */}
                            <View style={styles.postHeader}>
                                <Text style={styles.postTitle} numberOfLines={2}>{data.title}</Text>
                                <View style={styles.priceContainer}>
                                    <Text style={styles.postCost}>{data.cost} ₸</Text>
                                </View>
                            </View>
                            
                            {/* Теги с иконками */}
                            <View style={styles.postTags}>
                                {data.mortage ? (
                                    <View style={styles.featureTag}>
                                        <View style={styles.featureTagIcon}>
                                            <Ionicons name="card" size={12} color="#F09235" />
                                        </View>
                                        <Text style={styles.featureTagText}>{t('messages.installment')}</Text>
                                    </View>
                                ) : null}
                                {data.delivery ? (
                                    <View style={styles.featureTag}>
                                        <View style={styles.featureTagIcon}>
                                            <Ionicons name="car" size={12} color="#F09235" />
                                        </View>
                                        <Text style={styles.featureTagText}>{t('messages.delivery')}</Text>
                                    </View>
                                ) : null}
                            </View>
                            
                            {/* Метаданные */}
                            <View style={styles.postMeta}>
                                {data.geolocation ? (
                                    <View style={styles.metaItem}>
                                        <View style={styles.metaIconContainer}>
                                            <Ionicons name="location" size={14} color="#F09235" />
                                        </View>
                                        <Text style={styles.postLocation} numberOfLines={1}>{data.geolocation}</Text>
                                    </View>
                                ) : null}
                                {data.date ? (
                                    <View style={styles.metaItem}>
                                        <View style={styles.metaIconContainer}>
                                            <Ionicons name="time" size={14} color="#F09235" />
                                        </View>
                                        <Text style={styles.postDate}>{data.date}</Text>
                                    </View>
                                ) : null}
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
                    showUserAvatar={true}
                    renderEmpty={() => null}
                    listViewProps={{
                        style: { flex: 1 },
                        contentContainerStyle: { flexGrow: 1, paddingBottom: 20 },
                    }}
                    renderInputToolbar={() => null}
                    renderActions={() => null}
                    isKeyboardInternallyHandled={false}
                    inverted={true}
                />
            </View>
            {/* Кастомный Input Toolbar - вынесен за пределы chatWrapper */}
            <View style={[styles.customInputToolbar, { paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 24 : 12) + 60 }]}>
                <View style={styles.inputContainer}>
                    <TextInput
                        ref={inputRef}
                        style={styles.customTextInput}
                        placeholder="Введите сообщение..."
                        placeholderTextColor="#999"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={1000}
                        textAlignVertical="center"
                    />
                    <TouchableOpacity
                        onPress={handleSendMessage}
                        disabled={inputText.trim() === ''}
                        style={[
                            styles.customSendButton,
                            inputText.trim() === '' && styles.customSendButtonDisabled
                        ]}
                        activeOpacity={0.7}
                    >
                        <Ionicons 
                            name="paper-plane" 
                            size={20} 
                            color={inputText.trim() === '' ? '#CCCCCC' : '#FFFFFF'} 
                        />
                    </TouchableOpacity>
                </View>
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
        marginHorizontal: 16,
        marginBottom: 16,
    },
    postCardInner: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    postImageWrapper: {
        position: 'relative',
        marginRight: 16,
    },
    postImageContainer: {
        width: 140,
        height: 140,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#F8F8F8',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    postImage: {
        width: '100%',
        height: '100%',
    },
    conditionBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    conditionBadgeText: {
        fontFamily: 'bold',
        fontSize: 11,
        color: '#1A1A1A',
    },
    postInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },
    postHeader: {
        marginBottom: 12,
    },
    postTitle: {
        fontSize: 16,
        fontFamily: 'bold',
        color: '#1A1A1A',
        lineHeight: 22,
        marginBottom: 8,
    },
    priceContainer: {
        backgroundColor: '#FFF5E6',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        alignSelf: 'flex-start',
    },
    postCost: {
        fontFamily: 'bold',
        fontSize: 18,
        color: '#F09235',
    },
    postTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    featureTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF5E6',
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: '#FFE5CC',
    },
    featureTagIcon: {
        marginRight: 6,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureTagText: {
        fontFamily: 'medium',
        fontSize: 11,
        color: '#F09235',
    },
    postMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 4,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        marginBottom: 4,
    },
    metaIconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFF5E6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    postLocation: {
        fontFamily: 'regular',
        fontSize: 12,
        color: '#666',
        flex: 1,
    },
    postDate: {
        fontFamily: 'regular',
        fontSize: 12,
        color: '#666',
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
    },
    customInputToolbar: {
        backgroundColor: '#FFFFFF',
        paddingTop: 8,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        width: '100%',
    },
    customTextInput: {
        flex: 1,
        backgroundColor: '#F8F8F8',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 12,
        marginRight: 12,
        fontSize: 16,
        fontFamily: 'regular',
        color: '#1A1A1A',
        minHeight: 48,
        maxHeight: 100,
        lineHeight: 20,
    },
    customSendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F09235',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#F09235',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    customSendButtonDisabled: {
        backgroundColor: '#E0E0E0',
        shadowOpacity: 0,
        elevation: 0,
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


