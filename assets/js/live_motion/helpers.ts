export function compactObj(obj: object) {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null) {
      acc[key] = value;
    }

    return acc;
  }, {} as Record<string | number | symbol, any>);
}
