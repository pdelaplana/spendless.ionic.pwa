import {
  basketOutline,
  businessOutline,
  carOutline,
  cardOutline,
  colorPaletteOutline,
  fastFoodOutline,
  fitnessOutline,
  gameControllerOutline,
  giftOutline,
  homeOutline,
  medicalOutline,
  schoolOutline,
  sparklesOutline,
  trendingUpOutline,
  walletOutline,
} from 'ionicons/icons';

/**
 * Get the appropriate icon for a tag based on its name
 * @param tag - The tag name
 * @returns The icon string from ionicons
 */
export const getTagIcon = (tag: string): string => {
  const lowerTag = tag.toLowerCase();

  // Category-based tags
  if (lowerTag.includes('need') || lowerTag.includes('essential')) return walletOutline;
  if (lowerTag.includes('want') || lowerTag.includes('desire')) return basketOutline;
  if (lowerTag.includes('culture') || lowerTag.includes('art')) return colorPaletteOutline;
  if (lowerTag.includes('unexpected') || lowerTag.includes('emergency')) return sparklesOutline;

  // Specific category tags
  if (lowerTag.includes('home') || lowerTag.includes('house') || lowerTag.includes('rent'))
    return homeOutline;
  if (lowerTag.includes('food') || lowerTag.includes('restaurant') || lowerTag.includes('meal'))
    return fastFoodOutline;
  if (lowerTag.includes('transport') || lowerTag.includes('car') || lowerTag.includes('fuel'))
    return carOutline;
  if (lowerTag.includes('health') || lowerTag.includes('medical') || lowerTag.includes('doctor'))
    return medicalOutline;
  if (lowerTag.includes('entertainment') || lowerTag.includes('game') || lowerTag.includes('fun'))
    return gameControllerOutline;
  if (lowerTag.includes('education') || lowerTag.includes('school') || lowerTag.includes('course'))
    return schoolOutline;
  if (lowerTag.includes('work') || lowerTag.includes('business') || lowerTag.includes('office'))
    return businessOutline;
  if (lowerTag.includes('fitness') || lowerTag.includes('gym') || lowerTag.includes('sport'))
    return fitnessOutline;
  if (lowerTag.includes('gift') || lowerTag.includes('present') || lowerTag.includes('birthday'))
    return giftOutline;
  if (
    lowerTag.includes('investment') ||
    lowerTag.includes('savings') ||
    lowerTag.includes('income')
  )
    return trendingUpOutline;

  // Default icon
  return cardOutline;
};
