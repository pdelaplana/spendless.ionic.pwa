import TextAreaFormField from '@/components/forms/fields/TextAreaFormField';
import { spendValidation } from '@/domain/validation';
import type { SpendFormData } from '@/pages/spending/modals/spendModal';
import { StyledIonCard } from '@/styles/IonCard.styled';
import { IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/react';
import { useCallback, useMemo } from 'react';
import {
  type Control,
  type FieldErrors,
  type FieldValues,
  type UseFormGetValues,
  type UseFormRegister,
  type UseFormSetValue,
  useWatch,
} from 'react-hook-form';
import { styled } from 'styled-components';
import { MOOD_CONTEXTS } from './emotionalContexts';

const EmotionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 8px;
`;

const EmotionOption = styled.div<{ selected?: boolean }>`
  padding: 12px 8px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  /*
  &:hover {
    transform: scale(1.05);
    background-color: var(--ion-color-primary);
    color: white;
  }
  */
  .emotion-icon {
    font-size: 20px;
  }

  ${(props) =>
    props.selected &&
    `
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
  `}

`;

const ContextContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const ContextChip = styled.div<{ selected?: boolean }>`
  padding: 6px 12px;
  border-radius: 20px;
  background: ${(props) => (props.selected ? '#667eea' : '#f1f3f5')};
  color: ${(props) => (props.selected ? 'white' : '#495057')};
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${(props) => (props.selected ? '#667eea' : 'transparent')};

  &:active {
    transform: scale(0.95);
  }
`;

interface EmotionalAwarenessSectionProps<TFormValues extends FieldValues> {
  setValue: UseFormSetValue<TFormValues>;
  getValues: UseFormGetValues<TFormValues>;
  control: Control<TFormValues>;
  register: UseFormRegister<TFormValues>;
  errors: FieldErrors<TFormValues>;
}

const EmotionalAwarenessSection: React.FC<EmotionalAwarenessSectionProps<SpendFormData>> = ({
  setValue,
  getValues,
  control,
  register,
  errors,
}) => {
  const emotionalState = useWatch({ name: 'emotionalState', control }) as string;
  const emotionalContext = (useWatch({ name: 'emotionalContext', control }) || []) as string[];

  const emotionSelectHandler = useCallback(
    (emotion: string) => {
      setValue('emotionalState', emotion, { shouldDirty: true });
      // Clear context when switching moods if the current context doesn't belong to the new mood?
      // Actually, better to keep it if it's generic, but let's clear it for simplicity or keep it if it matches.
      // For now, let's just keep it and let the user toggle.
      // setValue('emotionalContext', [] as any, { shouldDirty: true });
    },
    [setValue],
  );

  const toggleContextHandler = useCallback(
    (context: string) => {
      const current = emotionalContext || [];
      const currentNotes = (getValues('notes') || '') as string;

      let nextContexts: string[];
      let nextNotes: string;

      if (current.includes(context)) {
        nextContexts = current.filter((c) => c !== context);
        // Remove from notes
        const escaped = context.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\s*${escaped}`, 'g');
        nextNotes = currentNotes.replace(regex, '').trim();
      } else {
        nextContexts = [...current, context];
        // Append to notes
        nextNotes = currentNotes ? `${currentNotes.trim()} ${context}` : context;
      }

      setValue('emotionalContext', nextContexts, { shouldDirty: true });
      setValue('notes', nextNotes, { shouldDirty: true });
    },
    [emotionalContext, setValue, getValues],
  );

  const emotionOptions = useMemo(() => {
    return [
      { value: 'happy', label: 'Happy', icon: '😊' },
      { value: 'stressed', label: 'Stressed', icon: '😰' },
      { value: 'tired', label: 'Tired', icon: '😴' },
      { value: 'sad', label: 'Sad', icon: '😔' },
      { value: 'angry', label: 'Angry', icon: '😡' },
      { value: 'neutral', label: 'Neutral', icon: '😐' },
    ].map((item) => (
      <EmotionOption
        key={item.label}
        selected={item.value === emotionalState}
        onClick={() => emotionSelectHandler(item.value)}
      >
        <span className='emotion-icon'>{item.icon}</span>
        <span>{item.label}</span>
      </EmotionOption>
    ));
  }, [emotionalState, emotionSelectHandler]);

  const contextOptions = useMemo(() => {
    if (!emotionalState || !MOOD_CONTEXTS[emotionalState]) return null;

    return (
      <ContextContainer>
        {MOOD_CONTEXTS[emotionalState].map((ctx) => (
          <ContextChip
            key={ctx}
            selected={emotionalContext.includes(ctx)}
            onClick={() => toggleContextHandler(ctx)}
          >
            {ctx}
          </ContextChip>
        ))}
      </ContextContainer>
    );
  }, [emotionalState, emotionalContext, toggleContextHandler]);

  return (
    <StyledIonCard>
      <IonCardHeader>
        <IonCardTitle>🧠 Mood</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <p>How were you feeling when you made this purchase?</p>
        <EmotionGrid>{emotionOptions}</EmotionGrid>

        <div style={{ marginTop: '20px' }}>
          <TextAreaFormField
            label='Is there a reason for how you felt?'
            name='notes'
            placeholder='Any thoughts or reflections?'
            register={register}
            error={errors.notes}
            fill='outline'
            validationRules={spendValidation.notes}
          />
        </div>
        {contextOptions}
      </IonCardContent>
    </StyledIonCard>
  );
};

export default EmotionalAwarenessSection;
