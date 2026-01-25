import type { ISpend } from '@/domain/Spend';
import { designSystem } from '@/theme/designSystem';
import { IonButton, IonIcon } from '@ionic/react';
import {
  type ActiveElement,
  ArcElement,
  type ChartEvent,
  Chart as ChartJS,
  Legend,
  Tooltip,
  type TooltipItem,
} from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';
import type { Context } from 'chartjs-plugin-datalabels';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { arrowBackOutline } from 'ionicons/icons';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { MOOD_COLORS, MOOD_EMOJIS } from './constants';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);
const ChartContainer = styled.div`
  width: 100%;
  height: 400px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ChartWrapper = styled.div`
  width: 100%;
  height: 300px;
  position: relative;
`;

const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: ${designSystem.spacing.md};
`;

const EmptyStateContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--ion-color-medium);
`;

interface MoodSpendingChartProps {
  spending: ISpend[];
  currency: string;
}

const MoodSpendingChart: React.FC<MoodSpendingChartProps> = ({ spending, currency }) => {
  const { t } = useTranslation();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const moodLabels: Record<string, string> = useMemo(
    () => ({
      happy: `${MOOD_EMOJIS.happy} ${t('moods.happy', 'Happy')}`,
      stressed: `${MOOD_EMOJIS.stressed} ${t('moods.stressed', 'Stressed')}`,
      tired: `${MOOD_EMOJIS.tired} ${t('moods.tired', 'Tired')}`,
      sad: `${MOOD_EMOJIS.sad} ${t('moods.sad', 'Sad')}`,
      angry: `${MOOD_EMOJIS.angry} ${t('moods.angry', 'Angry')}`,
      neutral: `${MOOD_EMOJIS.neutral} ${t('moods.neutral', 'Neutral')}`,
    }),
    [t],
  );

  // Data aggregation for main view (Moods)
  const moodData = useMemo(() => {
    const aggregation: Record<string, number> = {};

    for (const s of spending) {
      const mood = s.emotionalState?.toLowerCase() || 'neutral';
      const targetMood = MOOD_COLORS[mood] ? mood : 'neutral';
      aggregation[targetMood] = (aggregation[targetMood] || 0) + s.amount;
    }

    return aggregation;
  }, [spending]);

  // Enhanced labels with amounts
  const moodLabelsWithAmounts = useMemo(() => {
    const labels: Record<string, string> = {};
    for (const [key, amount] of Object.entries(moodData)) {
      const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
      labels[key] = `${moodLabels[key] || key}: ${formattedAmount}`;
    }
    return labels;
  }, [moodData, moodLabels, currency]);

  // Data aggregation for drill-down view (Context phrases)
  const contextData = useMemo(() => {
    if (!selectedMood) return null;

    const aggregation: Record<string, number> = {};
    const filteredSpending = spending.filter(
      (s) => (s.emotionalState?.toLowerCase() || 'neutral') === selectedMood,
    );

    for (const s of filteredSpending) {
      if (s.emotionalContext && s.emotionalContext.length > 0) {
        for (const ctx of s.emotionalContext) {
          aggregation[ctx] = (aggregation[ctx] || 0) + s.amount;
        }
      } else {
        const otherLabel = t('common.other', 'Other');
        aggregation[otherLabel] = (aggregation[otherLabel] || 0) + s.amount;
      }
    }

    return aggregation;
  }, [spending, selectedMood, t]);

  // Enhanced labels for context
  const contextLabelsWithAmounts = useMemo(() => {
    if (!contextData) return {};
    const labels: Record<string, string> = {};
    for (const [key, amount] of Object.entries(contextData)) {
      const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
      labels[key] = `${key}: ${formattedAmount}`;
    }
    return labels;
  }, [contextData, currency]);

  const chartData: ChartData<'pie'> = useMemo(() => {
    if (Object.keys(moodData).length === 0) {
      return { datasets: [{ data: [] }], labels: [] };
    }

    if (selectedMood && contextData) {
      const keys = Object.keys(contextData);
      const labels = keys.map((k) => contextLabelsWithAmounts[k]);
      const data = Object.values(contextData);

      // Generate some colors for context phrases
      const backgroundColors = keys.map((_, i) => {
        const baseColor = MOOD_COLORS[selectedMood];
        // Simple luminosity adjustment or different shades
        return `${baseColor}${Math.floor(((keys.length - i) / keys.length) * 200 + 55)
          .toString(16)
          .padStart(2, '0')}`;
      });

      return {
        labels,
        datasets: [
          {
            data,
            backgroundColor: backgroundColors,
            borderColor: '#ffffff',
            borderWidth: 2,
          },
        ],
      };
    }

    // Main view
    return {
      labels: Object.keys(moodData).map((m) => moodLabelsWithAmounts[m]),
      datasets: [
        {
          data: Object.values(moodData),
          backgroundColor: Object.keys(moodData).map((m) => MOOD_COLORS[m]),
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    };
  }, [moodData, contextData, selectedMood, moodLabelsWithAmounts, contextLabelsWithAmounts]);

  const isMoodSelected = useCallback(
    (mood: string) => selectedMood === mood.toLowerCase(),
    [selectedMood],
  );

  const isSignificant = useCallback((value: number, total: number) => {
    return total > 0 && value / total > 0.1;
  }, []);

  // Handle responsiveness for legend position
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const options: ChartOptions<'pie'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          position: isMobile ? 'bottom' : ('left' as const),
          labels: {
            usePointStyle: false,
            padding: 20,
            boxWidth: 10,
          },
          fullSize: true,
        },
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<'pie'>) => {
              const value = context.parsed;
              const formatted = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency,
              }).format(value);
              return `${context.label}: ${formatted}`;
            },
          },
        },
        datalabels: {
          color: '#fff',
          font: {
            weight: 'bold' as const,
            size: 12,
          },
          formatter: (value: number) => {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency,
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(value);
          },
          // Only show if value is significant (e.g., > 10% of total)
          display: (context: Context) => {
            const dataset = context.dataset;
            const total = (dataset.data as number[]).reduce((a, b: number) => a + b, 0);
            const value = dataset.data[context.dataIndex] as number;
            return isSignificant(value, total);
          },
        },
      },
      onClick: (_: ChartEvent, elements: ActiveElement[]) => {
        if (!selectedMood && elements.length > 0) {
          const index = elements[0].index;
          const moodKeys = Object.keys(moodData);
          setSelectedMood(moodKeys[index]);
        }
      },
    }),
    [isMobile, currency, moodData, selectedMood, isSignificant],
  );

  if (!spending || spending.length === 0) {
    return (
      <ChartContainer>
        <EmptyStateContainer>{t('charts.noDataAvailable')}</EmptyStateContainer>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer>
      <HeaderWrapper style={{ justifyContent: 'flex-start', gap: '8px' }}>
        {selectedMood && (
          <IonButton fill='clear' onClick={() => setSelectedMood(null)} style={{ padding: 0 }}>
            <IonIcon slot='icon-only' icon={arrowBackOutline} />
          </IonButton>
        )}
        <h3 style={{ margin: 0 }}>
          {selectedMood ? moodLabels[selectedMood] : t('moodSpending.title', 'All Moods')}
        </h3>
      </HeaderWrapper>
      <ChartWrapper>
        <Pie data={chartData} options={options} plugins={[ChartDataLabels]} />
      </ChartWrapper>
    </ChartContainer>
  );
};

export default MoodSpendingChart;
