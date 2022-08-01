import { DjsFlipTrip } from "@hizollo/games";
import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { flipTrip as strings } from "../features/json/gameString.json";
import { CommandType } from "../utils/enums";

export default class FlipTrip extends Command<[number]> {
  constructor() {
    super({ 
      type: CommandType.SinglePlayerGame, 
      name: 'fliptrip', 
      description: '開啟一場猜 Flip Trip', 
      extraDescription:
        `**遊戲規則：**\n`+
        `遊戲開始後，會有你指定數量的棋子排成一列，每顆棋子有兩面，一面白一面黑，白面朝上\n`+
        `按下對應的按鈕就可以將棋子翻面（一次只能翻一顆），同時目前棋子的狀態也會被記錄下來（例如：白白黑白白白）\n`+
        `你的目標是在不能翻出重複的樣式的情況下，將棋子的所有排列翻完\n`+
        `注意當遊戲閒置超過 30 秒時，遊戲會直接結束\n`+
        `**遊戲範例：**\n`+
        `\`/fliptrip 2\`\n`+
        `白白=>白黑=>黑黑=>白黑　失敗，因為\`白黑\`出現了兩次\n`+
        `白白=>黑白=>黑黑=>白黑　獲勝，因為所有排列都剛好出現一次`,
      aliases: ['ft'], 
      options: [{
        type: ApplicationCommandOptionType.Integer, 
        name: '數量', 
        description: '指定 Flip Trip 的棋子數量', 
        required: false, 
        minValue: 1, 
        maxValue: 10
      }], 
      permissions: {
        bot: [PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.SendMessages]
      }
    });
  }

  public async execute(source: Source, [boardSize]: [number]): Promise<void> {
    const game = new DjsFlipTrip({
      players: [source.user], 
      boardSize: boardSize ?? 3, 
      source: source.source, 
      time: 30e3, 
      strings: strings
    });

    await game.initialize();
    await game.start();
    await game.conclude();
  }
}