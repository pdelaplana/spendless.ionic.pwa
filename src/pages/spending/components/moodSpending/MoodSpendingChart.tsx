import type { ISpend } from '@/domain/Spend';
import { designSystem } from '@/theme/designSystem';
import { IonButton, IonIcon } from '@ionic/react';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { arrowBackOutline } from 'ionicons/icons';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

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

  // Colors for moods
  const moodColors: Record<string, string> = useMemo(
    () => ({
      happy: '#4caf50',
      stressed: '#ff9800',
      tired: '#9c27b0',
      sad: '#2196f3',
      angry: '#f44336',
      neutral: '#9e9e9e',
    }),
    [],
  );

  const moodLabels: Record<string, string> = useMemo(
    () => ({
      happy: `😊 ${t('moods.happy', 'Happy')}`,
      stressed: `😰 ${t('moods.stressed', 'Stressed')}`,
      tired: `😴 ${t('moods.tired', 'Tired')}`,
      sad: `😔 ${t('moods.sad', 'Sad')}`,
      angry: `😡 ${t('moods.angry', 'Angry')}`,
      neutral: `😐 ${t('moods.neutral', 'Neutral')}`,
    }),
    [t],
  );

  // Data aggregation for main view (Moods)
  const moodData = useMemo(() => {
    const aggregation: Record<string, number> = {};

    for (const s of spending) {
      const mood = s.emotionalState?.toLowerCase() || 'neutral';
      // Ensure we only aggregate known moods or put them in 'neutral'
      const targetMood = moodColors[mood] ? mood : 'neutral';
      aggregation[targetMood] = (aggregation[targetMood] || 0) + s.amount;
    }

    return aggregation;
  }, [spending, moodColors]);

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
    if (selectedMood && contextData) {
      const keys = Object.keys(contextData);
      const labels = keys.map((k) => contextLabelsWithAmounts[k]);
      const data = Object.values(contextData);

      // Generate some colors for context phrases
      const backgroundColors = keys.map((_, i) => {
        const baseColor = moodColors[selectedMood];
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
          backgroundColor: Object.keys(moodData).map((m) => moodColors[m]),
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    };
  }, [
    moodData,
    contextData,
    selectedMood,
    moodLabelsWithAmounts,
    contextLabelsWithAmounts,
    moodColors,
  ]);

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
          },
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
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
          display: (context: any) => {
            const dataset = context.dataset;
            const total = (dataset.data as number[]).reduce((a, b) => a + b, 0);
            const value = dataset.data[context.dataIndex] as number;
            return value / total > 0.1;
          },
        },
      },
      onClick: (_: any, elements: any[]) => {
        if (!selectedMood && elements.length > 0) {
          const index = elements[0].index;
          const moodKeys = Object.keys(moodData);
          setSelectedMood(moodKeys[index]);
        }
      },
    }),
    [isMobile, currency, moodData, selectedMood],
  );

  if (spending.length === 0) {
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
          {selectedMood ? moodLabels[selectedMood] : 'Spending per Mood'}
        </h3>
      </HeaderWrapper>
      <ChartWrapper>
        <Pie data={chartData} options={options} plugins={[ChartDataLabels]} />
      </ChartWrapper>
    </ChartContainer>
  );
};

export default MoodSpendingChart;
