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
