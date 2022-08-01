import fs from 'fs';
import { HZClient } from '../../classes/HZClient';
import { AutocompleteReturnType } from '../../utils/types';

export default async function loadAutocomplete(client: HZClient): Promise<void> {
  const autocompleteFiles = fs.readdirSync('./dist/autocomplete');
  for (const file of autocompleteFiles) {
    if (!file.endsWith('.js')) continue;
    const func: (client: HZClient) => AutocompleteReturnType = require(`../../autocomplete/${file}`).default;
    client.autocomplete.set(file.slice(0, -3), func(client));
  }
}