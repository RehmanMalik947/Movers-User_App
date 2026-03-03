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
  vehicle: null, // { id, name, ... }
  goods: null,   // { type, fragile }
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
    setVehicle: (state, action) => {
      state.vehicle = action.payload;
    },
    setGoods: (state, action) => {
      state.goods = action.payload;
    },
    resetLocations: (state) => {
      state.pickup = { latitude: null, longitude: null, address: '' };
      state.dropoff = { latitude: null, longitude: null, address: '' };
      state.vehicle = null;
      state.goods = null;
    },
  },
});

export const { setPickupLocation, setDropoffLocation, setVehicle, setGoods, resetLocations } =
  locationSlice.actions;

export default locationSlice.reducer;
