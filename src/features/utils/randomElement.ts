import randomInt from "./randomInt";

export default function randomElement<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}