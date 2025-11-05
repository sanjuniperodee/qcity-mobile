import { useNavigation } from '@react-navigation/native';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Пост успешно создан</Text>
      <Text style={styles.subtitle}>
        Пост направлен на модерацию. Обычно модерация поста занимает не больше дня
      </Text>

      <TouchableOpacity onPress={goHome} activeOpacity={0.85} style={styles.homeBtn}>
        <LinearGradient
          colors={["#F3B127", "#F26D1D"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.homeBtnGradient}
        >
          <Text style={styles.homeBtnText}>Вернуться на главную</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    marginTop: 200,
    width: '85%',
  },
  title: {
    fontSize: 30,
    fontFamily: 'bold',
    color: '#F26D1D',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    marginTop: 20,
    fontFamily: 'regular',
    color: '#444',
    textAlign: 'center',
  },
  homeBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'center',
    width: '85%',
    marginTop: 28,
  },
  homeBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeBtnText: {
    color: '#FFFFFF',
    fontFamily: 'bold',
    fontSize: 16,
  },
});