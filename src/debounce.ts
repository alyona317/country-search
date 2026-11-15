export const debounce = <Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number,
): ((...args: Args) => void) => {
  throw new Error(
    `Function not implemented: ${callback.name}, delay ${String(delay)}`,
  );
};
