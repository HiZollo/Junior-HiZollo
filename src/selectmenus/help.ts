/*
 * 
 * Copyright 2022, 2026 HiZollo Dev Team <https://github.com/hizollo>
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

import { StringSelectMenuInteraction } from "discord.js";
import Help from "../commands/Help";
import { CommandGroup } from "../classes/CommandGroup";
import { CommandHelpRenderer } from "../classes/CommandHelpRenderer";

export default async function help(interaction: StringSelectMenuInteraction<"cached">): Promise<void> {
  const help = interaction.client.commands.search(['help']) as Help;
  const scope = interaction.customId.slice('help_menu_'.length);
  const selected = interaction.values[0];
  const canViewDeveloper = interaction.channel?.isTestChannel() ?? false;

  if (scope === 'main') {
    const message = help.getMessageForType(interaction, Number(selected));
    await interaction.reply({ ephemeral: true, ...message });
    return;
  }

  if (scope !== 'type' && scope !== 'group') return;
  const command = interaction.client.commands.get(selected.split("/"));

  if (!command || !CommandHelpRenderer.isCommandVisible(command, canViewDeveloper)) {
    await interaction.reply({ ephemeral: true, content: '找不到這個指令' });
    return;
  }

  if (command instanceof CommandGroup) {
    await interaction.reply({ ephemeral: true, ...CommandHelpRenderer.getGroupMessage(interaction, command, canViewDeveloper) });
    return;
  }

  await interaction.reply({ ephemeral: true, embeds: [CommandHelpRenderer.getCommandEmbed(interaction, command)] });
}
