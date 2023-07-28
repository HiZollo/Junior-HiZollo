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
import removeMd from "../features/utils/removeMd";

export default class Team extends Command<[]> {
  constructor() {
    super({
      type: CommandType.Information,
      name: 'team',
      description: '顯示 HiZollo 的團隊成員清單',
      aliases: ['developers', 'dev'],
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
        { name: '開發團隊', value: removeMd(this.members.development.join('\n')) },
        { name: 'HiZollo 委員會', value: removeMd(this.members.committee.join('\n')) }
      );
    await source.update({ embeds: [devlist] });
  }

  private members = {
    development: ['ac0xrpfs001', 'zollo757347'],
    committee: ['_jw_zx', 'white.1000.yu', 'nicoshi_']
  }
}
