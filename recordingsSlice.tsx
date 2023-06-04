import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RenamePayload {
  oldUri: string;
  newUri: string;
}

const recordingsSlice = createSlice({
  name: 'recordings',
  initialState: [] as string[],  // Empty array as initial state
  reducers: {
    loadCurrentRecordings: (state, action: PayloadAction<string[]>) => {
      return action.payload;  // Replace entire state
    },
    addRecording: (state, action: PayloadAction<string>) => {
      state.push(action.payload);  // Add new recording
    },
    removeRecording: (state, action: PayloadAction<string>) => {
      return state.filter((uri) => uri !== action.payload);  // Remove specific recording
    },
    renameRecording: (state, action: PayloadAction<RenamePayload>) => {
      return state.map((uri) => uri === action.payload.oldUri ? action.payload.newUri : uri);  // Rename specific recording
    },
  },
});

export const { addRecording, removeRecording, renameRecording, loadCurrentRecordings } = recordingsSlice.actions;

export default recordingsSlice.reducer;
