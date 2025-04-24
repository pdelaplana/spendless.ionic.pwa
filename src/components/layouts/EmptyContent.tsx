import styled from 'styled-components';

interface EmptySectionProps {
  heading?: string;
  content?: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 2rem;
  text-align: center;
`;

const Heading = styled.h2`
  color: var(--ion-color-medium);
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const Content = styled.p`
  color: var(--ion-color-medium-shade);
  font-size: 1rem;
`;

const EmptyContent: React.FC<EmptySectionProps> = ({ heading, content }) => (
  <Container>
    {heading && <Heading>{heading}</Heading>}
    {content && <Content>{content}</Content>}
  </Container>
);

export default EmptyContent;
