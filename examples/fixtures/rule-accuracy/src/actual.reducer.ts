const initialState = { value: 0 };

export function actualReducer(state = initialState, action: { type: string }) {
  if (action.type === "reset") return { value: Date.now() };
  return state;
}
