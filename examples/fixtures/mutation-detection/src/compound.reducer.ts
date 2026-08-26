const initialState = { count: 0 };

export function compoundReducer(state = initialState, action: { type: string }) {
  if (action.type === "increment") state.count += 1;
  return action.type === "copy" ? { ...state, count: state.count + 1 } : state;
}
