export class Util extends null {
  static keysOf<T extends object>(object: T): (keyof T)[] {
    return Object.keys(object) as (keyof T)[];
  }

  static valuesOf<T>(object: T): (T[keyof T])[] {
    return Object.values(object) as (T[keyof T])[];
  }

  static entriesOf<T>(object: T): [keyof T, T[keyof T]][] {
    return Object.entries(object) as [keyof T, T[keyof T]][];
  }

  static sleep(time: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, time);
    });
  }
}