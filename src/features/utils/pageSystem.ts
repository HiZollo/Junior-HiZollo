import { ActionRowBuilder, SelectMenuBuilder } from '@discordjs/builders';
import { APISelectMenuOption, ButtonBuilder, ButtonStyle, ComponentType, InteractionCollector, Message, SelectMenuInteraction } from 'discord.js';
import { PageSystemMode } from '../../utils/enums.js';
import { PageSystemDescriptionOptions, PageSystemEmbedFieldOptions, PageSystemPagesOptions } from '../../utils/interfaces.js';
import { PageSystemOptions } from '../../utils/types.js';
import fixedDigits from './fixedDigits.js';
import randomInt from './randomInt.js';


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
    embed.setDescription(description || null).addFields(pages[index]);
  }

  // 設定其他 embed 屬性
  let footer = `${source.user.tag}．第 ${index+1} 頁／共 ${pages.length} 頁${extendFooter ? `｜${extendFooter}` : ''}`;
  embed.setThumbnail(thumbnails[index] || null)
    .setFooter({ text: footer, iconURL: source.user.displayAvatarURL() });
  
  // 製作按鈕
  const buttons = newButtons(pages.length);
  modifyButtons(buttons, pages.length, index);
  
  const messageOptions = {
    content: null,
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
      embed.spliceFields(0, 25).addFields(pages[index]);
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

  let selectCollector: InteractionCollector<SelectMenuInteraction>;
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
        await interaction.followUp({ content: noYou('清單'), ephemeral: true });
        return;
      }
      await interaction.editReply({ content: '\u200b', components: [], embeds: [] });
      if (source.source instanceof Message) await message.delete().catch(() => {});
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

function newSelectMenu(page: PageSystemPagesOptions[]): ActionRowBuilder<SelectMenuBuilder> {
  const selectOptions: APISelectMenuOption[] = [];
  for (let i = 0; i < page.length; i++) {
    selectOptions.push({
      label: page[i].name.slice(0, 87), 
      value: i.toString()
    })
  }

  const select = new SelectMenuBuilder()
    .setCustomId('pageSystemSelect')
    .setPlaceholder('請選擇一個選項')
    .setOptions(selectOptions);
  return new ActionRowBuilder<SelectMenuBuilder>().addComponents(select);
}

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
