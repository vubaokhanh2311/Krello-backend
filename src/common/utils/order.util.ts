export function parseOrder(order?: string, defaultField = 'createdAt') {
  if (order?.includes(':')) {
    const [field, dir] = order.split(':');
    return { [field]: dir?.toUpperCase() === 'DESC' ? 'desc' : 'asc' };
  }
  return { [defaultField]: 'desc' };
}
