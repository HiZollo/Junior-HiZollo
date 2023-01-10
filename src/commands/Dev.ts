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

import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { CommandType } from "../typings/enums";

export default class Dev extends Command<[]> {
  constructor() {
    super({ 
      type: CommandType.Information, 
      name: 'dev', 
      description: '顯示 HiZollo 的開發團隊清單', 
      aliases: ['developers'],
      permissions: {
        bot: [PermissionFlagsBits.EmbedLinks]
      }
    });
  }

  public async execute(source: Source): Promise<void> {
    await source.defer();
    const devlist = new EmbedBuilder()
      .applyHiZolloSettings(source.member, 'HiZollo 開發團隊清單', `© HiZollo 2019-${new Date().getFullYear()}`)
      .addFields(
        { name: '專案領導團隊', value: this.members.leading.join('\n') }, 
        { name: '程式團隊', value: this.members.script.join('\n') }, 
        { name: '文案團隊', value: this.members.copywrite.join('\n') }, 
        { name: '網管團隊', value: this.members.website.join('\n') }, 
        { name: '美術團隊', value: this.members.art.join('\n') }
      );
    await source.update({ embeds: [devlist] });
  }

  private members = {
    leading: ['AC0xRPFS001#5007'], 
    art: ['Zollo757347#3987'], 
    script: ['AC0xRPFS001#5007', 'Zollo757347#3987'], 
    copywrite: ['Zollo757347#3987'], 
    website: ['AC0xRPFS001#5007']
  }
}
