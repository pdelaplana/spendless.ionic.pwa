import { IonCard } from '@ionic/react';
import styled from 'styled-components';

/**
 * Styled IonCard with subtle inset border
 * Used for form sections and content grouping across the app
 */
export const StyledIonCard = styled(IonCard)`
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;
