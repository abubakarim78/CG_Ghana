import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import tw from './tw.json';
import ga from './ga.json';

export interface SupportedLanguage {
  code: string;
  label: string;
  nativeLabel: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'tw', label: 'Asante Twi', nativeLabel: 'Twi' },
  { code: 'ga', label: 'Ga', nativeLabel: 'Ga' },
];

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    fallbackLng: 'en',
    lng: 'en',
    resources: {
      en: { translation: en },
      tw: { translation: tw },
      ga: { translation: ga },
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
