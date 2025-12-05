import type { ISpend } from '@/domain/Spend';
import useFormatters from '@/hooks/ui/useFormatters';
import { designSystem } from '@/theme/designSystem';
import styled from '@emotion/styled';
import { ArcElement, Chart as ChartJS, Legend, Tooltip, type TooltipItem } from 'chart.js';
import type { FC } from 'react';
import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

const ChartContainer = styled.div`
  padding: 0rem;
  max-width: 400px;
  margin: 0 auto;
  width: 300px;
`;

ChartJS.register(ArcElement, Tooltip, Legend);

interface SpendingChartProps {
  spending: ISpend[];
  currency?: string;
}

const SpendingChart: FC<SpendingChartProps> = ({ spending, currency }) => {
  const { formatCurrency } = useFormatters();
  const { t } = useTranslation();

  const data = useMemo(() => {
    const categories = spending.reduce(
      (acc, spend) => {
        if (!acc[spend.category]) {
          acc[spend.category] = 0;
        }
        acc[spend.category] += spend.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Create labels with both translated category name and amount
    const labelsWithAmounts = Object.entries(categories).map(([category, amount]) => {
      const translatedCategory = t(`spending.categories.${category}`);
      return `${translatedCategory}: ${formatCurrency(amount, currency)}`;
    });

    return {
      labels: labelsWithAmounts,
      datasets: [
        {
          data: Object.values(categories),
          backgroundColor: [
            designSystem.colors.primary[500],
            designSystem.colors.primary[400],
            designSystem.colors.primary[300],
            designSystem.colors.primary[600],
          ],
          borderWidth: 0,
        },
      ],
    };
  }, [spending, t, formatCurrency, currency]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: t('charts.spendingByCategory'),
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem: TooltipItem<'doughnut'>) => {
            const categoryIndex = tooltipItem.dataIndex;
            const categoryKey = Object.keys(
              spending.reduce(
                (acc, spend) => {
                  acc[spend.category] = true;
                  return acc;
                },
                {} as Record<string, boolean>,
              ),
            )[categoryIndex];

            const amount = tooltipItem.raw as number;
            return `${t(`spend.categories.${categoryKey}`)}: ${formatCurrency(amount, currency)}`;
          },
        },
      },
    },
  };

  return (
    <ChartContainer>
      <Doughnut data={data} options={options} />
    </ChartContainer>
  );
};

export default SpendingChart;
