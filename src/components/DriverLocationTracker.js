import { useEffect } from 'react';
import { driverApi } from '../api/apiService';
import useDriverLocationTracking from '../hooks/useDriverLocationTracking';
import { useDriverOnline } from '../context/DriverOnlineContext';
import { useAuth } from '../context/AuthContext';

/**
 * Keeps sending driver GPS while online, across all driver screens.
 */
export default function DriverLocationTracker() {
  const { isOnline, setIsOnline } = useDriverOnline();
  const { user } = useAuth();
  const isDriverRole = user?.role === 'driver';

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await driverApi.getProfile();
        if (mounted && res.success) {
          setIsOnline(Boolean(res.driver?.is_online));
        }
      } catch {
        // ignore
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [setIsOnline]);

  useDriverLocationTracking(isDriverRole && isOnline);
  return null;
}
