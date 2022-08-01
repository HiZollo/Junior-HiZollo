import { ActionRowBuilder, ButtonBuilder } from '@discordjs/builders';
import { ButtonStyle, ComponentType } from 'discord.js';
import { YesNoSystemOptions } from '../../utils/interfaces.js';
import randomInt from './randomInt.js';

export default async function yesNoSystem({ source, messageOptions, labels: [yes, no], contents }: YesNoSystemOptions): Promise<boolean | null> {
  messageOptions.components = [newButtons(yes, no)];

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
      await interaction.followUp({ content: noYou(), ephemeral: true });
      return;
    }
    await interaction.editReply({ content: '\u200b', components: [], embeds: [] });
    if (interaction.customId === `yesNo_yes`) buttonCollector.stop('yes');
    if (interaction.customId === `yesNo_no`) buttonCollector.stop('no');
  });

  return new Promise((resolve) => {
    buttonCollector.once('end', async (_collected, reason) => {
      if (reason === 'idle') {
        await message.edit({ content: contents.idle, components: [], embeds: [] });
        return;
      }
      await message.delete().catch(() => {});
      if (reason === 'yes') resolve(true);
      else if (reason === 'no') resolve(false);
      else resolve(null)
    });
  });
}

function newButtons(yes: string, no: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('yesNo_yes')
        .setLabel(yes)
        .setStyle(ButtonStyle.Success), 
      new ButtonBuilder()
        .setCustomId('yesNo_no')
        .setLabel(no)
        .setStyle(ButtonStyle.Danger), 
    );
}

const noYou = () => {
  const nou = [
    `這個按鈕不是你的`, `不要亂按別人的按鈕`, `不是你的按鈕就不要亂按`, `別人觸發的按鈕請不要亂動`, `你覺得我會允許你亂動別人的按鈕嗎？`,
    `你怎麼會覺得這個按鈕是你的？`, `用指令的人又不是你，不要亂按好嗎？`, `你有看到指令是誰觸發的嗎？`, `可不可以看清楚你用的是誰的按鈕？`
  ];
  const NOU = `你到底是怎樣？這條訊息又不是你觸發的，你為什麼要去亂按？浪費我的資源來判斷你的無意義行為你很開心嗎？`;
  const i = randomInt(0, 99);
  if (i === 99) return NOU;
  else return nou[~~(i/11)];
}
