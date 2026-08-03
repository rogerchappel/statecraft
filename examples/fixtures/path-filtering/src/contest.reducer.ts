const initialState = { lastStartedAt: 0 };

export function contestReducer(state = initialState, action: { type: string }) {
  if (action.type === "contest/started") {
    return { ...state, lastStartedAt: Date.now() };
  }
  return state;
}
