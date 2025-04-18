import { IonSelect, IonSelectOption, IonText } from '@ionic/react';
import type {
  UseFormRegister,
  UseFormSetValue,
  FieldError,
  UseFormGetValues,
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
        {...(register ? register(name, validationRules) : {})}
        labelPlacement='floating'
        label={label}
        interface='popover'
        placeholder={placeholder ?? label}
        {...(fill ? { fill } : {})}
        {...(getValues
          ? {
              value: getValues(name),
            }
          : {})}
        {...(setValue
          ? {
              onIonChange: (e) => setValue(name, e.detail.value, { shouldDirty: true }),
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
