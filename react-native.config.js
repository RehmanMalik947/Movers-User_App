module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./src/assets/fonts'],
  dependencies: {
    'react-native-vector-icons': {
      platforms: {
        ios: {}, // ✅ keep this empty (not null) so it links properly on iOS
        android: {}, // ✅ ensure Android support
      },
    },
  },
};
