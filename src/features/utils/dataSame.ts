function dataSame(data1: any, data2: any): boolean {
  if (data1 === data2) return true;
  if (typeof data1 === 'number' && typeof data2 === 'number' && isNaN(data1) && isNaN(data2)) return true;
  if (typeof data1 !== 'object' || typeof data2 !== 'object') return false;

  for (const prop in data1) {
      if (!dataSame(data1[prop], data2[prop])) return false;
  }
  for (const prop in data2) {
      if (data2[prop] !== undefined && data1[prop] === undefined) return false;
  }

  return true;
}