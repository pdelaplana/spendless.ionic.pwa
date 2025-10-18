import { ActionButton } from '@/components/shared';
import { ROUTES } from '@/routes/routes.constants';
import { IonItem, IonLabel, IonList, IonText } from '@ionic/react';
import type React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  text-align: center;
  padding: 3rem 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--ion-color-dark);
  margin: 0 0 1rem 0;
`;

const Message = styled.div`
  font-size: 1rem;
  color: var(--ion-color-medium);
  margin-bottom: 3rem;
  line-height: 1.6;
`;

interface Step3WelcomeProps {
  name: string;
}

export const Step3Welcome: React.FC<Step3WelcomeProps> = ({ name }) => {
  return (
    <Container>
      <Title>Welcome to Spendless</Title>
      <Message>
        <IonText>
          Everything looks good, {name}.
          <br />
          We are happy to have you here!
        </IonText>
      </Message>

      <IonList lines='none'>
        <IonItem>
          <IonLabel>
            <ActionButton
              size='large'
              label='Get Started'
              expand='block'
              routerLink={ROUTES.SPENDING}
              className='ion-padding-top ion-padding-bottom'
              isLoading={false}
              isDisabled={false}
            />
          </IonLabel>
        </IonItem>
      </IonList>
    </Container>
  );
};

export default Step3Welcome;
