import type React from 'react';
import {
  IonButton,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonLoading,
  IonNote,
  IonRouterLink,
  IonText,
  useIonRouter,
} from '@ionic/react';
import { useAuth } from '@providers/auth/useAuth';
import { useForm, type SubmitHandler } from 'react-hook-form';
import PublicPageLayout from '@components/layouts/PublicPageLayout';
import InputFormField from '@/components/forms/fields/InputFormField';
import { ROUTES } from '@/routes/routes.constants';
import { useAppNotifications } from '@/hooks/ui';
import { useCreateAccount } from '@/hooks/api';

interface ISignupForm {
  email: string;
  password: string;
  confirmPassword: string;
}

const SignupPage: React.FC = () => {
  const { signup, pendingUpdate, error } = useAuth();
  const { showErrorNotification } = useAppNotifications();
  const createAccount = useCreateAccount();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<ISignupForm>();

  const password = watch('password');
  const { push } = useIonRouter();

  const onSubmit: SubmitHandler<ISignupForm> = async (formData) => {
    try {
      const userCredential = await signup(formData.email, formData.password);
      if (userCredential?.user) {
        try {
          await createAccount.mutateAsync({
            userId: userCredential.user.uid,
            spendingLimit: 0,
            name: '',
            currency: '',
          });
          push(ROUTES.HOME);
        } catch (error) {
          console.error('Error creating account:', error);
          showErrorNotification('Failed to create account. Please try again.');
        }
      }
    } catch (e) {
      // Error will be handled by useAuth
    }
  };

  return (
    <PublicPageLayout title='Sign up'>
      <IonList lines='none'>
        <IonListHeader>
          <IonText>
            <h1>Sign up</h1>
          </IonText>
        </IonListHeader>

        {error && (
          <IonItem>
            <IonNote color='danger' role='alert'>
              {error}
            </IonNote>
          </IonItem>
        )}

        <form onSubmit={handleSubmit(onSubmit)} aria-label='Sign up form'>
          <IonItem>
            <IonLabel>
              <InputFormField<ISignupForm>
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
              <InputFormField<ISignupForm>
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
              <InputFormField<ISignupForm>
                name='confirmPassword'
                label='Confirm Password'
                type='password'
                fill='outline'
                register={register}
                error={errors.confirmPassword}
                validationRules={{
                  required: 'Please confirm your password',
                  validate: (value: string) => value === password || 'Passwords do not match',
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
                {pendingUpdate ? 'Creating account...' : 'Create Account'}
              </IonButton>
            </IonLabel>
          </IonItem>
        </form>

        <IonItem>
          <IonLabel className='ion-text-center'>
            <IonRouterLink href='/signin'>Already have an account? Sign in here</IonRouterLink>
          </IonLabel>
        </IonItem>
      </IonList>
      <IonLoading
        isOpen={pendingUpdate}
        message={'Creating your account...'}
        aria-label='Loading'
      />
    </PublicPageLayout>
  );
};

export default SignupPage;
