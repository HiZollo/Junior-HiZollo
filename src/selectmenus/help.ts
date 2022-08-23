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

import { SelectMenuInteraction } from "discord.js";
import { Command } from "../classes/Command";
import Help from "../commands/Help";
import { SubcommandGroup } from "../utils/interfaces";

export default async function help(interaction: SelectMenuInteraction<"cached">): Promise<void> {
  const help = interaction.client.commands.search(['help', undefined]) as Help;
  const scope = interaction.customId.slice('help_menu_'.length);
  const selected = interaction.values[0];

  if (scope === 'main') {
    const message = help.getMessageForType(interaction, Number(selected));
    await interaction.reply({ ephemeral: true, ...message });
    return;
  }
  if (scope === 'type') {
    const command = interaction.client.commands.search([selected, undefined]) as Command | SubcommandGroup;
    const embed = command instanceof Command ? help.getEmbedForCommand(interaction, command) : help.getEmbedForSubcommandGroup(interaction, selected, command);
    await interaction.reply({ ephemeral: true, embeds: [embed] });
    return
  }
}