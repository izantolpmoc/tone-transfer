import { createSlice } from '@reduxjs/toolkit';

export const connectionSlice = createSlice({
  name: 'connection', // Name of the slice
  initialState: {
    serverAddress: '', // Initial value for server address
    serverPort: '8000', // Initial value for server port
  },
  reducers: {
    setServerAddress: (state, action) => {
      state.serverAddress = action.payload; // Update server address with the value provided in the action
    },
    setServerPort: (state, action) => {
      state.serverPort = action.payload; // Update server port with the value provided in the action
    },
  },
});

export const { setServerAddress, setServerPort } = connectionSlice.actions;

export default connectionSlice.reducer;
