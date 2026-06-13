import { BasePageLayout, CenterContainer } from '@/components/layouts';
import { StyledItem } from '@/components/shared';
import { useFetchSpendingTotalsByPeriod } from '@/hooks';
import useFormatters from '@/hooks/ui/useFormatters';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { StyledIonList } from '@/styles/IonList.styled';
import { IonLabel } from '@ionic/react';
import { useTranslation } from 'react-i18next';

const SpendingPeriodsPage: React.FC = () => {
  const { t } = useTranslation();

  const { account, periods } = useSpendingAccount();

  const { formatCurrency, formatDate } = useFormatters();

  return (
    <BasePageLayout
      title={t('periods.title')}
      showHeader={true}
      showBackButton={true}
      defaultBackButtonHref='/spending'
      showLogo={false}
      showProfileIcon={false}
      showMenu={false}
    >
      <CenterContainer>
        {periods.length > 0 && (
          <StyledIonList className='ion-margin-top'>
            {periods.map((period) => (
              <StyledItem key={period.id} lines='full' detail button>
                <IonLabel>
                  <h2>
                    {t('periods.description', {
                      startDate: formatDate(period.startAt),
                      endDate: formatDate(period.endAt),
                    })}
                  </h2>
                  <p>
                    {} {formatCurrency(period.targetSpend)}/ {formatCurrency(period.actualSpend)}
                  </p>
                </IonLabel>
              </StyledItem>
            ))}
          </StyledIonList>
        )}
      </CenterContainer>
    </BasePageLayout>
  );
};

export default SpendingPeriodsPage;
