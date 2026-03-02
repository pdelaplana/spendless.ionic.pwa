import styled from 'styled-components';
import { IonIcon, IonToggle } from '@ionic/react';
import { statsChartOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { designSystem } from '@theme/designSystem';

interface SpendingContextBannerProps {
  includeContext: boolean;
  onToggle: (value: boolean) => void;
}

const BannerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${designSystem.spacing.sm};
  padding: ${designSystem.spacing.sm} ${designSystem.spacing.md};
  background: ${designSystem.colors.gray[50]};
  border-bottom: 1px solid ${designSystem.colors.gray[200]};
`;

const BannerIcon = styled(IonIcon)`
  font-size: 1.25rem;
  color: ${designSystem.colors.brand.secondary};
  flex-shrink: 0;
`;

const BannerText = styled.div`
  flex: 1;
  min-width: 0;
`;

const BannerLabel = styled.p`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${designSystem.colors.text.primary};
`;

const BannerSubtitle = styled.p`
  margin: 0;
  font-size: 0.75rem;
  color: ${designSystem.colors.text.secondary};
`;

export const SpendingContextBanner: React.FC<SpendingContextBannerProps> = ({
  includeContext,
  onToggle,
}) => {
  const { t } = useTranslation();

  return (
    <BannerContainer>
      <BannerIcon icon={statsChartOutline} />
      <BannerText>
        <BannerLabel>{t('coach.context.toggleLabel')}</BannerLabel>
        <BannerSubtitle>
          {includeContext
            ? t('coach.context.toggleDescription')
            : t('coach.context.contextOff')}
        </BannerSubtitle>
      </BannerText>
      <IonToggle
        checked={includeContext}
        onIonChange={(e) => onToggle(e.detail.checked)}
        color='secondary'
      />
    </BannerContainer>
  );
};
