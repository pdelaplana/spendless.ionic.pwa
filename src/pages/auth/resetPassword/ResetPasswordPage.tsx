import { InputFormField } from '@/components/forms';
import InformationContent from '@/components/layouts/InformationContent';
import { ActionButton } from '@/components/shared';
import { useAppNotifications } from '@/hooks';
import { useAuth } from '@/providers/auth';
import { ROUTES } from '@/routes/routes.constants';
import AuthPageLayout from '@components/layouts/AuthPageLayout';
import type { FirebaseError } from '@firebase/app';
import {
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonRouterLink,
} from '@ionic/react';
import { t } from 'i18next';
import { mailOutline, sadOutline } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
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

interface ResetPasswordForm {
  oobCode: string;
  password: string;
}
type PageState = { state: 'initial' } | { state: 'success' } | { state: 'error'; error: string };

const ResetPasswordPage: React.FC = () => {
  const location = useLocation();
  const [pageState, setPageState] = useState<PageState>({ state: 'initial' });

  const { confirmPasswordReset } = useAuth();
  const { showNotification, showErrorNotification } = useAppNotifications();

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = useForm<ResetPasswordForm>();

  const onSubmit: SubmitHandler<ResetPasswordForm> = async (formData) => {
    try {
      clearErrors('root');
      setPageState({ state: 'initial' });

      await confirmPasswordReset(formData.oobCode, formData.password);
      setPageState({ state: 'success' });
    } catch (error) {
      let errorMessage = t('common.errors.default');

      if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
        const firebaseError = error as FirebaseError;
        errorMessage = t(
          `server.errors.auth.${firebaseError.code}` as never,
          firebaseError.message,
        );

        if (firebaseError.code === 'auth/expired-action-code') {
          setPageState({
            state: 'error',
            error:
              'This password reset link has expired. Please request a new password reset link.',
          });
          return;
        }

        if (
          firebaseError.code === 'auth/invalid-action-code' ||
          firebaseError.code === 'auth/user-disabled' ||
          firebaseError.code === 'auth/user-not-found'
        ) {
          setPageState({
            state: 'error',
            error:
              'This password reset link is invalid or has already been used. Please request a new password reset link.',
          });
          return;
        }
      }

      setPageState({
        state: 'error',
        error: errorMessage,
      });
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('oobCode');
    if (code) {
      setValue('oobCode', code);
    }
    if (!code) {
      setPageState({
        state: 'error',
        error: 'Invalid or missing reset code. Please try again with a valid reset link.',
      });
    }
  }, [location, setValue]);

  return (
    <AuthPageLayout title='Reset Password'>
      {pageState.state === 'error' && (
        <Container>
          <InformationContent icon={sadOutline} title='Password Reset Failed'>
            <p>{pageState.error}</p>
            <p>
              <IonRouterLink routerLink={ROUTES.FORGOTPASSWORD}>
                Request a new password reset link
              </IonRouterLink>
            </p>
          </InformationContent>
        </Container>
      )}

      {pageState.state === 'success' && (
        <Container>
          <InformationContent icon={mailOutline} title='Password Reset Successful'>
            <p>Your password has been reset successfully!</p>
            <p>Please log back in with your new password.</p>
            <p>
              <IonRouterLink routerLink={ROUTES.SIGNIN}>Go to Sign In</IonRouterLink>
            </p>
          </InformationContent>
        </Container>
      )}

      {pageState.state === 'initial' && (
        <Container>
          <Header>
            <Title>Reset Your Password</Title>
            <Subtitle>Enter a new password for your account</Subtitle>
          </Header>

          <StyledIonCard>
            <IonCardContent>
              <IonList lines='none'>
                {errors.root && (
                  <IonItem>
                    <IonNote color='danger' role='alert'>
                      {errors.root.message}
                    </IonNote>
                  </IonItem>
                )}

                <form onSubmit={handleSubmit(onSubmit)} aria-label='Reset password form'>
                  <IonItem>
                    <IonLabel>
                      <InputFormField
                        name='password'
                        label='New Password'
                        type='password'
                        fill='outline'
                        register={register}
                        error={errors.password}
                        validationRules={{
                          required: 'Password is required',
                          minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters long',
                          },
                        }}
                      />
                    </IonLabel>
                  </IonItem>

                  <IonItem>
                    <IonLabel>
                      <ActionButton
                        size='default'
                        label='Reset Password'
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

export default ResetPasswordPage;
