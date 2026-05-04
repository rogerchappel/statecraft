import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CounterState { value: number; status: "idle" | "saving" | "failed"; }
const initialState: CounterState = { value: 0, status: "idle" };

export const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    increment(state) { state.value += 1; },
    addAmount(state, action: PayloadAction<number>) { state.value += action.payload; }
  }
});
