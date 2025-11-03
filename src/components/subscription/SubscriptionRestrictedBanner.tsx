import { InfoCard } from '@/components/shared';
import { lockClosedOutline } from 'ionicons/icons';

interface SubscriptionRestrictedBannerProps {
  onUpgrade?: () => void;
}

export const SubscriptionRestrictedBanner: React.FC<SubscriptionRestrictedBannerProps> = ({
  onUpgrade,
}) => {
  return (
    <InfoCard
      title='30 Day History'
      icon={lockClosedOutline}
      description="You're viewing the last 30 days. Upgrade to Premium for unlimited spending history."
      color='primary'
      actionLabel={onUpgrade ? 'Upgrade to Premium' : undefined}
      onAction={onUpgrade}
    />
  );
};
