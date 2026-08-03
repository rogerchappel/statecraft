const initialState = { visible: false };

export function shadowReducer() {
  return { ...initialState, visible: true };
}
