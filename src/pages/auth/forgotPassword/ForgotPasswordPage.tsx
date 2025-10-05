import { SpendlessLogo } from '@/components/brand';
import { InputFormField } from '@/components/forms';
import InformationContent from '@/components/layouts/InformationContent';
import PublicPageLayout from '@/components/layouts/PublicPageLayout';
import { ActionButton, Gap } from '@/components/shared';
import { useAppNotifications } from '@/hooks/ui';
import { useAuth } from '@/providers/auth';
import { ROUTES } from '@/routes/routes.constants';
import { StyledIonCard } from '@/styles/IonCard.styled';
import {
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonList,
  IonRouterLink,
  IonText,
} from '@ionic/react';
import { t } from 'i18next';
import { mailOutline, sadOutline } from 'ionicons/icons';
import { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import styled from 'styled-components';

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 0 2rem 0;
  text-align: center;
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
    <PublicPageLayout title='Reset Password' showHeader={false}>
      <Gap size='.65rem' />
      <LogoContainer>
        <SpendlessLogo variant='primary' size='large' />
      </LogoContainer>
      <Gap size='1rem' />
      {pageState.state === 'error' && (
        <InformationContent icon={sadOutline} title='Error Sending Reset Email'>
          <p>
            {pageState.error || t('An error occurred while sending the reset email.')}
            <br />
            Please try again or contact support if the issue persists.
          </p>
        </InformationContent>
      )}

      {pageState.state === 'success' && (
        <InformationContent icon={mailOutline} title='Password Reset Email Sent'>
          <p>
            An email has been sent to {getValues('email')} with instructions on how to reset your
            password
          </p>
          <p>If you don't see it, check your spam folder.</p>
          <p>
            <IonRouterLink href={ROUTES.SIGNIN}>Back to Sign In</IonRouterLink>
          </p>
        </InformationContent>
      )}

      {pageState.state === 'initial' && (
        <StyledIonCard>
          <IonCardHeader>
            <IonCardTitle className='ion-margin'>
              <IonText>Reset your password</IonText>
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList lines='none'>
              <form onSubmit={handleSubmit(onSubmit)} aria-label='Reset password form'>
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
                  <IonRouterLink href={ROUTES.SIGNIN}>
                    Remember your password? Sign in here
                  </IonRouterLink>
                </IonLabel>
              </IonItem>
              <IonItem aria-label='Sign up link'>
                <IonLabel className='ion-text-center'>
                  <IonRouterLink href={ROUTES.SIGNUP}>
                    Don't have an account? Sign up here
                  </IonRouterLink>
                </IonLabel>
              </IonItem>
            </IonList>
          </IonCardContent>
        </StyledIonCard>
      )}
    </PublicPageLayout>
  );
};

export default ForgotPasswordPage;
