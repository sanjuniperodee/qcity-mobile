import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ru from './locales/ru.json';
import kz from './locales/kz.json';
import en from './locales/en.json';

i18n
  .use(initReactI18next)
  .init({
    load: 'languageOnly',
    supportedLngs: ['ru', 'kz', 'en'],
    lng: (typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('lng')) || 'ru',
    resources: {
      ru: {
        translation: ru,
      },
      kz: {
        translation: kz,
      },
      en: {
        translation: en,
      },
    },
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
