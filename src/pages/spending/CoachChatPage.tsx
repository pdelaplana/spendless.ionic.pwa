import { BasePageLayout, CenterContainer } from '@/components/layouts';
import { SentryErrorBoundary } from '@/components/shared';
import type { ICoachSession } from '@/domain/CoachSession';
import {
  useCoachSessionMessages,
  useCoachTrialStatus,
  useSendCoachMessage,
} from '@/hooks/api/coachSessions';
import { buildSystemPrompt } from '@/hooks/api/coachSessions/coachSessionUtils';
import { useFetchWalletsByPeriod } from '@/hooks/api/wallet';
import { useSubscription } from '@/hooks/subscription';
import { useVisualViewport } from '@/hooks/ui';
import { useAuth } from '@/providers/auth/useAuth';
import { useSpendingAccount } from '@/providers/spendingAccount/useSpendingAccount';
import { ROUTES } from '@/routes/routes.constants';
import { GradientBackground } from '@/theme/components';
import { designSystem } from '@/theme/designSystem';
import { IonButton, IonIcon, IonSpinner, IonTextarea } from '@ionic/react';
import { sendOutline, warningOutline } from 'ionicons/icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import { useLocation, useParams } from 'react-router-dom';
import remarkGfm from 'remark-gfm';
import styled from 'styled-components';
import { SpendingContextBanner } from './components/coach/SpendingContextBanner';

interface CoachChatParams {
  sessionId: string;
}

// ─── Styled Components ───────────────────────────────────────────────────────

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100dvh - 60px);
`;

const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${designSystem.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${designSystem.spacing.sm};
`;

const BubbleRow = styled.div<{ $isUser: boolean }>`
  display: flex;
  justify-content: ${({ $isUser }) => ($isUser ? 'flex-end' : 'flex-start')};
`;

const Bubble = styled.div<{ $isUser: boolean; $isError?: boolean }>`
  max-width: 80%;
  padding: ${designSystem.spacing.sm} ${designSystem.spacing.md};
  border-radius: ${({ $isUser }) =>
    $isUser
      ? `${designSystem.borderRadius.lg} ${designSystem.borderRadius.lg} ${designSystem.borderRadius.sm} ${designSystem.borderRadius.lg}`
      : `${designSystem.borderRadius.lg} ${designSystem.borderRadius.lg} ${designSystem.borderRadius.lg} ${designSystem.borderRadius.sm}`};
  font-size: 0.9375rem;
  line-height: 1.5;
  word-break: break-word;

  ${({ $isUser, $isError }) =>
    $isError
      ? `
    background: ${designSystem.colors.danger[100]};
    color: ${designSystem.colors.danger[700]};
    border: 1px solid ${designSystem.colors.danger[300]};
  `
      : $isUser
        ? `
    background: ${designSystem.colors.brand.secondary};
    color: white;
  `
        : `
    background: white;
    color: ${designSystem.colors.text.primary};
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    border: 1px solid ${designSystem.colors.gray[200]};
  `}

  p:last-child {
    margin-bottom: 0;
  }
`;

const BubbleStatus = styled.span`
  display: block;
  font-size: 0.6875rem;
  color: rgba(255, 255, 255, 0.65);
  text-align: right;
  margin-top: 2px;
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: ${designSystem.spacing.sm} ${designSystem.spacing.md};
  background: white;
  border-radius: ${designSystem.borderRadius.lg};
  width: fit-content;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid ${designSystem.colors.gray[200]};

  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${designSystem.colors.gray[400]};
    animation: typing-bounce 1.2s infinite ease-in-out;

    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }

  @keyframes typing-bounce {
    0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
    40% { transform: scale(1.1); opacity: 1; }
  }
`;

const TrialWarning = styled.div`
  display: flex;
  align-items: center;
  gap: ${designSystem.spacing.xs};
  padding: ${designSystem.spacing.xs} ${designSystem.spacing.md};
  background: ${designSystem.colors.warning[50]};
  border-top: 1px solid ${designSystem.colors.warning[200]};
  font-size: 0.8125rem;
  color: ${designSystem.colors.warning[700]};
`;

const InputArea = styled.div`
  display: flex;
  align-items: center;
  gap: ${designSystem.spacing.sm};
  padding: ${designSystem.spacing.sm} ${designSystem.spacing.md};
`;

const SendButton = styled(IonButton)`
  --border-radius: 50%;
  --padding-start: 10px;
  --padding-end: 10px;
  height: 40px;
  width: 40px;
  margin: 0;
`;

const UpgradePrompt = styled.div`
  padding: ${designSystem.spacing.md};
  text-align: center;
  background: ${designSystem.colors.secondary[50]};
  border-top: 1px solid ${designSystem.colors.secondary[200]};

  p {
    margin: 0 0 ${designSystem.spacing.sm} 0;
    font-size: 0.875rem;
    color: ${designSystem.colors.text.secondary};
  }
`;

// ─── Markdown Components ──────────────────────────────────────────────────────

const markdownComponents: Components = {
  p: ({ children }) => <p style={{ margin: '0 0 0.5em', lineHeight: 1.5 }}>{children}</p>,
  ul: ({ children }) => <ul style={{ margin: '0.25em 0', paddingLeft: '1.25em' }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ margin: '0.25em 0', paddingLeft: '1.25em' }}>{children}</ol>,
  li: ({ children }) => <li style={{ margin: '0.15em 0' }}>{children}</li>,
  h2: ({ children }) => (
    <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: '0.5em 0 0.25em' }}>{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: '0.5em 0 0.25em' }}>{children}</h3>
  ),
  code: ({ children }) => (
    <code
      style={{
        fontFamily: 'monospace',
        fontSize: '0.875em',
        background: '#f3f4f6',
        borderRadius: '3px',
        padding: '1px 4px',
      }}
    >
      {children}
    </code>
  ),
};

