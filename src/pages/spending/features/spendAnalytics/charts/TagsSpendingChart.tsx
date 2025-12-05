import type { ISpend } from '@/domain/Spend';
import useFormatters from '@/hooks/ui/useFormatters';
import { designSystem } from '@/theme/designSystem';
import styled from '@emotion/styled';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
  type TooltipItem,
} from 'chart.js';
import type { FC } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ChartContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  height: 300px;
  margin: 0 auto;
  padding: 10px;
`;

interface TagsSpendingChartProps {
  spending: ISpend[];
  currency?: string;
}

export const TagsSpendingChart: FC<TagsSpendingChartProps> = ({ spending, currency }) => {
  const { t } = useTranslation();
  const { formatCurrency } = useFormatters();

  const { labels, amounts } = useMemo(() => {
    // Aggregate spending by tag
    const tagTotals = new Map<string, number>();

    for (const spend of spending) {
      if (spend.tags && spend.tags.length > 0) {
        for (const tag of spend.tags) {
          const currentTotal = tagTotals.get(tag) || 0;
          tagTotals.set(tag, currentTotal + spend.amount);
        }
      }
    }

    // Convert to array and sort by amount (descending)
    const sortedTags = Array.from(tagTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // Limit to top 10 tags

    return {
      labels: sortedTags.map(([tag]) => tag),
      amounts: sortedTags.map(([, amount]) => amount),
    };
  }, [spending]);

  const data = {
    labels,
    datasets: [
      {
        label: t('charts.totalSpend'),
        data: amounts,
        backgroundColor: designSystem.colors.primary[500],
        borderColor: designSystem.colors.primary[600],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: t('charts.spendingByTags'),
        font: {
          size: 16,
          weight: 700,
        },
        color: designSystem.colors.text.primary,
        padding: {
          top: 10,
          bottom: 15,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 13,
        },
        bodyFont: {
          size: 13,
        },
        padding: 10,
        callbacks: {
          label: (tooltipItem: TooltipItem<'bar'>) => {
            const amount = tooltipItem.raw as number;
            return `Total: ${formatCurrency(amount, currency)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: designSystem.colors.gray[300],
        },
        ticks: {
          callback: (value: string | number) => formatCurrency(Number(value), currency),
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Show message if no tags found
  if (labels.length === 0) {
    return (
      <ChartContainer>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: designSystem.colors.text.secondary,
            fontSize: '14px',
          }}
        >
          {t('charts.noTagsFound')}
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer>
      <Bar data={data} options={options} />
    </ChartContainer>
  );
};
