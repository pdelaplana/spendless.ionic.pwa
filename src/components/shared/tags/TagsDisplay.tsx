import { IonChip, IonIcon, IonLabel } from '@ionic/react';
import type React from 'react';
import { styled } from 'styled-components';
import { getTagIcon } from '@/utils/tagIconUtils';

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
            height: size === 'small' ? '1.5rem' : '2rem',
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
