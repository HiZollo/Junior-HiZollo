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

/**
 * 移除字串中所有 Markdown 語法
 * @param string 給定字串
 * @return 新字串
 */
export default function removeMd(string: string): string;
export default function removeMd(string: undefined | null): null;
export default function removeMd(string: string | undefined | null): string | null {
  return string?.replace(/[<@!&#>*_~`\\\|\[\]]/g, input => `\\${input}`) ?? null;
}
