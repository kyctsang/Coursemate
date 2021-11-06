import 'dotenv/config';

export default {
  expo: {
    name: 'expo-firebase-auth-example',
    slug: 'expo-firebase-auth-example',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FFFFFF'
      }
    },
    web: {
      favicon: './assets/favicon.png'
    },
    extra: {
      apiKey: 'AIzaSyCYG3qrFTjGDjgHHMedoPxnQO1vY0oaXME',
      authDomain: 'coursemate-66ee7.firebaseapp.com',
      projectId: 'coursemate-66ee7',
      storageBucket: 'coursemate-66ee7.appspot.com',
      messagingSenderId: '322576591088',
      appId: '1:322576591088:web:6942ba823ecc39a74c3a35',
      databaseURL: 'https://coursemate-66ee7-default-rtdb.asia-southeast1.firebasedatabase.app/'
    }
  }
};

