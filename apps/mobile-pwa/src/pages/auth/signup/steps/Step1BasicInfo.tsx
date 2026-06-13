import InputFormField from '@/components/forms/fields/InputFormField';
import { ActionButton } from '@/components/shared';
import { IonIcon, IonItem, IonLabel, IonList } from '@ionic/react';
import { logoGoogle } from 'ionicons/icons';
import type React from 'react';
import type {
  FieldError,
  FieldErrors,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form';
import styled from 'styled-components';

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

export interface SignupFormData {
  email: string;
  name: string;
  password?: string;
}

export type Step1FormData = SignupFormData;

interface Step1BasicInfoProps {
  register: UseFormRegister<Step1FormData>;
  errors: FieldErrors<Step1FormData>;
  setValue: UseFormSetValue<Step1FormData>;
  getValues: UseFormGetValues<Step1FormData>;
  onNext: () => void;
  isValid: boolean;
  onGoogleSignIn: () => void;
  isSigningInWithGoogle: boolean;
}

export const Step1BasicInfo: React.FC<Step1BasicInfoProps> = ({
  register,
  errors,
  setValue,
  getValues,
  onNext,
  isValid,
  onGoogleSignIn,
  isSigningInWithGoogle,
}) => {
  return (
    <IonList lines='none'>
      <IonItem>
        <IonLabel>
          <InputFormField<Step1FormData>
            name='email'
            label='Email'
            type='email'
            fill='outline'
            register={register}
            error={errors.email as FieldError | undefined}
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
          <InputFormField<Step1FormData>
            name='name'
            label='Name'
            type='text'
            fill='outline'
            register={register}
            error={errors.name as FieldError | undefined}
            validationRules={{
              required: 'Name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters',
              },
            }}
          />
        </IonLabel>
      </IonItem>

      <IonItem>
        <IonLabel>
          <ActionButton
            size='default'
            label='Continue'
            expand='block'
            onClick={onNext}
            className='ion-padding-top ion-padding-bottom'
            isLoading={false}
            isDisabled={!isValid || isSigningInWithGoogle}
          />
        </IonLabel>
      </IonItem>

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
            onClick={onGoogleSignIn}
            isLoading={isSigningInWithGoogle}
            isDisabled={isSigningInWithGoogle}
          >
            <IonIcon slot='start' icon={logoGoogle} />
          </ActionButton>
        </IonLabel>
      </IonItem>
    </IonList>
  );
};

export default Step1BasicInfo;
