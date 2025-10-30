import React, { useState,useEffect } from 'react';
import Navigation from './navigation/index'
import { StyleSheet,Platform, NativeModules } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import * as Font from 'expo-font';
import i18n from 'i18next';
import { store, persistor } from './store/index'; 
import { enableScreens } from 'react-native-screens';
import * as SplashScreen from 'expo-splash-screen';
import { initReactI18next } from 'react-i18next';
import { I18nextProvider } from 'react-i18next';
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { NotificationProvider } from './context/NotificationContext';
import Purchases from "react-native-purchases";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  ({ data, error, executionInfo }) => {
    console.log("✅ Received a notification in the background!", {
      data,
      error,
      executionInfo,
    });
    // Do something with the notification data
  }
);

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);


SplashScreen.preventAutoHideAsync();

enableScreens();

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    lng: 'ru',
    resources: {
      kz: {
        translation: require('./locales/kz.json')
      },
      ru: {
        translation: require('./locales/ru.json')
      },
      en: {
        translation: require('./locales/en.json')
      }
    }
  });

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('ru');

  useEffect(() => {
    i18n.changeLanguage(selectedLanguage);
  }, [selectedLanguage]);

  useEffect(() => {
    if (Platform.OS === "ios") {
      Purchases.configure({ apiKey: "appl_wCuCpLKagIWxpiYqcrNYZioGmGP" });
    } else if (Platform.OS === "android") {
      Purchases.configure({ apiKey: "goog_SOhwxVOHyeCjxadVfIrITqTHMrd" });
    }
  }, []);

  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        await Font.loadAsync({
          regular: require('./assets/fonts/SF-Pro-Display-Regular.otf'),
          medium: require('./assets/fonts/SF-Pro-Display-Medium.otf'),
          semibold: require('./assets/fonts/SF-Pro-Display-Semibold.otf'),
          bold: require('./assets/fonts/SF-Pro-Display-Bold.otf'),
          'bold-italic': require('./assets/fonts/SF-Pro-Display-BoldItalic.otf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.warn(error);
      } finally {
        // Hide the splash screen once fonts are loaded
        await SplashScreen.hideAsync();
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NotificationProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <I18nextProvider i18n={i18n}>
            <Navigation />
          </I18nextProvider>
        </PersistGate>
      </Provider>
    </NotificationProvider>
  );
}

const styles = StyleSheet.create({
  // Your styles here
});
