export const debounce = <Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number,
): ((...args: Args) => void) => {
  let timerId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Args) => {
    if (timerId !== null) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      timerId = null;
      callback(...args);
    }, delay);
  };
};
