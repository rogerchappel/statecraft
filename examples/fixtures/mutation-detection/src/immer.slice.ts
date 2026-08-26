import { createSlice } from "@reduxjs/toolkit";

const initialState = { count: 0, items: [] as number[], flags: {} as Record<string, boolean> };

export const immerSlice = createSlice({
  name: "immer",
  initialState,
  reducers: {
    increment(state) { state.count += 1; },
    update(state, action: { payload: string }) { state[action.payload] = 2; },
    append(state) { state.items.push(3); }
  }
});
