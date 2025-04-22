import { IonItem, IonItemDivider, IonList } from '@ionic/react';
import styled from 'styled-components';

export const StyledIonList = styled(IonList)`
  --background-color: var(--ion-color-light);
`;

export const StyledItemDivider = styled(IonItemDivider)`
  background-color: var(--ion-color-light);
  color: var(--ion-color-primary);
`;

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
