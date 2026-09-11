const initialState = { status: "idle" };

export function sessionReducer(state = initialState, action: { type: string }) {
  return action.type === "reset" ? initialState : state;
}
