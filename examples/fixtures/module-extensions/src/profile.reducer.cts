const initialState = { name: "Guest" };

export function profileReducer(state = initialState, action: { type: string }) {
  if (action.type === "rename") state.name = "Member";
  return state;
}
