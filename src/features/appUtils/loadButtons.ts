import fs from 'fs';
import { ButtonInteraction } from 'discord.js';
import { HZClient } from '../../classes/HZClient';

export default async function loadButtons(client: HZClient): Promise<void> {
  const buttonFiles = fs.readdirSync('./dist/buttons');
  for (const file of buttonFiles) {
    if (!file.endsWith('.js')) continue;
    const func: (interaction: ButtonInteraction<"cached">) => Promise<void> = require(`../../buttons/${file}`).default;
    client.buttons.set(file.slice(0, -3), func);
  }
}