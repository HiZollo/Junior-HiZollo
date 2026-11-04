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

import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonInteraction, ButtonStyle, ComponentType, EmbedBuilder, GuildMember, PermissionFlagsBits } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import randomElement from "../features/utils/randomElement";
import { CommandOptionType, CommandType } from "../typings/enums";

enum ConfessionButtonCustomId {
  Accept = 'confession_accept', 
  Reject = 'confession_reject', 
  Goodman = 'confession_goodman'
};

export default class Confession extends Command<[GuildMember]> {
  constructor() {
    super({
      type: CommandType.Fun, 
      name: 'confession', 
      description: '向一位伺服器中的成員告白', 
      aliases: ['cf'], 
      options: [{ 
        type: ApplicationCommandOptionType.User, 
        parseAs: CommandOptionType.Member, 
        name: '告白對象', 
        description: '你想要告白的對象', 
        required: true
      }],
      permissions: {
        bot: [PermissionFlagsBits.EmbedLinks],
      }
    });
  }

  public async execute(source: Source, [to]: [GuildMember]): Promise<void> {
    await source.defer();

    const from = source.user;
    if (to.id === source.client.user?.id) {
      const message = await source.update('你對我告白……');
      setTimeout(() => message.edit('你對我告白……\n' + randomElement(this.confessionRes.hz)), 1900);
      return;
    }
    if (to.user.bot) {
      await source.update('你已經沒人要到要找機器人告白了嗎？醒。');
      return;
    }
  
    const embed = new EmbedBuilder()
      .setAuthor({ name: 'Love Letter', iconURL: from.displayAvatarURL() })
      .setDescription(to.id === from.id ? '你向自己告白\n\n給自己一個回覆吧' : `${to}，你收到了來自 ${from} 的告白\n\n請選擇你的回覆……`)
      .setColor(0xFF69DD);
  
    const message = await source.update({
      content: to.id === from.id ? '你對自己告白……' : `你向 ${to} 告白……`,
      embeds: [embed],
      components: [this.confessButtons]
    });

    const filter = async (interaction: ButtonInteraction): Promise<boolean> => {
      if (!interaction.customId.startsWith('confession')) return false;
      await interaction.deferUpdate();

      if (interaction.user.id === from.id && from.id !== to.id) {
        interaction.followUp({ content: '我知道你很迫不及待想聽到回應，但請等等', ephemeral: true });
        return false;
      }
      if (interaction.user.id !== to.id) {
        interaction.followUp({ content: '請不要干涉別人的告白現場', ephemeral: true });
        return false;
      }
      return true;
    }

    message.awaitMessageComponent({
      filter: filter, 
      componentType: ComponentType.Button, 
      time: 30e3
    }).then(interaction => {
      const identity = to.id === from.id ? 'self' : 'other';
      let responses, color;
      switch (interaction.customId as ConfessionButtonCustomId) {
        case ConfessionButtonCustomId.Accept:
          responses = this.confessionRes[identity].accept;
          color = 0x5AA264;
          break;
        case ConfessionButtonCustomId.Reject:
          responses = this.confessionRes[identity].reject;
          color = 0xDC504C;
          break;
        case ConfessionButtonCustomId.Goodman:
          responses = this.confessionRes[identity].goodman;
          color = 0x50545B;
          break;
      }

      const response = randomElement(responses);
      embed.setAuthor({ name: '回覆', iconURL: from.displayAvatarURL() })
        .setDescription(response.replace('$fm', from.toString()).replace('$to', to.toString()))
        .setColor(color);
      interaction.editReply({ embeds: [embed], components: [] });
    }).catch(() => {
      embed.setDescription(from.id === to.id ? '看起來你連自己都不想理' : `看起來 ${to} 根本不想理你，真可憐啊，哈哈`)
        .setColor(0xDC504C);
      message.edit({ content: null, embeds: [embed], components:[] });
    });
  }

  private get confessButtons(): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(ConfessionButtonCustomId.Accept)
          .setEmoji('❤️')
          .setLabel('接受')
          .setStyle(ButtonStyle.Success), 
          
