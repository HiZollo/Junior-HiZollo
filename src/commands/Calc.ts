/*
 * 
 * Copyright 2022 HiZollo Dev Team <https://github.com/hizollo>
 * 
 * This file is a part of Junior HiZollo.
 * 
 * Junior HiZollo is free software: you can redistribute it and/or 
 * modify it under the terms of the GNU General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * Junior HiZollo is distributed in the hope that it will be useful, 
 * but WITHOUT ANY WARRANTY; without even the implied warranty of 
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Junior HiZollo. If not, see <https://www.gnu.org/licenses/>.
 */

import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import removeMd from "../features/utils/removeMd";
import { ArgumentParseType, CommandType } from "../utils/enums";

const decNumber = '(?:[1-9]*\\d*\\.\\d+)|(?:(?:(?:[1-9]\\d*)|0)\\.?)';
const hexNumber = '0(?:X|x)[\dAaBbCcDdEeFf]+';
const octNumber = '0o[0-7]+';
const binNumber = '0b[01]+';
const number = `(?:(?:${decNumber})|(?:${hexNumber})|(?:${octNumber})|(?:${binNumber}))`;
const operation = '[+\\-*\\/^]';
const term = `\\(? *${number}(?: *${operation} *${number})* *\\)?`;
const expression = `^ *\\(? *[+\\-]? *${term}(?: *${operation} *${term})* *\\)? *$`;

export default class Calc extends Command<[string]> {
  constructor() {
    super({
      type: CommandType.Utility, 
      name: 'calc', 
      description: '讓我來幫你計算一串算式，支援四則運算及雙層括號', 
      aliases: ['c'], 
      options: [{ 
        type: ApplicationCommandOptionType.String, 
        name: '算式', 
        description: '你想要計算的算式', 
        required: true
      }], 
      argumentParseMethod: {
        type: ArgumentParseType.None
      }
    });
  }

  public async execute(source: Source, [formula]: [string]): Promise<void> {
    const validExpression = new RegExp(expression);
    let finalContent;

    try {
      if (!validExpression.test(formula)) {
        await source.defer({ ephemeral: true });
        await source.update(`這個算式似乎夾雜了一些其他的東西，如果你認為你的輸入皆無誤，請協助用 \`bug\` 指令回報給開發團隊`);
        return;
      }
      else {
        const original = removeMd(formula);
        const answer = removeMd(eval(formula.replace(/\^/g, '**'))?.toString());
        finalContent = `算式：\n> ${original}\n\n結果：\n>>> ${answer}`;
        if (finalContent.length > 2000) {
          await source.defer({ ephemeral: true });
          await source.update(`計算結果超出 2000 字元上限，因此我無法顯示`);
          return;
        }
      }
    } catch (error) {
      console.error(error);
      await source.defer({ ephemeral: true });
      await source.update(`好像出了一點錯誤？我不知道發生了什麼，如果你認為這不是你輸入的問題，請協助用 \`bug\` 指令回報給開發團隊`);
      return;
    }

    await source.defer();
    await source.update(finalContent);
  }
}