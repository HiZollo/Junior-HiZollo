import { Interaction, InteractionType, SelectMenuInteraction } from 'discord.js';
import fs from 'fs';
import path from 'path';
import constant from '../constant.json';
import { HZClient } from "./HZClient";

export class SelectMenuManager {
  public client: HZClient;
  private data: Map<string, (interaction: SelectMenuInteraction<"cached">) => Promise<void>>;
  private loaded: boolean;

  constructor(client: HZClient) {
    this.client = client;
    this.data = new Map();
    this.loaded = false;
  }

  public async load(dirPath: string): Promise<void> {
    if (this.loaded) throw new Error('Autocomplete has already been loaded.');

    const buttonFiles = fs.readdirSync(dirPath);
    for (const file of buttonFiles) {
      if (!file.endsWith('.js')) continue;
      const func: (interaction: SelectMenuInteraction<"cached">) => Promise<void> = require(path.join(dirPath, file)).default;
      this.data.set(file.slice(0, -3), func);
    }

    this.loaded = true;
  }

  public async onInteractionCreate(interaction: Interaction): Promise<void> {
    if (interaction.type !== InteractionType.MessageComponent || !interaction.isSelectMenu()) return;
    if (!interaction.inCachedGuild()) return;
    if (interaction.user.blocked) return;
    if (this.client.devMode && interaction.guild.id !== constant.mainGuild.id) return;

    const [identifier] = interaction.customId.split('_');
    const action = this.data.get(identifier);
    action?.(interaction);
    return;
  }
}