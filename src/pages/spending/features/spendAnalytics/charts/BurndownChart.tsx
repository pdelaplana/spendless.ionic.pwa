import type { FC } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import styled from '@emotion/styled';
import useFormatters from '@/hooks/ui/useFormatters';
import type { ISpend } from '@/domain/Spend';
import { useMemo } from 'react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const ChartContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  height: 450px; // Increased from default height
  margin: 0 auto;
  padding: 10px;
`;

interface BurndownChartProps {
  spending: ISpend[];
  targetSpend?: number;
  startDate: Date;
  endDate: Date;
  currency?: string;
}

export const BurndownChart: FC<BurndownChartProps> = ({
  spending,
  targetSpend = 0,
  startDate,
  endDate,
  currency,
}) => {
  const { formatCurrency, formatDate } = useFormatters();

  const { labels, actualData, projectedData, idealData } = useMemo(() => {
    // Sort all spending by date
    const sortedSpending = [...spending].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate the total number of days in the period
    const totalDays =
      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Create array of all dates in the period
    const allDates: Date[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      allDates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    // Calculate cumulative spending for each day
    let runningTotal = 0;
    const dailyTotals: Map<string, number> = new Map();

    // Initialize with zero spending on start date
    dailyTotals.set(formatDate(startDate), 0);

    // Add all actual spending
    for (const spend of sortedSpending) {
      const dateKey = formatDate(spend.date);
      runningTotal += spend.amount;
      dailyTotals.set(dateKey, runningTotal);
    }

    // Generate formatted date labels
    const labels = allDates.map((date) => formatDate(date));

    // Create ideal spending line (even distribution)
    const dailyIdealBurn = targetSpend / totalDays;
    const idealData = allDates.map((_, index) => {
      const idealSpentByThisDay = dailyIdealBurn * index;
      return targetSpend - idealSpentByThisDay;
    });

    // Initialize the actual data array - start with full targetSpend
    const actualData = allDates.map((date, index) => {
      if (index === 0) {
        // On day 1, we start with the full targetSpend
        return targetSpend;
      }

      // If we have spending data for this date, use it, otherwise use the last known total
      let lastKnownTotal = 0;
      // Find the last recorded total up to this date
      for (let i = 0; i <= allDates.indexOf(date); i++) {
        const checkDate = formatDate(allDates[i]);
        if (dailyTotals.has(checkDate)) {
          lastKnownTotal = dailyTotals.get(checkDate) || 0;
        }
      }
      return targetSpend - lastKnownTotal;
    });

    // Calculate daily burn rate based on current spending
    const daysElapsed = Math.max(
      Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
      1,
    );
    const currentBurnRate = runningTotal / daysElapsed;

    // Project future spending
    const projectedData = allDates.map((date, index) => {
      if (index === 0) {
        // On day 1, we start with the full targetSpend
        return targetSpend;
      }

      if (date < today) {
        return 0; // No projection for past dates
      }

      // For today and future dates
      const daysFromStart = Math.ceil(
        (date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (date.toDateString() === today.toDateString()) {
        // For today, use actual value as the starting point
        const actualToday = actualData[index];
        return actualToday;
      }

      // For future days, project from today's actual value
      const todayIndex = allDates.findIndex((d) => d.toDateString() === today.toDateString());
      const todayValue = actualData[todayIndex] || targetSpend - runningTotal;
      const daysFromToday = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // Project based on current burn rate
      return todayValue - currentBurnRate * daysFromToday;
    });

    return { labels, actualData, projectedData, idealData };
  }, [spending, targetSpend, startDate, endDate, formatDate]);

  const data = {
    labels,
    datasets: [
      {
        label: 'Actual Remaining',
        data: actualData,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
        pointRadius: 1,
        pointHoverRadius: 6,
        fill: false,
      },
      /*
      {
        label: 'Projected Remaining',
        data: projectedData,
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderDash: [5, 5],
        tension: 0.2,
        pointRadius: 2,
        pointHoverRadius: 5,
        fill: false,
      },
      {
        label: 'Ideal Spending Path',
        data: idealData,
        borderColor: 'rgba(153, 102, 255, 0.6)',
        backgroundColor: 'rgba(153, 102, 255, 0.1)',
        borderDash: [3, 3],
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: false,
      },
      */
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1, // Added lower aspect ratio to increase y-axis scale (default is 2)
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          padding: 15,
        },
      },
      title: {
        display: true,
        text: 'Spending Burndown',
        font: {
          size: 16,
        },
        padding: {
          bottom: 10,
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
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          label: (context: any) => {
            if (context.raw === null || typeof context.raw !== 'number') return '';
            return `${context.dataset.label}: ${formatCurrency(context.raw, currency)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        ticks: {
          callback: (value: string | number) => formatCurrency(Number(value), currency),
          stepSize: 100, // Adjusted step size for better readability
        },
        grid: {
          color: 'rgba(200, 200, 200, 0.2)',
        },
        min: 0,
        max: targetSpend + 1000, // Added a buffer to the max value for better visualization
      },
    },
    elements: {
      line: {
        borderWidth: 2,
      },
      point: {
        borderWidth: 1,
        hitRadius: 5,
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  return (
    <ChartContainer>
      <Line data={data} options={options} />
    </ChartContainer>
  );
};
