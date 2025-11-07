import { useCreateCheckoutSession } from '@/hooks/functions';
import { STRIPE_PRICE_ID_ANNUAL, STRIPE_PRICE_ID_MONTHLY } from '@/infrastructure/stripe';
import { IonButton, IonSpinner, useIonToast } from '@ionic/react';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

type SubscriptionPlan = 'monthly' | 'annual';

interface UpgradeButtonProps {
  /**
   * Subscription plan to upgrade to
   */
  plan: SubscriptionPlan;

  /**
   * Button text (optional, defaults based on plan)
   */
  children?: React.ReactNode;

  /**
   * Button size
   */
  size?: ComponentProps<typeof IonButton>['size'];

  /**
   * Button fill style
   */
  fill?: ComponentProps<typeof IonButton>['fill'];

  /**
   * Button color
   */
  color?: ComponentProps<typeof IonButton>['color'];

  /**
   * Button expand
   */
  expand?: ComponentProps<typeof IonButton>['expand'];

  /**
   * Custom CSS class
   */
  className?: string;

  /**
   * Callback when upgrade is initiated
   */
  onUpgradeStart?: () => void;

  /**
   * Callback when upgrade fails
   */
  onUpgradeError?: (error: Error) => void;
}

/**
 * Button component to initiate premium subscription upgrade via Stripe Checkout
 *
 * @example
 * ```tsx
 * <UpgradeButton plan="monthly" />
 * <UpgradeButton plan="annual" size="large" expand="block">
 *   Upgrade to Annual
 * </UpgradeButton>
 * ```
 */
export const UpgradeButton: React.FC<UpgradeButtonProps> = ({
  plan,
  children,
  size,
  fill = 'solid',
  color = 'primary',
  expand,
  className,
  onUpgradeStart,
  onUpgradeError,
}) => {
  const { t } = useTranslation();
  const [presentToast] = useIonToast();
  const { mutate: createCheckoutSession, isPending } = useCreateCheckoutSession();

  const priceId = plan === 'monthly' ? STRIPE_PRICE_ID_MONTHLY : STRIPE_PRICE_ID_ANNUAL;

  const defaultLabel =
    plan === 'monthly' ? t('subscription.upgradeMonthly') : t('subscription.upgradeAnnual');

  const handleUpgrade = () => {
    if (!priceId) {
      presentToast({
        message: t('subscription.configurationError'),
        duration: 3000,
        color: 'danger',
      });
      return;
    }

    onUpgradeStart?.();

    createCheckoutSession(
      {
        priceId,
        successUrl: `${window.location.origin}/subscription/success`,
        cancelUrl: `${window.location.origin}/subscription/cancel`,
      },
      {
        onSuccess: (data) => {
          // Redirect to Stripe Checkout
          window.location.href = data.url;
        },
        onError: (error) => {
          presentToast({
            message: t('subscription.upgradeError'),
            duration: 3000,
            color: 'danger',
          });
          onUpgradeError?.(error as Error);
        },
      },
    );
  };

  return (
    <IonButton
      onClick={handleUpgrade}
      disabled={isPending || !priceId}
      size={size}
      fill={fill}
      color={color}
      expand={expand}
      className={className}
    >
      {isPending ? <IonSpinner name='crescent' /> : children || defaultLabel}
    </IonButton>
  );
};
