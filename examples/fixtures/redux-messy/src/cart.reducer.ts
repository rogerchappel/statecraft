interface CartState { ids: string[]; lastUpdated?: number; }
const initialState: CartState = { ids: [] };

export function cartReducer(state = initialState, action: { type: string; payload?: string }) {
  if (action.type === "cart/add") {
    state.ids.push(action.payload ?? Math.random().toString());
    state.lastUpdated = Date.now();
    return state;
  }
  return state;
}
