import { describe, expect, it } from 'vitest';
import { HttpError } from '../searchCountries.js';
import { getErrorState, getResultState } from '../searchState.js';

describe('getErrorState', () => {
  it('не создаёт состояние ошибки для AbortError', () => {
    const error = new DOMException('Aborted', 'AbortError');

    expect(getErrorState(error)).toBeNull();
  });

  it('возвращает ошибку таймаута с возможностью повтора', () => {
    const error = new DOMException('Timed out', 'TimeoutError');

    expect(getErrorState(error)).toEqual({
      status: 'error',
      message: 'Сервер не ответил вовремя. Попробуйте ещё раз.',
      canRetry: true,
    });
  });

  it('возвращает HTTP-ошибку с возможностью повтора', () => {
    const error = new HttpError(500, 'Internal Server Error');

    expect(getErrorState(error)).toEqual({
      status: 'error',
      message: 'Ошибка сервера: 500.',
      canRetry: true,
    });
  });

  it('возвращает сетевую ошибку с возможностью повтора', () => {
    const error = new TypeError('Failed to fetch');

    expect(getErrorState(error)).toEqual({
      status: 'error',
      message: 'Не удалось загрузить страны. Попробуйте ещё раз.',
      canRetry: true,
    });
  });

  it('обрабатывает неизвестную ошибку', () => {
    expect(getErrorState('unexpected error')).toEqual({
      status: 'error',
      message: 'Не удалось загрузить страны. Попробуйте ещё раз.',
      canRetry: true,
    });
  });
});

describe('getResultState', () => {
  it('возвращает состояние «ничего не найдено» для пустого массива', () => {
    // searchCountries преобразует ответ 404 в [].
    expect(getResultState([])).toEqual({
      status: 'empty',
      countries: [],
    });
  });

  it('возвращает состояние с найденными странами', () => {
    const countries = [
      {
        name: 'Spain',
        flag: 'https://flagcdn.com/es.svg',
        capital: 'Madrid',
        region: 'Europe',
        population: 47351567,
        languages: ['Spanish'],
      },
    ];

    expect(getResultState(countries)).toEqual({
      status: 'success',
      countries,
    });
  });
});
