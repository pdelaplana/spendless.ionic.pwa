import { InputFormField } from '@/components/forms';
import TextAreaFormField from '@/components/forms/fields/TextAreaFormField';
import ToggleFormField from '@/components/forms/fields/ToggleFormField';
import NiceTags from '@/components/shared/tags/NiceTags';
import { spendValidation } from '@/domain/validation';
import type { SpendFormData } from '@/pages/spending/modals/spendModal';
import { StyledIonCard } from '@/styles/IonCard.styled';
import {
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonList,
} from '@ionic/react';
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

  return (
    <StyledIonCard>
      <IonCardHeader>
        <IonCardTitle>💸 {t('spending.modal.details.title')}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent className='ion-padding'>
        <IonList lines='none' className='ion-no-padding ion-no-margin'>
          <IonItem>
            <IonLabel>
              <InputFormField
                label='Date'
                name='date'
                type='date'
                placeholder='Enter date'
                register={register}
                error={errors.date}
                fill='outline'
                validationRules={spendValidation.date as RegisterOptions<SpendFormData>}
              />
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>
              <InputFormField
                label='What did you spend on?'
                name='description'
                placeholder='Describe your purchase'
                register={register}
                error={errors.description}
                fill='outline'
                validationRules={spendValidation.description as RegisterOptions<SpendFormData>}
              />
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <InputFormField
                label='Amount'
                name='amount'
                type='number'
                placeholder='Enter amount'
                register={register}
                error={errors.amount}
                fill='outline'
                validationRules={spendValidation.amount as RegisterOptions<SpendFormData>}
              />
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <NiceTags
                initialTags={initialTags}
                suggestions={suggestedTags}
                onTagsChange={(tags: string[]) => {
                  setValue('tags', tags, { shouldDirty: true });
                }}
              />
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <TextAreaFormField
                label='Additional notes'
                name='notes'
                placeholder='Any extra thoughts or notes?'
                register={register}
                error={errors.notes}
                fill='outline'
                validationRules={spendValidation.notes as RegisterOptions<SpendFormData>}
              />
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <ToggleFormField
                name='recurring'
                label='Copy to Next Period'
                register={register}
                setValue={setValue}
                getValues={getValues}
                error={errors.recurring}
              />
            </IonLabel>
          </IonItem>
        </IonList>
      </IonCardContent>
    </StyledIonCard>
  );
};
export default SpendFormSection;
