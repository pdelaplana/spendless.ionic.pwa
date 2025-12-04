/**
 * Generate a unique key for list items by combining content and index
 * @param item - The item to generate key for (string or object)
 * @param index - The array index
 * @param prefix - Optional prefix for the key
 * @returns A unique key string
 */
export const generateListItemKey = (item: unknown, index: number, prefix = 'item'): string => {
  if (typeof item === 'string') {
    // For strings, use first few chars + index
    const sanitized = item.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
    return `${prefix}-${sanitized}-${index}`;
  }
  if (typeof item === 'object' && item !== null) {
    // For objects, try to use an id or other unique property
    const obj = item as Record<string, unknown>;
    const uniqueValue = obj.id || obj.tag || obj.category || JSON.stringify(item).substring(0, 20);
    const sanitized = String(uniqueValue)
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 10);
    return `${prefix}-${sanitized}-${index}`;
  }
  // Fallback for other types
  return `${prefix}-${index}`;
};
