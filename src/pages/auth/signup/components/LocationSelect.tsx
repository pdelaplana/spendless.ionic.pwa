import SelectFormField from '@/components/forms/fields/SelectFormField';
import type React from 'react';
import type {
  FieldError,
  FieldValues,
  Path,
  RegisterOptions,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form';

export interface LocationOption {
  value: string;
  label: string;
  currency: string;
}

export const LOCATION_OPTIONS: LocationOption[] = [
  { value: 'AU', label: 'Australia', currency: 'AUD' },
  { value: 'PH', label: 'Philippines', currency: 'PHP' },
];

interface LocationSelectProps<TFormValues extends FieldValues> {
  name: Path<TFormValues>;
  label: string;
  placeholder?: string;
  fill?: 'outline' | 'solid';
  register?: UseFormRegister<TFormValues>;
  setValue?: UseFormSetValue<TFormValues>;
  getValues?: UseFormGetValues<TFormValues>;
  validationRules?: RegisterOptions<TFormValues>;
  error?: FieldError;
}

export const LocationSelect = <TFormValues extends FieldValues>({
  name,
  label,
  placeholder,
  fill,
  register,
  setValue,
  getValues,
  validationRules,
  error,
}: LocationSelectProps<TFormValues>): React.ReactElement => {
  return (
    <SelectFormField
      name={name}
      label={label}
      placeholder={placeholder}
      fill={fill}
      register={register}
      setValue={setValue}
      getValues={getValues}
      validationRules={validationRules}
      error={error}
      optionsList={LOCATION_OPTIONS}
    />
  );
};

export default LocationSelect;
