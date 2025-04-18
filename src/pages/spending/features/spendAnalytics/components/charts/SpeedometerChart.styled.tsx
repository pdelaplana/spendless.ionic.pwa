import styled from '@emotion/styled';

export const ChartContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
`;

export const ValueContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
`;

export const Value = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--ion-color-dark);
`;

export const Label = styled.div`
  font-size: 1rem;
  color: var(--ion-color-dark);
`;
