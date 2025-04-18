import { BasePageLayout, CenterContainer } from '@/components/layouts';
import { StyledItem } from '@/components/shared';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { IonLabel } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { StyledIonList } from './styles/SpendingPage.styled';

const SpendingPeriodsPage: React.FC = () => {
  const { t } = useTranslation();

  const { periods } = useSpendingAccount();

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
          <StyledIonList>
            {periods.map((period) => (
              <StyledItem key={period.id} lines='full'>
                <IonLabel>
                  <h2>{period.name}</h2>
                  <p>{t('periods.description', { date: period.startAt })}</p>
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
