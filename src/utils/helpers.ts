import { Decimal } from "@prisma/client/runtime/library";

export const randomBetween = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

/**
 * Calculate estimated GDP
 */
export const calculateEstimatedGdp = (
  population: bigint,
  exchangeRate: number | null
): number | null => {
  if (!exchangeRate || exchangeRate === 0) return null;

  const multiplier = randomBetween(1000, 2000);
  const gdp = (Number(population) * multiplier) / exchangeRate;

  return Math.round(gdp * 100) / 100; // round to 2 d.p
};

/**
 * Convert Prisma Decimal to number
 */
export const decimalToNumber = (value: Decimal | null): number | null => {
  if (!value) return null;
  return value.toNumber();
};

/**
 * Format BigInt to number for JSON serialization
 */
export const bigIntToNumber = (value: bigint): number => {
  return Number(value);
};

/**
 * Normalize country name for case-insensitive comparison
 */
export const normalizeCountryName = (name: string): string => {
  return name.trim().toLowerCase();
};
