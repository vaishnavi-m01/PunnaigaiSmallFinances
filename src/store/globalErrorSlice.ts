import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface GlobalErrorState {
  hasError: boolean;
  title: string;
  message: string;
  errorCode?: string;
}

const initialState: GlobalErrorState = {
  hasError: false,
  title: '',
  message: '',
  errorCode: undefined,
};

export const globalErrorSlice = createSlice({
  name: 'globalError',
  initialState,
  reducers: {
    setError: (
      state,
      action: PayloadAction<{ title: string; message: string; errorCode?: string }>
    ) => {
      state.hasError = true;
      state.title = action.payload.title;
      state.message = action.payload.message;
      state.errorCode = action.payload.errorCode;
    },
    clearError: state => {
      state.hasError = false;
      state.title = '';
      state.message = '';
      state.errorCode = undefined;
    },
  },
});

export const { setError, clearError } = globalErrorSlice.actions;
export default globalErrorSlice.reducer;
