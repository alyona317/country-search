export const searchCountries = (
  query: string,
  signal: AbortSignal,
): Promise<string[]> => {
  return Promise.reject(
    new Error(`Not implemented: ${query}, aborted: ${String(signal.aborted)}`),
  );
};
