const initialState = { value: "", cached: "" };

export function templateReducer(state = initialState, action: { type: string }) {
  if (action.type === "stamp") return { ...state, value: `id-${Date.now()}` };
  if (action.type === "random") return { ...state, value: `id-${`nested-${Math.random()}`}` };
  if (action.type === "load") return { ...state, cached: `value-${localStorage.getItem("key")}` };
  if (action.type === "session") return { ...state, cached: `value-${sessionStorage.getItem("key")}` };
  if (action.type === "cast") return { ...state, value: `${action as any}` };
  const literal = `Date.now() Math.random() localStorage.value action as any`;
  // `${sessionStorage.getItem("ignored")}`
  return literal ? state : state;
}
