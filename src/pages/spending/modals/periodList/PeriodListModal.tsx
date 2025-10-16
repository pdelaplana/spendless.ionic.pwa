import { CenterContainer } from '@/components/layouts';
import EmptyContent from '@/components/layouts/EmptyContent';
import ModalPageLayout from '@/components/layouts/ModalPageLayout';
import type { IPeriod } from '@/domain/Period';
import { isPeriodActive, isPeriodClosed } from '@/domain/Period';
import useFormatters from '@/hooks/ui/useFormatters';
import { StyledIonCard } from '@/styles/IonCard.styled';
import { StyledIonList, StyledItem } from '@/styles/IonList.styled';
import {
  IonButton,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonLabel,
  useIonModal,
} from '@ionic/react';
import type { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces';
import { trashBin } from 'ionicons/icons';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PeriodListModalProps {
  periods: (IPeriod & { actualSpend: number })[];
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  onDismiss: (data?: any, role?: string) => void;
  onDeletePeriod?: (periodId: string) => void;
}

const PeriodListModal: React.FC<PeriodListModalProps> = ({
  periods,
  onDismiss,
  onDeletePeriod,
}) => {
  const { t } = useTranslation();
  const { formatCurrency, formatDate } = useFormatters();

  const { currentPeriods, pastPeriods } = useMemo(() => {
    const current = periods.filter((period) => isPeriodActive(period));
    const past = periods.filter(
      (period) => isPeriodClosed(period) || (!isPeriodActive(period) && !isPeriodClosed(period)),
    );

    // Sort past periods by end date (most recent first)
    past.sort((a, b) => new Date(b.endAt).getTime() - new Date(a.endAt).getTime());

    return { currentPeriods: current, pastPeriods: past };
  }, [periods]);

  const renderPeriodItem = (
    period: IPeriod & { actualSpend: number },
    index: number,
    array: (IPeriod & { actualSpend: number })[],
  ) => {
    const handleDeleteClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent event bubbling to the parent item
      if (onDeletePeriod && period.id) {
        onDeletePeriod(period.id);
      }
    };

    const isLastItem = index === array.length - 1;

    return (
      <StyledItem
        key={period.id}
        lines={isLastItem ? 'none' : 'full'}
        button
        onClick={() => onDismiss(period, 'select')}
      >
        <IonLabel>
          <h2>
            {t('periods.description', {
              startDate: formatDate(period.startAt),
              endDate: formatDate(period.endAt),
            })}
          </h2>
          <p>
            Spent {formatCurrency(period.actualSpend)} of {formatCurrency(period.targetSpend)}
          </p>
        </IonLabel>
        {onDeletePeriod && (
          <IonButton fill='clear' shape='round' onClick={handleDeleteClick}>
            <IonIcon icon={trashBin} slot='icon-only' />
          </IonButton>
        )}
      </StyledItem>
    );
  };

  return (
    <ModalPageLayout onDismiss={onDismiss}>
      <CenterContainer>
        {periods.length === 0 && (
          <EmptyContent heading={t('periods.noPeriods')} content={t('periods.empty.description')} />
        )}

        {periods.length > 0 && (
          <>
            {/* Current Period Section */}
            {currentPeriods.length > 0 && (
              <StyledIonCard className='ion-margin-start ion-margin-end ion-margin-top'>
                <IonCardHeader>
                  <IonCardTitle style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                    {t('periods.currentPeriod')}
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent style={{ padding: 0 }}>
                  <StyledIonList>
                    {currentPeriods.map((period, index) =>
                      renderPeriodItem(period, index, currentPeriods),
                    )}
                  </StyledIonList>
                </IonCardContent>
              </StyledIonCard>
            )}

            {/* Past Periods Section */}
            {pastPeriods.length > 0 && (
              <StyledIonCard className='ion-margin-start ion-margin-end ion-margin-top'>
                <IonCardHeader>
                  <IonCardTitle style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                    {t('periods.pastPeriods')}
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent style={{ padding: 0 }}>
                  <StyledIonList>
                    {pastPeriods.map((period, index) =>
                      renderPeriodItem(period, index, pastPeriods),
                    )}
                  </StyledIonList>
                </IonCardContent>
              </StyledIonCard>
            )}

            {/* Empty states for sections */}
            {currentPeriods.length === 0 && pastPeriods.length === 0 && (
              <EmptyContent
                heading={t('periods.noPeriods')}
                content={t('periods.empty.description')}
              />
            )}
          </>
        )}
      </CenterContainer>
    </ModalPageLayout>
  );
};

export const usePeriodListModal = (): {
  open: (
    periods: (IPeriod & { actualSpend: number })[],
    onSelect: (period: IPeriod) => void,
    onDeletePeriod?: (periodId: string) => void,
  ) => Promise<{ period: IPeriod; role: string }>;
  dismiss: () => void;
} => {
  const [inputs, setInputs] = useState<{
    periods: (IPeriod & { actualSpend: number })[];
    onSelect?: (period: IPeriod) => void;
    onDeletePeriod?: (periodId: string) => void;
  }>();

  const [present, dismiss] = useIonModal(PeriodListModal, {
    periods: inputs?.periods,
    onDeletePeriod: inputs?.onDeletePeriod,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    onDismiss: (data: any, role: string) => {
      if (role === 'select') {
        inputs?.onSelect?.(data);
      }
      dismiss(data, role);
    },
  });

  return {
    open: (
      periods: (IPeriod & { actualSpend: number })[],
      onSelect: (period: IPeriod) => void,
      onDeletePeriod?: (periodId: string) => void,
    ) => {
      setInputs({
        periods,
        onSelect,
        onDeletePeriod,
      });
      return new Promise((resolve) => {
        present({
          onWillDismiss: (ev: CustomEvent<OverlayEventDetail>) => {
            if (ev.detail.role) {
              resolve({ period: ev.detail.data, role: ev.detail.role });
            }
          },
        });
      });
    },
    dismiss,
  };
};

export default PeriodListModal;
