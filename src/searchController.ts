import { mapCountryResponse } from './mapCountryResponse.js';
import { searchCountries } from './searchCountries.js';
import { getErrorState, getResultState } from './searchState.js';
import type { SearchErrorState, SearchResultState } from './searchState.js';

export type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | SearchResultState
  | SearchErrorState;

export interface SearchControllerOptions {
  debounceMs: number;
  timeoutMs: number;
  onStateChange: (state: SearchState) => void;
}

export interface SearchController {
  setQuery: (query: string) => void;
  retry: () => void;
  dispose: () => void;
}

export const createSearchController = (
  options: SearchControllerOptions,
): SearchController => {
  let timerId: ReturnType<typeof setTimeout> | null = null;
  let activeController: AbortController | null = null;
  let latestQuery = '';
  let disposed = false;

  const cancelPending = (): void => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
    activeController?.abort();
    activeController = null;
  };

  const runSearch = async (query: string): Promise<void> => {
    const controller = new AbortController();
    activeController = controller;
    const signal = AbortSignal.any([
      controller.signal,
      AbortSignal.timeout(options.timeoutMs),
    ]);

    options.onStateChange({ status: 'loading' });

    try {
      const countries = await searchCountries(query, signal);

      if (
        disposed ||
        controller.signal.aborted ||
        activeController !== controller
      ) {
        return;
      }

      signal.throwIfAborted();
      options.onStateChange(getResultState(countries.map(mapCountryResponse)));
    } catch (error: unknown) {
      if (
        disposed ||
        controller.signal.aborted ||
        activeController !== controller
      ) {
        return;
      }

      const state = getErrorState(error);
      if (state !== null) {
        options.onStateChange(state);
      }
    } finally {
      if (activeController === controller) {
        activeController = null;
      }
    }
  };

  const setQuery = (query: string): void => {
    if (disposed) {
      return;
    }

    cancelPending();
    latestQuery = query.trim();

    if (latestQuery === '') {
      options.onStateChange({ status: 'idle' });
      return;
    }

    const scheduledQuery = latestQuery;
    timerId = setTimeout(() => {
      timerId = null;
      void runSearch(scheduledQuery);
    }, options.debounceMs);
  };

  const retry = (): void => {
    if (disposed || latestQuery === '') {
      return;
    }

    cancelPending();
    void runSearch(latestQuery);
  };

  const dispose = (): void => {
    disposed = true;
    cancelPending();
  };

  return { setQuery, retry, dispose };
};
