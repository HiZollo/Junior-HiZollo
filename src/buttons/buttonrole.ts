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

import { ButtonInteraction, GuildMemberRoleManager } from "discord.js";

export default async function buttonrole(interaction: ButtonInteraction<"cached">): Promise<void> {
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
