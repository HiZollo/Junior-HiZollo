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

import { ActionRow, ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonComponent, ButtonStyle, PermissionFlagsBits, Role } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { CommandOptionType, CommandType } from "../utils/enums";

export default class Buttonrole extends Command<[Role, string, string, string]> {
  constructor() {
    super({
      type: CommandType.Utility, 
      name: 'buttonrole', 
      description: '產生手動取得身分組的按鈕', 
      extraDescription: '如果上一則訊息是由這個指令觸發的，再次使用這個指令後，新的按鈕會併入上一則訊息中，一則訊息最多可以用有 5 個按鈕', 
      aliases: ['br'], 
      options: [{ 
        type: ApplicationCommandOptionType.Role, 
        name: '身分組', 
        description: '要添加的身分組', 
        required: true
      }, {
        type: ApplicationCommandOptionType.String, 
        name: '描述', 
        description: '簡單描述這個身分組', 
        required: false
      }, {
        type: ApplicationCommandOptionType.String, 
        parseAs: CommandOptionType.Emoji, 
        name: '表情', 
        description: '對應按鈕的表情符號', 
        required: false
      }, {
        type: ApplicationCommandOptionType.String, 
        name: '顏色', 
        description: '對應按鈕的顏色', 
        choices: [
          { name: "藍", value: `${ButtonStyle.Primary}` }, 
          { name: "灰", value: `${ButtonStyle.Secondary}` }, 
          { name: "綠", value: `${ButtonStyle.Success}` }, 
          { name: "紅", value: `${ButtonStyle.Danger}` }
        ], 
        required: false
      }],
      permissions: {
        bot: [PermissionFlagsBits.ManageRoles, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages],
        user: [PermissionFlagsBits.ManageRoles]
      }
    });
  }

  public async execute(source: Source, [role, description, emoji, style]: [Role, string, string, string]): Promise<void> {
    await source.hide();

    const button = new ButtonBuilder()
      .setCustomId(`buttonrole_${role.id}`)
      .setLabel(role.name)
      .setStyle(this.resolveStyle(style));
    if (emoji) button.setEmoji(emoji);
      
    const displayDescription = `${emoji ? `${emoji} ` : ''}${role}${description ? `：${description}` : ''}`;

    const memberRoles = source.member?.roles;
    if (!(memberRoles && 'highest' in memberRoles)) {
      await source.temp('你需要在伺服器中才能使用這個指令');
      return;
    }
    if (source.user.id !== source.guild?.ownerId && memberRoles.highest.comparePositionTo(role) <= 0) {
      await source.temp('你無法管理這個身分組');
      return;
    }
    if (!role?.editable) {
      await source.temp('我無法管理這個身分組');
      return;
    }

    const message = (await source.channel?.messages.fetch({ limit: 1, cache: false }))?.first();
    if (message && message?.author.id === source.client.user?.id && message.components.length === 1 && message.components[0].components.length < 5 && 
        message.components[0].components.every(comp => comp.customId?.startsWith('buttonrole'))) {
      if (message.components[0].components.some(comp => comp.customId === `buttonrole_${role.id}`)) {
        await source.temp(`上面那則訊息已經有 ${role.name} 身分組了，你沒看見嗎？`);
        return;
      }

      await message.edit({ 
        allowedMentions: { parse: [] },
        components: [this.addButton(message.components[0] as ActionRow<ButtonComponent>, button)], 
        content: message.content + '\n' + displayDescription
      }).then(async () => {
        await source.temp(`${role.name} 身分組的按鈕添加成功`);
      }).catch(async () => {
        await source.temp(`${role.name} 身分組的按鈕添加失敗，可能是因為你提供的表情不存在`);
      });
    }
    else {
      source.channel?.send({
        allowedMentions: { parse: [] },
        components: [this.addButton(undefined, button)], 
        content: '請點擊按鈕來獲得對應身分組\n\n' + displayDescription
      }).then(async () => {
        await source.temp(`${role.name} 身分組的按鈕建立成功`);
      }).catch(async () => {
        await source.temp(`${role.name} 身分組的按鈕建立失敗，可能是因為你提供的表情不存在`);
      });
    }
  }

  private addButton(actionRow: ActionRow<ButtonComponent> | undefined, button: ButtonBuilder): ActionRowBuilder<ButtonBuilder> {
    const builder = new ActionRowBuilder<ButtonBuilder>();
    if (actionRow) {
      actionRow.components.forEach(({ customId, emoji, label, style }) => {
        const button = new ButtonBuilder().setStyle(style);
        if (customId) button.setCustomId(customId);
        if (emoji) button.setEmoji(emoji);
        if (label) button.setLabel(label);
        builder.addComponents(button);
      });
    }
    return builder.addComponents(button)
  }

  private resolveStyle(style: string): ButtonStyle {
    return this.styleTable[style] ?? ButtonStyle.Primary;
  }

  private styleTable = {
    '藍': ButtonStyle.Primary, 
    '灰': ButtonStyle.Secondary, 
    '綠': ButtonStyle.Success, 
    '紅': ButtonStyle.Danger, 
    [`${ButtonStyle.Primary}`]: ButtonStyle.Primary, 
    [`${ButtonStyle.Secondary}`]: ButtonStyle.Secondary, 
    [`${ButtonStyle.Success}`]: ButtonStyle.Success, 
    [`${ButtonStyle.Danger}`]: ButtonStyle.Danger
  }
}