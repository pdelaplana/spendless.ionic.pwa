import { IonText, IonTextarea } from '@ionic/react';
import type { ReactElement } from 'react';
import type {
  FieldError,
  FieldValues,
  Path,
  PathValue,
  RegisterOptions,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form';
import ValidationError from '../validation/ValidationError';

interface TextAreaFormFieldProps<TFormValues extends FieldValues> {
  name: Path<TFormValues>;
  label: string;
  placeholder?: string;
  register?: UseFormRegister<TFormValues>;
  setValue?: UseFormSetValue<TFormValues>;
  validationRules?: RegisterOptions<TFormValues>;
  error?: FieldError;
  fill?: 'outline' | 'solid';
}

const TextAreaFormField = <TFormValues extends FieldValues>({
  name,
  label,
  placeholder,
  register,
  setValue,
  validationRules,
  error,
  fill,
}: TextAreaFormFieldProps<TFormValues>): ReactElement => {
  return (
    <div>
      <IonTextarea
        placeholder={placeholder ?? label}
        label={label}
        labelPlacement='floating'
        autoGrow={true}
        rows={5}
        {...(fill ? { fill } : {})}
        {...(register ? register(name, validationRules) : {})}
        {...(setValue
          ? {
              onIonChange: (e) =>
                setValue(name, e.detail.value as PathValue<TFormValues, Path<TFormValues>>, {
                  shouldDirty: true,
                }),
            }
          : {})}
      />
      {error && (
        <IonText color='danger' className='ion-padding-start'>
          {error.message}
        </IonText>
      )}
      <ValidationError error={error} />
    </div>
  );
};

export default TextAreaFormField;
