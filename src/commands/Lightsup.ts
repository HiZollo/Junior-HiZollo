import { DjsLightsUp } from "@hizollo/games";
import { PermissionFlagsBits } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { lightsUp as strings } from "../features/json/gameString.json";
import { CommandType } from "../utils/enums";

export default class Lightsup extends Command<[]> {
  constructor() {
    super({ 
      type: CommandType.SinglePlayerGame, 
      name: 'lightsup', 
      description: '開啟一場點燈遊戲', 
      extraDescription:
        `**遊戲規則：**\n`+
        `HiZollo 會給出有 5*5 個燈泡的盤面，每個燈泡可能是亮（藍色）或暗（灰色）\n`+
        `當你按下某個燈泡時，該燈泡及其上下左右的燈泡都會亮暗交替\n`+
        `遊戲目標是要把全部的燈泡都點亮（全藍）\n`+
        `注意當遊戲閒置超過 30 秒時，遊戲會直接結束`,
      aliases: ['lu'], 
      permissions: {
        bot: [PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.SendMessages]
      }
    });
  }

  public async execute(source: Source): Promise<void> {
    const game = new DjsLightsUp({
      players: [source.user], 
      source: source.source, 
      time: 30e3, 
      strings: strings
    });

    await game.initialize();
    await game.start();
    await game.conclude();
  }
}