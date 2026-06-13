import { InputFormField } from '@/components/forms';
import TextAreaFormField from '@/components/forms/fields/TextAreaFormField';
import ToggleFormField from '@/components/forms/fields/ToggleFormField';
import NiceTags from '@/components/shared/tags/NiceTags';
import { spendValidation } from '@/domain/validation';
import type { SpendFormData } from '@/pages/spending/modals/spendModal';
import { TransparentIonList } from '@/styles/IonList.styled';
import { IonItem, IonLabel } from '@ionic/react';
import { useCallback } from 'react';
import {
  type Control,
  type FieldErrors,
  type FieldValues,
  type RegisterOptions,
  type UseFormGetValues,
  type UseFormRegister,
  type UseFormSetValue,
  useWatch,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface SpendFormSectionProps<TFormValues extends FieldValues> {
  register: UseFormRegister<TFormValues>;
  setValue: UseFormSetValue<TFormValues>;
  getValues: UseFormGetValues<TFormValues>;
  errors: FieldErrors<TFormValues>;
  suggestedTags?: string[];
  control: Control<TFormValues>;
}

const SpendFormSection: React.FC<SpendFormSectionProps<SpendFormData>> = ({
  register,
  setValue,
  getValues,
  control,
  errors,
  suggestedTags,
}) => {
  const { t } = useTranslation();

  const initialTags = useWatch({ name: 'tags', control });

  const handleTagsChange = useCallback(
    (tags: string[]) => {
      setValue('tags', tags, { shouldDirty: true });
    },
    [setValue],
  );

  return (
    <TransparentIonList lines='none' className='ion-no-padding ion-no-margin'>
      <IonItem>
        <IonLabel>
          <NiceTags
            initialTags={initialTags}
            suggestions={suggestedTags}
            onTagsChange={handleTagsChange}
          />
        </IonLabel>
      </IonItem>
    </TransparentIonList>
  );
};
export default SpendFormSection;
