import type { CountryCard } from './mapCountryResponse.js';
import { HttpError } from './searchCountries.js';

export interface SearchErrorState {
  status: 'error';
  message: string;
  canRetry: true;
}

export type SearchResultState =
  | { status: 'empty'; countries: [] }
  | { status: 'success'; countries: CountryCard[] };

export const getErrorState = (error: unknown): SearchErrorState | null => {
  if (error instanceof Error && error.name === 'AbortError') {
    return null;
  }

  let message = 'Не удалось загрузить страны. Попробуйте ещё раз.';

  if (error instanceof Error && error.name === 'TimeoutError') {
    message = 'Сервер не ответил вовремя. Попробуйте ещё раз.';
  } else if (error instanceof HttpError) {
    message = `Ошибка сервера: ${String(error.status)}.`;
  }

  return {
    status: 'error',
    message,
    canRetry: true,
  };
};

export const getResultState = (countries: CountryCard[]): SearchResultState => {
  if (countries.length === 0) {
    return { status: 'empty', countries: [] };
  }

  return { status: 'success', countries };
};
