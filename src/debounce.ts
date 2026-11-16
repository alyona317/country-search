export type Debounced<Args extends unknown[]> = ((...args: Args) => void) & {
  cancel: () => void;
};

export const debounce = <Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number,
): Debounced<Args> => {
  let timerId: ReturnType<typeof setTimeout> | null = null;
  const cancel = (): void => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };
  const debounced = (...args: Args): void => {
    cancel();
    timerId = setTimeout(() => {
      timerId = null;
      callback(...args);
    }, delay);
  };
  return Object.assign(debounced, { cancel });
};
