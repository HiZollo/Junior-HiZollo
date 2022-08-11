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