import { Platform } from 'react-native';

/**
 * Backend API base URL for Android app.
 * Using the IPv4 address you provided for physical device testing.
 */
const DEVICE_HOST_IP = '192.168.10.4'; // Only use this for physical devices

const getBaseUrl = () => {
  if (__DEV__) {
    // If physical device IP is set and we're not on emulator (common way to check is checking if it's android and not 10.0.2.2)
    // However, 10.0.2.2 is the standard for Android emulators to access localhost
    return Platform.OS === 'android' 
      ? 'http://10.0.2.2:5001/api/' 
      : 'http://localhost:5001/api/';
  }
  
  // Production URL
  return 'http://localhost:5001/api/';
};

export const API_BASE_URL = getBaseUrl();

// import { Platform } from 'react-native';

// /**
//  * Backend API base URL for Android app (same backend as fyp_admin).
//  * - Android Emulator: 10.0.2.2 = host machine's localhost
//  * - Physical device: set DEVICE_HOST_IP to your computer's LAN IP (e.g. '192.168.1.5')
//  */
// const DEVICE_HOST_IP = '192.168.100.25'; // e.g. '192.168.1.5' when testing on physical Android device

// const getBaseUrl = () => {
//   if (DEVICE_HOST_IP) {
//     return `https://backendfyp-production-41c6.up.railway.app/api/`;
//   }
//   if (__DEV__) {
//     return Platform.OS === 'android'
//       ? 'https://backendfyp-production-41c6.up.railway.app/api/'
//       : 'https://backendfyp-production-41c6.up.railway.app/api/';
//   }
//   return 'https://backendfyp-production-41c6.up.railway.app/api/';
// };

// export const API_BASE_URL = getBaseUrl();