export const CLOTHING_SIZES = {
  tops: ["S", "M", "L", "XL", "XXL", "3XL"],
  bottoms: ["28", "30", "32", "34", "36", "38", "40"],
  jeansLength: ["30", "32", "34"],
} as const;

export type SizeCategory = keyof typeof CLOTHING_SIZES;

export const ALL_SIZES = [
  ...CLOTHING_SIZES.tops,
  ...CLOTHING_SIZES.bottoms,
  ...CLOTHING_SIZES.jeansLength,
] as const;
