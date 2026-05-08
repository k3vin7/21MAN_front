const MIN_DELAY_MS = 300;
const MAX_DELAY_MS = 800;

export const mockDelay = () => {
  const duration = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);

  return new Promise((resolve) => globalThis.setTimeout(resolve, duration));
};

export const cloneMock = <T>(value: T): T => {
  return structuredClone(value);
};
