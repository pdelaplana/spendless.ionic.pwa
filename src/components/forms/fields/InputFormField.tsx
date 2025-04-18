import type { IonInputCustomEvent } from '@ionic/core';
import { IonInput, IonText } from '@ionic/react';
import ValidationError from './../validation/ValidationError';
import type {
  FieldError,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
  FieldValues,
  Path,
  RegisterOptions,
  PathValue,
} from 'react-hook-form';
import type { ReactElement } from 'react';

interface InputFormFieldProps<TFormValues extends FieldValues> {
  name: Path<TFormValues>;
  label: string;
  placeholder?: string;
  readonly?: boolean;
  fill?: 'outline' | 'solid';
  register?: UseFormRegister<TFormValues>;
  setValue?: UseFormSetValue<TFormValues>;
  getValues?: UseFormGetValues<TFormValues>;
  validationRules?: RegisterOptions<TFormValues>;
  error?: FieldError;
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'date';
  onChange?: (e: IonInputCustomEvent<string | undefined | null>) => void;
  transformValue?: (value: string) => string;
}

export const InputFormField = <TFormValues extends FieldValues>({
  name,
  label,
  placeholder,
  fill,
  register,
  setValue,
  getValues,
  validationRules,
  error,
  type = 'text',
  readonly = false,
  transformValue,
}: InputFormFieldProps<TFormValues>): ReactElement => {
  return (
    <div>
      <IonInput
        placeholder={placeholder ?? label}
        label={label}
        labelPlacement='floating'
        type={type}
        readonly={readonly}
        {...(fill ? { fill } : {})}
        {...(getValues ? { value: getValues(name) } : {})}
        {...(transformValue && getValues
          ? { value: transformValue(getValues(name)?.toString() ?? '') }
          : {})}
        {...(register ? register(name, validationRules) : {})}
        {...(setValue
          ? {
              onIonChange: (e) => {
                setValue(name, e.detail.value as PathValue<TFormValues, Path<TFormValues>>, {
                  shouldDirty: true,
                });
              },
            }
          : {})}
      />
      {error && (
        <IonText color='danger' className='ion-padding-start'>
          {error.message}
        </IonText>
      )}
    </div>
  );
};

export default InputFormField;
