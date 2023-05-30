import { createSlice } from '@reduxjs/toolkit';

export const connectionSlice = createSlice({
  name: 'connection',
  initialState: {
    serverAddress: '',
    serverPort: '',
  },
  reducers: {
    setServerAddress: (state, action) => {
      state.serverAddress = action.payload;
    },
    setServerPort: (state, action) => {
      state.serverPort = action.payload;
    },
  },
});

export const { setServerAddress, setServerPort } = connectionSlice.actions;

export default connectionSlice.reducer;
