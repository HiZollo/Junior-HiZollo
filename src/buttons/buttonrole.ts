import { ButtonInteraction, GuildMemberRoleManager } from "discord.js";

export default async function buttonrole(interaction: ButtonInteraction): Promise<void> {
  const roleId = interaction.customId.slice('buttonrole_'.length);
  const role = interaction.guild?.roles.resolve(roleId);
  if (!role?.editable) {
    await interaction.reply({ content: `我的權限不足，因此無法管理 ${role} 身分組`, ephemeral: true });
    return;
  }

  const memberRoles = interaction.member?.roles;
  if (!(memberRoles instanceof GuildMemberRoleManager)) {
    await interaction.reply({ content: '這顆按鈕應該只會在伺服器裡面出現啊？你怎麼在這裡生出這顆按鈕的', ephemeral: true });
    return;
  }

  if (memberRoles.cache.has(roleId)) {
    memberRoles.remove(roleId);
    await interaction.reply({ content: `已成功移除你的 ${role} 身分組`, ephemeral: true });
  }
  else {
    memberRoles.add(roleId);
    await interaction.reply({ content: `已成功幫你加上 ${role} 身分組`, ephemeral: true });
  }
}