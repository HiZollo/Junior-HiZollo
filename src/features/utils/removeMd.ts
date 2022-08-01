export default function removeMd(string: string): string;
export default function removeMd(string: string | undefined | null): string | null;
export default function removeMd(string: string | undefined | null): string | null {
  return string?.replace(/[<@!&#>*_~`\\\|\[\]]/g, input => `\\${input}`) ?? null;
}
