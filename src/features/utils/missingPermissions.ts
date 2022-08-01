import { DMChannel, GuildMember, PartialDMChannel, PermissionFlags, PermissionFlagsBits, TextBasedChannel } from "discord.js";

export default function missingPermissions(required: bigint[], channel: Exclude<TextBasedChannel, DMChannel | PartialDMChannel>, member: GuildMember | null): (keyof PermissionFlags)[] {
  if (!member) return [];

  const missing = channel.permissionsFor(member).missing(required);
  if (member.isCommunicationDisabled() && required.includes(PermissionFlagsBits.SendMessages) && !missing.includes("SendMessages")) {
    missing.unshift("SendMessages");
  }
  return missing;
}