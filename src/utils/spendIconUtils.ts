import type { ISpend } from '@/domain/Spend';
import {
  airplaneOutline,
  barbellOutline,
  basketOutline,
  beerOutline,
  bodyOutline,
  busOutline,
  cafeOutline,
  carOutline,
  cardOutline,
  cartOutline,
  chatbubblesOutline,
  constructOutline,
  fastFoodOutline,
  filmOutline,
  gameControllerOutline,
  giftOutline,
  hardwareChipOutline,
  heartOutline,
  homeOutline,
  laptopOutline,
  libraryOutline,
  medicalOutline,
  musicalNotesOutline,
  pawOutline,
  peopleOutline,
  phonePortraitOutline,
  pizzaOutline,
  receiptOutline,
  restaurantOutline,
  schoolOutline,
  shirtOutline,
  storefrontOutline,
  trainOutline,
  tvOutline,
  waterOutline,
  wifiOutline,
} from 'ionicons/icons';

export interface SpendIconConfig {
  icon: string;
  bgColor: string;
  iconColor: string;
}

/**
 * Returns the icon configuration for a spend based on its description, tags, and category
 * Uses context-aware matching to select the most appropriate icon
 */
export const getSpendIcon = (spend: ISpend): SpendIconConfig => {
  const description = spend.description.toLowerCase();
  const tags = spend.tags?.map((tag) => tag.toLowerCase()) || [];
  const combinedText = `${description} ${tags.join(' ')}`;

  // Monotone gray colors for all icons
  const grayConfig = {
    bgColor: 'rgba(107, 114, 128, 0.1)',
    iconColor: '#6B7280',
  };

  // Food & Dining
  if (
    /\b(restaurant|dinner|lunch|breakfast|brunch|dining|ate|meal)\b/.test(combinedText) ||
    tags.includes('restaurant') ||
    tags.includes('restaurants') ||
    tags.includes('dining')
  ) {
    return { icon: restaurantOutline, ...grayConfig };
  }
  if (
    /\b(coffee|cafe|starbucks|espresso|latte|cappuccino)\b/.test(combinedText) ||
    tags.includes('coffee') ||
    tags.includes('cafe')
  ) {
    return { icon: cafeOutline, ...grayConfig };
  }
  if (/\b(pizza|pizzeria)\b/.test(combinedText) || tags.includes('pizza')) {
    return { icon: pizzaOutline, ...grayConfig };
  }
  if (
    /\b(fast food|burger|mcdonald|wendy|kfc|taco bell|subway|doordash|food delivery|uber eats)\b/.test(
      combinedText,
    ) ||
    tags.includes('fastfood') ||
    tags.includes('fast food') ||
    tags.includes('food delivery')
  ) {
    return { icon: fastFoodOutline, ...grayConfig };
  }
  if (
    /\b(bar|beer|pub|alcohol|wine|drink|cocktail)\b/.test(combinedText) ||
    tags.includes('bar') ||
    tags.includes('alcohol')
  ) {
    return { icon: beerOutline, ...grayConfig };
  }

  // Groceries & Shopping
  if (
    /\b(grocery|groceries|supermarket|coles|woolies|woolworths|aldi|whole foods|trader joe|safeway|kroger|walmart|target|costco|market)\b/.test(
      combinedText,
    ) ||
    tags.includes('groceries') ||
    tags.includes('supermarket')
  ) {
    return { icon: basketOutline, ...grayConfig };
  }
  if (
    /\b(shopping|store|retail|bought|purchase)\b/.test(combinedText) ||
    tags.includes('shopping')
  ) {
    return { icon: storefrontOutline, ...grayConfig };
  }
  if (
    /\b(clothes|clothing|shirt|pants|dress|shoes|fashion|apparel|outfit)\b/.test(combinedText) ||
    tags.includes('clothing') ||
    tags.includes('fashion')
  ) {
    return { icon: shirtOutline, ...grayConfig };
  }

  // Transportation
  if (
    /\b(car|uber|lyft|taxi|cab|ride)\b/.test(combinedText) ||
    tags.includes('rideshare') ||
    tags.includes('taxi')
  ) {
    return { icon: carOutline, ...grayConfig };
  }
  if (
    /\b(gas|fuel|gasoline|petrol|shell|chevron|exxon|bp)\b/.test(combinedText) ||
    tags.includes('gas') ||
    tags.includes('fuel')
  ) {
    return { icon: carOutline, ...grayConfig };
  }
  if (
    /\b(bus|metro|subway|train|rail|transit|public transport)\b/.test(combinedText) ||
    tags.includes('transit') ||
    tags.includes('publictransport')
  ) {
    return { icon: busOutline, ...grayConfig };
  }
  if (
    /\b(flight|airplane|airline|airport|travel|trip|holiday)\b/.test(combinedText) ||
    tags.includes('flight') ||
    tags.includes('travel') ||
    tags.includes('trip') ||
    tags.includes('holiday')
  ) {
    return { icon: airplaneOutline, ...grayConfig };
  }

  // Entertainment
  if (
    /\b(movie|cinema|theater|film)\b/.test(combinedText) ||
    tags.includes('movies') ||
    tags.includes('entertainment')
  ) {
    return { icon: filmOutline, ...grayConfig };
  }
  if (
    /\b(game|gaming|playstation|xbox|nintendo|steam)\b/.test(combinedText) ||
    tags.includes('gaming')
  ) {
    return { icon: gameControllerOutline, ...grayConfig };
  }
  if (/\b(music|concert|spotify|apple music)\b/.test(combinedText) || tags.includes('music')) {
    return { icon: musicalNotesOutline, ...grayConfig };
  }
  if (
    /\b(netflix|hulu|disney|hbo|streaming|tv|television)\b/.test(combinedText) ||
    tags.includes('streaming')
  ) {
    return { icon: tvOutline, ...grayConfig };
  }

  // Health & Fitness
  if (
    /\b(gym|fitness|workout|exercise|training)\b/.test(combinedText) ||
    tags.includes('fitness') ||
    tags.includes('gym')
  ) {
    return { icon: barbellOutline, ...grayConfig };
  }
  if (
    /\b(doctor|hospital|medical|clinic|pharmacy|medicine|health)\b/.test(combinedText) ||
    tags.includes('health') ||
    tags.includes('medical')
  ) {
    return { icon: medicalOutline, ...grayConfig };
  }

  // Utilities & Services
  if (
    /\b(rent|housing|apartment|lease)\b/.test(combinedText) ||
    tags.includes('rent') ||
    tags.includes('housing')
  ) {
    return { icon: homeOutline, ...grayConfig };
  }
  if (
    /\b(electric|electricity|gas|water|utility|utilities)\b/.test(combinedText) ||
    tags.includes('utilities')
  ) {
    return { icon: waterOutline, ...grayConfig };
  }
  if (
    /\b(internet|wifi|broadband|comcast|verizon|att|spectrum|uniti)\b/.test(combinedText) ||
    tags.includes('internet')
  ) {
    return { icon: wifiOutline, ...grayConfig };
  }
  if (
    /\b(phone|mobile|cell|verizon|att|t-mobile|sprint|optus|telstra)\b/.test(combinedText) ||
    tags.includes('phone')
  ) {
    return { icon: phonePortraitOutline, ...grayConfig };
  }

  // Technology & Electronics
  if (
    /\b(computer|laptop|pc|mac|apple|dell|hp)\b/.test(combinedText) ||
    tags.includes('electronics') ||
    tags.includes('computer')
  ) {
    return { icon: laptopOutline, ...grayConfig };
  }
  if (/\b(software|app|saas|cloud)\b/.test(combinedText) || tags.includes('software')) {
    return { icon: hardwareChipOutline, ...grayConfig };
  }

  // Education & Books
  if (
    /\b(school|education|tuition|class|course|university|college|student|academy|kindergarten|preschool|daycare|textbook|stationery|uniform|excursion|school fee|enrolment|enrollment|tafe)\b/.test(
      combinedText,
    ) ||
    tags.includes('school') ||
    tags.includes('education')
  ) {
    return { icon: schoolOutline, ...grayConfig };
  }
  if (
    /\b(book|books|amazon|kindle|library|reading)\b/.test(combinedText) ||
    tags.includes('books')
  ) {
    return { icon: libraryOutline, ...grayConfig };
  }

  // Social & Gifts
  if (/\b(gift|present|birthday|anniversary)\b/.test(combinedText) || tags.includes('gift')) {
    return { icon: giftOutline, ...grayConfig };
  }
  if (/\b(friends|social|party|event|gathering)\b/.test(combinedText) || tags.includes('social')) {
    return { icon: peopleOutline, ...grayConfig };
  }

  // Pets
  if (
    /\b(pet|dog|cat|vet|veterinary|petco|petsmart)\b/.test(combinedText) ||
    tags.includes('pets')
  ) {
    return { icon: pawOutline, ...grayConfig };
  }

  // Home & Maintenance
  if (
    /\b(hardware|tools|home depot|lowes|repair|maintenance|construction)\b/.test(combinedText) ||
    tags.includes('maintenance') ||
    tags.includes('home')
  ) {
    return { icon: constructOutline, ...grayConfig };
  }

  // Personal Care
  if (
    /\b(salon|haircut|spa|beauty|cosmetics)\b/.test(combinedText) ||
    tags.includes('personalcare') ||
    tags.includes('beauty')
  ) {
    return { icon: bodyOutline, ...grayConfig };
  }

  // Communication
  if (
    /\b(chat|messaging|communication|whatsapp|telegram)\b/.test(combinedText) ||
    tags.includes('communication')
  ) {
    return { icon: chatbubblesOutline, ...grayConfig };
  }

  // Payment & Financial
  if (
    /\b(payment|pay|paid|bill|invoice|transfer|remittance|repayment|loan)\b/.test(combinedText) ||
    tags.includes('payment') ||
    tags.includes('bill')
  ) {
    return { icon: cardOutline, ...grayConfig };
  }

  // Default - use receipt icon
  return { icon: receiptOutline, ...grayConfig };
};
