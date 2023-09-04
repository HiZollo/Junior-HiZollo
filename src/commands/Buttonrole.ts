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

import config from "@root/config";
import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonComponent, ButtonStyle, ComponentType, Message, PermissionFlagsBits, Role } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { CommandOptionType, CommandType } from "../typings/enums";

type RoleData = {
  id: string,
  name: string,
  style: ButtonStyle,
  description: string | null,
  emoji: string | null
};

enum ButtonroleAction {
  Add, Update, Remove
};

export default class Buttonrole extends Command<[Role, string, string, string]> {
  constructor() {
    super({
      type: CommandType.Utility,
      name: 'buttonrole',
      description: '產生手動取得身分組的按鈕',
      extraDescription:
        '如果上一則訊息是由這個指令觸發的，再次使用這個指令後，新的按鈕會併入上一則訊息中，一則訊息最多可以擁有 5 個按鈕\n' +
        '如果上一則訊息已經存在指定身分組的按鈕，會更新或移除該按鈕：\n' +
        '當你輸入的所有參數（描述、表情、顏色）都與訊息上的相同，該按鈕會被移除\n' +
        '如果有至少一項參數是不同的，該按鈕的所有參數會被更新成你輸入的新參數',
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
        bot: [PermissionFlagsBits.ManageRoles, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel],
        user: [PermissionFlagsBits.ManageRoles]
      }
    });
  }

  public async execute(source: Source, [role, description, emoji, style]: [Role, string, string, string]): Promise<void> {
    await source.hide();

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

    const message = (await source.channel?.messages.fetch({ limit: 1, cache: false }))?.first()!;
    let roles = this.resolve(message);

    if (message && roles) {
      const index = roles.findIndex(r => r.id === role.id);
      let action: ButtonroleAction;

      if (index !== -1) {
        if (this.compareEmoji(roles[index].emoji, emoji) && roles[index].description === description && roles[index].style === this.resolveStyle(style)) {
          roles.splice(index, 1);
          action = ButtonroleAction.Remove;
        }
        else {
          roles[index].description = description;
          roles[index].emoji = emoji;
          roles[index].style = this.resolveStyle(style);
          action = ButtonroleAction.Update;
        }
      }
      else {
        roles.push({
          id: role.id,
          name: role.name,
          style: this.resolveStyle(style),
          emoji: emoji,
          description: description
        });
        action = ButtonroleAction.Add;
      }

      if (roles.length === 0) {
        await message.delete().catch(() => { });
        await source.temp(`成功移除 ${role.name} 的按鈕`);
        return;
      }
      if (roles.length === 6) {
        await this.send(source, roles[5]);
        return;
      }

      await message.edit({
        allowedMentions: { parse: [] },
        components: [this.getActionRow(roles)],
        content: this.getContent(roles)
      }).then(async () => {
        switch (action) {
          case ButtonroleAction.Add:
            return await source.temp(`成功加上 ${role.name} 的按鈕`);

          case ButtonroleAction.Update:
            return await source.temp(`成功更新 ${role.name} 的按鈕`);

          case ButtonroleAction.Remove:
            return await source.temp(`成功移除 ${role.name} 的按鈕`);
        }
      }).catch(async () => {
        await source.temp(`${role.name} 身分組的按鈕添加失敗，可能是因為你提供的表情不存在`);
      });
    }
    else {
      this.send(source, {
        id: role.id,
        name: role.name,
        style: this.resolveStyle(style),
        emoji: emoji,
        description: description
      });
    }
  }

  private async send(source: Source, role: RoleData): Promise<void> {
    source.channel?.send({
      allowedMentions: { parse: [] },
      components: [this.getActionRow([role])],
      content: this.getContent([role])
    }).then(async () => {
      await source.temp(`成功建立 ${role.name} 的按鈕`);
    }).catch(async () => {
      await source.temp(`${role.name} 身分組的按鈕建立失敗，可能是因為你提供的表情不存在`);
    });
  }

  private resolve(message: Message | undefined): RoleData[] | null {
    if (!message) return null;
    if (message.author.id !== config.bot.id) return null;
    if (message.components.length !== 1) return null;
    if (message.components[0].components.length === 5) return null;
    if (message.components[0].components.some(c => !c.customId?.startsWith('buttonrole_' || c.type !== ComponentType.Button))) return null;

    const roles: RoleData[] = [];
    for (const button of message.components[0].components as ButtonComponent[]) {
      roles.push({
        id: button.customId!.slice('buttonrole_'.length),
        name: button.label!,
        style: button.style,
        description: null,
        emoji: button.emoji?.id ?? button.emoji?.name ?? null
      });
    }

    const lines = message.content.split('\n').slice(2);
    if (lines.length !== roles.length) return null;
    lines.forEach((line, i) => {
      roles[i].description = line.match(/^.+?：(.+)$/)?.[1] ?? null;
    })

    return roles;
  }

  private getActionRow(roles: RoleData[]): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>()
      .setComponents(
        roles.map(r => {
          const button = new ButtonBuilder()
            .setCustomId(`buttonrole_${r.id}`)
            .setStyle(r.style);
          if (r.emoji) button.setEmoji(r.emoji);
          if (r.name) button.setLabel(r.name);
          return button;
        })
      );
  }

  private getContent(roles: RoleData[]): string {
    let content = '請點擊按鈕來獲得對應身分組\n\n';
    roles.forEach(role => {
      content += `${role.emoji ? `${role.emoji} ` : ''}<@&${role.id}>${role.description ? `：${role.description}` : ''}\n`;
    });
    return content;
  }

  private compareEmoji(emojiName: string | null, emojiResolvable: string | null): boolean {
    return emojiName === emojiResolvable ||
      emojiName === (emojiResolvable?.match(/<?(a)?:?(\w{2,32}):(\d{17,20})>?/)?.[3] ?? null);
  }

  private resolveStyle(style: string): ButtonStyle {
    return this.styleTable[style as keyof typeof this.styleTable] ?? ButtonStyle.Primary;
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
