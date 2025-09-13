import { SpendlessLogo } from '@/components/brand';
import InputFormField from '@/components/forms/fields/InputFormField';
import { ActionButton, Gap } from '@/components/shared';
import { ROUTES } from '@/routes/routes.constants';
import AuthPageLayout from '@components/layouts/AuthPageLayout';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonRouterLink,
  IonText,
  useIonRouter,
} from '@ionic/react';
import { useAuth } from '@providers/auth/useAuth';
import type React from 'react';
import { useEffect } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const StyledIonCard = styled(IonCard)`
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 0 2rem 0;
  text-align: center;
`;

interface ISigninForm {
  email: string;
  password: string;
}

const SigninPage: React.FC = () => {
  const { t } = useTranslation();
  const { signin, isSigningIn, error, isAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ISigninForm>();

  const onSubmit: SubmitHandler<ISigninForm> = async (formData) => {
    try {
      const user = await signin(formData.email, formData.password);
      if (user) {
        //reset();
      }
    } catch (e) {
      // Error will be handled by useAuth
    }
  };

  const { push } = useIonRouter();

  useEffect(() => {
    if (isAuthenticated && !isSigningIn) {
      window.history.pushState(null, '', ROUTES.ROOT);

      push(ROUTES.ROOT, 'root', 'replace');
    }
  }, [isAuthenticated, isSigningIn, push]);

  return (
    <AuthPageLayout title='Sign in'>
      <Gap size='.65rem' />
      <LogoContainer>
        <SpendlessLogo variant='primary' size='large' />
      </LogoContainer>
      <Gap size='1rem' />
      <StyledIonCard>
        <IonCardHeader>
          <IonCardTitle className='ion-margin'>
            <IonText>Sign in with your Spendless account</IonText>
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonList lines='none'>
            {error && (
              <IonItem>
                <IonNote color='danger' role='alert'>
                  {t('common.errors.signinFailed')}
                </IonNote>
              </IonItem>
            )}

            <form onSubmit={handleSubmit(onSubmit)} aria-label='Sign in form'>
              <IonItem>
                <IonLabel>
                  <InputFormField<ISigninForm>
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
                  <InputFormField<ISigninForm>
                    name='password'
                    label='Password'
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
                    label='Sign in'
                    expand='block'
                    type='submit'
                    disabled={isSigningIn}
                    className='ion-no-padding ion-padding-top ion-padding-bottom'
                    aria-busy={isSigningIn}
                    isLoading={isSigningIn}
                    isDisabled={false}
                  />
                </IonLabel>
              </IonItem>
            </form>

            <IonItem>
              <IonLabel className='ion-text-center'>
                <IonRouterLink href='/forgot-password'>Forgot Password?</IonRouterLink>
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
    </AuthPageLayout>
  );
};

export default SigninPage;
