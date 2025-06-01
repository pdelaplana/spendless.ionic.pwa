import type { SpendFormData } from '@/pages/spending/modals/SpendModal';
import { StyledIonCard } from '@/styles/IonCard.styled';
import { IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/react';
import { useCallback, useMemo } from 'react';
import { type Control, type FieldValues, type UseFormSetValue, useWatch } from 'react-hook-form';
import { styled } from 'styled-components';

const RatingScale = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
`;

const RatingOption = styled.div<{ selected?: boolean }>`
  width: 15%;  /* Changed from fixed 40px to relative 15% */
  aspect-ratio: 1;  /* This maintains a square shape */
  border: 2px solid #e9ecef;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #7f8c8d;
  transition: all 0.3s ease;
  font-size: clamp(14px, 2.5vw, 20px);  /* Responsive font size */

  ${(props) =>
    props.selected &&
    `
    border-color: #667eea;
    background: #667eea;
    color: white;
  `}
`;

const RatingLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #7f8c8d;
`;

interface RatingSectionProps<TFormValues extends FieldValues> {
  setValue: UseFormSetValue<TFormValues>;
  control: Control<TFormValues>;
}

const RatingSection: React.FC<RatingSectionProps<SpendFormData>> = ({ setValue, control }) => {
  const satisfactionRating = useWatch({
    name: 'satisfactionRating',
    control,
  });
  const satisfactionRatingSelectHandler = useCallback(
    (rating: number) => {
      setValue('satisfactionRating', rating);
    },
    [setValue],
  );
  const necessityRating = useWatch({
    name: 'necessityRating',
    control,
  });
  const necessityRatingSelectHandler = useCallback(
    (rating: number) => {
      setValue('necessityRating', rating);
    },
    [setValue],
  );

  const satificationRatingOptionItems = useMemo(() => {
    return [1, 2, 3, 4, 5].map((r) => (
      <RatingOption
        key={r}
        selected={r === (satisfactionRating || 0)}
        onClick={() => satisfactionRatingSelectHandler(r)}
      >
        {r}
      </RatingOption>
    ));
  }, [satisfactionRating, satisfactionRatingSelectHandler]);

  const needVsWantRatingOptionItems = useMemo(() => {
    return [1, 2, 3, 4, 5].map((r) => (
      <RatingOption
        key={r}
        selected={r === (necessityRating || 0)}
        onClick={() => necessityRatingSelectHandler(r)}
      >
        {r}
      </RatingOption>
    ));
  }, [necessityRating, necessityRatingSelectHandler]);

  return (
    <StyledIonCard>
      <IonCardHeader>
        <IonCardTitle>⭐ Rating</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <div>
          <p>How satisfied are you with this purchase?</p>
          <RatingScale>{satificationRatingOptionItems}</RatingScale>
          <RatingLabels>
            <span>Regret it</span>
            <span>Love it</span>
          </RatingLabels>
        </div>
        <div className='ion-margin-top'>
          <p>How essential is this purchase?</p>
          <RatingScale>{needVsWantRatingOptionItems}</RatingScale>
          <RatingLabels>
            <span>Not-Essential</span>
            <span>Essential</span>
          </RatingLabels>
        </div>
      </IonCardContent>
    </StyledIonCard>
  );
};
export default RatingSection;
