import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminAPI } from '../utils/api';

export const fetchTests = createAsyncThunk(
  'tests/fetchTests',
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getAllTests(page, limit);
      return response.data; // Expecting { tests: [], pagination: {} }
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch tests');
    }
  }
);

const testSlice = createSlice({
  name: 'tests',
  initialState: {
    items: [],
    loading: false,
    error: null,
    page: 1,
    hasMore: true,
    total: 0,
    // Context for AI Generator
    companyName: '',
    rolePosition: '',
  },
  reducers: {
    setContext: (state, action) => {
      state.companyName = action.payload.companyName;
      state.rolePosition = action.payload.rolePosition;
    },
    resetTests: (state) => {
      state.items = [];
      state.page = 1;
      state.hasMore = true;
      state.loading = false;
    },
    incrementPage: (state) => {
      state.page += 1;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTests.fulfilled, (state, action) => {
        state.loading = false;
        const { tests, pagination } = action.payload;

        const testsArray = Array.isArray(tests) ? tests : [];
        const paginationData = pagination || { total: 0, page: 1, limit: 10 };

        // If page 1, replace items. If > 1, append.
        if (paginationData.page === 1) {
          state.items = testsArray;
        } else {
          // Filter out duplicates just in case
          const newTests = testsArray.filter(t => !state.items.some(existing => existing.id === t.id));
          state.items = [...state.items, ...newTests];
        }

        state.total = paginationData.total;
        state.hasMore = state.items.length < paginationData.total;
      })
      .addCase(fetchTests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setContext, resetTests, incrementPage } = testSlice.actions;
export default testSlice.reducer;
