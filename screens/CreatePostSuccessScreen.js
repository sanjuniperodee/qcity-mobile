import { useNavigation } from '@react-navigation/native';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const CreatePostSuccessScreen = () => {
  const navigation = useNavigation();

  const goHome = () => {
    const parent = navigation.getParent?.();
    if (parent) {
      parent.navigate('HomeTab', { screen: 'Home' });
    } else {
      navigation.navigate('HomeTab');
    }
  };

  const createAnother = () => {
    // Навигация к экрану выбора категории
    navigation.navigate('CreatePostCategory');
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Пост успешно создан</Text>
        <Text style={styles.subtitle}>
          Пост направлен на модерацию. Обычно модерация поста занимает не больше дня
        </Text>

        <TouchableOpacity 
          onPress={createAnother} 
          activeOpacity={0.85} 
          style={styles.primaryButton}
        >
          <LinearGradient
            colors={["#F3B127", "#F26D1D"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.primaryButtonText}>Подать еще одно объявление</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={goHome} 
          activeOpacity={0.85} 
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>Выйти на главную</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: SCREEN_HEIGHT * 0.8,
    paddingVertical: 40,
  },
  container: {
    alignSelf: 'center',
    width: '85%',
    maxWidth: 400,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 30,
    fontFamily: 'bold',
    color: '#F26D1D',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 10,
    marginBottom: 40,
    fontFamily: 'regular',
    color: '#444',
    textAlign: 'center',
    lineHeight: 22,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontFamily: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F3B127',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  secondaryButtonText: {
    color: '#F3B127',
    fontFamily: 'bold',
    fontSize: 16,
  },
});