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

import { ActionRowBuilder, APISelectMenuOption, ButtonBuilder, ButtonStyle, ComponentType, InteractionCollector, StringSelectMenuBuilder, StringSelectMenuInteraction } from 'discord.js';
import { PageSystemMode } from '../../typings/enums.js';
import { PageSystemDescriptionOptions, PageSystemEmbedFieldOptions, PageSystemPagesOptions } from '../../typings/interfaces.js';
import { PageSystemOptions } from '../../typings/types.js';
import fixedDigits from './fixedDigits.js';
import randomInt from './randomInt.js';


/**
 * 建立一個有時效性的翻頁系統，如果選項的型別是 `PageSystemDescriptionOptions`，且 `allowSelect` 為 `true`，會額外建立一個選單給使用者挑選
 * @param options 選項
 * @returns 使用者選擇的值（如有）
 */
export default async function pageSystem(options: PageSystemDescriptionOptions): Promise<PageSystemPagesOptions | null>;
export default async function pageSystem(options: PageSystemEmbedFieldOptions): Promise<null>;
export default async function pageSystem(options: PageSystemOptions): Promise<PageSystemPagesOptions | null> {
  const { mode, source, embed, description, thumbnails = [], extendFooter, pages, contents } = options;
  let { index = 0 } = options;
  const allowSelect = 'allowSelect' in options ? (options.allowSelect ?? false) : false;

  // 根據模式設定 description
  if (mode === PageSystemMode.Description) {
    let newDescription = description ? `${description}\n\n` : '';
    newDescription += pages[index].map((a, i) => `\`${fixedDigits(i+1, 2)}.\` ${a.name}`).join('\n\n');
    embed.setDescription(newDescription);
  }
  else {
    embed.setDescription(description || null).setFields(pages[index]);
  }

  // 設定其他 embed 屬性
  let footer = `${source.user.tag}．第 ${index+1} 頁／共 ${pages.length} 頁${extendFooter ? `｜${extendFooter}` : ''}`;
  embed.setThumbnail(thumbnails[index] || null)
    .setFooter({ text: footer, iconURL: source.user.displayAvatarURL() });
  
  // 製作按鈕
  const buttons = newButtons(pages.length);
  modifyButtons(buttons, pages.length, index);
  
  const messageOptions = {
    embeds: [embed],
    components: mode === PageSystemMode.Description && allowSelect ? [newSelectMenu(pages[index]), buttons] : [buttons]
  };

  const message = await source.update(messageOptions);

  const buttonCollector = message.createMessageComponentCollector({
    filter: async i => {
      await i.deferUpdate();
      return true;
    },
    idle: 30e3,
    componentType: ComponentType.Button
  });

  buttonCollector.on('error', console.log);

  buttonCollector.on('collect', async interaction => {
    if (interaction.user.id !== source.user.id) {
      await interaction.followUp({ content: noYou('按鈕'), ephemeral: true });
      return;
    }

    if (interaction.customId === `page_home`) index = 0;
    if (interaction.customId === `page_prev`) index--;
    if (interaction.customId === `page_next`) index++;
    if (interaction.customId === `page_last`) index = pages.length-1;
    if (interaction.customId === `page_exit`) return buttonCollector.stop('exit');

    if (mode === PageSystemMode.Description) {
      let newDescription = description ? `${description}\n\n` : '';
      newDescription += pages[index].map((a, i) => `\`${fixedDigits(i+1, 2)}.\` ${a.name}`).join('\n\n');
      embed.setDescription(newDescription);
    }
    else {
      embed.setFields(pages[index]);
    }

    footer = `${interaction.user.tag}．第 ${index+1} 頁／共 ${pages.length} 頁${extendFooter ? `｜${extendFooter}` : ''}`;
    embed.setThumbnail(thumbnails[index] || null)
         .setFooter({ text: footer, iconURL: interaction.user.displayAvatarURL() });

    modifyButtons(buttons, pages.length, index);

    await interaction.editReply({
      embeds: [embed],
      components: mode === PageSystemMode.Description && allowSelect ? [newSelectMenu(pages[index]), buttons] : [buttons]
    });
  });

  let selectCollector: InteractionCollector<StringSelectMenuInteraction>;
  if (allowSelect) {
    selectCollector = message.createMessageComponentCollector({
      filter: async i => {
        await i.deferUpdate();
        return true;
      },
      componentType: ComponentType.SelectMenu
    });

    selectCollector.on('collect', async interaction => {
      if (interaction.user.id !== source.user.id) {
        await interaction.followUp({ content: noYou('選單'), ephemeral: true });
        return;
      }
      await interaction.editReply({ content: '\u200b', components: [], embeds: [] });
      if (source.isMessage()) await message.delete().catch(() => {});
      buttonCollector.stop(`selected_${interaction.values[0]}`);
    });
  }

  return new Promise((resolve) => {
    buttonCollector.once('end', async (_collected, reason) => {
      selectCollector?.stop();

      if (reason.startsWith('selected_') && mode === PageSystemMode.Description) resolve(pages[index][+reason.slice('selected_'.length)]);
      else if (reason === 'exit') message.edit({ content: contents.exit, components: [], embeds: [] });
      else if (reason === 'idle') message.edit({ content: contents.idle, components: [], embeds: [] });
      else resolve(null);
    });
  });
}

