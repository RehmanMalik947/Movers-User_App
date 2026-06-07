export const normalizeStatus = (status) => {
  if (!status) return 'pending';
  return String(status).toLowerCase().replace(/_/g, '-');
};

export const ACTIVE_STATUSES = ['assigned', 'arrived-at-pickup', 'arrived_at_pickup', 'in-progress', 'in_progress'];

export const isActiveStatus = (status) => ACTIVE_STATUSES.includes(normalizeStatus(status));

export const isHistoryJob = (status) =>
  ['completed', 'cancelled'].includes(normalizeStatus(status));

export const isOpenJob = (status) => Boolean(status) && !isHistoryJob(status);

export const STATUS_LABELS = {
  pending: 'Pending',
  assigned: 'Driver Assigned',
  'arrived-at-pickup': 'At Pickup Location',
  arrived_at_pickup: 'At Pickup Location',
  'in-progress': 'In Transit',
  in_progress: 'In Transit',
  completed: 'Delivered',
  cancelled: 'Cancelled',
};

export const STATUS_COLORS = {
  pending: '#64748B',
  assigned: '#2260D9',
  'arrived-at-pickup': '#F59E0B',
  arrived_at_pickup: '#F59E0B',
  'in-progress': '#1847B1',
  in_progress: '#1847B1',
  completed: '#10B981',
  cancelled: '#EF4444',
};

export const getStatusLabel = (status) => {
  const key = normalizeStatus(status);
  return STATUS_LABELS[key] || STATUS_LABELS[status] || String(status).replace(/[-_]/g, ' ');
};

export const getStatusColor = (status) => {
  const key = normalizeStatus(status);
  return STATUS_COLORS[key] || STATUS_COLORS[status] || '#64748B';
};

export const DRIVER_STEPS = [
  { key: 'assigned', label: 'Assigned', icon: 'person-outline' },
  { key: 'arrived_at_pickup', label: 'At Pickup', icon: 'location-outline' },
  { key: 'in-progress', label: 'In Transit', icon: 'car-outline' },
  { key: 'completed', label: 'Delivered', icon: 'checkmark-circle-outline' },
];

export const getStepIndex = (status) => {
  const s = normalizeStatus(status).replace(/-/g, '_');
  const map = { assigned: 0, arrived_at_pickup: 1, in_progress: 2, completed: 3 };
  return map[s] ?? -1;
};

export const getDriverAction = (status) => {
  const s = normalizeStatus(status).replace(/-/g, '_');
  switch (s) {
    case 'assigned':
      return {
        label: "I'm At Pickup Location",
        sublabel: 'Customer will be notified you have arrived',
        action: 'arrive',
        icon: 'location',
        color: '#F59E0B',
      };
    case 'arrived_at_pickup':
      return {
        label: 'Start Delivery',
        sublabel: 'Begin transit to destination — timer starts now',
        action: 'start',
        icon: 'play',
        color: '#1847B1',
      };
    case 'in_progress':
      return {
        label: 'Complete Delivery',
        sublabel: 'Confirm goods delivered at destination',
        action: 'complete',
        icon: 'checkmark-circle',
        color: '#10B981',
      };
    default:
      return null;
  }
};

export const formatElapsedTime = (startedAt) => {
  if (!startedAt) return '00:00:00';
  const diff = Math.max(0, Date.now() - new Date(startedAt).getTime());
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
};

export const getTrackingSteps = (job) => {
  const status = normalizeStatus(job?.status).replace(/-/g, '_');
  const fmt = (date) =>
    date
      ? new Date(date).toLocaleString([], {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Pending';

  const stepDone = (keys) => keys.includes(status) || status === 'completed';

  return [
    {
      label: 'Order Placed',
      completed: true,
      date: fmt(job?.createdAt || job?.requestedDate),
      icon: 'cart-outline',
    },
    {
      label: 'Driver Assigned',
      completed: stepDone(['assigned', 'arrived_at_pickup', 'in_progress']),
      date: stepDone(['assigned', 'arrived_at_pickup', 'in_progress']) ? 'Done' : 'Waiting',
      icon: 'person-outline',
    },
    {
      label: 'Driver at Pickup',
      completed: stepDone(['arrived_at_pickup', 'in_progress']),
      date: job?.arrivedAtPickup ? fmt(job.arrivedAtPickup) : stepDone(['arrived_at_pickup', 'in_progress']) ? 'Done' : 'Pending',
      icon: 'location-outline',
    },
    {
      label: 'Delivery Started',
      completed: stepDone(['in_progress']),
      date: job?.startedAt ? fmt(job.startedAt) : stepDone(['in_progress']) ? 'In Transit' : 'Pending',
      icon: 'car-outline',
    },
    {
      label: 'Delivered',
      completed: status === 'completed',
      date: job?.completedAt ? fmt(job.completedAt) : status === 'completed' ? 'Done' : 'Pending',
      icon: 'checkmark-circle-outline',
    },
  ];
};

export const getUserStatusSubtitle = (status) => {
  const s = normalizeStatus(status).replace(/-/g, '_');
  switch (s) {
    case 'pending':
      return 'Waiting for bids from truck owners';
    case 'assigned':
      return 'Driver is heading to your pickup location';
    case 'arrived_at_pickup':
      return 'Driver has arrived at your location';
    case 'in_progress':
      return 'Your goods are on the way to destination';
    case 'completed':
      return 'Delivery completed successfully';
    case 'cancelled':
      return 'This job was cancelled';
    default:
      return 'Tracking your shipment';
  }
};
