import type React from 'react';

import { IonImg } from '@ionic/react';
import styled from 'styled-components';

const StyledIonImg = styled(IonImg)`
  width: 55px;
  height: 55px;
  margin-left: 0px;
  margin-top: 2px;
  margin-bottom: -2px;
`;

const HeaderLogo: React.FC = () => {
  return <StyledIonImg src='/images/header.logo.png' alt='Spendless' data-testid='the-logo' />;
};

export default HeaderLogo;
