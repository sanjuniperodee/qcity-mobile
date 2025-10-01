import React from 'react';
import { WebView } from 'react-native-webview';
import CryptoJS from 'crypto-js';

export const CreatePostPayScreen = ({ route }) => {
    const { tariff,id } = route.params;

const generatePaymentUrl = (login, pass1, invId, outSumm, desc) => {
    // Включение пользовательских параметров в строку, которая будет хешироваться
    const baseString = `${login}:${outSumm}:${invId}:${pass1}:Shp_post=${id}:Shp_tariff=${tariff}`;
    const crc = CryptoJS.MD5(baseString).toString();

    // Возвращение полного URL с правильно закодированным описанием и сгенерированной подписью
    return `https://auth.robokassa.kz/Merchant/Index.aspx?MerchantLogin=${login}&OutSum=${outSumm}&InvId=${invId}&Description=${encodeURIComponent(desc)}&Shp_post=${id}&Shp_tariff=${tariff}&SignatureValue=${crc}`;
};


    // Предполагаемые значения для демонстрации
    const login = "qorgau-marketplace.kz";
    const pass1 = "RBSfnQeFG41d5Cu30zEb";
    const desc = tariff === 1 ? "Ваше объявление будет в первых рядах" : "Ваше объявление будет выделено цветом";
    const outSumm = tariff === 1 ? "2500" : "1500";
    const invId = 0;

    const selectedUrl = generatePaymentUrl(login, pass1, invId, outSumm, desc);

    return <WebView style={{ flex: 1,marginBottom:90 }} source={{ uri: selectedUrl }} />;
};
