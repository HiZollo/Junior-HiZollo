import fs from 'fs';
import path from 'path';
import constant from '../constant.json';
import { AutocompleteReturnType } from "../utils/types";
import { HZClient } from "./HZClient";
import { Interaction, InteractionType } from 'discord.js';


export class AutocompleteManager {
  public client: HZClient;
  private data: Map<string, AutocompleteReturnType>;
  private loaded: boolean;

  constructor(client: HZClient) {
    this.client = client;
    this.data = new Map();
    this.loaded = false;
  }

  public async load(dirPath: string): Promise<void> {
    if (this.loaded) throw new Error('Autocomplete has already been loaded.');

    const autocompleteFiles = fs.readdirSync(dirPath);
    for (const file of autocompleteFiles) {
      if (!file.endsWith('.js')) continue;
      const func: (client: HZClient) => AutocompleteReturnType = require(path.join(dirPath, file)).default;
      this.data.set(file.slice(0, -3), func(this.client));
    }

    this.loaded = true;
  }

  public async onInteractionCreate(interaction: Interaction): Promise<void> {
    if (interaction.type !== InteractionType.ApplicationCommandAutocomplete) return;
    if (!interaction.inCachedGuild()) return;
    if (interaction.user.blocked) return;
    if (this.client.devMode && interaction.guild.id !== constant.mainGuild.id) return;

    let commandName = interaction.commandName;
    if (interaction.options.getSubcommand(false)) commandName += '_' + interaction.options.getSubcommand(false)

    const option = interaction.options.getFocused(true);

    // 傳進來的字串可能不合文法，直接當成查無結果
    let regExp: RegExp;
    try {
      regExp = new RegExp(option.value.toLowerCase().split('').join('.*?'));
    } catch {
      return interaction.respond([]);
    }

    // 選出符合正則表達式的選項
    const result = this.data.get(commandName)?.[option.name]?.filter(({ name, devOnly }) => {
      if (!regExp.test(name.toLowerCase())) return false;
      if (devOnly && interaction.guild.id !== constant.devGuild.id) return false;
      return true;
    });
    if (!result) return interaction.respond([]);

    // 依據相關性排序
    result.sort((a, b) => {
      const aMatch = regExp.exec(a.name.toLowerCase());
      const bMatch = regExp.exec(b.name.toLowerCase());

      if (!aMatch && !bMatch) return 0;
      if (!aMatch) return 1;
      if (!bMatch) return -1;
  
      // 符合 regExp 的字串長度越長，代表越不符合
      if (aMatch[0].length > bMatch[0].length) return 1;
      if (aMatch[0].length < bMatch[0].length) return -1;
  
      // 如果都一樣長就比誰的匹配字串比較前面
      if (aMatch.index > bMatch.index) return 1;
      if (aMatch.index < bMatch.index) return -1;
      return 0;
    });
  
    return interaction.respond(result.slice(0, 10).map(({ name: n }) => ({ name: n, value: n })));
  }
}