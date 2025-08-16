import { BasePageLayout, CenterContainer } from '@/components/layouts';
import { StyledItem } from '@/components/shared';
import useFormatters from '@/hooks/ui/useFormatters';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { StyledIonList } from '@/styles/IonList.styled';
import { IonLabel } from '@ionic/react';
import { t } from 'i18next';
import { chevronForward } from 'ionicons/icons';
import { useMemo } from 'react';
import { SpendIcon } from './components/base/icons/SpendIcon';
import { useSpendActions } from './hooks/useSpendActions';

const ScheduledSpendingPage: React.FC = () => {
  const { spending } = useSpendingAccount();

  const { formatDate, formatCurrency } = useFormatters();

  const { editSpendHandler } = useSpendActions();

  const futureSpending = useMemo(() => {
    return spending.filter((spend) => spend.date > new Date());
  }, [spending]);

  return (
    <BasePageLayout
      title='Scheduled Spending'
      showHeader={true}
      showBackButton={true}
      defaultBackButtonHref='/spending'
      showLogo={false}
      showProfileIcon={false}
      showMenu={false}
    >
      <CenterContainer>
        {futureSpending.length > 0 && (
          <StyledIonList className='ion-margin-top'>
            {futureSpending
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .map((spend, index) => (
                <StyledItem
                  key={spend.id}
                  onClick={() => editSpendHandler(spend)}
                  detail
                  detailIcon={chevronForward}
                  button
                  lines={index === futureSpending.length - 1 ? 'none' : 'full'}
                >
                  <SpendIcon category={spend.category} />
                  <IonLabel>
                    <p>{formatDate(spend.date, true)}</p>
                    <h2>{spend.description}</h2>

                    <p>{t(`spend.categories.${spend.category}`)}</p>
                  </IonLabel>
                  <IonLabel slot='end'>{formatCurrency(spend.amount)}</IonLabel>
                </StyledItem>
              ))}
          </StyledIonList>
        )}
      </CenterContainer>
    </BasePageLayout>
  );
};
export default ScheduledSpendingPage;
