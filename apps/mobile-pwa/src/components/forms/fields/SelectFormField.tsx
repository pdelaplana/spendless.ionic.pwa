import { IonSelect, IonSelectOption, IonText } from '@ionic/react';
import type {
  FieldError,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form';

type SelectOption = { label: string; value: string };

interface SelectFormFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  readonly?: boolean;
  fill?: 'outline' | 'solid';
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  register?: UseFormRegister<any>;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  setValue?: UseFormSetValue<any>;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  getValues?: UseFormGetValues<any>;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  validationRules?: any;
  error?: FieldError;
  onChange?: (e: CustomEvent) => void;
  optionsList: SelectOption[];
}

const SelectFormField: React.FC<SelectFormFieldProps> = ({
  name,
  label,
  placeholder,
  fill,
  register,
  getValues,
  setValue,
  validationRules,
  error,
  readonly = false,
  onChange,
  optionsList,
}) => {
  return (
    <div>
      <IonSelect
        placeholder={placeholder ?? label}
        label={label}
        labelPlacement='floating'
        interface='popover'
        disabled={readonly}
        {...(fill ? { fill } : {})}
        {...(getValues ? { value: getValues(name) } : {})}
        {...(register ? register(name, validationRules) : {})}
        {...(setValue
          ? {
              onIonChange: (e) => {
                setValue(name, e.detail.value, { shouldDirty: true });
                if (onChange) {
                  onChange(e);
                }
              },
            }
          : onChange
            ? {
                onIonChange: onChange,
              }
            : {})}
      >
        {optionsList?.map((option) => (
          <IonSelectOption key={option.value} value={option.value}>
            {option.label}
          </IonSelectOption>
        ))}
      </IonSelect>
      {error && (
        <IonText color='danger' className='ion-padding-start'>
          {error.message}
        </IonText>
      )}
    </div>
  );
};

export default SelectFormField;
