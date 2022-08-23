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
 * 在一個整數前補 0 讓整體長度與給定長度相同，如果整數的長度本身大於給定長度，則不做任何增減
 * 
 * @param integer 給定的整數
 * @param length 給定的長度
 * @returns 整數轉換成的新字串
 * 
 * @example
 * fixedDigits(1, 2);   // "01"
 * fixedDigits(19, 2);  // "19"
 * fixedDigits(191, 2); // "191"
 */
export default function fixedDigits(integer: number, length: number): string {
  const string = `${integer}`;

  if (length <= string.length) return string;
  return '0'.repeat(length - string.length) + string;
}