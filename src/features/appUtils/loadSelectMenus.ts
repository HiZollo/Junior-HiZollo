import fs from 'fs';
import { SelectMenuInteraction } from 'discord.js';
import { HZClient } from '../../classes/HZClient';

export default async function loadSelectMenus(client: HZClient): Promise<void> {
  const selectmenuFiles = fs.readdirSync('./dist/selectmenus');
  for (const file of selectmenuFiles) {
    if (!file.endsWith('.js')) continue;
    const func: (interaction: SelectMenuInteraction<"cached">) => Promise<void> = require(`../../selectmenus/${file}`).default;
    client.selectmenus.set(file.slice(0, -3), func);
  }
}