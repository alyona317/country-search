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
  dispose: () => void;
}

export const createSearchController = (
  options: SearchControllerOptions,
): SearchController => {
  throw new Error(`Not implemented: debounce ${String(options.debounceMs)}`);
};
