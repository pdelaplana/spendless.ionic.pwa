import { SpendlessLogo } from '@/components/brand';
import InputFormField from '@/components/forms/fields/InputFormField';
import { ActionButton, Gap } from '@/components/shared';
import { StyledIonCard } from '@/components/ui';
import { ROUTES } from '@/routes/routes.constants';
import AuthPageLayout from '@components/layouts/AuthPageLayout';
import {
  IonBackButton,
  IonButtons,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonRouterLink,
  IonText,
  useIonRouter,
} from '@ionic/react';
import { useAuth } from '@providers/auth/useAuth';
import { logoGoogle } from 'ionicons/icons';
import type React from 'react';
import { useEffect } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

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

const Divider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid var(--ion-color-light-shade);
  }

  span {
    padding: 0 1rem;
    color: var(--ion-color-medium);
    font-size: 0.875rem;
  }
`;

interface ISigninForm {
  email: string;
  password: string;
}

const SigninPage: React.FC = () => {
  const { t } = useTranslation();
  const { signin, signInWithGoogle, isSigningIn, isSigningInWithGoogle, error, isAuthenticated } =
    useAuth();

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

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // Navigation will be handled by the useEffect
    } catch (e) {
      // Error will be handled by useAuth
    }
  };

  const { push } = useIonRouter();

  useEffect(() => {
    if (isAuthenticated && !isSigningIn && !isSigningInWithGoogle) {
      window.history.pushState(null, '', ROUTES.ROOT);

      push(ROUTES.ROOT, 'root', 'replace');
    }
  }, [isAuthenticated, isSigningIn, isSigningInWithGoogle, push]);

  return (
    <AuthPageLayout title='Sign in'>
      <Container>
        <BackButton>
          <IonButtons>
            <IonBackButton defaultHref={ROUTES.START} text='' />
          </IonButtons>
        </BackButton>

        <Header>
          <Title>Welcome Back</Title>
          <Subtitle>Let's pick up where you left off</Subtitle>
        </Header>

        <StyledIonCard>
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
                <IonItem>
                  <IonLabel className='ion-text-center'>
                    <IonRouterLink routerLink={ROUTES.FORGOTPASSWORD}>
                      Forgot Password?
                    </IonRouterLink>
                  </IonLabel>
                </IonItem>
              </form>

              <Divider>
                <span>or</span>
              </Divider>

              <IonItem>
                <IonLabel>
                  <ActionButton
                    size='default'
                    label='Continue with Google'
                    expand='block'
                    fill='outline'
                    className='ion-no-padding ion-padding-top ion-padding-bottom'
                    onClick={handleGoogleSignIn}
                    isLoading={isSigningInWithGoogle}
                    isDisabled={isSigningIn || isSigningInWithGoogle}
                    disabled={isSigningIn || isSigningInWithGoogle}
                  >
                    <IonIcon slot='start' icon={logoGoogle} />
                  </ActionButton>
                </IonLabel>
              </IonItem>
              <IonItem aria-label='Sign up link'>
                <IonLabel className='ion-text-center'>
                  <IonRouterLink routerLink={ROUTES.SIGNUP}>
                    Don't have an account? Get Started
                  </IonRouterLink>
                </IonLabel>
              </IonItem>
            </IonList>
          </IonCardContent>
        </StyledIonCard>
      </Container>
    </AuthPageLayout>
  );
};

export default SigninPage;
