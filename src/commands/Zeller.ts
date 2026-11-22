import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { ArgumentParseType, CommandType } from "../typings/enums";

export default class Zeller extends Command<[number, number, number]> {
  constructor() {
    super({
      type: CommandType.Fun, 
      name: 'zeller', 
      description: '計算星期幾', 
      options: [{ 
        type: ApplicationCommandOptionType.Integer, 
        name: '年份', 
        description: '年份', 
        required: true
      }, { 
        type: ApplicationCommandOptionType.Integer, 
        name: '月份', 
        description: '月份', 
        minValue: 1,
        maxValue: 12,
        required: true
      }, { 
        type: ApplicationCommandOptionType.Integer, 
        name: '日期', 
        description: '日期', 
        minValue: 1,
        maxValue: 31,
        required: true
      }], 
      argumentParseMethod: {
        type: ArgumentParseType.None
      }
    });
  }

  public async execute(source: Source, [year, month, day]: [number, number, number]): Promise<void> {
    if ([4, 6, 9, 11].includes(month) && day > 30) {
      await source.defer({ ephemeral: true });
      await source.update(`你是智障嗎？${month} 月最多只有 30 天`);
      return;
    }
    
    if (month === 2 && day > (this.isLeapYear(year) ? 29 : 28)) {
      await source.defer({ ephemeral: true });
      await source.update(`你是智障嗎？${year} 年 ${month} 月最多只有 ${this.isLeapYear(year) ? 29 : 28} 天`);
      return;
    }

    if (year === 1582 && month === 10 && day >= 5 && day <= 14) {
      await source.defer({ ephemeral: true });
      await source.update(`1582 年 10 月 5 日至 14 日不存在，你是不是沒有在看我的 \`fact\` 指令`);
      return;
    }

    await source.defer();
    const dayOfWeek = this.getDayOfWeek(year, month, day);
    await source.update(`星期${'日一二三四五六'[dayOfWeek]}`);
  }

  private getDayOfWeek(year: number, month: number, day: number): number {
    if (month < 3) {
      month += 12;
      year -= 1;
    }

    const c = Math.floor(year / 100);
    year %= 100;

    const w = (year + Math.floor(year / 4) + Math.floor(c / 4) - 2 * c + Math.floor(13 * (month + 1) / 5) + day - 1) % 7;
    return (w + 7) % 7;
  }

  private isLeapYear(year: number): boolean {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  }
}
