import styled from 'styled-components';

export const Gap = styled.div<{ size: string }>`
  height: ${(props) => props.size};
`;
