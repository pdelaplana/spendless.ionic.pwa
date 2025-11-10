import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';
import React, { use } from 'react';
import { Bar } from 'react-chartjs-2';
import styled from 'styled-components';
import { useSpendingAccount } from '../../../../providers/spendingAccount';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ChartContainer = styled.div`
  width: 100%;
  height: 400px;
  position: relative;
`;

const EmptyStateContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--ion-color-medium);
`;

interface PeriodData {
  periodName: string;
  totalBudget: number;
  totalSpent: number;
}

interface SpendVsBudgetChartProps {
  data: PeriodData[];
}

interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderDash?: number[];
  barPercentage?: number;
  categoryPercentage?: number;
  currency?: string;
}

const SpendVsBudgetChart: React.FC<SpendVsBudgetChartProps> = ({ data }) => {
  const { account } = useSpendingAccount();
  // Create datasets for the chart
  const { datasets, labels } = React.useMemo(() => {
    if (!data || data.length === 0) {
      return { datasets: [], labels: [] };
    }

    // Create labels (period names)
    const periodLabels = data.map((period) => period.periodName);

    // Create datasets - one for budget and one for spending
    const chartDatasets: ChartDataset[] = [];

    // Budget dataset (background bar)
    const budgetData = data.map((period) => period.totalBudget);
    chartDatasets.push({
      label: 'Budget',
      data: budgetData,
      backgroundColor: 'rgba(139, 95, 191, 0.5)', // More transparent for background
      borderColor: '#8B5FBF',
      borderWidth: 2,
      borderDash: [5, 3], // Dashed border to distinguish from spending
      barPercentage: 1.0, // Full width for overlapping
      categoryPercentage: 0.8, // Standard spacing between categories
    });

    // Spending dataset (foreground bar)
    const spentData = data.map((period) => period.totalSpent);
    chartDatasets.push({
      label: 'Actual Spending',
      data: spentData,
      backgroundColor: 'rgba(107, 76, 138, 0.8)', // Less transparent for foreground
      borderColor: '#6B4C8A',
      borderWidth: 2,
      barPercentage: 1.0, // Full width for overlapping
      categoryPercentage: 0.8, // Same spacing as budget bars
    });

    return {
      datasets: chartDatasets,
      labels: periodLabels,
    };
  }, [data]);

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    // Configure overlapping bars
    datasets: {
      bar: {
        barPercentage: 1.0, // Full width for overlapping
        categoryPercentage: 0.8, // Standard spacing between periods
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'rect',
          font: {
            size: 10,
          },
        },
      },
      title: {
        display: true,
        text: 'Total Budget vs Actual Spending by Period',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            const formatted = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: account?.currency,
            }).format(value);

            // Add extra context for overlapping bars
            const datasetIndex = context.datasetIndex;
            const periodData = data[context.dataIndex];

            if (datasetIndex === 0) {
              // Budget bar (background)
              const percentage =
                periodData.totalSpent > 0
                  ? ((periodData.totalSpent / periodData.totalBudget) * 100).toFixed(1)
                  : '0.0';
              return `Budget: ${formatted} | Used: ${percentage}%`;
            }

            // Spending bar (foreground)
            const over = periodData.totalSpent > periodData.totalBudget;
            const diff = Math.abs(periodData.totalSpent - periodData.totalBudget);
            const diffFormatted = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(diff);

            if (over) {
              return `Actual: ${formatted} | Over budget by ${diffFormatted}`;
            }

            return `Actual: ${formatted} | Under budget by ${diffFormatted}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Periods',
          font: {
            size: 14,
            weight: 'bold' as const,
          },
        },
        grid: {
          display: true, // Enable grid lines as dividers
          color: 'rgba(0, 0, 0, 0.1)', // Light gray divider lines
          lineWidth: 1,
          drawOnChartArea: true, // Draw grid lines over the chart area
          drawTicks: true, // Keep tick marks
          offset: true, // Center grid lines between categories
        },
        // Configure for side-by-side bars
        stacked: false,
      },
      y: {
        title: {
          display: true,
          text: 'Amount ($)',
          font: {
            size: 14,
            weight: 'bold' as const,
          },
        },
        beginAtZero: true,
        // Configure for side-by-side bars
        stacked: false,
        grid: {
          display: false, // Remove horizontal grid lines
        },
        ticks: {
          callback: (value) => {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value as number);
          },
        },
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  const chartData: ChartData<'bar'> = {
    labels,
    datasets,
  };

  if (!data || data.length === 0) {
    return (
      <ChartContainer>
        <EmptyStateContainer>No data available for the selected periods</EmptyStateContainer>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer>
      <Bar data={chartData} options={options} />
    </ChartContainer>
  );
};

export default SpendVsBudgetChart;
