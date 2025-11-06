import { View, Image, TouchableOpacity, StyleSheet, Linking, Alert, Platform } from 'react-native';

export const Social = (props) => {
    const handleOnPress = () => {
        if (props.url) {
            if(props.whatsapp){
                Linking.openURL('https://wa.me/' + props.url).catch((err) => {
                    // Обработка отмены - не вызываем навигацию
                    console.log('WhatsApp cancelled or failed:', err);
                    // Просто игнорируем ошибку, остаемся на странице
                });
            } else{
                Linking.openURL(props.url).catch((err) => {
                    // Обработка отмены - не вызываем навигацию
                    console.log('URL cancelled or failed:', err);
                    // Просто игнорируем ошибку, остаемся на странице
                });
            }
        } else {
            Alert.alert('Ошибка', 'Не правильный адрес');
        }
    };

    return (
        <View>
            <TouchableOpacity onPress={handleOnPress} style={styles.buttonContainer}>
                <Image style={styles.icon} source={props.image} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        marginRight:10,
        borderWidth: 1,
        borderColor: '#D6D6D6',
        backgroundColor: '#F7F8F9',
    },
    icon: {
        width: 24,
        height: 24,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            android: {
                elevation: 5, // Android shadow
            },
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
            },
        }),
        
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width:'90%',
        elevation: 5,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    closeButton: {
        backgroundColor: '#D6D6D6',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
});
