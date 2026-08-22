export const initialState = {};

export function controlReducer(state = initialState, value = "", values: string[] = []) {
  if (value) /sessionStorage\./.test(value);
  while (values.length) /localStorage\./.test(values.pop() ?? "");
  for (const candidate of values) /Math\.random\s*\(/.test(candidate);
  return state;
}
