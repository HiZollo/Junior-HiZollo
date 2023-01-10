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

import { InteractionCollector, ActionRowBuilder, MessageCreateOptions, ComponentType, InteractionType, ButtonBuilder, APIButtonComponent, ButtonStyle, APIButtonComponentWithURL, ModalSubmitInteraction, Collection } from 'discord.js';
import { ModelSystemContentOptions, ModelSystemOptions } from '../../typings/interfaces';

type CustomMessageOptions = Omit<MessageCreateOptions, 'flags'> & { fetchReply?: boolean };

/**
 * 建立一個有時效性的表單系統
 * @param options 選項
 * @returns 使用者提交的表單互動
 */
export default async function modelSystem({ source, buttons: { open, close }, modal, time = 60e3, contents }: ModelSystemOptions): Promise<ModalSubmitInteraction | null> {
  if (buttonIsLink(open.data) || buttonIsLink(close.data)) {
    throw new Error('Some of the buttons are link buttons.');
  }
  if (!open.data.custom_id || !close.data.custom_id) {
    throw new Error('Some of the buttons don\'t have custom ids set.');
  }
  if (!modal.data.custom_id) {
    throw new Error('The model doesn\'t have custom id set.');
  }

  const openCustomId = open.data.custom_id;
  const closeCustomId = close.data.custom_id;
  const modalCustomId = modal.data.custom_id;
  const { start, success, exit, idle } = getMessageOptions(contents);

  start.components = [new ActionRowBuilder<ButtonBuilder>().addComponents(open, close)];
  start.fetchReply = true;
  start.allowedMentions = idle.allowedMentions = { repliedUser: false };
  success.components = exit.components = idle.components = [];

  const message = await source.update(start);

  const buttonCollector = message.createMessageComponentCollector({
    filter: async i => {
      if (i.user.id !== source.user.id) return false;
      return openCustomId === i.customId || closeCustomId === i.customId;    
    },
    time: time,
    componentType: ComponentType.Button
  });

  const modalCollector = new InteractionCollector(source.client, {
    filter: async i => {
      if (i.user.id !== source.user.id) return false;
      return modalCustomId === i.customId;    
    },
    message: message,
    time: time,
    max: 1,
    interactionType: InteractionType.ModalSubmit
  });

  buttonCollector
    .on('error', console.error)
    .on('collect', async interaction => {
      if (interaction.customId === openCustomId) {
        interaction.showModal(modal);
      }
      else {
        await interaction.update(exit);
        modalCollector.stop('exit');
      }
    });
  
  return new Promise((resolve) => {
    modalCollector
      .on('error', console.error)
      .on('collect', async (interaction: ModalSubmitInteraction) => {
        if (interaction.isFromMessage()) {
          await interaction.update(success);
        }
      })
      .once('end', async (collected: Collection<string, ModalSubmitInteraction>, reason) => {
        buttonCollector.stop();
        switch (reason) {
          case 'limit':
            resolve(collected.first() ?? null);
            break;
          case 'time':
            await message.edit(idle);
          default:
            resolve(null);
        }
      });
  });
}

/**
 * 把給定物件`{ [key: keyof ModelSystemContentOptions]: string }` 對應出一個新物件，使新物件的鍵與原物件相同，但值是 `{ content: string }`
 * @param contents 給定物件
 * @returns 新物件
 */
function getMessageOptions(contents: ModelSystemContentOptions): Record<keyof ModelSystemContentOptions, CustomMessageOptions> {
  // 暫時設成 Partial，實際上所有鍵都會有值對應
  let messageOptions: Partial<Record<keyof ModelSystemContentOptions, CustomMessageOptions>> = {};

  for (const key in contents) {
    messageOptions[key as keyof ModelSystemContentOptions] = { content: contents[key as keyof ModelSystemContentOptions] };
  }
  
  return messageOptions as Record<keyof ModelSystemContentOptions, CustomMessageOptions>;
}

/**
 * **[Type Guard]** 按鈕是連結按鈕
 */
function buttonIsLink(button: Partial<APIButtonComponent>): button is Partial<APIButtonComponentWithURL> {
  return button.style === ButtonStyle.Link;
}
