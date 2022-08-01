export default function fixedDigits(integer: number, length: number): string {
  const string = `${integer}`;

  if (length <= string.length) return string;
  return '0'.repeat(length - string.length) + string;
}