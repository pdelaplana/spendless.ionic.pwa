import { SpendlessLogo } from '@/components/brand';
import { InputFormField } from '@/components/forms';
import InformationContent from '@/components/layouts/InformationContent';
import PublicPageLayout from '@/components/layouts/PublicPageLayout';
import { ActionButton } from '@/components/shared';
import { useAppNotifications } from '@/hooks';
import { useAuth } from '@/providers/auth';
import { ROUTES } from '@/routes/routes.constants';
import { StyledIonCard } from '@/styles/IonCard.styled';
import type { FirebaseError } from '@firebase/app';
import {
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonRouterLink,
  IonText,
} from '@ionic/react';
import { t } from 'i18next';
import { mailOutline, sadOutline } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 0 2rem 0;
  text-align: center;
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
      showNotification(
        'Your password has been reset successfully! You can now log in with your new password.',
      );
    } catch (error) {
      let errorMessage = t('common.errors.default');

      if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
        errorMessage = t(
          `server.errors.auth.${(error as FirebaseError).code}`,
          (error as FirebaseError).message,
        );
      }

      setError('root', {
        type: 'manual',
        message: errorMessage,
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
    <PublicPageLayout title='Reset Password'>
      <LogoContainer>
        <SpendlessLogo variant='primary' size='large' />
      </LogoContainer>
      {pageState.state === 'error' && (
        <InformationContent icon={sadOutline} title='Invalid Reset Code'>
          <p>{pageState.error || t('An error occurred while sending the reset email.')}</p>
          <p>Please try again or contact support if the issue persists.</p>
        </InformationContent>
      )}

      {pageState.state === 'success' && (
        <InformationContent icon={mailOutline} title='Password Reset Successful'>
          <p>
            Your password has been reset successfully! You can now log in with your new password.
          </p>
          <p>
            <IonRouterLink href={ROUTES.SIGNIN}>Go to Sign In</IonRouterLink>
          </p>
        </InformationContent>
      )}

      {pageState.state === 'initial' && (
        <StyledIonCard>
          <IonCardHeader>
            <IonCardTitle className='ion-margin'>
              <IonText>Enter your new password</IonText>
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {errors.root && (
              <div className='ion-padding-start ion-padding-end'>
                <IonNote color='danger' role='alert'>
                  {errors.root.message}
                </IonNote>
              </div>
            )}
            <IonList lines='none'>
              <form onSubmit={handleSubmit(onSubmit)} aria-label='Reset password form'>
                <IonItem>
                  <IonLabel>
                    <InputFormField
                      name='password'
                      label='Password'
                      type='password'
                      fill='outline'
                      register={register}
                      error={errors.password}
                      validationRules={{
                        required: 'Password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters long',
                        },
                      }}
                    />
                  </IonLabel>
                </IonItem>

                <IonItem>
                  <IonLabel>
                    <ActionButton
                      size='default'
                      label='Change Password'
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
            </IonList>
          </IonCardContent>
        </StyledIonCard>
      )}
    </PublicPageLayout>
  );
};

export default ResetPasswordPage;
