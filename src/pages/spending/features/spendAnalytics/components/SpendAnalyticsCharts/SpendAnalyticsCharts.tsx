import type { FC } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import styled from '@emotion/styled';
import 'swiper/css';
import 'swiper/css/pagination';
import type { ISpend } from '@/domain/Spend';
import { SpendingChart, SpeedometerChart } from '../charts';

const ChartsContainer = styled.div`
  width: 100%;
  padding: 10px 0;

  .swiper {
    width: 100%;
    height: 360px;
  }
  .swiper-pagination {
    bottom: -1px;
  }
`;

interface SpendAnalyticsChartsProps {
  spending: ISpend[];
  remainingBudget: number;
  targetSpend?: number;
}

export const SpendAnalyticsCharts: FC<SpendAnalyticsChartsProps> = ({
  spending,
  remainingBudget,
  targetSpend,
}) => {
  return (
    <ChartsContainer>
      <Swiper modules={[Pagination]} pagination={{ clickable: true }} spaceBetween={20}>
        <SwiperSlide>
          <SpeedometerChart value={remainingBudget} min={0} max={targetSpend} label='Remaining' />
        </SwiperSlide>
        <SwiperSlide>
          <SpendingChart spending={spending} />
        </SwiperSlide>
      </Swiper>
    </ChartsContainer>
  );
};
