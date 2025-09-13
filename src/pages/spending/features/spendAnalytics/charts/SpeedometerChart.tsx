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
  value: number;
  min?: number;
  max?: number;
  label?: string;
  currency?: string;
  endDate?: Date;
}

export const SpeedometerChart: FC<SpeedometerChartProps> = ({
  value,
  min = 0,
  max = 100,
  label = '',
  currency = 'USD',
  endDate,
}) => {
  const { formatCurrency, formatDaysUntil } = useFormatters();
  const normalizedValue = Math.min(Math.max(value, min), max);
  const percentage = ((normalizedValue - min) / (max - min)) * 100;

  const data = {
    datasets: [
      {
        data: [percentage, 100 - percentage],
        backgroundColor: [
          value >= 0 ? designSystem.colors.primary[500] : designSystem.colors.danger,
          designSystem.colors.gray[200],
        ],
        borderWidth: 0,
        circumference: 180,
        rotation: 270,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
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
        <Value>{formatCurrency(value, currency)}</Value>
        {label && <Label>{label}</Label>}
      </ValueContainer>
    </ChartContainer>
  );
};
