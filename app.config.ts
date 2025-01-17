import { Environment, Flavor } from '@appjusto/types';
import { ConfigContext, ExpoConfig } from '@expo/config';
import 'dotenv/config';
import { isEmpty } from 'lodash';
import { Extra } from './config/types';
import { version, versionCode } from './version.json';
const {
  FLAVOR,
  ENVIRONMENT,
  EXPO_BUSINESS_ID,
  EXPO_CONSUMER_ID,
  EXPO_COURIER_ID,
  FACEBOOK_CONSUMER_APP_ID,
  FACEBOOK_COURIER_APP_ID,
  FACEBOOK_BUSINESS_APP_ID,
  FIREBASE_API_KEY_ANDROID,
  FIREBASE_API_KEY_IOS,
  FIREBASE_REGION,
  FIREBASE_PROJECT_ID,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_CONSUMER_APP_ID,
  FIREBASE_COURIER_APP_ID,
  FIREBASE_BUSINESS_APP_ID,
  FIREBASE_EMULATOR_HOST,
  SEGMENT_CONSUMER_IOS_KEY,
  SEGMENT_CONSUMER_ANDROID_KEY,
  SEGMENT_COURIER_IOS_KEY,
  SEGMENT_COURIER_ANDROID_KEY,
  SENTRY_DSN,
  IUGU_ACCOUNT_ID,
  ALGOLIA_APPID,
  ALGOLIA_APIKEY,
  SENTRY_AUTH_TOKEN,
} = process.env;

const flavor: Flavor = FLAVOR as Flavor;
const environment: Environment = ENVIRONMENT as Environment;

const getBaseDomain = (environment: Environment) =>
  `${environment === 'live' ? '' : `${environment}.`}appjusto.com.br`;

const getDeeplinkDomain = (environment: Environment) =>
  `${environment.charAt(0)}.deeplink.appjusto.com.br`;

const getFallbackDomain = (environment: Environment) =>
  `${environment === 'live' ? '' : `${environment}.`}login.appjusto.com.br`;

const expoId = () => {
  if (FLAVOR === 'consumer') return EXPO_CONSUMER_ID!;
  if (FLAVOR === 'courier') return EXPO_COURIER_ID!;
  if (FLAVOR === 'business') return EXPO_BUSINESS_ID!;
  throw new Error('FLAVOR inválido');
};

export default (context: ConfigContext): ExpoConfig => {
  const config: ExpoConfig = {
    owner: 'appjusto',
    name: name(),
    slug: slug(),
    // scheme: scheme(),
    privacy: 'hidden',
    platforms: ['ios', 'android'],
    version,
    orientation: 'portrait',
    splash: {
      image: flavor === 'business' ? './assets/splash-business.png' : './assets/splash.png',
      resizeMode: 'cover',
      backgroundColor: '#9ce592',
    },
    notification: {
      icon: './assets/notification-icon.png',
    },
    updates: {
      fallbackToCacheTimeout: 1000 * (flavor === 'courier' ? 30 : 5),
    },
    assetBundlePatterns: ['**/*'],
    ios: ios(),
    android: android(),
    androidStatusBar: {
      hidden: true,
    },
    extra: extra(),
    hooks: hooks(),
    ...facebokConfig(),
    plugins:
      flavor === 'courier'
        ? [
            [
              'expo-notifications',
              {
                icon: './assets/notification-icon.png',
                sounds: ['./assets/sounds/order_request.wav'],
              },
            ],
            [
              'expo-ads-facebook',
              {
                userTrackingPermission:
                  'Usamos esse identificador para medir a conversão dos nossos anúncios.',
              },
            ],
            'expo-splash-screen',
            'sentry-expo',
          ]
        : [
            [
              'expo-ads-facebook',
              {
                userTrackingPermission:
                  'Usamos esse identificador para medir a conversão dos nossos anúncios.',
              },
            ],
          ],
  };
  // console.log(config);
  return config;
};

const name = () => {
  let name = 'AppJusto';
  if (environment === 'live') {
    if (flavor === 'consumer') return name;
    if (flavor === 'courier') return `${name} Entregador`;
    if (flavor === 'business') return `${name} Restaurante`;
  }
  if (flavor === 'courier') name = 'Entregador';
  if (flavor === 'business') name = 'Restaurante';
  return `(${environment.charAt(0).toUpperCase()}) ${name}`;
};

const slug = () => {
  const slug = `app-justo-${flavor}`;
  if (environment !== 'live') return `${slug}-${environment}`;
  return slug;
};

const appBundlePackage = () => {
  return `br.com.appjusto.${flavor}.${environment}`;
};

const icon = (platform: 'ios' | 'android') => {
  return `./assets/icon-${flavor}-${platform}.png`;
};

const facebokConfig = (): object => {
  let appId = '';
  if (flavor === 'consumer') appId = FACEBOOK_CONSUMER_APP_ID!;
  if (flavor === 'courier') appId = FACEBOOK_COURIER_APP_ID!;
  if (flavor === 'business') appId = FACEBOOK_BUSINESS_APP_ID!;
  if (isEmpty(appId)) return {};
  return {
    facebookScheme: 'fb' + appId,
    facebookAppId: appId,
    facebookDisplayName: 'AppJusto',
    facebookAutoLogAppEventsEnabled: true,
    facebookAdvertiserIDCollectionEnabled: true,
  };
};

