import { SelectMenuInteraction } from "discord.js";
import Help from "../commands/Help";

export default async function help(interaction: SelectMenuInteraction<"cached">): Promise<void> {
  const help = interaction.client.commands.search(['help', undefined]) as Help;
  const scope = interaction.customId.slice('help_menu_'.length);

  if (scope === 'main') {
    const message = help.getMessageForType(interaction, interaction.values[0]);
    await interaction.reply({ ephemeral: true, ...message });
    return;
  }
}