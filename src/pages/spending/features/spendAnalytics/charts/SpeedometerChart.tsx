import useFormatters from '@/hooks/ui/useFormatters';
import { designSystem } from '@/theme/designSystem';
import styled from '@emotion/styled';
import { IonText } from '@ionic/react';
import { ArcElement, Chart as ChartJS, Tooltip } from 'chart.js';
import type { FC } from 'react';
import { Doughnut } from 'react-chartjs-2';

const ChartContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 320px;
`;

const ValueContainer = styled.div`
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  width: 100%;
`;

const Value = styled.div`
  font-size: ${designSystem.typography.fontSize.xl};
  font-weight: ${designSystem.typography.fontWeight.semibold};
  color: ${designSystem.colors.text.primary};
  margin-bottom: 4px;
`;

const Label = styled.div`
  font-size: ${designSystem.typography.fontSize.sm};
  color: ${designSystem.colors.text.secondary};
  font-weight: ${designSystem.typography.fontWeight.medium};
`;

const DaysToGo = styled.div`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 18px;
  font-weight: bold;
  color: ${designSystem.colors.text.primary};
  text-align: center;
  width: 100%;
  pointer-events: none;
`;

const ChartWrapper = styled.div`
  width: 100%;
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -20px;
`;

ChartJS.register(ArcElement, Tooltip);

interface SpeedometerChartProps {
  remainingBudget: number; // remaining budget
  min?: number;
  max?: number;
  label?: string;
  currency?: string;
  endDate?: Date;
  currentSpend?: number;
  futureSpend?: number;
}

export const SpeedometerChart: FC<SpeedometerChartProps> = ({
  remainingBudget,
  min = 0,
  max = 100,
  label = '',
  currency = 'USD',
  endDate,
  currentSpend = 0,
  futureSpend = 0,
}) => {
  const { formatCurrency, formatDaysUntil } = useFormatters();

  // Calculate percentages for three segments
  const total = max || 100;
  const currentSpendPercentage = (currentSpend / total) * 100;
  const futureSpendPercentage = (futureSpend / total) * 100;
  const remainingPercentage = (remainingBudget / total) * 100;

  const data = {
    labels: ['Remaining', 'Scheduled', 'Spent'],
    datasets: [
      {
        data: [remainingPercentage, futureSpendPercentage, currentSpendPercentage],
        backgroundColor: [
          designSystem.colors.primary[500], // Remaining (primary color)
          designSystem.colors.primary[300], // Future spend (secondary/lighter primary)
          designSystem.colors.gray[400], // Current spend (gray)
        ],
        borderWidth: 2,
        borderColor: '#fff',
        circumference: 180,
        rotation: 270,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    title: {
      display: true,
      text: 'Balance Over Time',
      font: {
        size: 18,
        weight: 700,
      },
      color: designSystem.colors.text.primary,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context: { label?: string; dataIndex: number }) => {
            const label = context.label || '';
            const dataIndex = context.dataIndex;
            let amount = 0;

            // Map the data index to the actual amounts
            switch (dataIndex) {
              case 0: // Remaining Budget
                amount = remainingBudget;
                break;
              case 1: // Future Spending
                amount = futureSpend;
                break;
              case 2: // Current Spending
                amount = currentSpend;
                break;
            }

            return `${formatCurrency(amount, currency)}`;
          },
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: designSystem.colors.primary[500],
        borderWidth: 1,
      },
    },
    layout: {
      padding: 0,
    },
  };

  return (
    <ChartContainer>
      <DaysToGo>
        <IonText>{formatDaysUntil(endDate)} Days To Go</IonText>
      </DaysToGo>
      <ChartWrapper>
        <Doughnut data={data} options={options} />
      </ChartWrapper>
      <ValueContainer>
        <Value>{formatCurrency(remainingBudget, currency)}</Value>
        {label && <Label>{label}</Label>}
      </ValueContainer>
    </ChartContainer>
  );
};
