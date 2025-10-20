import { InputFormField } from '@/components/forms';
import InformationContent from '@/components/layouts/InformationContent';
import { ActionButton } from '@/components/shared';
import { useAppNotifications } from '@/hooks/ui';
import { useAuth } from '@/providers/auth';
import { ROUTES } from '@/routes/routes.constants';
import AuthPageLayout from '@components/layouts/AuthPageLayout';
import {
  IonBackButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonList,
  IonRouterLink,
} from '@ionic/react';
import { t } from 'i18next';
import { mailOutline, sadOutline } from 'ionicons/icons';
import { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import styled from 'styled-components';

const StyledIonCard = styled(IonCard)`
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Container = styled.div`
  padding: 2rem 1rem;
  max-width: 500px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--ion-color-dark);
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: var(--ion-color-medium);
  margin: 0;
`;

const BackButton = styled.div`
  margin-bottom: 1rem;
`;

interface ForgotPasswordForm {
  email: string;
}
type PageState = { state: 'initial' } | { state: 'success' } | { state: 'error'; error: string };

const ForgotPasswordPage: React.FC = () => {
  const { showNotification, showErrorNotification } = useAppNotifications();

  const { sendResetPasswordEmail } = useAuth();
  const [pageState, setPageState] = useState<PageState>({ state: 'initial' });

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = useForm<ForgotPasswordForm>();

  const onSubmit: SubmitHandler<ForgotPasswordForm> = async (formData) => {
    try {
      setPageState({ state: 'initial' });

      await sendResetPasswordEmail(formData.email);

      setPageState({ state: 'success' });

      showNotification('Password reset email sent! Check your inbox.');
    } catch (e) {
      const error = e as Error;
      setPageState({
        state: 'error',
        error: error.message,
      });
      showErrorNotification('Failed to send reset email. Please try again.');
    }
  };

  return (
    <AuthPageLayout title='Forgot Password'>
      {pageState.state === 'error' && (
        <Container>
          <InformationContent icon={sadOutline} title='Error Sending Reset Email'>
            <p>
              {pageState.error || t('An error occurred while sending the reset email.')}
              <br />
              Please try again or contact support if the issue persists.
            </p>
          </InformationContent>
        </Container>
      )}

      {pageState.state === 'success' && (
        <Container>
          <InformationContent icon={mailOutline} title='Password Reset Email Sent'>
            <p>
              An email has been sent to {getValues('email')} with instructions on how to reset your
              password
            </p>
            <p>If you don't see it, check your spam folder.</p>
            <p>
              <IonRouterLink routerLink={ROUTES.SIGNIN}>Back to Sign In</IonRouterLink>
            </p>
          </InformationContent>
        </Container>
      )}

      {pageState.state === 'initial' && (
        <Container>
          <BackButton>
            <IonButtons>
              <IonBackButton defaultHref={ROUTES.SIGNIN} text='' />
            </IonButtons>
          </BackButton>

          <Header>
            <Title>Forgot Your Password?</Title>
            <Subtitle>Enter your email to receive a reset link</Subtitle>
          </Header>

          <StyledIonCard>
            <IonCardContent>
              <IonList lines='none'>
                <form onSubmit={handleSubmit(onSubmit)} aria-label='Forgot password form'>
                  <IonItem>
                    <IonLabel>
                      <InputFormField
                        name='email'
                        label='Email'
                        type='email'
                        fill='outline'
                        register={register}
                        error={errors.email}
                        validationRules={{
                          required: 'Email is required',
                          pattern: {
                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                            message: 'Enter a valid email address',
                          },
                        }}
                      />
                    </IonLabel>
                  </IonItem>

                  <IonItem>
                    <IonLabel>
                      <ActionButton
                        size='default'
                        label='Send Reset Email'
                        expand='block'
                        type='submit'
                        className='ion-no-padding ion-padding-top ion-padding-bottom'
                        aria-busy={isSubmitting}
                        isLoading={isSubmitting}
                        isDisabled={!isDirty}
                      />
                    </IonLabel>
                  </IonItem>
                </form>

                <IonItem aria-label='Sign in link'>
                  <IonLabel className='ion-text-center'>
                    <IonRouterLink routerLink={ROUTES.SIGNIN}>
                      Remember your password? Sign in
                    </IonRouterLink>
                  </IonLabel>
                </IonItem>
              </IonList>
            </IonCardContent>
          </StyledIonCard>
        </Container>
      )}
    </AuthPageLayout>
  );
};

export default ForgotPasswordPage;
