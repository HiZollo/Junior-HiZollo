/**
 * Replaces format specifiers with given strings.
 * @param formatString the format string with format specifiers inside
 * @param specifiers the values that replace <key>
 * @returns the result string
 * @example
 * // only specifiers like "<string>" are available
 * const string = format("I love <drink> and <food>!", { food: "pizza", drink: "tea" });
 * console.log(string);
 * // I love tea and pizza!
 */
export default function format(formatString: string, specifiers: {[key: string]: boolean | number | string | null}): string {
  for (let key in specifiers) {
    const regexp = new RegExp(`<${key}>`, 'g');
    formatString = formatString.replaceAll(regexp, `${specifiers[key]}`);
  }
  return formatString;
}