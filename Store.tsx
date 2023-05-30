import { configureStore } from '@reduxjs/toolkit';
import connectionReducer from './connexionSlice';

export const store = configureStore({
  reducer: {
    connection: connectionReducer,
  },
});
