import { ActionRowBuilder, ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, User } from "discord.js";
import { mainGuild } from "../constant.json";

export default async function (interaction: ButtonInteraction<"cached">): Promise<void> {
  if (!interaction.member.roles.cache.has(mainGuild.roles.groupMemberId)) {
    interaction.reply({ content: '不要亂按，你不是開發人員', ephemeral: true });
    return;
  }

  const modal = newBugModal();
  await interaction.showModal(modal);

  await interaction.awaitModalSubmit({ filter: i => i.customId === modal.data.custom_id, time: 300e3 }).then(async mod => {
    const replyContent = mod.fields.getTextInputValue('bug_modal_response_content');
    const originalReport = interaction.message.embeds[0].fields.find(f => f.name === '回報內容')?.value ?? '*無法取得回報內容*';
    if (replyContent.toLowerCase() === 'spam') {
      mod.reply({ content: '已標記為洗版訊息', ephemeral: true });
      interaction.client.bugHook.editMessage(interaction.message, { components: [] });
      return;
    }

    const [, userId] = interaction.customId.split('_');
    const user = await interaction.client.users.fetch(userId);
    if (!user) {
      await mod.reply({ content: '訊息因為找不到使用者而傳送失敗', ephemeral: true });
      return;
    }

    const message = await interaction.client.bugHook.fetchMessage(interaction.message.id);
    if (!message?.components?.length) {
      mod.reply({ content: '找不到這則訊息或已經有人回覆過這則訊息了', ephemeral: true });
      return;
    }

    const response = getBugResponse(replyContent, originalReport, interaction.user);
    user.send(response).then(() => {
      mod.reply({ content: '已成功傳送至該使用者的私訊', ephemeral: true });
      interaction.client.bugHook.editMessage(interaction.message, { components: [] });
      interaction.client.replyHook.send(response);
    }).catch(() => {
      mod.reply({ content: '私訊傳送失敗', ephemeral: true });
    });
  }).catch(() => {
    interaction.followUp({ content: '想個回覆想那麼久是怎樣', ephemeral: true });
  });
}

function newBugModal(): ModalBuilder {
  return new ModalBuilder()
    .setCustomId(`bug_modal_response_${Date.now()}`)
    .setTitle('HiZollo 錯誤回報中心')
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId('bug_modal_response_content')
          .setLabel('回覆內容')
          .setMaxLength(1000)
          .setRequired(true)
          .setPlaceholder('請輸入私訊內容')
          .setStyle(TextInputStyle.Paragraph)
      )
    );
}

function getBugResponse(content: string, originalReport: string, author: User): string {
  return `
———————————————————
我們收到了你的錯誤回報，以下是你的回報內容：

${originalReport}
———————————————————
而以下是我們給出的回覆：

${content}
———————————————————

請注意我們接收不到你與 HiZollo 之間的私訊內容，如果想要更方便地回報錯誤，或是獲得第一手更新資訊，可以考慮加入 HiZollo 官方伺服器：
${mainGuild.inviteLink}

感謝你使用 HiZollo
- ${author.username}
`;
}