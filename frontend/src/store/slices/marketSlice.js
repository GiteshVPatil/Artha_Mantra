import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  quotes: {},
  watchlist: [],
  searchResults: [],
  isLoading: false,
  isError: false,
  message: '',
};

export const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    reset: (state) => initialState,
    updateQuote: (state, action) => {
      const { symbol, data } = action.payload;
      state.quotes[symbol] = data;
    },
    addToWatchlist: (state, action) => {
      state.watchlist.push(action.payload);
    },
    removeFromWatchlist: (state, action) => {
      state.watchlist = state.watchlist.filter(
        (symbol) => symbol !== action.payload
      );
    },
  },
});

export const { reset, updateQuote, addToWatchlist, removeFromWatchlist } =
  marketSlice.actions;
export default marketSlice.reducer;