const ios = () => ({
  bundleIdentifier: appBundlePackage(),
  buildNumber: `${versionCode}`,
  icon: icon('ios'),
  supportsTablet: false,
  infoPlist:
    flavor === 'business'
      ? { UIBackgroundModes: ['fetch'] }
      : flavor === 'consumer'
      ? {
          NSUserTrackingUsageDescription:
            'Usamos esse identificador para medir a conversão dos nossos anúncios.',
          NSLocationWhenInUseUsageDescription:
            'Precisamos da sua localização para exibir os restaurantes próximos a você',
        }
      : {
          UIBackgroundModes: ['location'],
          NSUserTrackingUsageDescription: '',
          NSLocationWhenInUseUsageDescription:
            'Precisamos da sua localização para enviar corridas próximas e monitorar a entrega.',
          NSLocationAlwaysAndWhenInUseUsageDescription:
            'Precisamos da sua localização para enviar corridas próximas e monitorar a entrega.',
        },
  associatedDomains: [
    `applinks:${getBaseDomain(environment)}`,
    `applinks:${getDeeplinkDomain(environment)}`,
    `applinks:${getFallbackDomain(environment)}`,
  ],
  config: {
    googleMapsApiKey: FIREBASE_API_KEY_IOS,
  },
});

const intentFilter = (host: string, pathPrefix: string) => ({
  action: 'VIEW',
  autoVerify: false,
  data: [
    {
      scheme: 'https',
      host,
      pathPrefix,
    },
  ],
  category: ['BROWSABLE', 'DEFAULT'],
});
const intentFilters = () =>
  [
    intentFilter(getBaseDomain(environment), `/${flavor}`),
    intentFilter(getDeeplinkDomain(environment), `/${flavor}`),
    intentFilter(getFallbackDomain(environment), `/${flavor}`),
  ]
    .concat(flavor === 'consumer' ? [intentFilter(getBaseDomain(environment), `/r`)] : [])
    .concat(flavor === 'courier' ? [intentFilter(getBaseDomain(environment), `/f`)] : []);

const android = () =>
  ((
    {
      android: {
        package: appBundlePackage(),
        versionCode,
        adaptiveIcon: {
          foregroundImage: icon('android'),
          backgroundColor:
            flavor === 'business' ? '#2F422C' : flavor === 'consumer' ? '#78E08F' : '#FFE493',
        },
        googleServicesFile: `./google-services-${environment}.json`,
        useNextNotificationsApi: true,
        softwareKeyboardLayoutMode: 'pan',
        permissions: permissions(),
        intentFilters: intentFilters(),
        config: {
          googleMaps: {
            apiKey: FIREBASE_API_KEY_ANDROID,
          },
        },
      },
    } as ExpoConfig
  ).android);

const permissions = () =>
  flavor === 'business'
    ? ['RECEIVE_BOOT_COMPLETED', 'WAKE_LOCK']
    : flavor === 'consumer'
    ? ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION']
    : [
        'RECEIVE_BOOT_COMPLETED',
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'ACCESS_BACKGROUND_LOCATION',
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
        'VIBRATE',
        // 'RECORD_AUDIO',
      ];

const extra = (): Extra => ({
  flavor,
  environment,
  bundleIdentifier: appBundlePackage(),
  androidPackage: appBundlePackage(),
  firebase: {
    apiKeyAndroid: FIREBASE_API_KEY_ANDROID!,
    apiKeyiOS: FIREBASE_API_KEY_IOS!,
    authDomain: `${FIREBASE_PROJECT_ID}.firebaseapp.com`,
    region: FIREBASE_REGION!,
    projectId: FIREBASE_PROJECT_ID!,
    storageBucket:
      process.env.FIREBASE_EMULATOR === 'true'
        ? 'gs://default-bucket'
        : `${FIREBASE_PROJECT_ID}.appspot.com`,
    messagingSenderId: FIREBASE_MESSAGING_SENDER_ID!,
    appId:
      flavor === 'consumer'
        ? FIREBASE_CONSUMER_APP_ID!
        : flavor === 'courier'
        ? FIREBASE_COURIER_APP_ID!
        : FIREBASE_BUSINESS_APP_ID!,
    emulator: {
      enabled: process.env.FIREBASE_EMULATOR === 'true',
      host: FIREBASE_EMULATOR_HOST,
    },
  },
  eas: {
    projectId: expoId(),
  },
  analytics: {
    segmentConsumerAndroidKey: SEGMENT_CONSUMER_ANDROID_KEY!,
    segmentConsumeriOSKey: SEGMENT_CONSUMER_IOS_KEY!,
    segmentCourierAndroidKey: SEGMENT_COURIER_ANDROID_KEY!,
    segmentCourieriOSKey: SEGMENT_COURIER_IOS_KEY!,
    sentryDNS: SENTRY_DSN!,
  },
  iugu: {
    accountId: IUGU_ACCOUNT_ID!,
  },
  algolia: {
    appId: ALGOLIA_APPID!,
    apiKey: ALGOLIA_APIKEY!,
  },
});

const hooks = () => ({
  postPublish: [
    {
      file: 'sentry-expo/upload-sourcemaps',
      config: {
        organization: 'app-justo',
        project: 'app',
        authToken: SENTRY_AUTH_TOKEN,
      },
    },
  ],
});
