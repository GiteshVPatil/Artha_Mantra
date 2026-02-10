import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  trades: [],
  currentTrade: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

export const tradingSlice = createSlice({
  name: 'trading',
  initialState,
  reducers: {
    reset: (state) => initialState,
    setCurrentTrade: (state, action) => {
      state.currentTrade = action.payload;
    },
  },
});

export const { reset, setCurrentTrade } = tradingSlice.actions;
export default tradingSlice.reducer;
