const initialState = { items: [] as number[] };

export function collectionReducer(state = initialState, action: { type: string }) {
  if (action.type === "append") state.items.push(3);
  if (action.type === "read") return { ...state, items: state.items.map((item) => item * 2) };
  return state;
}
