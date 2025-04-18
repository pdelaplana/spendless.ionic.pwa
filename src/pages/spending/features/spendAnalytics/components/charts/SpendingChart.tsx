import type { FC } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, type TooltipItem } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import type { ISpend } from '@/domain/Spend';
import useFormatters from '@/hooks/ui/useFormatters';
import styled from '@emotion/styled';
import { useMemo } from 'react';

const ChartContainer = styled.div`
  padding: 0rem;
  max-width: 400px;
  margin: 0 auto;
  width: 300px;
`;

ChartJS.register(ArcElement, Tooltip, Legend);

interface SpendingChartProps {
  spending: ISpend[];
}

const SpendingChart: FC<SpendingChartProps> = ({ spending }) => {
  const { formatCurrency } = useFormatters();

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

    return {
      labels: Object.keys(categories),
      datasets: [
        {
          data: Object.values(categories),
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [spending]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Spending by Category',
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem: TooltipItem<'doughnut'>) => {
            return formatCurrency(tooltipItem.raw as number);
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
