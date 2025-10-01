import { BasePageLayout, CenterContainer } from '@/components/layouts';
import { SentryErrorBoundary, StyledItem } from '@/components/shared';
import useFormatters from '@/hooks/ui/useFormatters';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { useWallet } from '@/providers/wallet';
import {
  GradientBackground,
  GroupedTransactionsContainer,
  TransactionsContainer,
} from '@/theme/components';
import { dateUtils } from '@/utils';
import { IonLabel } from '@ionic/react';
import { t } from 'i18next';
import { chevronForward } from 'ionicons/icons';
import { useMemo } from 'react';
import { SpendIcon } from './components/base/icons/SpendIcon';
import { useSpendActions } from './hooks/useSpendActions';

const ScheduledSpendingPage: React.FC = () => {
  const { spending } = useSpendingAccount();
  const { selectedWallet } = useWallet();

  const { formatDate, formatCurrency } = useFormatters();

  const { editSpendHandler } = useSpendActions();

  const filteredSpending = useMemo(() => {
    if (!selectedWallet) return spending;
    return spending.filter((spend) => spend.walletId === selectedWallet.id);
  }, [spending, selectedWallet]);

  const futureSpending = useMemo(() => {
    return filteredSpending.filter((spend) => spend.date > dateUtils.getCurrentDate());
  }, [filteredSpending]);

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
      <GradientBackground>
        <SentryErrorBoundary>
          <CenterContainer>
            {futureSpending.length > 0 && (
              <TransactionsContainer>
                <div>
                  <GroupedTransactionsContainer
                    lines='none'
                    style={{ backgroundColor: 'transparent' }}
                  >
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
                            <p>{t(`spending.categories.${spend.category}`)}</p>
                          </IonLabel>
                          <IonLabel slot='end'>{formatCurrency(spend.amount)}</IonLabel>
                        </StyledItem>
                      ))}
                  </GroupedTransactionsContainer>
                </div>
              </TransactionsContainer>
            )}
          </CenterContainer>
        </SentryErrorBoundary>
      </GradientBackground>
    </BasePageLayout>
  );
};
export default ScheduledSpendingPage;
