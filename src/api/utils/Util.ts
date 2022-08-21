export class Util extends null {
  static keysOf<T extends object>(object: T): (keyof T)[] {
    return Object.keys(object) as (keyof T)[];
  }

  static valuesOf<T>(object: T): (T[keyof T])[] {
    return Object.values(object) as (T[keyof T])[];
  }
}