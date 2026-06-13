import TextAreaFormField from '@/components/forms/fields/TextAreaFormField';
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
import { useEffect } from 'react';
import {
  type Control,
  type FieldValues,
  type UseFormRegister,
  type UseFormSetValue,
  useFieldArray,
} from 'react-hook-form';

interface PersonalReflectionSectionProps<TFormValues extends FieldValues> {
  register?: UseFormRegister<TFormValues>;
  setValue: UseFormSetValue<TFormValues>;
  control: Control<TFormValues>;
}
const PersonalReflectionSection: React.FC<PersonalReflectionSectionProps<SpendFormData>> = ({
  register,
  setValue,
  control,
}) => {
  const { fields, replace } = useFieldArray({
    control,
    name: 'personalReflections',
  });

  // Define our predefined questions
  const predefinedQuestions = [
    {
      question: 'What motivated this purchase?',
      placeholder: 'I bought this because...',
    },
    {
      question: 'How do you feel about it now?',
      placeholder: 'Looking back, I feel...',
    },
    {
      question: 'What would you do differently next time?',
      placeholder: 'Next time I might...',
    },
  ];

  // Set up predefined questions on component mount
  useEffect(() => {
    if (!fields || fields.length === 0) {
      // Initialize with predefined questions and empty answers
      const initialReflections = predefinedQuestions.map((item) => ({
        question: item.question,
        answer: '',
      }));

      replace(initialReflections);
    }
  }, [fields, replace]);

  return (
    <StyledIonCard>
      <IonCardHeader>
        <IonCardTitle>📝 Personal Reflection</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <p>
          Before you finalize your spending, take a moment to reflect on its purpose and impact.
          This helps ensure your choices align with your values and financial goals.
        </p>
        <IonList lines='none'>
          {fields.map((field, index) => (
            <IonItem key={field.id}>
              <IonLabel>
                <TextAreaFormField
                  register={register}
                  name={`personalReflections.${index}.answer`}
                  label={field.question as string}
                  placeholder={predefinedQuestions[index]?.placeholder || ''}
                  fill='outline'
                  setValue={setValue}
                />
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonCardContent>
    </StyledIonCard>
  );
};
export default PersonalReflectionSection;
