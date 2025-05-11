import type React from 'react';
import styled from '@emotion/styled';
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
import { useForm, type SubmitHandler } from 'react-hook-form';
import PublicPageLayout from '@components/layouts/PublicPageLayout';
import InputFormField from '@/components/forms/fields/InputFormField';
import { ROUTES } from '@/routes/routes.constants';
import { useAppNotifications } from '@/hooks/ui';
import { useCreateAccount } from '@/hooks/api';
import { ActionButton, Gap } from '@/components/shared';
import { useTranslation } from 'react-i18next';

const StyledIonCard = styled(IonCard)`
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

interface ISignupForm {
  email: string;
  password: string;
  confirmPassword: string;
}

const SignupPage: React.FC = () => {
  const { t } = useTranslation();
  const { signup, authStateLoading, error } = useAuth();
  const { showErrorNotification } = useAppNotifications();
  const createAccount = useCreateAccount();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty },
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
            data: {
              name: userCredential.user.displayName || userCredential.user.email || '',
              currency: '',
            },
          });
          push(ROUTES.ROOT);
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
      <Gap size='.65rem' />
      <StyledIonCard>
        <IonCardHeader>
          <IonCardTitle className='ion-margin'>
            <IonText>Sign up for a Spendless account</IonText>
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonList lines='none'>
            {error && (
              <IonItem>
                <IonNote color='danger' role='alert'>
                  {t(`server.errors.auth.${error}`)}
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
                  <ActionButton
                    size='default'
                    label='Create Account'
                    expand='block'
                    type='submit'
                    className='ion-padding-top ion-padding-bottom'
                    aria-busy={isSubmitting}
                    isLoading={isSubmitting}
                    isDisabled={!isDirty || isSubmitting}
                  />
                </IonLabel>
              </IonItem>
            </form>

            <IonItem>
              <IonLabel className='ion-text-center'>
                <IonRouterLink href='/signin'>Already have an account? Sign in here</IonRouterLink>
              </IonLabel>
            </IonItem>
          </IonList>
        </IonCardContent>
      </StyledIonCard>
    </PublicPageLayout>
  );
};

export default SignupPage;
