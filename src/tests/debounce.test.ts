import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { debounce } from '../debounce.js';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('не вызывает функцию сразу', () => {
    const mockFunc = vi.fn();
    const debouncedFunc = debounce(mockFunc, 300);

    debouncedFunc();
    expect(mockFunc).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(mockFunc).toHaveBeenCalledTimes(1);
  });

  it('сбрасывает таймер при каждом новом вызове', () => {
    const mockFunc = vi.fn();
    const debouncedFunc = debounce(mockFunc, 500);
    debouncedFunc();
    vi.advanceTimersByTime(300);
    debouncedFunc();
    vi.advanceTimersByTime(200);
    expect(mockFunc).not.toHaveBeenCalled();
    vi.advanceTimersByTime(300);
    expect(mockFunc).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
  it('вызывает функцию один раз при нескольких вызовах', () => {
    const mockFunc = vi.fn();
    const debouncedFunc = debounce(mockFunc, 500);
    debouncedFunc();
    debouncedFunc();
    debouncedFunc();
    vi.advanceTimersByTime(500);
    expect(mockFunc).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
  it('вызывает функцию с последними переданными аргументами', () => {
    const mockFunc = vi.fn();
    const debouncedFunc = debounce(mockFunc, 500);
    debouncedFunc('France');
    debouncedFunc('Germany');
    vi.advanceTimersByTime(500);
    expect(mockFunc).toHaveBeenCalledTimes(1);
    expect(mockFunc).toHaveBeenCalledWith('Germany');
    vi.useRealTimers();
  });
  it('вызывает функцию повторно поле истечения времени задержки', () => {
    const mockFunc = vi.fn();
    const debouncedFunc = debounce(mockFunc, 500);
    debouncedFunc();
    vi.advanceTimersByTime(500);
    expect(mockFunc).toHaveBeenCalledTimes(1);
    debouncedFunc();
    vi.advanceTimersByTime(500);
    expect(mockFunc).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
