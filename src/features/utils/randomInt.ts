export default function (min: number, max: number): number {
  return Math.floor((max - min + 1) * Math.random()) + min;
}
