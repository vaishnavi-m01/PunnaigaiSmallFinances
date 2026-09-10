import { configureStore } from '@reduxjs/toolkit';
import { rootReducer, RootState } from './rootReducer';

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type { RootState };
export type AppDispatch = typeof store.dispatch;
