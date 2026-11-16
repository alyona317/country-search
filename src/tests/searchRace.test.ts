import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSearchController } from '../searchController.js';
import type { SearchState } from '../searchController.js';
import type { CountryResponse } from '../mapCountryResponse.js';

const createCountry = (name: string): CountryResponse => ({
  name,
  flags: {
    svg: 'https://example.com/flag.svg',
    png: 'https://example.com/flag.png',
  },
  capital: 'Madrid',
  region: 'Europe',
  population: 1,
  languages: [{ name: 'Spanish' }],
});

describe('гонка запросов', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('немедленно отменяет старый запрос и сохраняет только последний результат', async () => {
    const signals: AbortSignal[] = [];
    const aborted = vi.fn<(error: DOMException) => void>();
    const responseOrder: string[] = [];
    const oldCountry = createCountry('Old result');
    const latestCountry = createCountry('Spain');

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockImplementation((input, init) => {
        const signal = init?.signal;
        if (!signal) {
          throw new Error('Запрос должен передавать signal');
        }
        signals.push(signal);
        const url =
          typeof input === 'string'
            ? input
            : input instanceof URL
              ? input.href
              : input.url;
        const isOld = url.endsWith('/sp');

        return new Promise<Response>((resolve, reject) => {
          const onAbort = (): void => {
            const error = new DOMException('Aborted', 'AbortError');
            aborted(error);
            reject(error);
          };

          if (signal.aborted) {
            onAbort();
            return;
          }
          signal.addEventListener('abort', onAbort, { once: true });

          // Ответ старого запроса запланирован позже нового.
          // После abort его попытка resolve уже не изменит отклонённый промис.
          setTimeout(
            () => {
              signal.removeEventListener('abort', onAbort);
              responseOrder.push(isOld ? 'old' : 'latest');
              resolve(
                new Response(
                  JSON.stringify([isOld ? oldCountry : latestCountry]),
                ),
              );
            },
            isOld ? 1000 : 100,
          );
        });
      });
    vi.stubGlobal('fetch', fetchMock);
    const onStateChange = vi.fn<(state: SearchState) => void>();
    const controller = createSearchController({
      debounceMs: 300,
      timeoutMs: 5000,
      onStateChange,
    });

    try {
      controller.setQuery('sp');
      await vi.advanceTimersByTimeAsync(300);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      controller.setQuery('spain');

      // Проверяем отмену до истечения debounce нового ввода.
      expect(signals[0]?.aborted).toBe(true);
      expect(aborted).toHaveBeenCalledTimes(1);
      expect(aborted).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'AbortError' }),
      );
      expect(fetchMock).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(300);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      await vi.advanceTimersByTimeAsync(100);

      const expectedState = {
        status: 'success',
        countries: [
          {
            name: 'Spain',
            flag: latestCountry.flags.svg,
            capital: 'Madrid',
            region: 'Europe',
            population: 1,
            languages: ['Spanish'],
          },
        ],
      };
      expect(onStateChange).toHaveBeenLastCalledWith(expectedState);
      const stateCount = onStateChange.mock.calls.length;

      await vi.advanceTimersByTimeAsync(600);

      expect(responseOrder).toEqual(['latest', 'old']);
      expect(onStateChange).toHaveBeenCalledTimes(stateCount);
      expect(onStateChange).toHaveBeenLastCalledWith(expectedState);
      expect(
        onStateChange.mock.calls.some(([state]) => state.status === 'error'),
      ).toBe(false);
    } finally {
      controller.dispose();
    }
  });
});
