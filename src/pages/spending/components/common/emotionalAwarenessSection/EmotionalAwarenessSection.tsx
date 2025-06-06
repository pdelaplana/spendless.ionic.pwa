import type { SpendFormData } from '@/pages/spending/modals/spendModal';
import { StyledIonCard } from '@/styles/IonCard.styled';
import { IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/react';
import { useCallback, useMemo } from 'react';
import { type Control, type FieldValues, type UseFormSetValue, useWatch } from 'react-hook-form';
import { styled } from 'styled-components';

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

interface EmotionalAwarenessSectionProps<TFormValues extends FieldValues> {
  setValue: UseFormSetValue<TFormValues>;
  control: Control<TFormValues>;
}

const EmotionalAwarenessSection: React.FC<EmotionalAwarenessSectionProps<SpendFormData>> = ({
  setValue,
  control,
}) => {
  const emotionalState = useWatch({ name: 'emotionalState', control });

  const emotionSelectHandler = useCallback(
    (emotion: string) => setValue('emotionalState', emotion),
    [setValue],
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

  return (
    <StyledIonCard>
      <IonCardHeader>
        <IonCardTitle>🧠 Emotional Awareness</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <p>How were you feeling when you made this purchase?</p>
        <EmotionGrid>{emotionOptions}</EmotionGrid>
      </IonCardContent>
    </StyledIonCard>
  );
};

export default EmotionalAwarenessSection;
