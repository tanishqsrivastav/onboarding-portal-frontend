import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  filters: {
    name: '',
    location: '',
    pointOfContact: '',
    startDate: '',
  },
  isModalOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    updateFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    toggleModal(state, action) {
      state.isModalOpen = action.payload;
    },
  },
});

export const { updateFilters, toggleModal } = uiSlice.actions;
export default uiSlice.reducer;
