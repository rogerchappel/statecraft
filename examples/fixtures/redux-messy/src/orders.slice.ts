import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState: any = { loading: false, items: [] };
export const loadOrders = createAsyncThunk("orders/load", async () => fetch("/api/orders").then((r) => r.json()));
export const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(loadOrders.fulfilled, (state, action) => { state.items = action.payload; });
  }
});
