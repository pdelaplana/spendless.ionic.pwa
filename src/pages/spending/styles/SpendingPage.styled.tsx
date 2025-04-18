import { IonItemDivider, IonLabel, IonList } from '@ionic/react';
import styled from 'styled-components';

export const StyledIonList = styled(IonList)`
  --background-color: var(--ion-color-light);
`;

export const StyledItemDivider = styled(IonItemDivider)`
  background-color: var(--ion-color-light);
  color: var(--ion-color-primary);
`;

export const StyledDateLabel = styled(IonLabel)`
  width: 100%;
  text-align: center;
`;

export const StyledTotalLabel = styled(IonLabel)`
  font-weight: normal;
  color: var(--ion-color-primary);
  padding-right:16px;
`;

export const ChartSwiperContainer = styled.div`
  width: 100%;
  padding: 10px 0;

  .swiper {
    width: 100%;
    height: 360px;
  }
  .swiper-pagination {
    bottom: -1px;
  }
`;