/**
 * 建立含有翻頁按鈕的動作列
 * @param pageCount 總頁數
 * @returns 動作列
 */
function newButtons(pageCount: number): ActionRowBuilder<ButtonBuilder> {
  const buttons: ButtonBuilder[] = [];
  if (pageCount >= 1) {
    buttons.push(new ButtonBuilder().setCustomId('page_exit').setEmoji('880450475193946162').setStyle(ButtonStyle.Danger));
  }
  if (pageCount >= 2) {
    buttons.unshift(new ButtonBuilder().setCustomId('page_prev').setEmoji('880450475265261589').setStyle(ButtonStyle.Primary));
    buttons.push(new ButtonBuilder().setCustomId('page_next').setEmoji('880450475202314300').setStyle(ButtonStyle.Primary));
  }
  if (pageCount >= 3) {
    buttons.unshift(new ButtonBuilder().setCustomId('page_home').setEmoji('880448441623380048').setStyle(ButtonStyle.Primary));
    buttons.push(new ButtonBuilder().setCustomId('page_last').setEmoji('880450475156176906').setStyle(ButtonStyle.Primary));
  }
  return new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons);
}

/**
 * 在使用者翻頁時需要呼叫此函式以調整按鈕可不可以被操作
 * @param actionRow 按鈕所屬的動作列
 * @param pageCount 總頁數
 * @param index 當前頁的駐標
 */
function modifyButtons(actionRow: ActionRowBuilder<ButtonBuilder>, pageCount: number, index: number): void {
  if (pageCount === 1) return;
  if (pageCount === 2) {
    actionRow.components[0].setDisabled(index === 0); // 上一頁
    actionRow.components[2].setDisabled(index === 1); // 下一頁
    return;
  }
  actionRow.components[0].setDisabled(index < 2); // 第一頁
  actionRow.components[1].setDisabled(index < 1); // 上一頁
  actionRow.components[3].setDisabled(index > pageCount - 2); // 下一頁
  actionRow.components[4].setDisabled(index > pageCount - 3); // 最末頁
}

/**
 * 建立含有選單的動作列
 * @param option 所有選項
 * @returns 動作列
 */
function newSelectMenu(option: PageSystemPagesOptions[]): ActionRowBuilder<StringSelectMenuBuilder> {
  const selectOptions: APISelectMenuOption[] = [];
  for (let i = 0; i < option.length; i++) {
    selectOptions.push({
      label: (i + 1).toString(), 
      value: i.toString()
    })
  }

  const select = new StringSelectMenuBuilder()
    .setCustomId('pageSystemSelect')
    .setPlaceholder('請選擇一個選項')
    .setOptions(selectOptions);
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
}

/**
 * 有其他使用者試圖與翻頁系統互動時所給出的錯誤提示
 * @param type 互動的中文名稱
 * @returns 錯誤提示
 */
function noYou(type: string): string {
  const nou = [
    `這個${type}不是你的`, `不要亂按別人的${type}`, `不是你的${type}就不要亂按`, `別人觸發的${type}請不要亂動`, `你覺得我會允許你亂動別人的${type}嗎？`,
    `你怎麼會覺得這個${type}是你的？`, `用指令的人又不是你，不要亂按好嗎？`, `你有看到指令是誰觸發的嗎？`, `可不可以看清楚你用的是誰的${type}？`
  ];
  const NOU = `你到底是怎樣？這條訊息又不是你觸發的，你為什麼要去亂按？浪費我的資源來判斷你的無意義行為你很開心嗎？`;
  const i = randomInt(0, 99);
  if (i === 99) return NOU;
  else return nou[~~(i/11)];
}
