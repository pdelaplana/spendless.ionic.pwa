import { BasePageLayout, CenterContainer } from '@/components/layouts';
import MainMenuContent from '@/components/menu/MainMenuContent';
import { EmptyState, LoadingState, SentryErrorBoundary } from '@/components/shared';
import type { ICoachSession } from '@/domain/CoachSession';
import {
  useArchiveCoachSession,
  useCoachTrialStatus,
  useCreateCoachSession,
  useFetchCoachSessions,
} from '@/hooks/api/coachSessions';
import { useSubscription } from '@/hooks/subscription';
import useFormatters from '@/hooks/ui/useFormatters';
import { useAuth } from '@/providers/auth/useAuth';
import { useSpendingAccount } from '@/providers/spendingAccount/useSpendingAccount';
import { ROUTES } from '@/routes/routes.constants';
import { GradientBackground } from '@/theme/components';
import { designSystem } from '@/theme/designSystem';
import {
  IonAlert,
  IonButton,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
} from '@ionic/react';
import { addOutline, archiveOutline, chatbubblesOutline } from 'ionicons/icons';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

const PageContainer = styled.div`
  padding: ${designSystem.spacing.md};
`;

const TrialBanner = styled.div`
  display: flex;
  align-items: center;
  gap: ${designSystem.spacing.sm};
  padding: ${designSystem.spacing.sm} ${designSystem.spacing.md};
  margin-bottom: ${designSystem.spacing.md};
  background: linear-gradient(
    135deg,
    ${designSystem.colors.secondary[100]} 0%,
    ${designSystem.colors.secondary[200]} 100%
  );
  border-radius: ${designSystem.borderRadius.md};
  border: 1px solid ${designSystem.colors.secondary[300]};
`;

const TrialText = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: ${designSystem.colors.brand.primary};
  font-weight: 500;
`;

const SessionCard = styled.div`
  width: 100%;
  background: white;
  border-radius: ${designSystem.borderRadius.lg};
  padding: ${designSystem.spacing.md};
  margin-bottom: ${designSystem.spacing.sm};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid ${designSystem.colors.gray[200]};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    transform: translateY(-1px);
  }
`;

const SessionTitle = styled.h3`
  margin: 0 0 ${designSystem.spacing.xs} 0;
  font-size: 1rem;
  font-weight: 600;
  color: ${designSystem.colors.text.primary};
`;

const SessionMeta = styled.p`
  margin: 0;
  font-size: 0.8125rem;
  color: ${designSystem.colors.text.secondary};
`;

const FinancialCoachPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { account } = useSpendingAccount();
  const { user } = useAuth();
  const subscription = useSubscription(account ?? null);
  const { formatDate } = useFormatters();
  const listRef = useRef<HTMLIonListElement>(null);

  const [sessionToArchive, setSessionToArchive] = useState<ICoachSession | null>(null);

  const { data: sessions = [], isLoading } = useFetchCoachSessions(account?.id);
  const { mutate: createSession, isPending: isCreating } = useCreateCoachSession();
  const { mutate: archiveSession } = useArchiveCoachSession();
  const { messagesRemaining } = useCoachTrialStatus(user?.uid);

  const handleNewSession = () => {
    if (!account?.id || !user?.uid) return;
    createSession(
      {
        accountId: account.id,
        userId: user.uid,
        title: t('coach.newSession'),
        messageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        onSuccess: (session) => {
          history.push({
            pathname: ROUTES.SPENDING_COACH_SESSION.replace(':sessionId', session.id!),
            state: { session },
          });
        },
      },
    );
  };

  const handleSessionClick = (session: ICoachSession) => {
    history.push({
      pathname: ROUTES.SPENDING_COACH_SESSION.replace(':sessionId', session.id!),
      state: { session },
    });
  };

  const handleArchiveConfirm = () => {
    if (!sessionToArchive || !account?.id || !sessionToArchive.id) return;
    archiveSession({ accountId: account.id, sessionId: sessionToArchive.id });
    listRef.current?.closeSlidingItems();
    setSessionToArchive(null);
  };

  const showTrialBanner = !subscription.isPremium;

  return (
    <BasePageLayout
      title={t('coach.title')}
      showHeader={true}
      showBackButton={true}
      defaultBackButtonHref={ROUTES.SPENDING}
      showLogo={false}
      showProfileIcon={false}
      showMenu={true}
      menu={<MainMenuContent />}
      endButtons={
        <IonButton fill='clear' onClick={handleNewSession} disabled={isCreating}>
          <IonIcon slot='icon-only' icon={addOutline} />
        </IonButton>
      }
    >
      <GradientBackground>
        <SentryErrorBoundary>
          <CenterContainer>
            <PageContainer>
            {showTrialBanner && (
              <TrialBanner>
                <IonIcon icon={chatbubblesOutline} color='secondary' />
                <TrialText>
                  {messagesRemaining === 1
                    ? t('coach.trial.messagesRemaining', { count: messagesRemaining })
                    : t('coach.trial.messagesRemainingPlural', { count: messagesRemaining })}
                </TrialText>
              </TrialBanner>
            )}

            {isLoading ? (
              <LoadingState message={t('common.loading')} />
            ) : sessions.length === 0 ? (
              <EmptyState
                icon={chatbubblesOutline}
                title={t('coach.noSessions')}
                description={t('coach.noSessionsDescription')}
              />
            ) : (
              <IonList ref={listRef}>
                {sessions.map((session) => (
                  <IonItemSliding key={session.id}>
                    <IonItem lines='none' style={{ '--background': 'transparent' }}>
                      <SessionCard onClick={() => handleSessionClick(session)}>
                        <SessionTitle>{session.title}</SessionTitle>
                        <SessionMeta>
                          {session.messageCount}{' '}
                          {session.messageCount === 1 ? 'message' : 'messages'} ·{' '}
                          {formatDate(session.updatedAt, false)}
                        </SessionMeta>
                      </SessionCard>
                    </IonItem>
                    <IonItemOptions side='end'>
                      <IonItemOption color='medium' onClick={() => setSessionToArchive(session)}>
                        <IonIcon slot='start' icon={archiveOutline} />
                        {t('coach.archiveSession')}
                      </IonItemOption>
                    </IonItemOptions>
                  </IonItemSliding>
                ))}
              </IonList>
            )}
          </PageContainer>
          </CenterContainer>
        </SentryErrorBoundary>
      </GradientBackground>

      <IonAlert
        isOpen={!!sessionToArchive}
        header={t('coach.archiveSession')}
        message={t('coach.archiveSessionMessage')}
        buttons={[
          { text: 'Cancel', role: 'cancel', handler: () => setSessionToArchive(null) },
          { text: t('coach.archiveSession'), role: 'confirm', handler: handleArchiveConfirm },
        ]}
        onDidDismiss={() => setSessionToArchive(null)}
      />
    </BasePageLayout>
  );
};

export default FinancialCoachPage;
