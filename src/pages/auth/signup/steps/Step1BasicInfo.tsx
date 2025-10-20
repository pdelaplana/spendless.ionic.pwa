import InputFormField from '@/components/forms/fields/InputFormField';
import { ActionButton } from '@/components/shared';
import { IonItem, IonLabel, IonList } from '@ionic/react';
import type React from 'react';
import type {
  FieldError,
  FieldErrors,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form';
import LocationSelect from '../components/LocationSelect';

export interface SignupFormData {
  email: string;
  name: string;
  location: string;
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
}

export const Step1BasicInfo: React.FC<Step1BasicInfoProps> = ({
  register,
  errors,
  setValue,
  getValues,
  onNext,
  isValid,
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
          <LocationSelect<Step1FormData>
            name='location'
            label='Location'
            fill='outline'
            register={register}
            setValue={setValue}
            getValues={getValues}
            error={errors.location as FieldError | undefined}
            validationRules={{
              required: 'Location is required',
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
            isDisabled={!isValid}
          />
        </IonLabel>
      </IonItem>
    </IonList>
  );
};

export default Step1BasicInfo;
