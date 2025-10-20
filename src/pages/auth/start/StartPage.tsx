import { SpendlessLogo } from '@/components/brand';
import { ActionButton, Gap } from '@/components/shared';
import { ROUTES } from '@/routes/routes.constants';
import AuthPageLayout from '@components/layouts/AuthPageLayout';
import type React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 2rem;
  min-height: calc(100vh );
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  flex: 1;
  align-items: center;
`;

const ButtonContainer = styled.div`
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 1rem;
`;

const StartPage: React.FC = () => {
  return (
    <AuthPageLayout title='Welcome'>
      <Container>
        <LogoContainer>
          <SpendlessLogo variant='primary' size='large' />
        </LogoContainer>

        <ButtonContainer>
          <ActionButton
            routerLink={ROUTES.SIGNUP}
            label='Get Started'
            expand='block'
            size='large'
            isLoading={false}
            isDisabled={false}
          />

          <ActionButton
            routerLink={ROUTES.SIGNIN}
            label='Sign in'
            expand='block'
            size='large'
            fill='outline'
            isLoading={false}
            isDisabled={false}
          />
        </ButtonContainer>
      </Container>
    </AuthPageLayout>
  );
};

export default StartPage;
