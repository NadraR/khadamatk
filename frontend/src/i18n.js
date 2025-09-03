import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./translations/en.json";
import ar from "./translations/ar.json";
import enAbout from "./locales/en/about.json";
import arAbout from "./locales/ar/about.json";

const savedLanguage = localStorage.getItem("language") || "en";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { 
        translation: en,
        about: enAbout
      },
      ar: { 
        translation: ar,
        about: arAbout
      },
    },
    lng: savedLanguage, 
    fallbackLng: "en", 
    interpolation: {
      escapeValue: false, 
    },
    detection: {
      order: ["localStorage", "navigator"], 
      caches: ["localStorage"],
    },
  });

export default i18n;
