import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ToastState {
  visible: boolean;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

const initialState: ToastState = {
  visible: false,
  type: 'info',
  title: '',
  message: '',
  duration: 3000,
};

export const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showToast: (
      state,
      action: PayloadAction<{
        type: 'success' | 'error' | 'info' | 'warning';
        title: string;
        message?: string;
        duration?: number;
      }>
    ) => {
      state.visible = true;
      state.type = action.payload.type;
      state.title = action.payload.title;
      state.message = action.payload.message;
      state.duration = action.payload.duration || 3000;
    },
    hideToast: state => {
      state.visible = false;
    },
  },
});

export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;
