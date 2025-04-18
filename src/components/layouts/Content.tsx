import { PropsWithChildren } from 'react';
import { styled } from 'styled-components';

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  marginTop?: string;
}

const SectionWrapper = styled.div<{ $marginTop: string }>`
  margin-top: ${(props) => `${props.$marginTop}` || '20px'};
`;

// Functional component
export const Content: React.FC<SectionProps> = ({
  title,
  marginTop = '10px',
  children,
  ...rest
}) => {
  return (
    <SectionWrapper $marginTop={marginTop} {...rest}>
      {title && <div className='ion-padding-vertical'>{title}</div>}
      {children}
    </SectionWrapper>
  );
};
