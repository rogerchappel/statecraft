const initialState = { loaded: false };

export function catalogReducer() {
  return { ...initialState, loaded: true };
}
