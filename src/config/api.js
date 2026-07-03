import { Platform } from 'react-native';

/**
 * Backend API base URL.
 * - Physical Android device: use your PC's LAN IP so the phone can reach the backend over Wi-Fi.
 * - Android Emulator: use 10.0.2.2 (maps to host localhost).
 * - iOS Simulator: use localhost.
 *
 * ⚠️  Set IS_PHYSICAL_DEVICE = true when running on a real phone.
 *     Set IS_PHYSICAL_DEVICE = false when running on an emulator/simulator.
 */
const IS_PHYSICAL_DEVICE = true;            // ← toggle this
const DEVICE_HOST_IP    = '192.168.137.208';  // ← your PC's LAN IP

// const getBaseUrl = () => {
//   if (IS_PHYSICAL_DEVICE) {
//     return `http://${DEVICE_HOST_IP}:5001/api/`;
//   }
//   if (__DEV__) {
//     return Platform.OS === 'android'
//       ? 'http://10.0.2.2:5001/api/'
//       : 'http://localhost:5001/api/';
//   }
//   return 'http://localhost:5001/api/';
// };
const getBaseUrl = () => {
  if (IS_PHYSICAL_DEVICE) {
    return `https://fypbackend-production-795e.up.railway.app/api/`;
  }
  if (__DEV__) {
    return Platform.OS === 'android'
      ? 'https://fypbackend-production-795e.up.railway.app/api/'
      : 'https://fypbackend-production-795e.up.railway.app/api/';
  }
  return 'https://fypbackend-production-795e.up.railway.app/api/';
};
export const API_BASE_URL = getBaseUrl();

