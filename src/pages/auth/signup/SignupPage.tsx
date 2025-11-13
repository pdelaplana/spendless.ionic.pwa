import { StyledIonCard } from '@/components/ui';
import { useAppNotifications } from '@/hooks/ui';
import { ROUTES } from '@/routes/routes.constants';
import AuthPageLayout from '@components/layouts/AuthPageLayout';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCardContent,
  IonIcon,
  useIonRouter,
} from '@ionic/react';
import { useAuth } from '@providers/auth/useAuth';
import { arrowBack } from 'ionicons/icons';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Step1BasicInfo, { type SignupFormData } from './steps/Step1BasicInfo';
import Step2Password from './steps/Step2Password';
import Step3Welcome from './steps/Step3Welcome';

const Container = styled.div`
  padding: 2rem 1rem;
  max-width: 500px;
  margin: 0 auto;
`;

const BackButton = styled.div`
  margin-bottom: 1rem;
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

const SignupPage: React.FC = () => {
  const { t } = useTranslation();
  const { signup, signInWithGoogle, isSigningInWithGoogle } = useAuth();
  const { showErrorNotification } = useAppNotifications();
  const [currentStep, setCurrentStep] = useState(1);
  const { push } = useIonRouter();

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting, isValid },
    setValue,
    getValues,
  } = useForm<SignupFormData>({
    mode: 'onChange',
  });

  const password = watch('password', '');
  const name = watch('name', '');

  const handleStep1Next = async () => {
    const isStep1Valid = await trigger(['email', 'name']);
    if (isStep1Valid) {
      setCurrentStep(2);
    }
  };

  const handleStep2Back = () => {
    setCurrentStep(1);
  };

  const handleStep2Submit = handleSubmit(async (formData) => {
    try {
      // Password is guaranteed to be set at this point since Step 2 validates it
      const userCredential = await signup(
        formData.email,
        formData.password as string,
        formData.name,
      );

      if (userCredential?.user) {
        setCurrentStep(3);
      }
    } catch (e) {
      showErrorNotification(t('server.errors.auth.auth/email-already-in-use'));
      console.error('Signup error:', e);
    }
  });

  const handleGoogleSignIn = async () => {
    try {
      const userCredential = await signInWithGoogle();
      if (userCredential?.user) {
        // Show welcome step with the user's display name from Google
        setValue('name', userCredential.user.displayName || 'there');
        setCurrentStep(3);
      }
    } catch (e) {
      showErrorNotification(t('common.errors.signinFailed'));
      console.error('Google sign-in error:', e);
    }
  };

  // Check if step 1 fields are valid
  const isStep1Valid = !errors.email && !errors.name && watch('email') && watch('name');

  // Check if step 2 fields are valid - must meet all password requirements
  const isStep2Valid =
    !errors.password &&
    (password?.length ?? 0) >= 6 &&
    /[A-Z]/.test(password ?? '') &&
    /[a-z]/.test(password ?? '') &&
    /[0-9]/.test(password ?? '') &&
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password ?? '');

  return (
    <AuthPageLayout title='Sign up'>
      {currentStep < 3 && (
        <Container>
          <BackButton>
            <IonButtons>
              {currentStep === 1 && <IonBackButton defaultHref={ROUTES.START} text='' />}
              {currentStep === 2 && (
                <IonButton fill='clear' onClick={handleStep2Back}>
                  <IonIcon slot='icon-only' icon={arrowBack} />
                </IonButton>
              )}
            </IonButtons>
          </BackButton>

          <Header>
            {currentStep === 1 && (
              <>
                <Title>Let's get started</Title>
                <Subtitle>We need some basic information</Subtitle>
              </>
            )}

            {currentStep === 2 && (
              <>
                <Title>Let's protect your account</Title>
                <Subtitle>Enter a password</Subtitle>
              </>
            )}
          </Header>

          <StyledIonCard>
            <IonCardContent>
              {currentStep === 1 && (
                <Step1BasicInfo
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  getValues={getValues}
                  onNext={handleStep1Next}
                  isValid={!!isStep1Valid}
                  onGoogleSignIn={handleGoogleSignIn}
                  isSigningInWithGoogle={isSigningInWithGoogle}
                />
              )}

              {currentStep === 2 && (
                <Step2Password
                  register={register}
                  errors={errors}
                  password={password}
                  onBack={handleStep2Back}
                  onSubmit={handleStep2Submit}
                  isSubmitting={isSubmitting}
                  isValid={!!isStep2Valid}
                />
              )}
            </IonCardContent>
          </StyledIonCard>
        </Container>
      )}

      {currentStep === 3 && <Step3Welcome name={name} />}
    </AuthPageLayout>
  );
};

export default SignupPage;
