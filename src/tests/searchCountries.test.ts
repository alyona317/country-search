import { afterEach, describe, it, expect, vi } from 'vitest';
import { searchCountries } from '../searchCountries.js';

describe('searchCountries', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('возвращает страны из успешного ответа и передаёт signal в fetch', async () => {
    const countries = [{ name: 'Spain', capital: 'Madrid' }];
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(JSON.stringify(countries), { status: 200 }),
      );
    vi.stubGlobal('fetch', fetchMock);
    const controller = new AbortController();

    const result = await searchCountries('spain', controller.signal);

    expect(result).toEqual(countries);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://countries.dev/name/spain',
      expect.objectContaining({ signal: controller.signal }),
    );
  });

  it('возвращает пустой массив при статусе 404', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 404 }));
    vi.stubGlobal('fetch', fetchMock);
    const controller = new AbortController();

    await expect(
      searchCountries('unknown', controller.signal),
    ).resolves.toEqual([]);
  });

  it('выбрасывает HttpError со статусом 500', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response('Internal Server Error', { status: 500 }),
      );
    vi.stubGlobal('fetch', fetchMock);
    const controller = new AbortController();

    const request = searchCountries('spain', controller.signal);

    await expect(request).rejects.toBeInstanceOf(Error);
    await expect(request).rejects.toMatchObject({
      name: 'HttpError',
      status: 500,
    });
  });

  it('передаёт сетевую ошибку вызывающему коду', async () => {
    const error = new TypeError('Failed to fetch');
    const fetchMock = vi.fn<typeof fetch>().mockRejectedValue(error);
    vi.stubGlobal('fetch', fetchMock);
    const controller = new AbortController();

    await expect(searchCountries('spain', controller.signal)).rejects.toBe(
      error,
    );
  });

  it('передаёт AbortError вызывающему коду', async () => {
    const error = new DOMException('Aborted', 'AbortError');
    const fetchMock = vi.fn<typeof fetch>().mockRejectedValue(error);
    vi.stubGlobal('fetch', fetchMock);
    const controller = new AbortController();

    await expect(searchCountries('spain', controller.signal)).rejects.toBe(
      error,
    );
  });

  it('передаёт TimeoutError вызывающему коду', async () => {
    const error = new DOMException('Timed out', 'TimeoutError');
    const fetchMock = vi.fn<typeof fetch>().mockRejectedValue(error);
    vi.stubGlobal('fetch', fetchMock);
    const controller = new AbortController();

    await expect(searchCountries('spain', controller.signal)).rejects.toBe(
      error,
    );
  });

  it('кодирует поисковую строку для URL', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response('[]', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const controller = new AbortController();

    await searchCountries('spain & portugal', controller.signal);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://countries.dev/name/spain%20%26%20portugal',
      expect.objectContaining({ signal: controller.signal }),
    );
  });
});
