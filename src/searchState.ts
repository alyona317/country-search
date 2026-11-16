import type { CountryCard } from './mapCountryResponse.js';

export interface SearchErrorState {
  status: 'error';
  message: string;
  canRetry: true;
}

export type SearchResultState =
  | { status: 'empty'; countries: [] }
  | { status: 'success'; countries: CountryCard[] };

export const getErrorState = (error: unknown): SearchErrorState | null => {
  throw new Error(`Not implemented: ${String(error)}`);
};

export const getResultState = (countries: CountryCard[]): SearchResultState => {
  throw new Error(`Not implemented: ${String(countries.length)} countries`);
};
