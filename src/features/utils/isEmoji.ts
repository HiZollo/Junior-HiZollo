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

import emojiRegex from "emoji-regex";
/**
 * 檢查一個字串是不是表情符號，或是否符合 Discord 的表情符號格式
 */
export default function isEmoji(target: string): boolean {
  target = target.trim();

  // 是否為表情符號
  if (emojiRegex().test(target)) return true;

  // 是否為 Discord 的自訂表情符號
  if (/<?(a)?:?(\w{2,32}):(\d{17,19})>?/.test(target)) return true;

  // 是否為區域指示碼
  if (/[\ud83c[\udde6-\uddff]/.test(target)) return true;

  return false;
}