import { useEffect, useRef } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { driverApi } from '../api/apiService';

const LOCATION_INTERVAL_MS = 30000;

async function requestLocationPermission() {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'Allow access to your location so your truck owner can track deliveries.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
}

/**
 * Periodically sends driver GPS to the backend while `enabled` is true (e.g. when online).
 */
export default function useDriverLocationTracking(enabled) {
  const watchIdRef = useRef(null);
  const intervalRef = useRef(null);
  const blockUpdatesRef = useRef(false);
  const warnedRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      blockUpdatesRef.current = false;
      warnedRef.current = false;
      if (watchIdRef.current != null) {
        Geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    let cancelled = false;
    const sendLocation = async (latitude, longitude) => {
      if (blockUpdatesRef.current) return;
      try {
        await driverApi.updateLocation(latitude, longitude);
      } catch (err) {
        const msg = String(err?.message || '').toLowerCase();
        if (msg.includes('only drivers can update location')) {
          blockUpdatesRef.current = true;
          if (!warnedRef.current) {
            warnedRef.current = true;
            console.warn('Driver location tracking stopped: account is not authorized as a driver.');
          }
          return;
        }
        console.warn('Failed to send location:', err.message);
      }
    };

    (async () => {
      const allowed = await requestLocationPermission();
      if (!allowed || cancelled) return;

      Geolocation.getCurrentPosition(
        (pos) => {
          if (blockUpdatesRef.current) return;
          const { latitude, longitude } = pos.coords;
          sendLocation(latitude, longitude);
        },
        (err) => console.warn('Initial location error:', err.message),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );

      watchIdRef.current = Geolocation.watchPosition(
        (pos) => {
          if (blockUpdatesRef.current) return;
          const { latitude, longitude } = pos.coords;
          sendLocation(latitude, longitude);
        },
        (err) => console.warn('Watch location error:', err.message),
        { enableHighAccuracy: true, distanceFilter: 50, interval: LOCATION_INTERVAL_MS }
      );

      intervalRef.current = setInterval(() => {
        if (blockUpdatesRef.current) return;
        Geolocation.getCurrentPosition(
          (pos) => sendLocation(pos.coords.latitude, pos.coords.longitude),
          () => {},
          { enableHighAccuracy: false, timeout: 10000, maximumAge: LOCATION_INTERVAL_MS }
        );
      }, LOCATION_INTERVAL_MS);
    })();

    return () => {
      cancelled = true;
      if (watchIdRef.current != null) {
        Geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled]);
}
