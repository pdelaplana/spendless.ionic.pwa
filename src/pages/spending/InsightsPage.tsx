import { BasePageLayout, CenterContainer } from '@/components/layouts';
import MainMenuContent from '@/components/menu/MainMenuContent';
import { IconContainer } from '@/components/shared';
import { SentryErrorBoundary } from '@/components/shared';
import { ROUTES } from '@/routes/routes.constants';
import { StyledItem, StyledItemHeader, TransparentIonList } from '@/styles/IonList.styled';
import { GlassCard, GradientBackground } from '@/theme/components';
import { designSystem } from '@/theme/designSystem';
import { IonLabel, IonListHeader } from '@ionic/react';
import { barChartOutline, statsChartOutline, trendingUpOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

const InsightsListContainer = styled(GlassCard)`
  margin: ${designSystem.spacing.lg} ${designSystem.spacing.md};
`;

const InsightsPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();

  const handleNavigateToTrending = () => {
    // TODO: Navigate to trending page when implemented
    console.log('Navigate to Trending - not yet implemented');
  };

  const handleNavigateToTags = () => {
    history.push(ROUTES.SPENDING_INSIGHTS_TAGS);
  };

  const handleNavigateToBudget = () => {
    history.push(ROUTES.SPENDING_INSIGHTS_BUDGET);
  };

  return (
    <BasePageLayout
      title={t('insights.title')}
      showHeader={true}
      showBackButton={true}
      defaultBackButtonHref={ROUTES.SPENDING}
      showLogo={false}
      showProfileIcon={false}
      showMenu={true}
      menu={<MainMenuContent />}
    >
      <GradientBackground>
        <CenterContainer>
          <SentryErrorBoundary>
            <InsightsListContainer>
              <TransparentIonList lines='full'>
                <StyledItem button onClick={handleNavigateToBudget} detail>
                  <div slot='start' style={{ marginRight: '0px' }}>
                    <IconContainer
                      icon={barChartOutline}
                      bgColor='rgba(139, 95, 191, 0.1)'
                      iconColor='#8B5FBF'
                    />
                  </div>
                  <IonLabel>
                    <h2>Spend vs Budget</h2>
                    <p>Compare your spending against budgets across periods</p>
                  </IonLabel>
                </StyledItem>
                <StyledItem button onClick={handleNavigateToTags} lines='none' detail>
                  <div slot='start' style={{ marginRight: '0px' }}>
                    <IconContainer
                      icon={statsChartOutline}
                      bgColor='rgba(139, 95, 191, 0.1)'
                      iconColor='#8B5FBF'
                    />
                  </div>
                  <IonLabel>
                    <h2>Spend Analysis by Tags</h2>
                    <p>Analyze your spending patterns by tags</p>
                  </IonLabel>
                </StyledItem>
              </TransparentIonList>
            </InsightsListContainer>
          </SentryErrorBoundary>
        </CenterContainer>
      </GradientBackground>
    </BasePageLayout>
  );
};

export default InsightsPage;
