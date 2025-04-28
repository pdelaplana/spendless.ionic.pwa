import { styled } from 'styled-components';

const SpendlessLogoStyled = styled.div`
  .logo {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--ion-color-primary);
    display: flex;
    align-items: center;
    gap: 0.5rem;

  }

  .logo-icon {
    background-color: var(--ion-color-primary);
    color: white;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export const SpendlessLogo = () => {
  return (
    <SpendlessLogoStyled>
      <div className='logo'>
        <div className='logo-icon'>S</div>
        Spendless
      </div>
    </SpendlessLogoStyled>
  );
};
