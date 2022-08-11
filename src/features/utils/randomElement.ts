import randomInt from "./randomInt";

/**
 * 從一個陣列中隨機挑選一個元素
 * @param array 給定的陣列
 * @returns 隨機元素
 */
export default function randomElement<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}