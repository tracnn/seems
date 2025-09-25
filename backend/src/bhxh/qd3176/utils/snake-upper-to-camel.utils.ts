export function snakeUpperToCamel(input: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const key in input) {
    const words = key.split('_');
    const camelKey = words
      .map((word, index) => {
        word = word.toLowerCase();
        return index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join('');

    result[camelKey] = input[key];
  }

  return result;
}