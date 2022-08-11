/**
 * 在給定整數閉區間中隨機挑選一個整數
 * @param min 下界
 * @param max 上界
 * @returns 隨機的整數
 */
export default function (min: number, max: number): number {
  return Math.floor((max - min + 1) * Math.random()) + min;
}
