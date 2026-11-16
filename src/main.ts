import { createSearchController } from './searchController.js';
import type { SearchState } from './searchController.js';

const main = document.createElement('main');
const heading = document.createElement('h1');
heading.textContent = 'Поиск стран';
const label = document.createElement('label');
label.textContent = 'Название страны: ';
const input = document.createElement('input');
input.type = 'search';
input.placeholder = 'Например, Spain';
label.append(input);
const message = document.createElement('p');
message.setAttribute('role', 'status');
message.setAttribute('aria-live', 'polite');
const retry = document.createElement('button');
retry.type = 'button';
retry.textContent = 'Повторить';
retry.hidden = true;
const results = document.createElement('ul');
main.append(heading, label, message, retry, results);
document.body.append(main);

const render = (state: SearchState): void => {
  results.replaceChildren();
  retry.hidden = true;
  main.setAttribute('aria-busy', String(state.status === 'loading'));

  switch (state.status) {
    case 'idle':
      message.textContent = 'Введите название страны.';
      break;
    case 'loading':
      message.textContent = 'Загрузка…';
      break;
    case 'empty':
      message.textContent = 'Ничего не найдено.';
      break;
    case 'error':
      message.textContent = state.message;
      retry.hidden = !state.canRetry;
      break;
    case 'success':
      message.textContent = `Найдено стран: ${String(state.countries.length)}`;
      for (const country of state.countries) {
        const item = document.createElement('li');
        const name = document.createElement('h2');
        name.textContent = country.name;
        const flag = document.createElement('img');
        flag.src = country.flag;
        flag.alt = `Флаг: ${country.name}`;
        flag.width = 100;
        const details = document.createElement('p');
        details.textContent = [
          `Столица: ${country.capital}`,
          `Регион: ${country.region}`,
          `Население: ${country.population.toLocaleString('ru-RU')}`,
          `Языки: ${country.languages.join(', ')}`,
        ].join(' · ');
        item.append(name, flag, details);
        results.append(item);
      }
      break;
  }
};

const controller = createSearchController({
  debounceMs: 300,
  timeoutMs: 5000,
  onStateChange: render,
});
input.addEventListener('input', () => {
  controller.setQuery(input.value);
});
retry.addEventListener('click', () => {
  controller.retry();
});
window.addEventListener('pagehide', () => {
  controller.setQuery('');
});
render({ status: 'idle' });
