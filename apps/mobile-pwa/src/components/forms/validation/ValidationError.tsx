import styled from 'styled-components';

const StyledMessage = styled.div`
  color: var(--ion-color-danger);

  border-radius: 5px;
  font-size: 0.8em;
`;

interface IErrorMessageProps {
  error?: {
    message?: string;
    type?: string;
  } | null;
}

const ValidationError: React.FC<IErrorMessageProps> = ({ error }) => {
  if (!error || !error.message) return null;

  return <StyledMessage>{error.message}</StyledMessage>;
};

export default ValidationError;
