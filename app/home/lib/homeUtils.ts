// app/home/lib/homeUtils.ts

export const getPriceByCursor = (basePrice: number, cursor: number) => {
  return basePrice + cursor;
};

export const normalizePair = (pair: string) => {
  return pair?.replace("/", "").toUpperCase();
};