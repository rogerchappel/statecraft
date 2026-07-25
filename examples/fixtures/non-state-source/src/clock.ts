export const timestamp = (): number => Date.now();

export const randomId = (): string => Math.random().toString(36);

export function prepareFixture(state: { count: number }, value: any): void {
  state.count = value;
}
