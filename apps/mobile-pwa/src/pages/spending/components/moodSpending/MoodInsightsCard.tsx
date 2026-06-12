import type { ISpend } from '@/domain/Spend';
import { designSystem } from '@/theme/designSystem';
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon } from '@ionic/react';
import { alertCircleOutline, trendingUpOutline, walletOutline } from 'ionicons/icons';
import type React from 'react';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const InsightItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${designSystem.spacing.md};
  margin-bottom: ${designSystem.spacing.lg};

  &:last-child {
    margin-bottom: 0;
  }
`;

const IconWrapper = styled.div<{ color: string }>`
  background: ${(props) => `${props.color}15`};
  color: ${(props) => props.color};
  padding: 8px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ContentWrapper = styled.div`
  flex: 1;
`;

const InsightTitle = styled.h4`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--ion-color-dark);
`;

const InsightDescription = styled.p`
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--ion-color-medium);
  line-height: 1.4;
`;

interface MoodInsightsCardProps {
  spending: ISpend[];
  currency: string;
}

const MoodInsightsCard: React.FC<MoodInsightsCardProps> = ({ spending, currency }) => {
  const { t } = useTranslation();
  const formatAmount = useCallback(
    (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
      }).format(amount);
    },
    [currency],
  );

  const moodEmojis: Record<string, string> = useMemo(
    () => ({
      happy: '😊',
      stressed: '😰',
      tired: '😴',
      sad: '😔',
      angry: '😡',
      neutral: '😐',
    }),
    [],
  );

  const insights = useMemo(() => {
    if (spending.length === 0) return [];

    const moodTotals: Record<string, number> = {};
    const moodCounts: Record<string, number> = {};
    let totalSpent = 0;

    for (const s of spending) {
      const mood = s.emotionalState?.toLowerCase() || 'neutral';
      moodTotals[mood] = (moodTotals[mood] || 0) + s.amount;
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      totalSpent += s.amount;
    }

    const result = [];

    // 1. Highest Spending Mood
    const highestMood = Object.entries(moodTotals).reduce((a, b) => (a[1] > b[1] ? a : b));

    result.push({
      title: 'Highest Spending Mood',
      description: `Your highest spending happens when you feel ${highestMood[0]} ${moodEmojis[highestMood[0]] || ''}, totaling ${formatAmount(highestMood[1])} (${((highestMood[1] / totalSpent) * 100).toFixed(1)}% of period spending).`,
      icon: trendingUpOutline,
      color: '#8B5FBF',
    });

    // 2. Average Transaction per Mood (if multiple moods exist)
    if (Object.keys(moodTotals).length > 1) {
      const avgSpends = Object.keys(moodTotals).map((m) => ({
        mood: m,
        avg: moodTotals[m] / moodCounts[m],
      }));
      const highestAvg = avgSpends.reduce((a, b) => (a.avg > b.avg ? a : b));

      result.push({
        title: 'Largest Average Purchase',
        description: `Purchases made while feeling ${highestAvg.mood} tend to be the largest, averaging ${formatAmount(highestAvg.avg)} per transaction.`,
        icon: walletOutline,
        color: '#4caf50',
      });
    }

    // 3. Emotional Spending Alert (Negative moods)
    const negativeMoods = ['stressed', 'sad', 'angry'];
    const emotionalSpending = negativeMoods.reduce((acc, mood) => acc + (moodTotals[mood] || 0), 0);

    if (emotionalSpending > 0) {
      const percentage = (emotionalSpending / totalSpent) * 100;
      let message = '';
      if (percentage > 30) {
        message = `Watch out! ${percentage.toFixed(1)}% of your spending this period was driven by negative emotions like stress or anger.`;
      } else {
        message = `You spent ${formatAmount(emotionalSpending)} while feeling stressed, sad, or angry. Being aware of these triggers can help you save more.`;
      }

      result.push({
        title: 'Emotional Spending Alert',
        description: message,
        icon: alertCircleOutline,
        color: '#f44336',
      });
    }

    return result;
  }, [spending, formatAmount, moodEmojis]);

  if (spending.length === 0) return null;

  return (
    <IonCard
      style={{
        margin: `${designSystem.spacing.md} 0`,
        border: 'none',
        boxShadow: 'none',
        background: 'transparent',
      }}
    >
      <IonCardHeader style={{ paddingLeft: 0 }}>
        <IonCardTitle style={{ fontSize: '18px', fontWeight: 700 }}>Mood Insights</IonCardTitle>
      </IonCardHeader>
      <IonCardContent style={{ padding: 0 }}>
        {insights.map((insight) => (
          <InsightItem key={insight.title}>
            <IconWrapper color={insight.color}>
              <IonIcon icon={insight.icon} />
            </IconWrapper>
            <ContentWrapper>
              <InsightTitle>{insight.title}</InsightTitle>
              <InsightDescription>{insight.description}</InsightDescription>
            </ContentWrapper>
          </InsightItem>
        ))}
      </IonCardContent>
    </IonCard>
  );
};

export default MoodInsightsCard;
