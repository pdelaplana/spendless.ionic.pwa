import { IonItem, IonItemDivider, IonList } from '@ionic/react';
import styled from 'styled-components';

export const StyledIonList = styled(IonList)`
  background-color: var(--color-light);

  /* Remove bottom border from last item */
  ion-item:last-child {
    --border-width: 0;
    --inner-border-width: 0;
  }
`;
export const StyledItemDivider = styled(IonItemDivider)`
  color: var(--ion-color-primary);
  margin-top: 0;
  margin-bottom: 0;

  &.item-divider-sticky {
    position: sticky;
    top: 40px; /* Position right below the SpendListHeader */
    z-index: 9; /* Just below the main header */
    background: var(--ion-color-light);
    border-bottom: 1px solid var(--color-gray-100);
  }
`;

export const TransparentIonList = styled(IonList)`
  --background: transparent;
  --ion-background-color: transparent;
  background: transparent !important;
`;

export const StyledItem = styled(IonItem)`
  --inner-padding-end: 16px;
  --padding-start: 16px;

  &::part(native) {
    align-items: flex-start;
    padding-top: 16px;
    padding-bottom: 16px;
    display: flex;
  }

  /* Main label container */
  ion-label:not([slot="end"]) {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  /* Main label typography */
  ion-label h2 {
    font-size: 16px;
    font-weight: 500;
    color: var(--ion-color-dark);
    margin: 0 0 4px 16px;
    line-height: 1.4;
  }

  ion-label p {
    font-size: 14px;
    font-weight: 300;
    color: var(--ion-color-medium);
    margin: 0 0 0 16px;
    line-height: 1.3;
    text-transform: capitalize;
  }

  /* Amount label styling - slightly below top */
  ion-label[slot="end"] {
    font-size: 16px;
    font-weight: 500;
    color: var(--ion-color-dark);
    text-align: right;
    margin-left: 12px;
    margin-top: 4px;
    line-height: 1.4;
    display: flex;
    align-items: flex-start;
    align-self: flex-start;
  }


  /* Detail icon (chevron) positioned lower */
  &::part(detail-icon) {
    height: 16px;
    margin-top: 8px;
    font-weight: 600;
    color: var(--ion-color-medium);
    opacity: 0.6;
    align-self: flex-start;
  }
`;
