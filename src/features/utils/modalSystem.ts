import { InteractionCollector, ActionRowBuilder, MessageOptions, ComponentType, InteractionType, ButtonBuilder, APIButtonComponent, ButtonStyle, APIButtonComponentWithURL, ModalSubmitInteraction, Collection } from 'discord.js';
import { ModelSystemContentOptions, ModelSystemOptions } from '../../utils/interfaces';

type CustomMessageOptions = Omit<MessageOptions, 'flags'> & { fetchReply?: boolean };

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

function getMessageOptions(contents: ModelSystemContentOptions): Record<keyof ModelSystemContentOptions, CustomMessageOptions> {
  let messageOptions: Partial<Record<keyof ModelSystemContentOptions, CustomMessageOptions>> = {};
  for (const key in contents) {
    messageOptions[key as keyof ModelSystemContentOptions] = { content: contents[key as keyof ModelSystemContentOptions] };
  }
  return messageOptions as Record<keyof ModelSystemContentOptions, CustomMessageOptions>;
}

function buttonIsLink(button: Partial<APIButtonComponent>): button is Partial<APIButtonComponentWithURL> {
  return button.style === ButtonStyle.Link;
}