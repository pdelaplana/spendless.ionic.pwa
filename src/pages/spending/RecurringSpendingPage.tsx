import { BasePageLayout, CenterContainer } from '@/components/layouts';
import {
  EmptyState,
  IconContainer,
  SentryErrorBoundary,
  StyledItem,
  TagsDisplay,
} from '@/components/shared';
import { getScheduleDescription } from '@/domain/RecurringSpend';
import useFormatters from '@/hooks/ui/useFormatters';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { GlassCard, GradientBackground, GroupedTransactionsContainer } from '@/theme/components';
import { designSystem } from '@/theme/designSystem';
import { getCategoryIcon } from '@/utils';
import { IonButton, IonIcon, IonLabel } from '@ionic/react';
import { add, chevronForward, repeatOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useRecurringSpendActions } from './hooks/useRecurringSpendActions';

const ListContainer = styled(GlassCard)`
  margin-bottom: ${designSystem.spacing.md};
`;

const ListHeader = styled.div`
  font-size: ${designSystem.typography.fontSize.lg};
  font-weight: ${designSystem.typography.fontWeight.semibold};
  color: ${designSystem.colors.text.primary};
  padding: ${designSystem.spacing.md} ${designSystem.spacing.md} ${designSystem.spacing.sm} ${designSystem.spacing.md};
  margin: 0;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: none;
  line-height: 1.2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--ion-color-light);
`;

const ListHeaderTitle = styled.h2`
  margin: 0;
  font-size: ${designSystem.typography.fontSize.lg};
  font-weight: ${designSystem.typography.fontWeight.semibold};
  color: ${designSystem.colors.text.primary};
  line-height: 1.2;
`;

const ListHeaderButton = styled(IonButton)`
  --color: var(--ion-color-primary);
  margin: 0;
  --padding-start: 8px;
  --padding-end: 8px;
  --padding-top: 4px;
  --padding-bottom: 4px;

  ion-icon {
    font-size: 20px;
  }
`;

const ListContent = styled.div`
  width: 100%;
  margin: 0;
  padding: 0;
`;

const AmountLabel = styled(IonLabel)`
  text-align: right;
  font-weight: ${designSystem.typography.fontWeight.semibold};
  color: ${designSystem.colors.text.primary};
`;

const RecurringSpendingPage: React.FC = () => {
  const { t } = useTranslation();
  const { account } = useSpendingAccount();
  const { formatCurrency } = useFormatters();

  const { recurringSpends, editRecurringSpendHandler, newRecurringSpendHandler } =
    useRecurringSpendActions();

  return (
    <BasePageLayout
      title={t('recurringSpend.title')}
      showHeader={true}
      showBackButton={true}
      defaultBackButtonHref='/spending'
      showLogo={false}
      showProfileIcon={false}
      showMenu={false}
    >
      <SentryErrorBoundary>
        <CenterContainer>
          <GradientBackground>
            {recurringSpends.length === 0 ? (
              <EmptyState
                title={t('recurringSpend.empty.title')}
                description={t('recurringSpend.empty.description')}
                icon={repeatOutline}
                action={
                  <IonButton fill='solid' onClick={newRecurringSpendHandler}>
                    {t('recurringSpend.empty.action')}
                  </IonButton>
                }
              />
            ) : (
              <ListContainer>
                <ListHeader>
                  <ListHeaderTitle>&nbsp;</ListHeaderTitle>
                  <ListHeaderButton
                    fill='clear'
                    size='small'
                    onClick={newRecurringSpendHandler}
                    aria-label={t('recurringSpend.list.addButton')}
                  >
                    <IonIcon slot='icon-only' icon={add} />
                  </ListHeaderButton>
                </ListHeader>
                <ListContent>
                  <GroupedTransactionsContainer
                    lines='none'
                    style={{ backgroundColor: 'transparent' }}
                  >
                    {recurringSpends.map((recurringSpend, index) => {
                      const categoryIcon = getCategoryIcon(recurringSpend.category);
                      return (
                        <StyledItem
                          key={recurringSpend.id}
                          onClick={() => editRecurringSpendHandler(recurringSpend)}
                          detail
                          detailIcon={chevronForward}
                          button
                          lines={index === recurringSpends.length - 1 ? 'none' : 'full'}
                        >
                          <IconContainer
                            icon={categoryIcon.icon}
                            bgColor={categoryIcon.bgColor}
                            iconColor={categoryIcon.iconColor}
                            marginRight='3px'
                          />
                          <IonLabel>
                            <h2>{recurringSpend.description}</h2>
                            <p>{getScheduleDescription(recurringSpend)}</p>
                            {recurringSpend.tags && recurringSpend.tags.length > 0 && (
                              <TagsDisplay tags={recurringSpend.tags} />
                            )}
                          </IonLabel>
                          <AmountLabel slot='end'>
                            {formatCurrency(recurringSpend.amount, account?.currency)}
                          </AmountLabel>
                        </StyledItem>
                      );
                    })}
                  </GroupedTransactionsContainer>
                </ListContent>
              </ListContainer>
            )}
          </GradientBackground>
        </CenterContainer>
      </SentryErrorBoundary>
    </BasePageLayout>
  );
};

export default RecurringSpendingPage;
