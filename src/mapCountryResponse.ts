export interface CountryResponse {
  name: string;
  flags: {
    svg: string;
    png: string;
  };
  capital: string;
  region: string;
  population: number;
  languages: {
    name: string;
  }[];
}

export interface CountryCard {
  name: string;
  flag: string;
  capital: string;
  region: string;
  population: number;
  languages: string[];
}

export const mapCountryResponse = (raw: CountryResponse): CountryCard => {
  return {
    name: raw.name,
    flag: raw.flags.svg,
    capital: raw.capital,
    region: raw.region,
    population: raw.population,
    languages: raw.languages.map((language) => language.name),
  };
};
