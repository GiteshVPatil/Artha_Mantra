import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import portfolioService from '../../services/portfolioService';

const initialState = {
  portfolios: [],
  currentPortfolio: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Get portfolios
export const getPortfolios = createAsyncThunk(
  'portfolio/getAll',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      return await portfolioService.getPortfolios(token);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create portfolio
export const createPortfolio = createAsyncThunk(
  'portfolio/create',
  async (portfolioData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      return await portfolioService.createPortfolio(portfolioData, token);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    reset: (state) => initialState,
    setCurrentPortfolio: (state, action) => {
      state.currentPortfolio = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPortfolios.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPortfolios.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.portfolios = action.payload;
      })
      .addCase(getPortfolios.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createPortfolio.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createPortfolio.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.portfolios.push(action.payload);
      })
      .addCase(createPortfolio.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, setCurrentPortfolio } = portfolioSlice.actions;
export default portfolioSlice.reducer;
