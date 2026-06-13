import TextAreaFormField from '@/components/forms/fields/TextAreaFormField';
import { spendValidation } from '@/domain/validation';
import type { SpendFormData } from '@/pages/spending/modals/spendModal';
import { StyledIonCard } from '@/styles/IonCard.styled';
import { IonCardContent, IonCardHeader, IonCardTitle, IonIcon } from '@ionic/react';
import { add } from 'ionicons/icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
    border-color: var(--ion-color-primary);
    background: var(--ion-color-primary-tiny, rgba(var(--ion-color-primary-rgb), 0.1));
    color: var(--ion-color-primary);
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
  background: ${(props) => (props.selected ? 'var(--ion-color-primary)' : '#f1f3f5')};
  color: ${(props) => (props.selected ? 'var(--ion-color-primary-contrast, white)' : '#495057')};
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${(props) => (props.selected ? 'var(--ion-color-primary)' : 'transparent')};

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
  customContexts?: Record<string, string[]>;
  onAddCustomContext?: (mood: string, context: string) => Promise<void>;
}

const EmotionalAwarenessSection: React.FC<EmotionalAwarenessSectionProps<SpendFormData>> = ({
  setValue,
  getValues,
  control,
  register,
  errors,
  customContexts,
  onAddCustomContext,
}) => {
  const emotionalState = (useWatch({ name: 'emotionalState', control }) as string)?.toLowerCase();
  const emotionalContext = (useWatch({ name: 'emotionalContext', control }) || []) as string[];
  const [isAddingContext, setIsAddingContext] = useState(false);
  const [newContext, setNewContext] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAddingContext && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddingContext]);

  const isEmotionSelected = useCallback(
    (emotion: string) => emotionalState === emotion.toLowerCase(),
    [emotionalState],
  );

  const isContextSelected = useCallback(
    (context: string) => emotionalContext?.includes(context),
    [emotionalContext],
  );

  const emotionSelectHandler = useCallback(
    (emotion: string) => {
      setValue('emotionalState', emotion, { shouldDirty: true });
    },
    [setValue],
  );

  const toggleContextHandler = useCallback(
    (context: string) => {
      const current = emotionalContext || [];
      const currentNotes = (getValues('notes') || '') as string;

      let nextContexts: string[];
      let nextNotes: string;

      if (isContextSelected(context)) {
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
    [emotionalContext, setValue, getValues, isContextSelected],
  );

  const handleAddContext = useCallback(async () => {
    if (newContext.trim() && emotionalState && onAddCustomContext) {
      await onAddCustomContext(emotionalState, newContext.trim());
      toggleContextHandler(newContext.trim());
      setNewContext('');
      setIsAddingContext(false);
    }
  }, [newContext, emotionalState, onAddCustomContext, toggleContextHandler]);

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
        selected={isEmotionSelected(item.value)}
        onClick={() => emotionSelectHandler(item.value)}
      >
        <span className='emotion-icon'>{item.icon}</span>
        <span>{item.label}</span>
      </EmotionOption>
    ));
  }, [isEmotionSelected, emotionSelectHandler]);

  const contextOptions = useMemo(() => {
    if (!emotionalState) return null;

    const defaultContexts = MOOD_CONTEXTS[emotionalState] || [];
    const customMoodContexts = customContexts?.[emotionalState] || [];
    // Combine and remove duplicates
    const allContexts = Array.from(new Set([...defaultContexts, ...customMoodContexts]));

    if (allContexts.length === 0 && !onAddCustomContext) return null;

    return (
      <ContextContainer>
        {allContexts.map((ctx) => (
          <ContextChip
            key={ctx}
            selected={isContextSelected(ctx)}
            onClick={() => toggleContextHandler(ctx)}
          >
            {ctx}
          </ContextChip>
        ))}
        {onAddCustomContext && !isAddingContext && (
          <ContextChip onClick={() => setIsAddingContext(true)} style={{ opacity: 0.7 }}>
            <IonIcon icon={add} />
          </ContextChip>
        )}
        {isAddingContext && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type='text'
              ref={inputRef}
              value={newContext}
              onChange={(e) => setNewContext(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddContext();
                }
              }}
              onBlur={() => {
                if (!newContext.trim()) setIsAddingContext(false);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: '1px solid var(--ion-color-primary)',
                outline: 'none',
                fontSize: '11px',
                width: '120px',
              }}
              placeholder='Add context...'
            />
            <ContextChip onClick={handleAddContext} selected>
              Add
            </ContextChip>
          </div>
        )}
      </ContextContainer>
    );
  }, [
    emotionalState,
    isContextSelected,
    toggleContextHandler,
    customContexts,
    onAddCustomContext,
    isAddingContext,
    newContext,
    handleAddContext,
  ]);

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
