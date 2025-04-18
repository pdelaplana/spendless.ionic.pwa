import type React from 'react';
import { useEffect } from 'react';
import {
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  IonLoading,
  IonText,
  IonList,
  IonListHeader,
  IonRouterLink,
  useIonRouter,
  IonNote,
} from '@ionic/react';
import { useAuth } from '@providers/auth/useAuth';
import { type SubmitHandler, useForm } from 'react-hook-form';
import ValidationError from '@/components/forms/validation/ValidationError';
import PublicPageLayout from '@components/layouts/PublicPageLayout';
import InputFormField from '@/components/forms/fields/InputFormField';
import { ROUTES } from '@/routes/routes.constants';

interface ISigninForm {
  email: string;
  password: string;
}

const SigninPage: React.FC = () => {
  const { signin, pendingUpdate, error, isAuthenticated } = useAuth();

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
        reset();
      }
    } catch (e) {
      // Error will be handled by useAuth
    }
  };

  const { push } = useIonRouter();

  useEffect(() => {
    if (isAuthenticated) push('/home', 'root', 'replace');
  }, [isAuthenticated, push]);

  return (
    <PublicPageLayout title='Sign in'>
      <IonList lines='none'>
        <IonListHeader>
          <IonText>
            <h1>Sign in</h1>
          </IonText>
        </IonListHeader>

        {error && (
          <IonItem>
            <IonNote color='danger' role='alert'>
              {error}
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
              <IonButton
                size='default'
                expand='block'
                type='submit'
                disabled={pendingUpdate}
                className='ion-padding-top ion-padding-bottom'
                aria-busy={pendingUpdate}
              >
                {pendingUpdate ? 'Signing in...' : 'Sign in'}
              </IonButton>
            </IonLabel>
          </IonItem>
        </form>

        <IonItem>
          <IonLabel className='ion-text-center'>
            <IonRouterLink href='/forgot-password'>Forgot Password?</IonRouterLink>
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel className='ion-text-center'>
            <IonRouterLink href={ROUTES.SIGNUP}>Don't have an account? Sign up here</IonRouterLink>
          </IonLabel>
        </IonItem>
      </IonList>
      <IonLoading isOpen={pendingUpdate} message={'Signing in...'} aria-label='Loading' />
    </PublicPageLayout>
  );
};

export default SigninPage;
