export const recipeVocabulary = /createSlice|combineReducers|createReducer|createAsyncThunk/gi;
export const ruleVocabulary = /Date\.now\s*\(|Math\.random\s*\(|localStorage\.|sessionStorage\.|state\.value\s*=/;

export function ratio(total: number, count: number): number {
  return total / count;
}
