import { configureStore } from '@reduxjs/toolkit';
import connectionReducer from './connectionSlice';
import recordingsReducer from './recordingsSlice';

export const store = configureStore({
  reducer: {
    connection: connectionReducer,
    recordings: recordingsReducer,
  },
});