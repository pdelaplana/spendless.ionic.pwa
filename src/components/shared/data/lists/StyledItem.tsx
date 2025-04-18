import { IonItem } from '@ionic/react';
import styled from 'styled-components';

export const StyledItem = styled(IonItem)`
  --inner-padding-end: 10px;
  --padding-start: 10px;

  &::part(native) {
    align-items: flex-start;
    padding-top: 15px;
    padding-bottom: 5px;
  }

  ion-icon[slot="start"] {
    margin-top: 12px;
  }

  &::part(detail-icon) {
    height: 15px;
    margin-top: 12px;
    font-weight: 800;
    color: var(--ion-color-dark);
  }
`;
