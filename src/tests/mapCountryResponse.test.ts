import { describe, expect, it } from 'vitest';
import { mapCountryResponse } from '../mapCountryResponse.js';
import type { CountryResponse } from '../mapCountryResponse.js';

const createRawCountry = (): CountryResponse => ({
  name: 'Spain',
  flags: {
    png: 'https://flagcdn.com/w320/es.png',
    svg: 'https://flagcdn.com/es.svg',
  },
  capital: 'Madrid',
  region: 'Europe',
  population: 47351567,
  languages: [
    {
      name: 'Spanish',
    },
  ],
});

describe('mapCountryResponse', () => {
  it('преобразует ответ API в данные для карточки', () => {
    const raw = createRawCountry();

    const result = mapCountryResponse(raw);

    expect(result).toEqual({
      name: 'Spain',
      flag: 'https://flagcdn.com/es.svg',
      capital: 'Madrid',
      region: 'Europe',
      population: 47351567,
      languages: ['Spanish'],
    });
  });

  it('не изменяет исходный объект', () => {
    const raw = createRawCountry();
    const original = structuredClone(raw);

    mapCountryResponse(raw);

    expect(raw).toEqual(original);
  });

  it('преобразует несколько языков в массив названий', () => {
    const raw = {
      ...createRawCountry(),
      languages: [
        {
          iso639_1: 'en',
          iso639_2: 'eng',
          name: 'English',
          nativeName: 'English',
        },
        {
          iso639_1: 'fr',
          iso639_2: 'fra',
          name: 'French',
          nativeName: 'Français',
        },
      ],
    };

    const result = mapCountryResponse(raw);

    expect(result.languages).toEqual(['English', 'French']);
  });

  it('возвращает пустой массив, если список языков пуст', () => {
    const raw = {
      ...createRawCountry(),
      languages: [],
    };

    const result = mapCountryResponse(raw);

    expect(result.languages).toEqual([]);
  });
});
