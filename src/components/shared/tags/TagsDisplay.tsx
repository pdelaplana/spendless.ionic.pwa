import { IonChip, IonIcon, IonLabel } from '@ionic/react';
import {
  basketOutline,
  cardOutline,
  colorPaletteOutline,
  sparklesOutline,
  walletOutline,
  homeOutline,
  fastFoodOutline,
  carOutline,
  medicalOutline,
  gameControllerOutline,
  schoolOutline,
  businessOutline,
  fitnessOutline,
  giftOutline,
  trendingUpOutline,
} from 'ionicons/icons';
import type React from 'react';
import { styled } from 'styled-components';

const TagsContainer = styled.div`
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;
`;

interface TagsDisplayProps {
  tags?: string[];
  color?: string;
  size?: 'small' | 'default';
}

const getTagIcon = (tag: string): string => {
  const lowerTag = tag.toLowerCase();
  
  // Category-based tags
  if (lowerTag.includes('need') || lowerTag.includes('essential')) return walletOutline;
  if (lowerTag.includes('want') || lowerTag.includes('desire')) return basketOutline;
  if (lowerTag.includes('culture') || lowerTag.includes('art')) return colorPaletteOutline;
  if (lowerTag.includes('unexpected') || lowerTag.includes('emergency')) return sparklesOutline;
  
  // Specific category tags
  if (lowerTag.includes('home') || lowerTag.includes('house') || lowerTag.includes('rent')) return homeOutline;
  if (lowerTag.includes('food') || lowerTag.includes('restaurant') || lowerTag.includes('meal')) return fastFoodOutline;
  if (lowerTag.includes('transport') || lowerTag.includes('car') || lowerTag.includes('fuel')) return carOutline;
  if (lowerTag.includes('health') || lowerTag.includes('medical') || lowerTag.includes('doctor')) return medicalOutline;
  if (lowerTag.includes('entertainment') || lowerTag.includes('game') || lowerTag.includes('fun')) return gameControllerOutline;
  if (lowerTag.includes('education') || lowerTag.includes('school') || lowerTag.includes('course')) return schoolOutline;
  if (lowerTag.includes('work') || lowerTag.includes('business') || lowerTag.includes('office')) return businessOutline;
  if (lowerTag.includes('fitness') || lowerTag.includes('gym') || lowerTag.includes('sport')) return fitnessOutline;
  if (lowerTag.includes('gift') || lowerTag.includes('present') || lowerTag.includes('birthday')) return giftOutline;
  if (lowerTag.includes('investment') || lowerTag.includes('savings') || lowerTag.includes('income')) return trendingUpOutline;
  
  // Default icon
  return cardOutline;
};

const TagsDisplay: React.FC<TagsDisplayProps> = ({
  tags = [],
  color = 'medium',
  size = 'small',
}) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <TagsContainer>
      {tags.map((tag) => (
        <IonChip
          key={tag}
          color={color}
          style={{ 
            fontSize: size === 'small' ? '0.75rem' : '0.875rem',
            height: size === 'small' ? '1.5rem' : '2rem'
          }}
        >
          <IonIcon
            icon={getTagIcon(tag)}
            style={{ fontSize: '0.875rem', marginRight: '0.25rem' }}
          />
          <IonLabel>{tag}</IonLabel>
        </IonChip>
      ))}
    </TagsContainer>
  );
};

export default TagsDisplay;