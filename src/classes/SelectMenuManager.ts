import { Interaction, InteractionType, SelectMenuInteraction } from 'discord.js';
import fs from "node:fs";
import path from "node:path";
import constant from '../constant.json';
import { HZClient } from "./HZClient";

/**
 * 掌管所有的永久選單
 */
export class SelectMenuManager {
  /**
   * 機器人的 client
   */
  public client: HZClient;
  
  /**
   * 選單識別ID－回應方式的鍵值對
   */
  private data: Map<string, (interaction: SelectMenuInteraction<"cached">) => Promise<void>>;
  
  /**
   * 永久選單的回應是否已載入完畢
   */
  private loaded: boolean;

  /**
   * 建立永久選單的管家
   * @param client 機器人的 client
   */
  constructor(client: HZClient) {
    this.client = client;
    this.data = new Map();
    this.loaded = false;
  }

  /**
   * 載入永久選單的回應
   * @param dirPath 要載入的目標資料夾
   */
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

  /**
   * 轉接第一線的指令互動
   * @param interaction 從 client#on('interactionCreate') 得到的指令互動
   */
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