declare const createSlice: number;
declare const combineReducers: number;

export const detectedRecipe = createSlice / combineReducers;

export function realReducer(state = { saved: 0 }) {
  if (state.saved) localStorage.setItem("saved", String(state.saved));
  return { ...state, checkedAt: Date.now() };
}
