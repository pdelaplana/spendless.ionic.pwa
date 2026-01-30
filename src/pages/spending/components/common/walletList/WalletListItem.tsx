import { DifferenceIndicator, IconContainer } from '@/components/shared';
import type { IWallet } from '@/domain/Wallet';
import { calculateWalletAvailable } from '@/domain/Wallet';
import { StyledItem } from '@/styles/IonList.styled';
import { getWalletIcon } from '@/utils/walletIconUtils';
import { IonLabel } from '@ionic/react';
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

const IconSlot = styled.div`
  margin-right: 0px;
`;

const WeeklyHighlight = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
`;

interface WalletListItemProps {
  wallet: IWallet;
  onClick?: (walletId: string) => void;
  formatCurrency: (amount: number) => string;
  showWeeklySpending?: boolean;
  currentWeekAmount?: number;
  previousWeekAmount?: number;
}

interface WalletIconProps {
  walletName: string;
}

const WalletIcon: React.FC<WalletIconProps> = ({ walletName }) => {
  const { icon, bgColor, iconColor } = getWalletIcon(walletName);
  return <IconContainer icon={icon} bgColor={bgColor} iconColor={iconColor} />;
};

const WalletListItem: React.FC<WalletListItemProps> = ({
  wallet,
  onClick,
  formatCurrency,
  showWeeklySpending = false,
  currentWeekAmount = 0,
  previousWeekAmount = 0,
}) => {
  const handleClick = () => {
    if (onClick && wallet.id) {
      onClick(wallet.id);
    }
  };

  const spentAmount = wallet.currentBalance;
  const remainingAmount = calculateWalletAvailable(wallet);
  const clickable = !!onClick;

  const difference = currentWeekAmount - previousWeekAmount;
  const isIncrease = difference > 0;
  const isSame = difference === 0;

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
      <IconSlot slot='start'>
        <WalletIcon walletName={wallet.name} />
      </IconSlot>

      <IonLabel>
        <h2>{wallet.name}</h2>
        {showWeeklySpending ? (
          <>
            <SpentRow>
              <span>Current Week</span>
              <WeeklyHighlight className='highlight'>
                {!isSame && <DifferenceIndicator increase={isIncrease} />}
                {formatCurrency(currentWeekAmount)}
              </WeeklyHighlight>
            </SpentRow>
            <SpentRow>
              <span>Previous Week</span>
              <span>{formatCurrency(previousWeekAmount)}</span>
            </SpentRow>
          </>
        ) : (
          <>
            <SpentRow>
              <span>Spent</span>
              <span className='highlight'>{formatCurrency(spentAmount)}</span>
            </SpentRow>
            <SpentRow>
              <span>Remaining</span>
              <span>{formatCurrency(remainingAmount)}</span>
            </SpentRow>
          </>
        )}
      </IonLabel>
    </StyledItem>
  );
};

export default WalletListItem;
