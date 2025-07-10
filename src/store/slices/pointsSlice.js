import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getUserPoints, getPointsHistory } from "../../services/service/pointsService";

// Async thunks
export const fetchUserPoints = createAsyncThunk(
  "points/fetchUserPoints",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await getUserPoints(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPointsHistory = createAsyncThunk(
  "points/fetchPointsHistory",
  async ({ userId, params }, { rejectWithValue }) => {
    try {
      const response = await getPointsHistory(userId, params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  availablePoints: 0,
  pointsHistory: [],
  loading: false,
  error: null,
  historyLoading: false,
  historyError: null,
};

const pointsSlice = createSlice({
  name: "points",
  initialState,
  reducers: {
    clearPointsError: (state) => {
      state.error = null;
    },
    clearHistoryError: (state) => {
      state.historyError = null;
    },
    updateAvailablePoints: (state, action) => {
      state.availablePoints = action.payload;
    },
    resetPoints: (state) => {
      state.availablePoints = 0;
      state.pointsHistory = [];
      state.error = null;
      state.historyError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user points
      .addCase(fetchUserPoints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPoints.fulfilled, (state, action) => {
        state.loading = false;
        state.availablePoints = action.payload.points || 0;
      })
      .addCase(fetchUserPoints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch points history
      .addCase(fetchPointsHistory.pending, (state) => {
        state.historyLoading = true;
        state.historyError = null;
      })
      .addCase(fetchPointsHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.pointsHistory = action.payload.history || [];
      })
      .addCase(fetchPointsHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError = action.payload;
      });
  },
});

export const { clearPointsError, clearHistoryError, updateAvailablePoints, resetPoints } =
  pointsSlice.actions;

export default pointsSlice.reducer;
