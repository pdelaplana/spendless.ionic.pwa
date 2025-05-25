import styled from '@emotion/styled';
import type { FC } from 'react';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import type { ISpend } from '@/domain/Spend';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { BurndownChart, SpeedometerChart, SpendingChart } from './charts';

const ChartsContainer = styled.div`
  width: 100%;
  padding: 10px 0;

  .swiper {
    width: 100%;
    height: 400px;
  }
  .swiper-pagination {
    bottom: -1px;
    color: #000;
  }
  .swiper-pagination-bullet {
    background: var(--ion-color-primary);
  }
`;

interface SpendAnalyticsChartsProps {
  spending: ISpend[];
  remainingBudget: number;
  targetSpend?: number;
  periodStartDate?: Date;
  periodEndDate?: Date;
}

export const SpendAnalyticsCharts: FC<SpendAnalyticsChartsProps> = ({
  spending,
  remainingBudget,
  targetSpend,
  periodStartDate,
  periodEndDate,
}) => {
  const { account } = useSpendingAccount();

  // Default dates if not provided
  const startDate = periodStartDate || new Date();
  const endDate = periodEndDate || new Date();

  return (
    <ChartsContainer id='spend-analytics-charts'>
      <Swiper modules={[Pagination]} pagination={{ clickable: true }} spaceBetween={20}>
        <SwiperSlide>
          <SpeedometerChart
            value={remainingBudget}
            min={0}
            max={targetSpend}
            label='Remaining'
            currency={account?.currency}
            endDate={endDate}
          />
        </SwiperSlide>
        <SwiperSlide>
          <SpendingChart
            spending={spending.filter((s) => s.date <= new Date())}
            currency={account?.currency}
          />
        </SwiperSlide>
        <SwiperSlide>
          <BurndownChart
            spending={spending}
            targetSpend={targetSpend}
            startDate={startDate}
            endDate={endDate}
            currency={account?.currency}
          />
        </SwiperSlide>
      </Swiper>
    </ChartsContainer>
  );
};
