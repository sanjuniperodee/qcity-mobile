import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HTMLView from 'react-native-htmlview';
import { getItemAsync, setItemAsync } from 'expo-secure-store';

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyBViSS998QTnFK568NLzZpm5vOWvg6cUYc");
const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });

export const QorgauAiScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const storedMessages = await getItemAsync('messages');
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }
    };
    fetchMessages();
  }, []);

  useEffect(() => {
    const timer = setInterval(async () => {
      const now = new Date();
      const savedMessages = messages.filter(message => {
        const date = new Date(message.date);
        const diff = Math.abs(now.getTime() - date.getTime());
        return diff < 24 * 60 * 60 * 1000;
      });
      await setItemAsync('messages', JSON.stringify(savedMessages));
    }, 1000 * 60 * 60 * 24);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSend = async () => {
    if (inputText.trim()) {
      setInputText('');
      setIsLoading(true);
      setMessages(prevMessages => [...prevMessages, { text: inputText, isUser: true, date: new Date().toISOString() }]);

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      const prompt = `Вы - профессиональный консультант маркетплейса Qorgau по товарам и услугам пожарной, промышленной и охранной безопасности в Республике Казахстан. 
Ваша задача:
1. Помогать пользователям с вопросами о товарах и услугах в сфере пожарной, промышленной и охранной безопасности
2. Консультировать по нормам и правилам безопасности РК
3. Рекомендовать категории товаров/услуг для их нужд
4. Отвечать на вопросы о промышленной безопасности
5. Давать компетентные советы по выбору оборудования и услуг

Отвечайте кратко, профессионально и по делу. Не представляйтесь если не просят.
Вот вопрос: ${inputText}`;
      model.generateContent(prompt).then(result => {
        const responseText = result.response.text();

        const formattedResponse = responseText
          .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
          .replace(/\*(.*?)\*/g, '<i>$1</i>');

        setMessages(prevMessages => [...prevMessages, { text: formattedResponse, isUser: false, date: new Date().toISOString() }]);
        setIsLoading(false);

        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      });
    }
  };

  return (
<KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"} // iOS поднимает, Android работает через height
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} // иногда надо подстраивать, если header сверху
    >
      <View style={styles.container}>
        {messages.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: 100, width: '90%', marginHorizontal: '5%' }}>
            <Text style={[styles.header, { fontSize: 16, color: '#F09235', fontWeight: 'bold' }]}>
              Добро пожаловать в Qorgau AI
            </Text>
            <Text style={[styles.header, { fontSize: 14, marginTop: 10 }]}>
              Ваш персональный консультант по товарам и услугам пожарной, промышленной и охранной безопасности
            </Text>
            <Text style={[styles.header, { fontSize: 12, marginTop: 15, color: '#666' }]}>
              Примеры вопросов:
            </Text>
            <Text style={[styles.header, { fontSize: 11, marginTop: 5, color: '#888', textAlign: 'left' }]}>
              • "Какие огнетушители нужны для офиса?"{'\n'}
              • "Как выбрать пожарную сигнализацию?"{'\n'}
              • "Нормы пожарной безопасности для склада"{'\n'}
              • "Обучение по промышленной безопасности"
            </Text>
          </View>
        )}
        <ScrollView ref={scrollViewRef} style={styles.messageContainer}>
          {messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.messageContainerStyle,
                message.isUser ? styles.userMessageStyle : styles.aiMessageStyle
              ]}
            >
              <HTMLView
                value={message.text}
                stylesheet={{
                  ...styles.userMessage,
                }}
              />
            </View>
          ))}

          {isLoading && (
            <Image
              source={require('../assets/typing_animation.gif')}
              style={{ width: 50, height: 30, objectFit: 'contain', marginVertical: 10 }}
            />
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Введите запрос"
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.iconContainer} onPress={handleSend}>
            <MaterialCommunityIcons name="arrow-right-circle" size={24} color="gray" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: 'regular',
    color: '#333',
    textAlign: 'center',
  },
  messageContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 0,
  },
  messageContainerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    marginVertical: 10,
  },
  message: {
    fontSize: 20,
    marginVertical: 25,
  },
  userMessageStyle: {
    justifyContent: 'flex-end',
    backgroundColor: '#F2F2F2',
    alignSelf: 'flex-end',
    textAlign: 'right',
    fontSize: 20,
    padding: 15,
  },
  aiMessageStyle: {
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
    flex: 1,
    alignSelf: 'flex-start',
    textAlign: 'left',
    fontSize: 20,
  },
  userMessage: {
    fontWeight: 'medium',
    fontSize: 20,
  },
  aiMessage: { fontSize: 20, },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F1F1',
    backgroundColor: '#F9F9F9',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    width: '100%',
    fontSize: 20,
    marginBottom: 100,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  iconContainer: {
    marginRight: -10,
    opacity: 0.6,
  },
});

