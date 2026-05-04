import { combineReducers } from "redux";

function preferencesReducer(state = { theme: "system" }, action: { type: string; payload?: string }) {
  if (action.type === "preferences/theme") return { ...state, theme: action.payload ?? "system" };
  return state;
}

export const rootReducer = combineReducers({ preferences: preferencesReducer });
