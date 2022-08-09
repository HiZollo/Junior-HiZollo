import { Command } from "../../classes/Command";
import { Source } from "../../classes/Source";
import { CommandType, PageSystemMode } from "../../utils/enums";
import { APIEmbedField, ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import pageSystem from "../../features/utils/pageSystem";

export default class OsuBest extends Command<[string]> {
  constructor() {
    super({
      type: CommandType.Information, 
      parent: 'osu', 
      name: 'best', 
      description: '取得一名玩家在 osu! 上最高成績的資料', 
      aliases: ['bp'], 
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
    const message = await source.update('清單製作中……');

    const fields: APIEmbedField[][] = [];
    const thumbnails: (string | null)[] = [];
    const scores = await source.client.osuApi.getUserBest({ u: player });

    scores.forEach(({ accuracy, beatmap, counts, maxCombo, mods, pp, perfect, rank, score }) => {
      const field: APIEmbedField[] = [
        { name: '玩家', value: `[${user.name}](https://osu.ppy.sh/u/${user.id})` },
        { name: '譜面名稱', value: `[${beatmap.title}](https://osu.ppy.sh/beatmapsets/${beatmap.beatmapSetId})` },
        { name: '難度', value: `${~~(beatmap.difficulty.rating*100)/100}` },
        { name: '分數', value: `${score}`, inline: true },
        { name: '等第', value: rank.replace('H', '+').replace('X', 'SS'), inline: true },
        { name: '\u200b', value: '\u200b', inline: true },
        { name: 'Combo', value: `${maxCombo}/${beatmap.maxCombo} ${perfect ? '[FC] ': counts.miss === 0 ? '[No Miss]' : ''}`, inline: true },
        { name: '準確率', value: accuracy ? `${~~(Number(accuracy)*10000)/100}%` : '查無資訊', inline: true }, 
        { name: '\u200b', value: '\u200b', inline: true },
      ];
      if (pp) field.push({ name: 'pp', value: `${pp}` });
      field.push({ name: 'Mods', value: this.modResolve(mods).join(' ') });

      fields.push(field);
      thumbnails.push(`https://b.ppy.sh/thumb/${beatmap.beatmapSetId}l.jpg`);
    });

    const helper = new EmbedBuilder().applyHiZolloSettings(source.member, 'HiZollo 的 osu! 中心');

    if (source.isMessage()) {
      await message.delete().catch(() => {});
    }
    
    await pageSystem({
      mode: PageSystemMode.EmbedField,
      source: source,
      pages: fields,
      embed: helper,
      thumbnails: thumbnails, 
      contents: {
        exit: '玩家資料已關閉', 
        idle: '玩家資料已因閒置超過 30 秒而關閉'
      }
    });
  }

  private modResolve(mods: string | string[]): string[] {
    if (!mods.length) return ['-'];
    const output = [];
    if (mods.includes('Easy')) output.push('EZ');
    if (mods.includes('NoFail')) output.push('NF');
    if (mods.includes('HalfTime')) output.push('HT');
    if (mods.includes('HardRock')) output.push('HR');
    if (mods.includes('Perfect')) output.push('PF');
    else if (mods.includes('SuddenDeath')) output.push('SD');
    if (mods.includes('Nightcore')) output.push('NC');
    else if (mods.includes('DoubleTime')) output.push('DT');
    if (mods.includes('Hidden')) output.push('HD');
    if (mods.includes('FadeIn')) output.push('FI');
    if (mods.includes('Flashlight')) output.push('FL');
    if (mods.includes('Mirror')) output.push('MR');
    if (mods.includes('Relax')) output.push('RX');
    if (mods.includes('SpunOut')) output.push('SO');
    if (mods.includes('TouchDevice')) output.push('TD');
  
    return output;
  }
}