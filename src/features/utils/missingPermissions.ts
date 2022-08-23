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