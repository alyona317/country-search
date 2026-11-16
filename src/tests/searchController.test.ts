import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSearchController } from '../searchController.js';
import type { SearchState } from '../searchController.js';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('searchController', () => {
  it('отменяет зависший fetch по настоящему таймауту и показывает TimeoutError', async () => {
    const reasons: unknown[] = [];
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockImplementation((_input, init) => {
        const signal = init?.signal;
        if (!signal) throw new Error('Missing signal');
        return new Promise<Response>((_resolve, reject) => {
          const abort = (): void => {
            reasons.push(signal.reason);
            const reason: unknown = signal.reason;
            reject(
              reason instanceof Error
                ? reason
                : new DOMException('Aborted', 'AbortError'),
            );
          };
          if (signal.aborted) abort();
          else signal.addEventListener('abort', abort, { once: true });
        });
      });
    vi.stubGlobal('fetch', fetchMock);
    const states: SearchState[] = [];
    let finish = (): void => {
      throw new Error('Not initialized');
    };
    const completed = new Promise<void>((resolve, reject) => {
      const watchdog = setTimeout(() => {
        reject(new Error('Timeout state not received'));
      }, 1000);
      finish = (): void => {
        clearTimeout(watchdog);
        resolve();
      };
    });
    const controller = createSearchController({
      debounceMs: 0,
      timeoutMs: 20,
      onStateChange: (state): void => {
        states.push(state);
        if (state.status === 'error') finish();
      },
    });
    try {
      controller.setQuery('spain');
      await completed;
      expect(reasons).toHaveLength(1);
      expect(reasons[0]).toMatchObject({ name: 'TimeoutError' });
      expect(states).toEqual([
        { status: 'loading' },
        {
          status: 'error',
          message: 'Сервер не ответил вовремя. Попробуйте ещё раз.',
          canRetry: true,
        },
      ]);
    } finally {
      controller.dispose();
    }
  });

  it('очистка ввода отменяет отложенный поиск', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchMock);
    const onStateChange = vi.fn<(state: SearchState) => void>();
    const controller = createSearchController({
      debounceMs: 300,
      timeoutMs: 5000,
      onStateChange,
    });
    try {
      controller.setQuery('spain');
      controller.setQuery('');
      await vi.advanceTimersByTimeAsync(300);
      expect(fetchMock).not.toHaveBeenCalled();
      expect(onStateChange).toHaveBeenLastCalledWith({ status: 'idle' });
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      controller.dispose();
    }
  });
});
