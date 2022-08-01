import { Command } from "../../classes/Command";
import { Source } from "../../classes/Source";
import { CommandType } from "../../utils/enums";
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";

export default class OsuUser extends Command<[string]> {
  constructor() {
    super({
      type: CommandType.Information, 
      name: 'user', 
      description: '取得一名玩家的 osu! 資料', 
      aliases: ['u'], 
      options: [{
        type: ApplicationCommandOptionType.String, 
        name: '玩家',
        description: '要查詢的玩家 ID 或名稱',
        required: true
      }]
    });
  }

  public async execute(source: Source, [player]: [string]): Promise<void> {
    const user = await source.client.osuApi.getUser({ u: player }).catch(() => {});

    if (!user) {
      await source.defer({ ephemeral: true });
      await source.update(`我已經盡力了，但仍找不到 ${player} 這位玩家`);
      return;
    }

    await source.defer();

    const { id, name, counts: { SSH, SS, SH, S, A, plays: pc }, pp: { raw: pp, rank, countryRank }, country, level, accuracy } = user;
    const helper = new EmbedBuilder()
      .setAuthor({ name: 'HiZollo 的 osu! 中心', iconURL: source.client.user?.displayAvatarURL() })
      .setHiZolloColor()
      .setThumbnail(`https://a.ppy.sh/${id}`)
      .addFields([
        { name: '玩家', value: `[${name}](https://osu.ppy.sh/u/${id})` },
        { name: 'SS總數', value: `${SSH + SS}`, inline: true },
        { name: 'SS+', value: `${SSH || 0}`, inline: true },
        { name: 'SS', value: `${SS || 0}`, inline: true },
        { name: 'S總數', value: `${SH + S}`, inline: true },
        { name: 'S+', value: `${SH || 0}`, inline: true },
        { name: 'S', value: `${S || 0}`, inline: true },
        { name: 'A總數', value: `${A || 0}` },
        { name: '等級', value: `${~~(level)}`, inline: true },
        { name: '總遊玩次數', value: `${pc || 0}`, inline: true },
        { name: '\u200b', value: '\u200b', inline: true },
        { name: 'pp', value: `${pp || 0}`, inline: true },
        { name: '世界排名', value: `${rank || '無'}`, inline: true },
        { name: `地區（${country}）排名`, value: `${countryRank || '無'}`, inline: true },
        { name: '準確率', value: `${~~(accuracy*1000)/1000}%` }
      ]);
    await source.update({ embeds: [helper] });
  }
}