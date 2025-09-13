import styled from '@emotion/styled';
import type { FC } from 'react';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import type { ISpend } from '@/domain/Spend';
import { useSpendingAccount } from '@/providers/spendingAccount';
import { designSystem } from '@/theme/designSystem';
import { BurndownChart, SpeedometerChart, SpendingChart } from './charts';

const ChartsContainer = styled.div`
  margin: ${designSystem.spacing.lg} ${designSystem.spacing.md};
  display: flex;
  justify-content: center;
  
  > div {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border-radius: ${designSystem.borderRadius.xl};
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    padding: ${designSystem.spacing.md} ${designSystem.spacing.lg};
    transition: all 0.2s ease-in-out;
    width: 100%;
    max-width: 100%;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
    }
  }

  > div .swiper {
    width: 100%;
    height: 350px;
    margin: 0;
  }
  
  > div .swiper-wrapper {
    align-items: center;
  }
  
  > div .swiper-slide {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  > div .swiper-pagination {
    bottom: 8px;
    color: ${designSystem.colors.text.primary};
  }
  
  > div .swiper-pagination-bullet {
    background: ${designSystem.colors.primary[400]};
    opacity: 0.4;
  }
  
  > div .swiper-pagination-bullet-active {
    background: ${designSystem.colors.primary[500]};
    opacity: 1;
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
      <div>
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
      </div>
    </ChartsContainer>
  );
};
