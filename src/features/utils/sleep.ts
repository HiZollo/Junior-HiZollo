/**
 * Returns a promise that takes a certain amount of time to resolve.
 * @param time in milliseconds
 * @param message the message to resolve
 * @returns a promise that always resolves with `message`
 */
export default function sleep<T>(time: number, message: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(message);
    }, time);
  });
}