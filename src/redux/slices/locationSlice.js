import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  pickup: {
    latitude: null,
    longitude: null,
    address: '',
  },
  dropoff: {
    latitude: null,
    longitude: null,
    address: '',
  },
};

export const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setPickupLocation: (state, action) => {
      state.pickup = action.payload;
    },
    setDropoffLocation: (state, action) => {
      state.dropoff = action.payload;
    },
    resetLocations: (state) => {
      state.pickup = { latitude: null, longitude: null, address: '' };
      state.dropoff = { latitude: null, longitude: null, address: '' };
    },
  },
});

export const { setPickupLocation, setDropoffLocation, resetLocations } =
  locationSlice.actions;

export default locationSlice.reducer;
