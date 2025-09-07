// translations.js
// Translation utility for the application

const translations = {
  ar: {
    locationPicker: {
      // Location picker specific translations
      geolocationNotSupported: 'المتصفح لا يدعم الحصول على الموقع الحالي',
      currentLocation: 'موقعك الحالي',
      locationSuccess: 'تم تحديد موقعك الحالي بنجاح',
      invalidCoordinates: 'إحداثيات غير صالحة',
      locationError: 'فشل في الحصول على الموقع الحالي',
      locationPermissionDenied: 'تم رفض طلب الحصول على الموقع',
      locationUnavailable: 'معلومات الموقع غير متاحة',
      locationTimeout: 'انتهت مهلة طلب الموقع',
      unexpectedError: 'حدث خطأ غير متوقع',
      locationSelected: 'تم تحديد الموقع بنجاح',
      mapError: 'خطأ في تحميل الخريطة',
      mapErrorDescription: 'حدث خطأ أثناء تحميل خريطة جوجل. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.',
      loadingMap: 'جاري تحميل الخريطة...',
      searchPlaceholder: 'ابحث عن مكان...',
      gettingLocation: 'جاري تحديد الموقع...',
      latitude: 'خط العرض',
      longitude: 'خط الطول'
    }
  },
  en: {
    locationPicker: {
      // Location picker specific translations
      geolocationNotSupported: 'Browser does not support getting current location',
      currentLocation: 'Your current location',
      locationSuccess: 'Current location determined successfully',
      invalidCoordinates: 'Invalid coordinates',
      locationError: 'Failed to get current location',
      locationPermissionDenied: 'Location request was denied',
      locationUnavailable: 'Location information is unavailable',
      locationTimeout: 'Location request timed out',
      unexpectedError: 'An unexpected error occurred',
      locationSelected: 'Location selected successfully',
      mapError: 'Error loading map',
      mapErrorDescription: 'An error occurred while loading Google Maps. Please check your internet connection and try again.',
      loadingMap: 'Loading map...',
      searchPlaceholder: 'Search for a place...',
      gettingLocation: 'Getting location...',
      latitude: 'Latitude',
      longitude: 'Longitude'
    }
  }
};

/**
 * Get translations for a specific language and section
 * @param {string} language - Language code (e.g., 'ar', 'en')
 * @param {string} section - Translation section (e.g., 'locationPicker')
 * @returns {object} Translation object for the specified section
 */
export function getTranslations(language = 'ar', section = 'locationPicker') {
  const lang = translations[language] || translations.ar;
  return lang[section] || {};
}

/**
 * Get a specific translation key
 * @param {string} language - Language code
 * @param {string} section - Translation section
 * @param {string} key - Translation key
 * @param {string} fallback - Fallback value if translation not found
 * @returns {string} Translated string
 */
export function getTranslation(language = 'ar', section = 'locationPicker', key, fallback = '') {
  const sectionTranslations = getTranslations(language, section);
  return sectionTranslations[key] || fallback;
}

export default translations;