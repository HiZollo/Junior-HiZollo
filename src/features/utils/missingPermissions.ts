import { GuildMember, GuildTextBasedChannel, PermissionFlags, PermissionFlagsBits } from "discord.js";

/**
 * 檢查一個成員在特定頻道是否具備給定的權限，並回傳缺失權限的英文字串
 * @param required 給定的權限
 * @param channel 頻道
 * @param member 伺服器成員
 * @returns 缺失的權限
 */
export default function missingPermissions(required: bigint[], channel: GuildTextBasedChannel, member: GuildMember | null): (keyof PermissionFlags)[] {
  if (!member) return [];

  const missing = channel.permissionsFor(member).missing(required);

  // 禁言視為不具備發送訊息的權限
  if (member.isCommunicationDisabled() && required.includes(PermissionFlagsBits.SendMessages) && !missing.includes("SendMessages")) {
    missing.unshift("SendMessages");
  }
  return missing;
}