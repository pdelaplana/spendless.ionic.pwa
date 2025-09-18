import { IconContainer } from '@/components/shared';
import type { IWallet } from '@/domain/Wallet';
import { calculateWalletAvailable } from '@/domain/Wallet';
import { StyledItem } from '@/styles/IonList.styled';
import { IonLabel } from '@ionic/react';
import { walletOutline } from 'ionicons/icons';
import type React from 'react';
import styled from 'styled-components';

const SpentRow = styled.p`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px 0;
  font-size: 14px;

  /* Style child span elements with class 'highlight' */
  span.highlight {
    font-size: 14px;
    font-weight: bold;
  }

  /* You can also style all span elements */
  span {
    line-height: 1.3;
  }

  /* Or use pseudo-selectors */
  span:first-child {
    /* Styles for the first span (label) */
  }

  span:last-child {
    /* Styles for the last span (value) */
  }
`;

interface WalletListItemProps {
  wallet: IWallet;
  onClick?: (walletId: string) => void;
  formatCurrency: (amount: number) => string;
}

const WalletIcon: React.FC = () => (
  <IconContainer icon={walletOutline} bgColor='rgba(59, 130, 246, 0.1)' iconColor={'primary'} />
);

const WalletListItem: React.FC<WalletListItemProps> = ({ wallet, onClick, formatCurrency }) => {
  const handleClick = () => {
    if (onClick && wallet.id) {
      onClick(wallet.id);
    }
  };

  const spentAmount = wallet.currentBalance;
  const remainingAmount = calculateWalletAvailable(wallet);

  const clickable = !!onClick;

  return (
    <StyledItem
      button={clickable}
      detail={clickable}
      onClick={clickable ? handleClick : undefined}
      aria-label={
        clickable
          ? `${wallet.name}, spent ${formatCurrency(spentAmount)}, remaining ${formatCurrency(remainingAmount)}`
          : undefined
      }
    >
      <div slot='start'>
        <WalletIcon />
      </div>

      <IonLabel>
        <h2>{wallet.name}</h2>
        <SpentRow>
          <span>Spent</span>
          <span className='highlight'>{formatCurrency(spentAmount)}</span>
        </SpentRow>
        <SpentRow>
          <span>Remaining</span>
          <span>{formatCurrency(remainingAmount)}</span>
        </SpentRow>
      </IonLabel>
    </StyledItem>
  );
};

export default WalletListItem;
