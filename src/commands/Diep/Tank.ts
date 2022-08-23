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

import { Command } from "../../classes/Command";
import { Source } from "../../classes/Source";
import tanks from "../../features/json/diepTanks.json";
import { CommandType } from "../../utils/enums";
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";

export default class DiepTank extends Command<[string]> {
  constructor() {
    super({
      type: CommandType.Information, 
      parent: 'diep', 
      name: 'tank', 
      description: '查看一台 Diep.io 坦克的資訊',
      options: [{
        type: ApplicationCommandOptionType.String, 
        name: '坦克',
        description: '坦克的英文全名',
        required: true,
        autocomplete: true
      }]
    });
  }

  public async execute(source: Source, [tankName]: [string]): Promise<void> {
    const tank = this.tankMap.get(tankName);
    if (!tank) {
      await source.defer({ ephemeral: true });
      await source.update('我找不到這台坦克，請檢查你有沒有拼錯字');
      return;
    }

    await source.defer();
    const info = new EmbedBuilder()
      .applyHiZolloSettings(source.member, `${tank.name}（${tank.nameChinese}）的基本資料`, '資料來源：Diep.io 繁中維基')
      .setThumbnail(tank.image)
      .setDescription(tank.description)
      .addFields(
        { name: '坦克類型', value: tank.type, inline: true },
        { name: '階層', value: tank.tier, inline: true },
        { name: '從何升級', value: tank.upgradeFrom, inline: true },
        { name: '坦克 ID', value: tank.id, inline: true },
        { name: '使用武器', value: tank.weapons, inline: true },
        { name: '傷害係數', value: tank.damage, inline: true },
        { name: '更多資訊', value: `點擊[此處](${tank.link})以獲得更多資訊`},
      );

    await source.update({ embeds: [info] });
  }

  private tankMap = new Map(Object.entries(tanks));
}