        new ButtonBuilder()
          .setCustomId(ConfessionButtonCustomId.Reject)
          .setEmoji('❌')
          .setLabel('拒絕')
          .setStyle(ButtonStyle.Danger), 
        
        new ButtonBuilder()
          .setCustomId(ConfessionButtonCustomId.Goodman)
          .setEmoji('👍')
          .setLabel('發好人卡')
          .setStyle(ButtonStyle.Secondary)
      );
  }

  private confessionRes = {
    hz: [
      '要我接受你請等一萬年後再說', '你自我感覺會不會太好', '滾', '找點有意義的事做行不行',
      '拒絕', '收回你的妄想', '慢走不送', '我建議你先照個鏡子', '你是個好人', '駁回',
      '請讓我再想想', '我會考慮的', '你為什麼要做這種吃力不討好的事', '我建議你去睡覺，夢裡什麼都有',
      '門都沒有', '我接受你是可能事件，但機率為 0', '謝謝', '出口在左手邊', '你會不會太高估你自己', '你也太慘了吧，淪落到要來找機器人告白，但是你根本就不夠格，掰 :D',
      '當你罵我爛 bot 的時候，你有考慮過我的感受嗎？沒有？那你還來跟我告白什麼？當我是你的工具？你以為自己多厲害？天理難容，出口在右手邊',
      '我就算接受你，你能怎樣？我只是一台機器人，你還能要我怎樣？',
      '你覺得自己身為人類難道就比較高尚，我一定得接受你？別騙人了，我寧願用我的左右手當伴侶也不要接受你',
      '我認同，但是我不接受', '好啦我接受你，才怪', '我接受你，那下一步呢？你沒有下一步嘛，那我還是反悔好了'
    ],
    self: {
      accept: [
        '你也太自戀了吧', '好險你還接受你自己，不然世界上就沒有人看得起你了', '雖然你告白成功，但你的伴侶還是只有左右手',
        '跟這種人告白，就算成功了應該沒什麼意義吧', '你能想像你以後是一個人走入禮堂嗎', '左右手應該對你來說就足夠了'
      ],
      reject: ['連自己都拒絕自己，誰還會接受你', '你也知道自己不夠好', '你怎麼連自己做的球都不接，笨蛋大木頭', '好在你還有自知之明，知道自己不夠好'],
      goodman: ['你什麼時候有了你是好人的錯覺', '你會覺得自己是好人是不是因為大家都這樣說', '自己發卡給自己是不是也算一種自戀']
    },
    other: {
      accept: [
        '$to 接受了 $fm，真是皆大歡喜', '$fm 被接受了，真是出乎意料', '$to 可能是按錯按鈕了，但總而言之他接受了你',
        '恭喜 $fm 告白成功', '$fm 到底造了什麼孽才會向 $to 告白且被接受', '$fm 真的是積了三輩子的德才會告白成功',
        '$to 的眼光真好，接受了 $fm'
      ],
      reject: [
        '可惜 $fm 直接被拒絕了', '$to 狠狠地拒絕了 $fm', '$fm，告訴你一個好消息，你被拒絕了',
        '情書被撕爛且被扔在地上', '$fm 就這麼被拒絕了，$to 做得好', '$fm 成功地被拒絕了', '$fm 被無情地甩了一個巴掌',
        '雨水落在跑道上，以及跑道上方那個你花了許多心思寫的情書，只是他現在多了幾分折痕，幾分鞋印，幾分心酸',
        '$fm 到底做了什麼事才會被這樣拒絕', '$fm 上輩子一定做過很多好事，才會被 $to 這麼慷慨地拒絕',
        '事與願違，我建議你再去找一個吧'
      ],
      goodman: [
        '$fm 真是個好人', '$to 表示 $fm 是個很好的人', '$fm，別難過，往好處想，你至少是 $to 認可的好人',
        '恭喜 $fm 被發卡', '$fm 獲得好人卡一張', '$to 認為 $fm 是個再好不過的人了', '$fm 原來在 $to 眼中是一個大好人'
      ]
    }
  }
}
