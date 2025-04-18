import { BasePageLayout, CenterContainer } from '@/components/layouts';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { useMemo } from 'react';
import { StyledIonList } from './styles/SpendingPage.styled';
import { StyledItem } from '@/components/shared';
import { IonIcon, IonLabel } from '@ionic/react';
import { t } from 'i18next';
import { chevronForward } from 'ionicons/icons';
import { useSpendModal } from './modals/SpendModal';
import type { ISpend } from '@/domain/Spend';
import { SpendIcon } from './components/base/icons/SpendIcon';
import useFormatters from '@/hooks/ui/useFormatters';

const ScheduledSpendingPage: React.FC = () => {
  const { account, currentPeriod, spending, updateSpend, resetMutationState, refetchSpending } =
    useSpendingAccount();

  const { formatDate, formatCurrency } = useFormatters();

  const { open: openSpendModal } = useSpendModal();

  const handleSaveSpend = async (spend: ISpend) => {
    if (spend.id) {
      await updateSpend({ accountId: account?.id || '', spendId: spend.id, data: spend });
    }
    resetMutationState();

    refetchSpending();
  };

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
          <StyledIonList>
            {futureSpending
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .map((spend, index) => (
                <StyledItem
                  key={spend.id}
                  onClick={() => openSpendModal(spend, handleSaveSpend)}
                  detail
                  detailIcon={chevronForward}
                  button
                  lines={index === futureSpending.length ? 'none' : 'full'}
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
