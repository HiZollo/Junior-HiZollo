/**
 * Deep-overwrites obj2 into obj1.
 * @param obj1
 * @param obj2
 * @returns the overwrited object
 */
export default function overwrite<T>(obj1: T, obj2: T): T {
  for (let key in obj2) {
    obj1[key] = (typeof obj2[key] === 'object') ? overwrite(obj1[key], obj2[key]) : obj2[key];
  }
  return obj1;
}