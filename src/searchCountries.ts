import type { CountryResponse } from './mapCountryResponse.js';

export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, statusText: string) {
    super(`HTTP ${String(status)}: ${statusText}`);
    this.name = 'HttpError';
    this.status = status;
  }
}

export const searchCountries = async (
  query: string,
  signal: AbortSignal,
): Promise<CountryResponse[]> => {
  const response = await fetch(
    `https://countries.dev/name/${encodeURIComponent(query)}`,
    { signal },
  );

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new HttpError(response.status, response.statusText);
  }

  return (await response.json()) as CountryResponse[];
};
