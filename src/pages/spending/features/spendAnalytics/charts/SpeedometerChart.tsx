import type { FC } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import useFormatters from '@/hooks/ui/useFormatters';
import styled from '@emotion/styled';

const ChartContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
`;

const ValueContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
`;

const Value = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--ion-color-dark);
`;

const Label = styled.div`
  font-size: 1rem;
  color: var(--ion-color-dark);
`;

ChartJS.register(ArcElement, Tooltip);

interface SpeedometerChartProps {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  currency?: string;
}

export const SpeedometerChart: FC<SpeedometerChartProps> = ({
  value,
  min = 0,
  max = 100,
  label = '',
  currency = 'USD',
}) => {
  const { formatCurrency } = useFormatters();
  const normalizedValue = Math.min(Math.max(value, min), max);
  const percentage = ((normalizedValue - min) / (max - min)) * 100;

  const data = {
    datasets: [
      {
        data: [percentage, 100 - percentage],
        //backgroundColor: ['var(--ion-color-success)', 'var(--ion-color-light)'],
        backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(220, 220, 220, 0.5)'],
        borderWidth: 1,
        circumference: 180,
        rotation: 270,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  return (
    <ChartContainer>
      <Doughnut data={data} options={options} />
      <ValueContainer>
        <Value>{formatCurrency(value, currency)}</Value>
        {label && <Label>{label}</Label>}
      </ValueContainer>
    </ChartContainer>
  );
};
