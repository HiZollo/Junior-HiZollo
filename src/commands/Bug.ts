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

import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, ModalSubmitInteraction, PermissionFlagsBits, TextInputBuilder, TextInputStyle } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { mainGuild } from "@root/constant.json";
import modalSystem from "../features/utils/modalSystem";
import removeMd from "../features/utils/removeMd";
import { CommandType } from "../utils/enums";

export default class Bug extends Command<[]> {
  constructor() {
    super({ 
      type: CommandType.Contact, 
      name: 'bug', 
      description: `向 ${mainGuild.name}回報錯誤`, 
      cooldown: 600, 
      permissions: {
        bot: [PermissionFlagsBits.EmbedLinks]
      }
    });
  }

  public async execute(source: Source): Promise<void> {
    await source.defer();
    const response: ModalSubmitInteraction | null = await modalSystem({
      source: source,
      buttons: {
        open: newOpenButton(), 
        close: newCloseButton()
      },
      modal: newBugModal(),
      time: 300e3,
      contents: {
        start: '表單已開啟，請按下按鈕開始填寫表單', 
        success: '表單傳送成功，謝謝你的回報',
        exit: '表單已關閉', 
        idle: '表單已因閒置過久而關閉'
      }
    });
    if (!response) return;

    const content = response.fields.getTextInputValue('bug_modal_content');
    const bugEmbed = newBugEmbed(source, content);
    const bugComponent = newBugComponent(source);
    source.client.bugHook.send({ components: [bugComponent], embeds: [bugEmbed] });
  }
}

function newBugModal(): ModalBuilder {
  return new ModalBuilder()
      .setCustomId(`bug_modal_${Date.now()}`)
      .setTitle('HiZollo 錯誤回報中心')
      .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId('bug_modal_content')
            .setLabel('錯誤內容')
            .setMaxLength(1000)
            .setPlaceholder('請詳細描述你遇到的錯誤')
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph)
        )
      );
}

function newOpenButton(): ButtonBuilder {
  return new ButtonBuilder()
    .setCustomId(`bug_controller_open_${Date.now()}`)
    .setLabel('開啟表單')
    .setStyle(ButtonStyle.Success);
}

function newCloseButton(): ButtonBuilder {
  return new ButtonBuilder()
    .setCustomId(`bug_controller_close_${Date.now()}`)
    .setLabel('取消回報')
    .setStyle(ButtonStyle.Danger);
}

function newBugEmbed(source: Source, content: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0xFF6C6C)
    .setTitle(`來自 ${removeMd(source.user.tag)} 的錯誤回報`)
    .addFields({
      name: '使用者 ID', 
      value: `${source.user.id}`
    }, {
      name: '回報時間', 
      value: `<t:${~~(Date.now()/1000)}>`
    }, {
      name: '伺服器', 
      value: `${removeMd(source.guild?.name) ?? '私人頻道'}（ID: ${source.guild?.id ?? '無'}）`
    }, {
      name: '回報內容', 
      value: content
    });
}

function newBugComponent(source: Source): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`bugResponse_${source.user.id}`)
      .setLabel('回覆')
      .setStyle(ButtonStyle.Danger)
  );
}
