import InputFormField from '@/components/forms/fields/InputFormField';
import { ActionButton } from '@/components/shared';
import { IonItem, IonLabel, IonList } from '@ionic/react';
import type React from 'react';
import type { FieldError, FieldErrors, UseFormRegister } from 'react-hook-form';
import PasswordRequirements from '../components/PasswordRequirements';

export interface SignupFormData {
  email: string;
  name: string;
  password?: string;
}

export type Step2FormData = SignupFormData;

interface Step2PasswordProps {
  register: UseFormRegister<Step2FormData>;
  errors: FieldErrors<Step2FormData>;
  password?: string;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isValid: boolean;
}

export const Step2Password: React.FC<Step2PasswordProps> = ({
  register,
  errors,
  password,
  onBack,
  onSubmit,
  isSubmitting,
  isValid,
}) => {
  return (
    <>
      <IonList lines='none'>
        <IonItem>
          <IonLabel>
            <InputFormField<Step2FormData>
              name='password'
              label='Password'
              type='password'
              fill='outline'
              register={register}
              error={errors.password as FieldError | undefined}
              validationRules={{
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters long',
                },
                maxLength: {
                  value: 4096,
                  message: 'Password must not exceed 4096 characters',
                },
                validate: {
                  hasUppercase: (value) =>
                    /[A-Z]/.test(value ?? '') || 'Password must contain an uppercase letter',
                  hasLowercase: (value) =>
                    /[a-z]/.test(value ?? '') || 'Password must contain a lowercase letter',
                  hasNumber: (value) =>
                    /[0-9]/.test(value ?? '') || 'Password must contain a number',
                  hasSpecialChar: (value) =>
                    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(value ?? '') ||
                    'Password must contain a special character',
                },
              }}
            />
          </IonLabel>
        </IonItem>

        <IonItem>
          <IonLabel>
            <PasswordRequirements password={password ?? ''} />
          </IonLabel>
        </IonItem>

        <IonItem>
          <IonLabel>
            <ActionButton
              size='default'
              label='Continue'
              expand='block'
              onClick={onSubmit}
              className='ion-padding-top ion-padding-bottom'
              isLoading={isSubmitting}
              isDisabled={!isValid || isSubmitting}
            />
          </IonLabel>
        </IonItem>
      </IonList>
    </>
  );
};

export default Step2Password;
