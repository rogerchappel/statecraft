const initialState = { count: 0 };

export function cartReducer(state = initialState, action: { type: string }) {
  if (action.type === "increment") state.count++;
  return state;
}
