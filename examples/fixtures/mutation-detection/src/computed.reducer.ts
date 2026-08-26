const initialState = { count: 0 };

export function computedReducer(state = initialState, action: { type: string; key: "count" }) {
  if (action.type === "update") state[action.key] = 2;
  return state;
}
