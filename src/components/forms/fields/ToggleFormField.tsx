import { IonText, IonToggle } from '@ionic/react';
import type {
  FieldError,
  FieldValues,
  Path,
  PathValue,
  RegisterOptions,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form';

interface ToggleFormFieldProps<TFormValues extends FieldValues> {
  name: Path<TFormValues>;
  label: string;
  placeholder?: string;
  register?: UseFormRegister<TFormValues>;
  setValue?: UseFormSetValue<TFormValues>;
  getValues?: UseFormGetValues<TFormValues>;
  validationRules?: RegisterOptions<TFormValues>;
  error?: FieldError;
  fill?: 'outline' | 'solid';
}

const ToggleFormField = <TFormValues extends FieldValues>({
  name,
  label,
  register,
  setValue,
  getValues,
  validationRules,
  error,
  fill,
}: ToggleFormFieldProps<TFormValues>) => {
  return (
    <div>
      <IonToggle
        {...(fill ? { fill } : {})}
        {...(register ? register(name, validationRules) : {})}
        {...(setValue
          ? {
              onIonChange: (e) =>
                setValue(name, e.detail.checked as PathValue<TFormValues, Path<TFormValues>>, {
                  shouldDirty: true,
                }),
            }
          : {})}
        {...(getValues
          ? {
              checked: getValues(name),
            }
          : {})}
      >
        {label}
      </IonToggle>
      {error && (
        <IonText color='danger' className='ion-padding-start'>
          {error.message}
        </IonText>
      )}
    </div>
  );
};
export default ToggleFormField;
