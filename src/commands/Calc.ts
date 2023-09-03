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

import { CalcError, Calculator, ErrorCodes } from "@hizollo/calculator";
import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import removeMd from "../features/utils/removeMd";
import { ArgumentParseType, CommandType } from "../typings/enums";

export default class Calc extends Command<[string]> {
  constructor() {
    super({
      type: CommandType.Utility, 
      name: 'calc', 
      description: '讓我來幫你計算一串算式，支援四則運算及各類數學函式', 
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

  private calculator = new Calculator()

  public async execute(source: Source, [formula]: [string]): Promise<void> {
    try {
      const result = this.calculator.calculate(formula).toString();
      if (result.length > 2000) {
        await source.defer({ ephemeral: true });
        await source.update(`計算結果超出 2000 字元上限，因此我無法顯示`);
        return;
      }
      await source.defer();
      await source.update(`算式：\n> ${removeMd(formula)}\n\n結果：\n> ${removeMd(result)}`);
    } catch (error: unknown) {
      const err = error as CalcError<ErrorCodes>
      await source.defer({ ephemeral: true });
      let string = `\`\`\`\n${formula}\n`
      string += ' '.repeat(err.position < 0 ? formula.length : err.position)
      string += `^ ${this.messages[err.code]}\n\`\`\``
      await source.update(string);
    }

  }

  private messages = {
    // Lexer
    [ErrorCodes.InvalidCharacter]: `未知的字元`, 
    [ErrorCodes.InvalidOperator]: `未知的運算子`, 
    [ErrorCodes.InvalidNumber]: `不是正確的數字`, 
    [ErrorCodes.PositionNotationError]: '不是這個進位制該有的數字', 

    // Parser
    [ErrorCodes.ExtraTrailingTokens]: `這個運算式的尾端多了不該有的東西`, 
    [ErrorCodes.InvalidToken]: `未知的常數或函數名稱`, 
    [ErrorCodes.MissingOpenParenthesis]: `缺少左括號`, 
    [ErrorCodes.MissingCloseParenthesis]: `缺少右括號`, 
    [ErrorCodes.NotANumber]: `應該要是數字，但它不是`, 
    [ErrorCodes.MissingExpressions]: `這個運算式的尾端缺少了一些東西`, 

    // Implementation
    [ErrorCodes.EmptyStack]: `指令好像出了一點問題，請你將你的算式和以下錯誤訊息使用 \`bug\` 指令回報給開發者：\n\`\`\`\nError: The expression stack is empty.\n\`\`\``, 
    [ErrorCodes.NonEmptyStack]: `指令好像出了一點問題，請你將你的算式和以下錯誤訊息使用 \`bug\` 指令回報給開發者：\n\`\`\`Error: Non-empty stack after parsing.\n\`\`\``, 
  } as const;
}
