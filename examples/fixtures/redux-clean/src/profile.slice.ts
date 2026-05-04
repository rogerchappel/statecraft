import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface ProfileState { name: string; loading: boolean; error?: string; }
const initialState: ProfileState = { name: "", loading: false };

export const fetchProfile = createAsyncThunk("profile/fetch", async (id: string, { signal }) => {
  const response = await fetch(`/api/profile/${id}`, { signal });
  return response.json() as Promise<{ name: string }>;
});

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchProfile.pending, (state) => { state.loading = true; })
      .addCase(fetchProfile.fulfilled, (state, action) => { state.loading = false; state.name = action.payload.name; })
      .addCase(fetchProfile.rejected, (state, action) => { state.loading = false; state.error = action.error.message; });
  }
});
