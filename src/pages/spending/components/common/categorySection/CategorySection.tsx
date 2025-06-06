import type { SpendCategory } from '@/domain/Spend';
import type { SpendFormData } from '@/pages/spending/modals/spendModal';
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/react';
import { useCallback, useMemo } from 'react';
import { type Control, type FieldValues, type UseFormSetValue, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { styled } from 'styled-components';

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 8px;
`;

const CategoryItem = styled.div<{ selected?: boolean }>`
  padding: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  ${(props) =>
    props.selected &&
    `
    border-color: white;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    font-weight: 600;
  `}

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

interface CategorySectionProps<TFormValues extends FieldValues> {
  setValue: UseFormSetValue<TFormValues>;
  control: Control<TFormValues>;
}

const categorySection: React.FC<CategorySectionProps<SpendFormData>> = ({ setValue, control }) => {
  const { t } = useTranslation();
  const category = useWatch({
    name: 'category',
    control,
  });
  const categorySelectHandler = useCallback(
    (category: SpendCategory) => {
      setValue('category', category);
    },
    [setValue],
  );
  const categoryItems = useMemo(() => {
    return [
      { label: t('spending.categories.need'), value: 'need', icon: '🏠' },
      { label: t('spending.categories.want'), value: 'want', icon: '💝' },
      { label: t('spending.categories.culture'), value: 'culture', icon: '📚' },
      { label: t('spending.categories.unexpected'), value: 'unexpected', icon: '⚡' },
    ].map((item) => (
      <CategoryItem
        key={item.label}
        selected={item.value === category}
        onClick={() => categorySelectHandler(item.value as SpendCategory)}
      >
        <span>{item.icon}</span> {item.label}
      </CategoryItem>
    ));
  }, [t, category, categorySelectHandler]);

  return (
    <IonCard color={'primary'}>
      <IonCardHeader>
        <IonCardTitle>
          <span>📊 Mindful Moment</span>
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <p>
          Remember, every spend is an opportunity to align with your values and goals. Make it
          count!
        </p>
        <p>Select the category that best fits your spending:</p>
        <CategoryGrid>{categoryItems}</CategoryGrid>
      </IonCardContent>
    </IonCard>
  );
};

export default categorySection;