// ─── Component ───────────────────────────────────────────────────────────────

export const CoachChatPage: React.FC = () => {
  const { t } = useTranslation();
  const { sessionId } = useParams<CoachChatParams>();
  const location = useLocation<{ session?: ICoachSession }>();
  const session = location.state?.session;

  const { account, spending, selectedPeriod } = useSpendingAccount();
  const { data: wallets = [] } = useFetchWalletsByPeriod(
    account?.id ?? '',
    selectedPeriod?.id ?? '',
  );
  const { user } = useAuth();
  const subscription = useSubscription(account ?? null);

  const [inputValue, setInputValue] = useState('');
  const [includeContext, setIncludeContext] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading: messagesLoading } = useCoachSessionMessages(account?.id, sessionId);
  const { mutate: sendMessage, isPending } = useSendCoachMessage();
  const { messagesRemaining, hasTrialExpired, decrementMessages } = useCoachTrialStatus(user?.uid);
  const { keyboardOffset } = useVisualViewport();

  // Sort spending by date desc and cap at 30 for system prompt
  const recentSpends = useMemo(
    () => [...spending].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 30),
    [spending],
  );

  const systemPrompt = useMemo(
    () =>
      buildSystemPrompt({
        includeContext,
        spends: recentSpends,
        currency: account?.currency,
        period: selectedPeriod,
        wallets,
      }),
    [includeContext, recentSpends, account?.currency, selectedPeriod, wallets],
  );

  // Auto-scroll to bottom when messages change or typing indicator appears
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll when message list, typing indicator, or keyboard changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPending, keyboardOffset]);

  const handleSend = () => {
    const content = inputValue.trim();
    if (!content || !account?.id || isPending) return;

    setInputValue('');
    sendMessage({
      accountId: account.id,
      sessionId,
      content,
      systemPrompt,
      history: messages,
      decrementMessages,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isSendDisabled =
    isPending || !inputValue.trim() || (!subscription.isPremium && hasTrialExpired);

  const showTrialWarning = !subscription.isPremium && !hasTrialExpired && messagesRemaining <= 2;

  return (
    <BasePageLayout
      title={session?.title ?? t('coach.title')}
      showHeader={true}
      showBackButton={true}
      defaultBackButtonHref={ROUTES.SPENDING_COACH}
      showLogo={false}
      showProfileIcon={false}
      showMenu={false}
    >
      <GradientBackground>
        <SentryErrorBoundary>
          <CenterContainer>
            <ChatContainer style={{ paddingBottom: keyboardOffset }}>
              <SpendingContextBanner includeContext={includeContext} onToggle={setIncludeContext} />

              <MessagesArea>
                {messagesLoading ? null : (
                  <>
                    {messages.map((msg) => (
                      <BubbleRow
                        key={msg.id ?? msg.createdAt.toISOString()}
                        $isUser={msg.role === 'user'}
                      >
                        <Bubble $isUser={msg.role === 'user'} $isError={msg.status === 'error'}>
                          {msg.status === 'error' ? (
                            <span>
                              <IonIcon icon={warningOutline} /> {t('coach.errors.sendFailed')}
                            </span>
                          ) : msg.role === 'model' ? (
                            <ReactMarkdown
                              components={markdownComponents}
                              remarkPlugins={[remarkGfm]}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          ) : (
                            msg.content
                          )}
                          {msg.role === 'user' && msg.status === 'sending' && (
                            <BubbleStatus>…</BubbleStatus>
                          )}
                        </Bubble>
                      </BubbleRow>
                    ))}

                    {isPending && (
                      <BubbleRow $isUser={false}>
                        <TypingIndicator aria-label={t('coach.typing')}>
                          <span />
                          <span />
                          <span />
                        </TypingIndicator>
                      </BubbleRow>
                    )}
                  </>
                )}
                <div ref={bottomRef} />
              </MessagesArea>

              {showTrialWarning && (
                <TrialWarning>
                  <IonIcon icon={warningOutline} />
                  {messagesRemaining === 1
                    ? t('coach.trial.messagesRemaining', { count: messagesRemaining })
                    : t('coach.trial.messagesRemainingPlural', { count: messagesRemaining })}
                </TrialWarning>
              )}

              {!subscription.isPremium && hasTrialExpired ? (
                <UpgradePrompt>
                  <p>{t('coach.trial.trialEndedDescription')}</p>
                  <IonButton color='secondary' routerLink={ROUTES.SETTINGS}>
                    {t('coach.trial.upgradeNow')}
                  </IonButton>
                </UpgradePrompt>
              ) : (
                <InputArea>
                  <IonTextarea
                    value={inputValue}
                    onIonInput={(e) => setInputValue(e.detail.value ?? '')}
                    onKeyDown={handleKeyDown}
                    placeholder={t('coach.inputPlaceholder')}
                    autoGrow={true}
                    rows={1}
                    fill='outline'
                    disabled={isPending}
                    style={{ flex: 1 }}
                  />
                  <SendButton color='secondary' onClick={handleSend} disabled={isSendDisabled}>
                    {isPending ? (
                      <IonSpinner slot='icon-only' name='crescent' />
                    ) : (
                      <IonIcon slot='icon-only' icon={sendOutline} />
                    )}
                  </SendButton>
                </InputArea>
              )}
            </ChatContainer>
          </CenterContainer>
        </SentryErrorBoundary>
      </GradientBackground>
    </BasePageLayout>
  );
};
